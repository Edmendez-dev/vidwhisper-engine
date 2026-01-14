from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    
    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class TranscriptionModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    video_url: str
    status: str = "pending" # e.g., 'pending', 'processing', 'completed', 'failed'
    text: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "video_url": "http://example.com/video.mp4",
                "status": "pending",
                "text": None,
                "created_at": "2024-01-01T00:00:00Z"
            }
        }
