# 08 · Validation: what is tested, what is not

Read this before believing any number in the UI. Everything below was run in headless Chromium with software WebGL (SwiftShader) in a Linux cloud container, not on the owner's M1.

## Method
Synthetic ground truth. `renderScene` (tab 1's renderer) renders a face with a **known** light rig. The fit sees only the pixels and must recover the rig. Error = fitted − true. This proves the fit inverts its *own* renderer. It does not prove anything about real footage (see "Not validated").

## Core fit: `node tests/core-fit.test.js` (5 cases, 5 pass)
Thresholds asserted: Δaz ≤ 15°, Δel ≤ 8°, ΔK ≤ 500, Δfill ≤ 0.6 stops, residual ≤ 0.02. Softness is reported but **not asserted**.

| Case | Steps | Residual | Δaz | Δel | ΔK | Δfill | Δsoft |
|---|---|---|---|---|---|---|---|
| rembrandt | 23 | 0.0037 | 3° | 0° | 150 | 0.05 | 0.12 |
| beauty | 20 | 0.0022 | 1° | 1° | 13 | 0.03 | 0.12 |
| noir | 16 | 0.0027 | 7° | 0° | 50 | 0.05 | 0.26 |
| extra-a | 15 | 0.0017 | 0° | 2° | 0 | 0.02 | 0.06 |
| extra-b | 26 | 0.0050 | 10° | 1° | 188 | 0.06 | 0.30 |

Reading it: direction, elevation, temperature and fill are recovered well on synthetic frames. Softness errors of 0.06–0.30 (on a 0–1 scale) show it is **weakly identified** from a single frame, which is why it is not asserted. Azimuth error up to 10° at the worst case.

PNGs of the cases are written to `tests/out/` when the test runs.

## Live scene: `node tests/live.e2e.js` (20 checks, 20 pass)
Playwright drives `dist/index.html` with three.js r128 served from `vendor/three.min.js`.

| Check | Result |
|---|---|
| Tab-1 auto-fit on load reaches ≥ 90% | 96% |
| Scene ready (WebGL, textures, elements) | pass |
| Scene-graph JSON round-trips exactly | pass |
| Invalid JSON is rejected and the scene unchanged | pass |
| Dragging an element on the floor moves and selects it | pass |
| Dragging empty space orbits the camera | pass |
| Dragging the key light moves it | pass |
| Match to reference 0 ≥ 90% | 99% |
| Match to reference 1 ≥ 80% | 88% |
| Match to reference 2 ≥ 85% | 94% |
| R11 fires when a card is viewed > 35° off-axis | pass |
| Outfit prompt parser: colour + garment words accepted, unknown text rejected | pass |
| Outfit swap rebuilds the card | pass |
| Card → mesh upgrade | pass |
| Hero render stand-in completes | pass |
| Tab 1 still visible after visiting the other tabs | pass |
| No horizontal scroll at 400 px on fit, live, how (three checks) | pass |
| No page or console errors | pass |

Each match threshold is set just under the measured value; they are regression guards, not accuracy claims.

## Known weaknesses found while testing
- **Softness** is weakly identified (above).
- **Azimuth vs look.** In one test the matcher settled at az −90° for a reference generated at −52° while the cheek look matched at 99%. The cheek metric (lit:shadow ratio, brightness, warmth) can be satisfied by several directions. Phase 3 should add a second, direction-sensitive statistic.
- **The noir reference first stalled at 50%** because ambient light set a floor on the shadow side. Fixed with the `amb` knob (→ 94%). Other extreme references may expose similar floors.
- **Whole-face metrics fail** (painted eyes/brows dominate). Cheek windows only (D-007).

## Not validated
| Area | Why it matters |
|---|---|
| Real footage or real photos of any kind | No real reference was tested. Real frames are graded, compressed, with hair, glasses, beards, makeup, skin-tone spread. |
| Real M1 GPU performance and memory | All timing is software WebGL in a cloud container (match step 5–7 s there). Real frame rate and memory on 8 GB are unmeasured. |
| Safari, Firefox, iOS/Android browsers | Only headless Chromium. Known: `ctx.filter` blur not supported in Safari (hero bloom is skipped there in try/catch). |
| Real phone touch and pinch | Layout at 400 px is checked; real touch gestures are not. |
| Photo upload paths | Colour-key cutout and plate flattening exist but have no tests. Phase 0 adds them. |
| Camera/lens estimation | Tab 1 assumes camera and set are known (D-008). |
| Any claim about "taste" | Nothing here measures whether a look is good. |
| Hero pass | A stand-in (colour transfer, bloom, grain). No image model is called anywhere in the prototype. |

## How to add a validation
Write the test first, state the threshold and why, run it, record the actual number here, and only then touch UI copy. Thresholds go just under the measured value only for regression tests; accuracy claims need an independent ground-truth set (Phase 3).
