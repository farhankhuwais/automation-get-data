import subprocess
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import WebDriverException
from src.logger import logger

def get_chrome_options() -> Options:
    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-popup-blocking')
    options.add_argument('--ignore-certificate-errors')
    options.add_argument('--disable-web-security')
    options.add_argument('--disable-features=IsolateOrigins,site-per-process')
    options.add_argument('--disable-infobars')
    options.add_argument('--dns-prefetch-disable')
    return options

def create_driver() -> webdriver.Chrome:
    try:
        options = get_chrome_options()

        chrome_paths = [
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
        ]
        chrome_binary = None
        for path in chrome_paths:
            try:
                subprocess.run([path, '--version'], capture_output=True, check=True)
                chrome_binary = path
                break
            except (FileNotFoundError, subprocess.CalledProcessError):
                continue

        if chrome_binary:
            options.binary_location = chrome_binary
            logger.info(f'Using Chrome binary: {chrome_binary}')

        service = None
        try:
            result = subprocess.run(['which', 'chromedriver'], capture_output=True, text=True)
            if result.returncode == 0:
                chromedriver_path = result.stdout.strip()
                service = Service(executable_path=chromedriver_path)
                logger.info(f'Using chromedriver: {chromedriver_path}')
        except Exception:
            pass

        if service:
            driver = webdriver.Chrome(service=service, options=options)
        else:
            driver = webdriver.Chrome(options=options)

        driver.set_page_load_timeout(60)
        driver.set_script_timeout(30)
        driver.implicitly_wait(10)
        logger.info('Chrome driver created successfully')
        return driver
    except WebDriverException as e:
        logger.error(f'Failed to create Chrome driver: {e}')
        raise

def close_driver(driver: webdriver.Chrome) -> None:
    try:
        if driver:
            driver.quit()
            logger.info('Chrome driver closed')
    except Exception as e:
        logger.warning(f'Error closing driver: {e}')
