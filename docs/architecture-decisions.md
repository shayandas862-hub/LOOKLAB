# Look Lab — Architectural Decision Log

> Decisions that change the **shape** of the system: a component or a connection.
> Choices made inside that shape go to [`decision-log.md`](decision-log.md). Newest
> at the top. Every entry carries **chose · rejected · why · trade-off**. Numbers come
> from [`id-registry.json`](id-registry.json) and are never renumbered.

---

## 2026-10-02 — P4.5: colour (contracts from P-LL-001 §7)

All five are additive: every new field is optional or defaulted, every stored record still parses, `schema_version`
stays 1, and every number is a `Value` (architecture §5). Each change lands with a test that records written before it
still parse.

- **AD-LL-018 — A still and its grade check are records of their own.**
  **Status: accepted by the founder, 2026-10-02** (answer to the P4.5 questions: "Yes to all five"). Spec: P-LL-001 §7.
  **Chose:** `Still` (project, shot, file facts as `MediaFile`, its one frame, kind `display` or `log`, face box, chart
  corners) and `GradeCheck` (the still, the reference and frame it was checked against, the colour plan version,
  whether the look LUT was applied, one row per measure with both `Value`s, the difference, its unit, the verdict and
  the threshold version, and one row per swatch). **Rejected:** importing a still as a second reference (a reference is
  what a look is learned from; a still is what is checked against one, and mixing them would let a test shoot become
  a look); keeping only the latest check (the history of checks is how a grade converges). **Why:** P-LL-001 §4.6.
  **Trade-off:** one more import path to keep in step with `breakdown.import_reference`.

- **AD-LL-017 — The Set Sheet carries a capture card, copied from the shot's colour plan when the sheet is generated.**
  **Status: accepted by the founder, 2026-10-02** (answer to the P4.5 questions: "Yes to all five"). Spec: P-LL-001 §7.
  **Chose:** `SetSheet` gains `capture` (the crew-facing fields of the colour plan) and `colour_plan_version`.
  **Rejected:** the sheet reading the live plan (the sheet would change under the crew after printing). **Why:**
  P-LL-001 §10 and the P7 card. **Trade-off:** a re-planned shot needs its sheet generated again; the sheet names the
  plan version it copied.

- **AD-LL-016 — The light gains green–magenta; each shot gains a colour plan record.**
  **Status: accepted by the founder, 2026-10-02** (answer to the P4.5 questions: "Yes to all five"). Spec: P-LL-001 §7.
  **Chose:** `Breakdown.light` gains `key_gm` and `fill_gm` (Duv, editable, default 0). A new record `ColourPlan`, one per
  shot at `projects/<id>/colour/<shot_id>.json`, its version rising with each run: the inputs' fingerprint, the split,
  the assumptions in force, camera, lights, key:fill, set colours, charts, monitoring, the grade (the ten CDL numbers as
  `Value`s and the space they apply in) and the gaps. **Rejected:** putting the plan inside `Breakdown` (the breakdown
  holds what was read from the reference; the plan is derived from it, the kit and the split, and changes when they
  change). **Why:** P-LL-001 §4. **Trade-off:** a plan can be stale against a changed breakdown; the fingerprint says so.

- **AD-LL-015 — The project and the location gain their colour settings.**
  **Status: accepted by the founder, 2026-10-02** (answer to the P4.5 questions: "Yes to all five"). Spec: P-LL-001 §7.
  **Chose:** `Project.colour`: delivery (`rec709_g24`), the web file (same codes or converted), grading app, colour
  management (`rcm` or `yrgb`), frame rate (a `Value`). `Location.mains_hz` (a `Value`, 50). **Rejected:** keeping them
  in `Settings` (they differ per production and per place). **Why:** the camera rules (frame rate, shutter, flicker)
  and the export (delivery) need them per shot. **Trade-off:** none found.

- **AD-LL-014 — The kit gains its colour facts: camera recording, each light's colour range, the gel book, monitoring, charts.**
  **Status: accepted by the founder, 2026-10-02** (answer to the P4.5 questions: "Yes to all five"). Spec: P-LL-001 §7.
  **Chose:** each light item gains `colour` (CCT range and step, green–magenta range with the maker's unit and its Duv
  per unit, RGB, flicker-free), each a `Value` with a `cite`; `Kit` gains `gels[]` (maker, number, name, mired shift or
  published conversion, Duv shift, transmission, sheets, `cite`), `camera.recording` (profiles and gamuts, base ISOs,
  clip level, codecs with bit depth and chroma, RAW, white-balance and tint ranges, shutter angles, display LUTs, user
  LUT), `monitoring` and `charts`. `Cite` is {document, page or URL, date read, licence: ok | unclear | typed-by-founder}.
  A number typed from a maker's document is `manual` with its citation (D-LL-051, P-LL-001 open question 9).
  **Rejected:** a table of makers' numbers inside the code (a fact about our kit belongs with the kit, editable, cited);
  a new `Value.source` for document values (its own AD if ever needed). **Why:** every gel, white balance and recording
  choice in P-LL-001 §4 reads these. **Trade-off:** the kit editor grows; until a value is cited it reads "needs
  <document>" and is never guessed.

---

## 2026-10-01 — P4: AI in the app

- **AD-LL-013 — A value names the decision row that wrote it (`Value.decision_id`).**
  **Status: accepted by the founder, 2026-10-01** (reply to the P4 questions: "what are you waiting for?", taken as yes
  to every recommendation). **Chose:** every `Value` may carry `decision_id`, the id of the decision row whose action
  wrote it; the registry creates that id before the handler runs, so the handler can stamp it on the value it writes.
  AI values always carry it. **Rejected:** finding the decision at review time from the shot code and the action name
  (decision rows know the shot but not the project, and two projects can both have a shot "12C"); a separate
  `ai_decisions` map on the breakdown (a second place to keep in step with the values). **Why:** R5's review must
  record its verdict on the exact call that produced the value (D-LL-023, P4 task 4). **Migration:** additive and
  optional; every stored record parses unchanged and `schema_version` stays 1. **Trade-off:** one more field on
  every value an action writes.

- **AD-LL-012 — A decision row records what a model call sent and cost (`Decision.ai`).**
  **Status: accepted by the founder, 2026-10-01.** **Chose:** a decision row gains `ai` (null for every action that
  called no model): provider, model, prompt id and version, `sent` (the system prompt and the user message: exactly
  what left the machine), tokens in and out as billed, time, stop reason, the worst case the call was priced at before
  it was sent, and the dated prices and rupee rate used. `cost_inr` (from P1) holds the real cost and is written for
  failed calls too. **Rejected:** the prompt version only, with the text in code (a row could not then be read on its
  own, and a changed prompt file would rewrite history); a separate upload log (D-LL-039 sends no footage, and the row
  already holds every byte that was sent). **Why:** the P4 card: "the prompt and its version are in the decision
  row", a cost on every row, and `used_inr` equal to the rows' sum. **Migration:** additive with a default of null;
  rows written before P4 parse unchanged. **Trade-off:** an AI row is a few KB (the prompt is repeated in each); calls
  are capped by money, so the log grows slowly.

- **AD-LL-011 — The spend belongs to a month (`Settings.api.month`).**
  **Status: accepted by the founder, 2026-10-01.** **Chose:** `Settings.api` gains `month` ("2026-10"), the UTC month
  `used_inr` counts, as Anthropic bills. The first call or read in a new UTC month sets `used_inr` to 0 and the new
  month; a record from before P4 (`month: null`) adopts the current month and keeps its total. **Rejected:** a
  rolling 30 days (not what the bill says); local time (India is 5 h 30 ahead, so the cap would reset before the bill
  does); summing the decision log on every check (slow as it grows, and a row's cost is already added once).
  **Migration:** additive with a default of null. **Trade-off:** none found.

---

## 2026-09-30 — P3: light and lens

- **AD-LL-010 — `Value.source` gains `estimate` (a fitted value) and `metadata` (read from the file's own tags).**
  **Status: accepted by the founder, 2026-09-30.**
  **Chose:** the `Source` enum becomes `measured | manual | metadata | estimate | ai | sample`.
  `estimate`: a T0 instrument fitted a model to the actual pixels (the light fit), so the number comes
  from the frame, but through the model's assumptions (D-LL-008), and its accuracy is known only on
  synthetic sets. It reads **ESTIMATE**, never MEASURED. A fitted value stays `estimate` even when the
  Blender set passes: passing a synthetic set changes what the validation table says, not the label
  (standing rule 3); only a ground-truth set of real frames could argue for more, and that is its own
  decision. It carries a `confidence` only if confidence tracks error on the set (Spearman ≥ 0.5).
  `metadata`: read from the original file's tags (EXIF focal length), not from pixels and not typed by
  a person. It reads **METADATA**. For "the weakest source in a group" (a look's `light_source`, a
  screen row made of several leaves) the order is measured, manual, metadata, estimate, ai, sample.
  **Rejected:** keeping `measured` with a side flag such as `validated: false` (a reader that checks only
  `source` would show a fitted light as MEASURED, which is what the P3 card forbids); `ai` with a
  confidence (no model is called, and `ai` promises a confidence the fit may not have); one new value for
  both (a fitted light and a camera's own record of its focal length fail in different ways: the first
  through the model's assumptions, the second when the picture was cropped or re-saved after capture);
  `manual` for EXIF (nobody typed it). **Why:** architecture §5 calls a value `measured` when a T0
  instrument computed it from the actual pixels. The fit does that, but through a model of the scene
  that can be wrong about it, and the P3 card says light reads as an estimate, never MEASURED; the word
  has to live where every reader already looks. **Migration:** additive. Every stored record still
  parses, so `schema_version` stays 1; the readers that branch on a source (badges, the weakest-source
  rank, the Library) gain the two cases, with tests. **Trade-off:** two more badge states on every
  screen that shows a value.

---

## 2026-09-30 — v1 architecture (full picture in [`architecture.md`](architecture.md))

- **AD-LL-009 — Core maths is DOM-free and runtime-agnostic, shared by the browser and the engine.**
  **Chose:** `src/core/` imports nothing from the DOM or Node; it takes typed arrays
  and returns plain objects. **Rejected:** measuring inside UI components (untestable
  without a browser), or only in the engine (every frame would cross HTTP).
  **Why:** the same palette or light-fit code must run where the pixels are (the
  browser, for video) and where an agent calls it (the engine, over MCP), and be
  tested in Node. v0.2 had to regex-extract its core block to test it.
  **Trade-off:** core cannot use canvas, WebGL or `fs`; callers hand it pixels.

- **AD-LL-008 — The local server is treated as reachable by any website.**
  **Chose:** bind `127.0.0.1`, allow only the engine's own `Host`, require a
  custom-header token on `/api`, a bearer token on `/mcp` and the CLI, validate every
  input by schema, rate-limit per client. **Rejected:** "it's localhost, so it's
  safe". **Why:** browsers let any page send requests to localhost, and DNS
  rebinding defeats origin checks alone. **Trade-off:** a teammate cannot open the
  UI from another machine on the LAN; that is the hosted version's job.

- **AD-LL-007 — Video and images are decoded by the browser; the engine has no FFmpeg dependency.**
  **Chose:** the UI decodes with `<video>`/`<img>` and canvas (hardware decode on
  M1) and sends frames to the engine as PNG. **Rejected:** FFmpeg as a required
  install (not present on the target machine, measured 2026-09-30; one more thing a
  teammate must install), and a WASM FFmpeg (≈30 MB, slow, memory-hungry).
  **Why:** zero-install and light. **Trade-off:** formats the browser cannot decode
  (ProRes, some RAW) are refused with a clear message; an optional FFmpeg adapter can
  be added behind the same interface, and is required before an agent can import a
  video by path over MCP.

- **AD-LL-006 — React for the UI; screen views are generated from the design export.**
  **Chose:** React 19. `scripts/port-design.mjs` turns each `design/*.dc.html`
  template into `src/ui/views/*.view.tsx` (regenerable); each screen's behaviour
  lives in `src/ui/logic/*` (owned, never regenerated). **Rejected:** lit (lighter
  by a few MB, but the design's logic is React class components and would need its
  lifecycle re-implemented), a hand rewrite (slow, drifts from the design).
  **Why:** fidelity to the approved design, and a re-exported design can be pulled
  in again. **Trade-off:** generated views use inline styles and are not
  hand-edited; changes go through the design or the converter.

- **AD-LL-005 — Files on disk behind a `Store` interface; SQLite deferred.**
  **Chose:** one JSON file per record, written atomically, plus an append-only
  `decisions.jsonl`, under `~/LookLab/`. **Rejected:** SQLite now (`node:sqlite` is
  still experimental in Node 22; `better-sqlite3` is a native build a teammate may
  fail to compile). **Why:** readable, diffable, zero native dependencies.
  **Trade-off:** no queries across records; revisit when the decision log passes
  ~10,000 rows or the router phase needs joins.

- **AD-LL-004 — Contracts are versioned zod schemas; everything else sits behind an interface.**
  **Chose:** `src/contracts/` holds a schema with `schema_version` for every stored
  record; store, secrets, AI provider, media decoder and renderer are interfaces
  with one implementation each today. **Rejected:** types without runtime
  validation. **Why:** "rigid but flexible": the shapes an agent and a teammate
  depend on cannot drift, and the parts most likely to change (providers, storage,
  hosting) can. **Trade-off:** a schema change needs a migration and a test.

- **AD-LL-003 — AI in three modes; a Claude subscription is used only through Claude Code over MCP.**
  **Chose:** (a) the person's own Claude Code connects to `/mcp`; (b) an API key
  powers in-app AI buttons, with a spend cap; (c) No AI mode. **Rejected:** a
  "Sign in with Claude" inside the app, or reusing Claude Code's login through the
  Agent SDK. **Why:** Anthropic does not allow third-party products to offer
  claude.ai login or use subscription OAuth tokens, including via the Agent SDK
  (<https://code.claude.com/docs/en/agent-sdk/overview>, read 2026-09-30).
  **Trade-off:** in-app AI buttons need an API key; a subscription-only teammate
  uses AI by asking Claude Code.

- **AD-LL-002 — One action registry is the only way to change state.**
  **Chose:** every feature is a named, typed action; UI buttons, ⌘K, MCP and CLI
  are projections of the registry, and a parity test enforces it. **Rejected:** UI
  code calling the store directly, with MCP tools added later. **Why:** the founder
  wants full control both by button and by Claude, and a feature that exists on only
  one surface is a bug. **Trade-off:** every feature pays for a schema up front.

- **AD-LL-001 — A local engine serving a browser tab; not a Claude artifact, not Electron.**
  **Chose:** one Node process on `127.0.0.1` that serves the UI and the API, opened
  in the browser the person already runs. Distributed through a private GitHub repo
  (`npm install && npm start`). **Rejected:** the single-file Claude artifact (no
  disk, no MCP, no API keys, CSP limits; v0.2's shape), Electron (ships its own
  Chromium: roughly 150–300 MB more memory and a large download), Tauri (needs a
  Rust toolchain to build; WKWebView lags Chrome on WebGL and WebCodecs).
  **Why:** lightest option on an 8 GB machine, and the same engine can be hosted
  later. **Trade-off:** needs Node 22 on each machine; a signed desktop app is a
  later packaging step, not a rewrite.
