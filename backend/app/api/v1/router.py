from fastapi import APIRouter, HTTPException, status
from app.schemas.transcription import TranscriptionCreate, TranscriptionResponse
from app.models.transcription import TranscriptionModel
from app.core.database import db_conn
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=TranscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_transcription(payload: TranscriptionCreate):
    new_transcription = TranscriptionModel(
        video_url=str(payload.video_url),
        status="pending",
        created_at=datetime.utcnow()
    )

    transcription_dict = new_transcription.model_dump(by_alias=True)

    result = await db_conn.db.transcriptions.insert_one(transcription_dict)

    return {
        "id": str(result.inserted_id),
        "video_url": str(payload.video_url),
        "status": "pending",
        "created_at": new_transcription.created_at
    }