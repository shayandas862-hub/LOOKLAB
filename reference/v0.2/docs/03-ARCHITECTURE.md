# 03 · Architecture (target system)

This describes the system at full size. `04-PROTOTYPE-REFERENCE.md` describes what exists today.

## Principle: image models are not the renderer
On an 8 GB M1 nothing diffusion-based runs at interactive speed. So there are two loops around one scene graph:

```
 RAW INPUTS            INGEST (once per asset)             SCENE GRAPH             TWO LOOPS
 plate photos   ─┐    T1 · M1: cutout, depth, normals      JSON, source of truth   FAST LOOP · M1 · now
 cast photos    ─┼──► T1 · M1: plate → proxy room  ───────► elements + transforms  three.js proxy: normal-mapped
 prop photos    ─┤    T2 · cloud: outfit edit               light rig, camera      cards, meshes, shadows; you drag,
 reference      ─┘    T2 · cloud: image → 3D mesh            plate state            relight, orbit; T0 measures look
                                                                                    match vs the reference
                                                                                  HERO LOOP · cloud · on demand
                                                                                    diffusion relight / harmonise,
                                                                                    conditioned on proxy depth, normals,
                                                                                    light rig and the reference
```

The fast loop is what the user touches. The hero loop produces the final still. Image models also do the one-time asset work (outfits, meshes).

## Tiered cascade with verification
| Tier | Kind | Examples | Failure mode |
|---|---|---|---|
| T0 | Instruments, deterministic | FFmpeg scene detect, OpenCV measurements, the fit search, the match metric | Wrong assumptions, not randomness |
| T1 | Fast learned models | SAM-class segmentation, Depth Anything-class depth, normals | Bad masks, scale ambiguity |
| T2 | Language/vision/generative | labels, outfit edit, image → 3D, hero relight | Hallucination, identity drift |
| T3 | The human | taste, accept/reject | Fatigue |

Routing: by task type. Escalate when tools disagree or a residual is too high. Every decision is logged with tier, rule id, text and (for models) a confidence. Today the router is a rule table (R1–R14, see `06-DECISION-LAYER.md`). Once the log has enough human verdicts, a small decision model (Laya/Jev-class) can replace rules that have data behind them.

## Pipeline: reference → look (tab 1 logic, target form)
1. **Ingest** (T0): FFmpeg scene detection, keyframes, contact sheets. *(mocked today)*
2. **Measure** (T0): luminance zones, contrast, palette, composition; face-size ratio → shot scale; `vidstabdetect` / optical flow → camera motion. *(zones, ratio, palette, shot scale real on synthetic frames)*
3. **Label** (T2): shot type, lighting style, set, mood in words. *(sample text)*
4. **Fit** (T0): analytic first guess from skin statistics, coarse sweep, greedy coordinate descent on render-and-compare. *(real, synthetic frames)*
5. **Verify** (T0): headless Blender EEVEE render-and-compare on the fitted rig. *(not built; Phase 3)*
6. **Store** (T3 + T0): style fingerprint and tags into a taste database (SQLite). *(in-memory library today)*

## Pipeline: assets → scene (tab 2 logic, target form)
- **People → 2.5D cards.** Cutout (SAM-class) + depth/normals → card with a normal map. Cheap, fixed viewpoint, good to about 35° of orbit (rule R11). Upgrade path: image → 3D mesh (cloud).
- **Props → meshes.** Image → 3D (cloud) or a Blender asset.
- **Plate → proxy room.** Depth → proxy geometry, or camera projection mapping (classic VFX), or a Blender scene. The photo has its own light baked in: keep it ("as shot", with a shadow catcher) or de-light it to an albedo and relight.
- **Outfits.** Instruction-edit image model given the person's reference image; then a face-similarity check (R12).
- **Light rig.** Key spot with soft shadows, fill opposite the key, ambient, an optional practical lamp.
- **Match.** Drive the rig from the reference analysis, then refine by measuring the hero's cheeks with a close camera against the same numbers on the reference.
- **Hero pass.** Send proxy render + depth + normals + light rig + reference to a relight/harmonise model (DiffusionRenderer / IC-Light class). *(stand-in today)*

## Scene graph (source of truth)
JSON; the viewer is a renderer for it. Claude Code can write and edit it. Schema in `05-SCENE-GRAPH-SCHEMA.md`. Future: glTF/USD export for Blender.

## Coordinate conventions (get these right)
- Light azimuth `az`: degrees, **0 = camera side (frontal)**, **+ = screen right**, − = screen left, ±180 = behind the subject. In tab 2 the key's azimuth is shown **relative to the camera** and converted to world with the camera's orbit angle. Elevation `el`: degrees above horizontal.
- Fill: opposite the key in view space, 8° up; intensity = key / 2^fill (`fill` is in stops, ratio 1 : 2^fill).
- World (tab 2): metres, Y up; subject near the origin; camera orbits target (0, 1.1, 0.2); azimuth 0 = camera on +Z looking toward −Z.
- Lens: vertical FOV = 2·atan(12 / focal_mm) (24 mm sensor height).

## Hardware and where things run
See `09-MODELS-AND-HARDWARE.md`. Short version: fast loop, FFmpeg/OpenCV, small depth and segmentation models on the M1; image-to-3D, outfit edit, hero relight on rented cloud GPUs behind a job queue.

## What will go wrong
- **The plate already has light in it.** Move the key and the baked window light still points the old way. Options: "as shot" + move the key to agree, or de-light (inverse rendering) and relight.
- **Cards are paper.** Fine to ~35° of orbit; then a mesh is needed.
- **Identity drifts** across outfit edits and hero frames. Needs reference-conditioned edits and a face-similarity gate.
- **Contact shadows need contact.** Floating feet read as fake. Floor geometry and footprints matter more than the model.
- **Video flickers** under per-frame diffusion. Use the proxy for motion and the image model for stills/keyframes.
- **Fit ambiguities.** Softness is weakly identifiable from one frame (measured, `08-VALIDATION.md`). The match metric on cheeks pins direction only loosely (in one test the matcher settled at az −90° for a reference generated at −52° while matching the look at 99%). Report numbers with their uncertainty.
- **Licences** differ per model; check before client work.

## Decision-layer placement (Jev/Laya-class)
Decision models read a short text state plus allowed options and return probabilities. They do not see video or generate images and should not do numeric fitting. Good first slots: tool routing, "accept or iterate the fit", "next knob to turn", "escalate to hero pass". Start with the rule table, log everything, then train. See `06-DECISION-LAYER.md`.
