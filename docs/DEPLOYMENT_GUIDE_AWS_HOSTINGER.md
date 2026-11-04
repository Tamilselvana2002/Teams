# 🌐 Master Guide: Deploying 4+ Applications on One AWS EC2 Server with Hostinger Domain

> **Architecture Overview:** You can run **4 or more distinct applications** (Django/Python, Node.js/Next.js, FastAPI, PHP, Static HTML) simultaneously on a single AWS EC2 instance. Traffic is routed cleanly using **Hostinger Subdomains**, **Nginx Reverse Proxy**, and **Let's Encrypt SSL (HTTPS)**.

---

## 🏛️ High-Level Architecture Diagram

```
                       Hostinger DNS Zone
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
   teams.yourdomain.com   app2.yourdomain.com   api.yourdomain.com
            │                  │                  │
            └──────────────────┼──────────────────┘
                               │
                     AWS Elastic IP (Static)
                               │
                               ▼
               AWS EC2 Linux Server (Ubuntu 22.04/24.04)
                     [Ports 80 & 443 Open]
                               │
                               ▼
                    Master Nginx Reverse Proxy
        (Inspects incoming domain name & routes accordingly)
          ├── teams.yourdomain.com ──► 127.0.0.1:8000 (Daphne/Channels)
          ├── app2.yourdomain.com  ──► 127.0.0.1:3000 (Node / Next.js)
          ├── api.yourdomain.com   ──► 127.0.0.1:5000 (FastAPI / Flask)
          └── yourdomain.com       ──► 127.0.0.1:8080 (App 4 / Static)
```

---

## 📋 Table of Contents
1. [Step 1: AWS EC2 & Elastic IP Setup](#step-1-aws-ec2--elastic-ip-setup)
2. [Step 2: Hostinger DNS Configuration](#step-2-hostinger-dns-configuration)
3. [Step 3: Server Preparation & Swap Memory](#step-3-server-preparation--swap-memory)
4. [Step 4: Running 4+ Apps in Background (Systemd)](#step-4-running-4-apps-in-background-systemd)
5. [Step 5: Master Nginx Reverse Proxy Setup](#step-5-master-nginx-reverse-proxy-setup)
6. [Step 6: Free SSL / HTTPS Setup with Certbot](#step-6-free-ssl--https-setup-with-certbot)
7. [Step 7: Maintenance & Automated Updates](#step-7-maintenance--automated-updates)

---

## Step 1: AWS EC2 & Elastic IP Setup

### 1.1 Choose Your EC2 Instance
- **Operating System:** Ubuntu 22.04 LTS or Ubuntu 24.04 LTS (64-bit x86).
- **Instance Size Recommendation for 4+ apps:**
  - `t3.small` (2 vCPU, 2 GB RAM) — Good for low-to-medium traffic.
  - `t3.medium` (2 vCPU, 4 GB RAM) — Recommended for production with multiple concurrent apps.
- **Storage:** 20 GB – 40 GB gp3 SSD.

### 1.2 Configure EC2 Security Group (Firewall)
In the AWS Console -> **EC2** -> **Security Groups** -> Edit **Inbound Rules**:
| Type | Protocol | Port Range | Source | Description |
|---|---|---|---|---|
| SSH | TCP | `22` | My IP (or `0.0.0.0/0`) | Remote terminal access |
| HTTP | TCP | `80` | `0.0.0.0/0` | Web traffic (Let's Encrypt / HTTP) |
| HTTPS | TCP | `443` | `0.0.0.0/0` | Secure SSL web traffic |

### 1.3 Allocate an Elastic IP (Critical!)
By default, EC2 changes its public IP address whenever you stop or restart the server. An **Elastic IP** provides a permanent static IP address.
1. In EC2 Dashboard, go to **Network & Security** -> **Elastic IPs**.
2. Click **Allocate Elastic IP address** -> click **Allocate**.
3. Select your new IP -> click **Actions** -> **Associate Elastic IP address**.
4. Choose your running EC2 instance and click **Associate**.
5. *Note down this Public IP* (e.g. `13.234.56.78`).

---

## Step 2: Hostinger DNS Configuration

1. Log in to your **Hostinger Control Panel (hPanel)**.
2. Go to **Domains** -> Click **Manage** on your domain (e.g., `yourdomain.com`).
3. Click **DNS / Nameservers** in the left sidebar.
4. Add **A Records** pointing to your **AWS Elastic IP**:

| Type | Name (Host) | Points To (IP Value) | TTL | Purpose |
|---|---|---|---|---|
| `A` | `@` | `YOUR_AWS_ELASTIC_IP` | `300` | Root domain (`yourdomain.com`) |
| `A` | `www` | `YOUR_AWS_ELASTIC_IP` | `300` | WWW redirect |
| `A` | `teams` | `YOUR_AWS_ELASTIC_IP` | `300` | App 1: Teams (`teams.yourdomain.com`) |
| `A` | `app2` | `YOUR_AWS_ELASTIC_IP` | `300` | App 2 (`app2.yourdomain.com`) |
| `A` | `api` | `YOUR_AWS_ELASTIC_IP` | `300` | App 3 (`api.yourdomain.com`) |
| `A` | `app4` | `YOUR_AWS_ELASTIC_IP` | `300` | App 4 (`app4.yourdomain.com`) |

*(Optional Pro-Tip: You can also create a single Wildcard record: Type `A`, Name `*`, pointing to your AWS IP. This will automatically route any subdomain to your server).*

> **DNS Propagation:** Hostinger DNS records typically take between 2 to 15 minutes to propagate.

---

## Step 3: Server Preparation & Swap Memory

Connect to your AWS server from your computer:
```bash
ssh -i "your-key.pem" ubuntu@YOUR_AWS_ELASTIC_IP
```

### 3.1 Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv git nginx certbot python3-certbot-nginx ufw curl
```

### 3.2 Configure 2GB/4GB Swap Memory (Prevents OOM Crashes)
When hosting 4+ apps on a single instance, memory spikes can crash applications. A swap file acts as virtual RAM buffer:
```bash
# Create a 2GB swap file (or 4G for larger servers)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent across reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify swap is active
free -h
```

### 3.3 Configure Server Firewall (UFW)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

---

## Step 4: Running 4+ Apps in Background (Systemd)

Organize your applications under `/var/www/` or `/home/ubuntu/apps/`:
```bash
sudo mkdir -p /var/www
sudo chown -R ubuntu:ubuntu /var/www
```

Each application runs on its own internal port:
- **App 1 (Teams — Django Channels):** `http://127.0.0.1:8000`
- **App 2 (Node / Next.js / React):** `http://127.0.0.1:3000`
- **App 3 (FastAPI / Flask Python):** `http://127.0.0.1:5000`
- **App 4 (Any other web app / Go / Docker):** `http://127.0.0.1:8080`

### 4.1 Setup App 1: Teams (Django + Channels + Daphne)
Clone or copy the Teams project:
```bash
cd /var/www
git clone <your-repo-url> teams
cd /var/www/teams

# Setup Python Virtual Environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run migrations and collect static files
python manage.py migrate
python manage.py collectstatic --noinput
```

Create Systemd Service for Teams:
```bash
sudo nano /etc/systemd/system/teams.service
```
Paste this configuration:
```ini
[Unit]
Description=Teams Real-Time Video Call Platform (Daphne ASGI)
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/var/www/teams
Environment="PATH=/var/www/teams/venv/bin"
ExecStart=/var/www/teams/venv/bin/daphne -b 127.0.0.1 -p 8000 config.asgi:application
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```
Enable and start the Teams service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable teams
sudo systemctl start teams
sudo systemctl status teams
```

### 4.2 Setup App 2: Node.js / Next.js App
Create Systemd Service:
```bash
sudo nano /etc/systemd/system/app2.service
```
```ini
[Unit]
Description=Node Application (App 2)
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/app2
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl enable app2 && sudo systemctl start app2
```

### 4.3 Setup App 3: FastAPI / Flask
Create Systemd Service:
```bash
sudo nano /etc/systemd/system/app3.service
```
```ini
[Unit]
Description=Python FastAPI / Flask (App 3)
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/app3
Environment="PATH=/var/www/app3/venv/bin"
ExecStart=/var/www/app3/venv/bin/uvicorn main:app --host 127.0.0.1 --port 5000
Restart=always

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl enable app3 && sudo systemctl start app3
```

---

## Step 5: Master Nginx Reverse Proxy Setup

Nginx acts as the traffic controller. It inspects the incoming domain header and passes the traffic to the corresponding internal port.

Remove default configuration:
```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

Create the master multi-app configuration:
```bash
sudo nano /etc/nginx/sites-available/multi-apps.conf
```

Paste the following:
```nginx
# ==============================================================================
# APP 1: Teams (Django + WebRTC Channels WebSockets)
# ==============================================================================
server {
    listen 80;
    server_name teams.yourdomain.com;

    client_max_body_size 50M;

    # Static files served directly by Nginx for maximum speed
    location /static/ {
        alias /var/www/teams/staticfiles/;
        expires 30d;
        access_log off;
    }

    # Proxy HTTP and WebSockets to Daphne
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;

        # WebSocket support headers (MANDATORY for real-time video/audio signaling)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400; # Keep WebSockets open
    }
}

# ==============================================================================
# APP 2: Node / Next.js
# ==============================================================================
server {
    listen 80;
    server_name app2.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ==============================================================================
# APP 3: Python API (FastAPI / Flask)
# ==============================================================================
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ==============================================================================
# APP 4: Root Domain / Marketing / Additional App
# ==============================================================================
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/multi-apps.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 6: Free SSL / HTTPS Setup with Certbot

Let's Encrypt provides free, auto-renewing SSL certificates. Run Certbot once for all your domains:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d teams.yourdomain.com -d app2.yourdomain.com -d api.yourdomain.com
```

- Enter your email address for renewal notifications.
- Agree to the Terms of Service.
- Certbot will automatically verify ownership with Hostinger DNS, configure SSL certificates, and update your Nginx file to automatically redirect all `http://` traffic to secure `https://`!

### Test Auto-Renewal
Certbot automatically installs a cron timer to renew certificates before they expire:
```bash
sudo certbot renew --dry-run
```

---

## Step 7: Maintenance & Zero-Downtime Updates

Whenever you make code updates to Teams or any app, use this quick deployment loop:

```bash
cd /var/www/teams
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart teams
```
*(A ready-to-run automation script `deploy/deploy.sh` is provided in the repository).*
