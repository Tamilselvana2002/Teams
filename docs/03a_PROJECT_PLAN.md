# Project Plan & Delivery Roadmap — Teams
_Author: 03a Senior Project Manager (Strategy & Planning Team)_
_Status: APPROVED_
_Date: 2026-11-02_

---

## 1. Work Breakdown Structure (WBS)

```
WBS 1: Project Architecture & Environment Initialization
  ├── 1.1 Django Project Setup & SQLite/Postgres DB Config
  ├── 1.2 Django Channels ASGI & WebSocket Signaling Setup
  └── 1.3 Static Asset Pipelines (Dark Slate Glass CSS, JS Modules)

WBS 2: Authentication & Host Workspace (Pages P01, P02, P03, P04)
  ├── 2.1 Landing Page with Join Code input & Hero CTA (P01)
  ├── 2.2 Host Registration, Login & Session Management (P02, P03)
  └── 2.3 Host Dashboard with Instant Room Generator (P04)

WBS 3: Pre-Join Lobby & Media Permissioning (Page P05)
  ├── 3.1 Device Permissions & Local Stream Rendering (P05)
  ├── 3.2 Live Audio Visualizer Meter & Device Selection Dropdowns
  └── 3.3 Guest Name Input & Room Entry Tokenization

WBS 4: Real-Time Signaling & WebRTC Multi-Party Core (Page P06)
  ├── 4.1 Django Channels WebRTC Signaling Consumer (offer/answer/candidate)
  ├── 4.2 Dynamic Responsive Video Tile Grid & Active Speaker Highlighting
  ├── 4.3 Microphone, Camera, and Screen Sharing Controls
  └── 4.4 In-Meeting WebSocket Real-Time Chat & Participant List Drawer

WBS 5: Advanced Meeting Features (Page P06, P07)
  ├── 5.1 Local Meeting Recording (.webm MediaRecorder download)
  ├── 5.2 Audio-Only Low-Bandwidth Mode
  ├── 5.3 Host Moderation (Mute Participant, Kick, End for All)
  └── 5.4 Call Exit & Rejoin Summary Page (P07)

WBS 6: Verification, Visual QA & Security
  ├── 6.1 Automated Unit, API & Integration Tests
  ├── 6.2 Stub Scan & Click-Tester Crawl across all 7 Pages
  └── 6.3 CISO Security Review & Production Readiness Audit
```

---

## 2. Sprint Milestones

| Milestone | Deliverables | Target Gate |
|---|---|---|
| **M1: Foundation & Specs** | Product Brief, Requirements, Matrix, Architecture, UI Spec | Gate G1, G2, G3, G4 (CP1, CP2) |
| **M2: Host Auth & Lobby** | Django backend, Auth, Dashboard, Lobby device tests | Pages P01, P02, P03, P04, P05 |
| **M3: WebRTC Meeting Room** | Multi-party calling, Screen Share, Chat, Grid layout | Page P06 Core |
| **M4: Advanced Meeting Tools** | Recording, Low-bandwidth mode, Moderation, End screen | Page P06 Advanced, P07 |
| **M5: QA, Security & Docs** | 100% Completion Matrix, 0 Stubs, Visual QA, PDF Docs | Gate G5, G6, G7, G8, G9 (CP3) |
