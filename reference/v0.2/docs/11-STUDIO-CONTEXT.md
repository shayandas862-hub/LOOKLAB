# 11 · Studio context (recap, not re-verified)

This is background from the earlier planning conversation, included so Claude Code knows *why* the tool exists. It is a recap from memory of that conversation; market figures come from sources read then and were **not re-verified** for this handoff. Treat numbers as orders of magnitude.

## The owner
Shayan, Kolkata, India. Developer background who works from a PRD, architecture, phases and tests. Planning a one-person VFX/3D freelance studio. Tools: Blender, Claude (Max), free and open tools. Hardware: M1 MacBook (2020), 8 GB.

## The chicken-and-egg problem and its resolution
Problem: build a lead system first (delays everything) or the Blender pipeline first (no clients)? Resolution agreed in conversation: **do the first jobs manually and at small scale, then automate after about 20 repetitions** (D-012). Do not build automation for steps you have not done by hand.

## Portfolio approach
Build a few fast, specific pieces with Claude and Blender rather than a broad reel. Pieces should look like things clients actually pay for (product visuals, short ads, social motion, architectural or interior visualisation, logo stings). Look Lab supports this by making look-matching and relighting faster and more repeatable.

## Tool stack (free or already owned)
- **Blender**, run headless: `blender --background --python script.py`.
- **FFmpeg** for video handling.
- **Remotion** for code-driven video: free for individuals and for-profit organisations of up to 3 employees (check current licence). Not After Effects; it is React-based, code-first.
- **Claude Code**: cloud sessions cannot reach a local Blender; to drive the owner's Blender, use Local mode or Remote Control.
- Claude itself cannot generate images or video; people combine it with image/video models and code-driven tools.

## Finding clients
Principle from the conversation: a **measurable, deterministic funnel**, not luck. Stated orders of magnitude (from sources read then): cold email reply rate about 3.4%; warm/referral win rates about 40–60% against 5–20% cold; Upwork win rate about 8%; freelancer marketplaces are hard for a new account. The recommended direction: targeted outreach to a defined niche, agencies with overflow work, and a tracked funnel with stage conversion rates.

Offers made in the conversation and not yet taken up:
- A lead-engine scaffold (list building, enrichment, outreach tracking).
- Portfolio pieces scoped and built end to end.
- A tracking sheet with funnel formulas.
- An agency shortlist and pitches.
- A GST and LUT (export of services) check with a chartered accountant.

## How Look Lab serves the business
1. Faster look-dev: match a client's reference frame, show three lighting options in their own location photos without a full Blender build.
2. Pitch material: relit mock-ups, outfit and cast variations, look boards with numbers behind them.
3. A taste library the owner accumulates across jobs, which later trains the decision router.
4. Something to demo: the tool is itself a differentiating portfolio item, provided its claims stay honest (`08-VALIDATION.md`).

## Constraints that come from the business
- Client photos and footage are confidential: no upload to third-party cloud without consent, and keep client names out of decision-model state text.
- Commercial licence of every model must permit client work.
- Cloud spend needs a hard cap.
