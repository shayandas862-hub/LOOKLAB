# Look Lab — Architecture (v1)

**Status: adopted 2026-09-30.** Shape decisions are recorded as `AD-LL-*` in
[`architecture-decisions.md`](architecture-decisions.md); this document is the
picture those decisions draw. The old v0.2 prototype's architecture is kept, read-only,
in `reference/v0.2/docs/03-ARCHITECTURE.md`.

## 1 · What it has to be

A pre-production tool a film crew runs on ordinary laptops, starting with a 2020
M1 MacBook with 8 GB of memory that also has a browser, Slack and Claude open. It
is internal first and public later. It must work fully by hand, better with AI,
and let Claude Code drive every feature.

## 2 · The picture

```
                ┌──────────────────────── the person's Mac ────────────────────────┐
                │                                                                   │
  Browser tab ──┤  UI (React)                                                       │
  (Chrome)      │   views generated from design/ · logic per screen · ⌘K palette   │
                │   decodes video/images locally (<video> + canvas)                │
                │          │ HTTP + SSE (127.0.0.1, session token)                  │
                │          ▼                                                        │
                │  ENGINE (one Node process, ≈120 MB measured)                      │
                │   ┌─────────────── ACTION REGISTRY (the spine) ───────────────┐  │
                │   │ name · input schema · output schema · effect · confirm ·  │  │
                │   │ tier · rule ids · handler                                  │  │
                │   └──────▲────────────▲─────────────▲─────────────▲───────────┘  │
                │      /api/actions   /mcp (HTTP)   CLI (looklab)   later: public API│
                │          │            │                                           │
                │   Store (files)   Secrets (Keychain)   AI provider   Decision log  │
                │   ~/LookLab/...                        (none | API key)  (JSONL)   │
                └──────────────────────────┬───────────────────────┬────────────────┘
                                           │                       │
  Claude Code (the person's own ───────────┘ MCP over HTTP          │ HTTPS, only if the
  subscription, their own login)             with bearer token      │ project allows cloud
                                                                    ▼
                                                     Anthropic API / cloud GPU jobs
```

## 3 · The parts

| Part | Folder | Runs in | Job |
|---|---|---|---|
| Core | `src/core/` | browser **and** Node | Pure maths, no DOM, no Node APIs: colour science, palette, image statistics, shot-cut detection, light fit, look-match metric, plan geometry. Tested in Node. |
| Contracts | `src/contracts/` | both | zod schemas for every stored thing, each with a `schema_version`. The only source of types. |
| Actions | `src/actions/` | engine | The registry and one module per domain (`breakdown`, `adapt`, `plan`, `shots`, `board`, `setsheet`, `library`, `project`, `settings`, `log`, `app`). |
| Engine | `src/engine/` | Node (≥ 22.6, TypeScript run directly: D-LL-019) | HTTP server, security, store, events, MCP endpoint, secrets, AI provider, static UI. |
| UI | `src/ui/` | browser | Shell + screens. `views/` are generated from `design/`; `logic/` is owned code; `runtime/` talks to the engine. |
| CLI | `bin/looklab.mjs` | Node | `start`, `dev`, `mcp-setup`, `run <action> <json>`. |

## 4 · The spine: one action registry (AD-LL-002)

Every feature is an **action**: a named, typed, versioned function.

```ts
defineAction({
  name: 'breakdown.sample_palette',      // <domain>.<verb_noun>, lowercase
  title: 'Sample palette from frame',
  tier: 'T0',                             // T0 instrument · T1 fast model · T2 AI · T3 human
  effect: 'write',                        // read | write | spend | upload | delete
  confirm: false,                         // true → a human approves before it writes
  rules: ['R2'],
  input:  z.object({...}),
  output: z.object({...}),
  handler: async (ctx, input) => {...},
})
```

- The engine validates input **and** output against the schemas on every call.
- The UI's buttons, the ⌘K palette, the MCP server and the CLI are all built from
  the registry. A parity test fails if the design's action catalogue, the registry
  and the MCP tool list disagree.
- MCP tool names are the action name with the first `.` replaced by `_`
  (`breakdown.fit_light` → `breakdown_fit_light`), because model tool names may not
  contain dots. Domains contain no underscore, so the mapping is one-to-one.
- Actions with `confirm: true` are refused over MCP until the approval queue exists
  (D-LL-017). In the UI the person's click is the approval; the CLI asks for a typed
  "yes" at a real terminal (D-LL-023).
- Every call through the registry that makes a routing choice writes a **decision
  row** (tier, rule id, inputs summary, result, confidence, cost, verdict).

## 5 · Honesty in the data (carried from v0.2)

Every measured or estimated leaf is a `Value`:
`{ value, unit?, source: 'measured'|'ai'|'manual'|'sample', confidence?, updated_by, updated_at }`.
Stand-ins return `source: 'sample'`, and the UI says so. A value is `measured` only
when a T0 instrument computed it from the actual pixels.

## 6 · AI access (AD-LL-003)

| Mode | How | Who pays |
|---|---|---|
| Own Claude subscription | The person runs **Claude Code**, which connects to Look Lab's `/mcp` endpoint and drives it. | Their subscription, used by Claude Code itself. |
| API key | In-app AI buttons call a provider adapter (Anthropic first). Key in the macOS Keychain. Monthly cap with a hard stop and a cost log. | The key's account. |
| No AI | Every screen works by hand. AI buttons disable and say why. | Nobody. |

Look Lab never offers a claude.ai login and never reuses subscription OAuth tokens:
Anthropic does not allow third-party products to do so
(<https://code.claude.com/docs/en/agent-sdk/overview>, read 2026-09-30).

## 7 · Where things run and what they cost in memory (AD-LL-001, AD-LL-007)

| Piece | Where | Budget | How measured |
|---|---|---|---|
| Engine | Node, 127.0.0.1 | ≤ 150 MB RSS (measured 121 MB idle, 113–118 MB after 600 writes) | `ps -o rss` on the node pid |
| UI | a tab in the browser the person already has open | ≤ 400 MB for the tab | Chrome Task Manager / `performance.memory` |
| 3D (Set Plan) | three.js, loaded only when Set Plan opens | inside the tab budget | same |
| Video/image decode | the browser's own decoder (hardware on M1) | inside the tab budget | same |
| Optional local models | one at a time, loaded on demand, unloaded after | ≤ 2.5 GB extra | process RSS |
| Heavy models (image edit, image→3D, relight) | cloud, behind a costed job queue | 0 locally | — |

Total target for Look Lab's own processes: **≤ 1.5 GB** in normal use.

## 8 · Data on disk (AD-LL-005)

```
~/LookLab/                     (override with LOOKLAB_HOME; every file mode 0600, folders 0700)
  token                        MCP/CLI bearer token
  system/settings.json         No AI mode, API provider and cap, cloud-allowed projects
  projects/<project_id>.json   the project: scenes, shots, cloud flag
  projects/<project_id>/
    references/<ref_id>.json   file facts (name, size, SHA-256), sampling, detected shots
    references/<ref_id>/frames/NNNNN.png   sampled frames, ≤ 512 px (P2); the original file is not copied (D-LL-027)
    breakdowns/<shot_id>.json  locations/<id>.json  kits/<id>.json  recipes/<shot_id>.json
    plans/<shot_id>.json       the current plan, its version number and its undo history
    setsheets/<shot_id>.json   boards/board.json
  looks/<look_id>.json         the Library, shared across projects
  decisions.jsonl              every logged decision, append-only
  verdicts.jsonl               people's verdicts on decisions, append-only
```
(Layout as built and listed on 2026-09-30.)

Every record carries `workspace_id` and `created_by` from day one so a hosted,
multi-user version needs a new store adapter, not a data migration.

## 9 · Security of a local server (AD-LL-008)

Any website the person visits can send requests to `127.0.0.1`. So:
- bind to `127.0.0.1` only; reject any `Host` header that is not the engine's own
  address (blocks DNS rebinding);
- `/api/*` requires the `X-LookLab-Token` header (a custom header forces a CORS
  preflight, which the engine never approves for other origins); the UI gets the
  token from `GET /api/session`, answered only when `Sec-Fetch-Site: same-origin`
  (D-LL-022);
- `/mcp` and the CLI require `Authorization: Bearer <token>` from `~/LookLab/token`;
- every action input is validated against its schema before the handler runs;
- a token-bucket rate limit per client;
- errors name the action and the field, never a path outside the project or a secret.

**The limit:** any program running as the person on their Mac can read
`~/LookLab/token` and has the person's access. The guards above keep websites and
agents' own channels out; per-person accounts come with team hosting (D-LL-023).

## 10 · Distribution (AD-LL-001)

- **Now:** a private GitHub repository. A teammate runs `npm install` then
  `npm start`; the engine builds the UI if needed, starts, and opens the browser.
- **Next:** the same engine hosted for the team behind a login (a store adapter and
  an auth seam; the registry and UI do not change).
- **Later:** public. Needs accounts, per-user storage, billing, model licences
  checked for commercial use. None of it blocked by today's shape.

## 11 · The two loops (kept from v0.2, D-LL-001)

The fast loop is three.js in the browser: move lights, camera and actors in real
time and measure the look match. The slow loop is cloud image models for assets and
final stills. Image models are never the interactive renderer.

## 12 · What is fixed and what is free (the "rigid but flexible" rule)

| Fixed (change only with a new AD record and a migration) | Free (swap behind an interface) |
|---|---|
| The action registry and its naming | AI provider and model |
| The contracts and their `schema_version` | Store (files now, SQLite/Postgres later) |
| `Value` provenance on every measured leaf | Video decoder (browser now, FFmpeg later) |
| Tiers T0–T3 and rule ids R1… | Renderer (three.js now, Blender bridge later) |
| Record ids (`D-LL-*`, `AD-LL-*`, …) | Packaging (browser tab now, desktop shell or hosted later) |
