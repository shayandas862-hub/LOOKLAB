# Prompt 4 · Claude Code: Phase 2 (the real breakdown)

Open Claude Code in the project folder and paste the block below.

---

```
Continue Look Lab. Phase 2: the real breakdown, deterministic first (no AI).

READ FIRST
CLAUDE.md, then the newest entry in docs/progress-log.md (PR-LL-001), docs/phases.md (P2 card),
docs/architecture.md §3, §5, §7, and these records: AD-LL-007 (browser decodes media), AD-LL-009
(core is DOM-free and Node-free), D-LL-015 (sample data is labelled), D-LL-021 (bindings.json).
Take next record ids from docs/id-registry.json.

BEFORE ANY CODE
1. Run `git status`. P0 and P1 may still be uncommitted: if so, ask me whether to commit them first
   (stage only project files, never `git add -A`, never .claude/).
2. Run `npm test` and confirm the baseline (90 passing at PR-LL-001). Report the number.
3. Confirm the five-line plan below (or tell me what you would change and why), then write the
   failing tests before the code.

THE PLAN
1. Import: drop an image or video on Breakdown. Chrome decodes it, samples frames (e.g. 2 per
   second, analysis size ≤ 512 px on the long side) and sends them to the engine through a registry
   action. No FFmpeg. Do not copy large video files into ~/LookLab: store path, size and content
   hash, plus the sampled frames.
2. Palette in src/core/: k-means in CIELAB with fixed seeding (same input, same output), exact hex
   and share of frame, near-duplicate clusters merged. Marked source "measured".
3. Also from the pixels: shadow / mid / highlight tint, saturation, contrast in stops (from linear
   luminance percentiles, with a noise floor), aspect ratio. Subject position is set by hand in P2
   (a click on the frame); a face or subject detector is T1 work for later. Record that as a decision.
4. Shot cuts: frame-to-frame colour-histogram distance with an adaptive threshold. A slow fade must
   not count as a cut.
5. Wire the Breakdown screen to these real values, per value: real ones show MEASURED or MANUAL;
   light, lens and mood stay SAMPLE until P3/P4 and the screen's marker says exactly that.
   Remove the stand-in flag from every action you make real, in the same change, with a test.

TESTS THAT PROVE IT (write these first)
- Palette: on synthetic images with known colour patches, every patch recovered within
  CIEDE2000 ΔE ≤ 2 and its share within ± 2 points; same result on repeat runs.
- Contrast, tints, saturation: known synthetic gradients and tinted images give the expected numbers
  (state the tolerance in the test).
- Cuts: synthetic frame sequences with known cuts (plus noise, plus one slow fade) → every cut found
  within ± 1 sampled frame, no cut on the fade.
- Engine: the frame-import action validates its input (size, type) and rejects oversized bodies.
- Chrome end to end: import a fixture image (generate it, commit it in tests/fixtures/) → the
  palette shown matches the fixture's known colours and reads MEASURED → save look →
  library.list returns it with source "measured". For video, build a short clip with known cuts
  inside the test (canvas + MediaRecorder, WebM) rather than committing a large file.
- Keep every existing test green: parity, wiring, boot, records, security.

MEASURE AND REPORT (on this M1, real numbers only)
- Time to import and analyse a 60 s 1080p clip (PRD target ≤ 60 s). If you have no such clip,
  say so and measure the synthetic one instead.
- Engine RSS during and after that import (budget ≤ 150 MB idle; Look Lab ≤ 1.5 GB total).
- Time for the palette on one analysis frame.

RULES FOR THIS PHASE
- No AI calls, no FFmpeg dependency, no new heavy dependencies. A pure-JS PNG/JPEG decoder for the
  engine is fine if you need one: check its licence first and record it.
- Every state change goes through a registry action (new getters or helpers get command: false so
  the design-catalogue parity test still holds). MCP gets every new action automatically; confirm
  it lists them.
- Palette and pixel statistics are measurements of the frame, so "measured" is honest for them.
  Make no claim about light direction or accuracy on real footage (that is P3).
- If a design literal must become data, add it to src/ui/bindings.json and regenerate. Never
  hand-edit src/ui/views/.
- Log each bug in docs/bug-log.md the moment you find it. Log each real choice (colour space,
  k and merging rule, cut threshold, frame storage, subject position by hand) in
  docs/decision-log.md with chose · rejected · why.

FINISH
- npm test green, npm run typecheck clean.
- Mark P2 done in docs/phases.md with the measured numbers; write the progress entry
  (next PR id from the registry) citing every D/AD/B id you touched.
- Give me a short report: what is real now, what is still sample, the measured numbers, anything
  that failed or was skipped, and the five-line plan plus tests for P3.
- Do not commit without asking me.
```
