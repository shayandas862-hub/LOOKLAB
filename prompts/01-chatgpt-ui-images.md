# Prompt 1 · ChatGPT — UI pictures

Paste MESSAGE 1 into a new ChatGPT chat. It returns two style directions for the Breakdown screen. Pick one, then paste the screen messages one at a time (one image per message).

ChatGPT images garble small text. Use them for layout and feel only; Claude Design rebuilds them properly.

---

## MESSAGE 1

```
I'm designing the UI for LOOK LAB, an internal desktop tool for a film production team. Make UI mockup images, one screen per message. Flat screenshot, landscape 3:2, no laptop frame, no perspective. Realistic content, short legible labels, no lorem ipsum.

WHAT LOOK LAB DOES
A technical pre-production brain. It cuts cost and mistakes on set by working the shot out before the shoot:
1. BREAK DOWN a reference frame or video: exact colour palette (hex shades and proportions), light (direction, hardness, colour temperature, key:fill ratio), lens, framing, camera movement, mood.
2. ADAPT it to our reality: our location (photos, size, windows, power) and our kit (lights, camera, lenses, crew).
3. PLAN IT IN 3D: a movable model of the location. Place and move lights, camera and actors until the camera view matches the reference. A match score shows how close.
4. EXECUTE: a set sheet (lighting plot, gear list, camera settings, setup order) for the crew on the day.
Also: mood boards, a shot-by-shot previs board, a library of saved looks.

WHO USES IT
DPs, gaffers, directors, producers. Technical people who want numbers they can trust and edit.

DESIGN RULES
- UI chrome is strictly neutral grey with zero colour tint, because the user is judging colour. Reference images are the hero: large, never cropped, on a neutral surround.
- One accent colour only, for selection and primary buttons.
- Numbers in a monospaced font with units (°, K, mm, stops, %).
- Every value has a small source badge: MEASURED, AI (with confidence %), or MANUAL. Every AI button has a manual option beside it.
- Dense but calm, like professional grading and 3D software. 8 px grid.
- Left: slim icon sidebar (Projects, Breakdown, Location & Kit, Set Plan, Shots, Mood Board, Library, Settings). Top bar: project and shot breadcrumb, search, command palette (⌘K), AI status pill.

SAMPLE PROJECT (use on every screen)
Project "Neel" (short film) · Scene 12 "Kitchen, night" · Shot 12C.
Reference: a woman at a kitchen counter at night, lit hard from screen-left by orange sodium streetlight through a window, cold blue ambient in the shadows.

FIRST: the BREAKDOWN screen as two separate images. A = dark neutral grey. B = light neutral grey. I'll pick one and we continue in that direction.

BREAKDOWN screen:
- Centre: the reference frame large (2.39:1). Under it a video strip: detected shots as thumbnails, a scrubber, "Shot 3 of 7 · 00:01:12:08".
- Overlay toggles above the frame: thirds grid, light direction arrow, palette sample points.
- Right panel, collapsible sections:
  COLOUR: 6 swatches with hex and share: #1B2230 38%, #3E4A52 22%, #C7803A 14%, #6E5B4A 11%, #E9C9A0 9%, #0D0F12 6%. Shadow / mid / highlight tint. Saturation. Contrast.
  LIGHT: small top-down dial with the key at −60° azimuth, 25° elevation. Key: hard, 2000 K sodium. Fill: 5600 K ambient. Ratio 8:1 (3 stops). Practicals: none.
  LENS & CAMERA: ≈40 mm (AI 72%), shallow depth of field, height 1.2 m, slight low angle, static.
  FRAMING: MCU, subject on left third, lead room right.
  MOOD: "lonely", "warm–cold tension", "neo-noir" (AI).
- Bottom: "Ask about this reference" input with example chips: "What's the exact colour scheme?", "How many lights?". Buttons: "Save look", "Adapt to our location →".
```

---

## SCREEN MESSAGES (after you pick A or B; one per message)

### 2 · Projects
```
Same style. Screen: PROJECTS home.
Grid of productions as cards (poster frame, name, type, shoot dates, progress by stage: Breakdown / Plan / Set sheet). "Neel" open on the right: its scenes as a list (Scene 12 "Kitchen, night": 6 shots, 4 planned). "New project" button, "Import reference" button. Small panel: "Recent activity" (3 rows).
```

### 3 · Location & Kit (Adapt)
```
Same style. Screen: LOCATION & KIT, the "adapt the look to our reality" screen for Shot 12C.
Left column, LOCATION "Ballygunge flat, kitchen": 4 photo thumbnails, a simple floor plan 3.1 × 4.2 m with ceiling 2.9 m, one east window 1.2 m wide, 2 power points (5 A, 15 A), shoot window 19:00–02:00.
Middle column, OUR KIT with quantities: 600 W bi-colour COB ×1, 60 W LED panel ×2, 4 ft RGB tube ×1, 4×4 frame with ½ grid, flags ×2, CTO full and ½ gels, haze machine. Camera: FX3, primes 24/35/50/85 mm. Crew: DP, gaffer, 1 spark.
Right column, THE RECIPE: "How to get this look here". Numbered steps: 1) Key: 600 W COB outside the window, 3 m back, full CTO + ½ CTS to reach ≈2000 K, flag the ceiling spill. 2) Fill: RGB tube bounced off the ceiling at 5600 K, 10%. 3) Lens: 35 mm at T2 (closest to ≈40 mm). Then a GAPS box in amber: "Need a stand outside the window at 2.5 m: not in kit". A RISKS box: "15 A point shared with the fridge". Buttons: "Generate recipe (AI)", "Write it myself", "Open in Set Plan →".
```

### 4 · Set Plan (3D), the main working screen
```
Same style. Screen: SET PLAN, a 3D planning view of the kitchen.
Left: outliner tree. LIGHTS: Key (window COB), Fill (tube bounce), Practical (pendant, off). CAMERA: Cam A 35 mm. ACTORS: Rhea (mark 1), Arjun (mark 2). SET: counter, table, window, fridge.
Centre: large 3D viewport of the room in simple grey geometry with light icons, beam cones, the camera frustum, actor figures on floor marks, and move gizmos on the selected light. View switch: 3D / Top-down plot / Camera view.
Picture-in-picture bottom-right: the camera view render.
Right: properties of the selected light: type, power 80%, 2000 K, gel full CTO + ½ CTS, modifier none, position x/y/z in metres, distance to subject 3.4 m, azimuth −58° and elevation 24° relative to camera, beam 55°.
Bottom strip: LOOK MATCH. Reference vs camera view side by side, score "87%" large, and the numbers behind it: contrast ratio 7.4:1 vs 8:1, warmth, brightness, direction. Buttons: "Match light to reference (auto)", "Undo", "Save as plan v3".
```

### 5 · Shots (previs)
```
Same style. Screen: SHOTS, the previs board for Scene 12.
A storyboard grid of 6 shots (12A to 12F). Each card: frame rendered from the 3D camera, shot size, lens, camera move, duration, status (Reference / Planned / Set sheet ready). A timeline strip across the bottom with shot durations and a play button "Play previs 00:00:42". Right panel: selected shot 12C details and its linked reference.
```

### 6 · Mood Board
```
Same style. Screen: MOOD BOARD for "Neel".
A free canvas of reference frames grouped into 3 clusters with titles ("Night interiors", "Sodium & teal", "Close-ups"). Each frame shows its extracted palette strip under it. Sticky notes from the director. Right panel: the board's combined palette (8 swatches with hex) and tags. Buttons: "Add reference", "Extract palette", "Export board (PDF)".
```

### 7 · Set Sheet (print and phone)
```
Same style, but this one is a light, print-ready document. Show two things side by side: an A4 portrait page and a phone screen of the same content.
SET SHEET, Shot 12C, Kitchen, night. Top-down lighting plot with standard light symbols, camera and actor marks, distances in metres. Gear list with checkboxes and quantities. Camera settings table (lens 35 mm, T2, ISO 3200, 180° shutter, WB 3200 K). Setup order (6 numbered steps). Power and safety notes. The reference frame and target numbers (ratio 8:1, key 2000 K) in a corner.
```

### 8 · Library
```
Same style. Screen: LIBRARY of saved looks.
Grid of look cards: thumbnail, palette strip, key direction mini-dial, ratio, colour temperature, tags ("neo-noir", "sodium", "hard key"). Left: filters (mood, light hardness, colour temperature range, project). Selected look opens a side panel with its numbers and "Apply to shot…" and "Compare with…".
```

### 9 · Settings: AI and connections
```
Same style. Screen: SETTINGS → AI & CONNECTIONS.
Cards:
1) "Claude Code: your own subscription". Status: connected. Text: "Claude Code runs Look Lab through its MCP connection. 42 Look Lab tools available." Button "Copy setup command".
2) "Anthropic API key: for in-app AI buttons". Masked key, monthly cap ₹2,000, used ₹340, progress bar.
3) "Other AI providers" (image models, 3D): add buttons, none connected.
4) "Local models": Segmentation loaded 480 MB, Depth off. Memory meter: "Look Lab is using 1.1 GB of 8 GB".
5) "Privacy": toggle "Client footage stays on this computer unless I allow cloud for a project".
6) "No AI mode": toggle. Everything works by hand.
```

### 10 · Activity log
```
Same style. Screen: ACTIVITY, every decision the system made.
A table: time, action, tier chip (T0 Instrument / T1 Fast model / T2 AI / T3 Human), rule id (R4, R8, R13…), result, confidence, cost, verdict (Agreed / Overridden). Filter chips by tier and by shot. One row expanded, showing the inputs and why the rule fired.
```

### 11 · Command palette
```
Same style. The BREAKDOWN screen dimmed with a ⌘K COMMAND PALETTE open in the centre. Search "light". Results list actions, each with a keyboard shortcut and a small grey tag with its tool name, e.g. "Fit light to reference  ·  breakdown.fit_light", "Match light in set plan  ·  plan.match_light", "Add light  ·  plan.add_light". The same actions are available as buttons and to Claude Code.
```
