from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.database import connect_to_mongodb, close_mongodb_connection
from app.api.v1.router import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await connect_to_mongodb()
    yield
    # Shutdown: Close MongoDB connection
    await close_mongodb_connection()

app = FastAPI(
    title="VidWhisper Backend API",
    description="API for VidWhisper backend services",
    version="1.0.0",
    lifespan=lifespan)

app.include_router(router, prefix="/api/v1/transcriptions", tags=["transcriptions"])

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "VidWhisper Backend API is running."}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}