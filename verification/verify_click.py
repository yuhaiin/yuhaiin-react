from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    print("Navigating to root...")
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(2000)

    try:
        print("Clicking Block History...")
        page.get_by_text("Block History").click()
        page.wait_for_timeout(2000)
        page.screenshot(path="verification/block_history_click.png")
        print("URL:", page.url)
    except Exception as e:
        print("Could not click Block History:", e)
        page.screenshot(path="verification/root.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
