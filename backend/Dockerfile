FROM python:3.11-slim

# Avoid interactive prompts during package installation
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install Curl for health checks and FFmpeg for media processing
RUN apt-get update && apt-get install -y ffmpeg curl unzip ca-certificates && rm -rf /var/lib/apt/lists/*

# Install Deno globally (accessible to all users)
RUN curl -fsSL https://deno.land/install.sh | sh && \
    mv /root/.deno/bin/deno /usr/local/bin/deno && \
    chmod +x /usr/local/bin/deno && \
    deno --version

# Create a non-root user and set permissions
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app && \
    chown -R appuser:appuser /app

# Set working directory
WORKDIR /app

# Copy dependencies 
COPY --chown=appuser:appuser requirements.txt .
# Install all dependencies python 
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir -U yt-dlp

# Copy application code 
COPY --chown=appuser:appuser app ./app

# Change to non-root user
USER appuser

# Verify that appuser can access deno
RUN deno --version

# Expose port 
EXPOSE 8000

# Add a health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#     CMD uvicorn --version > /dev/null && curl -f http://localhost:8000/health || exit 1

# Command for production
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

