# Look Lab — Architectural Decision Log

> Decisions that change the **shape** of the system: a component or a connection.
> Choices made inside that shape go to [`decision-log.md`](decision-log.md). Newest
> at the top. Every entry carries **chose · rejected · why · trade-off**. Numbers come
> from [`id-registry.json`](id-registry.json) and are never renumbered.

---

## 2026-09-30 — v1 architecture (full picture in [`architecture.md`](architecture.md))

- **AD-LL-009 — Core maths is DOM-free and runtime-agnostic, shared by the browser and the engine.**
  **Chose:** `src/core/` imports nothing from the DOM or Node; it takes typed arrays
  and returns plain objects. **Rejected:** measuring inside UI components (untestable
  without a browser), or only in the engine (every frame would cross HTTP).
  **Why:** the same palette or light-fit code must run where the pixels are (the
  browser, for video) and where an agent calls it (the engine, over MCP), and be
  tested in Node. v0.2 had to regex-extract its core block to test it.
  **Trade-off:** core cannot use canvas, WebGL or `fs`; callers hand it pixels.

- **AD-LL-008 — The local server is treated as reachable by any website.**
  **Chose:** bind `127.0.0.1`, allow only the engine's own `Host`, require a
  custom-header token on `/api`, a bearer token on `/mcp` and the CLI, validate every
  input by schema, rate-limit per client. **Rejected:** "it's localhost, so it's
  safe". **Why:** browsers let any page send requests to localhost, and DNS
  rebinding defeats origin checks alone. **Trade-off:** a teammate cannot open the
  UI from another machine on the LAN; that is the hosted version's job.

- **AD-LL-007 — Video and images are decoded by the browser; the engine has no FFmpeg dependency.**
  **Chose:** the UI decodes with `<video>`/`<img>` and canvas (hardware decode on
  M1) and sends frames to the engine as PNG. **Rejected:** FFmpeg as a required
  install (not present on the target machine, measured 2026-09-30; one more thing a
  teammate must install), and a WASM FFmpeg (≈30 MB, slow, memory-hungry).
  **Why:** zero-install and light. **Trade-off:** formats the browser cannot decode
  (ProRes, some RAW) are refused with a clear message; an optional FFmpeg adapter can
  be added behind the same interface, and is required before an agent can import a
  video by path over MCP.

- **AD-LL-006 — React for the UI; screen views are generated from the design export.**
  **Chose:** React 19. `scripts/port-design.mjs` turns each `design/*.dc.html`
  template into `src/ui/views/*.view.tsx` (regenerable); each screen's behaviour
  lives in `src/ui/logic/*` (owned, never regenerated). **Rejected:** lit (lighter
  by a few MB, but the design's logic is React class components and would need its
  lifecycle re-implemented), a hand rewrite (slow, drifts from the design).
  **Why:** fidelity to the approved design, and a re-exported design can be pulled
  in again. **Trade-off:** generated views use inline styles and are not
  hand-edited; changes go through the design or the converter.

- **AD-LL-005 — Files on disk behind a `Store` interface; SQLite deferred.**
  **Chose:** one JSON file per record, written atomically, plus an append-only
  `decisions.jsonl`, under `~/LookLab/`. **Rejected:** SQLite now (`node:sqlite` is
  still experimental in Node 22; `better-sqlite3` is a native build a teammate may
  fail to compile). **Why:** readable, diffable, zero native dependencies.
  **Trade-off:** no queries across records; revisit when the decision log passes
  ~10,000 rows or the router phase needs joins.

- **AD-LL-004 — Contracts are versioned zod schemas; everything else sits behind an interface.**
  **Chose:** `src/contracts/` holds a schema with `schema_version` for every stored
  record; store, secrets, AI provider, media decoder and renderer are interfaces
  with one implementation each today. **Rejected:** types without runtime
  validation. **Why:** "rigid but flexible": the shapes an agent and a teammate
  depend on cannot drift, and the parts most likely to change (providers, storage,
  hosting) can. **Trade-off:** a schema change needs a migration and a test.

- **AD-LL-003 — AI in three modes; a Claude subscription is used only through Claude Code over MCP.**
  **Chose:** (a) the person's own Claude Code connects to `/mcp`; (b) an API key
  powers in-app AI buttons, with a spend cap; (c) No AI mode. **Rejected:** a
  "Sign in with Claude" inside the app, or reusing Claude Code's login through the
  Agent SDK. **Why:** Anthropic does not allow third-party products to offer
  claude.ai login or use subscription OAuth tokens, including via the Agent SDK
  (<https://code.claude.com/docs/en/agent-sdk/overview>, read 2026-09-30).
  **Trade-off:** in-app AI buttons need an API key; a subscription-only teammate
  uses AI by asking Claude Code.

- **AD-LL-002 — One action registry is the only way to change state.**
  **Chose:** every feature is a named, typed action; UI buttons, ⌘K, MCP and CLI
  are projections of the registry, and a parity test enforces it. **Rejected:** UI
  code calling the store directly, with MCP tools added later. **Why:** the founder
  wants full control both by button and by Claude, and a feature that exists on only
  one surface is a bug. **Trade-off:** every feature pays for a schema up front.

- **AD-LL-001 — A local engine serving a browser tab; not a Claude artifact, not Electron.**
  **Chose:** one Node process on `127.0.0.1` that serves the UI and the API, opened
  in the browser the person already runs. Distributed through a private GitHub repo
  (`npm install && npm start`). **Rejected:** the single-file Claude artifact (no
  disk, no MCP, no API keys, CSP limits; v0.2's shape), Electron (ships its own
  Chromium: roughly 150–300 MB more memory and a large download), Tauri (needs a
  Rust toolchain to build; WKWebView lags Chrome on WebGL and WebCodecs).
  **Why:** lightest option on an 8 GB machine, and the same engine can be hosted
  later. **Trade-off:** needs Node 22 on each machine; a signed desktop app is a
  later packaging step, not a rewrite.
