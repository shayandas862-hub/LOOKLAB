# Look Lab — Decision Log

**Every non-obvious choice made inside the architecture, with what was rejected and
why.** Newest first. Choices that change the system's shape live in
[`architecture-decisions.md`](architecture-decisions.md). Numbers come from
[`id-registry.json`](id-registry.json); they are never renumbered or recycled.

## The standing rules

Cited by number. Fixed at the start of v1.

1. **Tests first** on every task that has code: the failing test, then the code.
2. **Never present a stand-in as a real model call.** Stand-ins return `source: 'sample'` and the UI says "sample".
3. **No accuracy claim on real footage** until a ground-truth test for it exists and passes.
4. **Every feature is an action in the registry** (AD-LL-002). Nothing changes state any other way.
5. **The local loop stays light**: Look Lab's own processes ≤ 1.5 GB on the 8 GB M1; heavy models go to the cloud.
6. **Secrets live in the Keychain**, never in files, logs, errors or the repo.
7. **Client footage stays local** unless cloud is allowed for that project, and every upload is logged.
8. **Check a model's licence for commercial client work before wiring it in.** Unclear means not allowed.
9. **Measure, do not recall.** A number in a doc or the UI comes from a run in that session.
10. **Touch only the files the task names.** Note anything else; do not fix it in passing.
11. **Run `npm test` before saying a task is done.**

---

## 2026-10-02 — P4.5: colour, what to capture and how to grade

- **D-LL-055 — Every common photo format imports: what Chrome cannot decode (HEIC, TIFF, camera RAW) is converted on this Mac by macOS's own `sips`; videos stay Chrome's.**
  **Chose (founder, 2026-10-03: "make it heic and all kind of common format acceptable"):** a photo whose type or
  extension Chrome cannot decode (HEIC/HEIF, TIFF, DNG and the common camera RAW extensions, PSD, JPEG 2000), or any
  photo Chrome fails to open, is sent from the browser to the engine on this machine (`breakdown.convert_image`, a
  helper, T0, bodies up to 48 MB; the engine's body cap now follows an action's own limit). The engine writes it to a
  private temporary folder, runs `/usr/bin/sips` (no dependency; `execFile`, no shell; the file name only picks the
  extension) for the original's size, a PNG frame of at most 1,024 px (never enlarged) and a 64 px JPEG that carries
  the EXIF lens tags (read with the same reader as any still, D-LL-034), then deletes the folder. The browser opens the
  frame like any still; the reference keeps the original's name, size, type and SHA-256. Measured on the M1: a 9 MB
  HEIC converts in 0.7 s; a HEIC's focal length (50 mm, 75 mm equivalent) survives. **Videos:** this Mac's Chrome
  decodes H.264 and HEVC (an iPhone-style HEVC MOV made with `avconvert` imports and measures, tested); ProRes is
  refused with the reason and nothing is imported (tested). The error says "Nothing was imported" when nothing was
  (it used to say frames had been sent). **Rejected:** a HEIC decoder in the browser (libheif in WebAssembly: a few MB
  and an LGPL licence to check, for one format); telling people to convert first (iPhone photos are the team's everyday
  references); converting in the cloud (standing rule 7). **Limits:** macOS only (elsewhere the same message asks for
  JPG, PNG or WebP); camera video originals Chrome cannot decode (ProRes, 10-bit 4:2:2 XAVC S-I) are refused, not yet
  converted: converting them with macOS `avconvert` needs the video's bytes on the engine in pieces, its own change.
  A defensive check for a video that opens but draws nothing was written and then removed: no real clip triggers it
  (HEVC decodes, ProRes errors), so it could not be tested (rule 1).

- **D-LL-054 — The gel search follows P-LL-001 §4.1 as written: smallest residual first, then fewest layers; fixture settings snap to their step.**
  **Chose:** `src/core/mired.ts`. A source inside its fixture's range takes the setting nearest the target on the
  fixture's step grid, no gel. Outside it, every stack of up to three gels (a gel used no more times than the kit
  has sheets) is tried, the fixture set to the nearer of the two step settings either side of target − stack; ranked
  by |residual|, then layers, then the product of the gels' transmissions (unknown counts as none, so a gel with a
  published transmission wins a tie), then gel ids. `chooseBalance` solves the key first and gives the fill only the
  sheets the key left (one physical sheet cannot sit on two lights). **Observed in the tests:** on a 100 K fixture grid
  the residual of different stacks differs by a few mired, so "smallest residual first" can pick three layers over one
  to save about 2 mired (with round test gels, a 2000 K key: one full-CTO-like gel leaves −4.8 mired, three leave −2.2).
  **Kept as the spec says** until the kit's real gel values are in; then a D record decides whether residuals within
  a tolerance (about 3 mired, under a crew's perception) should count as equal so that fewer layers win.
  **Rejected:** rounding the kelvin to the step without comparing both neighbours (it is not always the nearer in mired).

- **D-LL-053 — The grade check's rows: what counts as missing, and how a swatch and a tint zone are judged.**
  **Chose:** `src/core/grade-check.ts`, following P-LL-001 §4.6. Palettes are paired by the Hungarian method on ΔE00
  (least total), so only a difference in swatch counts leaves a reference swatch unpaired ("missing in still": far at
  3% share or more, listed below) or a still swatch over ("extra in still"); a pair that is far apart is a far pair,
  not a missing one. A swatch's verdict is the worse of its ΔE00 verdict and its share verdict. The palette row is the
  share-weighted mean ΔE00 of the paired swatches, and names the share with no partner. A tint zone present in one
  frame only reads far ("in one frame only"); absent in both, it passes ("none in frame"). Differences are still minus
  reference. Thresholds carry a version (1), the proposals of `validation.md` §5.4. **Rejected:** a ΔE00 cut-off beyond
  which a pair counts as missing (a second threshold with no measured basis; the far verdict already says it);
  judging a missing tint zone as a pass (a shadow the reference has and the still lacks is a real difference).

- **D-LL-052 — P4.5 builds the engine side first, starting with the grade check; the screens wait for the colour design export.**
  **Chose:** the founder's order (2026-10-02): records, cited documents and contracts; then the colour maths in
  `src/core/`, the grade check's maths first (matching a shot to its reference is what the founder asked about); the
  Blender colour set; the actions; the screens last, when `prompts/08-claude-design-colour.md` has been run in Claude
  Design and its export is in `design/`. **Rejected:** hand-built colour screens meanwhile (views are generated from
  the design, D-LL-014; a hand-built screen would be thrown away). **Why:** the design-catalogue parity test needs the
  export before any new command exists; the maths and records do not.

- **D-LL-051 — P-LL-001's open questions take its defaults until the founder says otherwise.**
  **Chose (founder, 2026-10-02: "Accept the defaults"):** 24 fps with a 172.8° shutter under 50 Hz mains; gel values
  typed from the founder's swatch book (`manual`, cited "swatch book, typed") wherever a maker's gel book cannot clearly
  be reused; each light's colour range entered by hand until the makes and models are named; the colourist applies the
  `.cdl` in S-Log3 codes in a non-managed (YRGB) node before `_base.cube`; charts recommended, not assumed (no chart
  rows until they are owned); Look Lab's own base transform B (P-LL-001 §4.5), not Sony's LUT; the web file keeps the
  master's code values; a number typed from a maker's document is `manual` with its citation; S-Log3 exposure at
  Sony's nominal grey. **Rejected:** stopping for each answer (every default can be changed later without rework; the
  maths takes them as inputs). **Why:** the founder's build style: decide sensible defaults and record them.

## 2026-10-01 — P4: AI in the app

- **D-LL-050 — P4 closes without an API key: the founder's AI is Claude Code over MCP; the in-app key path stays built and dormant.**
  **Chose:** no Anthropic API key is added (founder, 2026-10-02: "start the next part of the build then", after the
  in-app path was explained as optional). The in-app path (D-LL-039…D-LL-048) is built, tested on the stub client and
  off: with no key every AI control says "No API key in the Keychain" and everything works by hand. The two live calls
  P4 asked for (one mood, one Ask, measured on the M1) are **not done**; `scripts/measure-ai.ts` runs them when a key
  is added (worst case ₹3.73 + ₹6.34, priced 2026-10-02). **Rejected:** removing the in-app path (it costs nothing
  idle, and a key can be added later); adding a key to finish the measurement (the founder's money and choice).
  **Why:** a Claude subscription can drive every action through Claude Code; an API key bills separately.
  **Known gap, not fixed here:** a value Claude Code writes over MCP through `breakdown.edit_value` is recorded as
  `manual`, as if a person typed it; it should read as a model's. Its own decision, next.

- **D-LL-049 — Mood can be set by hand; a person's review is a verdict on the decision that wrote the value, and a new AI value clears it.**
  **Chose:** `breakdown.edit_value` accepts `mood` as words separated by commas (source manual), so mood works with No
  AI; the Breakdown's "+ Add" now saves through it (before P4 it changed only the screen and was lost on reload).
  `breakdown.review` refuses anything but an AI value, appends `agreed` to `verdicts.jsonl` for the value's
  `decision_id` (AD-LL-013) and adds the field to the breakdown's `reviewed`; a new AI value for the field removes it
  from `reviewed`, so the new value is queued afresh if it is under 60. `breakdown.review_queue` (a helper, `command:
  false`) lists what waits. **Rejected:** reviewing any value (a person's own value has nothing to confirm); keeping a
  review across a new answer (the person agreed to other words). **Why:** R5 and D-LL-023: the click is the approval,
  and the router's future training data needs the verdict on the exact call.

- **D-LL-048 — The API key is added only in the Look Lab window; it goes to the Keychain on stdin and is read back for each call.**
  **Chose:** `settings.add_provider` (T3) carries a new `windowOnly` flag: the registry refuses it over MCP and over the
  CLI with the reason, before the handler runs (an agent must not handle the key; a key typed in a terminal stays in
  its history). The key is checked against `sk-ant-[A-Za-z0-9_-]{16,256}` before anything runs (so it can carry no
  quote, space or newline), then written with `security -i`, the command and key on stdin, never in argv (which `ps`
  shows to every process), as the generic password "look-lab" / "anthropic-api-key" in the login keychain
  (`src/engine/keychain.ts`, probed on the M1 with a dummy value: write, read and delete work; a missing item exits 44).
  The provider reads it with `security find-generic-password -w` for each call and keeps no copy. The decision row's
  input summary already redacts a field named like a key (P1); the errors never repeat it; `tests/engine/secret-scan.test.ts`
  searches every file the engine wrote, every event, every answer and every console line for it. Image and 3D
  providers are refused until P10. `settings.remove_provider` (a helper) deletes it. **Rejected:** `security
  add-generic-password -w <key>` (the key in argv); a key file with mode 0600 (standing rule 6); keeping the key in
  the engine's memory (one read per call costs about 20 ms and nothing else). **Limit:** any program running as the
  person can call `security` too; the Keychain protects the key at rest, not from the person's own processes (D-LL-023).

- **D-LL-047 — Ask may quote only numbers that are in the record; any other number refuses the answer.**
  **Chose:** after a valid answer, every number and `#RRGGBB` code in it must appear in the breakdown that was sent or in
  the question (a number written with fewer decimals passes if it is a rounding of one in the record: "38%" for a
  38.2% share); standard names that carry digits (Rec.709, BT.1886, S-Log3, sRGB …) and Look Lab's ids (P4.5, R5,
  D-LL-…) are words. An answer with any other number is refused with the numbers named, and its cost is still logged.
  The prompt says capture numbers (white balance, gel, ISO, exposure, CDL, LUT) come from P4.5's maths.
  **Rejected:** letting the model compute ("about 3200 K") and labelling it AI (D-LL-003: models choose words, not
  numbers); asking for counts in digits (a count is not in the record; the prompt asks for words). **Why:** the first
  bad answer would put a confident wrong number in front of a gaffer. **Limit:** a number written out in words
  ("thirty-two hundred") passes the check; the prompt forbids it, the check does not.

- **D-LL-046 — Shot size comes from the face box by R2 (T0): the face's height over the active picture's height.**
  **Chose:** `breakdown.fit_framing` becomes T0 and real: share = face box height × frame height ÷ the active picture's
  height (letterbox bars excluded, D-LL-029); ECU ≥ 0.70, CU ≥ 0.38, MCU ≥ 0.23, MS ≥ 0.16, MWS ≥ 0.115, WS ≥ 0.07,
  else EWS (`src/core/shot-size.ts`). The boundaries are the geometric means between the share each name's typical
  framing gives a face about a fifth of a metre hairline to chin (ECU the face or less, CU 0.35 m of frame, MCU 0.7 m,
  MS 1 m, MWS 1.35 m, WS 2 m, EWS 4 m). Written as `estimate` with its decision id; a size set by hand is kept; lead
  room and subject stay by hand. The Breakdown calls it after a face is marked. **Rejected:** a model labelling the
  size (D-LL-039 sends no frame, and the face box already answers it); no label until a detector exists. **Why:** the
  P4 card: "where a T0 rule already gives a label (R2: shot size from the face box), propose T0 instead". **Limit:** a
  definition, not a measurement: it assumes an adult face seen from the front; a child, a profile or a face partly out
  of frame reads one size off. On the Blender set (faces 32–58% of the frame) it reads MCU or CU by construction.

- **D-LL-045 — The test suite has no network: a guard refuses every connection off the machine, and Chrome runs offline.**
  **Chose:** `tests/setup/no-network.ts`, loaded before every test file, wraps `net.Socket.prototype.connect` (every
  TCP and TLS client in Node goes through it: `net`, `tls`, `http`, `https`, `fetch`) and destroys any socket bound
  for a host that is not loopback, with "no-network guard" in the error. The browser tests start Chrome through
  `tests/ui/chrome.ts`: every host name resolves to nothing except 127.0.0.1, and each page aborts any request not for
  127.0.0.1, `data:` or `blob:`. `tests/engine/no-network.test.ts` and a Chrome test prove both. Before the guard, the
  same test reached api.anthropic.com (an unauthenticated request, answered 401; no key was sent, nothing billed).
  **Rejected:** trusting each test to use the stub (one mistake costs money); an environment variable that turns the
  client off (production code would then carry a test switch). **Why:** "zero live calls in the suite" has to be
  enforced, not promised. **Found while doing it:** the UI loads Google Fonts from the internet on every page load
  (`src/ui/index.html`); offline, the request fails quietly and the page falls back to system fonts. Noted, not
  changed (the page is the design's).

- **D-LL-044 — B-LL-004's fix: the engine runs with a 1 MB young generation, from one list of Node flags.**
  **Chose:** `--max-semi-space-size=1`, in `src/engine/node-flags.json`, which `bin/looklab.mjs` (start, dev and a new
  `engine` command that `npm run engine` now calls), both measure scripts and the boot test read. Five runs after a
  60 s import: 119–130 MB RSS idle (it was 147–185); a light fit about 4% slower. **Rejected:** a full GC after each
  import (a second mechanism, not needed once the young generation is small); decoding in a worker thread that exits
  (more code for the same result); `--max-old-space-size` (it caps the heap and can crash a large import instead of
  slowing it). **Why:** the cause was measured: not a leak, but the import's garbage held by a heap V8 does not shrink
  while idle (B-LL-004).

- **D-LL-043 — Colour grading is its own phase, P4.5, between P4 and P5; no phase is renumbered.**
  **Chose:** "P4.5 · Colour: what to capture and how to grade" (founder's request of 2026-10-01; V-LL-002). P5–P12
  keep their numbers. **Rejected:** folding colour into P5 (Location & Kit is already a full phase, and colour needs
  its own ground truth); renumbering P5 onwards (phase numbers are cited in code, tests and records). **Why:**
  records convention §1: an id cited elsewhere never moves. Accepted by the founder, 2026-10-01.

- **D-LL-042 — A model's own confidence reads "AI · n", with "the model's own rating, not checked"; under 60 still goes to review.**
  **Chose:** an AI value's badge reads `AI · 72`, never `AI 72%`; the Breakdown's marker says the number is the model's
  own rating and has not been checked against anything. R5 still queues a value under 60 for a person. **Rejected:**
  a percentage (it promises a calibrated probability, D-LL-036); hiding the number (R5 needs it, and a person should
  see why a value was queued); checking it now (nothing in the record is a right answer for mood words or a
  free-text answer). **Why:** D-LL-036: a confidence is shown as what it is. Accepted by the founder, 2026-10-01.

- **D-LL-041 — The client is plain `node:https`; no SDK.**
  **Chose:** `src/engine/anthropic.ts` sends the Messages API request itself (the request shape from the claude-api
  skill's documented raw-HTTP examples: `POST /v1/messages`, `x-api-key`, `anthropic-version: 2023-06-01`,
  `output_config.format` for structured output). **Rejected:** `@anthropic-ai/sdk` 0.131.0 (MIT; its dependencies MIT
  and Unlicense, so licence was not the obstacle): measured last session in a scratch process, +20.2 MB after one call
  and +37.2 MB after 21, against +3.2 / +4.2 MB for `node:https`; with idle at 119–140 MB the SDK alone could push the
  engine over its 150 MB budget. `fetch` measured +5.0 / +24.9 MB. **Why:** memory first (standing rule 5), and no
  dependency to track. **Trade-off:** no SDK retries, types or streaming helpers; one request type is used, and a
  failed request is reported, never retried (a retry can cost money). Accepted by the founder, 2026-10-01.

- **D-LL-040 — In-app AI uses `claude-opus-5`; its price and the rupee rate are dated data; a call is priced at its worst case before it is sent.**
  **Chose:** `claude-opus-5` at $5 / $25 per million tokens in / out (the pricing page, read 2026-10-01), ₹96.33 per
  US dollar (ECB reference rate of 2026-10-01; it was 95.83 the day before), both in `src/engine/pricing.ts` with their
  dates and sources. Before a call: input bounded at one token per UTF-8 byte of what is sent (no token is shorter
  than a byte) plus a 500-token allowance for the request's framing and the schema's instructions, and output at
  `max_tokens` (thinking included). The call is refused if that worst case would take the month past the cap; after
  it, the real cost from `usage` is logged. Adaptive thinking at effort `low` (mood and Ask are short); no server-side
  `fallbacks` (the claude-api skill recommends `fallbacks: "default"` for Opus 5: left off because a fallback bills a
  second model inside one call, which the cap arithmetic would have to price too, and Opus 5's classifiers decline
  cyber requests, far from mood words; a refusal is reported with its category). **Rejected:** a cheaper model chosen
  for cost (the founder's choice, not this code's); `claude-opus-5-5` ($4 / $20; still launching, named only by the
  founder); counting tokens with the API's count endpoint before each call (a second request); a live price lookup
  (the network at every call, and a price that moves under the cap). **Why:** the cap must hold before money is spent.
  **Limit:** the byte bound is about four times the real input, so the cap refuses a call a little early near the
  limit. Accepted by the founder, 2026-10-01.

- **D-LL-039 — What leaves the machine: measured numbers and words from the breakdown only, never a frame (option A).**
  **Chose:** a model call sends the breakdown's values that are not sample (palette hex and share, tints, saturation,
  contrast, aspect, and estimates, metadata and hand-set values, each with its source), never pixels, file names or
  paths. Shot size comes from the face box by R2 (T0, an estimate); depth of field, camera angle, movement and lead
  room stay by hand, and `breakdown.fit_lens` stays a stand-in that says why. **Rejected:** option B, the frame too (an
  upload under standing rule 7: cloud-allowed projects only, an upload record per frame, and a confidence that would
  first have to rank with error on the Blender set before it is shown). **Why:** client footage stays local, the
  sample project is not cloud-allowed, and what a model could add from the frame is a few words a person sets in one
  click. **Revisit:** when a project allows cloud and the founder wants frame labels; that is its own decision.
  Accepted by the founder, 2026-10-01.

## 2026-09-30 — P3: light and lens, and their ground truth

- **D-LL-038 — On the Breakdown, a drag marks the face, each light value has its own row, the marker is built from the record, and Fit light is a T0 button.**
  **Chose:** on the frame, a press that moves more than 4 px draws a box and calls `breakdown.set_face`
  (`command: false`); a click still sets the subject (D-LL-028). The stored box is drawn on the picture when it
  belongs to the frame on screen. The light section shows one row per value the fit may write (Key azimuth, Key
  elevation, Key colour), so each carries its own badge (ESTIMATE, with the fit's score as "ESTIMATE · 34", never
  a percentage); key type, fill, key:fill, hardness and practicals keep their rows. The marker is
  `markerText(record)`: it lists, by the names a DP uses, what is SAMPLE, what is ESTIMATE ("fitted to the face
  marked by hand; not verified on real footage"), what is METADATA (EXIF), and that colour, tone and aspect are
  measured; it now also names shot size and lead room, which P2's fixed text left out. The design's "Fit light
  (AI)" button reads "Fit light" and is enabled whenever a frame is measured, with or without AI: two entries
  in `src/ui/bindings.json`, one of them an attribute binding (`"[title=breakdown.fit_light] disabled"`) that the
  converter learned for it, tested. The import no longer calls `fit_light` (there is no face box yet); its step
  says to mark the face. **Rejected:** a separate "mark face" mode button (a drag is enough, and the click keeps
  its meaning); one Key row combining hardness, kelvin and type (one sample leaf made the whole row SAMPLE and hid
  the estimate); editing `design/` to change the button (the export stays as Claude Design wrote it); keeping
  "(AI)" on a T0 button (it said a model is called when none is). **Why:** D-LL-032 at the level of each value;
  with no API key, P3's normal state, the design's binding left the fit unusable.

- **D-LL-037 — The Breakdown writes a fitted light value only if it met its tolerance on the held-out Blender set; direction always, as an estimate.**
  **Chose:** `breakdown.fit_light` writes key azimuth and elevation (always, as `estimate`) and kelvin (its
  held-out median error was 445 K, inside v0.2's 500 K). It does **not** write fill ratio (1.10 stops against
  0.6) or hardness (softness 0.31 against 0.25): those keep whatever they held, sample or a person's entry, and
  the Breakdown's marker says they were not fitted. The rules live in `src/core/light-validation.ts` and
  `tests/core/light-accuracy.test.ts` re-measures the set on every run and fails if they disagree with it.
  Chosen by the founder 2026-10-01. **Rejected:** writing every fitted value as an estimate whatever its error
  (a 1-stop fill error presented beside a correct direction reads as equally trustworthy); writing nothing unless
  the whole set passes. **Why:** an estimate still has to be worth reading; the tolerance is the line.
  **Limit:** the set is synthetic and small (24 scenes); a pass here says nothing about real footage.

- **D-LL-036 — The fit's confidence is the gap to the next-best direction, shown because it ranked with the error on the held-out set (Spearman 0.57).**
  **Chose:** a score 0–100 from how much worse the best direction 45° or more away explains the skin than the
  chosen one: `100 · g / (g + 1)`, where `g` is (that error − the fit's error) / the fit's error. It is a rank,
  not a probability: higher means the fit found one clear answer, not "72% likely right". Picked on the dev set
  from three candidates declared beforehand (Spearman with −direction error: gap 0.50, residual 0.35, sharpness
  of the azimuth profile 0.01); on the held-out set it scored 0.57, over the 0.5 bar, so the Breakdown shows it
  beside the estimate. **Rejected:** the residual (ranks worse), a calibrated percentage (24 scenes cannot
  calibrate one). **Why:** the P3 rule: a confidence appears only if it tracks error. **Limit:** 0.50 and 0.57 on
  16 and 24 scenes is a weak signal, just over the bar; it is re-checked on every test run.

- **D-LL-035 — The light fit is scored on the face's skin, as a brightness pattern, not on the whole crop; v0.2's renderer and search stay.**
  **Chose:** a candidate light is scored only on the renderer's own bare-skin mask, each pixel's brightness
  (display value to the 2.2) divided by the mask's mean, so the wall, hair, neck and clothes do not count and
  neither skin tone nor exposure moves the direction. A sweep over direction and fill, then v0.2's descent on
  direction, fill and softness; intensity is then matched to the skin's mean brightness and kelvin to the lit
  skin's colour. The drawn box is placed on the renderer by the eye line: its eyes at 0.36 of the box from the
  top (the anthropometric average), its chin at the bottom (`src/core/light-skin.ts`). The ported v0.2 fit is
  kept unchanged beside it (`light-fit.ts`, parity-tested). **Measured:** the ported fit on the dev set had a
  median az error of 57° and el 27° (docs/validation.md §3.1); four variants declared before any was run,
  {pattern in linear light, log pattern} × {box on hairline and chin, box on the eye line}, were compared on the
  dev set only by median direction error: 19.4°, **16.2°**, 17.8°, 19.8°; the chosen one ran once on the
  held-out set: median az 13.9°, el 8.7° (light skin 7.4° / 10.9°, dark skin 21.9° / 6.9°). A test fails without
  the change (`tests/core/light-accuracy.test.ts`: the whole-crop objective's median direction error on the dev
  set is over 30°). Chosen by the founder 2026-10-01. **Rejected:** keeping v0.2's objective (its median az error is 42° over the line);
  undoing the renderer's tone curve to compare true linear light (worse on the dev set, 13° az and 17° el in a
  first trial); a new renderer or a face model (a redesign, not this phase). **Why:** v0.2 scored every pixel of
  its own renders, where the wall and the head come from the same model; on a real head the wall and clothes
  outweigh the face, and one fixed skin colour turns a darker face into dimmer or warmer light. **Limits:** dark
  skin is worse (median az 21.9°, over 15° on its own): near-frontal keys on dark skin were read as side light;
  a box drawn less carefully (each edge off by up to 8%) raises the median az to 26°; the renderer still draws no
  cast shadows.

- **D-LL-034 — The focal length comes from the original still's EXIF, as metadata; otherwise a person enters it.**
  **Chose:** at import the browser reads the start of an image file (up to 16 MB) and passes only two tags of
  its Exif IFD, FocalLength (0x920A) and FocalLengthIn35mmFilm (0xA405), found in a JPEG's APP1, a PNG's
  eXIf or a WebP's EXIF chunk, with `breakdown.import_reference`. The engine keeps them on the reference
  (`exif`) and `breakdown.analyse` writes `lens.focal_mm` with source `metadata` (AD-LL-010): the 35 mm
  equivalent when the file has it ("75 mm (EXIF, 35 mm equiv.)"), else the actual focal length, marked
  "actual; sensor size unknown". A value set by hand is kept; a new file without EXIF goes back to the
  sample value. Videos are not read. The reader is `src/core/exif.ts`, written here, no dependency, never
  throws. **Rejected:** an EXIF library (a dependency and a licence for two tags); working out a 35 mm
  equivalent from the focal-plane resolution tags (it needs a sensor size few files record, so the number
  would be invented); lens tags in video containers (vendor-specific); sending the whole EXIF block (it can
  hold a camera serial number and GPS; nothing but the two lens numbers leaves the browser). **Why:** EXIF
  is the camera's own record of the capture, so it is neither measured from the pixels nor typed by a
  person. The lens does not feed the light fit (D-LL-033). **Limit:** a crop or a re-save after capture
  changes the framing but not the tag; a still grabbed from a film carries no EXIF.

- **D-LL-033 — The light fit takes the face from a box a person draws; the rest of the camera and set are stated assumptions (revises D-LL-008).**
  **Chose:** the fit works on a crop defined by a face box drawn by hand (hairline to chin, cheek to
  cheek). The box maps onto the fit's own face region, so it sets the head's size and position, and the
  lens is **not** an input to the light fit (its renderer has no perspective). Assumed unless set by
  hand: the face points at the camera and the camera is at eye level (yaw 0, tilt 0); the wall behind is
  of middling brightness (the fit's `wall` 0.7); no practical lamp is in frame. Light direction is
  reported relative to the camera: az 0 is from the camera, positive az is from the right of the frame,
  el is above the eye line. Accepted by the founder 2026-09-30. **Rejected:** keeping D-LL-008 as it
  stood (the camera and set must be given, which no imported reference provides); lens from face size
  (the fit's head size is the box's, so it would be circular); estimating head yaw and tilt now (a pose
  model, T1 work with its own licence). **Why:** the fit needs the face's place and size and nothing
  else about the camera; a box is one drag, as the subject is one click (D-LL-028). **Limit:** a face
  turned away from the camera, or lit by a practical in frame, breaks the assumptions; the error that
  causes is not measured on the Blender set, whose faces all point at the camera.

---

## 2026-09-30 — P2 built: the deterministic breakdown (no AI)

- **D-LL-032 — A partly real screen names exactly what is still sample, and every value shows its own source.**
  **Chose:** once a shot's palette is measured, the Breakdown's marker reads "SAMPLE: light, lens and mood
  (until P3/P4) · colour, tone and aspect measured", and each value's badge comes from its own record
  (MEASURED, MANUAL, SAMPLE). The design's typed "MEASURED" on palette rows follows the palette's real
  source; its typed "AI n%" badges stay SAMPLE. Before any import the whole screen keeps the plain
  "SAMPLE DATA" marker. **Rejected:** adding Breakdown to `REAL_SCREENS` (it would drop the marker while
  light, lens and mood are placeholders), and keeping every badge SAMPLE (it would hide real measurements).
  **Why:** D-LL-015 and standing rule 2 at the level of each value, not each screen. The Shell's ⌘K entry for
  `breakdown.import_reference` opens the drop zone, because the action needs a file.

- **D-LL-031 — The engine reads PNG with its own decoder on `node:zlib`; no image library.**
  **Chose:** `src/engine/png.ts` (139 lines): 8-bit greyscale, RGB and RGBA, non-interlaced, every row
  filter, checksums verified; anything else is refused with the reason. **Rejected:** `pngjs` (MIT) and
  `jpeg-js` (BSD-3-Clause), both checked on npm 2026-09-30, so licence was not the obstacle; and sending raw
  RGBA (a 512 × 512 frame is 1 MiB before base64). **Why:** frames come from Chrome's canvas, which wrote
  8-bit RGBA, non-interlaced PNG in every frame inspected, so a general decoder buys nothing; no dependency
  means no licence to track (standing rule 8) and nothing to update. PNG is lossless, so what the engine
  measures is exactly what the browser drew. JPEG frames are not accepted.

- **D-LL-030 — A saved look's `source` is its palette's; light and mood carry their own.**
  **Chose:** `Look.source` is the weakest source among the palette's shares, plus `light_source` (key
  direction, kelvin, hardness, ratio) and `mood_source`. A look saved from a measured palette is "measured"
  with `light_source: "sample"` until P3. **Rejected:** one source for the whole look (in P2 it would stay
  "sample" for ever, or call sample light measured). **Why:** `library.list` must say what is real without
  overstating anything. Existing looks read `light_source` and `mood_source` as "sample" by default.

- **D-LL-029 — Letterbox and pillarbox bars are not picture: the instruments measure the active area, and aspect is taken from it.**
  **Chose:** rows (then columns) where no channel is brighter than code 28 count as bars only when they come
  in a matching pair (each at least 2% of the frame, within 2% of each other, together under 60%). Palette,
  contrast, saturation and tints use the picture inside them; aspect is its width over height, snapped to a
  standard ratio (1.33 … 2.39, 2.76) when within 1%, otherwise given to two decimals. **Rejected:** measuring
  the whole frame (a 2.39 picture in a 16:9 file would get a large black swatch, contrast pinned at the noise
  floor and an aspect of 1.78), and any one-sided dark area as a bar (a night sky is picture). **Why:** the
  aspect a DP means is the picture's. **Limit:** a frame whose picture really is black at top and bottom in
  equal measure would be cropped; stated, not solved.

- **D-LL-028 — Subject position is set by hand in P2; a detector is later T1 work.**
  **Chose:** `breakdown.set_subject` records a click on the frame as x, y (fractions of the frame) and a text
  such as "left third (x 0.31, y 0.40)", source "manual". `breakdown.fit_framing` stays a stand-in and now
  returns only what it would estimate (shot size and lead room); aspect is measured by `breakdown.analyse`.
  **Rejected:** a face or saliency detector now (a model, with its licence and memory, for one number a
  person gives in one click), and deriving lead room from the position (lead room depends on where the
  subject looks). **Why:** P2 is deterministic. **Revisit:** when a T1 model is chosen (licence first).

- **D-LL-027 — The browser reads the file; the engine keeps its facts and the sampled frames, never the file or its path.**
  **Chose:** Chrome decodes the image or video (AD-LL-007), samples 2 frames per second (fewer past 5
  minutes: at most 600 frames), scales each to at most 512 px on the long side, and sends it as PNG through
  `breakdown.add_frame`, one call per frame, bodies up to 2 MB (every other action keeps 1 MB). The engine
  stores the frames as `references/<ref_id>/frames/NNNNN.png` beside the reference record, and records name,
  type, size, date and a SHA-256 of the whole file, computed in the browser in 8 MB pieces. The reference id
  is `ref-` plus the first 12 hex of that hash, so the same file imported twice is one reference; importing
  it again replaces its frames. Frame i is at i / sample_fps seconds. **Rejected:** copying the original into
  `~/LookLab` (a 60 s 1080p clip is hundreds of MB on an 8 GB laptop's disk, and the frames are what is
  measured), storing the path (a web page is never told a file's path; only a future CLI or FFmpeg import
  could know it), hashing with Web Crypto (it has no streaming digest, so a long video would sit in the tab's
  memory whole), and one request with every frame (tens of MB in one body). **Why:** light and local. **Limit:**
  if the original is moved or edited, Look Lab cannot find it again; the hash says whether a file is the same.
  `add_frame` writes no decision row per frame (a 60 s clip would add 120 rows); its failures still do.

- **D-LL-026 — Shot cuts: colour-histogram distance with an adaptive threshold; the default frame is the longest shot's.**
  **Chose:** each sampled frame becomes an 8 × 8 × 8 RGB histogram filled with trilinear weights (so noise does
  not flip pixels between bins); the distance between neighbours is half the L1 difference (0 to 1). A cut
  between frames i − 1 and i needs a distance of at least 0.12 and at least 3 × the mean of the two distances
  on each side of it. A shot's key frame is its middle sampled frame; a breakdown measures the key frame of the
  longest shot unless told otherwise (B-LL-002). **Rejected:** a fixed threshold (a slow fade crosses any
  fixed line one step at a time, and similar-palette cuts fall under it), and edge or motion features
  (more cost for P2's need). **Why:** during a fade or dissolve every step looks alike, so none stands out
  from its neighbours; a cut is a lone spike. **Limits:** a dissolve shorter than about 1.5 s (3 sampled frames
  at 2 fps) can read as a cut; a fade from one shot to the next reports no boundary at all; two shots with the
  same colours and a cut between them are one shot to this detector.

- **D-LL-025 — Contrast in stops, saturation and tints: definitions.**
  **Chose:** contrast is log2 of the 98th over the 2nd percentile of linear luminance (sRGB decoded, Rec. 709
  weights), each clamped to a noise floor of 2^-10 (about sRGB code 3), so it tops out at 10 stops.
  Saturation is the mean of C*/√(C*² + L*²) in CIELAB, in percent, over pixels at or above L* 5 (darker
  pixels carry no reliable colour); the screen adds low (< 25), medium (≤ 50) or high. Tints are the mean a*,
  b* of pixels with L* < 30 (shadow), 30–70 (mid) and > 70 (highlight), named on the stronger axis ("cool −6",
  "warm +9", "green −4", "magenta +5"), with the other axis added when it is at least 3, "neutral" under a
  mean chroma of 2, and "none in frame" when a zone holds under 0.5% of the picture. **Rejected:** min/max
  luminance (one specular highlight or dead pixel sets it), HSV saturation (not perceptual), zones by
  percentile (a dark frame's "highlights" would be mid-greys). **Why:** each is a plain measurement of the
  frame. **Limit, stated on purpose:** these describe the frame as encoded (display-referred), not the light on
  set; they say nothing about light direction or the scene's real dynamic range (P3).

- **D-LL-024 — Palette: k-means in CIELAB, seeded, with 3 × 3 median sampling, merging and folding.**
  **Chose:** sample the active picture on a grid (at most 65,536 points), each sample the per-channel median
  of its 3 × 3 neighbourhood; k-means++ seeding from a fixed PRNG seed, k = 8, Euclidean distance in CIELAB
  (D65), up to 40 iterations; then merge the closest pair of clusters while their CIEDE2000 difference is under
  5 (pixel-weighted mean); then fold any cluster under 1% of the picture into its nearest swatch's share (its
  colour is not reported). Hex is the cluster mean in sRGB; share has one decimal. **Rejected:** RGB k-means
  (distances are not perceptual), median-cut (not a mean, so its hex is not the region's colour), no
  denoising (with ±6 code values of noise, 9 of 60 random test palettes split one flat colour into two
  swatches about 5.5 ΔE apart), a 3 × 3 mean (it invents blended colours along edges: 3 of 60 palettes got
  a sliver swatch). **Why:** the same frame always gives the same palette (tested), and on synthetic patches
  every colour comes back within ΔE00 2 and 2 points of share. **Limit:** measured on synthetic frames only;
  noise of ±10 or more per channel still splits some colours (3 of 60 at ±10, 15 of 60 at ±14).

## 2026-09-30 — P1 built: how the engine runs, how the UI gets its token, and where approval sits

- **D-LL-023 — The UI's click is the approval; any local program with the token has the person's access.**
  **Chose:** an action marked `confirm` runs when a person clicks its button in the
  Look Lab window, with no second dialog. The CLI asks for a typed "yes" at a real
  terminal and refuses without one. MCP refuses outright (D-LL-017). **Rejected:** a
  confirm dialog on every such button (the click already is the person's decision,
  and the design has none). **Why, and the limit stated plainly:** these guards stop
  an *agent* from approving through its own channels (MCP, or the CLI run from a
  non-interactive shell). They do not stop a local program that reads `~/LookLab/token`
  and calls the API directly: that program has the same access as the person. Real
  per-person approval needs accounts, which arrive with team hosting (P11).

- **D-LL-022 — The UI gets its session token from `/api/session`, allowed only for same-origin fetches.**
  **Chose:** the page asks `GET /api/session`; the engine answers only when the
  browser's `Sec-Fetch-Site` header says `same-origin` (browsers set it and pages
  cannot forge it). **Rejected:** writing the token into `index.html` when serving it
  (breaks the Vite dev server, which serves its own `index.html`). **Why:** one path for
  `npm start` and `npm run dev`; a cross-site page gets 403 (tested).

- **D-LL-021 — Design text that becomes data is listed in `src/ui/bindings.json`.**
  **Chose:** a literal in a design template (e.g. Settings' "42 Look Lab tools
  available") listed in `bindings.json` is generated as `{v.<slot> ?? "<design text>"}`,
  and the screen's logic fills the slot. **Rejected:** hand-editing generated views
  (lost on the next port), or asking for a new design export for every literal.
  **Why:** screens move from sample to real data one literal at a time, and a re-export
  keeps working. Source badges typed into templates ("MEASURED", "AI 78%") go through
  `badgeText()` the same way (D-LL-015).

- **D-LL-020 — Approval sits on the action that commits, not the one that proposes.**
  **Chose:** `adapt.generate_recipe` needs no approval (it proposes a recipe);
  `adapt.open_in_plan` does (it writes a set plan from that recipe). The design's
  catalogue put the flag on `generate_recipe` "before open in plan". **Why:** Claude
  Code should be able to draft recipes over MCP; what must stay human is turning a
  draft into the plan the crew works from.

- **D-LL-019 — The engine runs its TypeScript directly with Node's type stripping; no engine build step.**
  **Chose:** `node --experimental-strip-types src/engine/main.ts` (Node ≥ 22.6).
  `tsconfig.json` sets `erasableSyntaxOnly` so the type check rejects syntax Node cannot
  strip. **Rejected:** `tsx` at runtime (one more dependency, more memory), compiling to
  `dist/engine` (a second build to keep in step). **Why:** a teammate runs `npm start`
  with nothing extra to build for the engine. **Trade-off:** no enums, namespaces or
  parameter properties in engine code; B-LL-001 is what happens when that is forgotten,
  and `tests/engine/boot.test.ts` guards it.

## 2026-09-30 — v1 starts: the records, the port of the design, and the rules the shell obeys

- **D-LL-018 — Look Lab claims the project code `LL`; the v0.2 decisions are rendered, not renumbered.**
  **Chose:** code `LL` (founder's choice, 2026-09-30). The twelve decisions in
  `reference/v0.2/docs/10-DECISIONS-AND-OPEN-QUESTIONS.md` keep their original ids
  `D-001`…`D-012` in that file; this log carries them as `D-LL-001`…`D-LL-012`, a
  second rendering of the same records, and new decisions start at `D-LL-013`, the
  "next id" the v0.2 log itself named. **Rejected:** starting the new log at
  `D-LL-001` (two different records would answer to "decision 1"). **Why:** records
  convention §1 and §3: add renderings, never rewrite identifiers.

- **D-LL-017 — Actions that need a human's approval are refused over MCP until an approval queue exists.**
  **Chose:** an MCP call to an action marked `confirm: true` returns a refusal that
  names the action and says to run it from the Look Lab window. **Rejected:**
  trusting Claude Code's own permission prompt (a person can allow-list a tool once
  and never see it again), and a `confirmed: true` argument (the agent can set it).
  **Why:** approving a recipe, applying a look over a shot's targets or allowing
  cloud upload are T3 decisions. **Revisit when:** the approval queue (a pending item
  the person approves in Activity) is built.

- **D-LL-016 — An MCP tool's name is the action name with the first dot replaced by an underscore.**
  **Chose:** `breakdown.fit_light` → `breakdown_fit_light`; domain names may not
  contain `_`, so the mapping is one-to-one and tested. **Rejected:** dots in tool
  names (model tool names must match `^[a-zA-Z0-9_-]{1,64}$`), and a double
  underscore (reads badly in Claude Code's `mcp__looklab__…` names). **Why:** the
  action name stays the canonical id everywhere else (tooltips, ⌘K, logs).

- **D-LL-015 — Until a screen's data is real, the screen says so.**
  **Chose:** every screen still running on the design's sample data shows a
  "Sample data" marker, and values the design labelled MEASURED or AI render as
  SAMPLE until an instrument or a model actually produced them. **Rejected:**
  shipping the design's badges as drawn. **Why:** standing rule 2. The design's
  numbers were typed by a person, not measured.

- **D-LL-014 — The design export is converted by a script; views regenerate, logic does not.**
  **Chose:** `scripts/port-design.mjs` compiles each `design/*.dc.html` template
  into `src/ui/views/<Screen>.view.tsx`. Each screen's logic class was copied once
  from the same file into `src/ui/logic/<Screen>.logic.ts` and is owned code from then
  on. The contract between the two is the object `renderVals()` returns.
  **Rejected:** hand-porting 11 screens (≈230 KB of markup; slow and it drifts), and
  loading the design's own runtime (`support.js`, a Claude Design scaffold) in
  production. **Why:** a re-exported design can be pulled in with one command
  without losing wired behaviour.

- **D-LL-013 — Leave the single-file Claude artifact.**
  The v0.2 plan left this to its Phase 0 (v0.2 open question 7). Decided for a local
  engine plus a browser tab: see **AD-LL-001**. The v0.2 constraints that existed only
  because of the artifact host (single file, CDN-only scripts, three.js r128 pinned,
  no downloads) are retired; the ones that were about honesty and hardware are kept
  (standing rules 2, 3, 5, 8).

## 2026-09-30 — the twelve v0.2 decisions, carried over

Original text: `reference/v0.2/docs/10-DECISIONS-AND-OPEN-QUESTIONS.md`. Status in v1 noted per entry.

- **D-LL-012 — (v0.2 `D-012`) Do it manually and small first, automate after about 20 repetitions.** Kept.
- **D-LL-011 — (v0.2 `D-011`) The 8 GB M1 limits the local loop to about 6 GB and one model at a time.** Kept and tightened: Look Lab's own processes ≤ 1.5 GB, because the machine also runs a browser, Slack and Claude (standing rule 5).
- **D-LL-010 — (v0.2 `D-010`) Image → 3D runs in the cloud.** Kept.
- **D-LL-009 — (v0.2 `D-009`) The scene-graph JSON is the source of truth.** Kept; it becomes the `SetPlan` contract, edited only through `plan.*` actions.
- **D-LL-008 — (v0.2 `D-008`) The fit assumes the camera and set are known.** Kept for now; revisit in the light-fit phase (lens from face size or EXIF, camera-relative light). **Revised** by D-LL-033 (P3).
- **D-LL-007 — (v0.2 `D-007`) The look-match metric uses cheek windows only.** Kept. Do not revert to whole-face statistics.
- **D-LL-006 — (v0.2 `D-006`) Cards for people, meshes for props; flag a card viewed more than 35° off-axis (R11).** Kept for the Set Plan phase.
- **D-LL-005 — (v0.2 `D-005`) Single-file HTML with three.js r128 from cdnjs.** **Superseded** by D-LL-013 / AD-LL-001.
- **D-LL-004 — (v0.2 `D-004`) Validate on synthetic ground truth first.** Kept; real ground truth (Blender set) is its own phase.
- **D-LL-003 — (v0.2 `D-003`) Decision models choose strategy, not numbers.** Kept.
- **D-LL-002 — (v0.2 `D-002`) Tiered cascade T0–T3, rules first (R1–R14), log everything.** Kept; rule ids unchanged, new rules continue from R15.
- **D-LL-001 — (v0.2 `D-001`) Two loops; image models are not the interactive renderer.** Kept.
