# TODO — Manual Step-by-Step Commands Guide

Progress: 4/4 · Current item: All Complete · Next step: None — Ready for user manual execution

## Assumptions
- Operating System: Windows PowerShell for local execution; Linux (Ubuntu) for AWS EC2 remote server.
- Project Directory: `D:\test`
- Docker Hub Username: `tamil2002a`
- Docker Hub Image Name: `tamil2002a/teams:latest` (or `v1.0.0`)
- User wants copy-pasteable terminal commands with clear explanations for what each command does and common pitfalls to avoid.

## Items

### 1. Manual Commands: Run Locally with Python & Daphne (No Docker)
- What: Document exact step-by-step commands to set up virtualenv, install dependencies, run migrations, collect static assets, and launch Daphne ASGI server locally.
- Where: `docs/MANUAL_COMMANDS_GUIDE.md`, section 1
- Acceptance checks:
  - [x] Terminal navigation (`cd D:\test`)
  - [x] Virtualenv creation and activation (`.venv\Scripts\activate`)
  - [x] Environment variables and pip install
  - [x] Database migration and collectstatic
  - [x] Starting Daphne on port 8000
- Status: ✅
- Proof: Written in `docs/MANUAL_COMMANDS_GUIDE.md` Section 1 covering navigation, virtualenv, env variables, migrate, collectstatic, and Daphne startup.

### 2. Manual Commands: Run Locally with Docker & Docker Compose
- What: Document exact manual commands for Docker Desktop: building the image, starting containers, viewing logs, stopping, and handling browser cache.
- Where: `docs/MANUAL_COMMANDS_GUIDE.md`, section 2
- Acceptance checks:
  - [x] Changing directory to project folder (preventing C:\Windows\system32 error)
  - [x] Building image with `docker build` and `docker compose build`
  - [x] Starting container with `docker compose up -d`
  - [x] Checking status with `docker ps` and `docker logs`
  - [x] Stopping with `docker compose down`
- Status: ✅
- Proof: Written in `docs/MANUAL_COMMANDS_GUIDE.md` Section 2 with exact steps for directory navigation, build, start, status, logs, hard refresh, and teardown.

### 3. Manual Commands: Tag and Push to Docker Hub
- What: Document exact commands for authenticating with Docker Hub, tagging images properly (preventing the two-argument docker push error), and pushing.
- Where: `docs/MANUAL_COMMANDS_GUIDE.md`, section 3
- Acceptance checks:
  - [x] `docker login` syntax
  - [x] `docker tag` syntax with source and destination
  - [x] `docker push` syntax (single image:tag argument)
  - [x] Verifying on Docker Hub web dashboard
- Status: ✅
- Proof: Written in `docs/MANUAL_COMMANDS_GUIDE.md` Section 3 explaining the 2-argument vs 1-argument rule, login, tagging, pushing, and dashboard verification.

### 4. Manual Commands: Deploy and Run on AWS EC2 Server
- What: Document exact commands on the remote AWS Ubuntu EC2 server to pull the image and run it.
- Where: `docs/MANUAL_COMMANDS_GUIDE.md`, section 4
- Acceptance checks:
  - [x] SSH connect command
  - [x] Docker installation / verification on EC2
  - [x] `docker pull tamil2002a/teams:latest`
  - [x] `docker run` command with port mapping 8000 and volume persistence
  - [x] Curl test and browser verification
- Status: ✅
- Proof: Written in `docs/MANUAL_COMMANDS_GUIDE.md` Section 4 covering SSH, Docker install, pull, run, status check, and AWS security group verification.


### 3. Manual Commands: Tag and Push to Docker Hub
- What: Document exact commands for authenticating with Docker Hub, tagging images properly (preventing the two-argument docker push error), and pushing.
- Where: `docs/MANUAL_COMMANDS_GUIDE.md`, section 3
- Acceptance checks:
  - [ ] `docker login` syntax
  - [ ] `docker tag` syntax with source and destination
  - [ ] `docker push` syntax (single image:tag argument)
  - [ ] Verifying on Docker Hub web dashboard
- Status: ⬜
- Proof: 

### 4. Manual Commands: Deploy and Run on AWS EC2 Server
- What: Document exact commands on the remote AWS Ubuntu EC2 server to pull the image and run it.
- Where: `docs/MANUAL_COMMANDS_GUIDE.md`, section 4
- Acceptance checks:
  - [ ] SSH connect command
  - [ ] Docker installation / verification on EC2
  - [ ] `docker pull tamil2002a/teams:latest`
  - [ ] `docker run` command with port mapping 8000 and volume persistence
  - [ ] Curl test and browser verification
- Status: ⬜
- Proof: 
