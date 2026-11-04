# Codebase Inventory — Teams v1.0
_Inventoried from real codebase: 2026-11-03_

## 1. Core Framework & Architecture
- **Language:** Python 3.10+ / 3.15
- **Web Framework:** Django 6.1.2
- **Real-Time Layer:** Channels 4.3.2 + Daphne 4.2.3 (ASGI)
- **Database:** SQLite (default / dev) with PostgreSQL readiness

## 2. Source Code Modules
| File | Lines | Purpose |
|---|---|---|
| `config/settings.py` | 85 | Project configuration, Daphne/Channels setup, staticfiles, auth rules |
| `config/asgi.py` | 24 | ASGI ProtocolTypeRouter: HTTP (`get_asgi_application`) + WebSocket (`AuthMiddlewareStack`) |
| `config/urls.py` | 8 | Top-level URL routing |
| `meeting/models.py` | 51 | `Room`, `Participant`, `ChatMessage` data models + slug generator |
| `meeting/consumers.py` | 170 | `MeetingConsumer`: async WebSocket signaling, chat, moderation |
| `meeting/views.py` | 134 | 10 view functions: Landing, Login, Register, Dashboard, Lobby, Room, Ended, APIs |
| `meeting/urls.py` | 16 | Route definitions for all 7 screens and API endpoints |
| `meeting/tests.py` | 150 | 17 automated tests covering models, views, and WebSocket signaling |
| `static/css/theme.css` | 230 | Dark Slate Glass design tokens, reset, typography, buttons, cards |
| `static/css/meeting.css` | 380 | Video grid, floating toolbar, drawers, badges, VU meter |
| `static/js/lobby.js` | 200 | Pre-join device enumeration, Web Audio VU meter, stream preview |
| `static/js/meeting.js` | 550 | WebRTC mesh engine, screen share, recording, chat, moderation |
| `deploy/` | 4 files | Systemd service, Nginx configuration, update automation script |
