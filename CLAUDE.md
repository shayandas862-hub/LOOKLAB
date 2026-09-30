# CLAUDE.md — Look Lab

A technical pre-production brain for a film team. It breaks down a reference frame or
video (palette, light, lens, framing, movement, mood), adapts the look to *our*
location and kit, plans lights, camera and actors in 3D, and hands the crew a set
sheet. Internal first, public later. Read [`docs/VISION.md`](docs/VISION.md) §1 for
the why.

## Read first, in this order
1. [`docs/architecture.md`](docs/architecture.md): the picture. Shape decisions are `AD-LL-*` in [`docs/architecture-decisions.md`](docs/architecture-decisions.md).
2. [`docs/phases.md`](docs/phases.md): what is done and what is next, with acceptance tests.
3. [`docs/decision-log.md`](docs/decision-log.md): the standing rules (top) and the choices inside the architecture.
4. [`docs/CONTEXT.md`](docs/CONTEXT.md): the vocabulary. Use its terms; do not invent synonyms.
5. The newest entry in [`docs/progress-log.md`](docs/progress-log.md): where things stand, measured.

## Commands
```sh
npm install            # once
npm start              # build if needed, start the engine, open the browser
npm run dev            # engine + Vite dev server with hot reload
npm test               # builds the UI, then the full suite incl. a Chrome e2e test (run before saying anything is done)
npm run test:unit      # everything except the browser test
npm run typecheck
npm run port-design    # regenerate src/ui/views/ from design/*.dc.html
node bin/looklab.mjs mcp-setup   # prints the `claude mcp add` command for this machine
```

## Hard rules (break only with a new AD or D record and the founder's yes)
1. **Every feature is an action** in the registry (`src/actions/`). UI buttons, ⌘K, MCP and the CLI call actions; nothing writes to the store any other way. The parity test must stay green (AD-LL-002).
2. **Never present a stand-in as a real call.** Stand-ins return `source: 'sample'`; screens on sample data show the Sample marker (D-LL-015). When a stand-in is replaced, remove the tag in the same commit and add a test.
3. **No accuracy claims on real footage** until the ground-truth test for it passes (phases P3).
4. **Light machine:** Look Lab's own processes ≤ 1.5 GB on the 8 GB M1. Heavy models go to the cloud. Load optional local models one at a time.
5. **Claude subscriptions are used only through Claude Code over MCP.** No claude.ai login in the app; in-app AI uses an API key from the Keychain (AD-LL-003).
6. **Secrets** live in the macOS Keychain; never in files, logs, errors, tests or commits.
7. **Client footage stays local** unless cloud is allowed for that project; every upload is logged.
8. **Licences:** check commercial use per model before wiring it in; unclear means no.
9. **`src/core/` stays DOM-free and Node-free** (AD-LL-009).
10. **Views are generated.** Do not hand-edit `src/ui/views/*.view.tsx`; change `design/`, `src/ui/bindings.json` (design text that becomes data, D-LL-021) or `scripts/port-design.mjs`, then regenerate. Behaviour lives in `src/ui/logic/`.
11. **Keep the cheek-only look-match metric** (D-LL-007).
12. **Screens reach the engine only through `run(cmd, text, input, { quiet })`** from the Shell. A stand-in never shows the design's success text. When a screen's data becomes real, add it to `REAL_SCREENS` in `src/ui/components/StatusLayer.tsx` and stop calling `sampleBadge()` there.
13. **Engine code must be erasable TypeScript** (no enums, namespaces, parameter properties): Node runs it directly (D-LL-019, B-LL-001).

## Records (the project-records convention, project code `LL`)
- Next free numbers: read [`docs/id-registry.json`](docs/id-registry.json) (`allocated` is the high-water mark). Never type a "next id" into this file.
- Where writing goes: shape change → `docs/architecture-decisions.md` (chose · rejected · why · trade-off); choice inside the architecture → `docs/decision-log.md`; a session's measured result → `docs/progress-log.md`; a defect → `docs/bug-log.md` **at the moment it is found**; a term → `docs/CONTEXT.md`; not yet a decision → `plans/`; private working context → `docs/decision-log.local.md` (gitignored, never quoted into committed files).
- The v0.2 decisions `D-001`…`D-012` are rendered as `D-LL-001`…`D-LL-012`. Never renumber any id.
- `tests/records/` checks the bug-log shape and the registry. Keep them green.

## Where things are
```
src/core/        pure maths: colour (CIELAB, CIEDE2000), palette, tone stats, active picture, cuts, SHA-256 (P2); light fit and match come in P3/P6
src/contracts/   zod schemas, versioned
src/actions/     registry + one module per domain + rules (R1..)
src/engine/      server, security, store, events, MCP, secrets, AI provider
src/ui/          shell, views (generated), logic (owned), runtime (engine client)
bin/looklab.mjs  CLI
design/          Claude Design export (read-only input; HANDOFF.md is the UI spec)
reference/v0.2/  the old prototype (read-only; salvage maths and lessons, not UI)
tests/           records/, core/, actions/, engine/, ui/
```

## Working rules
- Before each phase: a five-line plan and the tests that will prove it. Tests first.
- Touch only the files the task names. Never `git add -A`; stage what you changed.
- The project folder's name ends with a space (`LOOK LAB `). Quote every path.
- Plain, direct prose in UI copy and docs. State limits.

## Gotchas that cost time once
- Vitest compiles TypeScript itself, so it cannot tell you the engine fails under plain Node. `tests/engine/boot.test.ts` can (B-LL-001).
- `pgrep -f src/engine/main.ts` finds the shell wrapper first; measure the `node` pid's RSS.
- The design's `run(cmd, text)` only showed a toast. In the app it calls the registry; a toast is not proof an action ran.
- MCP tool names cannot contain dots: `breakdown.fit_light` is exposed as `breakdown_fit_light` (D-LL-016).
- A clip recorded in Chrome with `canvas.captureStream` + `MediaRecorder` has a first frame with different colours from the rest (B-LL-002). Test clips open on black. Chrome's decoding itself is consistent.
- A web page is never told a dropped file's path; a reference is known by name, size, date and SHA-256 (D-LL-027).
- From v0.2: render targets need `sRGBEncoding` (now `colorSpace = SRGBColorSpace`) or readback is linear and the match metric is wrong; capture a WebGL canvas in the same tick as `render()`; whole-face statistics fail (painted eyes and brows dominate): cheeks only.
