from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_inbound(page: Page):
    print("Navigating to Inbound...")
    page.goto("http://localhost:5173/#/docs/inbound")
    time.sleep(2)

    try:
        page.wait_for_selector("text=Inbound Configuration", timeout=5000)
        page.screenshot(path="verification_inbound.png")
        print("Success! Screenshot saved.")
    except Exception as e:
        print(f"Failed: {e}")
        page.screenshot(path="failed_final.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_inbound(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
