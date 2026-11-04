# 03 — Users, Roles & Permissions

## 3.1 User Types

Teams enforces a hybrid authentication model designed for maximum accessibility while maintaining administrative authority:

```
┌────────────────────────────────────────────────────────┐
│                      Public Visitor                    │
│   - Can view landing page                              │
│   - Can enter room code to join lobby                  │
│   - Can register as Host or Sign In                    │
└───────────┬────────────────────────────────┬───────────┘
            │ Registers / Logs in            │ Joins with link
            ▼                                ▼
┌──────────────────────┐          ┌──────────────────────┐
│   Registered Host    │          │   Guest Participant  │
│ - Creates rooms      │          │ - Enters display name│
│ - Moderates calls    │          │ - Shares Audio/Video │
│ - Room dashboard     │          │ - Chat & Screen share│
└──────────────────────┘          └──────────────────────┘
```

### 1. Anonymous Visitor
- Unauthenticated visitor browsing the landing page (`/`).
- Can input a known room code to enter the pre-join lobby.
- Can create an instant meeting (auto-assigned guest host privileges).

### 2. Guest Participant
- An unauthenticated attendee joining via a direct URL (`/room/<slug>/lobby/`).
- Prompts for a **Display Name** in the lobby.
- No password or email needed.
- Enjoys full audio, video, chat, screen share, and local recording capabilities.

### 3. Registered Host
- An authenticated user with an account created via `/register/` or `/login/`.
- Has access to the **Host Workspace / Dashboard** (`/dashboard/`).
- Can create customized room titles and view historical rooms.
- Possesses host moderation privileges inside rooms they own (Mute Participant, Kick Participant, End Meeting for All).

## 3.2 Roles & Permissions Matrix

| Capability / Action | Anonymous Visitor | Guest Participant | Registered Host | Django Superuser |
|---|---|---|---|---|
| View Landing Page | ✅ | ✅ | ✅ | ✅ |
| Join Room via Code or URL | ✅ (prompts name) | ✅ | ✅ | ✅ |
| Preview Camera/Mic in Lobby | ✅ | ✅ | ✅ | ✅ |
| Stream Video & Audio (WebRTC) | ❌ | ✅ | ✅ | ✅ |
| Toggle Screen Share | ❌ | ✅ | ✅ | ✅ |
| In-Meeting Chat | ❌ | ✅ | ✅ | ✅ |
| Record Meeting (.webm) | ❌ | ✅ | ✅ | ✅ |
| Access Host Dashboard | ❌ | ❌ | ✅ | ✅ |
| Remote Mute Participant | ❌ | ❌ | ✅ | ✅ |
| Kick Participant from Room | ❌ | ❌ | ✅ | ✅ |
| End Meeting for All Attendees | ❌ | ❌ | ✅ | ✅ |
| Django Admin Panel (`/admin/`) | ❌ | ❌ | ❌ | ✅ |
