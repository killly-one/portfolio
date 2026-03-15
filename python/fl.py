import argparse
import shutil
from pathlib import Path
import traceback
import numpy as np
import cv2
from tqdm import tqdm

VIDEO_EXTS = {".mp4", ".mov", ".mkv", ".avi", ".webm", ".m4v"}
IMG_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}

# ---------------------------
# Utils
# ---------------------------
def safe_dest_path(dest_dir: Path, filename: str) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    candidate = dest_dir / filename
    if not candidate.exists():
        return candidate
    stem, suf = candidate.stem, candidate.suffix
    i = 1
    while True:
        p = dest_dir / f"{stem}_{i}{suf}"
        if not p.exists():
            return p
        i += 1

def iter_videos(root: Path, recursive: bool):
    if recursive:
        for p in root.rglob("*"):
            if p.is_file() and p.suffix.lower() in VIDEO_EXTS:
                yield p
    else:
        for p in root.iterdir():
            if p.is_file() and p.suffix.lower() in VIDEO_EXTS:
                yield p

def l2_normalize(x: np.ndarray, eps=1e-12):
    n = np.linalg.norm(x) + eps
    return x / n

def cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b))

def sample_frame_indices(total_frames: int, num_samples: int):
    if total_frames <= 0:
        return [0]
    if num_samples <= 1:
        return [min(2, total_frames - 1)]
    idxs = np.linspace(0, total_frames - 1, num_samples).astype(int).tolist()
    out, seen = [], set()
    for i in idxs:
        if i not in seen:
            out.append(i)
            seen.add(i)
    return out

def read_frame_at(cap: cv2.VideoCapture, frame_idx: int):
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
    ok, frame = cap.read()
    if not ok:
        return None
    return frame

# ---------------------------
# DeepFace engine
# ---------------------------
def deepface_extract_embeddings(img_bgr: np.ndarray, model_name: str, detector_backend: str):
    """
    返回本图中所有人脸的embedding列表（可能为空）。
    enforce_detection=False：检测不到脸不会抛异常，直接返回空。
    """
    from deepface import DeepFace

    # DeepFace.represent 会自动做人脸检测并返回每张脸的embedding
    reps = DeepFace.represent(
        img_path=img_bgr,
        model_name=model_name,
        detector_backend=detector_backend,
        enforce_detection=False,
        align=True,
    )
    # reps 可能是 dict 或 list[dict]
    if reps is None:
        return []
    if isinstance(reps, dict):
        reps = [reps]
    out = []
    for r in reps:
        emb = r.get("embedding", None)
        if emb is None:
            continue
        out.append(np.array(emb, dtype=np.float32))
    return out

def deepface_count_faces(img_bgr: np.ndarray, detector_backend: str):
    """
    只数脸（用于多人判定）。检测不到脸返回0。
    """
    from deepface import DeepFace

    faces = DeepFace.extract_faces(
        img_path=img_bgr,
        detector_backend=detector_backend,
        enforce_detection=False,
        align=True,
    )
    if faces is None:
        return 0
    return len(faces)

# ---------------------------
# Build person gallery from refs
# ---------------------------
def build_person_gallery(ref_root: Path, model_name: str, detector_backend: str, min_faces_per_person=1):
    """
    返回:
      person_vecs: dict[name] -> normalized mean embedding
      person_stats: dict[name] -> count_used
    规则：每张参考图如果检测到多张脸，只取“第一张embedding”（DeepFace默认按检测结果顺序）。
    """
    person_vecs = {}
    person_stats = {}

    for person_dir in sorted([p for p in ref_root.iterdir() if p.is_dir()]):
        name = person_dir.name
        embeds = []

        for img_path in person_dir.rglob("*"):
            if not img_path.is_file():
                continue
            if img_path.suffix.lower() not in IMG_EXTS:
                continue

            img = cv2.imread(str(img_path))
            if img is None:
                continue

            embs = deepface_extract_embeddings(img, model_name, detector_backend)
            if not embs:
                continue

            emb = l2_normalize(embs[0])
            embeds.append(emb)

        if len(embeds) >= min_faces_per_person:
            mean_vec = l2_normalize(np.mean(np.stack(embeds, axis=0), axis=0))
            person_vecs[name] = mean_vec
            person_stats[name] = len(embeds)

    return person_vecs, person_stats

# ---------------------------
# Classify one video
# ---------------------------
def classify_video(
    video_path: Path,
    person_vecs: dict,
    model_name: str,
    detector_backend: str,
    num_samples: int,
    sim_threshold: float,
    min_hits: int,
    multi_hits_threshold: int,
):
    """
    你的规则：
    - 多人 / 无脸 / 不确定 / 报错 -> 多人_错误（并写txt）
    - 单人稳定命中 -> 归类到该人文件夹

    实现：
    - 抽样若干帧
    - 每帧：
      - 统计脸数（用于“多人”判定）
      - 对每张脸计算embedding，与人物库比对，>=阈值记一次命中
    - 如果>=2个人 hits>=multi_hits_threshold -> 多人_错误
    - 否则赢家 hits>=min_hits 且 avg_sim>=sim_threshold -> 归赢家
    - 否则 -> 多人_错误
    """
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        return ("多人_错误", {"error": "无法打开视频", "video": str(video_path)})

    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    idxs = sample_frame_indices(total, num_samples)

    per_person_sims = {k: [] for k in person_vecs.keys()}
    faces_total = 0
    faces_matched = 0
    frames_with_faces = 0
    frames_with_multi = 0

    for idx in idxs:
        frame = read_frame_at(cap, idx)
        if frame is None:
            continue

        face_count = deepface_count_faces(frame, detector_backend)
        if face_count <= 0:
            continue

        frames_with_faces += 1
        if face_count >= 2:
            frames_with_multi += 1

        embs = deepface_extract_embeddings(frame, model_name, detector_backend)
        if not embs:
            continue

        for emb in embs:
            faces_total += 1
            emb_n = l2_normalize(emb)

            best_name = None
            best_sim = -1.0
            for name, vec in person_vecs.items():
                s = cosine_sim(emb_n, vec)
                if s > best_sim:
                    best_sim = s
                    best_name = name

            if best_name is not None and best_sim >= sim_threshold:
                faces_matched += 1
                per_person_sims[best_name].append(best_sim)

    cap.release()

    stats = {}
    hits = {}
    for name, sims in per_person_sims.items():
        if sims:
            hits[name] = len(sims)
            stats[name] = {
                "hits": len(sims),
                "avg_sim": float(np.mean(sims)),
                "max_sim": float(np.max(sims)),
            }
        else:
            hits[name] = 0

    strong_people = [n for n, h in hits.items() if h >= multi_hits_threshold]
    if len(strong_people) >= 2:
        return ("多人_错误", {
            "reason": "检测到多人命中（>=2人达到阈值）",
            "strong_people": strong_people,
            "faces_total": faces_total,
            "faces_matched": faces_matched,
            "frames_with_faces": frames_with_faces,
            "frames_with_multi": frames_with_multi,
            "sampled_frames": idxs,
            "per_person": stats,
        })

    # 赢家：hits最多，其次avg_sim最高
    best = None
    best_h = 0
    best_avg = -1.0
    for name, h in hits.items():
        if h > best_h:
            best, best_h = name, h
            best_avg = stats[name]["avg_sim"] if name in stats else -1.0
        elif h == best_h and h > 0:
            avg = stats[name]["avg_sim"]
            if avg > best_avg:
                best, best_avg = name, avg

    if best is None or best_h < min_hits or (best in stats and stats[best]["avg_sim"] < sim_threshold):
        return ("多人_错误", {
            "reason": "无稳定单人命中（没脸/不确定/低置信度）",
            "faces_total": faces_total,
            "faces_matched": faces_matched,
            "frames_with_faces": frames_with_faces,
            "frames_with_multi": frames_with_multi,
            "sampled_frames": idxs,
            "per_person": stats,
        })

    return (best, {
        "reason": "稳定单人命中",
        "winner": best,
        "faces_total": faces_total,
        "faces_matched": faces_matched,
        "frames_with_faces": frames_with_faces,
        "frames_with_multi": frames_with_multi,
        "sampled_frames": idxs,
        "per_person": stats,
    })

# ---------------------------
# Main
# ---------------------------
def main():
    ap = argparse.ArgumentParser("按人物把视频分文件夹（多人/无脸/出错统一进 多人_错误 并生成txt说明）")
    ap.add_argument("--videos", required=True, help="视频目录")
    ap.add_argument("--refs", required=True, help="人物参考图根目录（子文件夹=人物名）")
    ap.add_argument("--out", required=True, help="输出目录")
    ap.add_argument("--recursive", action="store_true", help="递归扫描视频目录")
    ap.add_argument("--move", action="store_true", help="移动而不是复制（谨慎）")

    # DeepFace相关参数：模型/检测器
    ap.add_argument("--model", default="Facenet512", help="DeepFace模型名（默认Facenet512）")
    ap.add_argument("--detector", default="opencv", help="人脸检测后端（默认opencv，最省事）")

    # 分类策略参数
    ap.add_argument("--samples", type=int, default=20, help="每个视频抽多少帧识别（建议10~30）")
    ap.add_argument("--sim", type=float, default=0.38, help="相似度阈值（越大越严格，建议0.35~0.45）")
    ap.add_argument("--min-hits", type=int, default=3, help="判定为单人的最低命中次数")
    ap.add_argument("--multi-hits", type=int, default=2, help="判定为多人：至少两个人 hits>=multi-hits")

    args = ap.parse_args()
    videos_dir = Path(args.videos)
    refs_dir = Path(args.refs)
    out_dir = Path(args.out)

    out_dir.mkdir(parents=True, exist_ok=True)
    multi_dir = out_dir / "多人_错误"
    multi_dir.mkdir(parents=True, exist_ok=True)

    print("构建人物库（从参考图提特征）…")
    person_vecs, person_stats = build_person_gallery(
        refs_dir,
        model_name=args.model,
        detector_backend=args.detector,
        min_faces_per_person=1
    )
    if not person_vecs:
        raise SystemExit("人物库为空：请检查 refs 目录下每个人文件夹里是否有可识别的人脸参考图。")

    print(f"已加载人物: {len(person_vecs)}")
    for n, c in person_stats.items():
        print(f" - {n}: 使用参考脸 {c} 张")

    videos = list(iter_videos(videos_dir, args.recursive))
    if not videos:
        raise SystemExit("没找到视频文件。")

    print(f"开始处理视频：{len(videos)} 个")
    print(f"模型: {args.model} | 检测器: {args.detector} | samples={args.samples} | sim={args.sim} | min_hits={args.min_hits} | multi_hits={args.multi_hits}")
    print(f"处理方式: {'移动' if args.move else '复制'}")

    for vp in tqdm(videos):
        try:
            label, info = classify_video(
                video_path=vp,
                person_vecs=person_vecs,
                model_name=args.model,
                detector_backend=args.detector,
                num_samples=args.samples,
                sim_threshold=args.sim,
                min_hits=args.min_hits,
                multi_hits_threshold=args.multi_hits,
            )

            dest_dir = (multi_dir if label == "多人_错误" else (out_dir / label))
            dest_path = safe_dest_path(dest_dir, vp.name)

            if args.move:
                shutil.move(str(vp), str(dest_path))
            else:
                shutil.copy2(str(vp), str(dest_path))

            if label == "多人_错误":
                txt_path = dest_path.with_suffix(dest_path.suffix + ".txt")
                with open(txt_path, "w", encoding="utf-8") as f:
                    f.write(f"video: {vp}\n")
                    f.write(f"reason: {info.get('reason', 'unknown')}\n")
                    if "error" in info:
                        f.write(f"error: {info['error']}\n")
                    f.write(f"faces_total: {info.get('faces_total')}\n")
                    f.write(f"faces_matched: {info.get('faces_matched')}\n")
                    f.write(f"frames_with_faces: {info.get('frames_with_faces')}\n")
                    f.write(f"frames_with_multi: {info.get('frames_with_multi')}\n")
                    f.write(f"sampled_frames: {info.get('sampled_frames')}\n")
                    f.write("per_person:\n")
                    per = info.get("per_person", {})
                    for name, s in sorted(per.items(), key=lambda x: (-x[1]["hits"], -x[1]["avg_sim"])):
                        f.write(f"  - {name}: hits={s['hits']}, avg={s['avg_sim']:.3f}, max={s['max_sim']:.3f}\n")

        except Exception:
            dest_path = safe_dest_path(multi_dir, vp.name)
            if args.move:
                shutil.move(str(vp), str(dest_path))
            else:
                shutil.copy2(str(vp), str(dest_path))
            txt_path = dest_path.with_suffix(dest_path.suffix + ".txt")
            with open(txt_path, "w", encoding="utf-8") as f:
                f.write(f"video: {vp}\n")
                f.write("reason: exception\n")
                f.write(traceback.format_exc())

    print("完成。输出目录：", out_dir)

if __name__ == "__main__":
    main()
