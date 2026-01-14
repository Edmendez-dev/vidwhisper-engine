from minio import Minio
from minio.error import S3Error
import json
from app.core.config import settings
import logging

async def init_minio():
    try:
        client = Minio(
            "minio:9000",
            access_key=settings.MINIO_ROOT_USER,
            secret_key=settings.MINIO_ROOT_PASSWORD,
            secure=False
        )

        bucket_name = "vidwhisper-engine"

        if not client.bucket_exists(bucket_name):
            client.make_bucket(bucket_name)
            logging.info(f"Bucket '{bucket_name}' created.")

        # Verify if the bucket haves public read access
        try:
            policy_current = client.get_bucket_policy(bucket_name)
            policy_dict = json.loads(policy_current)

            # Verify if the policy allows public read access
            has_public_policy = any(
                statement.get("Effect")=="Allow" and
                statement.get("Principal", {}).get("AWS")==["*"] and 
                "s3:GetObject" in statement.get("Action", [])
                for statement in policy_dict.get("Statement", [])
            )

            if has_public_policy:
                logging.info(f"Bucket '{bucket_name}' already has public read access.")
                return
        except S3Error as e:
            if e.code != "NoSuchBucketPolicy":
                raise

        # Apply public access policy if one does not exist
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"AWS": ["*"]},
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
                }
            ]
        }

        # Apply the policy to the bucket
        client.set_bucket_policy(bucket_name, json.dumps(policy))
        logging.info(f"Bucket policy set for '{bucket_name}'.")
        logging.info("Bucket is now public for reading.")

    except S3Error as e:
        logging.error(f"MinIO initialization failed: {e}")
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")