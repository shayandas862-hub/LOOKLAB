# 10 · Decisions and open questions

Log a new decision here whenever you choose between real alternatives. Format: id, decision, why, what would change it. **Next id: D-013.**

## Decisions made

**D-001 · Two loops, image models are not the renderer.**
A fast proxy loop (three.js, real time, M1) and a slow image-model loop (cutouts, outfits, meshes, hero relight; cloud, on demand). *Why:* nothing diffusion-based runs interactively on an 8 GB M1, and interactivity is the product. *Revisit if:* a relight model runs interactively on the target hardware.

**D-002 · Tiered cascade, rules first.**
T0 instruments → T1 fast learned → T2 language/generative → T3 human, routed by a rule table (R1–R14) that logs everything. *Why:* no training data exists yet; rules are inspectable and produce the log a model will learn from. *Revisit when:* ≥ 500 rows with human verdicts (P7).

**D-003 · Decision models choose strategy, not numerics.**
Laya/Jev-class models route and judge; the light fit is a deterministic search. *Why:* they read short text, return option probabilities, and cannot see images or regress angles. *Revisit if:* a model is shown to beat the search on held-out data.

**D-004 · Validate on synthetic ground truth first.**
Render with a known rig, recover it, assert error bounds. *Why:* real ground truth does not exist yet and synthetic is free and repeatable. *Limit:* proves self-consistency only (see `08-VALIDATION.md`). Real validation is P3.

**D-005 · Single-file HTML with three.js r128 from cdnjs.**
*Why:* it had to run as a Claude artifact under a CSP that allows only a few script hosts. r128 is what cdnjs serves at a stable UMD URL and what the code uses. *Revisit at:* P0 (module build, possible Vite/Tauri/Electron).

**D-006 · Cards for people, meshes for props; R11 at 35°.**
People are 2.5D cutout cards with silhouette-derived normals, props are meshes; flag a card viewed > 35° off-axis. *Why:* cheap, fixed-viewpoint, plausible to ~35°. Upgrade path: image → 3D in the cloud. The 35° is a judgement, not measured.

**D-007 · Match metric uses cheek windows only.**
Two cheek windows via a close measurement camera (FOV 14°, 1.3 m from the hero head, 256×256): `lookDist = .5·min(1,|log2(ratio ratio)|/2.5) + .35·min(1,|Δy90|/.35) + .15·min(1,|ln(rb ratio)|/.5)`, match % = round(100·(1 − lookDist)). *Why:* whole-face stats were dominated by painted eyes and brows (scene 14:1 vs reference 4.5:1). *Do not revert.*

**D-008 · The fit assumes camera and set are known.**
*Why:* keeps the first version identifiable. *Revisit at:* P3 (lens from face-size ratio/EXIF, camera-relative light).

**D-009 · Scene-graph JSON is the source of truth.**
The viewer renders it, `applyJSON` validates and clamps, Claude Code can edit it. *Why:* makes the tool drivable by Claude and exportable.

**D-010 · Image → 3D runs in the cloud.**
*Why:* TRELLIS.2-class models need far more than 8 GB (one Apple Silicon port reported ~18 GB peak). Decided by measurement reported by a third party, not by us.

**D-011 · M1 8 GB limits the local loop to ~6 GB and one model at a time.**

**D-012 · Do it manually and small first, automate after about 20 repetitions.**
Business decision from the studio conversation (see `11-STUDIO-CONTEXT.md`): do the first client-style jobs by hand to learn the real steps, then automate what repeats.

## Open questions (owner to answer or Claude Code to investigate)
1. **T2 provider and billing.** Claude vision via Claude Code, API, or another provider? Is automated usage billed differently on Max? (`09-MODELS-AND-HARDWARE.md`)
2. **Video vs stills.** Is ingest of full video required for the MVP, or are keyframes enough? Affects P2 scope and camera-motion estimation.
3. **Plate approach.** Camera projection mapping onto depth geometry, a depth mesh, or a real Blender scene? Projection is classic VFX and cheap; geometry is needed for true relight.
4. **Relight / edit model and licence.** DiffusionRenderer, IC-Light, an instruction-edit model: which, at what commercial terms?
5. **Identity consistency.** What face-similarity model and threshold? How are cast reference sets captured?
6. **Cloud GPU provider and cost cap.**
7. **App shape.** Stay an artifact, or Vite + Tauri/Electron? Decide in P0; it affects file access, model runtimes and offline use.
8. **Storage.** SQLite for looks, decisions, assets and jobs (proposed), location on disk.
9. **What "good" means.** The fingerprint is lit:shadow, warmth, palette, shot scale. Does the owner want additional descriptors (contrast curve, colour palette clusters, composition)?
10. **Vision statement.** `01-VISION.md` is Claude's interpretation; the owner has not confirmed or corrected it. The owner said they would rate the mock UI; no rating has been given yet.

## Things deliberately not done
- No real model is called anywhere in the prototype. Every model step is a labelled stand-in.
- No real ingest, no Blender, no cloud.
- No accuracy claims on real footage.
