from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # MinIO settings
    MINIO_ROOT_USER: str 
    MINIO_ROOT_PASSWORD: str
    # MongoDB settings
    MONGODB_URI: str 
    MONGO_INITDB_DATABASE: str
    MONGO_INITDB_ROOT_USERNAME: str
    MONGO_INITDB_ROOT_PASSWORD: str

    class Config:
        env_file = ".env"

settings = Settings()

    