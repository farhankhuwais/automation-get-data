import redis
import json
from typing import Optional, Dict, Any
from config import config
from src.logger import logger

class QueueClient:
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        
    def connect(self) -> None:
        try:
            self.redis_client = redis.Redis(
                host=config.REDIS_HOST,
                port=config.REDIS_PORT,
                decode_responses=True,
                socket_connect_timeout=5
            )
            self.redis_client.ping()
            logger.info(f'Connected to Redis at {config.REDIS_HOST}:{config.REDIS_PORT}')
        except redis.ConnectionError as e:
            logger.error(f'Failed to connect to Redis: {e}')
            raise
            
    def consume_job(self, timeout: int = 5) -> Optional[Dict[str, Any]]:
        if not self.redis_client:
            raise RuntimeError('Redis client not connected')
            
        try:
            result = self.redis_client.brpop(config.QUEUE_NAME, timeout=timeout)
            
            if result:
                _, data = result
                job = json.loads(data)
                logger.info(f'Consumed job: {job.get("job_id", "unknown")}')
                return job
                
            return None
            
        except redis.TimeoutError:
            return None
        except json.JSONDecodeError as e:
            logger.error(f'Failed to decode job data: {e}')
            return None
        except Exception as e:
            logger.error(f'Error consuming job: {e}')
            return None
            
    def close(self) -> None:
        if self.redis_client:
            self.redis_client.close()
            logger.info('Redis connection closed')
