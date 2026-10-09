# P-LL-002 · Look Lab as an end-to-end suite: research, analysis, then a generation plan

**Status: plan, not yet a decision.** Written 2026-10-08 from the founder's message of that day. Nothing here is built,
scheduled or allowed to interrupt P4.5. When the founder confirms the direction, it becomes a vision entry
(`docs/VISION.md` §2: what caused it, what it forces, the trade-off) and its phases go on the phase card; until then
the vision in `docs/VISION.md` §1 stands as written.

## 1 · What the founder asked for (2026-10-08, in their words, lightly cut)

> "I want to make Look Lab an end-to-end suite: research about content, take their details, take the technical
> details, images or videos, make the full analysis, and the next one is having a generating plan, but that is later.
> Now only do this": read `Shayan733/visual-dashboard`, take the useful code ("take a niche [video] from YouTube,
> analyse it", and the visual dashboard part, the infinite canvas) to be integrated later; for now clone it into a
> side folder not connected to the actual code, and update the logs.

## 2 · The suite as three stages

| Stage | What it does | What exists today |
|---|---|---|
| 1 · Research | Find content in a niche (e.g. YouTube), pull each item's public details (title, channel, numbers, dates, description), choose what to study | Nothing in Look Lab. Nothing in visual-dashboard either: its `das-story-engine/src/integrations/README.md` only names "YouTube data pull" and "Gemini video analysis" as future adapters |
| 2 · Analysis | Technical breakdown of the chosen images or videos: cuts, palette, tints, contrast, light, lens, framing, colour, what to capture and grade | Look Lab P2–P4.5: this is the product today |
| 3 · Generation plan | Turn the analysis into a plan to make our own version | Look Lab's adapt, plan and set sheet cover the shoot side; nothing yet for the writing side (the Das Story Engine in `incubator/visual-dashboard/das-story-engine/` is a parked start) |

A board (the infinite canvas) would hold all three: references found, their breakdowns and the plans made from them,
side by side and linked. The parked canvas is in `incubator/visual-dashboard/` (D-LL-056); what is reusable is listed
in `incubator/README.md`.

## 3 · What this must not break (from the rules as they stand)

- **Footage stays local** (hard rule 7, D-LL-039): research pulls metadata; downloading a video someone else made is a
  licence and terms-of-service question to settle before it is built (hard rule 8: unclear means no). Today a
  reference enters only by the person importing a file they have.
- **Models choose words, not numbers** (D-LL-003): a model may summarise or rank research results; every technical
  number still comes from T0 maths.
- **Every feature is an action** (AD-LL-002): research and planning would be new action domains, not a side app.
- **The M1 budget** (hard rule 4): a canvas and a research pull are measured like everything else.

## 4 · Open questions for the founder (not to be answered before P4.5 ends)

1. Where does the YouTube analysis pipeline live today? It is not in `visual-dashboard` (any branch). The `das-analyst`
   skill reads Gemini output and a Supabase `film_analysis` table: is that the pipeline meant?
2. Research source: YouTube Data API (needs a key, quota and terms) or links the founder pastes by hand?
3. Does the canvas replace a Look Lab screen, or become a new one (a "Board")?
4. Is the Das Story Engine part of Look Lab's generation plan, or does it stay its own tool?
5. Firebase sign-in and sync: the canvas uses them; Look Lab is local-first. Proposal: drop them.
