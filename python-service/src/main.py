import time
import signal
import sys
from typing import Optional
from config import config
from src.logger import logger
from src.queue_client import QueueClient
from src.automation import run_automation
from src.api_client import api_client

class AutomationService:
    def __init__(self):
        self.queue_client = QueueClient()
        self.running = True
        
    def start(self) -> None:
        logger.info('Starting Python Automation Service...')
        
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        self.queue_client.connect()
        
        logger.info('Waiting for jobs...')
        
        while self.running:
            self._process_next_job()
            
        self.queue_client.close()
        logger.info('Service stopped')
        
    def _signal_handler(self, signum, frame) -> None:
        logger.info(f'Received signal {signum}, shutting down...')
        self.running = False
        
    def _process_next_job(self) -> None:
        job = self.queue_client.consume_job(timeout=5)
        
        if not job:
            return
            
        job_id = job.get('job_id')
        durasi = job.get('durasi', 60)
        
        if not job_id:
            logger.error('Job missing job_id, skipping')
            return
            
        logger.info(f'Processing job {job_id} with duration {durasi}s')
        start_time = time.time()
        
        try:
            videos = run_automation(duration_seconds=durasi)
            durasi_aktual = int(time.time() - start_time)
            
            api_client.send_callback(
                job_id=job_id,
                status='completed',
                durasi_aktual=durasi_aktual,
                videos=videos
            )
            
            logger.info(f'Job {job_id} completed successfully')
            
        except Exception as e:
            durasi_aktual = int(time.time() - start_time)
            logger.error(f'Job {job_id} failed: {e}')
            
            api_client.send_callback(
                job_id=job_id,
                status='failed',
                durasi_aktual=durasi_aktual,
                videos=[],
                error_message=str(e)
            )

def main():
    service = AutomationService()
    service.start()

if __name__ == '__main__':
    main()
