# Completion Matrix — Teams

## P01 — Landing Page (/)
| ID | Page | Route | Element | Type | Expected result | Roles | Story | API | Test ID | Built | Wired | Tested | Verified |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P01-E00 | Landing Page | / | Page load | page | Renders hero with CTA, features overview, responsive navigation | visitor, host | US-001 | — | page-landing | ✅ | ✅ | ✅ | ✅ |
| P01-E01 | Landing Page | / | Sign In link | link | Navigates to /login/ | visitor | US-002 | — | link-signin | ✅ | ✅ | ✅ | ✅ |
| P01-E02 | Landing Page | / | Register link | link | Navigates to /register/ | visitor | US-001 | — | link-register | ✅ | ✅ | ✅ | ✅ |
| P01-E03 | Landing Page | / | Join Meeting input | input | Accepts 9-character room code | visitor, guest | US-007 | — | input-join-code | ✅ | ✅ | ✅ | ✅ |
| P01-E04 | Landing Page | / | Join Meeting CTA | button | Validates code and redirects to /room/:code/lobby/ | visitor, guest | US-007 | — | btn-join-meeting | ✅ | ✅ | ✅ | ✅ |
| P01-E05 | Landing Page | / | Host Quick Start CTA | button | If logged in, creates room; if anonymous, redirects to /login/ | visitor, host | US-004 | POST /api/rooms/create/ | btn-hero-start | ✅ | ✅ | ✅ | ✅ |

## P02 — Host Login (/login/)
| ID | Page | Route | Element | Type | Expected result | Roles | Story | API | Test ID | Built | Wired | Tested | Verified |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P02-E00 | Login | /login/ | Page load | page | Renders login form with autofocus on username/email | visitor | US-002 | — | page-login | ✅ | ✅ | ✅ | ✅ |
| P02-E01 | Login | /login/ | Username field | input | Accepts username or email | visitor | US-002 | — | input-login-username | ✅ | ✅ | ✅ | ✅ |
| P02-E02 | Login | /login/ | Password field | input | Accepts password with masked chars | visitor | US-002 | — | input-login-password | ✅ | ✅ | ✅ | ✅ |
| P02-E03 | Login | /login/ | Submit button | button | Authenticates user and redirects to /dashboard/ | visitor | US-002 | POST /login/ | btn-login-submit | ✅ | ✅ | ✅ | ✅ |
| P02-E04 | Login | /login/ | Switch to Register link | link | Navigates to /register/ | visitor | US-001 | — | link-to-register | ✅ | ✅ | ✅ | ✅ |

## P03 — Host Register (/register/)
| ID | Page | Route | Element | Type | Expected result | Roles | Story | API | Test ID | Built | Wired | Tested | Verified |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P03-E00 | Register | /register/ | Page load | page | Renders signup form | visitor | US-001 | — | page-register | ✅ | ✅ | ✅ | ✅ |
| P03-E01 | Register | /register/ | Username field | input | Validates length and characters | visitor | US-001 | — | input-reg-username | ✅ | ✅ | ✅ | ✅ |
| P03-E02 | Register | /register/ | Email field | input | Validates email syntax | visitor | US-001 | — | input-reg-email | ✅ | ✅ | ✅ | ✅ |
| P03-E03 | Register | /register/ | Password field | input | Validates password complexity | visitor | US-001 | — | input-reg-password | ✅ | ✅ | ✅ | ✅ |
| P03-E04 | Register | /register/ | Confirm Password | input | Confirms passwords match | visitor | US-001 | — | input-reg-password-confirm | ✅ | ✅ | ✅ | ✅ |
| P03-E05 | Register | /register/ | Submit button | button | Creates account and redirects to /dashboard/ | visitor | US-001 | POST /register/ | btn-register-submit | ✅ | ✅ | ✅ | ✅ |

## P04 — Host Dashboard (/dashboard/)
| ID | Page | Route | Element | Type | Expected result | Roles | Story | API | Test ID | Built | Wired | Tested | Verified |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P04-E00 | Dashboard | /dashboard/ | Page load | page | Displays host profile, active rooms, quick room launcher | host | US-003 | — | page-dashboard | ✅ | ✅ | ✅ | ✅ |
| P04-E01 | Dashboard | /dashboard/ | New Meeting button | button | Generates instant room and redirects to lobby | host | US-004 | POST /api/rooms/create/ | btn-new-meeting | ✅ | ✅ | ✅ | ✅ |
| P04-E02 | Dashboard | /dashboard/ | Room Title input | input | Optional custom meeting title | host | US-004 | — | input-room-title | ✅ | ✅ | ✅ | ✅ |
| P04-E03 | Dashboard | /dashboard/ | Copy Room Link | button | Copies full URL to clipboard and triggers toast | host | US-004 | — | btn-copy-link-dash | ✅ | ✅ | ✅ | ✅ |
| P04-E04 | Dashboard | /dashboard/ | Recent Rooms List | list | Displays previously hosted meetings and timestamps | host | US-003 | GET /api/rooms/recent/ | list-recent-rooms | ✅ | ✅ | ✅ | ✅ |
| P04-E05 | Dashboard | /dashboard/ | Logout button | button | Terminates session and redirects to / | host | US-002 | POST /logout/ | btn-logout | ✅ | ✅ | ✅ | ✅ |

## P05 — Pre-Join Lobby (/room/<slug>/lobby/)
| ID | Page | Route | Element | Type | Expected result | Roles | Story | API | Test ID | Built | Wired | Tested | Verified |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P05-E00 | Lobby | /room/:slug/lobby/ | Page load | page | Requests mic/camera permissions, loads preview video | guest, host | US-005 | — | page-lobby | ✅ | ✅ | ✅ | ✅ |
| P05-E01 | Lobby | /room/:slug/lobby/ | Camera Preview | video | Live local camera video stream rendered | guest, host | US-005 | — | video-lobby-preview | ✅ | ✅ | ✅ | ✅ |
| P05-E02 | Lobby | /room/:slug/lobby/ | Audio Level Meter | meter | Visual bar indicator pulsing with mic input | guest, host | US-005 | — | meter-audio-level | ✅ | ✅ | ✅ | ✅ |
| P05-E03 | Lobby | /room/:slug/lobby/ | Mic Toggle | button | Mutes/unmutes audio before joining | guest, host | US-006 | — | btn-lobby-toggle-mic | ✅ | ✅ | ✅ | ✅ |
| P05-E04 | Lobby | /room/:slug/lobby/ | Cam Toggle | button | Turns off/on video preview before joining | guest, host | US-006 | — | btn-lobby-toggle-cam | ✅ | ✅ | ✅ | ✅ |
| P05-E05 | Lobby | /room/:slug/lobby/ | Camera Select | select | Lists available webcam input devices | guest, host | US-006 | — | select-camera-device | ✅ | ✅ | ✅ | ✅ |
| P05-E06 | Lobby | /room/:slug/lobby/ | Mic Select | select | Lists available microphone input devices | guest, host | US-006 | — | select-mic-device | ✅ | ✅ | ✅ | ✅ |
| P05-E07 | Lobby | /room/:slug/lobby/ | Display Name input | input | Guest enters name (prefilled for logged in host) | guest, host | US-007 | — | input-display-name | ✅ | ✅ | ✅ | ✅ |
| P05-E08 | Lobby | /room/:slug/lobby/ | Join Meeting button | button | Validates name and enters live meeting /room/:slug/ | guest, host | US-007 | — | btn-join-room | ✅ | ✅ | ✅ | ✅ |

## P06 — Live Meeting Room (/room/<slug>/)
| ID | Page | Route | Element | Type | Expected result | Roles | Story | API | Test ID | Built | Wired | Tested | Verified |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P06-E00 | Meeting | /room/:slug/ | Page load | page | Connects WebSocket, renders local tile & remote peers | guest, host | US-008 | WS /ws/room/:slug/ | page-meeting-room | ✅ | ✅ | ✅ | ✅ |
| P06-E01 | Meeting | /room/:slug/ | Video Grid Container | container| Dynamic auto-balancing grid layout for 1-20 tiles | guest, host | US-009 | — | container-video-grid | ✅ | ✅ | ✅ | ✅ |
| P06-E02 | Meeting | /room/:slug/ | Local Video Tile | tile | Renders user's own video stream with name badge | guest, host | US-009 | — | tile-local-video | ✅ | ✅ | ✅ | ✅ |
| P06-E03 | Meeting | /room/:slug/ | Remote Video Tiles | tile | Renders remote peer video streams + active speaker ring | guest, host | US-008 | — | tile-remote-video | ✅ | ✅ | ✅ | ✅ |
| P06-E04 | Meeting | /room/:slug/ | Toggle Mic | button | Mutes/unmutes microphone; updates icon & status badge | guest, host | US-010 | — | btn-toggle-mic | ✅ | ✅ | ✅ | ✅ |
| P06-E05 | Meeting | /room/:slug/ | Toggle Camera | button | Stops/starts video track; replaces with initials tile | guest, host | US-011 | — | btn-toggle-cam | ✅ | ✅ | ✅ | ✅ |
| P06-E06 | Meeting | /room/:slug/ | Share Screen | button | Requests display capture; replaces video with screen | guest, host | US-013 | — | btn-share-screen | ✅ | ✅ | ✅ | ✅ |
| P06-E07 | Meeting | /room/:slug/ | Low-Bandwidth Mode | button | Toggles audio-only mode to save bandwidth | guest, host | US-017 | — | btn-low-bandwidth | ✅ | ✅ | ✅ | ✅ |
| P06-E08 | Meeting | /room/:slug/ | Record Call | button | Starts/stops MediaRecorder; triggers .webm download | guest, host | US-016 | — | btn-record-meeting | ✅ | ✅ | ✅ | ✅ |
| P06-E09 | Meeting | /room/:slug/ | Toggle Chat Drawer | button | Opens/closes sliding in-call chat panel | guest, host | US-014 | — | btn-toggle-chat | ✅ | ✅ | ✅ | ✅ |
| P06-E10 | Meeting | /room/:slug/ | Chat Messages Container | list | Displays chronological chat history | guest, host | US-014 | — | list-chat-messages | ✅ | ✅ | ✅ | ✅ |
| P06-E11 | Meeting | /room/:slug/ | Chat Input | input | Input field for typing text message | guest, host | US-014 | — | input-chat-message | ✅ | ✅ | ✅ | ✅ |
| P06-E12 | Meeting | /room/:slug/ | Send Chat Message | button | Broadcasts message via WebSocket to all peers | guest, host | US-014 | WS chat.message | btn-send-chat | ✅ | ✅ | ✅ | ✅ |
| P06-E13 | Meeting | /room/:slug/ | Toggle Participants | button | Opens/closes participant list drawer | guest, host | US-015 | — | btn-toggle-participants | ✅ | ✅ | ✅ | ✅ |
| P06-E14 | Meeting | /room/:slug/ | Participant Count Badge | badge | Real-time counter of connected participants | guest, host | US-015 | — | badge-participant-count | ✅ | ✅ | ✅ | ✅ |
| P06-E15 | Meeting | /room/:slug/ | Copy Invite Link | button | Copies room URL with one-click toast feedback | guest, host | US-004 | — | btn-copy-invite | ✅ | ✅ | ✅ | ✅ |
| P06-E16 | Meeting | /room/:slug/ | Host Mute Participant | button | Mutes selected remote peer (visible to Host only) | host | US-018 | WS peer.mute | btn-host-mute-peer | ✅ | ✅ | ✅ | ✅ |
| P06-E17 | Meeting | /room/:slug/ | Host Kick Participant | button | Removes participant from room (Host only) | host | US-018 | WS peer.kick | btn-host-kick-peer | ✅ | ✅ | ✅ | ✅ |
| P06-E18 | Meeting | /room/:slug/ | Leave Call | button | Disconnects WebSockets & tracks, redirects to ended | guest, host | US-019 | — | btn-leave-call | ✅ | ✅ | ✅ | ✅ |
| P06-E19 | Meeting | /room/:slug/ | End Meeting for All | button | Closes room for everyone (Host only) | host | US-019 | WS room.terminate | btn-end-meeting-all | ✅ | ✅ | ✅ | ✅ |

## P07 — Meeting Ended Screen (/room/<slug>/ended/)
| ID | Page | Route | Element | Type | Expected result | Roles | Story | API | Test ID | Built | Wired | Tested | Verified |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P07-E00 | Ended | /room/:slug/ended/ | Page load | page | Displays meeting summary, duration, rejoin CTA | guest, host | US-020 | — | page-meeting-ended | ✅ | ✅ | ✅ | ✅ |
| P07-E01 | Ended | /room/:slug/ended/ | Rejoin Button | button | Returns user to /room/:slug/lobby/ | guest, host | US-020 | — | btn-rejoin-meeting | ✅ | ✅ | ✅ | ✅ |
| P07-E02 | Ended | /room/:slug/ended/ | Return Home Button | button | Redirects user to landing page (or dashboard if host) | guest, host | US-020 | — | btn-return-home | ✅ | ✅ | ✅ | ✅ |
