import os
import time
import subprocess
import socket

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.action_chains import ActionChains

from higgsfield_selectors import (
    URL_CREATE_EDIT,
    VIDEO_INPUT_CSS,
    PROMPT_EDITOR_XPATH,
    GENERATE_MAIN_XPATH,
    TYPEAHEAD_LISTBOX_CSS,
)

# ----------------- Config -----------------
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PROFILE_DIR = r"C:\Users\Administrator\AppData\Local\Google\Chrome\User Data\AutomationProfile"
CHROMEDRIVER_PATH = r"F:\少年风水师\drivers\chromedriver.exe"

VIDEO_FOLDER = r"F:\out\Wuzheng"

PROMPT_TEMPLATE = "@@将视频的人物替换为图片人物，保持人物动作环境背景不变画面，构图运镜方式一致"
# 每个 @ 对应的下拉菜单选择：按 ↓ 的次数（从第 1 个选项开始数，0 表示第一个）
MENTION_DOWN_COUNTS = [0, 1]
MENTION_MENU_WAIT_SECONDS = 6

START_INDEX = 0
VIDEO_WAIT_SECONDS = 50
INTERVAL_SECONDS = 8

LIMIT_TOAST_WAIT_SECONDS = 4
LIMIT_RETRY_SECONDS = 30
LIMIT_MAX_WAIT_SECONDS = 3600000
# ------------------------------------------


def collect_videos(folder: str) -> list[str]:
    videos = [
        os.path.join(folder, f)
        for f in os.listdir(folder)
        if f.lower().endswith(".mp4")
    ]
    videos.sort()
    return videos


def launch_chrome():
    subprocess.Popen(
        [
            CHROME_PATH,
            "--remote-debugging-port=9222",
            f"--user-data-dir={PROFILE_DIR}",
        ]
    )
    wait_for_debug_port("127.0.0.1", 9222, timeout=30)


def wait_for_debug_port(host: str, port: int, timeout: int = 30):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with socket.create_connection((host, port), timeout=1):
                return
        except OSError:
            time.sleep(0.5)
    raise RuntimeError("Chrome 调试端口未就绪（127.0.0.1:9222）")


def get_driver():
    opts = Options()
    opts.add_experimental_option("debuggerAddress", "127.0.0.1:9222")

    if CHROMEDRIVER_PATH:
        service = Service(executable_path=CHROMEDRIVER_PATH)
        driver = webdriver.Chrome(service=service, options=opts)
    else:
        driver = webdriver.Chrome(options=opts)

    try:
        driver.maximize_window()
    except Exception:
        try:
            driver.set_window_size(1400, 900)
        except Exception:
            pass

    return driver


def ensure_unlimited_mode_on(driver, wait):
    switch_xpath = "//button[@role='switch' and (@aria-label='Unlimited mode' or contains(@aria-label,'Unlimited'))]"
    try:
        sw = wait.until(EC.presence_of_element_located((By.XPATH, switch_xpath)))
    except Exception:
        return

    try:
        checked = sw.get_attribute("aria-checked")
        if checked and checked.lower() != "true":
            wait.until(EC.element_to_be_clickable((By.XPATH, switch_xpath))).click()
            time.sleep(0.3)
    except Exception:
        return


def clear_existing_video(driver, wait, max_rounds: int = 8):
    """
    ✅ 解决 hover 才显示 × 的问题：
    - 先定位到预览卡片容器（div.relative.group.h-[4rem]）
    - ActionChains.move_to_element() 触发 group-hover
    - 再找右上角删除按钮（button.absolute -top-1 -right-1）
    - 点击后等待预览消失
    """
    preview_card_xpath = (
        "//div[contains(@class,'relative') and contains(@class,'group') and contains(@class,'h-[4rem]')]"
    )
    delete_btn_in_card_xpath = (
        ".//button[contains(@class,'absolute') and contains(@class,'-top-1') and contains(@class,'-right-1')]"
    )

    def cards():
        return driver.find_elements(By.XPATH, preview_card_xpath)

    def has_any_card():
        try:
            return any(c.is_displayed() for c in cards())
        except Exception:
            return False

    # 循环删，直到没有预览卡片
    for _ in range(max_rounds):
        if not has_any_card():
            return

        # 拿第一个可见卡片
        card = None
        for c in cards():
            if c.is_displayed():
                card = c
                break
        if card is None:
            return

        # 触发 hover（关键）
        try:
            ActionChains(driver).move_to_element(card).pause(0.2).perform()
        except Exception:
            # hover失败也不直接死，继续尝试点击
            pass

        # 在该卡片内找删除按钮
        btn = None
        try:
            btn = WebDriverWait(card, 2).until(
                lambda _:
                    next((b for b in card.find_elements(By.XPATH, delete_btn_in_card_xpath)
                          if b.is_displayed() and b.is_enabled()), None)
            )
        except Exception:
            btn = None

        # 有时 display 仍是 false（opacity=0），但按钮在 DOM 里，可以直接拿到并 JS click
        if btn is None:
            btns = card.find_elements(By.XPATH, delete_btn_in_card_xpath)
            if btns:
                btn = btns[0]

        if btn is None:
            raise RuntimeError("检测到视频预览卡片，但仍找不到右上角删除按钮（×）。")

        # 点击删除：先正常 click，失败就 JS click
        try:
            btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", btn)

        # 等待该卡片消失（或数量减少）
        try:
            WebDriverWait(driver, 10).until(
                lambda d: not has_any_card() or len(cards()) == 0
            )
            # 如果页面可能还有多个卡片，继续下一轮清理
        except Exception:
            # 再判断一次：如果还有卡片，说明删除没生效
            time.sleep(0.6)
            if has_any_card():
                raise RuntimeError("点击删除后预览仍存在，清空失败，已中止以避免叠加上传。")

    if has_any_card():
        raise RuntimeError("多次尝试仍未清空上传区域的视频预览，已中止。")


def set_prompt(driver, wait, text: str, mention_down_counts: list[int]):
    editor = wait.until(EC.element_to_be_clickable((By.XPATH, PROMPT_EDITOR_XPATH)))
    editor.click()
    time.sleep(0.1)
    editor.send_keys(Keys.CONTROL, "a")
    editor.send_keys(Keys.BACKSPACE)
    time.sleep(0.05)

    at_total = text.count("@")
    if at_total != len(mention_down_counts):
        raise ValueError(
            f"提示词里共有 {at_total} 个 '@'，但提供了 {len(mention_down_counts)} 个选择次数。"
        )

    at_index = 0
    for ch in text:
        if ch != "@":
            editor.send_keys(ch)
            continue

        # 单独输入 @ 以触发下拉菜单
        editor.send_keys("@")
        try:
            WebDriverWait(driver, MENTION_MENU_WAIT_SECONDS).until(
                lambda d: any(
                    el.is_displayed()
                    for el in d.find_elements(By.CSS_SELECTOR, TYPEAHEAD_LISTBOX_CSS)
                )
            )
        except Exception:
            raise RuntimeError("输入 @ 后未出现下拉菜单（Typeahead menu）。")

        down_times = mention_down_counts[at_index]
        for _ in range(max(0, down_times)):
            editor.send_keys(Keys.ARROW_DOWN)
            time.sleep(0.05)

        editor.send_keys(Keys.ENTER)
        time.sleep(0.1)
        at_index += 1


def upload_video(driver, wait, video_path: str):
    clear_existing_video(driver, wait)  # ✅ 必须先清空
    inp = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, VIDEO_INPUT_CSS)))
    inp.send_keys(video_path)
    time.sleep(VIDEO_WAIT_SECONDS)


def _limit_toast_xpath():
    return (
        "//*[contains(.,\"You've hit your limit of 4 generation\")"
        " or contains(.,\"You've hit your limit of 4\")"
        " or contains(.,\"limit of 4 generation\")"
        "]"
    )


def _limit_toast_shown(driver) -> bool:
    try:
        elements = driver.find_elements(By.XPATH, _limit_toast_xpath())
        return any(el.is_displayed() for el in elements)
    except Exception:
        return False


def click_generate_with_limit(driver, wait):
    waited = 0
    while True:
        ensure_unlimited_mode_on(driver, wait)

        wait.until(EC.element_to_be_clickable((By.XPATH, GENERATE_MAIN_XPATH))).click()
        time.sleep(1)

        try:
            WebDriverWait(driver, LIMIT_TOAST_WAIT_SECONDS).until(
                EC.presence_of_element_located((By.XPATH, _limit_toast_xpath()))
            )
        except Exception:
            if not _limit_toast_shown(driver):
                return

        waited += LIMIT_RETRY_SECONDS
        if waited > LIMIT_MAX_WAIT_SECONDS:
            raise RuntimeError("Waited too long for generation limit to clear.")

        print(f"达到 4 个任务上限，等待 {LIMIT_RETRY_SECONDS}s 后重试…")
        time.sleep(LIMIT_RETRY_SECONDS)


def main():
    start_time = time.time()  # 记录开始时间
    if not os.path.isdir(VIDEO_FOLDER):
        raise FileNotFoundError(f"Video folder not found: {VIDEO_FOLDER}")

    launch_chrome()
    driver = get_driver()
    wait = WebDriverWait(driver, 60)

    driver.get(URL_CREATE_EDIT)
    time.sleep(2)

    videos = collect_videos(VIDEO_FOLDER)
    if not videos:
        print("No videos found.")
        return

    for i, video_path in enumerate(videos[START_INDEX:], start=START_INDEX):
        print(f"=== {i + 1}/{len(videos)} === {os.path.basename(video_path)}")

        upload_video(driver, wait, video_path)
        set_prompt(driver, wait, PROMPT_TEMPLATE, MENTION_DOWN_COUNTS)
        click_generate_with_limit(driver, wait)

        if i < len(videos) - 1:
            time.sleep(INTERVAL_SECONDS)

    print("Done.")

    end_time = time.time()  # 记录结束时间
    total_time = end_time - start_time  # 计算总运行时间
    print(f"总运行时间: {total_time:.2f} 秒")  # 打印总运行时间，保留两位小数

    input("Press Enter to exit...")
    driver.quit()


if __name__ == "__main__":
    main()
