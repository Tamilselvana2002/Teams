# 07 — API & WebSocket Protocol Reference

## 7.1 HTTP Routes & Endpoints

| Method | URL Pattern | View Name | Description |
|---|---|---|---|
| `GET` / `POST` | `/` | `landing` | Public landing page with room join code form. |
| `GET` / `POST` | `/login/` | `host_login` | Host authentication page with username/password. |
| `GET` / `POST` | `/register/` | `host_register` | Host signup page with account creation. |
| `GET` | `/logout/` | `host_logout` | Destroys host session and redirects to home. |
| `GET` | `/dashboard/` | `host_dashboard` | Host management workspace (requires `@login_required`). |
| `POST` | `/api/rooms/create/` | `create_room` | Generates a new unique room slug and redirects. |
| `GET` | `/api/rooms/<slug>/` | `api_room_info` | Returns JSON status and metadata for a room. |
| `GET` | `/room/<slug>/lobby/` | `room_lobby` | Pre-join device test and name configuration. |
| `GET` | `/room/<slug>/` | `meeting_room` | Live WebRTC video conference interface. |
| `GET` | `/room/<slug>/ended/` | `meeting_ended` | Call conclusion screen with rejoin link. |

---

## 7.2 WebSocket Signaling Protocol

- **Endpoint:** `ws://<domain>/ws/room/<slug>/` (or `wss://` in production)
- **Protocol:** JSON message passing over RFC 6455 WebSockets.

### Client-to-Server Actions
```json
// 1. Announce entry into meeting
{ "action": "join", "peer_id": "peer_abc123", "display_name": "Jordan", "is_host": true }

// 2. Transmit SDP Offer to a specific peer
{ "action": "signal-offer", "target_peer_id": "peer_xyz789", "sdp": { "type": "offer", "sdp": "..." } }

// 3. Return SDP Answer to offering peer
{ "action": "signal-answer", "target_peer_id": "peer_xyz789", "sdp": { "type": "answer", "sdp": "..." } }

// 4. Relay ICE candidate
{ "action": "ice-candidate", "target_peer_id": "peer_xyz789", "candidate": { ... } }

// 5. Send in-call chat message
{ "action": "chat-message", "text": "Can everyone see my shared screen?" }

// 6. Broadcast speaking state (for active speaker ring)
{ "action": "speaking-state", "is_speaking": true }

// 7. Host moderation: Mute a peer remotely
{ "action": "peer-mute", "target_peer_id": "peer_xyz789" }

// 8. Host moderation: Remove a participant
{ "action": "peer-kick", "target_peer_id": "peer_xyz789" }

// 9. Host moderation: Terminate meeting for all
{ "action": "room-ended" }
```

### Server Broadcast Actions
```json
// Participant arrival notification
{ "action": "user-joined", "peer_id": "peer_abc123", "display_name": "Jordan", "is_host": false, "participants": [...] }

// Participant exit notification
{ "action": "user-left", "peer_id": "peer_abc123", "display_name": "Jordan" }

// Broadcast chat message
{ "action": "chat-message", "sender_name": "Jordan", "sender_peer_id": "peer_abc123", "text": "Hello!", "timestamp": "14:32" }

// Remote mute instruction delivered to target peer
{ "action": "force-mute", "target_peer_id": "peer_xyz789", "initiated_by": "Host" }

// Ejection notice delivered to kicked peer
{ "action": "force-kick", "target_peer_id": "peer_xyz789", "reason": "Removed by meeting host" }

// Meeting ended notice delivered to all peers
{ "action": "meeting-ended", "reason": "Host ended the meeting for all participants" }
```
