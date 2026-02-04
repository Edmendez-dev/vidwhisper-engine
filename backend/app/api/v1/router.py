from typing import List
from fastapi import APIRouter, status, UploadFile, File
from app.schemas.transcription import TranscriptionCreate, TranscriptionResponse
from app.models.transcription import TranscriptionModel
from app.tasks.transcription import process_video_task
from app.core.database import db_conn
import logging
import shutil
import os
from minio import Minio
from minio.error import S3Error
from app.core.config import settings

router = APIRouter()

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

logger = logging.getLogger(__name__)

# Endpoint for when they are links to videos or audio
@router.post("/", response_model=TranscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_transcription(payload: TranscriptionCreate):
    # Create a new transcription entry in the database
    new_transcription = TranscriptionModel(
        video_url=str(payload.video_url),
        status="pending",
        backup_url="pending"
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
        "backup_url": new_transcription.backup_url,
        "created_at": new_transcription.created_at
    }

# Endpoint for when they upload video or audio files
@router.post("/file", response_model=TranscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_transcription_file(file: UploadFile = File(...)):
    new_transcription = TranscriptionModel(
        video_url="pending",
        status="pending",
        backup_url="pending"
    )

    # Save to database
    transcription_dict = new_transcription.model_dump(by_alias=True)
    result = await db_conn.db.transcriptions.insert_one(transcription_dict)

    # Create tmp directory if it doesn't exist
    os.makedirs('/app/tmp', exist_ok=True)
    tmp_filename = f'{str(result.inserted_id)}_file.{file.filename.split(".")[-1]}'
    tmp_filepath = f'/app/tmp/{tmp_filename}'

    with open(tmp_filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Upload file to MinIO tmp location
    try:
        client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ROOT_USER,
            secret_key=settings.MINIO_ROOT_PASSWORD,
            secure=False
        )
        client.fput_object(settings.MINIO_BUCKET, f"temp_uploads/{tmp_filename}", tmp_filepath, content_type=file.content_type)
        videoUrl_minio = f"http://{settings.MINIO_ENDPOINT}/{settings.MINIO_BUCKET}/temp_uploads/{tmp_filename}"
    except S3Error as e:
        logger.error(f'Error uploading file to MinIO: {e}')
        raise e
    
    process_video_task.delay(str(result.inserted_id), videoUrl_minio)

    for path in [tmp_filepath]:
        if os.path.exists(path):
            os.remove(path)
    
    return {
        "id": str(result.inserted_id),
        "video_url": new_transcription.video_url,
        "status": new_transcription.status,
        "backup_url": new_transcription.backup_url,
        "created_at": new_transcription.created_at
    }

# Endpoint to get all transcriptions
@router.get("/", response_model=List[TranscriptionResponse], status_code=status.HTTP_200_OK)
async def get_all_transcriptions():
    transcriptions_cursor = db_conn.db.transcriptions.find()
    transcriptions = []
    async for transcription in transcriptions_cursor:
        transcription['id'] = str(transcription['_id'])
        del transcription['_id']
        transcriptions.append(TranscriptionResponse(**transcription))
    return transcriptions