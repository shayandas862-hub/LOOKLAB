# 09 · Test 1b: does the code skeleton hold a moving human, 15 s, with the scene generated on top?

Written 2026-10-17, **before any clip was made**, at the founder's request after Test 1 (`../08-skin-test/`). The pass
marks below are not changed after results come in; a failure is reported as a failure.

**Not part of Look Lab** (D-LL-056). **A test, not for commercial use.** Clips stay out of git (`out/` is ignored)
until fal's and Wan's terms are checked.

## Why this test

Test 1 (one rigid shoe, 6 s) showed the code's depth video holds the shape (C: overlap 0.96–0.97, 3/3) where words and
pictures don't, but no way kept the brand orange. The founder's next question: does the same control hold a **moving
human** through a **long camera move**, with the **whole scene generated on top**, and how long does it take?

## The shot

Film 4's last 15 s (`../04-action/src/scenes/inside.js`, 72.94–87.94 s of the film): the camera pulls back from a
screen, the faceless runner steps out of it into 3D, the screens fly apart, eight worlds rise around a plaza, the
camera circles the runner, then cranes high above the ring. One continuous move, made in code.

**Faces:** the runner is film 4's faceless figure (a dark visor where a face would be). The prompt asks for a visor
helmet covering the whole face and "no visible face": a placeholder, no real person, no lookalike.

## Route C only, on fal

| | |
|---|---|
| Model | `fal-ai/wan-vace-14b/depth` (the same as Test 1's C) |
| Given | The code's exact depth video of the 15 s (`inputs/depth_16fps.mp4`, `preprocess` off) and the prompt in `run.mjs` |
| Settings | 720p, 16:9, 16 fps, 241 frames (15.06 s: fal's most for this model, read 2026-10-17), seeds 11, 22, 33 in that order |
| Takes | as many as the founder says yes to (1–3) |

## What's measured

1. **The runner held:** overlap of the runner in the clip with where the code puts it, every frame where the code's
   runner covers at least 0.3 % of the picture (median and worst tenth). `check.py`: a crop round the code's runner,
   outlined by the same background-removal model as Test 1 (rembg, isnet-general-use, MIT).
2. **One runner:** by eye, on the contact sheet (`sheet.py`): one figure all the way through, no extra or missing
   limbs, no extra people, no face. Holds / small drift / changes.
3. **Looks real:** the founder rates each clip 1–5 for "looks like real footage".
4. **Time (measured, not a mark):** for each request, the seconds from sending to the file being back, the part spent
   waiting in fal's queue, and so the seconds of waiting per second of video; also how long the code took to make the
   depth video.
5. **Cost:** what fal charged.

Not measured: brand colour (the runner carries none; Test 1 covers colour), the worlds' look beyond the rating.

## The pass marks (fixed now)

**First, the checker must work on this shot:** the code's own clean frames, made into a clip like a fal clip
(`out/CODE_itself.mp4`), must read **overlap median ≥ 0.90**. If it doesn't, the checker isn't fit for a human in
this scene: stop before spending, and report it.

A clip is **real and exact** when it meets all three:

| | Mark |
|---|---|
| Holds the runner | Median overlap ≥ 0.85 and worst tenth ≥ 0.75 (Test 1's marks) |
| One runner | "Holds" or "small drift" by eye |
| Looks real | The founder's rating ≥ 3.5 out of 5 |

**The idea holds for a moving human** if the one take is real and exact (with 1 take), or at least two are (with 2
or 3 takes).

**What each outcome means:**
- **Real and exact:** the skeleton carries over from a product to a person and a long move; next is the Fixer for
  brand colour (Test 1's gap), then Test 2 (blind "which would you ship").
- **Holds the runner, but not real:** the control works; the skin model is the weak part, as Test 1 suggested.
- **Doesn't hold the runner:** the control that worked on a rigid product doesn't carry to a moving human with this
  model; try one stronger control model once (as Test 1's README says) before giving up on code for people.

## Budget

fal's page, read 2026-10-17: $0.08 per video second at 720p, seconds counted at 16 fps. One take: 241 ÷ 16 = 15.06 s
× $0.08 = **$1.21**; three: **$3.62**. About $5.64 was left on fal after Test 1. Nothing is sent before the founder's
yes to the total.

## Run it

```sh
npm ci                                                     # @fal-ai/client (MIT)
(cd ../04-action && npm ci)                                # three.js and playwright-core for film 4's code
node ref.mjs 241 72.9375 > out/logs/ref.log 2>&1           # the code's frames: clean, depth, runner (about 17 min)
bash prep.sh                                               # inputs/depth_16fps.mp4 and out/CODE_itself.mp4
"$PY" -I check.py out/CODE_itself.mp4                      # calibration: must read ≥ 0.90
node run.mjs --dry                                         # what would be sent
NODE_USE_ENV_PROXY=1 node run.mjs --takes N > out/logs/run.log 2>&1
"$PY" -I check.py out/C_seed11.mp4                         # each take
"$PY" -I sheet.py                                          # out/sheet.png: the code and each take at 6 moments
```
`$PY` is a Python with rembg 2.0.85 and onnxruntime 1.31.0 (as in `../08-skin-test/RUNBOOK.md` step 1).
