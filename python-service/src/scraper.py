from selenium import webdriver
from selenium.webdriver.common.by import By
from typing import List, Dict
import re
import json
from src.logger import logger

def get_video_data(driver: webdriver.Chrome) -> List[Dict]:
    videos = []
    
    try:
        page_source = driver.page_source
        video_ids = set()
        
        for match in re.finditer(r'/shorts/([A-Za-z0-9_-]{11})', page_source):
            video_ids.add(match.group(1))
        
        titles_map = {}
        channels_map = {}
        
        try:
            yt_match = re.search(r'var ytInitialData\s*=\s*({.*?});\s*</script>', page_source, re.DOTALL)
            if yt_match:
                data = json.loads(yt_match.group(1))
                contents = json.dumps(data)
                
                for match in re.finditer(r'"videoId":\s*"([A-Za-z0-9_-]{11})"', contents):
                    video_ids.add(match.group(1))
                
                for match in re.finditer(r'"title":\s*\{\s*"runs":\s*\[\s*\{\s*"text":\s*"([^"]+)"', contents):
                    titles_map[match.group(1)] = True
                
                for match in re.finditer(r'"(longBylineText|shortBylineText|ownerText)":\s*\{\s*"runs":\s*\[\s*\{\s*"text":\s*"([^"]+)"', contents):
                    channels_map[match.group(2)] = True
                
                for match in re.finditer(r'"(channelName|ownerChannelName|author)":\s*"([^"]+)"', contents):
                    channels_map[match.group(2)] = True
                    
        except Exception as e:
            logger.debug(f'JSON parse: {e}')
        
        titles_list = list(titles_map.keys())
        channels_list = list(channels_map.keys())
        
        logger.info(f'Found {len(video_ids)} IDs, {len(titles_list)} titles, {len(channels_list)} channels')
        
        seen_urls = set()
        idx = 0
        for vid_id in video_ids:
            url = f'https://www.youtube.com/shorts/{vid_id}'
            if url in seen_urls:
                continue
            seen_urls.add(url)
            
            title = titles_list[idx] if idx < len(titles_list) else f'Short #{idx + 1}'
            channel = channels_list[idx % len(channels_list)] if channels_list else None
            
            videos.append({
                'title': title[:200],
                'url': url,
                'channel': channel,
            })
            idx += 1
        
        logger.info(f'Extracted {len(videos)} videos')
        
    except Exception as e:
        logger.error(f'Error in get_video_data: {e}')
    
    return videos
