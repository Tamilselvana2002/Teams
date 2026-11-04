# 04 — Features & Modules Guide

## 4.1 Module 1: Pre-Join Lobby (`/room/<slug>/lobby/`)
The Lobby screen acts as an interactive staging area before entering a live call:
- **Live Video Preview:** Renders local webcam video with horizontal mirroring for natural self-view.
- **Audio VU Level Meter:** Utilizes the browser Web Audio API (`AudioContext` and `AnalyserNode`) to measure incoming microphone decibels in real time, pulsing green as the user speaks.
- **Hardware Device Selectors:** Automatically enumerates system webcams and microphones using `navigator.mediaDevices.enumerateDevices()`, enabling users to pick dedicated external USB mics or webcams.
- **Microphone & Camera Toggles:** Allows users to enter a meeting pre-muted or with video turned off.
- **Display Name Validation:** Validates that names are between 1 and 50 characters, stripping script injections.

## 4.2 Module 2: Adaptive Video Grid & Tiles
- **Dynamic Auto-Balancing Grid:** Implemented with pure CSS Grid (`grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))`). Layout automatically transitions from full single-tile view to 2-column split, 4-tile quadrant, or multi-tile gallery.
- **Active Speaker Spotlight:** High-frequency audio monitoring applies an animated emerald border ring (`box-shadow: 0 0 0 3px var(--accent-speaking)`) to the currently speaking peer.
- **Status Badges & Fallback Avatars:** If a participant turns off their webcam, the video element is cleanly swapped with a circular monogram avatar displaying their initials. Muted microphones are indicated by a red muted icon.

## 4.3 Module 3: Floating Glass Controls Toolbar
Positioned at the bottom center with frosted backdrop blur (`rgba(17, 24, 39, 0.85)` + `backdrop-filter: blur(16px)`):
- **Microphone Toggle (M):** Toggles audio stream tracks on and off.
- **Camera Toggle (V):** Toggles video stream tracks on and off.
- **Screen Share (S):** Captures desktop, application window, or tab via `navigator.mediaDevices.getDisplayMedia`.
- **Low-Bandwidth Mode:** Disables incoming/outgoing video streams to preserve network bandwidth on slow connections while preserving audio.
- **Local Call Recording:** Starts browser-native `MediaRecorder` capture.
- **In-Call Chat Toggle:** Opens/closes the slide-out text chat drawer with unread message badge.
- **Participants Drawer Toggle:** Displays active attendees count and moderation actions.
- **Leave Call (Danger Button):** Gracefully closes peer connections and redirects to the summary page.

## 4.4 Module 4: In-Call Real-Time Chat
- Powered by Django Channels WebSockets (`/ws/room/<slug>/`).
- Broadcasts messages across all connected participants instantly.
- Displays sender name, timestamp, and styling differentiation for the user's own messages vs remote peers.
- All input text is HTML-escaped on both client and server before DOM rendering to eliminate cross-site scripting (XSS).

## 4.5 Module 5: Local In-Browser Recording
- Utilizes the HTML5 `MediaRecorder` API with `video/webm;codecs=vp8,opus`.
- Records video and mixed audio directly into browser memory chunks.
- On stop, automatically stitches chunks into a Blob and triggers an instant download of `Teams_Meeting_<slug>_<timestamp>.webm`.
- **Zero Server Storage Overhead:** Recording files never touch the server disk, ensuring total user privacy and zero server storage bills.
