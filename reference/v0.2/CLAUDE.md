# CLAUDE.md — Look Lab

You are continuing a working prototype. Read `README.md`, then `docs/04-PROTOTYPE-REFERENCE.md` before changing code, and `docs/07-PHASES.md` to see what to build next. The owner works from a PRD, architecture, phases and tests: keep that discipline. Finish each phase with its acceptance tests passing.

## What this is
A tool that turns a reference frame's look (light, lens, framing, set) into numbers, then lets the user steer it in a live 3D scene and match the scene's light to the reference. Two loops: a **fast proxy loop** (three.js, real time, runs on an 8 GB M1) and a **slow image-model loop** (cutouts, outfits, 3D meshes, hero relight; cloud). Image models are never the renderer.

## Commands
```sh
python3 src/build.py     # src/* -> dist/look-lab.html + dist/index.html
npm run fetch:three      # once; vendor/three.min.js for the e2e test
npm test                 # build + node tests/core-fit.test.js + node tests/live.e2e.js
CHROMIUM_PATH=/path/to/chromium npm run test:e2e   # if Playwright has no browser installed
```
Run `npm test` before you say a change is done. The e2e test needs WebGL; it uses software WebGL (SwiftShader) in headless Chromium, so the match step takes 5 to 7 seconds there.

## Hard constraints (do not break without asking)
1. **Single-file output.** The prototype ships as one HTML page (the Claude artifact host enforces a CSP). External scripts only from cdnjs.cloudflare.com, cdn.jsdelivr.net/npm, unpkg.com, cdn.tailwindcss.com, code.jquery.com; stylesheets only from Google Fonts. Everything else is inline. No `alert/confirm/prompt`, no downloads via `<a download>`, `localStorage` only as a convenience wrapped in try/catch. If you leave the artifact host (Vite/Tauri/Electron app), do it as a new phase (P0 in `docs/07-PHASES.md`), not silently.
2. **three.js is pinned to r128 (UMD).** r128 has no `CapsuleGeometry`, no `physicallyCorrectLights` default, and `shadow.radius` only works with `PCFShadowMap`. Upgrade deliberately and re-run tests.
3. **Never present a stand-in as a model call.** Everything mocked is tagged `sample` in the decision/pipeline log and described as a stand-in in the UI. When you replace a stand-in with a real model, remove the tag in the same commit and add a test.
4. **Honest metrics.** The fit is validated only against synthetic ground truth. Do not write copy that claims accuracy on real footage until Phase 3 tests exist.
5. **Hardware.** Target is an M1 with 8 GB. Anything needing more than ~6 GB or a CUDA GPU goes behind a cloud job (Phase 5), never in the local loop.
6. **Both globals.** `base.html` (tab 1) and `scene.js` (tab 2) run as two classic `<script>`s sharing the global scope. `scene.js` depends on these globals from tab 1: `renderScene, createFit, downsample, fingerprint, lumD, hash2, clamp, keyColor, REFS, NEUTRAL, W, H, FW, FH, paint, sizePlan, drawPlan`. Renaming them breaks tab 2.
7. **Colour/themes.** The page is deliberately dark-only (a grading-suite look): every colour is a token on `:root`, `color-scheme: dark`, explicit body background. Keep it that way unless asked.
8. **Keep the `[hidden]{display:none!important}` rule** in `scene.css`: tab panels rely on it, and `.tabpanel{display:flex}` would otherwise override the `hidden` attribute.

## Conventions
- Source of truth is `src/`; `dist/` is generated. Edit `src/`, rebuild, commit both.
- The CORE block in `src/base.html` (between `/*CORE-START*/` and `/*CORE-END*/`) must stay DOM-free: `tests/core-fit.test.js` extracts and runs it in Node.
- Test hooks for the scene live on `Live.api` (see `docs/04-PROTOTYPE-REFERENCE.md`). `Live` is a top-level `const`, so from Playwright use `typeof Live !== 'undefined'`, not `window.Live`.
- Decision rules are numbered (R1–R14). New rules get the next number and a row in `docs/06-DECISION-LAYER.md`.
- Plain, direct prose in UI copy and docs. No filler. State limits.

## Where to start
Phase 0, then Phase 1 (see `docs/07-PHASES.md`). Each phase card lists deliverables and the exact tests that must pass. Log decisions in `docs/10-DECISIONS-AND-OPEN-QUESTIONS.md` (next id D-013).

## Known gotchas (cost us time once)
- Test wrapper without the host skeleton had no `[hidden]` rule, so all tabs rendered at once and pointer tests missed their targets. Use `dist/index.html` for local tests.
- Whole-face lit:shadow measured 14:1 on the scene against 4.5:1 on the reference because painted eyes/brows dominated the 10th percentile. The match metric now uses cheek windows only (D-007). Do not revert to whole-face stats.
- Rendering to a `WebGLRenderTarget` needs `rt.texture.encoding = THREE.sRGBEncoding` or the readback is linear and the metric is wrong.
- `renderer` has `preserveDrawingBuffer:false`: capture the canvas in the same tick as `render()` (see `heroRender`).
- `ctx.filter='blur()'` is not supported in Safari; the hero bloom is wrapped in try/catch and silently skipped there.
