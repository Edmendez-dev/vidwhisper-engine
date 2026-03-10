from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional

class TranscriptionCreate(BaseModel):
    video_url: HttpUrl

class TranscriptionResponse(BaseModel):
    id: str
    video_url: str
    status: str
    progress: int
    text: Optional[str] = None
    backup_url: str
    created_at: datetime