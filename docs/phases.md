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

## P3 · Light and lens, and their ground truth — **done 2026-10-01** against its acceptance as written; **dark skin alone does not pass** (PR-LL-003)
Port the v0.2 light fit (`createFit`) and match metric into `src/core/`, with its 5
synthetic cases · lens estimate · Blender ground-truth set (≥ 20 scenes, known
rigs; needs Blender installed) · light values stay labelled "estimate" until the set
passes. **Acceptance.** v0.2 cases pass at their v0.2 thresholds · on the Blender
set: median az error ≤ 15°, el ≤ 10°, worst case stated · confidence correlates
with error (Spearman ≥ 0.5) or no confidence is shown.

**Result.** Full numbers in [`validation.md`](validation.md); **every Blender number is a claim about the
Blender set only, none about real footage.**
- **v0.2 cases pass at v0.2 thresholds**, and the port is identical to v0.2 (tolerance 0: pixels, every search
  step, the cheek statistic): rembrandt 3° / 0° / 150 K / 0.05 st … extra-b 10° / 1° / 188 K / 0.06 st.
- **Blender set:** 40 scenes (dev 16, held-out 24; each rig in light and dark skin), regenerated with
  `npm run blender-set` in 217 s on the M1's CPU, 5.3 MB committed. The ported fit failed it (dev median az 57°,
  el 27°); scored on the face's skin instead (D-LL-035), **held-out median az 13.9°, el 8.7°: passes.** Light
  skin 7.4° / 10.9°; **dark skin 21.9° / 6.9° (az over 15° on its own).** **Worst case** `test-04-dark`: a key at
  az 17°, el 1° fitted at 78°, 11° (61° off). Kelvin 445 K (written); fill 1.10 stops and softness 0.31 (not
  written, D-LL-037). A face box off by up to ±8% per edge raises the median az to 26°.
- **Confidence:** Spearman(score, −direction error) 0.57 on the held-out set (0.50 dev): shown, as a score.
- **Lens:** focal length from the original still's EXIF as `metadata` (D-LL-034), otherwise by hand.
- **In Chrome** (`tests/ui/light.e2e.test.ts`): a committed Blender render imported, the face dragged, Fit light
  pressed: Key azimuth, elevation and colour read ESTIMATE (never MEASURED); fill, key:fill, hardness, key type
  and practicals stay SAMPLE; the marker names both; nothing claims accuracy on real footage; a still with EXIF
  reads its focal length as METADATA. Fit light works with no AI connected.
- **Measured on the M1 (8 GB):** one fit 196 ms median in the fit itself, 204–206 ms over HTTP (first call
  310–315 ms). Engine RSS: 137 MB idle fresh, 144 MB after one frame is imported and measured, 144 MB peak during
  ten fits and after; after a 60 s 1080p import, 147–185 MB idle over five runs (footprint 155–156 MB), and ten
  fits add 0–2 MB at their peak and nothing that stays. **The fit does not push the engine over 150 MB; the
  60 s import does, in most runs (B-LL-004, open).** Import itself re-measured: 19.4 s.
**Not done:** the face is marked by hand (no detector); dark skin fails the direction bar on its own; the fit
is sensitive to a careless box; fill and hardness are not estimated; no real footage was checked (none exists
with known light); B-LL-004 (engine memory after a long import) is open.

**Next: P4.** Build prompt `prompts/06-phase-4.md`; its CLAUDE.md is drafted in `prompts/06-phase-4-CLAUDE.md`.

## P4 · AI in the app — **done 2026-10-02** against its acceptance; **the two live calls not run: no API key** (PR-LL-004)
Provider adapter (Anthropic via API key in the Keychain) · spend cap and cost
log · `breakdown.fit_mood`, `breakdown.ask`, framing/lens labels as T2 with
confidence · R5 routing to review below 60 · No AI mode verified on every screen.
**Acceptance.** Zero live calls in the suite (stub client) · cap stops calls at the
limit (test) · AI values never render as measured (test).

**Result.** All three acceptance tests pass; 389/389 tests, 42 files.
- **Zero live calls:** every test runs behind a guard that refuses any connection off the machine, and Chrome runs
  offline (D-LL-045); the suite drives the real provider through a stub transport.
- **The key** (D-LL-048): added only in Settings in the Look Lab window, written to the Keychain on stdin, read for each
  call; refused over MCP and the CLI; a test finds it in no file, row, event, answer, error or log line.
- **The cap** (D-LL-040, AD-LL-011, AD-LL-012): a call is priced at its worst case and refused before it is sent if it
  would cross the cap; `used_inr` equals the rows' `cost_inr`; the month rolls over in UTC; calls run one at a time.
- **AI values:** mood and Ask are `ai` with the model's own confidence, shown "AI · n" (D-LL-042), never MEASURED or
  ESTIMATE; measured, estimated, EXIF and hand-set values survive a call; only numbers and words leave the machine
  (D-LL-039); bad output is refused with its cost logged; Ask may quote only the record's numbers (D-LL-047). Shot size
  comes from the face box by R2 (T0, D-LL-046); the lens labels stay by hand (`fit_lens` is still a stand-in). Stand-ins
  18 → 14. R5: 59 is queued, 60 is not; one click confirms, recorded on the decision that wrote it (D-LL-049).
- **No AI:** with No AI on, no key, or the cap reached, every AI control on all 11 screens is off and names which;
  every screen works by hand; Fit light (T0) and shot size work; mood can be typed (Chrome tests).
- **Memory (M1, 8 GB):** B-LL-004 fixed by `--max-semi-space-size=1` (D-LL-044): idle after a 60 s import 119–130 MB
  RSS over five runs (it was 147–185), 130–135 MB over three runs with the AI client loaded; idle fresh 138–141 MB;
  footprint 130–147 MB. One light fit 210–218 ms median over HTTP (P3: 204–206).
**Not done:** the live mood and Ask calls on the M1 (time, tokens, rupees, the cap counting them): the founder chose not
to add an API key and to use Claude Code as the AI (D-LL-050); `scripts/measure-ai.ts` runs them when a key is added.
Engine memory during and after a real call is therefore not measured. A value Claude Code writes over MCP reads MANUAL
(D-LL-050, its own decision next). The UI loads Google Fonts from the internet on every page load (D-LL-045, noted).

**Next: P4.5.** Spec `plans/P-LL-001-colour-grading.md`; design prompt `prompts/08-claude-design-colour.md`; build
prompt `prompts/09-phase-4-5.md`; its CLAUDE.md is drafted in `prompts/09-phase-4-5-CLAUDE.md`.

## P4.5 · Colour: what to capture and how to grade — **in progress** (PR-LL-005)
**Status 2026-10-03.** Done: the five ADs and the tolerances; the grade check (maths and helper actions, usable over
MCP); mireds and the gel search; the kit, project, location and green–magenta contracts; every common photo format
imports (D-LL-055); B-LL-006. Not done: the cited documents, the rest of the colour maths, the colour plan and capture
card, the remaining actions, the Blender colour set, the screens (waiting for the design export of `prompts/08`).
Next session: `prompts/10-founder-test-and-p4-5.md` (the founder uses the whole app first, then the build continues).

**Goal.** For a reference shot, tell the crew what to put in front of the lens (each light's colour and the kit
setting or gel that gets it, key:fill, the colours that must physically exist in the set and wardrobe), how to set the
camera (white balance, profile and gamut, base ISO, exposure targets, recording, frame rate and shutter, charts), and
what is left for the grade (a starting ASC CDL, a .cdl and a 33-point .cube); then measure a test-shoot or graded still
against the reference, in numbers. Every number is T0 maths from the breakdown, the kit and cited documents; a model
may choose only the strategy (D-LL-003). Spec: [`P-LL-001`](../plans/P-LL-001-colour-grading.md) (V-LL-002, D-LL-043).
**Deliverables.** Five ADs, each with the founder's yes first: the kit's colour fields (camera recording modes, light
colour ranges, the gel book, monitoring, charts), the project and location colour settings, the colour plan record
and the Breakdown's green–magenta fields, the Set Sheet's capture card, the still and grade-check records · colour maths
in `src/core/` (mireds and the gel search, S-Log3, S-Gamut3.Cine, CCT and Duv, the ASC CDL and its fit, the base
transform, .cdl and .cube) · actions `colour.plan_capture`, `colour.fit_cdl`, `colour.set_split`,
`colour.choose_strategy` (T2), `colour.export_cdl`, `colour.export_lut`, `colour.import_still`, `colour.check_grade`,
`adapt.set_kit_colour` · the Breakdown's CAPTURE & GRADE section and grade-check mode, the capture card (A4 and phone)
and the kit colour editor, from the export of `prompts/08-claude-design-colour.md` · the Blender colour set (dev 16,
held-out 24) and the noise and banding test.
**Acceptance.**
- The maths tests pass at P-LL-001 §9.1's tolerances; the 33-point LUT matches the exact pipeline (ΔE00 99th
  percentile ≤ 1.0, worst ≤ 3.0); .cdl and .cube round-trip exactly.
- Every manufacturer number in code is cited from a document read in the phase, its licence checked; none from memory.
- Held-out Blender colour set, tolerances written in `validation.md` before it ran: light colour from the grey patch
  median ≤ 5 mired; the fitted CDL's output within ΔE00 1.0 median of the true grade's; the grade check reports a known
  grade within ΔE00 1.0 median per swatch; set colours classified right on ≥ 90% of scenes; key:fill ≤ 0.5 stop median
  or not written; light and dark skin reported apart. A pass is a claim about the Blender set only.
- No colour number comes from a model (test); every colour value carries the weakest source of its inputs: a plan from
  sample inputs reads SAMPLE, a gel chosen from the fitted key reads ESTIMATE, no computed light colour reads MEASURED
  (test).
- The sample plan reports ½ CTS missing from the gel book; a key on the fit's 2800 K bound asks for the value by hand
  (test).
- In Chrome: Plan capture, Export .cdl and .cube (files parse), a grade check on a committed still, the capture card on
  one A4 page and on the phone; with No AI on, every colour button works except Choose strategy, which says why.
- Engine ≤ 150 MB idle after building a LUT and after a grade check (RSS and footprint measured).
Design prompt `prompts/08-claude-design-colour.md` runs first; build prompt `prompts/09-phase-4-5.md`; its CLAUDE.md is
drafted in `prompts/09-phase-4-5-CLAUDE.md`.

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
The set sheet also carries the per-shot **capture card** from P4.5 (P-LL-001 §10): camera (profile and gamut, base
ISO, white balance set by number, exposure targets, recording, frame rate and shutter), each light with its fixture
setting, gels and residual, the set and wardrobe colours that must exist, charts at the head of every setup, the
monitoring LUT and the grade start. It is copied from the shot's colour plan when the sheet is generated, names that
plan's version, shows every number with its source and every gap in amber, and prints as its own A4 page (so "fits
one A4 page" applies to each page). Acceptance gains: the capture card matches the colour-plan version it names (test).

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
