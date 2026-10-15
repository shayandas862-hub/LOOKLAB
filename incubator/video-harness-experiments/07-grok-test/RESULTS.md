# Grok test results

Checked by `check.py` and `report_extra.py` against the pass marks in `README.md`. The clips themselves, the code's
reference frames and the comparison pictures stay out of git (`.gitignore`): Grok's output terms aren't confirmed.

## S3 take 1 · the shoe, 6 s, first and last frame given (checked 2026-10-15)

**The file:** 464×688 (vertical), 24 fps, 6.04 s, 145 frames, no sound. Its metadata carries a signed "Signature"
comment (a provenance mark). Grok took the middle strip of our 16:9 frame (pixels 595–1323 across, full height),
so the toe is cut off at the start.

| # | Check | Result | Mark |
|---|---|---|---|
| 1 | It starts from our frame | First-frame likeness 0.999 (the last frame against our end frame: 0.994) | **Pass** |
| 2 | The stripe stays on brand (as written: against the start frame) | Median 9.1, worst tenth 22.2 ΔE00 | **Fail** |
| 3 | The shoe keeps its shape (by eye) | The design holds through the whole turn: stripes, laces, heel loop, toe. Lace bars and the toe's edges shift a little mid-turn | **Small drift** (usable with work) |
| 4 | No flicker | Worst 0.59 % | **Pass** |
| 5 | Nothing that shouldn't be there | No text, logos, faces or visible watermark | **Pass** |
| 6 | The file | As above | Recorded |

**Why mark 2 failed, and why that mark was the wrong one.** The shot's own light changes as the shoe turns, and a
sweep light crosses the shoe every 2 s. The code's own frames drift from their start frame by a median 21.8 and a
worst tenth 38.7 ΔE00, so this mark would fail the code itself. It is reported as failed, as written; it is replaced
for later clips (below), not loosened for this one.

**Extra readings (not marks):**
- **Against the code at the same moment,** on the 83 of 145 frames where the stripe sits where the code puts it
  (frames 2–65 and 126–144): median 4.6, worst tenth 17.1 ΔE00. The large gaps fall where the code's sweep light
  crosses the shoe: Grok kept the first frame's lighting and didn't reproduce the moving light.
- **Timing:** Grok's turn runs ahead of the code's in the middle (about 2.7–5.2 s), then meets it again at the
  given last frame.
- **Shoe overlap** with where the code puts it: median 0.63 (rough: the shoe is found by colour).

**What it shows:**
1. Given both ends, Grok follows the path and keeps the design; the result is steady (no flicker).
2. It kept our CG look rather than making it photoreal: the two frames pin the style.
3. It doesn't reproduce lighting changes that aren't in the frames it's given.
4. The vertical crop and the low resolution are settings to change on the next take.

## Mark 2 for later clips (written 2026-10-15, after take 1 and before any later clip)

The stripe's colour against **the code's own frame at the same moment**, on frames where the stripe sits where the
code puts it (cover ≥ 0.9): median ≤ 5 and worst tenth ≤ 10 is a pass; median ≤ 10 is usable with work; otherwise a
fail. The number of frames it was measured on is always reported.
