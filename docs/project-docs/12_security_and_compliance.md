# 12 — Security, Encryption & Privacy

## 12.1 End-to-End Media Encryption (DTLS/SRTP)
All audio and video media streams transmitted between participants in Teams are encrypted using the standard WebRTC security framework:
1. **DTLS (Datagram Transport Layer Security):** Handles the cryptographic key exchange handshake between peer browsers.
2. **SRTP (Secure Real-time Transport Protocol):** Encrypts every voice packet and video frame using AES cipher encryption before it leaves the client network interface.
3. **No Man-in-the-Middle (MITM):** Because media is transmitted directly peer-to-peer (Mesh), audio and video packets never touch the server disk or memory, ensuring end-to-end privacy.

## 12.2 In-Call Chat & Web Security
- **Cross-Site Scripting (XSS) Sanitization:** All incoming chat messages are sanitized using Python's `html.escape()` on the server side in `meeting/consumers.py` before being stored in the database or broadcast to peers. Client templates render text through safe DOM nodes (`textContent`).
- **Cross-Site Request Forgery (CSRF):** Standard Django CSRF middleware protects all forms (`landing`, `login`, `register`, `dashboard`).
- **Session Security:** Host authentication sessions are protected by HTTP-only, secure cookies.
- **SQL Injection Prevention:** All database queries utilize Django's built-in parameterized ORM layer, preventing SQL injection vulnerabilities.

## 12.3 Privacy by Design
- **No Third-Party Trackers:** Teams contains zero third-party telemetry, advertising SDKs, or external analytics scripts.
- **Local Recording Only:** Call recording takes place 100% locally in the participant's browser via the MediaStream Recording API. Recording files are saved directly to the user's local disk, ensuring that meeting audio/video is never stored on external cloud servers.
