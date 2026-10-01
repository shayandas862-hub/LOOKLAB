# Look Lab — Phase 3: Light and lens, and their ground truth

## What This Product Is
A technical pre-production brain for film: break down a reference, adapt the look to our location and kit, plan lights, camera and actors in 3D, hand the crew a set sheet.
For the founder's film production team: internal first, public later; runs on an 8 GB M1 beside a browser, Slack and Claude.
Its purpose: move cost and mistakes out of shoot days by working the shot out before the shoot ([`docs/VISION.md`](docs/VISION.md) §1).

## What Has Already Been Built
- P0: records in the CalmLine layout (code `LL`), architecture AD-LL-001…009, the v0.2 prototype kept read-only, the design export; records tests passing.
- P1: engine on 127.0.0.1:4317, one action registry behind the UI, ⌘K, MCP and a CLI; the 11 design screens generated as React views; all tests passing (PR-LL-001).
- P2: deterministic breakdown: Chrome imports an image or video (SHA-256, 2 frames/s at ≤ 512 px, file never copied), cuts, palette, tints, saturation, contrast and aspect measured, subject set by hand; 72 actions; 193/193 tests passing; 60 s 1080p import 19.2 s; engine 146–148 MB peak (PR-LL-002).
- Grill Me with Docs has not run since P2: no alignment changes.

## What You Are Building In This Phase
Port the v0.2 light fit (`createFit`) and match metric into `src/core/`, with its 5 synthetic cases · lens estimate · Blender ground-truth set (≥ 20 scenes, known rigs) · light values stay labelled "estimate" until the set passes. After this phase `breakdown.fit_light` is a real T0 instrument on the shot's frame, its accuracy on an independent Blender set is measured and written down, and the Breakdown shows light as an estimate, never as MEASURED, unless that set passes.

## Your Tasks — Complete In This Order
1. **Port the v0.2 light fit and match metric into `src/core/`, with its 5 synthetic cases.**
   Source: `reference/v0.2/src/base.html` between `/*CORE-START*/` and `/*CORE-END*/` (`renderScene`, `downsample`, `measureInit`, `errFn`, `KNOBS`, `createFit`), and `cheekStats` in `reference/v0.2/src/scene.js` (line 464). Cases and tolerances: `reference/v0.2/tests/core-fit.test.js`: rembrandt, beauty, noir, extra-a, extra-b; az ≤ 15°, el ≤ 8°, kelvin ≤ 500 K, fill ≤ 0.6, residual ≤ 0.02; softness not asserted. Port the maths only, as erasable TypeScript.
2. **Lens estimate.** From the image's EXIF focal length when the original carries it (read in the browser at import; the PNG frames carry none), otherwise by hand. EXIF is metadata, not pixels: decide and record which source that is.
3. **Blender ground-truth set: ≥ 20 scenes, known rigs.** Blender 5.1.1 headless: `/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/blender/<script>.py`. Known az, el, softness, kelvin and fill; a head with light and dark skin; varied backgrounds; the truth written beside each render. The head is built in the script or is a CC0 model with its licence recorded. Run the ported fit on the set and report error per parameter and per skin tone **before** changing the algorithm.
4. **Light values stay labelled "estimate" until the set passes.** Make `breakdown.fit_light` real: the person marks the face on the frame by hand (as the subject is, D-LL-028), the fit runs on that crop, and the light rows read as an estimate, never MEASURED. Remove its stand-in flag in the same change, with a test. A confidence is shown only if it tracks error on the set (Spearman ≥ 0.5).
   → Representing "estimate" in `Value.source` changes a fixed contract (architecture §12): write the AD record and get the founder's yes before changing it.

## Rules — Non-Negotiable
1. Write the test before writing the code for every single task. No exceptions. The test must exist, and fail, before any implementation begins.
2. Only touch files directly related to the current task. If something looks wrong in another file, note it; do not touch it.
3. If a hand-written file reaches 300 lines, stop and split it before continuing. Generated views are exempt. Two files are already over: `src/actions/domains/breakdown.ts` (451) and `src/ui/logic/Breakdown.logic.tsx` (339); split each before adding to it, as its own change, green before and after.
4. After each task, self-review: does it do exactly what was asked, does it have a passing test, did it touch only the right files.
5. Do not begin the next task until the current one has a passing test and has passed self-review.

**Project hard rules** (break only with a new AD or D record and the founder's yes):
1. Every feature is an action in the registry (`src/actions/`); nothing writes to the store any other way. New getters and helpers get `command: false` so the design-catalogue parity test holds (AD-LL-002).
2. Never present a stand-in as a real call. Stand-ins return `source: 'sample'`; sample data shows the Sample marker (D-LL-015, D-LL-032).
3. No accuracy claims on real footage until a ground-truth test for it passes. The Blender set is synthetic: passing it is not a real-footage claim.
4. Look Lab's own processes ≤ 1.5 GB on the M1; engine ≤ 150 MB RSS idle (it measured 146–147 MB after a 60 s import: measure every addition).
5. Claude subscriptions only through Claude Code over MCP; in-app AI uses an API key from the Keychain (AD-LL-003). No AI in P3.
6. Secrets live in the macOS Keychain, never in files, logs, errors, tests or commits.
7. Client footage stays local unless cloud is allowed for that project; every upload is logged.
8. Licences: check commercial use before wiring in any model or asset; unclear means no.
9. `src/core/` stays DOM-free and Node-free (AD-LL-009).
10. Views are generated: change `design/`, `src/ui/bindings.json` (D-LL-021) or `scripts/port-design.mjs`, then `npm run port-design`. Behaviour lives in `src/ui/logic/`.
11. Keep the cheek-only look-match metric (D-LL-007).
12. Screens reach the engine only through `run(cmd, text, input, { quiet })` from the Shell.
13. Engine code is erasable TypeScript: no enums, namespaces or parameter properties (D-LL-019, B-LL-001).
14. Never `git add -A`; stage what you changed, never `.claude/`. The folder name ends with a space (`LOOK LAB `): quote every path.

## Done Looks Like
- `npm test` runs the 5 v0.2 cases against the ported fit and they pass at the v0.2 thresholds.
- The Blender set (≥ 20 scenes, light and dark skin) exists, can be regenerated with one command, and its report states median az and el error and the worst case. Pass: median az ≤ 15°, el ≤ 10°.
- A confidence appears only if Spearman(confidence, error) ≥ 0.5 on the set; otherwise none is shown anywhere.
- In Chrome (test): import a frame, mark the face, run Fit light: the light rows fill and read as an estimate, never MEASURED; `fit_light` is no longer a stand-in.
- Fit time per frame and engine RSS during and after a fit are measured on the M1 and written down.
- `npm test` green, `npm run typecheck` clean; P3 marked done in `docs/phases.md` with the numbers; a progress entry cites every id touched.

## Tech Stack Reference
- Node ≥ 22.6 with type stripping: runs the engine's TypeScript directly, no build step (D-LL-019).
- TypeScript, erasable syntax only: the whole codebase.
- zod 4: every contract, validated on every action's input and output.
- React 19 + Vite: the UI; views generated from the Claude Design export.
- @modelcontextprotocol/sdk: Claude Code drives every action over MCP.
- Vitest, and playwright-core against the installed Chrome: unit and browser tests.
- node:zlib: the engine's own PNG reader (D-LL-031).
- Blender 5.1.1 headless (P3): renders the ground-truth set; a development tool, never a runtime dependency.

## Folder Structure
```
src/core/        pure maths: colour, palette, tone, active picture, cuts, SHA-256; the light fit and match metric go here (P3)
src/contracts/   zod schemas, versioned
src/actions/     registry + one module per domain + rules (R1…)
src/engine/      server, security, store, events, MCP, PNG, secrets, AI provider
src/ui/          shell, views (generated), logic (owned), runtime (engine client, media import)
bin/looklab.mjs  CLI
scripts/         port-design, measure-import.ts; Blender scripts go in scripts/blender/ (P3)
design/          Claude Design export (read-only; HANDOFF.md is the UI spec)
reference/v0.2/  the old prototype (read-only; salvage maths and lessons, not UI)
tests/           records/, core/, actions/, engine/, ui/, fixtures/
```

## Commands
```sh
npm install                      # once
npm start                        # build if needed, start the engine, open the browser
npm run dev                      # engine + Vite dev server with hot reload
npm test                         # builds the UI, then the full suite incl. Chrome tests (run before saying anything is done)
npm run test:unit                # everything except the browser tests
npm run typecheck
npm run port-design              # regenerate src/ui/views/ from design/*.dc.html
node --experimental-strip-types scripts/measure-import.ts [clip]   # import time and engine RSS on this machine
node bin/looklab.mjs mcp-setup   # prints the `claude mcp add` command for this machine
```

## Records (the project-records convention, code `LL`)
- Next free numbers: [`docs/id-registry.json`](docs/id-registry.json) (`allocated` is the high-water mark). Never type a "next id" here.
- Shape change → `docs/architecture-decisions.md`; choice inside the architecture → `docs/decision-log.md` (chose · rejected · why); measured session → `docs/progress-log.md`; defect → `docs/bug-log.md` **the moment it is found**; term → `docs/CONTEXT.md`; not yet a decision → `plans/`. Propose a new record file before creating it.
- Never renumber an id. `tests/records/` checks the bug-log shape and the registry.

## Project Documents — Available On Demand
Do not load these at session start; read one only when a task needs it.
- `docs/phases.md` (the P3 card), `docs/architecture.md` (§5 honesty in the data, §7 memory, §12 fixed vs free), `docs/PRD.md`
- `docs/decision-log.md` (D-LL-007 cheek-only, D-LL-008 camera assumed known, D-LL-024…032 from P2), `docs/architecture-decisions.md`, `docs/CONTEXT.md`, `docs/bug-log.md`
- `reference/v0.2/docs/08-VALIDATION.md`: what v0.2 proved and did not; softness is weakly identifiable, and the cheek metric once matched the look at az −90° for a light at −52°.
- `reference/v0.2/docs/07-PHASES.md` (its P3): the original ground-truth plan and risks.
- The `repo-analyst` skill: run it when the founder asks for a codebase review.
- Grill Me with Docs runs in Claude Chat, not here. Do not look for it on disk.

## Gotchas that cost time once
- Vitest compiles TypeScript itself, so it cannot see the engine fail under plain Node; `tests/engine/boot.test.ts` can (B-LL-001).
- `pgrep -f src/engine/main.ts` finds the shell wrapper first; measure the `node` pid's RSS.
- A toast is not proof an action ran; check the store or the decision log.
- MCP tool names cannot contain dots: `breakdown.fit_light` is `breakdown_fit_light` (D-LL-016).
- Chrome's `canvas.captureStream` + `MediaRecorder` writes a clip's first frame with different colours from the rest (B-LL-002); test clips open on black. Decoding is consistent.
- A web page is never told a dropped file's path (D-LL-027).
- From v0.2: whole-face statistics fail (painted eyes and brows dominate): cheeks only. Softness is weakly identifiable from one frame.

## End of Phase
When every task above is complete and every test is passing, stop and tell the founder:

"Phase 3 is complete. Every task is done and every test is passing.

Two optional next steps — your call:

1. **Repo Analyst** — I can run this now. It reads the full codebase and produces a plain English report of what was built, what's healthy, and what needs attention. Recommended before moving to the next phase. Say 'run repo analyst' and I'll do it.

2. **Grill Me with Docs** — this runs in Claude Chat, not here. Take the Repo Analyst output (if you ran it) plus your original PRD and open a new chat. It checks whether what was built matches what was planned and flags any drift before the next phase begins.

What would you like to do?"

Do not commit or push without the founder's yes. Do not begin the next phase. Wait for the founder's instruction.
