# Market & Competitor Research Report — Teams
_Prepared by: 02 Senior Market Research Analyst_
_Date: 2026-11-02_
_Status: APPROVED for CPO & CTO Review_

---

## 1. Executive Summary
The market for call and video meeting platforms has bifurcated into two dominant extremes:
1. **Heavy Enterprise Suites (MS Teams, Webex):** Feature-dense, slow to load, requires organizational login, heavily tied into calendars, corporate channels, and file storage.
2. **Instant Frictionless Meeting Tools (Google Meet, Whereby, Jitsi Meet, Zoom):** Fast room creation, one-click shareable links, in-browser execution with zero installation needed.

The Founder's brief specifies **"just a call and video meet platform"**. The highest value opportunity lies in delivering a **lightning-fast, zero-friction, browser-first meeting experience** that does not require downloading heavyweight desktop clients or navigating complex team channel hierarchies.

---

## 2. Competitive Landscape & Benchmarks

| Platform | Strengths | Weaknesses | Join Friction | Key Takeaways for "Teams" |
|---|---|---|---|---|
| **Google Meet** | Instant URL access, clean UI, reliable WebRTC audio/video | Requires Google account login, rigid UI layout | Low (if logged in) | Pre-join lobby, grid layout, clean bottom control bar are industry standard. |
| **Whereby** | Beautiful minimalist design, room-based permanent URLs, no downloads | Free tier limited to 45 mins / small rooms | Very Low (guests enter name only) | Best benchmark for frictionless guest joining: enter name & enter room. |
| **Zoom** | Robust network recovery, high market familiarity | Constantly pushes desktop app install, account friction | Medium | Avoid forced application downloads; run 100% in modern browsers. |
| **Jitsi Meet (Open Source)** | 100% open, end-to-end encryption capability, no account needed | High server overhead if unoptimized, inconsistent UI polish | Minimal | Validates demand for privacy-respecting, instant room creation. |
| **Discord (Voice/Video)** | Ultra-low latency, crisp audio codecs, intuitive push-to-talk/activity status | Tied to server/channel structure, gaming stigma | High setup | Clean audio processing (Opus codec, noise suppression) is vital. |

---

## 3. Technology & Architecture Benchmarks for Real-Time Media

1. **Mesh (Peer-to-Peer WebRTC):**
   - *Pros:* Zero media server bandwidth cost; client connections are direct P2P. End-to-end encrypted by default.
   - *Cons:* CPU and upstream bandwidth scale quadratically with participant count ($N \times (N-1)$ connections).
   - *Feasibility:* Ideal for 1-on-1 calls and small rooms (up to 4–6 participants). Extremely cheap and fast to build and host.
2. **Selective Forwarding Unit (SFU):**
   - *Pros:* Each participant sends 1 stream to the server; server forwards packets to other peers without re-encoding. Scales to dozens/hundreds of participants.
   - *Cons:* Requires dedicated media server infrastructure (e.g. LiveKit, Mediasoup, Janus).
3. **Recommendation for MVP:**
   - Implement **WebRTC Mesh with WebSocket Signaling** (Node.js/Socket.io or FastAPI WebSockets) with STUN/TURN fallback. This delivers an instant, fully functional multi-user meeting MVP for up to 6 active video participants per room with zero external paid media server dependencies, and architect the signaling so an SFU can be plugged in for enterprise scaling.

---

## 4. UX Conventions & User Expectations
1. **The Pre-Join Lobby (Check your hair & mic):** Users expect to see their camera feed, select microphone/speaker, and test audio levels before entering the meeting.
2. **One-Click Shareable Room Link:** `https://app/room/{room-id}` where any recipient can click, input their display name, and instantly connect.
3. **Control Bar:** Bottom bar with clear status toggles:
   - Microphone (Mute/Unmute, audio input indicator)
   - Camera (Turn On/Off)
   - Screen Share (Toggle screen or window stream)
   - Chat Sidebar (Slide-out drawer with unread badge)
   - Participants Drawer (List of peers, host actions)
   - Leave / End Call (Red button with confirmation)
4. **Active Speaker Indication:** Glowing border or visual pulse around the currently speaking participant's video tile.

---

## 5. Strategic Recommendations
1. **Brand Positioning:** "Teams — Fast, clean, instant video meetings without corporate clutter."
2. **Platform Focus:** Web-first responsive SPA (works seamlessly on desktop Chrome/Safari/Edge/Firefox and mobile browsers).
3. **Keep it focused:** Reject channels, calendar scheduling integrations, and document repositories in v1. Focus purely on audio clarity, video smoothness, and instant connection.
