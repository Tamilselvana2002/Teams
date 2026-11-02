# Requirements Specification — Teams
_Author: 03 Product Owner (Strategy & Planning Team)_
_Status: APPROVED (Sprint Ready)_
_Date: 2026-11-02_

---

## 1. Story Map & Epics

```
EPIC 1: Host Authentication & Account Management
  ├── US-001: Host Registration (Sign Up)
  ├── US-002: Host Login & Session Persistence
  └── US-003: Host Dashboard & Room Management

EPIC 2: Room Creation & Pre-Join Lobby
  ├── US-004: Instant Meeting Generation & Copy Link
  ├── US-005: Pre-Join Lobby Device Check (Camera & Mic Preview)
  ├── US-006: Device Selector (Switch Cam/Mic) & Audio Meter
  └── US-007: Guest Display Name Entry & Join Room

EPIC 3: Core WebRTC Audio & Video Calling
  ├── US-008: Peer-to-Peer WebRTC Signaling & Connection
  ├── US-009: Adaptive Video Tile Grid (Responsive Layout)
  ├── US-010: Mic Mute / Unmute Toggle with Audio Activity Indicator
  ├── US-011: Video Camera On / Off Toggle
  └── US-012: Active Speaker Visual Highlighting

EPIC 4: Collaboration & Meeting Utilities
  ├── US-013: Screen Sharing (Display Media Stream)
  ├── US-014: Real-time In-Call Text Chat Drawer
  ├── US-015: Participant List Drawer & Online Counter
  ├── US-016: Local Call Recording (.webm download via MediaRecorder)
  └── US-017: Audio-Only Low-Bandwidth Mode Switch

EPIC 5: Meeting Moderation & Exit
  ├── US-018: Host Participant Moderation (Mute Participant, Kick Participant)
  ├── US-019: Leave Meeting & End Meeting for All
  └── US-020: Meeting Ended Summary Screen
```

---

## 2. User Stories & Gherkin Acceptance Criteria

### US-001: Host Registration
**As a** prospective meeting host,  
**I want to** register with my email, username, and password,  
**So that** I can create and manage persistent meeting rooms.

```gherkin
Scenario: Successful Host Registration
  Given an unregistered visitor on "/register/"
  When they enter a valid username, email, and matching passwords
  And submit the registration form
  Then an account is created in the database
  And the host is logged in and redirected to "/dashboard/"
  And a welcome message is displayed

Scenario: Registration with duplicate email
  Given an existing registered user with email "host@example.com"
  When a visitor attempts to register with "host@example.com"
  Then the form displays an inline error "An account with this email already exists"
  And the user remains on the registration page
```

### US-004: Instant Meeting Generation
**As a** logged-in host,  
**I want to** click "New Meeting" to generate an instant unique room,  
**So that** I can invite participants with a shareable URL.

```gherkin
Scenario: Create New Room from Dashboard
  Given a logged-in host on "/dashboard/"
  When they click the "Start Instant Meeting" button
  Then a new Room record is created with a unique 9-character code (e.g. "abc-defg-hij")
  And the host is redirected to "/room/abc-defg-hij/lobby/"
  And the shareable link is copied to the clipboard
```

### US-005 & US-006: Pre-Join Lobby Device Check
**As a** meeting participant (Host or Guest),  
**I want to** preview my camera, test my microphone, and pick my devices in a pre-join lobby,  
**So that** I can ensure my media is configured properly before entering the live call.

```gherkin
Scenario: Participant loads Lobby screen
  Given a user navigating to "/room/{room_slug}/lobby/"
  When the browser requests camera and microphone permissions
  And the user grants access
  Then the video element renders the local camera stream
  And the audio level meter pulses in response to ambient voice input
  And the camera and microphone dropdowns populate with available system devices

Scenario: Guest inputs display name in lobby
  Given a guest user (unauthenticated) in the lobby
  When they enter display name "Sarah Jenkins" and click "Join Meeting"
  Then their display name is stored in session/localStorage
  And they are connected to the live room "/room/{room_slug}/"
```

### US-008 & US-009: WebRTC Video Calling & Adaptive Grid
**As a** meeting participant,  
**I want to** see and hear all connected participants in an auto-arranging video grid,  
**So that** we can converse seamlessly with low latency.

```gherkin
Scenario: Second participant joins room
  Given Participant A is already inside "/room/abc-defg-hij/"
  When Participant B joins the same room
  Then WebRTC signaling establishes a peer connection via WebSocket
  And Participant A sees Participant B's video tile appear within 1.5 seconds
  And Participant B sees Participant A's video tile
  And the grid adjusts dynamically from 1 tile to a 2-column balanced layout
```

### US-013: Screen Sharing
**As a** meeting participant,  
**I want to** share my computer screen, window, or browser tab,  
**So that** attendees can view my presentation or live work.

```gherkin
Scenario: Start and stop screen sharing
  Given an active participant in a meeting room
  When they click the "Share Screen" button in the control toolbar
  Then the browser prompt "Choose what to share" appears
  And once selected, the participant's video tile replaces or adds the screen stream
  And the "Share Screen" button enters active highlighted state
  When they click "Stop Sharing"
  Then the stream reverts back to the webcam feed
```

### US-014: Real-time In-Call Text Chat
**As a** participant,  
**I want to** send and receive text messages during the call,  
**So that** I can share links, code, and notes without interrupting the speaker.

```gherkin
Scenario: Send in-call chat message
  Given an active call with 3 participants
  When Participant A opens the Chat drawer and types "Check this link: https://docs.app"
  And presses Enter or clicks Send
  Then the message appears in Participant A's chat window with timestamp
  And a notification badge appears on the Chat button for Participants B and C
  And the message is broadcast in real time to all peers in the room
```

### US-016: Local Call Recording
**As a** meeting host or participant,  
**I want to** record the meeting locally directly in my browser,  
**So that** I can download the video file without relying on external paid recording services.

```gherkin
Scenario: Record Meeting and Download WebM
  Given an active meeting participant
  When they click the "Record Call" button
  Then recording begins using the MediaStream Recording API
  And a pulsing red "REC" indicator appears on the screen
  When they click "Stop Recording"
  Then recording ceases and a prompt triggers an instant download of "Teams_Meeting_{date}.webm"
```

### US-017: Audio-Only Low-Bandwidth Mode
**As a** participant on a constrained internet connection,  
**I want to** toggle Low-Bandwidth Mode,  
**So that** incoming and outgoing video streams are paused and bandwidth is reserved for crisp audio.

```gherkin
Scenario: Enable Low-Bandwidth Mode
  Given a participant on a lagging network
  When they toggle "Low-Bandwidth Mode" in the toolbar
  Then local camera track is muted/stopped
  And remote video rendering is hidden, displaying participant avatar placeholders
  And audio stream continues uninterrupted with minimal data usage
```

---

## 3. Business Rules (BR)

| Rule ID | Title | Specification |
|---|---|---|
| **BR-01** | Room Slug Uniqueness | Room code format must be 3 blocks of 3-4 lowercase alphanumeric chars separated by dashes (`xxx-yyyy-zzz`). Must be unique in database. |
| **BR-02** | Guest Name Validation | Guest display name must be between 2 and 30 characters, stripped of malicious HTML/scripts (`<script>`, etc.). |
| **BR-03** | Host Privileges | The user who created the Room is designated `is_host=True`. Only hosts can trigger "Mute All" or "End Meeting for All". |
| **BR-04** | Peer Capacity Cap | Maximum 25 concurrent connections per room to guarantee network stability on mesh/signaling. Warning displayed if room reaches 20 participants. |
| **BR-05** | Meeting Auto-Closure | When all participants have disconnected for more than 10 minutes, the room status changes to `inactive`. |

---

## 4. Roles & Permissions Matrix

| Capability / Action | Anonymous Visitor | Guest Participant | Registered Host | Admin / Superuser |
|---|---|---|---|---|
| View Landing Page | ✅ | ✅ | ✅ | ✅ |
| Sign Up / Log In | ✅ | ✅ | ✅ | ✅ |
| Create New Meeting Room | ❌ | ❌ | ✅ | ✅ |
| Join Room via Link | ❌ (prompts name) | ✅ | ✅ | ✅ |
| Test Devices in Lobby | ✅ | ✅ | ✅ | ✅ |
| Broadcast Audio / Video | ❌ | ✅ | ✅ | ✅ |
| Toggle Screen Sharing | ❌ | ✅ | ✅ | ✅ |
| Send / Receive Chat | ❌ | ✅ | ✅ | ✅ |
| Record Meeting Locally | ❌ | ✅ | ✅ | ✅ |
| Mute Any Participant | ❌ | ❌ | ✅ | ✅ |
| Kick Participant | ❌ | ❌ | ✅ | ✅ |
| End Meeting for All | ❌ | ❌ | ✅ | ✅ |
