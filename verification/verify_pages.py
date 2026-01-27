from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Failed History
    print("Navigating to Failed History...")
    page.goto("http://localhost:5173/#/docs/connections/failed")
    page.wait_for_timeout(3000)
    page.screenshot(path="verification/failed_history.png")

    # History
    print("Navigating to History...")
    page.goto("http://localhost:5173/#/docs/connections/history")
    page.wait_for_timeout(3000)
    page.screenshot(path="verification/history.png")

    # Block History
    print("Navigating to Block History...")
    page.goto("http://localhost:5173/#/docs/bypass/block")
    page.wait_for_timeout(3000)
    page.screenshot(path="verification/block_history.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
