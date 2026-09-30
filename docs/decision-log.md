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
- **D-LL-008 — (v0.2 `D-008`) The fit assumes the camera and set are known.** Kept for now; revisit in the light-fit phase (lens from face size or EXIF, camera-relative light).
- **D-LL-007 — (v0.2 `D-007`) The look-match metric uses cheek windows only.** Kept. Do not revert to whole-face statistics.
- **D-LL-006 — (v0.2 `D-006`) Cards for people, meshes for props; flag a card viewed more than 35° off-axis (R11).** Kept for the Set Plan phase.
- **D-LL-005 — (v0.2 `D-005`) Single-file HTML with three.js r128 from cdnjs.** **Superseded** by D-LL-013 / AD-LL-001.
- **D-LL-004 — (v0.2 `D-004`) Validate on synthetic ground truth first.** Kept; real ground truth (Blender set) is its own phase.
- **D-LL-003 — (v0.2 `D-003`) Decision models choose strategy, not numbers.** Kept.
- **D-LL-002 — (v0.2 `D-002`) Tiered cascade T0–T3, rules first (R1–R14), log everything.** Kept; rule ids unchanged, new rules continue from R15.
- **D-LL-001 — (v0.2 `D-001`) Two loops; image models are not the interactive renderer.** Kept.
