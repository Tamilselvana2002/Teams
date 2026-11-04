# 10 — Installation & Multi-App AWS Production Deployment

> **Note for Beginners:** Every command in this chapter includes an explanation comment directly above or beside it. You can copy and paste the commands directly into your terminal.

---

## 10.1 Local Development Setup (Run on Your Computer)

### 1. Prerequisites
- **Python 3.10, 3.11, 3.12, 3.13, 3.14, or 3.15** installed.
- **Git** installed.

### 2. Step-by-Step Local Setup
```bash
# 1. Clone the repository to your local computer
git clone <YOUR_GIT_REPO_URL> teams_project

# 2. Enter the project folder
cd teams_project

# 3. Create an isolated Python virtual environment named 'venv'
python -m venv venv

# 4. Activate the virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On macOS / Linux:
source venv/bin/activate

# 5. Install the required Python packages
pip install -r requirements.txt

# 6. Apply database migrations to generate your SQLite database
python manage.py migrate

# 7. Start the local development server (runs Daphne ASGI automatically)
python manage.py runserver
```

Open your browser and navigate to: **`http://127.0.0.1:8000/`**

---

## 10.2 Production Setup: Hosting 5 Django Applications on 1 AWS Server with Hostinger

This guide explains how to host **5 different Django websites/apps** on a **single AWS EC2 Ubuntu instance** with subdomains configured in **Hostinger** and free auto-renewing **SSL (HTTPS)**.

```
Hostinger Subdomains            AWS Ubuntu Server (Ports 80 & 443)
────────────────────            ───────────────────────────────────
teams.yourdomain.com   ──────►  Nginx  ──────►  Port 8000 (App 1: Teams Daphne)
app2.yourdomain.com    ──────►  Nginx  ──────►  Port 8001 (App 2: Django)
app3.yourdomain.com    ──────►  Nginx  ──────►  Port 8002 (App 3: Django)
app4.yourdomain.com    ──────►  Nginx  ──────►  Port 8003 (App 4: Django)
yourdomain.com         ──────►  Nginx  ──────►  Port 8004 (App 5: Main Site)
```

---

### Step 1: AWS Security Group & Elastic IP (Static IP)

1. **Inbound Firewall Rules:**
   In AWS EC2 ➔ **Security Groups** ➔ **Edit Inbound Rules**, ensure these 3 ports are open:
   - **Port 22 (SSH):** Source `0.0.0.0/0` *(Allows you to connect to the server)*
   - **Port 80 (HTTP):** Source `0.0.0.0/0` *(Public web traffic)*
   - **Port 443 (HTTPS):** Source `0.0.0.0/0` *(Encrypted SSL web traffic)*

2. **Allocate an Elastic IP:**
   - In AWS EC2 ➔ **Network & Security** ➔ **Elastic IPs** ➔ Click **Allocate Elastic IP address**.
   - Click **Actions** ➔ **Associate Elastic IP address** ➔ select your running EC2 instance and click **Associate**.
   - Note down this permanent public IP (e.g. `13.234.56.78`).

---

### Step 2: Hostinger DNS Configuration (Add 5 A-Records)

1. Log in to **Hostinger** ➔ Click **Domains** ➔ Click **Manage** next to your domain (`yourdomain.com`).
2. Click **DNS / Nameservers** in the left sidebar.
3. Under **Manage DNS Records**, create these 5 A-records:

| Type | Name (Host) | Points To (Value) | TTL | Purpose |
|---|---|---|---|---|
| `A` | `@` | `YOUR_AWS_ELASTIC_IP` | `300` | Main site: `yourdomain.com` (App 5) |
| `A` | `www` | `YOUR_AWS_ELASTIC_IP` | `300` | Main site with www |
| `A` | `teams` | `YOUR_AWS_ELASTIC_IP` | `300` | Subdomain for App 1: `teams.yourdomain.com` |
| `A` | `app2` | `YOUR_AWS_ELASTIC_IP` | `300` | Subdomain for App 2: `app2.yourdomain.com` |
| `A` | `app3` | `YOUR_AWS_ELASTIC_IP` | `300` | Subdomain for App 3: `app3.yourdomain.com` |
| `A` | `app4` | `YOUR_AWS_ELASTIC_IP` | `300` | Subdomain for App 4: `app4.yourdomain.com` |

---

### Step 3: Server Baseline & Virtual Memory (Swap)

Connect to your AWS server using your SSH key:
```bash
# Log in to your AWS server
ssh -i "my-key.pem" ubuntu@YOUR_AWS_ELASTIC_IP
```

Run these server preparation commands:
```bash
# 1. Update Ubuntu's package lists and upgrade existing software to the latest versions
sudo apt update && sudo apt upgrade -y

# 2. Install Python, virtual environment tools, Git, Nginx web server, and Certbot for SSL
sudo apt install -y python3-pip python3-venv git nginx certbot python3-certbot-nginx

# 3. Create a 4GB Swap file so your 5 Django apps do not run out of RAM memory
sudo fallocate -l 4G /swapfile

# 4. Restrict permissions so only the root user can access the swap file
sudo chmod 600 /swapfile

# 5. Format the file as swap space
sudo mkswap /swapfile

# 6. Turn on the swap space immediately
sudo swapon /swapfile

# 7. Make sure swap remains active automatically after every server reboot
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 8. Check your memory status to confirm 4.0Gi of swap is active
free -h
```

---

### Step 4: Create 5 Application Directories

```bash
# Give your 'ubuntu' user ownership of the web directory
sudo mkdir -p /var/www
sudo chown -R ubuntu:ubuntu /var/www

# Create a clean folder for each of your 5 Django applications
mkdir -p /var/www/app1
mkdir -p /var/www/app2
mkdir -p /var/www/app3
mkdir -p /var/www/app4
mkdir -p /var/www/app5
```

#### Set up App 1 (Teams Video & Calling Platform):
```bash
# Navigate to the app1 directory
cd /var/www/app1

# Clone your project from GitHub (replace with your repo URL)
git clone <YOUR_GITHUB_REPO_URL> .

# Create a dedicated Python virtual environment for App 1
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install project dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Gather all static CSS and JS files into 'staticfiles/' for Nginx
python manage.py collectstatic --noinput

# Deactivate the virtual environment
deactivate
```
*(Repeat this exact setup for `app2`, `app3`, `app4`, and `app5`).*

---

### Step 5: Create Systemd Services (Keep Apps Running 24/7)

Create a systemd service file for each app so Linux automatically starts them on boot and restarts them if they ever encounter an error.

#### Service 1: `/etc/systemd/system/app1.service` (Port 8000)
```bash
sudo nano /etc/systemd/system/app1.service
```
Paste this configuration:
```ini
[Unit]
Description=App 1: Teams Call & Video (Port 8000)
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/app1
Environment="PATH=/var/www/app1/venv/bin"
# Runs Daphne on Port 8000 to handle WebSockets
ExecStart=/var/www/app1/venv/bin/daphne -b 127.0.0.1 -p 8000 config.asgi:application
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```
*(Press `Ctrl+O` then `Enter` to save, and `Ctrl+X` to exit).*

#### Service 2: `/etc/systemd/system/app2.service` (Port 8001)
```bash
sudo nano /etc/systemd/system/app2.service
```
```ini
[Unit]
Description=App 2: Django App (Port 8001)
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/app2
Environment="PATH=/var/www/app2/venv/bin"
ExecStart=/var/www/app2/venv/bin/daphne -b 127.0.0.1 -p 8001 config.asgi:application
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

*(Create `app3.service` on Port 8002, `app4.service` on Port 8003, and `app5.service` on Port 8004 following the exact same pattern).*

#### Activate all 5 services:
```bash
# 1. Reload the systemd manager to register your new service files
sudo systemctl daemon-reload

# 2. Enable all 5 apps so they start automatically when the server boots
sudo systemctl enable app1 app2 app3 app4 app5

# 3. Start all 5 apps right now
sudo systemctl start app1 app2 app3 app4 app5

# 4. Check the status of all 5 apps (all should say 'active (running)' in green)
sudo systemctl status app1 app2 app3 app4 app5 --no-pager
```

---

### Step 6: Configure Nginx Reverse Proxy (Route Domains to Ports)

```bash
# 1. Remove the default Nginx welcome page
sudo rm -f /etc/nginx/sites-enabled/default

# 2. Create the multi-app configuration file
sudo nano /etc/nginx/sites-available/5-django-apps.conf
```

Paste this configuration (replace `yourdomain.com` with your real domain):
```nginx
# --- APP 1: Teams Video/Call (Port 8000 with WebSockets) ---
server {
    listen 80;
    server_name teams.yourdomain.com;
    client_max_body_size 50M;

    location /static/ {
        alias /var/www/app1/staticfiles/;
        expires 30d;
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;

        # WebSocket headers (Crucial for real-time video/audio calling)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
    }
}

# --- APP 2: Django App 2 (Port 8001) ---
server {
    listen 80;
    server_name app2.yourdomain.com;
    client_max_body_size 50M;

    location /static/ {
        alias /var/www/app2/staticfiles/;
        expires 30d;
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# --- APP 3: Django App 3 (Port 8002) ---
server {
    listen 80;
    server_name app3.yourdomain.com;
    client_max_body_size 50M;

    location /static/ {
        alias /var/www/app3/staticfiles/;
        expires 30d;
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:8002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# --- APP 4: Django App 4 (Port 8003) ---
server {
    listen 80;
    server_name app4.yourdomain.com;
    client_max_body_size 50M;

    location /static/ {
        alias /var/www/app4/staticfiles/;
        expires 30d;
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:8003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# --- APP 5: Main Website (Port 8004) ---
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    client_max_body_size 50M;

    location /static/ {
        alias /var/www/app5/staticfiles/;
        expires 30d;
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:8004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and activate the Nginx configuration:
```bash
# 1. Enable the configuration file in Nginx
sudo ln -s /etc/nginx/sites-available/5-django-apps.conf /etc/nginx/sites-enabled/

# 2. Test Nginx for syntax errors (Must output 'syntax is ok' and 'test is successful')
sudo nginx -t

# 3. Reload Nginx to activate your changes
sudo systemctl reload nginx
```

---

### Step 7: Free SSL / HTTPS for All 5 Domains in 1 Command!

Run Certbot once to issue free Let's Encrypt SSL certificates for all 5 subdomains:

```bash
# Run Certbot (replace with your real domains)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d teams.yourdomain.com -d app2.yourdomain.com -d app3.yourdomain.com -d app4.yourdomain.com
```

- When asked, enter your email address.
- Type `Y` to agree to the Terms of Service.
- Certbot will automatically verify ownership via Hostinger DNS and configure HTTPS redirects on all 5 sites.
- Certificates will renew automatically forever!
