FROM python:3.11-slim

# Avoid interactive prompts during package installation
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Create a non-root user and set permissions
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app && \
    chown -R appuser:appuser /app

# Set working directory
WORKDIR /app

# Copy Dependencies 
COPY --chown=appuser:appuser requirements.txt .

# Intall all dependencies python 
RUN pip install --no-cache-dir -r requirements.txt

# Copy code 
COPY --chown=appuser:appuser app ./app

# Change to non-root user
USER appuser

# Expose port 
EXPOSE 8000

# Add a health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit -1

# Command for production
CMD [ "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000" ]

