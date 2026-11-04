# Documentation Style Guide & Glossary — Teams v1.0

## 1. Editorial Standards
- **Voice & Tone:** Direct, professional, welcoming, and accessible to newcomers. Use active voice and second person ("Click **Join Meeting**", "Run `python manage.py migrate`").
- **Command Formatting:** Every terminal command must include an inline or preceding comment explaining *what* it does, *why* it is needed, and expected output.
- **UI References:** Buttons, input fields, and tab labels are formatted in **bold** exactly matching screen text (e.g., **Start Instant Meeting**, **Join**).
- **Code & Routes:** File paths, endpoints, and commands formatted in inline code (`/room/<slug>/`, `static/css/theme.css`).

## 2. Project Glossary
| Term | Exact Meaning |
|---|---|
| **Room** | A virtual meeting session identified by a unique slug (e.g. `abc-defg-hij`). |
| **Slug** | A 9-10 character URL-safe identifier for meeting rooms. |
| **Host** | A registered user who creates and has moderation control over a room. |
| **Guest** | A participant who joins a meeting directly via link without account creation. |
| **Lobby** | The pre-join screen where camera, microphone, and display name are verified. |
| **WebRTC** | Web Real-Time Communication API for peer-to-peer browser audio/video streaming. |
| **Signaling** | The exchange of network metadata (SDP Offer/Answer, ICE candidates) via WebSockets. |
| **Daphne** | The ASGI server responsible for running Django HTTP and WebSocket connections. |
| **Nginx** | The high-performance reverse proxy server routing domains to local application ports. |
| **Systemd** | The Linux background service manager keeping applications running 24/7. |
