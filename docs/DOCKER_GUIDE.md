# 🐳 Beginner Guide: Building & Pushing Teams to Docker and Docker Hub

> **Goal:** Package the entire Teams Real-Time Video Call & Meeting platform into a **Docker Container** and push it to **Docker Hub** so it can run anywhere with 1 command.
>
> Every step and command has simple explanations and comments.

---

## 🗺️ What is Docker & Docker Hub?

- **Docker:** Packages your Django app, Python, Daphne, WebSockets, HTML/CSS, and all dependencies into a single self-contained "shipping container" (an **Image**). Once built, it runs on Windows, Mac, or Linux without needing to install Python or packages on the host machine.
- **Docker Hub:** A free cloud storage library for Docker containers (similar to GitHub, but for runnable containers). Once you push your image to Docker Hub, you can download and run it on your AWS server in 1 second.

---

## 📋 Step 1: Install Docker

### Option A: On Your Windows Computer
1. Download **Docker Desktop for Windows** from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/).
2. Run the installer (ensure **WSL 2** is enabled).
3. Restart your computer and start Docker Desktop.

### Option B: On Your AWS EC2 Server (Ubuntu)
If you prefer building and running directly on your AWS Ubuntu server:
```bash
# Update server packages
sudo apt update

# Install Docker and Docker Compose
sudo apt install -y docker.io docker-compose

# Give your ubuntu user permission to run docker without typing sudo every time
sudo usermod -aG docker $USER

# Start and enable Docker on boot
sudo systemctl enable --now docker
```

---

## 📋 Step 2: Build the Docker Image Locally

In your project folder (`D:\test`), open PowerShell or Terminal:

```bash
# Build the Docker image named 'teams' using our Dockerfile
docker build -t teams .
```

> **What this command does:**
> - Downloads the official lightweight `python:3.12-slim` base image.
> - Installs all dependencies from `requirements.txt`.
> - Copies your Django templates, WebRTC JavaScript, CSS, and models into `/app`.
> - Sets up the Daphne ASGI server.

---

## 📋 Step 3: Run and Test the Container

Run your container on your computer:

```bash
# Run the container and map port 8000 on your machine to port 8000 inside the container
docker run -d -p 8000:8000 --name teams_app teams
```

OR use **Docker Compose** (recommended):
```bash
# Start the container in background with persistent database volume
docker compose up -d
```

### Verify it is running:
1. Open your browser and go to: **`http://localhost:8000/`** (or `http://127.0.0.1:8000/`)
2. You will see the Teams landing page live!
3. Check the container status:
   ```bash
   # Check running containers
   docker ps

   # View real-time logs of the running container
   docker logs -f teams_app
   ```

To stop the container:
```bash
docker stop teams_app
```

---

## 📋 Step 4: Push Your Container to Docker Hub

### 4.1 Create a Docker Hub Account
If you don't already have one, create a free account at [hub.docker.com](https://hub.docker.com/). Note down your **Username** (for example: `tamil123`).

### 4.2 Log In to Docker Hub from Terminal
```bash
# Log into your Docker Hub account
docker login
```
Enter your Docker Hub username and password when prompted. You will see `Login Succeeded`.

### 4.3 Tag Your Local Image with Your Docker Hub Username
Docker Hub requires the image name to start with your username:

```bash
# Format: docker tag <local-image> <your-username>/<repo-name>:<version>
# Example (replace 'YOUR_USERNAME' with your actual Docker Hub username):
docker tag teams:latest YOUR_USERNAME/teams:latest
docker tag teams:latest YOUR_USERNAME/teams:v1.0.0
```

### 4.4 Push to Docker Hub!
```bash
# Upload your container image to Docker Hub
docker push YOUR_USERNAME/teams:latest
docker push YOUR_USERNAME/teams:v1.0.0
```

> Once the upload finishes, visit [hub.docker.com](https://hub.docker.com/) and you will see your `teams` repository publicly available!

---

## 📋 Step 5: How to Run Your Docker Image on Any AWS Server

Now that your image is on Docker Hub, deploying to AWS or any cloud takes only **one command**:

```bash
# Connect to your AWS EC2 server
ssh -i "my-key.pem" ubuntu@YOUR_AWS_ELASTIC_IP

# Run your Docker image directly from Docker Hub!
docker run -d \
  -p 8000:8000 \
  --name teams \
  --restart always \
  -v teams_data:/app/data \
  YOUR_USERNAME/teams:latest
```

> **Why this is awesome:**
> - You don't need to install Python, virtual environments, or pip on the server!
> - Docker pulls everything pre-packaged and starts the Daphne WebSockets server immediately on port 8000.
> - Nginx routes incoming traffic from `teams.yourdomain.com` straight into the container.

---

## 💡 Handy Docker Commands Reference

```bash
# View all running containers
docker ps

# View live container logs (press Ctrl+C to exit)
docker logs -f teams_app

# Restart the container
docker restart teams_app

# Stop and remove the container
docker stop teams_app
docker rm teams_app

# Pull the latest version from Docker Hub
docker pull YOUR_USERNAME/teams:latest
```
