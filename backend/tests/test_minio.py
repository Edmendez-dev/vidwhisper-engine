import pytest
import os
from minio import Minio
from minio.error import S3Error
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")  # Load environment variables from .env file

@pytest.mark.asyncio
async def test_minio_connection():
    try:
        client = Minio(
            "localhost:9000",
            access_key=os.getenv("MINIO_ROOT_USER"),
            secret_key=os.getenv("MINIO_ROOT_PASSWORD"),
            secure=False
        )

        buckets = client.list_buckets()
        assert True  # If we reach this point, the connection was successful
    except S3Error as e:
        pytest.fail(f"MinIO connection failed: {e}")
    except Exception as e:
        pytest.fail(f"An unexpected error occurred: {e}")
    
    

