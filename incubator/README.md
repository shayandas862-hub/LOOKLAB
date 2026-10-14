# incubator/ — parked code, not part of Look Lab

Code kept here for later. **Nothing in this folder is imported, built, tested or served by Look Lab.**
`npm test`, `npm run typecheck` and the Vite build only read `src/`, `tests/` and the configs at the root;
this folder is outside all of them (D-LL-056). Its own `package.json` files are never installed by Look Lab.

Why it is here, and where it is meant to go: [`plans/P-LL-002-end-to-end-suite.md`](../plans/P-LL-002-end-to-end-suite.md).

## `visual-dashboard/`

A snapshot of the founder's repo `Shayan733/visual-dashboard`, branch `das-writer-dashboard-test`
at commit `acc127d` (read 2026-10-08). That branch is `main` (`ab5ae27`) plus 9 commits: the security
hardening (`js/sanitize.js`, CSP, no inline handlers), the Firestore/Storage rules and the Das Story Engine.
Copied as files, without its git history. The other branches were read and not copied:
`claude/microservices-integration-arch-m8pnrn` (adds a `/dashboard` prefix and app-switcher tabs, 4 files),
`claude/study-database-structure-1buJl` and `phase3-attachments-ui-fixes` (older states of the same canvas).

**One change from the original:** the Firebase web `apiKey` in `visual-dashboard/js/config.js` is replaced with
`REDACTED-set-locally`. Firebase calls that key public, but Look Lab's hard rule 6 keeps every key out of commits.
Put the real value back locally to run the canvas.

**Licence.** The canvas has no licence file; `das-story-engine/LICENSE` says "Copyright 2026 Das Production. All
rights reserved." Both are the founder's own work, so reusing them in Look Lab is the founder's call, not a
third-party licence question. Its dependencies (Firebase SDK from a CDN, `@modelcontextprotocol/sdk`, `zod`,
`serve`, `vitest`, `eslint`) would each be checked again before any is wired into Look Lab (hard rule 8).

### What it is

| Part | Where | What it does |
|---|---|---|
| Infinite canvas | `js/canvas.js` | Pan (drag, space-drag, touch), zoom 0.1–3× around the cursor, a grid drawn on a `<canvas>`, coordinates readout |
| Nodes, groups, stickies | `js/node.js`, `js/drag.js`, `js/selection.js` | Typed nodes with label, description, colour, status, owner, due date; resize; groups that re-parent nodes; marquee select |
| Connections | `js/connection.js` | SVG curves between node ports, labels, re-rendered as nodes move |
| Minimap | `js/minimap.js` | Overview of the whole board with the viewport box |
| Command palette, menus, keys | `js/commandPalette.js`, `js/contextMenu.js`, `js/keyboard.js` | ⌘K-style add/search, right-click menus, shortcuts |
| Undo/redo | `js/history.js` | Snapshot stack of the board state |
| Attachments | `js/attachments.js`, `js/firebase-storage.js` | Files pinned to nodes, stored in Firebase Storage |
| Persistence and auth | `js/state.js`, `js/sync.js`, `js/firestore.js`, `js/firebase-auth.js` | One state object; per-user canvases in Firestore; Google / magic-link sign-in; share link `#state=…` |
| Input hygiene | `js/sanitize.js` (+ `tests/sanitize.test.js`) | Every loaded board validated: hex-only colours, http/https-only URLs, legacy template migration |
| Templates | `templates/*.json` | Planning, system and workflow boards |
| Das Story Engine | `das-story-engine/` | TypeScript MCP server: project → spine → phases → plants → scene cards → prose → approve; versioned rows; file store or Supabase; bearer token |

### What it is not

**There is no YouTube or video-analysis pipeline in this repo, on any of its five branches** (searched 2026-10-08
for youtube, transcript, yt-dlp, gemini). The only trace is `das-story-engine/src/integrations/README.md`, an empty
plug-board that names "Gemini video analysis" and "YouTube data pull" as future adapters. The research pipeline
P-LL-002 wants (pick a niche video, pull its details, analyse it) has to come from somewhere else or be built.

### What Look Lab could take later (not now)

Ranked by how directly it fits; none of it is wired in. Each would be ported into Look Lab's own shape (React views
generated from `design/`, behaviour in `src/ui/logic/`, every write an action in the registry), never copied as is.

1. **The canvas maths and interactions** (`canvas.js`, `drag.js`, `selection.js`, `connection.js`, `minimap.js`):
   pan/zoom around a point, screen↔world transforms, marquee select, port-to-port curves. The model for a
   board where references, breakdowns, plans and set sheets sit side by side. Vanilla JS with module-level globals:
   it needs rewriting as typed, DOM-free maths plus a React layer, not lifting.
2. **`sanitize.js` and its tests**: the rule "every loaded document is validated before use" matches Look Lab's
   zod-on-every-action rule; the URL and colour checks port directly into zod refinements.
3. **`history.js`**: undo/redo for a board. Look Lab's decision log already records every action; an undo would
   be built on that, so this is a reference only.
4. **The Story Engine's pattern**: versioned, append-only creative records behind MCP tools, with
   `get_project_state` as the "where were we" answer. Look Lab already has its own registry, store and MCP, so the
   pattern is the salvage, not the code.
5. **Not taken:** Firebase auth, Firestore and Storage sync. Look Lab is local-first (footage stays on the Mac,
   hard rule 7) and has its own store.

## `video-harness-experiments/`

Three short films made entirely in code in Claude Code on the web (2026-10-13 to 14), as the first proof for the
founder's gen-video agent, a separate product from Look Lab. Every frame is a function of time; headless Chrome renders
it frame by frame; ffmpeg writes the MP4; the music is synthesised in Node from the same timeline. They are:
- a 15 s Look Lab pitch (2D motion graphics)
- a 15 s 3D piece in three.js
- a 40 s character film with 13 shots

Only the code is here. The MP4s and `node_modules` are not committed (`.gitignore`). How to run each one, in the cloud
or on a Mac with Chrome's GPU, is in its [README](video-harness-experiments/README.md). The paste-ready prompt for the
next session, sharpening that product's PRD, is
[`NEXT-SESSION-PRD.md`](video-harness-experiments/NEXT-SESSION-PRD.md).
