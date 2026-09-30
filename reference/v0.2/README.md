# Look Lab

Reverse-engineer the *look* of a reference frame (light, lens, framing, set) into numbers, then steer it: move the light and the camera, drop cast and props into a 3D scene, and match the scene's light to the reference.

**Status: working prototype (v0.2), single-file HTML, all model calls mocked.** The renderer, the fit search, the match metric, the 3D scene and the decision log are real code. Segmentation, outfit generation, image-to-3D, the language-model label and the hero (image-model) render are stand-ins.

Owner: Shayan (Kolkata). Target machine: M1 MacBook, 8 GB RAM, free/open tools, Claude Max + Claude Code.

## Open it

```sh
python3 src/build.py          # writes dist/look-lab.html and dist/index.html
open dist/index.html          # needs internet: three.js from cdnjs, fonts from Google Fonts
```

`dist/look-lab.html` is the fragment that was published as a Claude artifact (the host supplies doctype/head/body). `dist/index.html` is the same content wrapped so it opens directly in a browser.

## The three tabs

| Tab | What it is | Real or mocked |
|---|---|---|
| 1 · Reference fit | Synthetic reference frame (hidden true light) next to a reconstruction. Auto-fit recovers light direction, softness, intensity, colour temperature, fill ratio from pixels only. Decision log, taste library, top-view gizmo. | Renderer, fit, fingerprints, tags: real. FFmpeg ingest + language-model label: sample text. |
| 2 · Live scene | three.js room plate, two cutout cast members, three props, a shadow-casting key light. Drag anything in 3D, orbit, swap outfits, upgrade card → mesh, match the light to a reference, hero-render stand-in, editable scene-graph JSON. | Scene, interaction, relight, shadows, match metric, JSON: real. Cutout, outfit, image-to-3D, hero render: stand-ins (procedural). |
| 3 · How it works | Architecture (two loops), model-by-stage table, decision rules R10–R14, risks, phases. | Documentation in the UI. |

Screenshots: `docs/img/`.

## Verify

```sh
npm install                    # playwright only
npm run fetch:three            # vendor/three.min.js for the e2e test
npm test                       # build + core fit test + 20 end-to-end checks
# CHROMIUM_PATH=/path/to/chromium npm run test:e2e   if Playwright has no browser
```

Last verified in the build session: core fit 5/5 cases pass; e2e 20/20 checks pass (headless Chromium with software WebGL).

## Read in this order

1. `CLAUDE.md` — how to work in this repo (Claude Code reads it at session start)
2. `docs/01-VISION.md`, `docs/02-PRD.md` — what and why
3. `docs/03-ARCHITECTURE.md` — how it is meant to work at full size
4. `docs/04-PROTOTYPE-REFERENCE.md` — exactly what exists today, file by file
5. `docs/07-PHASES.md` — what to build next, with acceptance tests
6. `docs/08-VALIDATION.md` — what has and has not been proven
7. The rest: schema, decision layer, models and hardware, decision log and open questions, studio context

## Layout

```
src/   base.html (tab 1 + core math)   scene.css   nav.html   panels.html   scene.js   build.py
dist/  look-lab.html  index.html       (generated; committed so the published build is reproducible)
tests/ core-fit.test.js  live.e2e.js   (outputs in tests/out/)
docs/  01..11 markdown + img/
scripts/fetch-three.sh   vendor/ (three.min.js, git-ignored)
```
