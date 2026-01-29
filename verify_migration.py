from playwright.sync_api import sync_playwright

def verify_migration():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"Browser Error: {exc}"))

        try:
            print("Navigating to home page...")
            page.goto("http://localhost:5173/")
            page.wait_for_load_state("networkidle")

            # Take screenshot of home page
            print("Taking screenshot...")
            page.screenshot(path="verification_home_debug.png", full_page=True)
            print("Screenshot saved to verification_home_debug.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_migration()
