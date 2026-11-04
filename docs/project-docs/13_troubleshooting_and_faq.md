# 13 — Troubleshooting & Frequently Asked Questions

## 13.1 Common Issues & Solutions

### 1. "Camera or Microphone Not Found"
- **Cause:** Browser permissions were denied, or another application (such as Zoom or Teams desktop) is locking the webcam hardware.
- **Fix:**
  1. Click the padlock icon on the left of your browser address bar.
  2. Toggle **Camera** and **Microphone** to **Allow**.
  3. Close any other software using your camera and refresh the page.

### 2. "WebSocket Connection Failed" or "Chat Not Sending"
- **Cause:** Daphne ASGI server is not running, or Nginx is missing WebSocket upgrade proxy headers.
- **Fix:**
  1. Ensure Daphne is running:
     ```bash
     sudo systemctl status app1
     ```
  2. Verify that `/etc/nginx/sites-available/5-django-apps.conf` includes:
     ```nginx
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection "upgrade";
     ```
  3. Reload Nginx: `sudo systemctl reload nginx`.

### 3. "Server Out of Memory / 502 Bad Gateway"
- **Cause:** Running multiple Django apps on a budget EC2 server without virtual memory (Swap).
- **Fix:** Enable the 4GB Swap file described in Chapter 10:
  ```bash
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  ```

### 4. "DisallowedHost at /" Error
- **Cause:** The domain accessing Django is not listed in `ALLOWED_HOSTS`.
- **Fix:** Open `config/settings.py` and ensure your domain is present:
  ```python
  ALLOWED_HOSTS = ['teams.yourdomain.com', '127.0.0.1', 'localhost']
  ```
  Then restart the service: `sudo systemctl restart app1`.

---

## 13.2 Frequently Asked Questions (FAQ)

**Q1: Can guests join on mobile phones without downloading an app?**  
*Yes.* Teams is fully responsive and runs inside mobile Safari (iOS) and mobile Chrome/Firefox (Android) directly via the browser.

**Q2: How many participants can join a meeting room?**  
The built-in WebRTC mesh architecture provides optimal quality for up to 6–8 simultaneous video callers per room, and up to 20 participants with audio-only low bandwidth mode.

**Q3: Where are recorded meetings stored?**  
Recordings are saved directly to the user's computer in `.webm` format. They are never sent to the server, protecting privacy and preventing storage costs.

**Q4: Can I use PostgreSQL instead of SQLite?**  
*Yes.* Django supports PostgreSQL out of the box. Simply update the `DATABASES` setting in `config/settings.py` and install `psycopg2-binary`.
