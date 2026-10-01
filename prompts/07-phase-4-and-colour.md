# Prompt 7 · Claude Code: Phase 4 (AI in the app) and the colour-grading spec

Replaces prompt 6 for the next session. Before pasting: P3 committed and pushed to `origin`
(https://github.com/shayandas862-hub/LOOKLAB, private), and `prompts/06-phase-4-CLAUDE.md` installed as
`CLAUDE.md`. Open Claude Code in the project folder and paste the block below.

---

```
Continue Look Lab. Phase 4: AI in the app, and a new goal from me: Look Lab must serve colour grading.
For any reference it should tell the crew what has to be captured on set to get that colour, the camera
specifications that needs, and what is left for the grade. In this session: build P4, and spec colour
grading fully (records, phase card, design prompt) so the next phase can build it. No colour code yet.

READ FIRST
CLAUDE.md (P4), the newest entry in docs/progress-log.md (PR-LL-003), docs/phases.md (P4 card),
docs/VISION.md, docs/architecture.md §5, §6, §7, §12, docs/validation.md, and AD-LL-003, AD-LL-010, D-LL-002,
D-LL-003, D-LL-007, D-LL-015, D-LL-017, D-LL-023, D-LL-034, D-LL-036, D-LL-037, D-LL-038, B-LL-004. Next ids
from docs/id-registry.json. Load the claude-api skill before any request code. Where this prompt adds to
CLAUDE.md, this prompt wins.

HANDOVER FROM THE LAST SESSION (2026-10-01, measured on this M1; re-measure anything you rely on)
- Baseline: npm test 307 passed / 0 failed, 29 files.
- B-LL-004, cause found, no leak: heap snapshots before and after a 60 s import hold 19.4 and 20.3 MB of live
  JS. V8's heap grows from 23 to 52 MB while 121 frames are decoded (17 MB live after) and is not shrunk while
  idle; a forced full GC took RSS 148 -> 115 MB, and 70 s idle alone 163 -> 85 MB. With
  --max-semi-space-size=1 on the engine: idle after import 120 / 134 / 136 MB RSS over 3 runs, footprint
  140-145 MB, heap 30 MB, import 19.3 s unchanged, light fit 195 ms vs 189 ms median. Measured with
  --heapsnapshot-signal and with --inspect + CDP HeapProfiler.collectGarbage (scratch harness, not kept).
- Prices, read 2026-10-01 from platform.claude.com/docs/en/about-claude/pricing (USD per million tokens,
  in / out): claude-opus-5 5 / 25, claude-opus-5-5 4 / 20, claude-sonnet-5 2 / 10, claude-haiku-4-5 1 / 5.
  ECB reference rate 95.83 INR per USD, 2026-09-30 (api.frankfurter.app). An image costs
  ceil(w/28) x ceil(h/28) tokens: a 512 x 288 frame is 209.
- Estimated per call on opus-5 (budgets: mood 1,000 in + up to 1,024 out; Ask 1,100 in + up to 2,048 out):
  mood typical ₹1.20, worst ₹2.93; Ask typical ₹1.72, worst ₹5.43; option B adds ₹0.10 a frame.
- Client memory, scratch process, one call / 21 calls: node:https +3.2 / +4.2 MB; fetch +5.0 / +24.9 MB;
  @anthropic-ai/sdk 0.131.0 (MIT; deps MIT and Unlicense) +20.2 / +37.2 MB.

BEFORE ANY CODE
1. git status and git log: P3 committed and pushed to origin. If not, stop and tell me.
2. npm test: confirm 307 (or say what changed).
3. Write B-LL-004's cause into docs/bug-log.md now (it is open; the cause above is measured).
4. Get my yes on these, each with your recommendation (last session recommended the first option of each):
   a. What leaves the machine: A (only measured numbers and text from the breakdown; depth of field, angle,
      movement and lead room stay by hand) or B (the frame too: an upload, cloud-allowed projects only, an
      upload record per frame, the click is the approval).
   b. The model: claude-opus-5, or one I name. Recheck the price page and the INR rate first.
   c. The client: plain node:https (no dependency) or the SDK, on the numbers above.
   d. AD-LL-011: Settings.api gains the month (UTC, as Anthropic bills) so used_inr rolls over. Any other
      fixed-contract change (architecture §12) gets its own AD and my yes.
   e. A model's confidence on mood and Ask cannot be checked against anything (D-LL-036): show "AI · n"
      with "the model's own rating, not checked" in the marker, never "n%"; still route under 60 to review.
   f. Where colour sits in docs/phases.md: proposed as its own card "P4.5 · Colour: what to capture and how
      to grade", between P4 and P5. No existing phase is renumbered (phase numbers are cited in code).
5. Ask me for the colour specifications, in one message, with the sample kit as the default answer:
   camera bodies and what each records (log profile and gamut, base ISOs, bit depth, chroma, codec, RAW);
   which lights are bi-colour or RGB and their ranges, and which need gels; the gel book we carry; whether
   our monitors or a LUT box load a .cube; grading app and colour management (Resolve? RCM, ACES, none?);
   delivery target (Rec.709 gamma 2.4, sRGB for web, HDR?); which charts we own (ColorChecker, grey card).

TASK 0. B-LL-004 as its own change, suite green before and after: --max-semi-space-size=1 in the engine's
launch flags from one shared list (bin/looklab.mjs, the npm engine script and both measure scripts use it); a
test that the engine runs with it; five measured runs after a 60 s import (RSS and footprint). If RSS is still
over 150 in any run, propose the next step (a full GC after an import's analysis) before doing it.

THE PLAN (P4, after my yes)
1. Provider: AnthropicProvider behind AiProvider (src/engine/ai.ts). The key comes from a new key dialog in
   Settings (password field; the converter learns the binding, views are not hand-edited), goes to the
   Keychain through `security` with the key on stdin, never in argv, and is read only from there.
   settings.add_provider becomes real: UI only (refused over MCP and over the CLI, where a key would land in
   shell history), input redacted. Settings shows "Key in the Keychain", never any characters of the key.
2. Money: prices and the INR rate are dated data in code. Each call is priced at its worst case (input
   estimate + max_tokens) before it is sent and refused with the reason if it would cross the cap; the real
   cost from usage goes to the decision row's cost_inr and to used_inr; the month rolls over.
3. Labels (as decided in 4a): fit_mood and ask become T2, source "ai" with a confidence, and never overwrite a
   measured, estimated, metadata or manual value. Shot size comes from the face box by R2 (T0, source
   estimate, recorded as a decision). Structured output plus a zod check; bad output is refused with a
   reason and its cost is still logged; the prompt and its version are in the decision row. Ask may answer
   colour questions in words and quote only numbers that are in the record: any capture number (white
   balance, gel, ISO, CDL) waits for P4.5's T0 maths, and the answer says so. Stand-in flags go in the
   same change.
4. Review (R5): an AI value under 60 reads low and is queued; breakdown.review (T3, the UI click) appends
   "agreed" to the decision that wrote the value; a new AI value clears its old review.
5. No AI: on all 11 screens, with No AI on, no key, or the cap reached, every AI button is off and says
   which; every screen works by hand; Fit light, Analyse and Sample palette stay on. Check every binding.

COLOUR GRADING: THE SPEC TO WRITE THIS SESSION (no colour code until P4.5)
What Look Lab must hand the crew for a reference, per shot:
- In front of the lens: each light's colour (kelvin and green-magenta), and the gel or fixture setting from
  our kit that gets it (mired arithmetic: 1,000,000 / K; gel values from the makers' published gel books,
  cited); the key:fill ratio; which palette colours must physically exist in set and wardrobe (the grade can
  move a colour, but a saturated colour that is not in front of the lens costs noise and banding to make).
- In the camera: white balance (K and tint), picture profile and gamut (log or Rec.709, chosen from the
  reference's contrast against the camera's published range), base ISO and an exposure target (grey and
  skin), bit depth, chroma and codec (10-bit 4:2:2 or better when the grade moves colour a long way),
  frame rate and shutter, and a chart and grey card at the head of every setup.
- For the grade: a starting grade as an ASC CDL (slope, offset, power per channel, saturation) exported as
  .cdl, and a 33-point .cube LUT from the camera's log to the delivery target for on-set monitoring and as the
  colourist's start; the targets to check against (palette ΔE00, contrast in stops, saturation, tints, the
  cheek-only skin match, D-LL-007).
- A grade check: import a still from our test shoot or the grade; the existing instruments measure it
  against the reference and say, in numbers, how far each swatch, the contrast, the saturation and the skin
  are.
Honesty rules for colour:
- Every number is T0 maths: mireds, the CDL fit, camera curves and gamuts from the manufacturers' published
  documents (cited, with the licence of any table checked). A model may choose the strategy (put the colour in
  the light, capture neutral and grade, or both), never a number (D-LL-003).
- One graded frame cannot say how much of its colour was lit and how much was graded: the spec states its
  assumption and offers the person that split.
- The reference is an 8-bit display-referred frame decoded by the browser: say what that cannot tell.
- Ground truth before any claim: a Blender colour set (the P3 head plus a ColorChecker; known key kelvin,
  known camera white balance; a known CDL applied in src/core). Tolerances are written before it runs. A
  pass is a claim about the Blender set only.
Deliverables this session:
- V-LL-002 in docs/VISION.md: §1 gains colour (capture and grade spec, grade check); Caused by: my request
  of 2026-10-01; Forces: the Kit gains camera recording, light colour, gel and monitoring fields (an AD), a
  colour section on the Breakdown and the Set Sheet, the Blender colour set, the P4.5 card.
- plans/colour-grading.md (P-LL-001): the spec above made exact with my answers from step 5: inputs, the
  maths for each output, the contract changes it will need, the validation plan with its tolerances, and a
  per-shot capture card (camera, lights, set colours, charts, monitoring LUT, grade start) as the crew reads
  it.
- The P4.5 card in docs/phases.md with its acceptance, and P7's set sheet card noting the capture card.
- prompts/08-claude-design-colour.md: a Claude Design prompt for the colour section (Breakdown, Set Sheet,
  the grade check), so its UI comes from design like every other screen.
- prompts/09-phase-4-5.md and its CLAUDE.md draft, for the colour build.

TESTS THAT PROVE IT (write each first; it must fail before the code)
- Zero live calls: every test runs behind a guard that refuses any connection off this machine; Chrome in the
  e2e tests is started with the network blocked; the suite runs on a stub client.
- The key: stored and read only through the Keychain wrapper (stubbed in tests), never in argv; after
  add_provider it is in no file, store record, decision row, event, error or log line (a test scans them
  all); add_provider is refused over MCP and over the CLI.
- The cap: a call that would cross it is refused before it is sent, with the reason; used_inr equals the
  sum of cost_inr; the month rolls over (test with the clock).
- Values: AI values are source "ai" with a confidence, never measured or estimate; measured, estimated,
  metadata and manual values survive an AI call; the stand-in count drops by exactly the actions made real.
- Ask: a stub answer quoting a number that is not in the record is refused.
- R5: confidence 59 goes to review, 60 does not; breakdown.review records the verdict.
- Bad model output (not JSON, missing fields, confidence out of range) is refused with a reason; its cost is
  logged.
- Chrome: with no key, every AI button on every screen is off and says why, every screen works by hand, Fit
  light works; with the stub provider, Ask answers and mood reads "AI · n", never MEASURED or ESTIMATE; a
  value under 60 reads low and can be confirmed.
- Every existing test stays green: parity, wiring, boot, records, security, purity, the Blender accuracy test.

MEASURE AND REPORT (on this M1, real numbers only)
- Engine RSS and footprint: idle, with the AI client loaded, after a 60 s import (Task 0).
- With my key (I add it in Settings; never in a file, the chat or a commit): one live Ask and one live mood
  call on a committed Blender render: time, tokens in and out, cost in INR, and that the cap counted it.
  State the cost before running. Not in the suite.
- If B: Spearman(model confidence, correct) on the Blender set's shot size and focal-length class, one live
  run, its cost stated first; under 0.5, say so and show it as D-LL-036 does.

RULES FOR THIS PHASE
- No pixels leave the machine unless I chose B, and then only for a cloud-allowed project, logged per frame.
- No new heavy dependency; record the client choice with its licence and memory.
- Models choose words and labels, never numbers we measure or compute: no AI light, palette, contrast,
  white balance, gel or CDL.
- No accuracy claim for any AI label or any colour number; Blender numbers are Blender-set claims only.
- Every state change is a registry action (helpers command: false); MCP lists them. Design literals that
  become data go through src/ui/bindings.json and npm run port-design.
- Log each bug in docs/bug-log.md the moment you find it; each real choice in docs/decision-log.md (chose,
  rejected, why); shape changes as AD records; the colour vision change as V-LL-002.

FINISH
- npm test green, npm run typecheck clean.
- P4 marked done in docs/phases.md with the measured numbers (or not done, with what failed); the P4.5 card
  and colour spec written; a progress entry (next PR id) citing every V/D/AD/B/P id touched.
- A short report: what is AI now and what is still sample, what each call costs, the memory numbers,
  anything failed or skipped, the colour spec in five lines, and the five-line plan plus tests for P4.5.
- Do not commit or push without asking me.
```
