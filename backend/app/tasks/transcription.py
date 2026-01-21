import time
import logging
from app.core.celery_app import celery_app

logger = logging.getLogger(__name__)

@celery_app.task(name="process_video_task")
def process_video_task(transcription_id: str, video_url: str):
    logger.info(f'Starting processing for ID: {transcription_id}')

    # Simulate video processing
    time.sleep(10)

    logger.info(f'Completed processing for ID: {transcription_id}')
    return { "status": "completed", "transcription_id": transcription_id }