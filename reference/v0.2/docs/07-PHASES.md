# 07 · Phases

Work in order. Each phase ends when its acceptance tests pass, not when the code exists. Each card ends with a **start prompt** you can paste into Claude Code.

Legend: **M1** = runs locally on the 8 GB MacBook. **Cloud** = rented GPU behind a job queue. Phases 0–4 are the MVP (PRD).

---

## P0 · Repo hygiene and refactor
**Goal.** Make the prototype safe to change: split the code into modules without changing behaviour, and decide whether to leave the single-file artifact.

**Deliverables**
- Extract the DOM-free CORE into `core/` (ES module or UMD) so tests import it instead of regex-extracting it.
- Keep the build producing the single-file artifact from the modules (esbuild or a small script). `dist/look-lab.html` must still load under the artifact CSP.
- Decision D-013: stay single-file for now, or move to a Vite app (and Tauri/Electron later). Record it.
- Add tests for the upload paths (photo cutout and plate) with fixture images in `tests/fixtures/`.
- `npm test` runs build, core test, e2e.

**Acceptance**
- `npm test` passes with the same numbers as `08-VALIDATION.md` (5/5 core cases, 20/20 e2e) or better.
- Built output behaves the same: tab-1 auto-fit ≥ 90%, scene match ≥ 85% on all three samples, JSON round-trip exact.
- Upload tests: a fixture person photo yields a card with non-empty alpha; a fixture plate yields a textured back wall.

**Risks.** Breaking the shared globals between the two scripts (see `CLAUDE.md`). three.js r128 API limits.

**Start prompt.** "Read CLAUDE.md and docs/04-PROTOTYPE-REFERENCE.md. Do Phase 0 in docs/07-PHASES.md: extract the CORE block into a module, keep the build output identical in behaviour, add upload-path tests with fixtures, log D-013. Run npm test before you finish."

---

## P1 · Scene graph as a real format
**Goal.** The scene JSON becomes a versioned, validated file format that can be saved, loaded, undone and exported.

**Deliverables**
- Formal JSON Schema for v1 (`schema/scene-v1.json`) and a validator. Reject unknown `kind`, duplicate ids, non-finite numbers, with messages that point at the path.
- Enforce `version`; write a v1 → v2 migration function stub and a test.
- `lightRig[]` (more than one light), per-element `material`, plate asset reference (file + hash).
- Save/load to a file (when out of the artifact host) and to `localStorage` (inside it, try/catch).
- Undo/redo stack over scene-graph diffs.
- glTF export of the scene (elements, camera, lights) for Blender import.

**Acceptance**
- Property test: random valid scenes survive `toJSON → applyJSON → toJSON` unchanged.
- Invalid-input test table: each bad file yields the expected error path and leaves the scene unchanged.
- Exported glTF imports into Blender headless (`blender --background --python check.py`) and the camera and light positions match the JSON within 1 cm and 0.1°.

**Risks.** Coordinate handedness between three.js (Y up, right-handed) and Blender (Z up). Write the conversion once and test it.

**Start prompt.** "Do Phase 1 in docs/07-PHASES.md using docs/05-SCENE-GRAPH-SCHEMA.md as the v1 spec. Write the JSON Schema and validator first, then the tests, then save/load, undo and glTF export. Verify the export by importing it in headless Blender if Blender is installed; otherwise say so."

---

## P2 · Real ingest on the M1
**Goal.** Replace the sample ingest with real video and still analysis.

**Deliverables**
- CLI `ingest <file>` (Node or Python): FFmpeg scene detection (`scdet`/`select=gt(scene,…)`), keyframes per shot, contact sheet, JSON report per shot.
- OpenCV measurements per keyframe: luminance zones, contrast, palette, dominant colour temperature proxy, face detection (size ratio → shot scale), composition (subject position, thirds).
- Camera-motion estimate per shot (`vidstabdetect` or optical flow): static / pan / tilt / handheld / push.
- T2 labels (shot type, lighting style, mood) from Claude vision on the keyframes, with the confidence rule R5. Mark these clearly as model output.
- The web UI loads a report and populates tab 1's reference from a real frame.

**Acceptance**
- On a 10-clip fixture set with known cuts, shot boundaries are within ±2 frames for ≥ 90% of cuts.
- Face-size ratio matches hand labels on ≥ 90% of a 20-frame set.
- Ingest of a 60 s 1080p clip finishes in under 60 s on the M1 (report the real number).
- Labels are stored with `source:"claude"` and never displayed as a measurement.

**Risks.** T2 label cost and the Claude usage-billing question (`09-MODELS-AND-HARDWARE.md`). Real footage is graded and compressed: expect the skin-statistics first guess to be noisier than on synthetic frames.

**Start prompt.** "Do Phase 2 in docs/07-PHASES.md. Build the ingest CLI with FFmpeg and OpenCV first, with tests on a small fixture set you generate with FFmpeg (known cuts). Add the Claude vision labelling as a separate, optional step. Report real timings."

---

## P3 · Real reference fit, verified against Blender
**Goal.** Make the lighting fit work on real frames and prove it with ground truth from a renderer we control.

**Deliverables**
- Build a ground-truth set: ≥ 20 Blender scenes (headless EEVEE or Cycles) with known light az/el/softness/kelvin/fill, a face or head model, varied skin tones and backgrounds. Script: `blender --background --python make_set.py`.
- Run the same fit on those renders. Report error per parameter and per skin tone.
- Face normals: fit against a face-landmark-based head-pose estimate so the light direction is relative to the face, not the image plane.
- Replace "camera and set assumed known" (D-008) with: lens from face-size ratio or EXIF, camera-relative light only.
- Blender render-and-compare **verify step** (R-verify): render the fitted rig in Blender and compare with the reference frame; escalate per R9.
- Publish an honest accuracy table in `08-VALIDATION.md`.

**Acceptance**
- Median azimuth error ≤ 15° and elevation ≤ 10° on the Blender set, including dark-skin and light-skin subjects. State the worst case.
- The fit's reported confidence correlates with actual error (Spearman ≥ 0.5). If it does not, say so and do not show a confidence.
- No claim of real-footage accuracy until a hand-labelled real set exists (≥ 20 frames) and its error is measured.

**Risks.** This is the hardest phase and the riskiest assumption. Softness is weakly identifiable from one frame (measured). Azimuth drifted to −90° in one case while the look match was 99%: the cheek metric can match look without matching direction. Consider adding a second statistic (nose shadow, eye-socket shading).

**Start prompt.** "Do Phase 3 in docs/07-PHASES.md. First create the Blender ground-truth generator and run the existing fit on it, then report errors before changing the algorithm. Do not claim real-footage accuracy. Put results in docs/08-VALIDATION.md."

---

## P4 · Asset ingest on the M1
**Goal.** Turn the user's photos into usable assets locally: cutouts, depth, normals.

**Deliverables**
- Segmentation with a small SAM-class model (export to Core ML / ONNX; fall back to a click-prompt UI). Replaces the colour key.
- Monocular depth (Depth Anything V2 Small or Apple Depth Pro, choose by measured speed and memory on the 8 GB M1).
- Normals from depth plus the silhouette; per-card normal map and depth displacement option.
- Plate to proxy room: camera projection mapping of the plate onto depth-derived geometry, with a floor plane estimated from depth.
- Asset store on disk: original, mask, depth, normals, hashes, provenance.

**Acceptance**
- Mean mask IoU ≥ 0.9 on a 10-photo golden set (people on varied backgrounds).
- Peak memory ≤ 6 GB and ≤ 10 s per person photo on the M1 (report actuals).
- Card with real normals shows correct shading direction change when the key moves (visual test plus a numeric check on the nose/cheek side).

**Risks.** Memory on 8 GB: run one model at a time. Depth is relative, not metric: scale the room by a known object or the user's input.

**Start prompt.** "Do Phase 4 in docs/07-PHASES.md. Start by benchmarking segmentation and depth models on the M1 (time and memory) and pick from the results. Build the golden set with me before claiming a number."

---

## P5 · Cloud asset jobs
**Goal.** Outfit edit and image → 3D as queued, costed, cached jobs.

**Deliverables**
- Job queue with states (queued, running, done, failed), retries, and a **cost log** (provider, GPU-seconds, USD).
- Provider adapter interface so the GPU host can change (RunPod, Modal, Replicate, fal or similar; decide in D-0xx).
- Outfit edit: instruction-edit image model given the person's reference, then an identity gate (face-similarity threshold chosen on a labelled set). Rule R12 becomes real.
- Image → 3D for props and hero characters (TRELLIS.2-class or similar), returning glTF with vertex colours or textures. Rule R10/R11 upgrade becomes real.
- Content-hash cache so the same input is never paid for twice.
- Licence check recorded per model (`09-MODELS-AND-HARDWARE.md`).

**Acceptance**
- A job round trip on a stub provider passes in CI (mock GPU). One real job passes manually with the cost logged.
- Identity gate rejects a deliberately different face in a test set and accepts the same person's edits (report TPR/FPR).
- Cache hit avoids the provider call (test).

**Risks.** Cost, latency (minutes), identity drift, licence terms (territory or commercial limits on some open weights), uploading client images to third parties (get consent; note it in the README for clients).

**Start prompt.** "Do Phase 5 in docs/07-PHASES.md. Build the queue, cache and cost log against a mock provider first, with tests. Then wire one real provider behind an adapter and tell me which licence terms apply before running any client photo."

---

## P6 · Hero pass and blind A/B
**Goal.** A final-quality still from the current proxy, and proof that it beats the proxy.

**Deliverables**
- Hero pass job: send proxy render, depth, normals, light rig and the reference to a relight/harmonise model (DiffusionRenderer / IC-Light class). Rule R13's escalation becomes real.
- Conditioning export from the viewer: RGB, depth, normals, masks (PNG) plus the light rig JSON.
- A/B tool: blind pairs (proxy vs hero, or hero vs hero across settings), logs the human verdict into the decision log.

**Acceptance**
- Identity gate passes on hero frames (same threshold as P5).
- Blind A/B: hero preferred in ≥ 70% of pairs by ≥ 5 raters, on ≥ 20 scenes. If not, report the number and do not advertise the hero pass.

**Risks.** Flicker on video (keep hero for stills/keyframes), the plate's baked light, licence terms.

**Start prompt.** "Do Phase 6 in docs/07-PHASES.md. Build the conditioning export and the blind A/B tool first, using the existing stand-in as arm B so the test harness is proven before any model is paid for."

---

## P7 · Learned decision router
**Goal.** Replace rules with a small model where the data supports it.

**Deliverables**
- SQLite `decisions` table with the record from `06-DECISION-LAYER.md`, and UI for the human verdict (agree / override).
- `decide()` wrapper with `rule`, `laya`, `jev` sources and shadow mode.
- Offline evaluation script: agreement vs human verdicts, per rule, held-out split.

**Acceptance**
- ≥ 500 rows with human verdicts before any training.
- A model controls a rule only if it beats the rule on the held-out split; otherwise the rule stays.

**Start prompt.** "Do Phase 7 in docs/07-PHASES.md. Start with the decisions table and the verdict UI, run in shadow mode, and do not train until there are enough labelled rows."

---

## P8 · Blender bridge
**Goal.** Take a look from the viewer into a real render.

**Deliverables**
- USD or glTF export of the scene graph with lights and camera (builds on P1).
- Blender headless script that loads the export, sets up EEVEE/Cycles, renders a still and returns the path. Used by P3's verify step.
- Optional: Local-mode Claude Code drives Blender on the user's machine (cloud Claude Code cannot reach a local Blender).

**Acceptance.** Exported scene renders headless with light direction within 5° of the JSON, and a side-by-side proxy vs Blender image is produced.

**Start prompt.** "Do Phase 8 in docs/07-PHASES.md. Use the glTF exporter from Phase 1. Write the Blender headless script and a golden-render test."

---

## Cross-cutting: taste database
SQLite, introduced in P2 and used from P7: `looks` (fingerprint, tags, source frame hash, fitted rig), `decisions` (see above), `assets` (hashes, provenance), `jobs` (cost log). Keep the fingerprint format from tab 1 (`fingerprint()`: lit:shadow ratio, warmth, palette, shot scale) and add a version field.

## Order of work, if time is short
P0 → P1 → P3 (the riskiest assumption; find out early) → P2 → P4 → P5 → P6 → P7 → P8. P3 can start once P0 is done because it needs Blender, not the ingest.
