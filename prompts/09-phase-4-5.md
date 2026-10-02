# Prompt 9 · Claude Code: Phase 4.5 (colour: what to capture and how to grade)

Before pasting (done 2026-10-02 in the P4 session, which went straight on into P4.5: engine first, design later): P4 committed and pushed to `origin`; `prompts/09-phase-4-5-CLAUDE.md` installed as `CLAUDE.md`, with
its P4 line filled in from P4's progress entry; the Claude Design export of `prompts/08-claude-design-colour.md` in
`design/`. Open Claude Code in the project folder and paste the block below.

---

```
Continue Look Lab. Phase 4.5: colour. For a reference shot, tell the crew what to capture in front of the lens,
how to set the camera, and what is left for the grade; then check a graded or test-shoot still against the
reference in numbers. The spec is plans/P-LL-001-colour-grading.md: build it, do not redesign it. Every colour
number is T0 maths; a model may only choose the strategy (D-LL-003).

READ FIRST
CLAUDE.md (P4.5), plans/P-LL-001-colour-grading.md (all of it), the newest entry in docs/progress-log.md (P4's),
docs/phases.md (the P4.5 card), docs/VISION.md (V-LL-002), docs/architecture.md §5 and §12, docs/validation.md, and
D-LL-003, D-LL-007, D-LL-024, D-LL-025, D-LL-029, D-LL-031, D-LL-035, D-LL-036, D-LL-037, D-LL-038, D-LL-039,
D-LL-042, D-LL-043, AD-LL-010, AD-LL-013. design/HANDOFF.md §4 (the new catalogue rows). Take next record ids from
docs/id-registry.json; P-LL-001 is the plan this phase adopts.

BEFORE ANY CODE
1. git status and git log: P4 committed and pushed. If not, stop and tell me.
2. npm test: confirm the baseline in P4's progress entry (or say what changed).
3. The colour design export is in design/: Breakdown, Set Sheet and Location & Kit changed, every new button with
   its command as its title, and HANDOFF.md §4 with the nine new rows. If not, stop: the parity test needs them.
4. Read and cite the documents, each with its URL or page, the date read and a licence verdict (ok, unclear, or
   typed by me). Unclear means no: use the fallback P-LL-001 names where the number is used.
   a. Sony: the FX3 Help Guide (recording modes: profiles, gamuts, base ISOs, codecs with bit depth and chroma;
      white-balance range and step; tint; shutter angles, and whether 172.8° is offered; built-in display LUTs;
      user LUT import; zebra or waveform) and the "Technical Summary for S-Gamut3.Cine/S-Log3 and S-Gamut3/S-Log3"
      (the formula, checked against P-LL-001 §4.5 step 3; the primaries; the code-value table; the clip level).
   b. The gel book of the maker I confirm: mired shift or published conversion, green–magenta, transmission, for
      every gel in the kit and every gel the sample plan names (½ CTS).
   c. The sheets of the fixtures I name: CCT range and step, green–magenta control and its unit, flicker-free.
   d. ASC CDL v1.2 (formula, clamps, XML elements and namespace, any test examples); Adobe Cube LUT Specification
      1.0; X-Rite's published ColorChecker values; Kim et al. (2002) (licence and any patent before runtime use).
5. Ask me, in one message, with P-LL-001's default for each: the open questions of its §11, and whether the colour
   answers of its §2.1 (the sample kit, with the defaults) still stand.
6. Get my yes on the five ADs of P-LL-001 §7 (write each, recommend, ask) and on the licence verdicts. Nothing in
   src/contracts changes before that yes (architecture §12).
7. Write the colour tolerances (P-LL-001 §9.3) and the §9.4 declaration into docs/validation.md as a new §5 (§4 is P4's AI values) before
   any colour set is generated or any colour accuracy test runs.

THE PLAN (after my yes)
1. Contracts and kit data: the five ADs as zod changes, each with a test that every stored record still parses;
   the kit's colour numbers typed from the cited documents (manual, with cite), sample until then.
2. Colour maths in src/core, each file under 300 lines, DOM-free and Node-free: mired and gel search; S-Log3;
   S-Gamut3.Cine matrices from the primaries; CCT and Duv; the ASC CDL forward, inverse and fit; the base transform
   B and its inverse; .cdl and .cube writers and parsers; LUT application (trilinear); the set-colour verdicts; the
   camera rules (profile, ISO, white balance search, exposure targets, recording, shutter).
3. Ground truth: the Blender colour set (P-LL-001 §9.2), deterministic, its truth checked without Blender; the dev
   set while building, the held-out set once, for the number. The noise and banding test (§9.4) on synthetic frames.
4. Actions (P-LL-001 §8), each with input and output schemas and a decision row; colour.choose_strategy through P4's
   provider (cap, "AI · n", R5); getters and helpers command: false; MCP lists them.
5. Screens from the new export (npm run port-design; behaviour in src/ui/logic): CAPTURE & GRADE on the Breakdown,
   grade-check mode, the Set Sheet's capture card (A4 page 2 and phone), the kit colour editor. Every colour
   button's binding checked: only Choose strategy is AI-gated.

TESTS THAT PROVE IT (write each first; it must fail before the code)
- Maths, at P-LL-001 §9.1's tolerances: mired and the gel search's tie order; S-Log3 round trip, and Sony's table
  within 0.5 of a 10-bit code if its use is allowed; the matrices; CCT and Duv; the CDL against the ASC examples (if
  allowed) and exact recovery of a known CDL; .cube and .cdl round trips; the 33-point LUT against the exact
  pipeline (ΔE00 99th percentile ≤ 1.0, worst ≤ 3.0); B then B⁻¹.
- The held-out Blender colour set, at P-LL-001 §9.3's tolerances, light and dark skin reported apart; a failed
  tolerance is reported as failed, never loosened after the run.
- Sources: every colour value carries the weakest source of its inputs: a plan from sample inputs is SAMPLE
  throughout; a gel chosen from the fitted key kelvin is ESTIMATE; no computed light colour is ever MEASURED.
- No number from a model: a stub strategy answer that carries a number (a lit share, a kelvin, a gel, a CDL value)
  is refused; the strategy is the only AI value; under 60 it goes to review; with No AI on it is refused with the
  reason and S0 is assumed and says so.
- Gaps and limits: the sample plan reports "½ CTS" missing from the gel book; a key on the fit's 2800 K bound is not
  used as a number and asks for the value by hand; a gel without a cited value is "needs <document>", never a number.
- Exports: the .cdl has the ASC structure and states its space; the .cube has its header and 35,937 rows, red
  fastest, and parses back to the same numbers.
- Grade check: a still identical to the reference gives zero on every row; a known CDL is reported within §9.3.
- Chrome: on a committed Blender reference, Plan capture fills CAPTURE & GRADE with badges (never MEASURED for a
  computed light colour) and "Split: S0 assumed (not chosen)"; Export .cdl and .cube download files that parse;
  the grade check imports a committed still and shows its rows and verdicts; the Set Sheet shows the capture card
  on A4 page 2 and on the phone view; with No AI on, every colour button works except Choose strategy, which says
  why.
- Every existing test stays green: parity (with the nine new commands), wiring, boot, records, security, purity,
  no-network, the light-accuracy test.

MEASURE AND REPORT (on this M1, real numbers only)
- Time for plan_capture, fit_cdl, export_lut (a 33-point LUT) and check_grade.
- Engine RSS and footprint: idle; after building a LUT; after a grade check (budget ≤ 150 MB).
- The Blender colour set: generation time, committed size (budget 15 MB), the held-out table against every
  tolerance (pass or fail), light and dark skin apart; the §9.4 crossings for 10-bit 4:2:0, 10-bit 4:2:2, 8-bit.
- If I give you a still from a real test shoot: its grade check, as numbers only, no accuracy claim.

RULES FOR THIS PHASE
- Every colour number is T0 maths from the breakdown, the kit and cited documents. No model sets a white balance,
  gel, kelvin, ratio, exposure, CDL value or lit share.
- A maker's number enters code only from a document read this phase, cited, its licence checked; never from memory.
- The split is shown wherever its numbers are; S0 is assumed until a person or the strategy sets it.
- No accuracy claim on real footage; Blender numbers are Blender-set claims only; tolerances written before the run.
- The light fit (P3) does not change in this phase: its range and its tolerances stay.
- Every state change is a registry action (helpers command: false); MCP lists them. Design literals that become
  data go through src/ui/bindings.json and npm run port-design.
- Log each bug in docs/bug-log.md the moment you find it; each real choice in docs/decision-log.md (chose,
  rejected, why), citing P-LL-001; shape changes as AD records; the colour results in docs/validation.md §5.

FINISH
- npm test green, npm run typecheck clean.
- P4.5 marked done in docs/phases.md with the measured numbers (or not done, with what failed); a progress entry
  (next PR id) citing every V/D/AD/B/P id touched.
- A short report: what the crew now gets for a shot and from which sources; what is still sample or "needs
  <document>"; the held-out table; the memory and time numbers; anything failed or skipped; the five-line plan plus
  tests for P5.
- Do not commit or push without asking me.
```
