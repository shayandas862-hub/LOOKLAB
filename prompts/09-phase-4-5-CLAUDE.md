# Look Lab — Phase 4.5: Colour, what to capture and how to grade

## What This Product Is
A technical pre-production brain for film: break down a reference, adapt the look to our location and kit, plan lights, camera and actors in 3D, hand the crew a set sheet, and say what to capture on set and what is left for the grade.
For the founder's film production team: internal first, public later; runs on an 8 GB M1 beside a browser, Slack and Claude.
Its purpose: move cost and mistakes out of shoot days by working the shot out before the shoot ([`docs/VISION.md`](docs/VISION.md) §1, colour since V-LL-002).

## What Has Already Been Built
- P0: records in the CalmLine layout (code `LL`), architecture AD-LL-001…009, the v0.2 prototype kept read-only, the design export; records tests passing.
- P1: engine on 127.0.0.1:4317, one action registry behind the UI, ⌘K, MCP and a CLI; the 11 design screens generated as React views; all tests passing (PR-LL-001).
- P2: deterministic breakdown: Chrome imports an image or video (SHA-256, 2 frames/s at ≤ 512 px, file never copied), cuts, palette, tints, saturation, contrast and aspect measured, subject set by hand; 193/193 tests passing (PR-LL-002).
- P3: the v0.2 light fit ported exactly and re-scored on the face's skin (D-LL-035); Blender ground truth, 40 scenes; held-out median az 13.9°, el 8.7° (dark skin az 21.9°: fails on its own); key direction and kelvin written as `estimate`, kelvin within 445 K median (D-LL-037); EXIF focal length as `metadata` (AD-LL-010); 307/307 tests passing (PR-LL-003).
- P4: B-LL-004 fixed (engine 119–135 MB idle after a 60 s import, `--max-semi-space-size=1`); in-app AI through an API key built and dormant (no key: the founder uses Claude Code, D-LL-050): `claude-opus-5` over `node:https`, key only in the Keychain, worst-case pricing and a monthly cap, mood and Ask as "AI · n" with R5 review under 60, shot size from the face box (R2, T0); the suite has no network; 389/389 tests passing (PR-LL-004).
- Colour spec: [`plans/P-LL-001-colour-grading.md`](plans/P-LL-001-colour-grading.md), written 2026-10-02 (V-LL-002, D-LL-043). This phase builds it.

## What You Are Building In This Phase
For a reference shot, Look Lab tells the crew what to put in front of the lens (each light's colour and the fixture setting or gel from our kit that gets it, key:fill, the colours that must physically exist), how to set the camera (white balance, S-Log3 or not, base ISO, exposure targets, recording, frame rate and shutter, charts), and what is left for the grade (a starting ASC CDL, a .cdl and a 33-point .cube). A grade check measures a test-shoot or graded still against the reference in numbers. Every number is T0 maths from the breakdown, the kit and cited documents; a model may only choose the strategy. After this phase the Breakdown has CAPTURE & GRADE and a grade-check mode, the Set Sheet carries the capture card, and a Blender colour set has checked the maths against tolerances written before it ran.

## Your Tasks — Complete In This Order
1. **Records, documents and contracts.**
   Read and cite Sony's FX3 documents and S-Log3/S-Gamut3.Cine technical summary, the confirmed maker's gel book, the fixtures' sheets, ASC CDL v1.2, the Adobe Cube LUT spec 1.0, X-Rite's ColorChecker values and Kim et al. (2002), each with a licence verdict (unclear means no: P-LL-001 names the fallback). Write the five ADs of P-LL-001 §7 (the founder said yes to all five on 2026-10-02, and accepted the defaults of P-LL-001 §11; record both as D/AD records citing that). Type the kit's colour numbers from the documents (`manual`, with `cite`). Write the §9.3 tolerances and the §9.4 declaration into `docs/validation.md` §5 now (§4 is P4's AI values).
   → Tests first: every stored record still parses after each contract change; a kit colour number without a `cite` is refused.
2. **Colour maths in `src/core/`.**
   Start with the grade check's maths (palette matching, ΔE00 rows, the differences): matching a shot to its reference is the founder's priority (2026-10-02). Then mired and the gel search; S-Log3; the S-Gamut3.Cine matrices from the primaries; CCT and Duv; the ASC CDL forward, inverse and fit; the base transform B and B⁻¹; .cdl and .cube writers and parsers; LUT application; the set-colour verdicts; the camera rules. Exactly as P-LL-001 §4 writes them; a change to a formula or threshold is a D record first.
   → Tests first, at P-LL-001 §9.1's tolerances (Sony's table, the ASC examples where allowed, round trips, the LUT against the exact pipeline).
3. **The Blender colour set and the noise and banding test.**
   P-LL-001 §9.2: the P3 head with a chart, a grey card, a neutral wall and a painted prop; dev (seed 3, 16 scenes) while building, held-out (seed 4, 24 scenes) run once; truth checked without Blender; committed ≤ 15 MB. §9.4 on synthetic frames.
   → The accuracy tests are written before the set is generated; a failed tolerance is reported as failed, never loosened.
4. **Actions.**
   `colour.plan_capture`, `colour.fit_cdl`, `colour.set_split`, `colour.choose_strategy` (T2 through P4's provider, cap, "AI · n", R5), `colour.export_cdl`, `colour.export_lut`, `colour.import_still`, `colour.check_grade`, `adapt.set_kit_colour`; helpers and getters `command: false`. Every output `Value` takes the weakest source of its inputs.
   → Tests first: sources (sample stays SAMPLE, a gel from the fitted key is ESTIMATE, nothing computed is MEASURED); a strategy answer carrying a number is refused; the ½ CTS gap; the 2800 K bound; export formats; the grade check on a still identical to the reference reads zero.
5. **Screens.**
   `npm run port-design` from the new export; behaviour in `src/ui/logic/`: CAPTURE & GRADE, grade-check mode, the Set Sheet's capture card (A4 page 2, phone), the kit colour editor. Only Choose strategy is AI-gated: check every new button's binding.
   → Chrome tests first (see Done Looks Like).

## Rules — Non-Negotiable
1. Write the test before writing the code for every single task. No exceptions. The test must exist, and fail, before any implementation begins.
2. Only touch files directly related to the current task. If something looks wrong in another file, note it; do not touch it.
3. If a hand-written file reaches 300 lines, stop and split it before continuing. Generated views are exempt.
4. After each task, self-review: does it do exactly what was asked, does it have a passing test, did it touch only the right files.
5. Do not begin the next task until the current one has a passing test and has passed self-review.

**Project hard rules** (break only with a new AD or D record and the founder's yes):
1. Every feature is an action in the registry (`src/actions/`); nothing writes to the store any other way. New getters and helpers get `command: false` so the design-catalogue parity test holds (AD-LL-002).
2. Never present a stand-in as a real call. Stand-ins return `source: 'sample'`; sample data shows the Sample marker (D-LL-015, D-LL-032, D-LL-038). No colour action ships as a stand-in.
3. No accuracy claims on real footage until a ground-truth test for it passes. An AI label is a word, not a measurement; a Blender-set number is a claim about the Blender set only.
4. Look Lab's own processes ≤ 1.5 GB on the M1; engine ≤ 150 MB RSS idle (119–135 MB after a 60 s import since D-LL-044). Measure every addition (RSS and `footprint <pid>`).
5. Claude subscriptions only through Claude Code over MCP; in-app AI uses an API key from the Keychain (AD-LL-003). Zero live calls in the test suite (D-LL-045).
6. Secrets live in the macOS Keychain, never in files, the store, decision rows, events, logs, errors, tests or commits.
7. Client footage stays local unless cloud is allowed for that project; every upload is logged. A model call sends numbers and words only, never a frame (D-LL-039).
8. Licences: check commercial use before wiring in any model, SDK, asset or published table; unclear means no.
9. `src/core/` stays DOM-free and Node-free (AD-LL-009; `tests/core/purity.test.ts`).
10. Views are generated: change `design/`, `src/ui/bindings.json` (text, or `"[title=…] attribute"`, D-LL-021, D-LL-038) or `scripts/port-design.mjs`, then `npm run port-design`. Behaviour lives in `src/ui/logic/`.
11. Models choose words and labels, not numbers we measure or compute (D-LL-003): no AI light, palette, contrast, white balance, gel, ratio, exposure or CDL. Keep the cheek-only look-match metric (D-LL-007).
12. Screens reach the engine only through `run(cmd, text, input, { quiet })` from the Shell.
13. Engine code is erasable TypeScript: no enums, namespaces or parameter properties (D-LL-019, B-LL-001).
14. Never `git add -A`; stage what you changed, never `.claude/`. The folder name ends with a space (`LOOK LAB `): quote every path.

**Colour honesty rules** (P-LL-001; break only with a D record and the founder's yes):
15. Every colour number is T0 maths: mireds, gel arithmetic, camera curves and gamuts, the CDL fit. A model may choose the strategy (light, grade, both) and nothing else.
16. A maker's or standard's number enters code only from a document read in this phase, cited (document, page or URL, date read) with its licence checked; never from memory. Missing reads "needs <document>".
17. One frame cannot say what was lit and what was graded: the split (S0 by default) is shown wherever its numbers are, and a person can change it.
18. The reference is an 8-bit display-referred frame: no output claims to know its scene range, original white balance or gamut (P-LL-001 §3).
19. Every colour output `Value` carries the weakest source of its inputs (AD-LL-010 order). A computed light colour is never MEASURED.
20. Tolerances are written in `docs/validation.md` before the colour set runs; the held-out set runs once; a failure is reported, not loosened.
21. The light fit (P3) does not change in this phase: not its kelvin range (2800–7000 K), not its tolerances.

## Done Looks Like
- Maths tests pass at P-LL-001 §9.1's tolerances; the 33-point LUT matches the exact pipeline (ΔE00 99th percentile ≤ 1.0, worst ≤ 3.0).
- Every maker's number in code is cited with its licence verdict; none comes from memory.
- The held-out Blender colour set against the §9.3 tolerances written beforehand, light and dark skin apart, each pass or fail stated, in `docs/validation.md` §5.
- No colour number from a model (test); sample inputs give a SAMPLE plan and a fitted key gives ESTIMATE gels (test); the ½ CTS gap and the 2800 K bound are reported (test).
- Chrome: Plan capture shows CAPTURE & GRADE with badges and the split line; Export .cdl and .cube give files that parse; a committed still runs through the grade check; the capture card prints as one A4 page and reads on the phone; with No AI on every colour button works except Choose strategy, which says why.
- Engine ≤ 150 MB idle after building a LUT and after a grade check, RSS and footprint written down.
- `npm test` green, `npm run typecheck` clean; P4.5 marked done in `docs/phases.md` with the numbers; a progress entry cites every id touched, P-LL-001 included.

## Tech Stack Reference
- Node ≥ 22.6 with type stripping: runs the engine's TypeScript directly, no build step (D-LL-019).
- TypeScript, erasable syntax only: the whole codebase.
- zod 4: every contract, validated on every action's input and output.
- React 19 + Vite: the UI; views generated from the Claude Design export.
- @modelcontextprotocol/sdk: Claude Code drives every action over MCP.
- Vitest, and playwright-core against the installed Chrome: unit and browser tests.
- node:zlib: the engine's own PNG reader, 8-bit only (D-LL-031).
- Anthropic Messages API over `node:https` (D-LL-041): only `colour.choose_strategy` calls it in this phase.
- macOS Keychain through the `security` command: the only place a key lives.
- Blender 5.1.1 headless: renders the ground-truth sets; a development tool, never a runtime dependency.
- Published formulas, cited in code: Sony S-Log3 and S-Gamut3.Cine, ASC CDL v1.2, Adobe Cube LUT 1.0, ITU-R BT.709 and BT.1886, CIEDE2000 (Sharma 2005), the Kim et al. (2002) locus.

## Folder Structure
```
src/core/        pure maths: colour, palette, tone, active picture, cuts, SHA-256, EXIF, the light fit (light-*.ts, cheek.ts); colour grading (mired, S-Log3, gamut, CCT, CDL, base transform, LUT, capture rules, set colours, grade check)
src/contracts/   zod schemas, versioned (Kit colour, ColourPlan, Still, GradeCheck, SetSheet capture: P4.5)
src/actions/     registry + domain modules (breakdown*.ts, colour*.ts split by concern) + rules (R1…, R15 proposed)
src/engine/      server, security, store, events, MCP, PNG, AI provider, Keychain
src/ui/          shell, views (generated), logic (owned: <Screen>.logic.tsx plus helpers), runtime (engine client, media import)
bin/looklab.mjs  CLI
scripts/         port-design, measure-import.ts, measure-fit.ts; blender/ (plan, render, score, report; the colour set's generator)
design/          Claude Design export (read-only; HANDOFF.md is the UI spec; colour from prompts/08)
plans/           P-LL-001-colour-grading.md: this phase's spec
reference/v0.2/  the old prototype (read-only; salvage maths and lessons, not UI)
tests/           records/, core/, actions/, engine/, ui/, fixtures/ (blender/: the committed ground-truth renders; the colour set beside it)
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
npm run blender-set              # regenerate the P3 Blender ground-truth sets (about 4 min on the M1)
npm run blender-colour-set       # regenerate the colour set (added in this phase; time it)
node --experimental-strip-types scripts/measure-import.ts [clip]   # import time and engine RSS
node --experimental-strip-types scripts/measure-fit.ts [clip] [--keep-browser]   # fit time, engine RSS and footprint
node bin/looklab.mjs mcp-setup   # prints the `claude mcp add` command for this machine
```

## Records (the project-records convention, code `LL`)
- Next free numbers: [`docs/id-registry.json`](docs/id-registry.json) (`allocated` is the high-water mark). Never type a "next id" here.
- Shape change → `docs/architecture-decisions.md`; choice inside the architecture → `docs/decision-log.md` (chose · rejected · why, citing P-LL-001); measured session → `docs/progress-log.md`; defect → `docs/bug-log.md` **the moment it is found**; term → `docs/CONTEXT.md` (mired, Duv, S-Log3 code, the split, LIGHT/GRADE/SET, capture card, grade check); accuracy against a known answer → `docs/validation.md` §5; not yet a decision → `plans/`. Propose a new record file before creating it.
- Never renumber an id. `tests/records/` checks the bug-log shape and the registry; a file `plans/P-LL-NNN-*.md` counts as defining its id.

## Project Documents — Available On Demand
Do not load these at session start; read one only when a task needs it.
- `plans/P-LL-001-colour-grading.md` (the spec: read §4 for the task at hand, §7 for contracts, §9 for tests)
- `docs/phases.md` (the P4.5 card), `docs/architecture.md` (§5 honesty in the data, §7 memory, §12 fixed vs free), `docs/PRD.md`
- `docs/decision-log.md` (D-LL-003, D-LL-007, D-LL-024, D-LL-025, D-LL-029, D-LL-035–037, D-LL-039, D-LL-042, D-LL-043), `docs/architecture-decisions.md` (AD-LL-010 value sources, AD-LL-013), `docs/CONTEXT.md`, `docs/bug-log.md`
- `docs/validation.md`: what is checked against a known answer, and what is not.
- `design/HANDOFF.md` §4: the action catalogue the parity test reads.
- The `repo-analyst` skill: run it when the founder asks for a codebase review.
- Grill Me with Docs runs in Claude Chat, not here. Do not look for it on disk.

## Gotchas that cost time once
- Vitest compiles TypeScript itself, so it cannot see the engine fail under plain Node; `tests/engine/boot.test.ts` can (B-LL-001).
- `pgrep -f src/engine/main.ts` finds the shell wrapper first; measure the `node` pid. RSS on macOS swings by 20–40 MB with memory compression: take several runs and read `footprint <pid>` too (B-LL-004).
- A toast is not proof an action ran; check the store or the decision log.
- The decision log stores a summary of every action's input: a secret passed to a logged action ends up on disk.
- MCP tool names cannot contain dots: `colour.plan_capture` is `colour_plan_capture` (D-LL-016).
- The Breakdown page has two `<aside>`s, navigation then the value panel: a test that reads the first one never sees a badge.
- Design buttons may carry AI gating a T0 action does not need (`disabled="{{ aiBlocked }}"` on Fit light, D-LL-038): check each binding.
- Vitest runs `describe` bodies while collecting, even when `-t` filters the tests: a held-out set computed there is run.
- Chrome's `canvas.captureStream` + `MediaRecorder` writes a clip's first frame with different colours from the rest (B-LL-002); test clips open on black.
- A web page is never told a dropped file's path (D-LL-027).
- The fit's kelvin is searched over 2800–7000 K only, against a 5600 K white balance, with Tanner Helland's approximation (`light-render.ts`); the Blender truth uses the Kim et al. locus. A sodium key sits on the bound.
- Sony's S-Log3 formula works in 10-bit code / 1023 (full range), not legal range; IRE % is (code − 64) / 876 × 100. Where 18% grey sits is read from Sony's technical summary this phase, not recalled.
- A CDL's numbers mean nothing without their space: ours apply to S-Log3 / S-Gamut3.Cine codes, before any display transform. Say so in the .cdl.
- In a .cube the red index changes fastest. A 33-point file is 35,937 rows, about 1 MB of text.
- The Breakdown already has a section named COLOUR (the palette); the new one is CAPTURE & GRADE.
- `cheekStats` (`cheek.ts`) runs on the fit's 40 × 50 crop of the renderer's head; on a real frame, crop with the light fit's window first. No action called it before this phase.
- The engine reads 8-bit PNG only (D-LL-031): a log still arrives as 8-bit S-Log3 codes; 10-bit colour-set frames stay in the generator and tests.
- The sample set sheet's ISO 3200 and WB 3200 K are design values, not an S-Log3 base ISO or this plan's balance.

## End of Phase
When every task above is complete and every test is passing, stop and tell the founder:

"Phase 4.5 is complete. Every task is done and every test is passing.

Two optional next steps — your call:

1. **Repo Analyst** — I can run this now. It reads the full codebase and produces a plain English report of what was built, what's healthy, and what needs attention. Recommended before moving to the next phase. Say 'run repo analyst' and I'll do it.

2. **Grill Me with Docs** — this runs in Claude Chat, not here. Take the Repo Analyst output (if you ran it) plus your original PRD and open a new chat. It checks whether what was built matches what was planned and flags any drift before the next phase begins.

What would you like to do?"

Do not commit or push without the founder's yes. Do not begin the next phase. Wait for the founder's instruction.
