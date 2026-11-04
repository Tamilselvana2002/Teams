# 15 — Appendix & Beginner Command Cheat Sheet

## 15.1 Daily Linux & Server Management Commands

```bash
# ==============================================================================
# LINUX SYSTEM & MEMORY
# ==============================================================================

# Check how much RAM and Swap memory is free
free -h

# Check hard drive disk space usage
df -h

# Check live CPU and RAM usage by running processes (press 'q' to exit)
htop

# Reboot the server safely
sudo reboot


# ==============================================================================
# MANAGING THE 5 DJANGO APPLICATIONS (SYSTEMD)
# ==============================================================================

# Check if all 5 apps are running
sudo systemctl status app1 app2 app3 app4 app5

# Restart an app (for example after updating Python code or templates)
sudo systemctl restart app1

# Stop an app temporarily
sudo systemctl stop app1

# Start an app that was stopped
sudo systemctl start app1

# View live error logs for an app in real time (press Ctrl+C to stop viewing)
sudo journalctl -u app1 -f


# ==============================================================================
# MANAGING NGINX REVERSE PROXY
# ==============================================================================

# Test your Nginx configuration files for typos or syntax errors
sudo nginx -t

# Reload Nginx to apply new domain or routing changes without downtime
sudo systemctl reload nginx

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log


# ==============================================================================
# MANAGING DJANGO ON THE SERVER
# ==============================================================================

# Always navigate to the app directory first
cd /var/www/app1

# Activate the virtual environment before running Django commands
source venv/bin/activate

# Apply database migrations
python manage.py migrate

# Gather updated static CSS/JS files into staticfiles/
python manage.py collectstatic --noinput

# Create a new administrator account
python manage.py createsuperuser

# Deactivate the virtual environment when finished
deactivate
```

---

## 15.2 Helpful File Paths Summary

| File / Component | Path on AWS Server | Purpose |
|---|---|---|
| **App 1 (Teams)** | `/var/www/app1/` | Project source code |
| **App 2** | `/var/www/app2/` | Project source code |
| **App 3** | `/var/www/app3/` | Project source code |
| **App 4** | `/var/www/app4/` | Project source code |
| **App 5** | `/var/www/app5/` | Project source code |
| **Systemd Services** | `/etc/systemd/system/app1.service` | Background service unit |
| **Nginx Master Config** | `/etc/nginx/sites-available/5-django-apps.conf` | Multi-app domain routing |
| **Nginx Active Links** | `/etc/nginx/sites-enabled/5-django-apps.conf` | Symlink to activate config |
| **SSL Certificates** | `/etc/letsencrypt/live/yourdomain.com/` | Let's Encrypt keys & certs |
| **Virtual Memory File**| `/swapfile` | 4GB RAM overflow buffer |
