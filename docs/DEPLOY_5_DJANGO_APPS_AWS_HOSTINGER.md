# 🚀 Beginner-Friendly Guide: Deploying 5 Django Applications on 1 AWS Server with Hostinger Domain

> **Goal:** Run **5 different Django websites/apps** on a **single AWS EC2 server** using subdomains from your **Hostinger domain**, with **free SSL (HTTPS)** for every app.
>
> Even if you are a complete beginner to Linux and AWS, follow these steps one by one. Every command has a comment explaining what it does.

---

## 🗺️ How It Works (The Simple Idea)

Imagine your single AWS server is an apartment building:
1. **Hostinger Domain** is the street address (`yourdomain.com`).
2. **Subdomains** are the apartment door numbers:
   - `teams.yourdomain.com` ➔ Door 1 (Teams App on Port 8000)
   - `app2.yourdomain.com`  ➔ Door 2 (App 2 on Port 8001)
   - `app3.yourdomain.com`  ➔ Door 3 (App 3 on Port 8002)
   - `app4.yourdomain.com`  ➔ Door 4 (App 4 on Port 8003)
   - `yourdomain.com`        ➔ Door 5 (Main App on Port 8004)
3. **Nginx** is the security guard standing at the front entrance (Port 80/443). When visitors arrive, Nginx looks at the domain they typed and instantly sends them to the right door (Port 8000, 8001, etc.).

---

## 📋 Step 1: AWS Setup (Security Group & Elastic IP)

### 1.1 Inbound Firewall Rules (Security Group)
In your AWS Console -> **EC2** -> **Security Groups** -> Click on your Security Group -> **Edit Inbound Rules**:
Add these 3 rules:
- **SSH (Port 22):** Source: `Anywhere-IPv4` (`0.0.0.0/0`) — *Lets you connect terminal*
- **HTTP (Port 80):** Source: `Anywhere-IPv4` (`0.0.0.0/0`) — *Lets visitors browse your sites*
- **HTTPS (Port 443):** Source: `Anywhere-IPv4` (`0.0.0.0/0`) — *Lets visitors browse securely with SSL*

### 1.2 Get a Permanent Static IP (Elastic IP)
*Warning: If you restart an EC2 server, its public IP normally changes! An Elastic IP prevents this.*
1. In the EC2 left sidebar, click **Elastic IPs** (under Network & Security).
2. Click **Allocate Elastic IP address** -> click **Allocate**.
3. Click **Actions** -> **Associate Elastic IP address**.
4. Choose your running EC2 instance and click **Associate**.
5. Copy your new IP address (for example: `13.234.56.78`). We will call this `YOUR_AWS_IP`.

---

## 📋 Step 2: Hostinger DNS Setup (Point Subdomains to AWS)

1. Log into your **Hostinger Account**.
2. Click **Domains** -> Click **Manage** on your domain (e.g. `yourdomain.com`).
3. Click **DNS / Nameservers** in the left sidebar menu.
4. Scroll down to **Manage DNS Records**. Add these **A Records** one by one:

| Type | Name (Host) | Points To (Value) | TTL | Purpose |
|---|---|---|---|---|
| `A` | `@` | `YOUR_AWS_IP` | `300` | Main site: `yourdomain.com` (App 5) |
| `A` | `www` | `YOUR_AWS_IP` | `300` | Main site with www |
| `A` | `teams` | `YOUR_AWS_IP` | `300` | Subdomain for App 1: `teams.yourdomain.com` |
| `A` | `app2` | `YOUR_AWS_IP` | `300` | Subdomain for App 2: `app2.yourdomain.com` |
| `A` | `app3` | `YOUR_AWS_IP` | `300` | Subdomain for App 3: `app3.yourdomain.com` |
| `A` | `app4` | `YOUR_AWS_IP` | `300` | Subdomain for App 4: `app4.yourdomain.com` |

*(Note: DNS records take 5 to 15 minutes to become active).*

---

## 📋 Step 3: Connect to AWS Server & Initial Setup

Open **PowerShell** or **Terminal** on your computer, navigate to where your AWS `.pem` key file is saved, and log in:

```bash
# Connect to your AWS Ubuntu server (replace with your key file and your AWS Elastic IP)
ssh -i "my-aws-key.pem" ubuntu@YOUR_AWS_IP
```

Once you see `ubuntu@ip-...:~$`, run these commands:

### 3.1 Update the Server
```bash
# Update package list and upgrade existing software to the latest versions
sudo apt update && sudo apt upgrade -y

# Install essential tools: Python, virtual environment tool, Nginx web server, Git, and Certbot for SSL
sudo apt install -y python3-pip python3-venv git nginx certbot python3-certbot-nginx ufw
```

### 3.2 Add 4GB Swap Space (CRITICAL for 5 Apps!)
Running 5 Django apps simultaneously requires memory. If RAM gets full, the server will freeze. A **Swap file** gives your server 4GB of emergency virtual RAM on your SSD disk:

```bash
# 1. Create a 4 Gigabyte file on disk
sudo fallocate -l 4G /swapfile

# 2. Restrict permissions so only the system can read it
sudo chmod 600 /swapfile

# 3. Format the file as virtual Swap RAM
sudo mkswap /swapfile

# 4. Turn the swap file on
sudo swapon /swapfile

# 5. Make sure it stays on automatically even if the server reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 6. Verify your RAM and Swap (you should see 4.0Gi in the Swap row)
free -h
```

---

## 📋 Step 4: Prepare the 5 Django Application Folders

We will store all 5 apps under the standard web directory: `/var/www/`.

```bash
# Give your 'ubuntu' user permission to write files in /var/www/
sudo mkdir -p /var/www
sudo chown -R ubuntu:ubuntu /var/www

# Create a clean folder for each of the 5 apps
mkdir -p /var/www/app1
mkdir -p /var/www/app2
mkdir -p /var/www/app3
mkdir -p /var/www/app4
mkdir -p /var/www/app5
```

### 4.1 Setup App 1 (Teams Real-Time Platform)
```bash
# Navigate to app1 directory
cd /var/www/app1

# Clone your GitHub repository (or copy your project files here)
git clone <YOUR_GIT_REPO_URL> .

# Create an isolated Python virtual environment named 'venv'
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install project dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Gather static CSS, JS, and image files into a central folder for Nginx
python manage.py collectstatic --noinput

# Exit the virtual environment
deactivate
```

*(Repeat this exact same process for `app2`, `app3`, `app4`, and `app5`).*

### 4.2 Important: Update `ALLOWED_HOSTS` in Django `settings.py`
In each Django application's `settings.py`, make sure the corresponding domain is allowed:
- In `app1` (`teams`): `ALLOWED_HOSTS = ['teams.yourdomain.com', '127.0.0.1', 'localhost']`
- In `app2`: `ALLOWED_HOSTS = ['app2.yourdomain.com', '127.0.0.1', 'localhost']`
- In `app3`: `ALLOWED_HOSTS = ['app3.yourdomain.com', '127.0.0.1', 'localhost']`
- In `app4`: `ALLOWED_HOSTS = ['app4.yourdomain.com', '127.0.0.1', 'localhost']`
- In `app5`: `ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com', '127.0.0.1', 'localhost']`

---

## 📋 Step 5: Keep All 5 Apps Running 24/7 (Systemd Services)

Linux uses **Systemd** to run programs in the background. If an app crashes or the server reboots, Systemd restarts the app within 3 seconds automatically.

### Service 1: `app1.service` (Teams with Daphne for WebSockets)
```bash
# Create the service configuration file
sudo nano /etc/systemd/system/app1.service
```
Paste this configuration:
```ini
[Unit]
Description=App 1: Teams Real-Time Video & Chat (Port 8000)
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/app1
Environment="PATH=/var/www/app1/venv/bin"
# Runs Daphne ASGI server on local Port 8000
ExecStart=/var/www/app1/venv/bin/daphne -b 127.0.0.1 -p 8000 config.asgi:application
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```
*(Press `Ctrl + O` then `Enter` to save, and `Ctrl + X` to exit).*

---

### Service 2: `app2.service` (Port 8001)
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

---

### Service 3: `app3.service` (Port 8002)
```bash
sudo nano /etc/systemd/system/app3.service
```
```ini
[Unit]
Description=App 3: Django App (Port 8002)
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/app3
Environment="PATH=/var/www/app3/venv/bin"
ExecStart=/var/www/app3/venv/bin/daphne -b 127.0.0.1 -p 8002 config.asgi:application
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

---

### Service 4: `app4.service` (Port 8003)
```bash
sudo nano /etc/systemd/system/app4.service
```
```ini
[Unit]
Description=App 4: Django App (Port 8003)
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/app4
Environment="PATH=/var/www/app4/venv/bin"
ExecStart=/var/www/app4/venv/bin/daphne -b 127.0.0.1 -p 8003 config.asgi:application
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

---

### Service 5: `app5.service` (Port 8004)
```bash
sudo nano /etc/systemd/system/app5.service
```
```ini
[Unit]
Description=App 5: Main Django Website (Port 8004)
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/app5
Environment="PATH=/var/www/app5/venv/bin"
ExecStart=/var/www/app5/venv/bin/daphne -b 127.0.0.1 -p 8004 config.asgi:application
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

---

### 5.1 Enable and Start All 5 Apps
Run these commands to tell Linux to activate all 5 services:

```bash
# 1. Reload the systemd manager to detect all new service files
sudo systemctl daemon-reload

# 2. Tell Linux to auto-start all 5 apps on every server reboot
sudo systemctl enable app1 app2 app3 app4 app5

# 3. Start all 5 apps right now
sudo systemctl start app1 app2 app3 app4 app5

# 4. Check the status of all 5 apps (you should see green 'active (running)' for each)
sudo systemctl status app1 app2 app3 app4 app5 --no-pager
```

---

## 📋 Step 6: Configure Nginx to Route Domains to the 5 Apps

Now we configure Nginx so that when someone visits `teams.yourdomain.com`, they go to Port 8000, `app2.yourdomain.com` goes to Port 8001, and so on.

```bash
# 1. Remove the default welcome page of Nginx
sudo rm -f /etc/nginx/sites-enabled/default

# 2. Create our master configuration file
sudo nano /etc/nginx/sites-available/5-django-apps.conf
```

Paste this entire configuration (replace `yourdomain.com` with your real Hostinger domain):

```nginx
# ==============================================================================
# APP 1: Teams Video/Call App (Port 8000 with WebSockets)
# ==============================================================================
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

        # WebSocket support (Mandatory for real-time video/audio calling)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
    }
}

# ==============================================================================
# APP 2: Django App 2 (Port 8001)
# ==============================================================================
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

# ==============================================================================
# APP 3: Django App 3 (Port 8002)
# ==============================================================================
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

# ==============================================================================
# APP 4: Django App 4 (Port 8003)
# ==============================================================================
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

# ==============================================================================
# APP 5: Main Website (Port 8004)
# ==============================================================================
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

Now enable the configuration and test it:
```bash
# 1. Enable the configuration by creating a link in sites-enabled
sudo ln -s /etc/nginx/sites-available/5-django-apps.conf /etc/nginx/sites-enabled/

# 2. Test Nginx for any syntax errors (You must see 'syntax is ok' and 'test is successful')
sudo nginx -t

# 3. Reload Nginx to activate the changes
sudo systemctl reload nginx
```

---

## 📋 Step 7: Free SSL / HTTPS for All 5 Domains in 1 Command!

Let's Encrypt provides 100% free SSL certificates. You can secure all 5 domains at once:

```bash
# Run Certbot (replace with your real domain names)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d teams.yourdomain.com -d app2.yourdomain.com -d app3.yourdomain.com -d app4.yourdomain.com
```

- When prompted, enter your email address (for expiration warning alerts).
- Type `Y` to agree to the Terms of Service.
- Certbot will verify each domain through Hostinger DNS and automatically reconfigure your Nginx file to redirect all visitors to secure `https://`!

### Test Auto-Renewal (Certificates renew automatically forever)
```bash
# Test that automatic renewal works
sudo certbot renew --dry-run
```

---

## 📋 Cheat Sheet: Useful Commands to Remember

```bash
# Check if all 5 apps are running
sudo systemctl status app1 app2 app3 app4 app5

# Restart an app after you change Python code
sudo systemctl restart app1

# View live error logs if an app has a bug
sudo journalctl -u app1 -f

# Check server memory usage
free -h

# Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```
