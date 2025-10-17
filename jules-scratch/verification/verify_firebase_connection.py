from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Collect console logs
        console_logs = []
        page.on("console", lambda msg: console_logs.append(msg.text))

        # Go to the home page
        page.goto("http://localhost:5173")

        # Wait for the page to load completely
        page.wait_for_load_state("networkidle")

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

        # Check for Firebase connection errors in the console logs
        firebase_error = False
        for log in console_logs:
            if "failed: Error in connection establishment: net::ERR_NAME_NOT_RESOLVED" in log:
                firebase_error = True
                break

        if firebase_error:
            raise Exception("Firebase connection error found in console logs.")
        else:
            print("No Firebase connection errors found.")

run()