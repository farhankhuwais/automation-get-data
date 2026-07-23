import requests
from datetime import datetime
from typing import List, Dict, Optional, Any
from config import config
from src.logger import logger

class APIClient:
    def __init__(self):
        self.base_url = config.BACKEND_URL
        self.callback_url = f'{self.base_url}/api/jobs/callback'
        
    def send_callback(
        self,
        job_id: int,
        status: str,
        durasi_aktual: int,
        videos: List[Dict[str, Any]],
        error_message: Optional[str] = None
    ) -> bool:
        payload = {
            'job_id': job_id,
            'status': status,
            'durasi_aktual': durasi_aktual,
            'videos': videos,
            'timestamp': datetime.now().isoformat(),
        }
        
        if error_message:
            payload['error_message'] = error_message
            
        try:
            response = requests.post(
                self.callback_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                logger.info(f'Successfully sent callback for job {job_id}')
                return True
            else:
                logger.error(f'Callback failed with status {response.status_code}: {response.text}')
                return False
                
        except requests.RequestException as e:
            logger.error(f'Failed to send callback: {e}')
            return False
            
api_client = APIClient()
