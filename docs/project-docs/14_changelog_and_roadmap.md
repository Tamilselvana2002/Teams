# 14 — Changelog & Roadmap

## 14.1 Version 1.0.0 (Current Release)
_Release Date: November 2026_
- **Core Calling Engine:** Peer-to-peer WebRTC video and audio streaming with acoustic echo cancellation and automatic gain control.
- **Signaling Server:** Django Channels 4 + Daphne ASGI WebSocket consumer with dynamic room group routing.
- **Pre-Join Lobby:** Device permission testing, hardware device enumeration, and live Web Audio API VU volume meter.
- **Screen Sharing:** Native display capture allowing monitors, windows, or individual browser tabs to be broadcast to peers.
- **In-Call Collaboration:** Persistent real-time in-call text chat drawer with sender timestamps and unread message notifications.
- **Local Recording:** 1-click in-browser video call recording (.webm) with zero server storage costs.
- **Audio-Only Low Bandwidth Mode:** Bandwidth-saving toggle for unstable network connections.
- **Host Moderation:** Host privileges including remote participant muting, participant ejection, and meeting termination.
- **Modern UI Aesthetic:** Dark Slate Glass design system with glowing active speaker indicators.
- **Multi-App Deployment Architecture:** Production blueprint for hosting 5 Django applications on a single AWS EC2 server with Hostinger subdomains and free Let's Encrypt SSL.

## 14.2 Future Roadmap (Version 2.0 Considerations)
- **Virtual Backgrounds & AI Blur:** Client-side background segmentation using lightweight WebAssembly models (e.g. MediaPipe Selfie Segmentation).
- **Dedicated SFU Media Server Integration:** Optional pluggable LiveKit or Mediasoup Selective Forwarding Unit (SFU) backend for enterprise rooms with 50+ participants.
- **Calendar Scheduling & Reminders:** Optional Google Calendar / Outlook .ics invite link generation.
- **End-to-End Chat Encryption:** Client-side Web Crypto API encryption for in-call text messages.
