import pytest
import os
from minio import Minio
from minio.error import S3Error
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")  # Load environment variables from .env file

# Test to check MinIO connection
@pytest.mark.asyncio
async def test_minio_connection():
    try:
        client = Minio(
            "localhost:9000",
            access_key=os.getenv("MINIO_ROOT_USER"),
            secret_key=os.getenv("MINIO_ROOT_PASSWORD"),
            secure=False
        )

        # Attempt to list buckets to verify connection
        buckets = client.list_buckets()

        # Verify if bucket exists
        bucket_name = "vidwhisper-engine"
        bucket_exists = any(bucket.name == bucket_name for bucket in buckets)
        assert bucket_exists, f"Bucket '{bucket_name}' does not exist."

        assert True  # If we reach this point, the connection is successful and bucket exists
    except S3Error as e:
        pytest.fail(f"MinIO connection failed: {e}")
    except Exception as e:
        pytest.fail(f"An unexpected error occurred: {e}")
    
    

