from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db_conn = MongoDB()

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

logger = logging.getLogger(__name__)


async def connect_to_mongodb():
    try:
        mongodb_uri = f"mongodb://{settings.MONGO_INITDB_ROOT_USERNAME}:{settings.MONGO_INITDB_ROOT_PASSWORD}@{settings.MONGODB_URI}"
        db_conn.client = AsyncIOMotorClient(mongodb_uri)
        db_conn.db = db_conn.client[settings.MONGO_INITDB_DATABASE]
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e

async def close_mongodb_connection():
    if db_conn.client:
        db_conn.client.close()
        logger.info("Closed MongoDB connection")