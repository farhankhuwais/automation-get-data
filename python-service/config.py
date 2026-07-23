import os
from dataclasses import dataclass

@dataclass
class Config:
    REDIS_HOST: str = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT: int = int(os.getenv('REDIS_PORT', 6379))
    REDIS_PREFIX: str = os.getenv('REDIS_PREFIX', 'automation_')
    BACKEND_URL: str = os.getenv('BACKEND_URL', 'http://localhost:8000')
    QUEUE_NAME: str = ''  # Set dynamically
    YOUTUBE_SHORTS_URL: str = 'https://www.youtube.com/shorts'
    SCROLL_PAUSE_TIME: float = 1.0
    SCROLL_AMOUNT: int = 500

    def __post_init__(self):
        if not self.QUEUE_NAME:
            self.QUEUE_NAME = f"{self.REDIS_PREFIX}scroll_jobs"

config = Config()
