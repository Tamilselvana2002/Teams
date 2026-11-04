# TODO — Docker Containerization & Docker Hub Push Guide

Progress: 4/4 · Current item: All Complete · Next step: Ready for user build & push

## Assumptions
- Base Image: `python:3.12-slim` (lightweight, standard Python base with pre-built wheels for Twisted/Autobahn/Channels).
- Container Server: Daphne ASGI on port 8000 (supporting HTTP and WebSockets for real-time video/audio).
- Target: Full Docker containerization + Docker Compose + step-by-step push to Docker Hub.

## Items

### 1. Production Dockerfile & .dockerignore
- What: Create optimized Dockerfile and .dockerignore for the Teams Django/Channels/Daphne application.
- Where: `Dockerfile`, `.dockerignore`
- Acceptance checks:
  - [x] `Dockerfile` uses Python 3.12-slim base
  - [x] Installs system dependencies, pip packages from requirements.txt
  - [x] Exposes port 8000 and runs Daphne ASGI
  - [x] `.dockerignore` excludes `venv`, `__pycache__`, `db.sqlite3`, `.git`
- Status: ✅
- Proof: Created `Dockerfile` with Python 3.12-slim, Daphne ASGI on port 8000, and `.dockerignore` excluding venv, pycache, local sqlite db, and git.

### 2. Multi-Container Orchestration (docker-compose.yml)
- What: Create docker-compose.yml for 1-click startup with volume persistence for SQLite/media and environment configs.
- Where: `docker-compose.yml`
- Acceptance checks:
  - [x] Defines `web` service mapping port `8000:8000`
  - [x] Configures persistent volume for database (`db.sqlite3`)
  - [x] Sets environment variables (DJANGO_SETTINGS_MODULE, DEBUG, ALLOWED_HOSTS)
- Status: ✅
- Proof: Created `docker-compose.yml` with `teams_app` container, port `8000:8000`, and named volumes `teams_data` and `teams_media`.

### 3. Container Entrypoint Script (entrypoint.sh)
- What: Automated startup script that applies database migrations, collects static assets, and launches Daphne ASGI.
- Where: `entrypoint.sh`
- Acceptance checks:
  - [x] Executes `python manage.py migrate --noinput`
  - [x] Executes `python manage.py collectstatic --noinput`
  - [x] Starts Daphne ASGI server binding to `0.0.0.0:8000`
- Status: ✅
- Proof: Created `entrypoint.sh` executing migrations, collectstatic, and `exec daphne -b 0.0.0.0 -p 8000 config.asgi:application`.

### 4. Step-by-Step Guide to Build, Run & Push to Docker Hub
- What: Complete beginner manual for Docker Desktop on Windows, building, testing, tagging, and pushing image to Docker Hub (`docker push`).
- Where: `docs/DOCKER_GUIDE.md`
- Acceptance checks:
  - [x] Explains `docker build`, `docker run`, `docker compose up`
  - [x] Explains `docker login`, `docker tag`, `docker push` with copyable commands
  - [x] Explains running the Docker container on the AWS EC2 instance
- Status: ✅
- Proof: Created `docs/DOCKER_GUIDE.md` covering Docker installation, build, run, `docker login`, `docker tag`, and `docker push` commands.
