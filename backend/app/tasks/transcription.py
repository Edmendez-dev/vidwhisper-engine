import time
import logging
import asyncio
import ffmpeg
import requests
import whisper
import os
import yt_dlp
from minio import Minio
from minio.error import S3Error
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.celery_app import celery_app
from app.core.config import settings

logger = logging.getLogger(__name__)

# Load the model
model = whisper.load_model('base')

async def get_db():
    try:
        mongodb_uri = f"mongodb://{settings.MONGO_INITDB_ROOT_USERNAME}:{settings.MONGO_INITDB_ROOT_PASSWORD}@{settings.MONGODB_URI}"
        client = AsyncIOMotorClient(mongodb_uri)
        return client[settings.MONGO_INITDB_DATABASE]
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise e

# Functions 
def _download_video_sync(url: str, transcription_id: str):
    response = requests.get(url, stream=True, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    response.raise_for_status()
    content_type = response.headers.get('Content-Type', '').lower()

    # Create tmp directory if it doesn't exist
    os.makedirs('/app/tmp', exist_ok=True)

    # Case 1: Yotube Video
    if "youtube.com" in url or "youtu.be" in url:
        ydl_opts = {
            'format': 'bestaudio[ext=m4a]/bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': f'/app/tmp/{transcription_id}.%(ext)s',
            'extractor_args': {
                'youtube': {
                    'player_client': ['android', 'ios'],
                }
            },
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 13)',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Origin': 'https://www.youtube.com',
                'Referer': 'https://www.youtube.com/',
            },
            'nocheckcertificate': True,
            'quiet': False,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.extract_info(url, download=True)
        return
    
    # Case 2: Link direct to audio or video
    if "audio" in content_type or "video" in content_type:
        path_temp = f'/app/tmp/{transcription_id}_tmp'

        with open(path_temp, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        if "audio" in content_type:
            os.rename(path_temp, f'/app/tmp/{transcription_id}.mp3')
            return
        elif "video" in content_type:
            try:
                (
                    ffmpeg.input(path_temp).output(f'/app/tmp/{transcription_id}.mp3', acodec='libmp3lame', audio_bitrate='192k').overwrite_output().run(quiet=True)
                )
                if os.path.exists(path_temp):
                    os.remove(path_temp)
            except Exception as e:
                logger.error(f'Error converting video to audio: {e}')
                raise e
            return
        else:
            if os.path.exists(path_temp):
                os.remove(path_temp)
            raise Exception(f'Unsupported content type: {content_type}')
    # Case 3: Audio file attachment
    
def _upload_to_minio_sync(filepath: str, object_name: str):
    try:
        client = Minio(
            "minio:9000",
            access_key=settings.MINIO_ROOT_USER,
            secret_key=settings.MINIO_ROOT_PASSWORD,
            secure=False
        )
        bucket_name = "vidwhisper-engine"
        client.fput_object(bucket_name, object_name, filepath)
    except S3Error as e:
        logger.error(f'Error uploading video to MinIO: {e}')
        raise e
    
async def download_video(url: str, filepath: str, name_id: str):
    audio_path = f"/app/tmp/{name_id}.mp3"

    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _download_video_sync, url, name_id)

        await loop.run_in_executor(None, _upload_to_minio_sync, audio_path, f"audios/{name_id}.mp3")
        logger.info(f'Audio uploaded to MinIO as audios/{name_id}.mp3')
        
        # Clean up local video file
        if os.path.exists(filepath):
            os.remove(filepath)
    except Exception as e:
        logger.error(f'Error to processing video from {url}: {e}')
        raise e

    
async def upload_to_minio(filepath: str, object_name: str):
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _upload_to_minio_sync, filepath, object_name)
    except S3Error as e:
        logger.error(f'Error uploading to MinIO: {e}')
        raise e

@celery_app.task(name="process_video_task")
def process_video_task(transcription_id: str, video_url: str):
    logger.info(f'Starting processing for ID: {transcription_id}')
    video_path = f"/app/tmp/{transcription_id}.mp4"
    audio_path = f"/app/tmp/{transcription_id}.mp3"

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

        # Download video and convert to audio
        loop.run_until_complete(download_video(video_url, video_path, transcription_id))
        
        # Transcribe audio
        logger.info(f'Starting transcription for ID: {transcription_id}')
        result = model.transcribe(audio_path, fp16=False)
        transcribed_text = result.get('text', '')

        # Free memory used by the model
        # del model
        # import gc
        # gc.collect()

        # Update status to 'completed'
        loop.run_until_complete(update_status('completed', {"text": transcribed_text}))

        return { "status": "success", "id": transcription_id }
    except Exception as e:
        logger.error(f'Error processing video for ID: {transcription_id}, error: {e}')
        loop.run_until_complete(update_status('failed'))
        return { "status": "failed", "message": str(e) }
    finally:
        # Clean up local audio file
        for path in [video_path, audio_path]:
            if os.path.exists(path):
                os.remove(path)
                # logger.info(f'Cleaned up temporary files for ID: {transcription_id}')