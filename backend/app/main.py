from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.database import connect_to_mongodb, close_mongodb_connection
from app.core.minio import init_minio
from app.api.v1.router import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await connect_to_mongodb()
    # Startup: Initialize MinIO
    await init_minio()
    yield
    # Shutdown: Close MongoDB connection
    await close_mongodb_connection()

app = FastAPI(
    title="VidWhisper Backend API",
    description="API for VidWhisper backend services",
    version="1.0.0",
    lifespan=lifespan)

# Add CORS middleware 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"], # Allow all HTTP Methods (GET, POST, UPDATE, DELETE, etc.)
    allow_headers=["*"], # Allow all headers
)

app.include_router(router, prefix="/api/v1/transcriptions", tags=["transcriptions"])

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "VidWhisper Backend API is running."}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}