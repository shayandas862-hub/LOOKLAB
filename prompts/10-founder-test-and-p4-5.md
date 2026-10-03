# Prompt 10 · Claude Code: the founder uses the whole app, then P4.5 continues

For the session after PR-LL-005 (2026-10-03). P4.5 is in progress, so this session continues it, not P5. It opens
with the founder using every part of Look Lab as a user, with Claude as the guide, and suggesting; the build then
continues with what the founder decides. Before pasting: PR-LL-005's work committed and pushed to `origin/main`;
`CLAUDE.md` is P4.5's (installed in `f265075`, updated with "P4.5 so far"). Open Claude Code in the project folder and
paste the block below.

---

```
Continue Look Lab. Two parts, in this order. Part A: I use the whole software first, as a user, with you as my
guide, and I suggest. Part B: you continue P4.5 with what I decide.

READ FIRST
CLAUDE.md (P4.5, including "P4.5 so far"), the newest entry in docs/progress-log.md (PR-LL-005), docs/phases.md (the
P4.5 card), the open entries in docs/bug-log.md, and D-LL-050 to D-LL-055. Read anything else only when a step needs
it. Next record ids from docs/id-registry.json.

BEFORE ANY CODE
1. git status and git log: PR-LL-005's work is committed and main equals origin/main. If not, stop and tell me.
2. npm test: confirm 444 passed (or say what changed). npm run typecheck.
3. In Part A, write no code. If something I hit blocks the test, log it in docs/bug-log.md at once, tell me, and
   fix it only with my yes.

PART A · MY HANDS-ON TEST (plain English, one step at a time; I click, you explain)
1. Start my real Look Lab on my own data: build the UI if needed, start the engine with ~/LookLab on port 4317 (the
   "looklab" launch config, or npm start), open it in the browser pane and tell me the URL for my own Chrome. Say what
   I will see first (the sample project "Neel", marked SAMPLE).
2. Connect my Claude Code to it: run node bin/looklab.mjs mcp-setup, give me the command to run in my own terminal
   (the token stays in the file; you never print it), then make one MCP call together to prove it works.
3. Walk me through every touch point, in this order. For each number on screen, tell me in one sentence what it is
   and what its badge means (MEASURED, ESTIMATE, METADATA, MANUAL, SAMPLE, AI · n):
   a. Breakdown: I import my own iPhone photo (HEIC) and my own iPhone video (MOV). Palette, tints, saturation,
      contrast, aspect; I click the subject; I drag a box round a face; Fit light; shot size; I type mood words;
      I change one value by hand; Save look; the honesty marker at the top (hover, then click).
   b. Grade check, through Claude Code (it has no screen yet): I give a still from a test shoot or a graded export;
      Claude Code runs colour.import_still and colour.check_grade; you read me each row and its verdict.
   c. My kit's colour facts, through Claude Code: my gels from my swatch book (adapt.set_kit_colour, each with its
      citation), and my lights' colour ranges if I know them.
   d. Settings (No AI mode, the spend cap, the Claude Code connection), Activity (the log), and every screen still
      on sample data (Location & Kit, Set Plan, Shots, Mood Board, Set Sheet, Library): say plainly what each will do
      and which phase makes it real.
4. While I test, keep a record:
   - every suggestion I make, in my own words, goes into a new plan file plans/P-LL-002-founder-test-<date>.md
     (allocate P-LL-002 in docs/id-registry.json; tell me the file name in one line before creating it);
   - every defect I hit goes into docs/bug-log.md the moment it happens, with its id.
5. At the end of Part A, read my suggestions back as a numbered list. For each, give your recommendation: fix now
   (small, inside P4.5), add to P4.5, move to a later phase (name it), or decline (say why). Ask for my yes in one
   message. Turn each yes into a D record (an AD if it changes a shape), citing P-LL-002, and update the phase cards
   of anything that moves. Also put to me: the known gap that values Claude Code writes over MCP read MANUAL
   (D-LL-050), if it is still open.

PART B · CONTINUE P4.5 (CLAUDE.md's tasks, after my yes on Part A's list)
1. First, the yeses from Part A that belong in P4.5, each test-first.
2. Task 1, unfinished: the document research did not finish last session, so nothing is cited. Read and cite, each
   with its URL or page, the date read and a licence verdict (ok, unclear, typed-by-founder; unclear means no):
   Sony's FX3 Help Guide and the S-Log3 / S-Gamut3.Cine technical summary, ASC CDL v1.2, Adobe Cube LUT 1.0, my gel
   maker's book (ask me: Lee or Rosco), X-Rite's ColorChecker values, Kim et al. (2002), ITU-R BT.709 and BT.1886,
   Ohno (2014) for Duv. Record the verdicts as D records. Then type my kit's numbers (manual, cited).
3. Task 2 onwards, picking up where PR-LL-005 stopped: S-Log3; the S-Gamut3.Cine matrices; CCT and Duv; the ASC CDL
   forward, inverse and fit; the base transform B and its inverse; .cdl and .cube; LUT application; the set-colour
   verdicts; the camera rules. Then the ColourPlan record and the capture card (AD-LL-016, AD-LL-017). Then
   colour.plan_capture, colour.fit_cdl, colour.set_split, colour.choose_strategy (T2), colour.export_cdl and
   colour.export_lut. Then the Blender colour set, its tolerances already written in docs/validation.md §5. Screens
   only once the export of prompts/08-claude-design-colour.md is in design/ (ask me whether it is).
4. Only if I asked for it in Part A: camera video originals Chrome refuses (ProRes, 10-bit 4:2:2), converted on the
   Mac with avconvert, the video reaching the engine in pieces; its own D record; memory measured.

RULES (CLAUDE.md wins on anything not said here)
- Talk to me in plain English. One question at a time unless I ask for a list. Your recommendation first.
- Tests first, failing before the code. Nothing committed or pushed without my yes. Never git add -A; never .claude/.
- Measure, do not recall. Every number you tell me comes from this session.

FINISH
- npm test green, npm run typecheck clean.
- A progress entry (the next PR id) citing every id touched, P-LL-002 included; the P4.5 card's status updated in
  docs/phases.md; CLAUDE.md's "P4.5 so far" brought up to date.
- A short report in plain English: what I tested and what I suggested; what was decided; what was built and tested;
  what is next. Do not commit or push without asking me.
```
