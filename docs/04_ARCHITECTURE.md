# System Architecture Specification — Teams
_Author: 04 Chief Technology Officer (Engineering Team)_
_Status: APPROVED (Ready for Build)_
_Date: 2026-11-02_

---

## 1. Architecture Overview

Teams is architected as an asynchronous, high-performance real-time web application using **Django** and **Django Channels** on ASGI, serving a modern, responsive single-page meeting interface built with standard HTML5, CSS3, and ES6+ JavaScript.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │ HTML5 / CSS3 Dark UI  │       │   WebRTC Media Engine │  │
│  │ (Lobby / Meeting Grid)│       │  (Mic/Cam/Screen/Rec) │  │
│  └───────────┬───────────┘       └───────────┬───────────┘  │
│              │ HTTP Requests                 │ P2P Audio/Vid│
└──────────────┼───────────────────────────────┼──────────────┘
               │                               │ WebRTC DTLS/SRTP
               ▼                               ▼
┌──────────────────────────────┐       ┌───────────────────────┐
│     Django ASGI / Daphne     │       │     Remote Peers      │
│  ┌────────────────────────┐  │       │ (Direct Mesh & STUN)  │
│  │ Standard Django Views  │  │       └───────────────────────┘
│  │ (Auth, Rooms, Pages)   │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ Channels Consumer WS   │  │
│  │ (WebRTC Signaling,     │  │
│  │  Chat, Moderation)     │  │
│  └────────────────────────┘  │
│              │               │
│              ▼               │
│    SQLite / Channel Layer    │
└──────────────────────────────┘
```

---

## 2. Technology Stack (LOCKED per DEC-000)

- **Backend Framework:** Django 5.x + Django Channels 4.x (ASGI async protocol router).
- **ASGI Server:** Daphne / Uvicorn.
- **Frontend Core:** Semantic HTML5 templates + Modular CSS (Custom Properties, Glassmorphism, CSS Grid) + Vanilla ES6+ JavaScript.
- **Real-Time Layer:** WebSockets (Signaling for WebRTC offer/answer/ICE + In-meeting Chat + Moderation actions).
- **Media Engine:** Browser WebRTC API (`RTCPeerConnection`, `getUserMedia`, `getDisplayMedia`, `MediaRecorder`).
- **Database:** SQLite (local development / test) / PostgreSQL ready.

---

## 3. Data Models (`models.py`)

### 3.1 Room Model
```python
class Room(models.Model):
    slug = models.CharField(max_length=16, unique=True, db_index=True)  # e.g., "mtg-492-xyz"
    title = models.CharField(max_length=120, default="Instant Meeting")
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name="hosted_rooms")
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
```

### 3.2 Participant Session Model
```python
class Participant(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="participants")
    peer_id = models.CharField(max_length=64, db_index=True)
    display_name = models.CharField(max_length=60)
    is_host = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
```

### 3.3 ChatMessage Model
```python
class ChatMessage(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="chat_messages")
    sender_name = models.CharField(max_length=60)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
```

---

## 4. WebRTC Signaling Protocol (WebSocket Contract)

WebSocket endpoint: `ws://<host>/ws/room/<slug>/`

### 4.1 Client-to-Server Messages
| Event Type | Payload | Description |
|---|---|---|
| `join` | `{peer_id, display_name, is_host}` | Announce arrival in meeting room |
| `signal-offer` | `{target_peer_id, sdp}` | Send WebRTC SDP Offer to a specific peer |
| `signal-answer`| `{target_peer_id, sdp}` | Return WebRTC SDP Answer to offering peer |
| `ice-candidate`| `{target_peer_id, candidate}`| Relay ICE candidate for NAT traversal |
| `chat-message` | `{text}` | Broadcast in-call chat message |
| `peer-mute` | `{target_peer_id}` | Host commands a peer to mute microphone |
| `peer-kick` | `{target_peer_id}` | Host ejects a peer from room |
| `room-ended` | `{}` | Host terminates meeting for all participants |

### 4.2 Server-to-Client Messages
| Event Type | Payload | Description |
|---|---|---|
| `user-joined` | `{peer_id, display_name, is_host, participants_list}` | Informs room of a new participant |
| `signal-offer`| `{sender_peer_id, sdp}` | Forwards SDP offer to target peer |
| `signal-answer`| `{sender_peer_id, sdp}` | Forwards SDP answer to target peer |
| `ice-candidate`| `{sender_peer_id, candidate}` | Forwards ICE candidate to target peer |
| `chat-message`| `{sender_name, text, timestamp}` | Broadcasts chat message to room |
| `user-left` | `{peer_id, display_name}` | Cleans up peer connection & tile |
| `force-mute` | `{}` | Delivered to peer to force local track mute |
| `force-kick` | `{reason}` | Delivered to kicked peer to terminate call |
| `meeting-ended`| `{reason}` | Broadcast when host terminates room |

---

## 5. Security Architecture
1. **DTLS/SRTP Encryption:** All audio, video, and screen-sharing peer media streams are natively encrypted end-to-end via WebRTC DTLS/SRTP.
2. **Sanitized Chat Input:** All chat text is HTML-escaped on server and client before DOM rendering to prevent XSS.
3. **Host Permission Verification:** Moderation signals (`peer-mute`, `peer-kick`, `room-ended`) are strictly validated against session host privileges on the Django consumer before processing.
4. **CSRF & Session Security:** Standard Django CSRF protection on forms and secure session cookies.
