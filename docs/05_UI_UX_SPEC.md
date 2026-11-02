# UI/UX Design Specification — Teams
_Author: 05 Head of Design & Creative Director_
_Status: APPROVED (Ready for Build)_
_Date: 2026-11-02_

---

## 1. Visual Identity & Design Direction: "Dark Slate Glass"

The aesthetic direction approved by the Founder is **Modern Dark Slate & Glass**: a clean, distraction-free, cinematic conference room interface inspired by modern studio monitors, with subtle glowing accents and frosted glass overlays.

### 1.1 Color Tokens
```css
:root {
  /* Backgrounds */
  --bg-canvas: #0B0F19;           /* Deep Obsidian / Dark Void */
  --bg-surface: #111827;          /* Tile background & Cards */
  --bg-surface-hover: #1F2937;    /* Interactive hover states */
  --bg-glass: rgba(17, 24, 39, 0.82); /* Floating frosted toolbars */
  --border-glass: rgba(255, 255, 255, 0.08);
  --border-glass-active: rgba(59, 130, 246, 0.4);

  /* Typography */
  --text-primary: #F9FAFB;
  --text-secondary: #9CA3AF;
  --text-muted: #6B7280;

  /* Accent Colors */
  --accent-primary: #3B82F6;       /* Tech Blue */
  --accent-primary-hover: #2563EB;
  --accent-speaking: #10B981;      /* Emerald pulse on active audio */
  --accent-danger: #EF4444;        /* Crimson for End/Mute */
  --accent-danger-hover: #DC2626;
  --accent-recording: #F43F5E;     /* Pulsing recording indicator */

  /* Shadows & Glass Filter */
  --shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.45);
  --backdrop-blur: blur(16px);
  --radius-lg: 16px;
  --radius-md: 10px;
  --radius-pill: 9999px;
}
```

---

## 2. Component Design & Micro-Interactions

### 2.1 The Floating Glass Toolbar (Meeting Room Bottom Bar)
- Position: Fixed at bottom center (`bottom: 24px; left: 50%; transform: translateX(-50%)`).
- Appearance: Pill-shaped frosted container (`background: var(--bg-glass); backdrop-filter: var(--backdrop-blur)`).
- Icon Buttons: Circular 48x48px buttons with smooth hover feedback.
- Danger Button: Crimson button for "Leave Call" with tooltip.
- Recording Indicator: Flashing red pill on the top-left of the viewport when recording is active.

### 2.2 Adaptive Video Tile Grid
- Built with pure CSS Grid: `display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; height: 100%;`
- Each tile features:
  - Video stream fitted to cover/contain without distortion.
  - Dark glass name pill on bottom-left (`background: rgba(0,0,0,0.6); padding: 4px 10px; border-radius: 6px; font-size: 13px;`).
  - Active audio speaking ring: `box-shadow: 0 0 0 3px var(--accent-speaking)` when peer voice is detected.
  - Mic muted badge (red muted microphone icon) when audio track is disabled.
  - Avatar initials fallback circle if video camera is turned off.

### 2.3 The Pre-Join Lobby Preview
- Centered 640x360px video card.
- Real-time audio VU meter bar directly under the video preview, animated with HTML5 Web Audio API `AudioContext` / `AnalyserNode`.
- Device selectors: native styled dark dropdowns for Camera and Microphone device switching.
- Name input: Clean dark input with subtle glow border on focus.

### 2.4 Slide-Out In-Call Chat & Participant Drawers
- Positioned on right viewport side (`width: 360px; height: calc(100vh - 32px);`).
- Smooth CSS transition `transform: translateX(0)` / `transform: translateX(100%)`.
- Instant auto-scrolling message list with sender name, timestamp, and message bubble.

---

## 3. Responsive Breakpoints
- **Mobile (360px – 640px):** Single-column stacked video tiles; bottom toolbar shrinks to 40px buttons; chat opens full-screen overlay.
- **Tablet (641px – 1024px):** 2-column balanced grid; toolbar centered.
- **Desktop (1025px – 1920px+):** Dynamic 3 to 4 column matrix; spacious grid with collapsible side drawers.
- **Zero horizontal scroll** enforced at 100% zoom across all viewports.
