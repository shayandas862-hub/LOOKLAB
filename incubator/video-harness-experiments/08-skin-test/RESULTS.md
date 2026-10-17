# Test 1 · results (interim: realism ratings pending)

Run 2026-10-17 (times UTC) from [`RUNBOOK.md`](RUNBOOK.md), against the pass marks in [`README.md`](README.md),
fixed 2026-10-15 before any clip. **A test, not for commercial use.** The clips stay out of git (`out/` is ignored)
until fal's and Wan's terms are checked.

**Status:** all 9 clips made and measured. The blind realism ratings are pending (the founder named one clip as the
favourite but couldn't score all nine; a neutral rater is being asked), so `verdict.py` reads "not decided yet".
Every clip already misses the colour mark, so no clip can be real and exact whatever the ratings (§4).

## 1. Prices read (fal's model pages, 2026-10-17)

| Endpoint | Price |
|---|---|
| `fal-ai/wan/v2.2-a14b/text-to-video` (A) | $0.08 per video second at 720p ($0.06 at 580p, $0.04 at 480p) |
| `fal-ai/wan/v2.2-a14b/image-to-video` (B) | the same |
| `fal-ai/wan-vace-14b/depth` (C) | the same |

All three pages: "Video seconds are calculated at 16 frames per second." Total for 9 clips of 97 frames:
9 × 6.0625 s × $0.08 = **$4.37** (worst case if fal's default in-between frames were billed: $9.36). The founder said
yes; cap $10.

## 2. Checker calibration (step 3)

The code's own shot as a fal-like clip: **overlap 0.995 / worst tenth 0.988, colour ΔE00 median 0.68 on 97/97 frames,
flicker worst 6.32 %**, exactly as rehearsed. The code's sweep light reads as 6.3 % flicker, the baseline for flicker.

## 3. Requests (from `out/runs.json`)

All 9 succeeded on the first try: no errors, no retries.

| Clip | Endpoint | Started | Time | File | Frames / fps | fal request id |
|---|---|---|---|---|---|---|
| A_seed11 | text-to-video | 17:40:51 | 72 s | 3.05 MB | 193 / 32 | 01a14af3-c3a3-7453-be41-f9f273118e35 |
| A_seed22 | text-to-video | 17:42:04 | 57 s | 2.90 MB | 193 / 32 | 01a14af4-dfb4-7403-9a87-ef86c5be2923 |
| A_seed33 | text-to-video | 17:43:02 | 67 s | 2.27 MB | 193 / 32 | 01a14af5-c1c2-7351-b006-6d2351dfc6cc |
| B_seed11 | image-to-video | 17:44:12 | 254 s | 1.81 MB | 193 / 32 | 01a14af6-d1bc-7a33-939b-6f9d98cf1dde |
| B_seed22 | image-to-video | 17:48:26 | 225 s | 1.68 MB | 193 / 32 | 01a14afa-b41f-7bc2-a141-1acd19971001 |
| B_seed33 | image-to-video | 17:52:11 | 293 s | 1.54 MB | 193 / 32 | 01a14afe-2292-7390-b616-452f6ac6266e |
| C_seed11 | wan-vace-14b/depth | 17:57:06 | 536 s | 1.59 MB | 97 / 16 | 01a14b02-a2bf-7cd2-a11e-ebe415f7e0c0 |
| C_seed22 | wan-vace-14b/depth | 18:06:03 | 136 s | 1.31 MB | 97 / 16 | 01a14b0a-d2ec-7822-b9ef-b5a87038f8f9 |
| C_seed33 | wan-vace-14b/depth | 18:08:19 | 97 s | 1.39 MB | 97 / 16 | 01a14b0c-e96e-7ce1-9dd0-f1345dbaacd5 |

Average per clip: A 65 s, B 257 s, C 256 s. C_seed11's 536 s is an outlier; the log doesn't split queue time from
run time, so its cause isn't known.

## 4. The verdict table (step 9, ratings pending)

Marks: overlap median ≥ 0.85 and worst tenth ≥ 0.75; colour median ≤ 5.0 ΔE00 on ≥ 80 % of frames; realism ≥ 3.5.

| Clip | Overlap median / worst tenth | Shape | Colour ΔE00 median (frames measured) | Colour | Flicker worst | Realism | Real and exact |
|---|---|---|---|---|---|---|---|
| A_seed11 | 0.418 / 0.338 | ✗ | 24.51 (163/193, 84 %) | ✗ | 6.35 % | pending | no |
| A_seed22 | 0.637 / 0.568 | ✗ | 17.12 (193/193) | ✗ | 2.99 % | pending | no |
| A_seed33 | 0.661 / 0.535 | ✗ | 19.60 (177/193, 92 %) | ✗ | 3.23 % | pending | no |
| B_seed11 | 0.795 / 0.551 | ✗ | 15.71 (193/193) | ✗ | 1.63 % | pending | no |
| B_seed22 | 0.767 / 0.545 | ✗ | 18.99 (193/193) | ✗ | 1.45 % | pending | no |
| B_seed33 | 0.710 / 0.490 | ✗ | 12.90 (193/193) | ✗ | 0.71 % | pending | no |
| C_seed11 | 0.973 / 0.853 | ✓ | 9.56 (97/97) | ✗ | 3.67 % | pending | no |
| C_seed22 | 0.961 / 0.949 | ✓ | 8.26 (97/97) | ✗ | 0.84 % | pending | no |
| C_seed33 | 0.971 / 0.961 | ✓ | 11.79 (97/97) | ✗ | 0.37 % | pending | no |

| Way | Overlap median (mean of 3) | Worst tenth | Colour ΔE00 | Shape passes | Colour passes |
|---|---|---|---|---|---|
| A · words | 0.572 | 0.480 | 20.41 | 0/3 | 0/3 |
| B · pictures | 0.757 | 0.529 | 15.87 | 0/3 | 0/3 |
| C · skeleton | **0.968** | **0.921** | 9.87 | **3/3** | 0/3 |

**What the numbers say:**
- **The skeleton holds the shape:** all three C takes pass (0.96–0.97, worst tenth 0.85–0.96); no A or B take does.
- **No clip keeps the brand orange:** all nine miss 5.0 ΔE00. C is closest (8.26–11.79), then B, then A. The best
  take (C_seed22) is 3.26 above the mark.
- **So the hypothesis, as written, does not survive this shot:** it needs two C takes real and exact, and none can be.
  It fails on colour, not on shape. The formal verdict waits for the ratings.
- The near-miss rule (re-render the exact beauty frames if a C take lands within 0.2 of 5.0) doesn't apply.
- The known risk written before the run (the code's sweep light makes its orange brighter on some frames) may
  explain part of the colour gap, not all of it: the mark uses the median, and C reads 8–12.

## 5. Shape by eye (step 8)

Pending: the contact sheet is made and looked at after the ratings, so the labelled sheet can't unblind them.

## 6. Deviations and observations

- **No changes** to the prompts, seeds, settings or pass marks; no input field renamed.
- **fal's defaults doubled A's and B's frames.** The Wan 2.2 endpoints add one in-between frame by default (film
  interpolation; `run.mjs` doesn't set it, so it wasn't changed): A and B came back as 193 frames at 32 fps, C as 97
  at 16 fps. All are 6.03–6.06 s; the checker matches frames by time. The extra frames weren't billed (§7).
- **The checker was slower than the runbook's guess:** 51 min 04 s for 9 clips (about 5.7 min a clip, against 1–2).
  A and B have twice the frames; not measured further.
- **Ratings:** the founder couldn't score all nine. Nothing was scored on their behalf; the blind key stays hidden.

## 7. Cost and time

| | |
|---|---|
| Added to fal | $10.00 (the balance had run out before the run) |
| Balance after (read by the founder on fal) | $5.64 |
| **Spent** | **$4.36**, matching the $4.37 estimate: about $1.46 each for A, B and C |
| Install, unpack, calibrate | about 6 min |
| Generate 9 clips | 29 min 07 s (17:40:50 → 18:09:57) |
| Check 9 clips | 51 min 04 s (18:10:08 → 19:01:12) |

## 8. What it means, and the next step

README's outcomes don't name this split exactly: C is exact in **shape** (3/3, far ahead of B's 0.76 and A's 0.57)
but not in **brand colour** (0/3). The shape half of the bet is supported for a rigid product; the colour half isn't,
with this model. The ratings will say whether C at least looks real: if it does, the nearest outcome is "the skeleton
works, the skin is the weak part", and the colour is a job for the Fixer (brand colour put back through the code's
masks) or a better skin model; if it doesn't, the skin model is the weak part on both counts.

**The founder's next step (2026-10-17):** a 15 s shot of a 3D human, route C only, from the marketing work's human
model (on branch `shayan/eloquent-fermi-bggugr`, being pushed from that session). Before any spend: its depth
video from the code, its own pass marks written first, the faces rule (only people who agreed, no lookalikes), and
the founder's yes to its total. Planned, not built.

**Still to do for Test 1:** the ratings, the contact sheet, `verdict.py`, then this file's final version.
