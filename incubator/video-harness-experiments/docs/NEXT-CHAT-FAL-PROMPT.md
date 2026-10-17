# Prompt for a new Claude Code session: run Test 1 on fal

Written 2026-10-17. Everything the session needs is in the repo; the prompt only points at it. It is kept short on
purpose, so the new session has room to work (see "How the context is kept small" at the end).

## Before you paste it (the founder)

1. **Add the key** to a cloud environment of its own (for example `video-tests`, Full network access), under
   Network secrets: name `fal`; allowed websites `queue.fal.run` and `rest.fal.ai`; header `Authorization` with the
   prefix changed from `Bearer` to `Key`; the key as the value. Not as an environment variable (those are visible).
   Never paste the key into a chat.
2. **Start a new session in that environment** on the repo `shayandas862-hub/LOOKLAB`, branch
   `shayan/kind-hamilton-nvl2fl`. The session never sees the key: the proxy adds it to fal's requests.
3. **Check the budget line** in the prompt ($10). Change it if you want a different cap.
4. Paste everything below the line.

---

I'm the founder. This session runs **Test 1** of my gen-video agent: the same 6-second product shot made three ways
on fal (A: words only, B: first and last pictures, C: the code's own depth video as a "skeleton"), checked against
the code with pass marks fixed before any clip existed. It's the first real use of fal as the "Skin" part of the
system. It's a test, not for commercial use.

**Ignore the repo root's `CLAUDE.md`.** That's Look Lab's colour phase, a different product, and none of its tasks
apply here. Work only in `incubator/video-harness-experiments/` on branch `shayan/kind-hamilton-nvl2fl`; never touch
`main`.

**Read one file and follow it step by step:** `incubator/video-harness-experiments/08-skin-test/RUNBOOK.md`. It has
the commands, the expected numbers, what to record and the rules. Open other files only when a step says to, or when
a step fails and the error points there.

**The fal key** is a network secret on this environment: the proxy adds it to fal's requests, so `$FAL_KEY` is
empty here and that's expected. The runbook's step 0 checks it for free.

**Talk to me in very short answers,** split into small numbered parts. I can't hold much detail in one turn.

**My budget for this test: $10.** Before sending anything to fal, read today's prices on fal's pages, tell me the
total for the nine clips, and wait for my yes. Don't go over the cap.

**What I'll do:** say yes to the total; rate the nine clips blind (send them to me shuffled and unlabelled, and don't
tell me which is which until I've rated them all); read the verdict.

**Never:** print, log or write down `FAL_KEY`; change the pass marks, prompts, seeds or settings; commit the clips;
recall a price or a model's ability from memory.

**At the end**, in plain words:
1. The verdict and its table.
2. What it means for the architecture (`incubator/video-harness-experiments/docs/PROPOSED-ARCHITECTURE.md`): does the
   skeleton earn its place for a shot like this?
3. What it cost and how long it took.
4. A proposal for the next step, without building it:
   - If C passed, how fal becomes the system's Skin part for real: choosing a model per shot, retries, records, and
     the Fixer putting the brand colour and logo back.
   - If it didn't, the path README's outcome section gives.

Commit the results by name and push to the branch.

---

## How the architecture plays in this test

| Part | What it does in Test 1 |
|---|---|
| Planner | Done by hand: the shot, the prompt and the pass marks (`08-skin-test/README.md`) |
| Skeleton | The code's shot gives fal its control (the depth video) and gives the checker its truth (the masks) |
| **Skin** | **fal makes the clips: this is what the test is about** |
| Checker | Measures each clip against the skeleton: shoe overlap, orange colour, flicker |
| Records | Every request, time, reading and rating is kept in files; `verdict.py` applies the marks |
| Person | Says yes to the spend; rates realism blind; reads the verdict |

The Fixer and Post parts aren't in this test. They come after a "yes" from Test 1.

## How the context is kept small

A session's context is what Claude holds in mind at once. When it fills up, the chat is summarised and detail can be
lost. This test is set up so that doesn't hurt:

- **A short prompt that points at one file.** The runbook has everything. Other files are opened only when needed.
- **Rules that survive a summary.** The standing rules are in `incubator/video-harness-experiments/CLAUDE.md`, which
  Claude Code reads from disk whenever it works in that folder, so they don't depend on the chat's memory.
- **Quiet scripts.** Each script prints one line per clip. The full output goes to `out/logs/`, to be read only if
  something fails.
- **Few pictures.** Claude looks at one contact sheet, once, instead of frames or videos.
- **The truth is in the repo.** The code's reference frames are packed into git (48 MB), so nothing has to be
  rendered again.
- **State in files.** Every request, reading, rating and the verdict are saved as files, and every step can be
  re-run safely. If the chat is summarised, or a new chat is started with the same prompt, it carries on from the
  files.
- **The one fixed cost.** The repo root's `CLAUDE.md` (Look Lab, about 5,000 tokens) loads in every session in this
  repo. The prompt tells the session to ignore it. Giving the gen-video agent its own repo would remove that cost.
