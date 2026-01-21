from fastapi import APIRouter, HTTPException, status
from app.schemas.transcription import TranscriptionCreate, TranscriptionResponse
from app.models.transcription import TranscriptionModel
from app.tasks.transcription import process_video_task
from app.core.database import db_conn
from datetime import datetime
import logging

router = APIRouter()

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

logger = logging.getLogger(__name__)

@router.post("/", response_model=TranscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_transcription(payload: TranscriptionCreate):
    # Create a new transcription entry in the database
    new_transcription = TranscriptionModel(
        video_url=str(payload.video_url),
        status="pending",
    )

    # Save to database
    transcription_dict = new_transcription.model_dump(by_alias=True)
    result = await db_conn.db.transcriptions.insert_one(transcription_dict)

    # Trigger the background task to process the video
    try:
        process_video_task.delay(str(result.inserted_id), str(payload.video_url))
    except Exception as e:
        logger.error(f"Failed to trigger background task: {e}")
        raise e

    return {
        "id": str(result.inserted_id),
        "video_url": new_transcription.video_url,
        "status": new_transcription.status,
        "created_at": new_transcription.created_at
    }