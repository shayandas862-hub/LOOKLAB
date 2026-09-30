# 09 · Models and hardware

Sources were read during the planning conversation; model landscape moves fast, so **re-check licence, size and availability before building on any row**. Nothing here has been run on the owner's machine.

## Hardware: M1 MacBook (2020), 8 GB unified memory
- Budget the local loop at about 6 GB total, leaving room for macOS and the browser.
- Run one model at a time. Unload before loading the next.
- Good locally: FFmpeg, OpenCV, three.js proxy, small segmentation and depth models (Core ML / MLX / ONNX), a 421M decision model.
- Not viable locally: diffusion relight, instruction image editing with large models, image-to-3D. Use cloud GPUs.
- The M1 has no CUDA. Anything that requires CUDA goes to the cloud or needs a port.

## Model landscape
| Need | Candidate | Notes | Where |
|---|---|---|---|
| Relight / inverse + forward rendering | **DiffusionRenderer** (NVIDIA) | Video-capable inverse and forward rendering; heavy; check licence | Cloud |
| Relight a still, fast | **IC-Light** (and a multi-view extension, arXiv 2511.13684) | Light-conditioned relight; the multi-view extension is research-stage | Cloud |
| Image → 3D | **TRELLIS.2** incl. an Apple Silicon port | Port reported ~18 GB peak and ~3.5 min on an M4 Pro, vertex colours only → **not viable on 8 GB** | Cloud |
| Segmentation | **SAM 3 / SAM 3D** (Meta, Nov 2025) | Check size and licence; a smaller SAM variant or a distilled model may be needed for 8 GB | M1 if small enough, else cloud |
| Depth | **Depth Anything V2 Small**, **Depth Anything 3**, **Apple Depth Pro** | V2 Small is the light option; Depth Pro is heavier and metric | M1 |
| Decision model | **Laya** (Convai Innovations, 421M, Apache 2.0, MLX, ~13 ms reported) | Runs on the M1; vendor-reported latency | M1 |
| Decision model (hosted) | **Jev** (TypeSafe) | Hosted API; state text leaves the machine | API |
| Labels, reasoning | Claude (vision) | Semantic labels, not measurements | API / Claude Code |
| Video tools | FFmpeg (`scdet`, `select`, `vidstabdetect`), OpenCV | Deterministic T0 | M1 |
| Reference renderer | Blender headless (EEVEE/Cycles) | `blender --background --python script.py` | M1 |

"OpenDecider"-style decision-model benchmarks were vendor-sourced. Do not rely on them; measure on your own decisions (`06-DECISION-LAYER.md`).

## Cloud notes
- Pick a provider behind an adapter so it can change (P5). Options to compare: RunPod, Modal, Replicate, fal, Lambda. Compare price per GPU-second, cold start, and whether you can bring your own container.
- Every job goes through a queue with a cost log and a content-hash cache.
- Uploading client photos to a third party needs consent and a data-handling line in the client agreement. Some providers train on inputs by default; check.
- Budget a cap per day and a hard stop in code.

## Licence caution
Open weights differ: some are non-commercial, some restrict territory or require attribution, some exclude competitive use. The owner sells to clients, so **commercial use must be confirmed per model**, including the exact weights and the exact version. Record the result in a `LICENSES.md` per model before wiring it in (P5). If a licence is unclear, treat it as not allowed.

## Claude Code and usage billing
- Claude Code is included with Claude Max (5x about $100, 20x about $200 per month at the time of the conversation; confirm current pricing).
- One source read during planning said automated use (`claude -p`, the Agent SDK, scheduled headless runs) may be **billed at API rates after a monthly credit**, separate from the interactive subscription. This was not verified. Check Anthropic's current docs before designing an unattended pipeline around Claude calls, and keep the T2 labelling step optional and metered.
- Cloud Claude Code (in the browser) cannot reach a local Blender. Use Local mode or Remote Control on the owner's machine for anything that drives Blender.

## Node/Python environment for the repo
- Node 18+ and Python 3 (for `src/build.py`).
- Playwright (`npm install`) and a Chromium. In the original cloud container Chromium was at `/opt/pw-browsers/chromium`; on the M1 run `npx playwright install chromium`.
- `npm run fetch:three` downloads three.js r128 to `vendor/three.min.js` (not committed in the zip).
- Blender, FFmpeg and OpenCV are not installed by the repo; Phases 2–3 list them as prerequisites.
