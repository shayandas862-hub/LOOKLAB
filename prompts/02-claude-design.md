# Prompt 2 · Claude Design: the UI file

Attach the ChatGPT images you kept (one per screen), then paste the block below. Export when done; put the export in `design/` inside the project folder so Claude Code can read it.

---

```
Build a high-fidelity, clickable prototype of LOOK LAB. The attached images are layout and mood references from an image model: follow their structure, but rebuild everything cleanly, and fix any garbled text or inconsistent numbers.

WHAT IT IS
An internal desktop tool for a film production team: a technical pre-production brain that cuts cost and mistakes on set by working the shot out before the shoot.
Core loop, per shot:
1. BREAK DOWN a reference frame or video: exact colour palette (hex + share), light (direction as azimuth/elevation, hardness, colour temperature, key:fill ratio, practicals), lens, framing, camera movement, mood.
2. ADAPT to our reality: our location (photos, dimensions, windows, power, shoot hours) and our kit (lights, modifiers, gels, camera, lenses, crew). Output: a RECIPE with steps, GAPS (what we lack) and RISKS.
3. PLAN IN 3D: a movable model of the location. Place and move lights, camera and actors; views: 3D, top-down plot, camera view. A LOOK MATCH score compares the camera view with the reference and shows the numbers behind it.
4. EXECUTE: a SET SHEET (lighting plot, gear checklist, camera settings, setup order, power notes) for print (A4) and phone.
Around it: Projects, Shots (previs storyboard + timeline), Mood Board, Library of saved looks, Settings (AI & connections), Activity log.

USERS
DPs, gaffers, directors, producers. They want numbers they can trust and edit by hand.

PRODUCT RULES THE UI MUST SHOW
1. Every value shows its source: MEASURED, AI (with confidence %), MANUAL, or SAMPLE (placeholder data). Never style an AI guess like a measurement.
2. Every AI action has a manual path beside it ("Generate recipe (AI)" / "Write it myself"). A "No AI mode" must leave every screen usable.
3. Every action is a named command, e.g. breakdown.fit_light, plan.add_light, plan.match_light, setsheet.export_pdf. The same command is reachable three ways: a button, the ⌘K command palette (shows the command name), and Claude Code over MCP. Show the command name in button tooltips.
4. AI connection: people use their own Claude subscription by running Claude Code, which controls Look Lab through MCP. Separately, an API key powers in-app AI buttons, with a monthly spend cap. Never show a "Sign in with Claude" button inside the app.
5. Client footage stays on the computer unless cloud is allowed per project.

VISUAL DIRECTION
- UI chrome strictly neutral grey with zero hue, because users judge colour. Images are the hero, never cropped, on a neutral surround.
- One accent colour, only for selection and primary actions. Amber for gaps/warnings, red only for errors.
- Numbers in a monospaced font with units (°, K, mm, stops, %, m).
- Dense but calm, like professional grading and 3D software. 8 px grid, 13 px base text.
- Desktop first: 1440×900, must work down to 1280×800. Set Sheet also at 390 px phone width and A4 print.
- Theme: use the direction in the attached images (dark or light neutral). Provide tokens so the other theme is a token swap.

SCREENS
Projects · Breakdown · Location & Kit · Set Plan (3D) · Shots · Mood Board · Set Sheet · Library · Settings: AI & Connections · Activity · ⌘K command palette overlay.

STATES (design each where it applies)
Empty (no reference yet: drag in a video or image) · Uploading · Analysing (per step progress: shots detected → colour → light → lens → framing → mood) · Low confidence, needs review · AI not connected (manual still works) · Spend cap reached · Error with a retry · Offline.

SAMPLE DATA (same everywhere)
Project "Neel" (short film) · Scene 12 "Kitchen, night" · Shot 12C.
Reference: woman at a kitchen counter at night, hard orange sodium light from screen-left through a window, cold blue ambient.
Palette: #1B2230 38%, #3E4A52 22%, #C7803A 14%, #6E5B4A 11%, #E9C9A0 9%, #0D0F12 6%.
Light: key −60° az, 25° el, hard, 2000 K; fill 5600 K ambient; ratio 8:1 (3 stops).
Lens ≈40 mm (AI 72%); MCU; subject on left third; static; 2.39:1.
Location "Ballygunge flat, kitchen": 3.1 × 4.2 m, ceiling 2.9 m, east window 1.2 m, power points 5 A and 15 A, shoot 19:00–02:00.
Kit: 600 W bi-colour COB ×1, 60 W LED panel ×2, 4 ft RGB tube ×1, 4×4 frame + ½ grid, flags ×2, CTO full/½, haze. Camera FX3, primes 24/35/50/85. Crew: DP, gaffer, 1 spark.
Actors: Rhea (mark 1), Arjun (mark 2). Look match 87% (ratio 7.4:1 vs 8:1).

DELIVER
1. The clickable prototype: every screen, the core loop clickable end to end (Breakdown → Adapt → Set Plan → Set Sheet).
2. A design system page: tokens (colour, type, spacing, radius, elevation), components (source badge, swatch, light dial, value field with unit, recipe step, gap/risk box, outliner row, properties field, match score, tier chip, command palette row).
3. A HANDOFF document for Claude Code containing:
   - screen list with purpose;
   - component inventory with props and states;
   - the ACTION CATALOGUE: a table of every command the UI triggers: name, screen, inputs, outputs, AI or deterministic, needs human confirmation (yes/no);
   - the data each screen reads and writes (reference, breakdown, location, kit, recipe, set plan, shot, look, decision log row).
```
