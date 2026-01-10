import pytest
from motor.motor_asyncio import AsyncIOMotorClient

# Test to check MongoDB connection
@pytest.mark.asyncio
async def test_mongo_connection():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    response = await client.admin.command('ping')
    assert response == {'ok': 1.0}