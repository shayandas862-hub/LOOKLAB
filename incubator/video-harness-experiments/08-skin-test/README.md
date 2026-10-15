# 08 · Test 1: does a code skeleton make generated video more exact, at the same realism?

Written 2026-10-15, **before any clip was made**. The pass marks below are not changed after results come in; a
failure is reported as a failure.

**Not part of Look Lab.** Nothing here is imported, built, tested or served by Look Lab (D-LL-056).
**A test, not for commercial use.** Outputs stay out of git (`out/` is ignored) until fal's and Wan's terms for
commercial use are checked.

## The hypothesis being tested

If the parts that must be exact (here: where the shoe is, its outline, how it turns, the camera's move) come from
code, and a generative model only paints the surface, the result holds the product far better than generating
from words or from pictures, and looks about as real.

## The test

One shot: the shoe on the turntable from ONE SENTENCE, 6 seconds, the code's own move (`../07-grok-test/ref/`).
Three ways to make it, on fal, in the same model family, at the same settings (720p, 16:9, 16 fps, 97 frames,
the same words for the look):

| Way | Model on fal | What it's given |
|---|---|---|
| **A · words only** | `fal-ai/wan/v2.2-a14b/text-to-video` | The prompt, with the scene and the move described in words |
| **B · pictures** | `fal-ai/wan/v2.2-a14b/image-to-video` | Our first and last frames (`S3_shoe.png`, `S3_shoe_end.png`) and the prompt. This is the Grok route |
| **C · skin on skeleton** | `fal-ai/wan-vace-14b/depth` | The code's exact depth video of the 6 s (`preprocess` off, so it's used as given) and the prompt. No reference picture: a 3D render as reference pins the 3D look, as Grok showed |

Three takes each (seeds 11, 22, 33): 9 clips. Note: C's model is Wan 2.1-based VACE, A and B are Wan 2.2.

**The prompt for the look** (all three):
> Real product footage of a premium white running shoe on a slowly turning black turntable in a dark studio. White
> engineered knit mesh upper, white leather overlays with fine stitching, glossy orange rubber zig-zag overlays on
> the side, a white foam midsole with a thin orange stripe, dark rubber outsole, white laces. A thin orange LED
> ring glows around the turntable's edge; warm orange light on the back wall; soft reflections on the glossy
> black floor. Photoreal, sharp, shot on a 50 mm lens. No text, no logos, no people.

A also gets the move in words: *"The camera starts at the shoe's side, toe to the left, and glides gently round
while the turntable turns, ending on a three-quarter front view, toe to the right."*

## What's measured (the same checker as the Grok test, `../07-grok-test/check.py`, matched by time)

1. **The skeleton held:** overlap of the shoe in the clip with where the code puts it, every frame (median and the
   worst tenth). The shoe is outlined by a background-removal model (rembg, isnet-general-use, MIT), minus the
   code's turntable. Calibrated before any Test 1 clip: the code's own shot scores 0.995 (worst tenth 0.988);
   Grok take 1 (our 3D render moved, no new skin) 0.90 (0.83); Grok take 2 (asked for a real skin) 0.57 (0.43).
2. **On brand:** the orange parts' colour against the code's frame at the same moment, where they sit where the
   code puts them (ΔE00, median, with how many frames could be measured).
3. **Looks real:** the founder (and anyone else willing) rates each clip 1–5 for "looks like real footage", with
   the clips shuffled and unlabelled.
4. **Steady:** flicker, and the shape by eye (does the shoe stay one shoe).
5. **Cost and time:** what fal charged and how long each took.

## The pass marks (fixed now)

A clip is **real and exact** when it meets all three:

| | Mark |
|---|---|
| Holds the skeleton | Median overlap ≥ 0.85 and worst tenth ≥ 0.75 |
| Keeps the brand | Orange parts within a median 5 ΔE00 of the code's, measured on at least 80 % of frames |
| Looks real | Average realism ≥ 3.5 out of 5 |

The hypothesis **survives this shot** if at least two of C's three takes are real and exact, **and** no take of A
or B is. If A or B also gets there, code isn't needed for this kind of shot, and the hypothesis fails here.

*Revised 2026-10-15, before any Test 1 clip:* the first version asked C to beat A and B by 0.15 in overlap. Once
the overlap measure was calibrated, that turned out impossible whenever a way holds the skeleton by staying 3D (Grok
take 1: 0.90), while being no use, since it isn't real. The question that matters is whether code is needed to get
real and exact together, so the mark asks that. The thresholds come from the calibration above, not from any Test 1
result.

**What each outcome means:**
- **C real and exact, A and B not:** go to Test 2: show A, B and C blind to brand and production people and ask which they'd ship.
- **C isn't exact:** the code adds no control with this model. Try one stronger control model once (for
  example NVIDIA's Cosmos Transfer, which takes depth, edges and segments), and if that fails too, stop adding code
  for generation and keep code only for what it already does well (layout, type, logos, timing, assembly).
- **C is exact but not real enough:** the skeleton works and the skin is the weak part; try a better skin model.
- **A or B is also real and exact:** prompting or pictures are enough for a shot like this; code isn't needed here.

## Budget

Checked 2026-10-15 from fal's listing: VACE 14B at $0.08 per video second at 720p (so about $0.48 a take). Wan
2.2's text- and image-to-video prices weren't checked; **all prices need confirming on fal before running**. The
runner stops at 9 requests and logs every request; a cap of **$10** for the whole test is proposed and needs the
founder's yes.

## Run it (needs `FAL_KEY` in the environment's settings, then a new session)

```sh
cd "incubator/video-harness-experiments/08-skin-test"
npm install
bash prep.sh                       # inputs: the code's depth video at 16 fps (97 frames), first and last frames
node run.mjs --dry                 # shows every request without sending anything
node run.mjs                       # makes the 9 clips into out/, logs out/runs.json
for f in out/*.mp4; do
  <venv with rembg>/bin/python -I ../07-grok-test/segment.py "$f"      # outlines for the overlap reading
  MAP=full python3 -I ../07-grok-test/check.py "$f" ../07-grok-test/kit/S3_shoe.png ../07-grok-test/kit/S3_shoe_end.png ../07-grok-test/ref
done
```
