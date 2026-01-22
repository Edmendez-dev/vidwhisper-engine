from celery import Celery
from app.core.config import settings

CELERY_BROKER_URL = f'redis://{settings.REDIS_HOST}:6379/0'
CELERY_RESULT_BACKEND = CELERY_BROKER_URL

celery_app = Celery(
    "vidwhisper",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=["app.tasks.transcription"])

celery_app.conf.update(
    task_track_started=True,
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True
)