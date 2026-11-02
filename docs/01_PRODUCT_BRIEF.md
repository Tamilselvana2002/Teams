# Product Brief — Teams
_Status: CONFIRMED BY FOUNDER (2026-11-02)_
_Date: 2026-11-02_
_Author: 01 Chief Product Officer (Strategy & Planning Team)_

---

## 0. Founder Checkpoint 1 Decisions (LOCKED)
1. **Target Scale:** Scalable multi-participant meetings (15–20+ participants support architecture).
2. **Locked Stack:** Django (Python), HTML, CSS, JavaScript (Django Channels / ASGI for WebSockets signaling).
3. **Authentication:** Hybrid Model — Hosts register/log in to create & manage rooms; Guests join via link with display name in 1 click without credentials.
4. **Approved Feature Scope:**
   - Real-time Video & Audio WebRTC
   - Screen Sharing (Desktop/Window/Tab)
   - Real-time In-Meeting Chat Drawer
   - Pre-Join Lobby (Camera/Mic preview, device selection, volume meter)
   - Local In-Browser Call Recording (.webm direct download)
   - Audio-only Low-Bandwidth Mode Switch
5. **Aesthetic Direction:** Modern Dark Slate & Glass (cinematic dark UI, glowing indicators, floating frosted toolbars).

---

## 1. Name Interpretation & Direction
- **Input:** App name: "teams", Description: "just a call and video meet platform".
- **Candidate Interpretations:**
  1. **Chosen:** A lightweight, instant video meeting and calling platform focused solely on real-time multi-party voice, video, screen-sharing, and in-call chat without corporate channel/calendar bloat.
  2. *Alternative A:* An enterprise unified communications hub with channels, persistent team chats, and file storage (Excluded — contradictory to the Founder's "just a call and video meet platform").
  3. *Alternative B:* A 1-on-1 audio calling web service (Excluded — too narrow, misses video meeting needs).

---

## 2. Problem Statement
Users, freelance teams, small groups, and remote colleagues frequently waste 5–10 minutes struggling with cumbersome video conferencing software that requires desktop application downloads, mandatory account registrations, password resets, or navigates heavy corporate software suites just to have a 15-minute sync.

Current tools either force signups and downloads (Zoom, MS Teams) or bundle excessive organizational baggage when all the user wants is to create a link, send it, and start talking immediately.

---

## 3. Jobs-To-Be-Done (JTBD)
- **Functional Job:** Create an audio/video meeting room in <5 seconds, share a link with anyone, and reliably converse with camera, microphone, screen sharing, and in-meeting text chat.
- **Emotional Job:** Feel confident that technical difficulties, downloads, or login walls will not delay or embarrass the meeting host and participants.
- **Social Job:** Present a modern, professional, frictionless meeting environment to clients and teammates.

---

## 4. Personas

### 🌟 Persona 1: Alex (The Remote Professional / Freelancer) — PRIMARY
- **Role:** Independent consultant / remote software engineer.
- **Goal:** Hop on a quick video call with clients or peers without forcing them to register or install software.
- **Frustrations:** Clients unable to download Zoom due to corporate IT restrictions; Google Meet requiring Google login; software updates right before a meeting.
- **Key Scenario:** Creates an instant room `teams.app/room/sync-492`, slacks the link to a client, both join in 10 seconds, Alex shares their screen to review a design.

### Persona 2: Maya (The Team Lead / Coordinator)
- **Role:** Startup product manager holding daily standups and ad-hoc troubleshooting calls.
- **Goal:** Low-overhead daily video huddles with 3–6 teammates.
- **Frustrations:** Audio echo, lagging video, clunky screen sharing interfaces.

---

## 5. Value Proposition & Positioning
> **"For teams and professionals who need instant video collaboration, Teams is a zero-friction calling and meeting platform that gets you talking in seconds directly in your browser. Unlike Microsoft Teams or Zoom, there are no bulky desktop downloads, mandatory signups, or channel clutter — just instant, crystal-clear calls."**

---

## 6. Feature Universe by Module

| Module | Feature | MoSCoW | RICE | Notes |
|---|---|---|---|---|
| **Room & Lobby** | Instant Room Creation (One-click "New Meeting") | Must | 95 | Core entry point |
| **Room & Lobby** | Unique Shareable Link (`/room/:id`) with Copy Button | Must | 95 | Frictionless invite flow |
| **Room & Lobby** | Pre-Join Lobby (Camera/Mic preview, Device selection) | Must | 90 | Standard video call expectation |
| **Room & Lobby** | Guest Name Input (join without forced login) | Must | 90 | Zero friction |
| **Media Engine** | Multi-party Real-Time Video (WebRTC) | Must | 100 | Core value proposition |
| **Media Engine** | Real-Time Audio with Noise & Echo Suppression | Must | 100 | Core value proposition |
| **Controls** | Mute/Unmute Mic with Visual Volume Indicator | Must | 95 | Essential utility |
| **Controls** | Camera Video On/Off Toggle | Must | 95 | Essential utility |
| **Controls** | Screen Sharing (Screen, Window, or Tab) | Must | 92 | Crucial for team meetings |
| **Controls** | Leave / End Meeting with Confirmation | Must | 90 | Clean exit handling |
| **Layout** | Dynamic Video Grid (Auto-arranging 1 to 6+ tiles) | Must | 90 | Responsive display |
| **Layout** | Active Speaker Highlight / Pin Tile | Must | 85 | Visual focus |
| **Collaboration**| In-Meeting Text Chat Sidebar (Real-time messages) | Must | 88 | Sharing links & text in-call |
| **Collaboration**| Participant List & Count Drawer | Must | 80 | See who is connected |
| **Moderation** | Host Mute-All & Remove Participant | Should | 75 | Useful for 4+ callers |
| **Media Engine** | Virtual Background / Background Blur | Could | 60 | Nice to have, resource heavy |
| **Collaboration**| Meeting Recording (Local webm download) | Could | 65 | Useful for reviews |
| **Enterprise** | Calendar sync, scheduled invites, persistent channels| Won't | 20 | Out of scope per Founder brief |

---

## 7. MVP Scope (v1.0 Definition of Done)

### Must-Have Features (In Scope for v1.0)
1. **Home / Landing Page:** Clean hero with "Start an Instant Meeting" and "Enter Room Code / URL".
2. **Pre-Join Lobby Screen:** Video & audio device permission request, real-time camera preview, mic level visualizer, device selector dropdown (camera/mic), and display name input.
3. **Core Meeting Room:**
   - Multi-party peer connection supporting fluid video and audio.
   - Adaptive responsive video tile grid (1, 2, 3, 4, 5, 6 tiles adapting to screen aspect ratio).
   - Video tile status badges: Participant name, mic muted indicator, speaking highlight ring.
4. **Meeting Bottom Toolbar:**
   - Audio toggle (mic on/off).
   - Video toggle (camera on/off).
   - Screen share toggle (start/stop display media).
   - In-call Chat toggle (opens slide-out chat).
   - Participant list toggle (shows active peers).
   - Room Info / Copy Link button with instant toast notification.
   - Leave Meeting button.
5. **Real-time In-Call Chat:**
   - Send and receive text messages instantly during the call.
   - System notifications when participants join or leave.
6. **Network & Disconnect Handling:**
   - Automatic cleanup of video tiles when a peer leaves.
   - Clear reconnection notices if connection drops.

### Core User Journey
`Landing Page` ➔ Click "Start Instant Meeting" ➔ `Lobby Screen` (verify camera/mic, enter name) ➔ Click "Join Meeting" ➔ `Meeting Room` (share invite link) ➔ Peers join link and talk/video/screen-share ➔ Click "Leave Call" ➔ Back to summary page.

### Explicitly OUT of MVP Scope
- Heavy Slack/MS Teams-style persistent chat channels or team directory.
- Calendar integration (Google Calendar / Outlook integrations).
- Paid billing/subscription gating.
- Server-side heavy transcoding clusters.

---

## 8. Constraints & Non-Functional Expectations
- **Browser Compatibility:** Modern Chromium browsers (Chrome, Edge, Brave), Safari, Firefox on Desktop & Mobile.
- **Performance:** Room join time < 2 seconds once media permissions are granted. Audio latency < 200ms.
- **Responsiveness:** Flawless display at 100% zoom across mobile (360px–414px), tablet (768px), and desktop (1024px–1920px).
- **Security & Privacy:** Media streams encrypted via standard WebRTC DTLS/SRTP. No persistent storage of audio or video content on servers.

---

## 9. Assumptions Log
- **A1:** WebRTC mesh architecture (or lightweight signaling server) is acceptable for the MVP target room size (up to 4–6 simultaneous active video participants).
- **A2:** Guests do not need email/password registration to join a call (name-only guest access is preferred for maximum speed).
- **A3:** The platform should run in standard modern web browsers without any native desktop/mobile app installation requirement.

---

## 10. Confirmation Questions for the Founder (Checkpoint 1)
*(Presented to the Founder in the Kickoff Checkpoint below)*
