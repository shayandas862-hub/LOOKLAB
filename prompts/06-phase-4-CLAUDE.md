# Look Lab — Phase 4: AI in the app

## What This Product Is
A technical pre-production brain for film: break down a reference, adapt the look to our location and kit, plan lights, camera and actors in 3D, hand the crew a set sheet.
For the founder's film production team: internal first, public later; runs on an 8 GB M1 beside a browser, Slack and Claude.
Its purpose: move cost and mistakes out of shoot days by working the shot out before the shoot ([`docs/VISION.md`](docs/VISION.md) §1).

## What Has Already Been Built
- P0: records in the CalmLine layout (code `LL`), architecture AD-LL-001…009, the v0.2 prototype kept read-only, the design export; records tests passing.
- P1: engine on 127.0.0.1:4317, one action registry behind the UI, ⌘K, MCP and a CLI; the 11 design screens generated as React views; all tests passing (PR-LL-001).
- P2: deterministic breakdown: Chrome imports an image or video (SHA-256, 2 frames/s at ≤ 512 px, file never copied), cuts, palette, tints, saturation, contrast and aspect measured, subject set by hand; 193/193 tests passing (PR-LL-002).
- P3: the v0.2 light fit ported exactly (tolerance 0) and re-scored on the face's skin (D-LL-035); Blender ground truth, 40 scenes (dev 16, held-out 24, light and dark skin); held-out median az 13.9°, el 8.7° (dark skin az 21.9°: fails on its own); `breakdown.fit_light` real (T0) on a face box drawn by hand, writing direction and key colour as `estimate`; EXIF focal length as `metadata` (AD-LL-010); 73 actions, 18 stand-ins; 307/307 tests passing; engine 147–185 MB idle after a 60 s import, B-LL-004 open (PR-LL-003).
- Grill Me with Docs has not run since P2: no alignment changes.

## What You Are Building In This Phase
In-app AI through the founder's own Anthropic API key, held in the macOS Keychain, with a monthly spend cap that stops calls and a cost on every decision row. After this phase mood words, Ask, and the framing and lens labels come from a model as AI values with a confidence; anything under 60 goes to a person for review; every screen still works with No AI mode on, and the test suite makes no live call.

## Your Tasks — Complete In This Order
1. **Provider adapter (Anthropic via API key in the Keychain).**
   The seam is `AiProvider` in `src/engine/ai.ts` (today only `NoAiProvider`). `settings.add_provider` is a stand-in (T3, confirm) that takes no key: make it real. The key is written to and read from the macOS Keychain only. The decision log summarises every action's input: an action that takes a key must never be logged with it (test). Tests run on a stub client; none may reach the network.
   → For this task, load the `claude-api` skill.
   → What it does: current model ids, prices and the Messages API request shape.
   → Choose the model and the price table with it, and record them, before any live call.
2. **Spend cap and cost log.**
   `Settings.api.cap_inr` and `used_inr` exist (`src/contracts/system.ts`); `Decision.cost_inr` exists. Price each call before it is sent; refuse a call that would cross the cap, and say why; write each call's cost to its decision row and to `used_inr`; roll the month over. The INR rate is data with its date.
3. **`breakdown.fit_mood`, `breakdown.ask`, framing/lens labels as T2 with confidence.**
   Values are `source: 'ai'` with a confidence 0–100, never `measured` or `estimate`. A model never overwrites a measured, estimated, EXIF (`metadata`) or hand-set value. What leaves the machine (measured numbers only, or the frame too, which is an upload: standing rule 7) needs the founder's yes before code. Where a T0 rule already gives a label (R2: shot size from the face box), propose T0 instead. Remove each stand-in flag in the same change, with a test.
4. **R5 routing to review below 60.**
   An AI value under 60 is queued for a person: it reads low on the screen, `breakdown.review` (T3) records the person's yes, and the decision row records the verdict (D-LL-023: in the UI the click is the approval; over MCP it is refused, D-LL-017).
5. **No AI mode verified on every screen.**
   With No AI on, or with no key, every screen works by hand; AI buttons are off and say why; T0 buttons stay on (Fit light was AI-gated by the design until D-LL-038: check every button's binding).

## Rules — Non-Negotiable
1. Write the test before writing the code for every single task. No exceptions. The test must exist, and fail, before any implementation begins.
2. Only touch files directly related to the current task. If something looks wrong in another file, note it; do not touch it.
3. If a hand-written file reaches 300 lines, stop and split it before continuing. Generated views are exempt.
4. After each task, self-review: does it do exactly what was asked, does it have a passing test, did it touch only the right files.
5. Do not begin the next task until the current one has a passing test and has passed self-review.

**Project hard rules** (break only with a new AD or D record and the founder's yes):
1. Every feature is an action in the registry (`src/actions/`); nothing writes to the store any other way. New getters and helpers get `command: false` so the design-catalogue parity test holds (AD-LL-002).
2. Never present a stand-in as a real call. Stand-ins return `source: 'sample'`; sample data shows the Sample marker (D-LL-015, D-LL-032, D-LL-038).
3. No accuracy claims on real footage until a ground-truth test for it passes. An AI label is a word, not a measurement; a Blender-set number is a claim about the Blender set only.
4. Look Lab's own processes ≤ 1.5 GB on the M1; engine ≤ 150 MB RSS idle. It is over after a 60 s import (147–185 MB, B-LL-004 open): fix it as its own change, green before and after, before the AI client lands, or say why it should wait. Measure every addition (RSS and `footprint <pid>`).
5. Claude subscriptions only through Claude Code over MCP; in-app AI uses an API key from the Keychain (AD-LL-003). Zero live calls in the test suite.
6. Secrets live in the macOS Keychain, never in files, the store, decision rows, events, logs, errors, tests or commits.
7. Client footage stays local unless cloud is allowed for that project; every upload is logged. A frame sent to a model is an upload.
8. Licences: check commercial use before wiring in any model, SDK or asset; unclear means no.
9. `src/core/` stays DOM-free and Node-free (AD-LL-009; `tests/core/purity.test.ts`).
10. Views are generated: change `design/`, `src/ui/bindings.json` (text, or `"[title=…] attribute"`, D-LL-021, D-LL-038) or `scripts/port-design.mjs`, then `npm run port-design`. Behaviour lives in `src/ui/logic/`.
11. Models choose words and labels, not numbers we measure (D-LL-003): no AI light, palette or contrast. Keep the cheek-only look-match metric (D-LL-007).
12. Screens reach the engine only through `run(cmd, text, input, { quiet })` from the Shell.
13. Engine code is erasable TypeScript: no enums, namespaces or parameter properties (D-LL-019, B-LL-001).
14. Never `git add -A`; stage what you changed, never `.claude/`. The folder name ends with a space (`LOOK LAB `): quote every path.

## Done Looks Like
- Zero live calls in the suite: it runs on a stub client, and a test fails if any test reaches the provider.
- The key is stored and read only through the Keychain; a test finds it in no file, row, event, error or log after `settings.add_provider`.
- The cap stops calls at the limit (test): a call that would cross it is refused before it is sent; `used_inr` equals the decision rows' `cost_inr`.
- AI values never render as MEASURED or ESTIMATE (Chrome test): mood, Ask and the framing and lens labels read `AI n%`; measured, estimated, EXIF and hand-set values survive an AI call; the stand-in count drops by the actions made real.
- A value under 60 reads low and goes to review; confirming it records the verdict (R5, test).
- With No AI on or no key, every one of the 11 screens works by hand, AI buttons say why they are off, and Fit light still works (Chrome test).
- One live Ask and one live mood call with the founder's key, measured on the M1 (time, tokens, cost in INR, counted by the cap); engine RSS and footprint with the AI client loaded, written down.
- `npm test` green, `npm run typecheck` clean; P4 marked done in `docs/phases.md` with the numbers; a progress entry cites every id touched.

## Tech Stack Reference
- Node ≥ 22.6 with type stripping: runs the engine's TypeScript directly, no build step (D-LL-019).
- TypeScript, erasable syntax only: the whole codebase.
- zod 4: every contract, validated on every action's input and output.
- React 19 + Vite: the UI; views generated from the Claude Design export.
- @modelcontextprotocol/sdk: Claude Code drives every action over MCP.
- Vitest, and playwright-core against the installed Chrome: unit and browser tests.
- node:zlib: the engine's own PNG reader (D-LL-031).
- Anthropic Messages API (P4): in-app AI from the engine with the founder's key; the SDK or plain `fetch` is this phase's choice (licence and memory first).
- macOS Keychain through the `security` command: the only place a key lives.
- Blender 5.1.1 headless: renders the ground-truth set; a development tool, never a runtime dependency.

## Folder Structure
```
src/core/        pure maths: colour, palette, tone, active picture, cuts, SHA-256, EXIF, the light fit (light-*.ts, cheek.ts)
src/contracts/   zod schemas, versioned
src/actions/     registry + domain modules (breakdown*.ts split by concern) + rules (R1…)
src/engine/      server, security, store, events, MCP, PNG, AI provider (ai.ts); the Keychain wrapper goes here (P4)
src/ui/          shell, views (generated), logic (owned: <Screen>.logic.tsx plus helpers), runtime (engine client, media import)
bin/looklab.mjs  CLI
scripts/         port-design, measure-import.ts, measure-fit.ts; blender/ (plan, render, score, report)
design/          Claude Design export (read-only; HANDOFF.md is the UI spec)
reference/v0.2/  the old prototype (read-only; salvage maths and lessons, not UI)
tests/           records/, core/, actions/, engine/, ui/, fixtures/ (blender/: the committed ground-truth renders)
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
npm run blender-set              # regenerate the Blender ground-truth sets (about 4 min on the M1)
node --experimental-strip-types scripts/measure-import.ts [clip]   # import time and engine RSS; records and keeps a 60 s clip
node --experimental-strip-types scripts/measure-fit.ts [clip] [--keep-browser]   # fit time, engine RSS and footprint
node --experimental-strip-types scripts/blender/report.ts [dev|test] [--jitter=0.08] [--baseline] [--variants]
node bin/looklab.mjs mcp-setup   # prints the `claude mcp add` command for this machine
```

## Records (the project-records convention, code `LL`)
- Next free numbers: [`docs/id-registry.json`](docs/id-registry.json) (`allocated` is the high-water mark). Never type a "next id" here.
- Shape change → `docs/architecture-decisions.md`; choice inside the architecture → `docs/decision-log.md` (chose · rejected · why); measured session → `docs/progress-log.md`; defect → `docs/bug-log.md` **the moment it is found**; term → `docs/CONTEXT.md`; accuracy against a known answer → `docs/validation.md`; not yet a decision → `plans/`. Propose a new record file before creating it.
- Never renumber an id. `tests/records/` checks the bug-log shape and the registry.

## Project Documents — Available On Demand
Do not load these at session start; read one only when a task needs it.
- `docs/phases.md` (the P4 card), `docs/architecture.md` (§5 honesty in the data, §6 AI access, §7 memory, §12 fixed vs free), `docs/PRD.md`
- `docs/decision-log.md` (D-LL-002 tiers, D-LL-003 strategy not numbers, D-LL-015, D-LL-017, D-LL-023, D-LL-036 confidence only if it tracks error, D-LL-038), `docs/architecture-decisions.md` (AD-LL-003 AI modes, AD-LL-010 value sources), `docs/CONTEXT.md`, `docs/bug-log.md` (B-LL-004 open)
- `docs/validation.md`: what is checked against a known answer, and what is not.
- `reference/v0.2/docs/06-DECISION-LAYER.md`: the rules R1–R14 as v0.2 wrote them (R5 review, R3 words only).
- The `repo-analyst` skill: run it when the founder asks for a codebase review.
- Grill Me with Docs runs in Claude Chat, not here. Do not look for it on disk.

## Gotchas that cost time once
- Vitest compiles TypeScript itself, so it cannot see the engine fail under plain Node; `tests/engine/boot.test.ts` can (B-LL-001).
- `pgrep -f src/engine/main.ts` finds the shell wrapper first; measure the `node` pid. RSS on macOS swings by 20–40 MB with memory compression: take several runs and read `footprint <pid>` too (B-LL-004).
- A toast is not proof an action ran; check the store or the decision log.
- The decision log stores a summary of every action's input: a secret passed to a logged action ends up on disk.
- MCP tool names cannot contain dots: `breakdown.fit_light` is `breakdown_fit_light` (D-LL-016).
- The Breakdown page has two `<aside>`s, navigation then the value panel: a test that reads the first one never sees a badge.
- Design buttons may carry AI gating a T0 action does not need (`disabled="{{ aiBlocked }}"` on Fit light, D-LL-038): check each binding when an action changes tier.
- Vitest runs `describe` bodies while collecting, even when `-t` filters the tests: a held-out set computed there is run.
- Chrome's `canvas.captureStream` + `MediaRecorder` writes a clip's first frame with different colours from the rest (B-LL-002); test clips open on black.
- A web page is never told a dropped file's path (D-LL-027).

## End of Phase
When every task above is complete and every test is passing, stop and tell the founder:

"Phase 4 is complete. Every task is done and every test is passing.

Two optional next steps — your call:

1. **Repo Analyst** — I can run this now. It reads the full codebase and produces a plain English report of what was built, what's healthy, and what needs attention. Recommended before moving to the next phase. Say 'run repo analyst' and I'll do it.

2. **Grill Me with Docs** — this runs in Claude Chat, not here. Take the Repo Analyst output (if you ran it) plus your original PRD and open a new chat. It checks whether what was built matches what was planned and flags any drift before the next phase begins.

What would you like to do?"

Do not commit or push without the founder's yes. Do not begin the next phase. Wait for the founder's instruction.
