# ==============================================================================
# Teams — Dockerfile for Production Django ASGI / WebSockets
# ==============================================================================

FROM python:3.12-slim

# Prevent Python from writing .pyc files & enable unbuffered terminal logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set container working directory
WORKDIR /app

# Install minimal system packages for building wheels & networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python package dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the entire project code into the container
COPY . /app/

# Ensure entrypoint script is executable
RUN chmod +x /app/entrypoint.sh

# Expose port 8000 for Daphne ASGI (HTTP + WebSockets)
EXPOSE 8000

# Set entrypoint to run migrations and start Daphne
ENTRYPOINT ["/app/entrypoint.sh"]
