import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException
from typing import List, Dict, Optional
from src.browser import create_driver, close_driver
from src.scraper import get_video_data
from src.logger import logger
from config import config

class YouTubeAutomation:
    def __init__(self):
        self.driver: Optional[webdriver.Chrome] = None
        
    def __enter__(self):
        self.driver = create_driver()
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        close_driver(self.driver)
        
    def scroll(self, duration_seconds: int) -> List[Dict[str, Optional[str]]]:
        if not self.driver:
            raise RuntimeError('Driver not initialized')
            
        videos = []
        seen_urls = set()
        start_time = time.time()
        
        try:
            logger.info(f'Navigating to {config.YOUTUBE_SHORTS_URL}')
            self.driver.get(config.YOUTUBE_SHORTS_URL)
            time.sleep(5)
            
            logger.info(f'Starting scroll for {duration_seconds} seconds')
            
            action = ActionChains(self.driver)
            
            while time.time() - start_time < duration_seconds:
                try:
                    action.send_keys(Keys.ARROW_DOWN).perform()
                except Exception:
                    self.driver.execute_script('window.scrollBy(0, 600)')
                
                time.sleep(config.SCROLL_PAUSE_TIME)
                
                batch_videos = get_video_data(self.driver)
                for video in batch_videos:
                    url = video.get('url', '')
                    if url and url not in seen_urls:
                        seen_urls.add(url)
                        videos.append(video)
                
                elapsed = int(time.time() - start_time)
                remaining = duration_seconds - elapsed
                logger.info(f'Scrolling... {elapsed}s / {duration_seconds}s (remaining: {remaining}s) - Found {len(videos)} videos')
                
            logger.info(f'Scroll completed. Total videos: {len(videos)}')
            return videos
            
        except TimeoutException:
            logger.error('Page load timeout')
            raise
        except Exception as e:
            logger.error(f'Automation error: {e}')
            raise

def run_automation(duration_seconds: int) -> List[Dict[str, Optional[str]]]:
    with YouTubeAutomation() as automation:
        return automation.scroll(duration_seconds)
