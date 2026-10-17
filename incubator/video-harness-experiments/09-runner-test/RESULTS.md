# Test 1b · results

Run 2026-10-17 (times UTC) against the pass marks in [`README.md`](README.md), committed before any clip (`2a175a3`).
**A test, not for commercial use.** The clip stays out of git (`out/` is ignored) until fal's and Wan's terms are checked.

## Verdict: not real and exact. It misses the runner mark narrowly and fails "looks real" clearly.

| | Mark | Take 1 (seed 11) | |
|---|---|---|---|
| Checker fit for this shot | code's own clip ≥ 0.90 | **0.944** (worst tenth 0.833), 146/241 frames | ✓ (ran first, before any spend) |
| Holds the runner | median ≥ 0.85 and worst tenth ≥ 0.75 | **0.833** / 0.760, 146/241 frames | ✗ (median 0.017 under) |
| One runner | holds or small drift, by eye | holds at the 6 moments of `out/sheet.png` | ✓ |
| Looks real | ≥ 3.5 / 5 | **1** (the founder: "very very bad") | ✗ |

With one take, the idea needed that take to be real and exact. It isn't, so **the idea doesn't hold for a moving
human with this model**. By the marks it fails both ways: the runner mark (narrowly) and realism (clearly).

**Where the runner slipped** (overlap by part of the shot, median and lowest):

| Frames (16 fps) | Film 4 time | What happens | Measured | Median | Lowest |
|---|---|---|---|---|---|
| 0–59 | 72.9–76.6 s | screens; the runner steps out | 11 | 0.916 | 0.169 (the step-out frame) |
| 60–119 | 76.7–80.4 s | walks into the plaza | 60 | 0.905 | 0.778 |
| 120–179 | 80.4–84.1 s | the camera circles the runner | 60 | 0.795 | 0.678 |
| 180–240 | 84.2–87.9 s | the crane starts (runner shrinks below 0.3 % and stops being measured) | 15 | 0.800 | 0.745 |

The checker's own ceiling on this shot is lower than Test 1's (the code itself reads 0.944 here, 0.995 on the shoe), so
the take reaches about 88 % of what the checker can read. Reported as context only; the mark doesn't move.

**By eye** (6 moments, beside the code): the camera, the screen wall, the runner's place and pose, and the ring of
worlds at the end all line up with the code. One runner throughout, white suit and dark visor, no face, no text. The
look is a dark blue CG render, not footage: the screens are empty, the worlds are dark shapes, the floor carries grid
lines.

## Why it failed (diagnosis after the result; the verdict above stands)

**The runner mark.** `diagnose.py` looks at the orbit frames (6.25–11.6 s of the clip), where the overlap dropped:

| What | Orbit frames |
|---|---|
| The code's runner body that the clip's outline misses | 2–7 % |
| Extra outline beyond the code's runner | 3–35 % of the runner's area |
| Of that extra, lying away from the body (over 12 px off) | 53–96 %, mostly 75–96 % |

So in the orbit the generated runner's body stays where the code puts it; the shortfall comes from the outline model
(rembg) taking in a patch of the glowing grid the AI painted on the floor beside the runner. In the walk (before
6.25 s) the outline sits on the code's runner within 1 % of its height (overlap 0.91–0.95). This is a limit of the
checker on a busy generated scene, found after the result: the take still fails the mark as measured. A stricter
outline (for example, only the part touching the code's runner) has to be written down before any next run, not
applied to this one.

**The look (1 out of 5).** Seen beside the code: a dark blue CG render, not footage; the screens are empty, the worlds
are dark shapes, the floor carries glowing grid lines. Not tested, so only candidates: this model's quality (Wan
2.1-based VACE); a crisp, low-poly synthetic depth video leading it towards a CG look; one prompt asking for eight
worlds at once; the longest length the model allows (241 frames).

## The request (from `out/runs.json`)

| | |
|---|---|
| Endpoint | `fal-ai/wan-vace-14b/depth`, 720p, 16:9, 241 frames at 16 fps, seed 11, `preprocess` off |
| Request id | 01a14b69-fb07-73f2-80f4-1a179a210823 |
| Sent | 19:49:58 |
| Back | 494 s later: 58 s in fal's queue, about 436 s generating |
| File | 8.3 MB, 1280×720, 16 fps, 241 frames (15.06 s): no in-between frames added |

## Time (the founder asked for it)

| Step | Time | Per second of video |
|---|---|---|
| The code's frames: clean, depth and runner passes, 241 frames (cloud software renderer) | 12 min 06 s | 48 s (all three passes) |
| Upload of the depth video to fal | 0.8 s | — |
| fal, sending to file back | 8 min 14 s | **32.8 s** (28.9 s generating, 3.9 s queued) |
| Checker (calibration, then the take) | 3 min 11 s, then 3 min 07 s | about 12 s each |

## Cost

fal's price, read 2026-10-17: $0.08 per video second at 720p, seconds counted at 16 fps. 241 ÷ 16 = 15.06 s →
**$1.21** for the one take (the founder chose to go; one take, the smaller option). Together with Test 1's $4.36:
**$5.57** spent on fal in total. What fal actually charged is read by the founder on fal's billing page.

## Deviations

None to the pass marks, prompt, seed or settings. The founder's realism answer was in words ("very very bad"),
recorded as 1 out of 5; changed if the founder gives another number.

## What it means

- **The control half:** through the step-out and the walk, the runner held at about 0.91; during the
  orbit it slipped to about 0.80. On a rigid shoe (Test 1) the same model held at 0.96–0.97. A moving human in a long
  move is harder, and this model doesn't quite carry it.
- **The skin half:** this model's surface is the clear failure: Test 1 missed the brand colour, and here the founder
  rates the look 1 out of 5.
- **README's outcome:** the nearest is "doesn't hold the runner, and not real": try **one stronger control model
  once** with the same depth video, the same marks and the same checker, before deciding about code for people.
