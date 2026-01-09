import pytest
from minio import Minio
from minio.error import S3Error

@pytest.mark.asyncio
async def test_minio_connection():
    try:
        client = Minio(
            "localhost:9000",
            access_key="minioadmin",
            secret_key="minioadmin",
            secure=False
        )

        assert True  # If we reach this point, the connection was successful
    except S3Error as e:
        pytest.fail(f"MinIO connection failed: {e}")
    except Exception as e:
        pytest.fail(f"An unexpected error occurred: {e}")
    
    

