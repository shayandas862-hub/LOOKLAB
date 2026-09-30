# Look Lab — Progress Log (what happened, when)

> What shipped in each session, with measured numbers. Newest at the top. The why
> is in [`decision-log.md`](decision-log.md) and
> [`architecture-decisions.md`](architecture-decisions.md); every entry cites the ids
> it touched. Numbers are measured in the session that writes the entry, never recalled.

---

## PR-LL-001 · 2026-09-30 — **v1 STARTS: records, architecture, and the whole design running on one action registry** (P0 + P1)

**Suite: 90 passed / 0 failed across 10 files (`npm test`, which builds the UI first); `npm run typecheck` clean.** Coverage of core, contracts, actions and engine: 87.8% statements, 90.0% lines, 70.3% branches. No model API was called anywhere.

- **P0, foundation.** Project code `LL` claimed (founder's choice). Records opened in the CalmLine layout: `VISION.md` (V-LL-001), `architecture.md` with AD-LL-001…009, `decision-log.md` with the 11 standing rules and D-LL-001…023 (001–012 are the v0.2 decisions rendered, not renumbered: D-LL-018), `CONTEXT.md`, `PRD.md`, `phases.md`, `bug-log.md`, `id-registry.json`, `plans/`. The v0.2 prototype is kept read-only in `reference/v0.2/`; the Claude Design export is in `design/`. `tests/records/` checks the registry and the bug-log shape.
- **P1, the shell.** An engine on `127.0.0.1:4317` hosts **68 actions** (57 commands, 11 getters; 23 stand-ins, all returning `source: 'sample'`) behind one registry (AD-LL-002). The same 68 are exposed over MCP for Claude Code (D-LL-016) and to a CLI. A converter (D-LL-014) compiled all 11 design screens into React views (2,504 generated lines). Every command is called by name from a screen (test) and listed in ⌘K (browser test). Activity and Settings show real data; the other 8 screens carry the SAMPLE marker, and their MEASURED/AI badges read SAMPLE (D-LL-015, tested in Chrome).
- **Verified live:** an MCP client listed 68 tools, moved the key light and read the breakdown on the running engine. Its refused `library_apply_look` (needs approval, D-LL-017) and its move both appeared in the Activity screen. A cross-site page is refused the session token; a wrong `Host` gets 403 (tests).
- **Measured on the M1 (8 GB):** engine RSS 121 MB fresh and idle; 113–118 MB after 600 writes. Page JS heap 5.9 MB with 164 DOM nodes. UI bundle 379 KB (104 KB gzipped); builds in about 0.1 s. One action round trip about 4 ms over HTTP.
- **Found and fixed:** B-LL-001 (the engine would not start under plain Node although every test passed; guarded by `tests/engine/boot.test.ts`). The bug-log shape test had never run against a real entry; its first entry showed it matched the wrong label form, and it was corrected the same hour.
- **Not done, stated plainly:** no reference is imported or measured yet (every breakdown number is the design's sample); no AI provider exists (the pill says "AI not connected"); no approval queue, so approval-needing actions are refused over MCP; Chrome was the only browser tested; `claude mcp add` was not run against the founder's own Claude Code config.
- Codebase at this entry: `src/` 46 hand-written files / 3,288 lines plus 11 generated views; `tests/` 11 files / about 950 lines.

---
