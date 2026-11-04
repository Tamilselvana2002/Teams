# 01 — Executive Summary

## 1.1 Product Vision & Core Mission
**Teams** is a modern, zero-friction real-time audio calling and video meeting platform designed to eliminate the complexity, bloat, and sign-up barriers typical of legacy conferencing tools. 

While enterprise collaboration tools force attendees to download multi-hundred-megabyte desktop clients or mandate corporate domain registrations, **Teams** runs entirely inside standard web browsers. Any host can launch a room in under two seconds, share a short link (`/room/abc-defg-hij/lobby/`), and begin conversing with colleagues, clients, or friends with crystal-clear audio, HD video, screen sharing, and real-time chat.

## 1.2 Technology Foundation
Teams is built on a clean, scalable technology stack:
- **Backend:** Python 3.10+ / 3.15 with **Django 6.1** and **Django Channels 4.3**.
- **Protocol Router:** **Daphne 4.2** running on an asynchronous ASGI event loop.
- **Real-Time Communication:** Browser-native **WebRTC** with WebSocket signaling for instantaneous peer connection setup.
- **Frontend Presentation:** Semantic HTML5 templates styled with modular CSS3 using a **Dark Slate Glass** design system, driven by vanilla modern JavaScript (zero third-party UI framework bloat).
- **Data Persistence:** Relational database storage for rooms, host credentials, participant sessions, and in-call messaging history.

## 1.3 Key Highlights & Capabilities
| Area | Capability |
|---|---|
| **Zero-Friction Access** | Guests join directly with a display name; no account creation, passwords, or installations required. |
| **HD Video & Voice** | Peer-to-peer WebRTC streaming with acoustic echo cancellation and automatic background noise suppression. |
| **Screen Sharing** | 1-click screen, application window, or browser tab broadcast. |
| **In-Meeting Chat** | Real-time text messaging drawer powered by persistent WebSockets. |
| **Local Recording** | In-browser `.webm` call recording via the MediaStream Recording API with zero cloud server storage costs. |
| **Low-Bandwidth Mode** | Quick toggle to switch to audio-only on poor cellular or Wi-Fi connections. |
| **Host Moderation** | Host privileges including remote participant muting, participant ejection, and "End Meeting for All". |

## 1.4 Target Audience
1. **Remote Professionals & Freelancers:** Require quick, professional meeting links for client consultations without embarrassing login friction.
2. **Distributed Teams:** Agile teams seeking fast morning standups, ad-hoc design reviews, and pairing sessions.
3. **Organizations & Communities:** Groups desiring lightweight, privacy-respecting video calls with full data control.
