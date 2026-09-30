# Look Lab — v1 phases

Work in order. A phase ends when its acceptance tests pass, not when its code
exists. Before each phase: a five-line plan and the tests that will prove it
(standing rule 1). At its end: a progress entry (`PR-LL-*`) with measured numbers.

The old v0.2 plan (`reference/v0.2/docs/07-PHASES.md`) is superseded; its useful
parts (ground truth, cloud jobs, router, Blender bridge) are folded in below.

---

## P0 · Foundation — **done 2026-09-30**
Repo, records (`docs/`), CLAUDE.md, architecture and its AD records, the v0.2
prototype kept read-only in `reference/v0.2/`, the design export in `design/`.
**Acceptance:** `npm test` runs; the records tests pass (bug-log shape, id registry
high-water marks match the ids in `docs/`).

## P1 · Engine, action registry, MCP, UI shell — **done 2026-09-30** (PR-LL-001)
**Goal.** Every screen of the design running in the browser from the local engine,
every button calling a registry action, and Claude Code able to call the same
actions over MCP.
**Deliverables.** Contracts (zod) for the design's data model · registry with all
actions from the design's catalogue (stubs return `source: 'sample'`) · engine
(HTTP, security, file store, events, `/mcp`) · `looklab` CLI (`start`, `dev`,
`mcp-setup`, `run`) · design converter and the 11 screens · "Sample data" markers
(D-LL-015) · decision rows for every call.
**Acceptance.**
- Parity: the design's action catalogue, the registry and the MCP tool list hold the same actions (test).
- Every registry action validates its input and output (test per action with a bad input).
- Security: wrong `Host` → 403; `/api` without token → 401; `/mcp` without bearer → 401; confirm-action over MCP → refused (tests).
- An MCP client lists the tools and calls one read action end to end (test with the SDK client).
- Every screen renders without a console error (browser smoke test) and ⌘K lists every action.
- Engine RSS measured idle and reported; UI tab memory measured and reported.

**Result.** All acceptance tests pass (`tests/actions/catalogue.test.ts`, `tests/engine/server.test.ts`,
`tests/ui/wiring.test.ts`, `tests/ui/app.e2e.test.ts`). Engine 121 MB idle; page JS heap 5.9 MB.
Chrome is the only browser tested.

**Next: P2.** Five-line plan and its tests are written at the start of that session.

## P2 · Breakdown, deterministic first — **done 2026-09-30** (PR-LL-002)
Import an image or video (browser decode, AD-LL-007) · frames stored · shot-cut
detection · palette (hex + share, measured) · shadow/mid/highlight tint ·
saturation · contrast in stops · thirds / subject position · manual edit of any value
· save a look. All T0.
**Acceptance.** Palette recovers known swatch colours and shares on synthetic
images (ΔE ≤ 2, share ± 2 pts) · cuts found within ± 1 sampled frame on synthetic
clips with known cuts · a real image round-trips import → breakdown → look.

**Result.** All acceptance tests pass: `tests/core/palette.test.ts` (known patches, with and without
noise, letterboxed; repeat runs identical), `tests/core/stats.test.ts`, `tests/core/cuts.test.ts` (hard
cuts, a one-frame shot, an 8-frame dissolve and a fade to black: every cut within ± 1 frame, none on the
fades), `tests/actions/breakdown.test.ts`, and in Chrome `tests/ui/breakdown.e2e.test.ts`: a committed
2.39:1 fixture image is imported through the file picker, its five colours read MEASURED within ΔE00 2 and
2 points, the subject is set by a click, the look is saved and `library.list` returns it as "measured"; a
clip recorded in the page with cuts at 1, 3 and 9 s and a 3 s dissolve gives four shots, each cut within
± 1 sampled frame, none in the dissolve. The 60 s clip below has 8 scenes and 8 shots were found.
**Measured on the M1 (8 GB), synthetic 60 s 1080p H.264 clip (117 MB, recorded in Chrome; no real clip
was available):** import and analysis 19.2 s in two runs on one clip and 19.3 s on another (target ≤ 60 s):
2.4 s hashing, 15.8–15.9 s decoding and sending 121 frames, 0.9–1.0 s cut detection and measurement.
Engine RSS 136–137 MB idle before, 146–148 MB peak, 146–147 MB idle after (budget ≤ 150 MB: inside, with
little room). Tab JS heap 27.6 MB. Palette on one 512 × 288 frame 33.5–49.1 ms; tints, saturation and
contrast 25 ms; frames on disk 29 MB per minute. Reproduce with `scripts/measure-import.ts`.
**Not done:** light, lens, framing size and mood stay sample (P3/P4); nothing was measured on real
footage (standing rule 3: no accuracy claim until P3's ground truth); Chrome is the only browser tested.

**Next: P3.** Five-line plan and its tests are written at the start of that session.

## P3 · Light and lens, and their ground truth
Port the v0.2 light fit (`createFit`) and match metric into `src/core/`, with its 5
synthetic cases · lens estimate · Blender ground-truth set (≥ 20 scenes, known
rigs; needs Blender installed) · light values stay labelled "estimate" until the set
passes. **Acceptance.** v0.2 cases pass at their v0.2 thresholds · on the Blender
set: median az error ≤ 15°, el ≤ 10°, worst case stated · confidence correlates
with error (Spearman ≥ 0.5) or no confidence is shown.

## P4 · AI in the app
Provider adapter (Anthropic via API key in the Keychain) · spend cap and cost
log · `breakdown.fit_mood`, `breakdown.ask`, framing/lens labels as T2 with
confidence · R5 routing to review below 60 · No AI mode verified on every screen.
**Acceptance.** Zero live calls in the suite (stub client) · cap stops calls at the
limit (test) · AI values never render as measured (test).

## P5 · Location & Kit, and the recipe
Location and kit editors · power budget check (deterministic) · gear-gap check ·
recipe generation (T2) with a manual path · approval before a recipe seeds a plan
(needs the approval queue: D-LL-017 revisited).
**Acceptance.** Power check flags an overloaded circuit on fixtures · gaps list
matches a hand-written expected list on 3 fixtures.

## P6 · Set Plan in 3D
three.js scene built from the SetPlan contract · move lights, camera, actors ·
top-down plot and camera view · look match (cheek-only, D-LL-007) · `plan.match_light`
solver · versions and undo. **Acceptance.** v0.2's match results reproduced (≥ 85% on
its 3 samples) · plan JSON round-trips exactly · RSS inside budget with the scene open.

## P7 · Set sheet
Generate from a plan version · A4 print and phone view · PDF via the browser's
print · share to phone (confirm). **Acceptance.** Sheet lists every light and every
gear item in the plan (test) · print layout fits one A4 page for the sample plan.

## P8 · Library and mood board
Save/apply/compare looks (apply = confirm) · board of references with measured
palettes · export. **Acceptance.** Applying a look replaces exactly the target
fields (test).

## P9 · Shots and previs
Scene shot list · frames rendered from each plan's camera · timeline playback.

## P10 · Cloud jobs
Queue, cache by content hash, cost log, provider adapter · outfit edit with identity
gate · image → 3D · hero relight · licence recorded per model before use.

## P11 · Team hosting
The engine hosted for the team behind a login; store adapter for shared storage.

## P12 · Learned decision router
Only after ≥ 500 decision rows with human verdicts; a model replaces a rule only if
it beats it on a held-out split.
