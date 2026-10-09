# Prompt 11 · Claude Code: the Pre-production tab (script → shots → frames → video)

**Before pasting:**
- Branch `docs/p-ll-002-pre-production` (V-LL-003, P-LL-003, this prompt) is merged into `main`, or the session merges it in step 0.
- Open Claude Code in the Look Lab folder and paste the block below.

The session interviews the founder first, then writes the records, then builds. It does not write code before the founder's yes.

---

```
Continue Look Lab. New work: the Pre-production tab (V-LL-003). The plan is
plans/P-LL-003-pre-production-generation.md. It was inferred from how I made the opening of my short film
"Dead Man's Telescope" by hand. Build it so that every feature works end to end, for real, not as a stand-in.
Before building anything, interview me about every feature: what it does, and how I want it.

READ FIRST
CLAUDE.md (the current phase file), plans/P-LL-003-pre-production-generation.md (all of it), docs/VISION.md
(§1 and V-LL-003), docs/phases.md (P4.5 in progress; P9 "Shots and previs" overlaps with this tab),
docs/architecture.md §5, §7 and §12, the newest docs/progress-log.md entry, design/HANDOFF.md §4,
D-LL-003, D-LL-039, D-LL-041…D-LL-048 (the in-app AI path, provider, cap, "AI · n", R5), AD-LL-002, AD-LL-003,
AD-LL-009, AD-LL-010. Next ids only from docs/id-registry.json: re-read it right before every write, because a
parallel session once minted the same number first (P-LL-002/P-LL-003, 2026-10-09).

STEP 0 · STATE
1. git fetch; git status; git log. Merge docs/p-ll-002-pre-production into main if it is not merged yet.
   Pull main. Stage only the files you touched, never git add -A.
2. npm test: confirm the baseline in the newest progress entry, or say what changed.
3. Ask me where this goes relative to the unfinished P4.5 and to P9: before P4.5's remaining tasks, after
   them, or replacing P9. Recommend one.

STEP 1 · INTERVIEW ME (no code)
One question at a time. For each question, give your recommended answer and why. Wait for my answer before the
next one. For every feature below, settle:
- what it does;
- its inputs and outputs;
- how I want it to look and behave;
- what "working" means for it (the acceptance test);
- whether it needs AI, or works by hand too.
Push back where my answer breaks a Look Lab rule or costs more than it is worth. Do not agree by default.

  1. The tab and projects: where Pre-production sits, how a film relates to a Look Lab project, the screens.
  2. Story: generate from a premise, upload a script (which formats), or both; how I steer and reject drafts.
  3. Breakdown: scenes, characters, locations, props, motifs, a colour note per scene, a runtime estimate.
     What is editable; how a script change flags shots already generated.
  4. Bible: the locked text blocks (style, light per part, characters, locations, props), how a block is changed
     (through a decision only), continuity rules as checks (direction of travel, which hand, the warm-light rule),
     the reason each motif exists.
  5. Look: the look board (one panel per part) and the palette measured from it (T0, the existing palette code).
  6. Characters: model sheets (turnaround, sizes, head angles, expressions, hands), made in the app or uploaded;
     variants (an older self) made by editing the master.
  7. Edit in words: the shot table. Fields: id (never renumbered; inserted shots take a letter), default length
     3 s, size and angle, start, end, movement, light line, references (at most 3), sound or VO, status. Checks:
     movement against length (walking is about 1.5 m/s), direction across cuts, every reference exists.
  8. Frames:
     - which image model(s); the prompt assembled in code from the bible, never retyped;
     - the start frame first, then the end frame as an edit of the start;
     - the review strip for a whole sequence; verdicts (kept, partial with one fix, rejected) with the reason;
       edit chains (parent → child, one change per edit);
     - each frame's measured colour against its part's palette, and the thresholds.
  9. Motion: which video models; the router (the cheapest model that takes start and end frames at the shot's
     length and resolution, audio off, prices read live, never hardcoded); the cost shown before a run; my monthly
     cap; retries; what happens when a model refuses.
 10. Assembly: clips in edit order; the export (EDL, XML or a numbered folder for DaVinci Resolve); the list of
     on-screen text (added in the edit, never generated).
 11. Records: every generation, decision and process step logged automatically by written triggers, with a
     one-line receipt and a veto. Where the logs live (the store, project markdown, or both).
 12. Files and memory: where generated images and clips are stored on disk; previews on the 8 GB M1; limits.
 13. Providers, keys and money: fal for everything, or direct APIs where cheaper; keys in the Keychain only;
     commercial-use terms per model (unclear means no); spending visible per shot, per scene and per film.
 14. No AI and by hand: which buttons are AI-gated; that I can upload my own frames and clips at every step.

Write my answers into plans/P-LL-003 as a new §9 "Founder's answers", dated, quoting me where it matters. Coin
terms in docs/CONTEXT.md.

STEP 2 · RECORDS, THEN MY YES
1. Propose, then write after my yes:
   - an AD amending D-LL-039: generation calls may send the project's own generated images and reference
     sheets; client footage and breakdown references never leave unless cloud is allowed for that project;
     every upload is logged;
   - an AD for the image and video providers, the router, keys and the cap;
   - an AD for the Pre-production contracts (Script, Breakdown, Bible, LookBoard, CharacterSheet, Shot, Frame,
     Clip, GenerationRecord), versioned zod, with the weakest-source rule for any number;
   - Ds for every other choice in the interview (chose · rejected · why).
2. Licence check: read each chosen model's and provider's terms; cite document, URL and date read, with a
   verdict.
3. A phase card in docs/phases.md, placed where I chose in step 0, with tasks in order and acceptance written
   from my answers.
4. The phase CLAUDE.md drafted as prompts/11-pre-production-CLAUDE.md, in the same shape as the current
   CLAUDE.md. Install it as CLAUDE.md only after my yes. A new hard rule changes only with an AD or D and my yes.
5. A Claude Design prompt for the tab's screens, prompts/12-claude-design-pre-production.md. I run it in Claude
   Design and put the export in design/. Engine and actions may be built before the export arrives, as P4.5 did.
Stop and show me the records. No code before my yes.

STEP 3 · BUILD, IN WORKING SLICES
Each slice works end to end through the action registry, the CLI and MCP before its screen. Test first, always.
  A. Projects, script upload and breakdown.
  B. Bible, look board and measured palette.
  C. Edit in words: the shot table and its checks.
  D. Frames: prompt assembly, image generation (start, then end as an edit), the review strip, verdicts, edit
     chains, colour measurement.
  E. Motion: the router and start/end video generation, cost before run, cap, retries.
  F. Assembly export and the on-screen text list.
  G. Automatic records (generation, decision and process logs, receipts).
  H. Story generation.
Then the screens through npm run port-design, behaviour in src/ui/logic/. Every new button's binding is checked;
only the AI steps are AI-gated.

"WORKING" MEANS
- npm test green and npm run typecheck clean. The suite has zero live calls: providers are stubbed (D-LL-045).
- A live smoke run, outside the suite (scripts/smoke-pre-production.ts), with my key and a spend cap I set,
  run only with my yes: one real shot of my film from the shot table to start frame, end frame and a video clip
  on disk. Record what it cost, how long it took, and the engine's RSS and footprint.
- A Chrome test of the tab: the shot table edits, the review strip shows verdicts, Export works, and with
  No AI on every by-hand step still works.
- The engine stays ≤ 150 MB RSS idle after a generation run, measured and written down.
- Nothing presented as real is a stand-in; a stand-in says "sample".

Look Lab's hard rules in CLAUDE.md all apply. If one blocks a feature, stop and ask; do not work round it.
Record defects in docs/bug-log.md the moment they are found. At the end: a progress entry with the numbers, the
phase marked in docs/phases.md, every id cited. Do not commit or push without my yes.
```
