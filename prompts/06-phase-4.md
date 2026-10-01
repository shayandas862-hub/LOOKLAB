# Prompt 6 · Claude Code: Phase 4 (AI in the app)

Open Claude Code in the project folder and paste the block below. CLAUDE.md is already set up for P4.

---

```
Continue Look Lab. Phase 4: AI in the app. The first phase that calls a model, so the key, the money and
what leaves this machine matter more than the features.

READ FIRST
CLAUDE.md (set up for P4), then the newest entry in docs/progress-log.md (PR-LL-003), docs/phases.md
(P4 card), docs/architecture.md §5, §6, §7 and §12, docs/validation.md, and these records: AD-LL-003 (AI in
three modes), AD-LL-010 (value sources), D-LL-002 (tiers and rules), D-LL-003 (models choose strategy, not
numbers), D-LL-015, D-LL-017 (approval over MCP), D-LL-023 (the UI click is the approval), D-LL-036 (a
confidence is shown only if it tracks error), D-LL-038, and B-LL-004 (open). Take next record ids from
docs/id-registry.json. Load the claude-api skill before choosing a model or writing a request.

BEFORE ANY CODE
1. Run `git status` and `git log --oneline`. P3 should be committed. If the repo still has no remote, tell me
   before anything else.
2. Run `npm test` and confirm the baseline (307 passing at PR-LL-003). Report the number.
3. Confirm the five-line plan below (or tell me what you would change and why). These need my yes before code:
   - What leaves the machine. A: only measured numbers and text from the breakdown record (palette, tones,
     light, framing values): nothing is uploaded; Ask and mood can work from that, but depth of field, angle
     and movement cannot honestly be labelled without the picture, so they stay sample. B: the analysis frame
     goes to the model too: an upload (standing rule 7), so only for a project with cloud allowed, with an
     upload row per frame and the person's click as approval. Recommend one, with what each costs per call.
   - The model(s) and the price table: model ids, price per million tokens in and out, the INR rate and its
     date, and the cost of one Ask and one mood call worked out from them, before any live call.
   - Anything that changes a fixed contract (architecture §12): write the AD record and ask.
4. B-LL-004 is open: the engine idles at 147–185 MB after a 60 s import (budget 150). Take a heap snapshot
   after a 60 s import, find what is held, and fix it as its own change, suite green before and after, before
   the AI client lands, or tell me why it should wait. Then write the failing tests.

THE PLAN
1. Provider: an AnthropicProvider behind AiProvider in src/engine/ai.ts. The key goes from Settings into the
   macOS Keychain once (settings.add_provider becomes real: confirm: true, never logged with its input) and is
   read only from there. Tests use a stub client, and a test fails if any test reaches the network.
2. Money: every call is priced before it is sent; the monthly cap refuses a call that would cross it and says
   so; each call's cost lands in its decision row and in Settings' used figure; the month rolls over.
3. Labels: breakdown.fit_mood, breakdown.ask, and the framing (size, lead room) and lens (depth of field,
   angle, movement) labels become T2: values source "ai" with a confidence 0–100. A model never overwrites a
   measured, estimated, EXIF or hand-set value. Where a T0 rule already gives a label (R2: shot size from the
   face box's share of the frame), propose T0 instead and record it. Stand-in flags go in the same change.
4. Review (R5): an AI value under 60 is queued for a person: it reads low on the screen, breakdown.review
   records the person's yes, and the decision row records the verdict.
5. No AI mode: every screen works by hand with No AI on or with no key; AI buttons say why they are off; T0
   buttons (Fit light, Analyse, Sample palette) stay on.

TESTS THAT PROVE IT (write these first)
- Zero live calls: the suite runs on a stub client; any attempt to reach the provider from a test fails.
- The key: stored and read only through the Keychain wrapper (stubbed in tests); never in the store, a
  decision row, an event, an error message or a log line (a test scans them all after add_provider);
  add_provider is refused over MCP.
- The cap: a call that would cross it is refused before it is sent, with the reason; used_inr equals the sum
  of the decision rows' cost_inr; the month rolls over (test with the clock).
- Values: AI values are source "ai" with a confidence, never "measured" or "estimate"; measured, estimated,
  metadata and manual values survive an AI call; the stand-in count drops by exactly the actions made real.
- R5: confidence 59 goes to review, 60 does not; breakdown.review records the verdict.
- Bad model output (not JSON, missing fields, confidence out of range) is refused with a reason, and its
  cost is still logged.
- Chrome: with no key, every AI button on every screen is off and says why, every screen still works by hand,
  and Fit light still works; with the stub provider, Ask answers and mood words read "AI n%", never MEASURED
  or ESTIMATE; a value under 60 reads low and can be confirmed.
- Keep every existing test green: parity, wiring, boot, records, security, the Blender accuracy test.

MEASURE AND REPORT (on this M1, real numbers only)
- Engine RSS and footprint, idle, with the AI client loaded, and after a 60 s import (the B-LL-004 fix).
- With my own key (I add it in Settings; never in a file, the chat or a commit): one live Ask and one live
  mood call on a committed Blender render: time, tokens, cost in INR, and that the cap counted it. Not in the
  suite.
- If option B: whether the model's confidence means anything. The Blender set knows each scene's focal length
  and shot size: Spearman(confidence, correct) for those labels, one live run, its cost stated first. Under
  0.5: say so and propose how the screen shows it (D-LL-036 is the precedent).

RULES FOR THIS PHASE
- No pixels leave the machine unless I say yes to option B, and then only for a project with cloud allowed,
  with an upload row per frame.
- No new heavy dependency. The Anthropic SDK or plain fetch: decide, check the licence, measure the memory,
  record it.
- Models choose words and labels, not numbers we measure (D-LL-003): no AI light, palette or contrast.
- No accuracy claim for any AI label: words are not measurements. Where the Blender set can check a label,
  report it as a Blender-set number only.
- Every state change goes through a registry action (new helpers get command: false); confirm MCP lists
  them. If a design literal must become data, add it to src/ui/bindings.json and regenerate.
- Log each bug in docs/bug-log.md the moment you find it. Log each real choice (what leaves the machine, the
  model and its prices, the cap's rules, the review threshold, the prompt format and its version) in
  docs/decision-log.md with chose · rejected · why; shape changes as AD records.

FINISH
- npm test green, npm run typecheck clean.
- Mark P4 done in docs/phases.md with the measured numbers (or not done, with what failed); write the
  progress entry (next PR id from the registry) citing every D/AD/B id you touched.
- Give me a short report: what is AI now and what is still sample, what each call costs, the memory numbers,
  anything that failed or was skipped, and the five-line plan plus tests for P5.
- Do not commit or push without asking me.
```
