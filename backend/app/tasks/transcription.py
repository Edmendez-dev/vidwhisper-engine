import time
import logging
import asyncio
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.celery_app import celery_app
from app.core.config import settings

logger = logging.getLogger(__name__)

async def get_db():
    try:
        mongodb_uri = f"mongodb://{settings.MONGO_INITDB_ROOT_USERNAME}:{settings.MONGO_INITDB_ROOT_PASSWORD}@{settings.MONGODB_URI}"
        client = AsyncIOMotorClient(mongodb_uri)
        return client[settings.MONGO_INITDB_DATABASE]
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise e

@celery_app.task(name="process_video_task")
def process_video_task(transcription_id: str, video_url: str):
    # logger.info(f'Starting processing for ID: {transcription_id}')

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    async def update_status(status_name: str, extra_data: dict = None):
        db = await get_db()
        update_doc = {"status": status_name}
        if extra_data:
            update_doc.update(extra_data)
        
        await db.transcriptions.update_one(
            {"_id": ObjectId(transcription_id)},
            {"$set": update_doc}
        )

    try:
        # Change status to 'pending'
        loop.run_until_complete(update_status('processing'))

        # Simulate video processing
        time.sleep(10)

        # Update status to 'completed'
        loop.run_until_complete(update_status('completed', {"text": "Successfully transcribed text."}))

        return { "status": "success", "id": transcription_id }
    except Exception as e:
        logger.error(f'Error processing video for ID: {transcription_id}, error: {e}')
        loop.run_until_complete(update_status('failed'))
        return { "status": "failed", "message": str(e) }