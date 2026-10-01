# Prompt 5 · Claude Code: Phase 3 (light and lens, and their ground truth)

Open Claude Code in the project folder and paste the block below. CLAUDE.md is already set up for P3.

---

```
Continue Look Lab. Phase 3: light and lens, and their ground truth. Still no AI.

READ FIRST
CLAUDE.md (set up for P3), then the newest entry in docs/progress-log.md (PR-LL-002), docs/phases.md
(P3 card), docs/architecture.md §5, §7 and §12, and these records: D-LL-007 (cheek-only match),
D-LL-008 (camera and set assumed known), D-LL-028 (subject by hand), D-LL-032 (partly real screens),
AD-LL-009 (core is DOM-free and Node-free). From the old prototype: reference/v0.2/docs/08-VALIDATION.md
and the P3 section of reference/v0.2/docs/07-PHASES.md. Take next record ids from docs/id-registry.json.

BEFORE ANY CODE
1. Run `git status` and `git log --oneline`. P2 should be committed (bd4f592). If it is not yet pushed
   to the private GitHub repo, tell me before anything else.
2. Run `npm test` and confirm the baseline (193 passing at PR-LL-002). Report the number.
3. Confirm the five-line plan below (or tell me what you would change and why). Two choices need my yes
   before code, because they change fixed things: how a light value is labelled "estimate" (Value.source
   is fixed by architecture §12: write the AD record and ask), and anything that changes D-LL-008.
4. Split src/actions/domains/breakdown.ts (451 lines) and src/ui/logic/Breakdown.logic.tsx (339) under
   300 lines each, as their own change, suite green before and after. Then write the failing tests.

THE PLAN
1. Port the v0.2 fit into src/core/: renderScene, downsample, measureInit, errFn, KNOBS and createFit
   (reference/v0.2/src/base.html, between CORE-START and CORE-END) and cheekStats (scene.js:464), as
   erasable TypeScript, each file under 300 lines. The 5 v0.2 cases run in npm test at v0.2 thresholds.
2. Blender ground truth: scripts/blender/ renders ≥ 20 scenes headless (Blender 5.1.1 at
   /Applications/Blender.app/Contents/MacOS/Blender) with known az, el, softness, kelvin and fill, a head
   with light and dark skin, varied backgrounds, truth JSON beside each render. Run the ported fit on it
   and report error per parameter and per skin tone BEFORE changing the algorithm.
3. Face by hand: a drag on the frame records the face box (a helper action, command: false, source
   "manual"); fit_light runs on that crop. Camera assumptions stay stated (D-LL-008): lens from step 4,
   yaw and tilt 0 unless set by hand. A face or landmark detector is later T1 work.
4. Lens: the EXIF focal length (35 mm equivalent when present) is read in the browser at import from the
   original file, because the PNG frames carry no EXIF, and sent with import_reference; otherwise by hand.
   EXIF is metadata, not pixels: decide and record which source it gets.
5. Wire it: breakdown.fit_light becomes real (T0) and loses its stand-in flag in the same change; light
   rows, the dial and the key overlay come from the fit and read as an estimate, never MEASURED; a
   confidence is shown only if it passes the Spearman test; the Breakdown marker says exactly what is
   still sample.

TESTS THAT PROVE IT (write these first)
- Port parity: for the same parameters, the ported renderScene gives the same pixels as v0.2's (run
  v0.2's core from its CORE markers, as reference/v0.2/tests/core-fit.test.js does); state the tolerance.
- The 5 v0.2 cases (rembrandt, beauty, noir, extra-a, extra-b): az ≤ 15°, el ≤ 8°, kelvin ≤ 500 K,
  fill ≤ 0.6, residual ≤ 0.02; softness not asserted, as in v0.2.
- Blender set: the generator is deterministic (same seed, same truth JSON); the committed renders and
  truth let the accuracy test run without Blender. Pass: median az error ≤ 15°, el ≤ 10°, with light and
  dark skin reported separately and the worst case printed.
- Confidence: Spearman(confidence, error) ≥ 0.5 on the set, or a test proves no confidence is shown.
- Actions: fit_light refuses a shot with no face box and says why; its output is labelled estimate and
  never "measured"; the stand-in count drops by one; the face box is validated (inside the frame, a
  sensible size). EXIF: unit tests on byte fixtures built in the test (focal length present, absent,
  corrupt).
- Chrome end to end: import a committed Blender render, drag the face box, press Fit light: the light
  rows read as an estimate (not MEASURED, not SAMPLE), the marker text is right, and nothing on the
  screen claims accuracy on real footage.
- Keep every existing test green: parity, wiring, boot, records, security, P2's palette and cuts.

MEASURE AND REPORT (on this M1, real numbers only)
- The accuracy table on the Blender set: median and worst az, el, kelvin, fill and softness, by skin tone.
- Fit time for one frame, and engine RSS during and after a fit (budget ≤ 150 MB idle; it was 146–147 MB
  after a 60 s import, so say plainly if the fit pushes it over, and what you would do about it).
- Time to generate the Blender set (a one-off), and the size of what is committed.

RULES FOR THIS PHASE
- No AI calls, no FFmpeg, no new heavy dependencies. Blender is a development tool: nothing at runtime
  may need it. An EXIF reader: write it (pure JS, small) or check the licence first and record it.
- Build the head in the Blender script, or use a CC0 model with its licence recorded. Unclear means no.
- No accuracy claim on real footage (standing rule 3). Passing the Blender set is a claim about the
  Blender set only; say so wherever the number appears.
- v0.2's known risk: the cheek metric once matched the look at az −90° for a light at −52°. If the
  Blender run shows direction errors like that, add a direction-sensitive statistic (nose shadow,
  eye-socket shading), with a test that fails without it, and record the choice.
- Every state change goes through a registry action (new helpers get command: false); confirm MCP lists
  them. If a design literal must become data, add it to src/ui/bindings.json and regenerate.
- Log each bug in docs/bug-log.md the moment you find it. Log each real choice (how "estimate" is shown,
  the face box by hand, the lens source, camera assumptions, the confidence formula, any change to the
  fit) in docs/decision-log.md with chose · rejected · why; shape changes as AD records.
- Where the standing accuracy table lives (a new docs/validation.md, numbered in the registry, or the
  phases card): propose it before creating a new record file.

FINISH
- npm test green, npm run typecheck clean.
- Mark P3 done in docs/phases.md with the measured numbers (or not done, with what failed); write the
  progress entry (next PR id from the registry) citing every D/AD/B id you touched.
- Give me a short report: what is real now, what is still sample, the accuracy table, the measured
  numbers, anything that failed or was skipped, and the five-line plan plus tests for P4.
- Do not commit or push without asking me.
```
