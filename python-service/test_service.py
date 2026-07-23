#!/usr/bin/env python3
"""Test script for Python automation service."""
import sys
from pathlib import Path

project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def test_config():
    """Test configuration loading."""
    from config import config
    print(f"Redis Host: {config.REDIS_HOST}")
    print(f"Redis Port: {config.REDIS_PORT}")
    print(f"Backend URL: {config.BACKEND_URL}")
    print(f"Queue Name: {config.QUEUE_NAME}")
    print("Config test passed!")

def test_logger():
    """Test logger setup."""
    from src.logger import logger
    logger.info("Test info message")
    logger.warning("Test warning message")
    logger.error("Test error message")
    print("Logger test passed!")

def test_queue_connection():
    """Test Redis connection."""
    try:
        from src.queue_client import QueueClient
        client = QueueClient()
        client.connect()
        client.close()
        print("Redis connection test passed!")
        return True
    except Exception as e:
        print(f"Redis connection test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("Running tests...")
    print("-" * 40)

    test_config()
    print()

    test_logger()
    print()

    test_queue_connection()
    print()

    print("-" * 40)
    print("All tests completed!")

if __name__ == '__main__':
    main()
