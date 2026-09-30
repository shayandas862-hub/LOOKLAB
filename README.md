# Look Lab

A technical pre-production brain for film. Break down a reference frame or video
(colour, light, lens, framing, movement, mood), adapt the look to your location and
kit, plan lights, camera and actors in 3D, and hand the crew a set sheet.

**Status: v0.3, internal.** Every screen of the design runs on a local engine, and
every button calls a real action that Claude Code can also call. On Breakdown, drop
an image or video: Chrome reads it on your Mac, and Look Lab measures the shots, the
palette (exact hex and share), shadow/mid/highlight tint, saturation, contrast in
stops and aspect from its pixels (phase P2). Light, lens and mood are still the
design's sample values (phases P3/P4), and so are the other screens; no AI provider
is connected (phase P4). Anything on sample data says so. See [`docs/phases.md`](docs/phases.md).

## Run it

Needs macOS, [Node 22.6+](https://nodejs.org) and Chrome.

```sh
git clone <this private repo> look-lab && cd look-lab
npm install
npm start          # builds the UI if needed, starts the engine, opens http://127.0.0.1:4317
```

Your data lives in `~/LookLab` (set `LOOKLAB_HOME` to change it). Nothing leaves your
Mac unless a project allows cloud.

## Use it with Claude Code (your own Claude subscription)

With Look Lab running, print the setup command and run it once:

```sh
node bin/looklab.mjs mcp-setup
```

Claude Code then has one tool for each Look Lab action (72 today). Actions that need
a person's approval are refused over MCP; run those from the Look Lab window.
Look Lab never asks for your Claude login.

## Everything else

```sh
npm test                     # builds the UI and runs every test, including one in Chrome
npm run dev                  # engine + hot-reloading UI on http://127.0.0.1:5173
node bin/looklab.mjs run plan.get '{"shot_id":"12C"}'    # any action from the terminal
```

Start with [`CLAUDE.md`](CLAUDE.md) for how the code is organised and the rules it
keeps, then [`docs/architecture.md`](docs/architecture.md).
