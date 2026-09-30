# Prompt 3 · Claude Code: architecture, then build

Before starting: put the Claude Design export in `design/` inside the project folder. Open Claude Code in the project folder and paste the block below.

---

```
You are starting LOOK LAB v1. Work in three stages and stop for my approval after Stage 1.

INPUTS IN THIS FOLDER
- look-lab-handoff.zip: an old v0.2 prototype (single HTML file, three.js r128, every AI step faked). Unzip it to reference/v0.2/. Salvage its MATHS, TESTS and LESSONS only: the light fit (createFit), the cheek-only match metric (D-007), the scene-graph idea, the rule table R1–R14, the validation findings, and the gotchas in its CLAUDE.md. Do NOT reuse its UI, layout or visual style.
- design/: the Claude Design export. It is the UI spec, including the ACTION CATALOGUE. If it is missing, stop and tell me.

WHAT LOOK LAB IS (v1)
An internal tool for our film production team, public later. A technical pre-production brain that cuts cost and mistakes on set. Per shot:
1. BREAK DOWN a reference frame or video: palette (hex + share), light (az/el, hardness, kelvin, key:fill, practicals), lens, framing, camera movement, mood.
2. ADAPT to our location and kit: a recipe, gaps and risks.
3. PLAN IN 3D: move lights, camera and actors in a model of the location, with a look-match score against the reference.
4. EXECUTE: a set sheet (lighting plot, gear list, camera settings, setup order) for print and phone.
Plus: projects, shots/previs, mood board, look library, settings, activity log.

STAGE 1: ARCHITECTURE (documents only, no app code)
Write the architecture that meets every hard requirement below. For each shape decision, write an architecture-decision record with: chose · rejected · why · trade-off. Then STOP and wait for my approval.

Hard requirements:
A1 LIGHT MACHINE. It must run well on a 2020 M1 MacBook with 8 GB while Chrome, Slack and Claude are also open. Budget: Look Lab's own processes ≤ 1.5 GB in normal use; optional local models ≤ 2.5 GB more, one at a time, loaded on demand and unloaded after. Heavy models (image edit, image→3D, relight) run in the cloud or through the user's AI provider, never locally. Measure on the real machine and report actual numbers.
A2 ONE ACTION REGISTRY (the rigid spine). Every feature is a named, typed, versioned action (input schema, output schema, side effects, whether it needs human confirmation). The UI buttons, the ⌘K palette, the MCP server, a CLI and (later) an HTTP API all call the same registry. No feature exists only in the UI or only in MCP. Add a parity test that fails if any action is missing from one surface.
A3 AI ACCESS, three modes:
   (a) Own Claude subscription: the user runs Claude Code, which connects to Look Lab's MCP server and drives it. This is the only way a Claude Pro/Max subscription is used. Anthropic does not allow third-party apps to offer claude.ai login or reuse subscription OAuth tokens, including through the Agent SDK (https://code.claude.com/docs/en/agent-sdk/overview). Re-check the current terms before you design this and cite what you read.
   (b) API key: in-app AI buttons use an Anthropic API key, or another provider through a provider adapter. Keys go in the macOS Keychain, never in files or the repo. Monthly spend cap with a hard stop, and a cost log.
   (c) No AI: every screen works by hand.
A4 MCP. Ship an MCP server exposing the whole action registry, with a one-command setup for Claude Code. Read-only actions run freely; actions that change or delete things, spend money or upload files need confirmation.
A5 HONESTY. Every value stores its source (measured / model / manual / sample) and confidence. A stand-in is never presented as a real model call. No accuracy claim on real footage until a ground-truth test exists for it (the Blender set from the old P3).
A6 RIGID CONTRACTS, FLEXIBLE PARTS. Versioned schemas with migrations for: reference, breakdown, location, kit, recipe, set plan (scene graph), shot, look fingerprint, decision-log row. Everything else sits behind an interface and can be swapped: AI providers, local models, storage, renderer, cloud GPU host, packaging.
A7 DISTRIBUTION. Now: a private GitHub repo; a teammate installs and runs it on their Mac with one command. Later: a hosted version for the team, then public. Do not block those: workspace and user ids in the data model from day one, storage behind an adapter (local folder + SQLite now), a seam for auth.
A8 SECURITY. If there is a local server: bind to 127.0.0.1 only, require a per-session token, check the Origin header (any website can call localhost). Validate every action input against its schema. Nothing sensitive in error messages.
A9 PRIVACY. Client footage stays local by default; cloud upload is allowed per project, and logged.
A10 DECISION LAYER. Keep the tiers (T0 instrument, T1 fast model, T2 AI, T3 human) and rules R1–R14 with their existing numbers. Every routed decision is logged.
A11 3D. The fast loop is real-time three.js (upgrade from r128 deliberately, with tests). Image models are never the interactive renderer.

Starting hypothesis to test, not a decision: a TypeScript web UI served by a small local engine that hosts the registry and exposes it to the UI, MCP and a CLI; a Python worker spawned on demand for FFmpeg/OpenCV/models; the project on disk as a folder plus SQLite; the same UI and engine deployable to a server later. Compare it with a Tauri shell (system WebView) and with Electron on measured memory, then decide.

Also deliver in Stage 1:
- docs/architecture.md with a component diagram and the data flow of the core loop;
- memory budget table (target vs how you will measure);
- the build phases below, turned into phase cards with deliverables and acceptance tests;
- the list of the old prototype's code you will port, and why.

STAGE 2: UI SHELL (after my approval)
Build every screen from design/ against the architecture. Wire every button to its registry action; unbuilt actions return clearly labelled SAMPLE data. The MCP server exposes the same actions. Parity test passes. The app runs from a clean clone on my M1 with one command; report RAM used.

STAGE 3: FEATURES, ONE PHASE AT A TIME
Suggested order (adjust in Stage 1 with reasons):
1. Breakdown, deterministic first: video → shots and keyframes (FFmpeg), exact palette with hex and share, contrast, shadow/mid/highlight tint, framing and shot size. Then light (port the fit) and lens estimates. Mood words via AI.
2. Light-fit ground truth: Blender set of ≥ 20 scenes with known light; report errors per parameter and skin tone before changing the fit. Light numbers are labelled "estimate" until this passes.
3. Location & Kit: inputs, recipe generation, deterministic checks (power budget, gear gaps).
4. Set Plan 3D: lights, camera and actors in the room, top-down plot, look match (cheek-only metric).
5. Set sheet export: A4 PDF and phone view.
6. Library and mood board.
7. Shots / previs board.
8. Cloud image jobs: outfits, image→3D, hero relight. Queued and costed, licence checked per model for commercial client work.
9. Learned decision router, only after ≥ 500 human verdicts.
Before each phase: give me a five-line plan and the tests that will prove it. Write tests first. Run the full test suite before saying a phase is done.

WORKING RULES
- Follow my global rules in ~/.claude (security, testing, project records).
- Records: this project has no project code yet. Propose one (my suggestion: LL) and ask before first use. Keep the old ids D-001…D-012 and R1…R14 exactly as they are. Record the decision to leave the single-file artifact as the next decision.
- Initialise git, make the repo private on GitHub when I say so, never `git add -A`, stage only files you touched.
- The folder name ends with a space ("LOOK LAB "). Quote every path.
- Plain, direct prose in UI copy and docs. State limits.
```
