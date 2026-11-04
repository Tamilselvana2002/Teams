# Complete Manual Commands Guide: Run Locally, Dockerize & Deploy to AWS

A comprehensive, beginner-friendly reference with exact terminal commands to run, build, push, and deploy the **Teams** Django WebRTC application.

---

## Table of Contents
1. [Part 1: Run Locally with Python & Daphne (No Docker)](#part-1-run-locally-with-python--daphne-no-docker)
2. [Part 2: Run Locally with Docker & Docker Compose](#part-2-run-locally-with-docker--docker-compose)
3. [Part 3: Tag and Push to Docker Hub](#part-3-tag-and-push-to-docker-hub)
4. [Part 4: Deploy & Run on Remote AWS EC2 Server](#part-4-deploy--run-on-remote-aws-ec2-server)
5. [Common Errors & Quick Fixes Cheatsheet](#common-errors--quick-fixes-cheatsheet)

---

## Part 1: Run Locally with Python & Daphne (No Docker)

Use this method when you want to run or debug the code directly on your Windows computer without Docker.

### Step 1.1: Open PowerShell and Navigate to the Project Folder
Always ensure you are in `D:\test` before running any commands.
```powershell
cd D:\test
```
Verify your current directory:
```powershell
pwd
```
*(It should print `Path: D:\test`)*

---

### Step 1.2: Create and Activate a Python Virtual Environment
A virtual environment keeps your project packages isolated from your system Python.

1. **Create the virtual environment** (named `.venv`):
   ```powershell
   python -m venv .venv
   ```

2. **Activate the virtual environment**:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
   > **Note:** If PowerShell shows a script execution policy error, run this once:
   > ```powershell
   > Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   > ```
   > Then run `.\.venv\Scripts\Activate.ps1` again.
   > Your prompt will now show `(.venv) PS D:\test>`.

---

### Step 1.3: Install Required Dependencies
Disable native NVX CFFI compile flag on Windows and install all packages:
```powershell
$env:AUTOBAHN_USE_NVX = "0"
pip install --upgrade pip
pip install -r requirements.txt
```

---

### Step 1.4: Apply Database Migrations
Create the SQLite tables for meeting rooms, participants, call logs, and host accounts:
```powershell
python manage.py migrate
```

---

### Step 1.5: Collect Static Files
Gathers CSS, JavaScript, and icons into the `staticfiles` folder:
```powershell
python manage.py collectstatic --noinput
```

---

### Step 1.6: Start the Server with Daphne (ASGI)
Because the app uses WebSockets for real-time video signaling and chat, start it with Daphne:
```powershell
daphne -b 127.0.0.1 -p 8000 config.asgi:application
```
*(Or simply run `python manage.py runserver 8000` for development)*.

Now open your browser:
👉 **http://localhost:8000**
To stop the server, press `Ctrl + C`.

---

## Part 2: Run Locally with Docker & Docker Compose

Docker packages your Python version, libraries, static files, and database configuration into an isolated Linux container, so it runs identically on any system.

### Step 2.1: Verify Docker Desktop is Running
Look at your Windows taskbar system tray (bottom-right) and ensure the Docker whale icon is active (not starting or paused).
In PowerShell, check Docker info:
```powershell
docker --version
```

---

### Step 2.2: CRITICAL — Navigate to Project Directory
> ⚠️ **Common Mistake:** If PowerShell opens in `C:\Windows\system32`, running `docker compose up -d` will fail with:
> `no configuration file provided: not found`
> You must **always** navigate to `D:\test` first:

```powershell
cd D:\test
```

---

### Step 2.3: Build the Docker Image
To build the image manually using the `Dockerfile`:
```powershell
docker build -t teams:latest .
```
*(The dot `.` at the end tells Docker to use the current directory)*.

Or build using `docker-compose`:
```powershell
docker compose build
```

---

### Step 2.4: Start the Application Container
Start the container in the background (detached mode `-d`):
```powershell
docker compose up -d
```
You will see:
```text
[+] Running 2/2
 ✔ Network test_teams_network  Created
 ✔ Container teams_app         Started
```

---

### Step 2.5: Check Running Container Status
Verify that the container is running and mapped to port 8000:
```powershell
docker ps
```
Look for:
- **STATUS:** `Up X minutes`
- **PORTS:** `0.0.0.0:8000->8000/tcp`
- **NAMES:** `teams_app`

---

### Step 2.6: View Live Container Logs
If you want to watch Daphne server logs, incoming connections, or errors:
```powershell
docker logs -f teams_app
```
*(Press `Ctrl + C` anytime to exit log viewing without stopping the container)*.

---

### Step 2.7: Open in Browser (with Hard Refresh)
Open Google Chrome or Microsoft Edge:
👉 **http://localhost:8000**

> 💡 **Important if CSS looks missing (plain white screen):**
> If your browser previously cached an unstyled view or a 404 on stylesheets, press:
> - **`Ctrl + F5`** or **`Ctrl + Shift + R`** (Hard Refresh)
> - Or open in an **Incognito Window** (`Ctrl + Shift + N`).

---

### Step 2.8: Stop or Restart the Application
- **To stop the container:**
  ```powershell
  docker compose down
  ```
- **To restart after code changes:**
  ```powershell
  docker compose down
  docker compose up -d --build
  ```

---

## Part 3: Tag and Push to Docker Hub

Pushing to Docker Hub makes your Docker container available online so you can deploy it to AWS, DigitalOcean, or share it with your team.

### Step 3.1: Log in to Docker Hub
In PowerShell, execute:
```powershell
docker login
```
- Enter your Docker Hub **Username**: `tamil2002a`
- Enter your Docker Hub **Password** or **Personal Access Token**.
- You will see: `Login Succeeded`.

---

### Step 3.2: Tag the Local Image with Your Docker Hub Namespace
> ⚠️ **Crucial Rule:**
> `docker tag` takes **2 arguments**: `[LOCAL_NAME] [DOCKERHUB_USERNAME/IMAGE_NAME:TAG]`
> `docker push` takes **only 1 argument**: `[DOCKERHUB_USERNAME/IMAGE_NAME:TAG]`

Run the tag command:
```powershell
docker tag teams:latest tamil2002a/teams:latest
```
To also create a versioned tag (e.g. `v1.0.0`):
```powershell
docker tag teams:latest tamil2002a/teams:v1.0.0
```

Verify the tags exist locally:
```powershell
docker images
```
You will see both `teams` and `tamil2002a/teams` listed with identical IMAGE IDs.

---

### Step 3.3: Push the Tagged Image to Docker Hub
Now push the tagged image to your public repository:
```powershell
docker push tamil2002a/teams:latest
```
And push the versioned tag:
```powershell
docker push tamil2002a/teams:v1.0.0
```

Docker will output progress bars for each layer:
```text
The push refers to repository [docker.io/tamil2002a/teams]
d08e085db4d1: Pushed
...
latest: digest: sha256:... size: ...
```

---

### Step 3.4: Verify on Docker Hub Web Dashboard
1. Open your browser and go to:
   👉 **https://hub.docker.com/r/tamil2002a/teams**
2. Click on the **Tags** tab.
3. You will see `latest` and `v1.0.0` listed with their sizes and upload timestamps.

---

## Part 4: Deploy & Run on Remote AWS EC2 Server

Once your image is pushed to Docker Hub, you can run it on your AWS EC2 instance in 3 commands.

### Step 4.1: Connect to Your AWS EC2 Instance via SSH
In Windows PowerShell (from the folder where your `.pem` key file is saved):
```powershell
ssh -i "your-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```
*(Replace `your-key.pem` with your key file name and `YOUR_EC2_PUBLIC_IP` with your EC2 public IPv4 address)*.

---

### Step 4.2: Install Docker on the EC2 Server (One-time only)
If Docker is not already installed on your Ubuntu server, run:
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
```
*(Log out and log back in so the docker group permissions take effect: `exit`, then SSH back in)*.

---

### Step 4.3: Pull the Latest Image from Docker Hub
On the EC2 server terminal:
```bash
docker pull tamil2002a/teams:latest
```

---

### Step 4.4: Run the Application Container
Start the container with port mapping and persistent storage volumes:
```bash
docker run -d \
  --name teams_app \
  -p 8000:8000 \
  -v teams_data:/app/data \
  -v teams_media:/app/media \
  --restart unless-stopped \
  tamil2002a/teams:latest
```

---

### Step 4.5: Verify Container is Running on EC2
```bash
docker ps
```
Test that Daphne responds internally:
```bash
curl -I http://localhost:8000
```
*(Should return `HTTP/1.1 200 OK`)*.

---

### Step 4.6: AWS Security Group Check
Ensure your EC2 Security Group allows inbound traffic:
- **Port 8000 (TCP):** Source `0.0.0.0/0` (for testing direct access: `http://YOUR_EC2_PUBLIC_IP:8000`).
- **Ports 80 & 443 (HTTP/HTTPS):** When routed through Nginx reverse proxy with SSL certificate.

---

## Common Errors & Quick Fixes Cheatsheet

| Error Message | Why It Happened | Exact Fix Command |
| :--- | :--- | :--- |
| `no configuration file provided: not found` | You ran `docker compose` in `C:\Windows\system32` instead of your project folder. | `cd D:\test`<br>`docker compose up -d` |
| `docker push requires 1 argument` | You typed `docker push teams:latest tamil2002a/teams:latest` instead of tagging first. | `docker tag teams:latest tamil2002a/teams:latest`<br>`docker push tamil2002a/teams:latest` |
| `Unstyled page (Plain white screen without CSS)` | Daphne did not serve static files on initial load and Chrome cached the 404 response. | Press **`Ctrl + F5`** (Hard Refresh) or open `http://localhost:8000` in **Incognito Mode**. |
| `Cannot connect to the Docker daemon` | Docker Desktop is not running in Windows background. | Open **Docker Desktop** from the Windows Start menu and wait until the whale icon is solid green. |
| `Scripts execution is disabled on this system` | PowerShell restricts `.ps1` virtual environment activation scripts by default. | `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`<br>then activate `.venv\Scripts\Activate.ps1`. |

---



