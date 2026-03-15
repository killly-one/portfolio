import os
import csv
import shutil
import subprocess
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
import imagehash
from tqdm import tqdm
from scipy.optimize import linear_sum_assignment

# =========================
# 配置：只改这三个
# =========================
A_DIR = r"F:\少年风水师\赵飞"          # 待改名（乱序）
B_DIR = r"F:\out\Zhao fei"          # 目标命名（标准）
FFMPEG_PATH = r"D:\ffmpeg-2026-01-19-git-43dbc011fa-essentials_build\bin\ffmpeg.exe"

VIDEO_EXTS = {".mp4", ".mov", ".mxf", ".mkv", ".avi", ".webm"}

# ✅ 你要求：不要第0帧，只用后面三个帧
SAMPLE_TS = [0.2, 0.8, 2.0]

# 预处理尺寸（越小越快）
RESIZE_W, RESIZE_H = 256, 256

# HSV 直方图 bins
H_BINS, S_BINS = 32, 32

# 特征权重
W_PHASH = 1.0
W_HIST = 0.8

# 是否保留抽帧缓存（建议先 True，确认抽帧OK后再改 False）
KEEP_THUMBS = True

# 是否实际重命名
DO_RENAME = True

WORK_DIR = Path(A_DIR).parent / "_match_work"
WORK_DIR.mkdir(parents=True, exist_ok=True)


def list_videos(folder: str):
    p = Path(folder)
    vids = [x for x in p.iterdir() if x.is_file() and x.suffix.lower() in VIDEO_EXTS]
    vids.sort(key=lambda x: x.name.lower())
    return vids


def ffmpeg_extract_frame(video_path: Path, out_jpg: Path, ts: float):
    """
    抽单帧：强制单图写入（-update 1）
    stderr 保持 bytes，避免编码问题
    """
    cmd = [
        str(FFMPEG_PATH), "-y",
        "-ss", f"{ts}",
        "-i", str(video_path),
        "-frames:v", "1",
        "-update", "1",
        "-f", "image2",
        "-q:v", "2",
        str(out_jpg)
    ]
    r = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    return r.returncode, r.stderr


def imread_unicode(path: Path):
    """
    ✅ Windows 中文路径安全读取：np.fromfile + cv2.imdecode
    """
    try:
        data = np.fromfile(str(path), dtype=np.uint8)
        if data.size == 0:
            return None
        img = cv2.imdecode(data, cv2.IMREAD_COLOR)
        return img
    except Exception:
        return None


def read_image(img_path: Path):
    img = imread_unicode(img_path)
    if img is None:
        return None
    img = cv2.resize(img, (RESIZE_W, RESIZE_H), interpolation=cv2.INTER_AREA)
    return img


def phash_of(img_bgr):
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    return imagehash.phash(pil)


def hsv_hist(img_bgr):
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    hist = cv2.calcHist([hsv], [0, 1], None, [H_BINS, S_BINS], [0, 180, 0, 256])
    hist = cv2.normalize(hist, hist).flatten()
    return hist.astype(np.float32)


def hist_dist(h1, h2):
    # 1 - cosine similarity
    num = float(np.dot(h1, h2))
    den = float(np.linalg.norm(h1) * np.linalg.norm(h2) + 1e-8)
    cos = num / den
    return 1.0 - cos


def build_signature(video_path: Path, thumb_dir: Path):
    """
    抽 SAMPLE_TS 三帧，形成签名：
    - phashes: list[ImageHash]
    - hists:   list[np.array]
    成功标准：只要抽到 ≥1 帧，就算 OK
    """
    phashes = []
    hists = []
    last_err = b""

    for ts in SAMPLE_TS:
        out = thumb_dir / f"{video_path.stem}__{ts:.1f}.jpg"
        _, err = ffmpeg_extract_frame(video_path, out, ts)
        if err:
            last_err = err

        if out.exists() and out.stat().st_size > 0:
            img = read_image(out)
            if img is None:
                # 这里就是之前你全军覆没的原因：cv2.imread 读不进中文路径
                continue
            phashes.append(phash_of(img))
            hists.append(hsv_hist(img))

    ok = len(phashes) > 0
    err_msg = last_err.decode("utf-8", errors="ignore") if last_err else ""
    return ok, phashes, hists, err_msg


def signature_distance(sigB, sigA):
    """
    多帧距离（容错对齐）：
    对 B 的每一帧，在 A 的帧集合里找最小距离，平均
    """
    okB, phB, hiB = sigB
    okA, phA, hiA = sigA
    if (not okB) or (not okA):
        return 1e9
    if len(phB) == 0 or len(phA) == 0:
        return 1e9

    # pHash 平均最小距离
    ph_d = []
    for hb in phB:
        ph_d.append(min((hb - ha) for ha in phA))
    ph_d = float(np.mean(ph_d))

    # HSV hist 平均最小距离（放大尺度）
    hs_d = []
    for hb in hiB:
        hs_d.append(min(hist_dist(hb, ha) for ha in hiA))
    hs_d = float(np.mean(hs_d)) * 100.0

    return W_PHASH * ph_d + W_HIST * hs_d


def safe_rename(src: Path, new_name: str):
    dst = src.with_name(new_name)
    if dst.exists():
        stem = Path(new_name).stem
        suf = Path(new_name).suffix
        i = 1
        while True:
            cand = src.with_name(f"{stem}_A{i}{suf}")
            if not cand.exists():
                dst = cand
                break
            i += 1
    os.rename(str(src), str(dst))
    return dst


def main():
    print("=== match_rename started ===")
    print("A_DIR:", A_DIR)
    print("B_DIR:", B_DIR)
    print("FFMPEG:", FFMPEG_PATH)
    print("WORK_DIR:", str(WORK_DIR))
    print("SAMPLE_TS:", SAMPLE_TS)

    if not Path(FFMPEG_PATH).exists():
        print("[ERROR] ffmpeg.exe 路径不存在：", FFMPEG_PATH)
        return

    A_videos = list_videos(A_DIR)
    B_videos = list_videos(B_DIR)

    print(f"Found A videos: {len(A_videos)}")
    print(f"Found B videos: {len(B_videos)}")
    if len(A_videos) == 0 or len(B_videos) == 0:
        print("[ERROR] 文件夹里没视频。")
        return

    thumbA = WORK_DIR / "thumbA_multi"
    thumbB = WORK_DIR / "thumbB_multi"
    thumbA.mkdir(parents=True, exist_ok=True)
    thumbB.mkdir(parents=True, exist_ok=True)

    print("Step1: build 3-frame signatures ...")
    sigA = {}
    for v in tqdm(A_videos, desc="A sig"):
        ok, ph, hi, err = build_signature(v, thumbA)
        if not ok:
            print(f"\n[WARN] A签名失败：{v.name}\n{err}\n")
        sigA[v] = (ok, ph, hi)

    sigB = {}
    for v in tqdm(B_videos, desc="B sig"):
        ok, ph, hi, err = build_signature(v, thumbB)
        if not ok:
            print(f"\n[WARN] B签名失败：{v.name}\n{err}\n")
        sigB[v] = (ok, ph, hi)

    okA = sum(1 for v in A_videos if sigA[v][0])
    okB = sum(1 for v in B_videos if sigB[v][0])
    print(f"Signature OK: A={okA}/{len(A_videos)}, B={okB}/{len(B_videos)}")

    A_use = [v for v in A_videos if sigA[v][0]]
    B_use = [v for v in B_videos if sigB[v][0]]

    if len(A_use) == 0 or len(B_use) == 0:
        print("[ERROR] 没有可用签名，停止。")
        return

    print("Step2: build cost matrix ...")
    cost = np.zeros((len(B_use), len(A_use)), dtype=np.float32)
    for i, b in enumerate(tqdm(B_use, desc="Cost rows")):
        for j, a in enumerate(A_use):
            cost[i, j] = signature_distance(sigB[b], sigA[a])

    print("Step3: global assignment (Hungarian) ...")
    row_ind, col_ind = linear_sum_assignment(cost)

    pairs = []
    for r, c in zip(row_ind, col_ind):
        b = B_use[r]
        a = A_use[c]
        pairs.append((b, a, float(cost[r, c])))

    mapping_csv = WORK_DIR / "mapping.csv"
    with open(mapping_csv, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["B_name", "A_original", "cost"])
        for b, a, d in sorted(pairs, key=lambda x: x[2]):
            w.writerow([b.name, a.name, f"{d:.4f}"])

    print("Saved mapping:", mapping_csv)
    print(f"Matched pairs: {len(pairs)}")

    if DO_RENAME:
        print("Step4: renaming A files ...")
        renamed = 0
        for b, a, d in pairs:
            safe_rename(a, b.name)
            renamed += 1
        print(f"Renamed in A: {renamed}")
    else:
        print("DO_RENAME=False：未重命名，仅输出 mapping.csv")

    if not KEEP_THUMBS:
        shutil.rmtree(thumbA, ignore_errors=True)
        shutil.rmtree(thumbB, ignore_errors=True)

    print("=== done ===")


if __name__ == "__main__":
    main()
