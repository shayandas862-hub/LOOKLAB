# 02 · PRD (product requirements)

Status: draft derived from the conversation and the prototype. Open questions are in `10-DECISIONS-AND-OPEN-QUESTIONS.md`.

## Users
1. **Primary: the owner**, a solo VFX/3D freelancer (developer background) working on an M1 MacBook with 8 GB RAM, Blender, Claude Max and Claude Code, using free/open tools.
2. **Secondary: the owner's clients** (brands, agencies, filmmakers) who see output in pitches: look boards, relit mock-ups, style matches.

## Jobs to be done
- J1. "Make my shot look like this reference." Measure the reference, reproduce its light and framing in my scene.
- J2. "Show the client three lighting options in a room they gave me photos of," without a full Blender build per option.
- J3. "Try this character in a different outfit, in this location, lit this way."
- J4. "Remember what worked." Save a look as a fingerprint; apply it to the next scene.
- J5. "Let Claude drive the tool." The scene is JSON; Claude Code can write and edit it.

## User stories (mapped to what exists)
| # | Story | Status in prototype |
|---|---|---|
| US1 | As a user I pick a reference and the system estimates light direction, softness, intensity, colour temperature, fill ratio. | Done on synthetic frames (tab 1) |
| US2 | I see where the estimate is wrong (residual overlay) and can correct it by hand. | Done (tab 1) |
| US3 | I drag the key light and camera in a top view and see the image change. | Done (tab 1 and tab 2) |
| US4 | I see every routing decision the system made, and which are rules vs models vs me. | Done (decision log, pipeline log) |
| US5 | I save a look and apply it elsewhere. | Done (tab 1 library; apply sets light only) |
| US6 | I place cast, props and a plate in 3D, move anything anywhere. | Done with procedural stand-ins (tab 2) |
| US7 | I change a character's outfit by describing it. | Stand-in (colour + garment words) |
| US8 | I upgrade a flat cutout to a 3D mesh when the camera orbit needs it. | Stand-in (primitive mesh); rule R11 flags when |
| US9 | I match the scene's light to a reference and see a match score with the numbers behind it. | Done (cheek lit:shadow, brightness, warmth) |
| US10 | I get a final-quality frame of the current scene. | Stand-in (colour transfer, bloom, grain) |
| US11 | I edit the scene as JSON (or Claude does) and apply it. | Done |
| US12 | I upload my own location photo and cast photo. | Crude (colour key cutout; flatten-the-light plate). Not covered by tests |
| US13 | I feed real video and get the same analysis. | **Not built** (FFmpeg ingest is sample text) |

## Scope of the first real version (MVP = Phases 0–4)
In: real ingest of video/stills on the M1 (FFmpeg + OpenCV), real lighting fit verified by a Blender render-and-compare, cutout + depth/normals on the M1, scene graph with validation and save/load, the live scene on real assets.
Out (later phases): cloud outfit edit, cloud image-to-3D, hero pass, learned decision router, Blender export.

## Non-goals
- Real-time diffusion on the M1.
- Video generation, per-frame diffusion, temporal consistency research.
- Full body/face 3D reconstruction from a single photo on local hardware.
- Claims of matching "taste". The system reports measurable lighting properties.

## Constraints
- Hardware: M1, 8 GB unified memory. Local loop must stay under ~6 GB.
- Cost: free/open tools first; paid cloud jobs only behind an explicit job queue with a cost log.
- Claude usage: Max subscription; one source reported automated `claude -p` / Agent SDK usage may be billed at API rates after a monthly credit — verify before designing an unattended pipeline (`09-MODELS-AND-HARDWARE.md`).
- Delivery: single-file HTML while it lives as a Claude artifact; standalone app is a deliberate Phase 0 option.
- Licences: check each model's licence (territory and commercial limits) before client work.

## Success metrics (measurable)
| Metric | Target | Where measured |
|---|---|---|
| Light direction error on synthetic ground truth | az ≤ 15°, el ≤ 8° (today: ≤ 10° / ≤ 2° on 5 cases) | `tests/core-fit.test.js` |
| Residual after fit | ≤ 0.02 mean abs RGB (today ≤ 0.005) | same |
| Light-match score in the live scene | ≥ 85% accepted (today 99 / 88 / 94 on the 3 samples) | `tests/live.e2e.js` |
| Real-footage fit (Phase 3) | within 15° az on a Blender ground-truth set of ≥ 20 scenes | to build |
| Cutout quality (Phase 4) | mean mask IoU ≥ 0.9 on a 10-photo golden set | to build |
| Identity gate (Phase 5) | face-similarity above a threshold chosen on a labelled set | to build |
| Blind A/B, hero vs proxy (Phase 6) | hero preferred in ≥ 70% of pairs by 5+ raters | to build |
| Time to first useful result | ≤ 60 s on the M1 + cloud | to build |
| Decision log rows with human verdicts | ≥ 500 before training a router | grows with use |

## Risks
See `03-ARCHITECTURE.md` (what will go wrong) and `10-DECISIONS-AND-OPEN-QUESTIONS.md`.
