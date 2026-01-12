from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db_conn = MongoDB()

async def connect_to_mongodb():
    mongodb_uri = f"mongodb://{settings.MONGO_INITDB_ROOT_USERNAME}:{settings.MONGO_INITDB_ROOT_PASSWORD}@{settings.MONGODB_URI}"
    db_conn.client = AsyncIOMotorClient(mongodb_uri)
    db_conn.db = db_conn.client[settings.MONGO_INITDB_DATABASE]
    print("Connected to MongoDB")

async def close_mongodb_connection():
    db_conn.client.close()
    print("Closed MongoDB connection")