# Test 2 · S3 (the 360° turn) · results, 2026-10-18

Everything done on 2026-10-18 on the founder's Mac (M1, 8 GB), with the true numbers. Plan, marks and every decision in
order: [`PLAN.md`](PLAN.md) §11. **A test, not for commercial use.** Generated clips stay out of git (`out/` is ignored)
until the models' terms are read. "Founder" = the founder's own words or numbers; "measured" = read from a file, log or
fal; "calculated" = fal's published unit price × our sizes, not a bill.

## 1. The answer in five lines
1. **Why Tests 1 and 1b looked fake: the model never had a picture of the look.** With a real-looking photo for the look
   and our previs for the motion, all three models made real-looking food; Wan VACE with depth and words alone scored 1 / 5.
2. **The motion transfers.** LTX, Seedance 2.5 and Wan 3.0 all followed the previs turn: same direction, the rows facing
   as in the previs at each sampled moment, back to the start view at the end (by eye, six moments each).
3. **Seedance 2.5 is the best of the three** (founder: "best so far"; "more constant in colour" than Wan 3.0). LTX morphs
   fruit mid-turn (founder).
4. **Not proved: exactness by numbers.** No checker that passed its self-test has measured any clip; the plan's "real and
   exact" verdict can't be given yet. One take per model, so luck isn't ruled out.
5. **A usable 5 s shot costs ≈ $2.65 on Seedance 2.5 or ≈ $0.95 on Wan 3.0** (720p, previs clip included).

## 2. The takes
| | M1 · LTX render-to-real | M2 · Seedance 2.5 reference | M3 · Wan 3.0 reference |
|---|---|---|---|
| fal endpoint | `fal-ai/ltx-2.3-quality/render-to-real` | `bytedance/seedance-2.5/us/reference-to-video` | `alibaba/wan-3.0/reference-to-video` |
| Request | `01a14cdb-92fb-7b53-9a5b-9dc891ce998b` | `01a14ce8-1103-7e31-8900-b7a4b859f87b` | `01a14d03-56e0-7031-a394-e216353b3289` |
| Inputs | previs clip + still as frame 0, `intensity` strong-v2 | @Video1 previs clip, @Image1 still | Video 1 previs clip, Image 1 still |
| Queue / generating (measured) | 59 s / 187 s | 1 s / 147 s | 1 s / 208 s |
| Output (measured) | **704×1152** (centre crop), 24 fps, 108 frames, 4.5 s, 1.83 MB | **720×1280**, 24 fps, 121 frames, 5.04 s, 1.39 MB | **720×1280**, 30 fps, 150 frames, 5.0 s, 7.28 MB |
| Cost | ≈ $0.21 calculated | ≈ $2.65 calculated | ≈ $0.95 calculated |
| Turn, by eye (six moments) | follows the previs | follows the previs | follows the previs |
| Founder | "kept the full motion right but morphed some in the middle the fruits" | "best so far" | "similar, the motion is okay"; Seedance "more constant in colour" |
| Against the marks | **fails** "no morphing" | realism: words, no number · overlap: not measured | realism: words, no number · overlap: not measured |

All three used the same still (`luna6_1`, chosen by eye) and the same previs clip (`out/passes/s3/beauty_24fps.mp4`: 720×1280,
24 fps, 108 frames, 4.5 s). Mid-turn, Seedance and Wan both drew the previs's own topping models (for example its whole
strawberries on the far side of the row) and returned to the still's look at the end. LTX's 704×1152 is a centre crop:
frame 0 against the still reads a mean difference of 5.6 for a centre crop and 13.1 for a stretch (best offset 68 px;
centre 66 px).

## 3. The stills (step 1, done outside fal, $0)
| | |
|---|---|
| Input | `s3_frame_7.5s.png` (the previs's clean frame at 7.5 s) + the prompt in PLAN.md §6 |
| Made by the founder | three in "Luna 6" (`out/stills-in/luna6_1…3`, 941×1672, 9:16) and one in ChatGPT ("GPT 6.1 Sol"; a "GPT 6 Astra" image looked identical to it and wasn't saved to disk) |
| Model | one image model behind both, by the founder's understanding; name and terms unconfirmed |
| Looks real | pass, founder: "all look good" (no number) |
| Layers and topping rows in order | pass for all four, by eye |
| Keeps the bowl (overlap ≥ 0.85) | not measured; by eye each still's bowl sits a little higher than the code's (`out/stills/outline_sheet_luna6.png`) |

## 4. The checker (free, and the weak part)
| Outline model | Self-test on the code's own 108 frames (mark: median ≥ 0.90) | Time | Model on disk |
|---|---|---|---|
| `isnet-general-use` | **fail:** median 0.82, worst tenth 0.805, lowest 0.797 | 206 s | 170 MB |
| `u2net` | **pass** on the median: 0.95; but worst tenth 0.805, lowest 0.801 (frame 0) | 63 s | 168 MB |
| `birefnet-general-lite` | three spot frames 0.988, 0.994, 0.993; the full run **stopped by the founder** at 25 of 108 frames (about 12 GB in Python, seen by the founder) | — | 214 MB |

Why isnet failed: it leaves out the bottom açaí layer seen through the glass (16–20 % of the code's bowl missed on frames
0, 46 and 80; under 0.2 % added); not the turntable subtraction (the masks don't overlap), not the threshold (16–128: best
0.837). And even a passing outline checker can't see a fruit morphing **inside** the bowl's outline. Rule adopted: every
local job runs one frame first under a memory meter; above 1.5 GB it doesn't run here.

## 5. Money (true figures where the founder gave them)
| | |
|---|---|
| fal balance before today (founder's figure, after Tests 1 and 1b) | $4.43 |
| After M1 + M2 (founder) | **$1.71**, so M1 + M2 **actually cost $2.72** (calculated $2.86) |
| M3 (Wan 3.0) | ≈ $0.95 calculated; real figure = the founder's next balance (expected ≈ $0.76) |
| Today on fal | ≈ **$3.67** ($2.72 actual + ≈ $0.95) |
| Tests 1 and 1b (earlier) | $4.36 + $1.21 = $5.57 |
| **fal so far, all tests** | ≈ **$9.24** |
| Stills, checker, research, previs | $0 in money |

Unit prices, read 2026-10-18 (fal's pricing API and model pages): Seedance 2.5 reference **$0.0214 per 1,000 tokens**,
tokens = width × height × (input s + output s) × 24 / 1024, × 0.6 with a video input (our take: ≈ 206,100 tokens → $2.65;
≈ $0.53 per finished second); LTX **$0.0024075 per MP** of output (704 × 1152 × 108 ≈ 88 MP); Wan 3.0 reference **$0.10/s at
720p** on its page (input seconds billed too; the pricing API lists a $0.05/s base unit), Prime $0.14/s; Seedance 2.0 Fast
reference $0.14515/s with a video input; Nano Banana Pro edit $0.15 per image.

**Hidden costs, measured:** disk ≈ 1.6 GB (checker environment 461 MB, outline models 552 MB, reference videos 329 MB,
`10-cafe-ad/out` 184 MB, `node_modules` 47 MB, yt-dlp 38 MB); one memory spike (the BiRefNet run); the founder's time.

## 6. Higgsfield or fal (prices read 2026-10-18, higgsfield.ai/pricing, no sign-in)
| | fal | Higgsfield Plus |
|---|---|---|
| Fee | none | $59/mo, or $47/mo billed annually; 1,200 credits; page: "~80 Seedance 2.5 videos" |
| One Seedance 2.5 take | ≈ $2.65 (our exact setup) | ≈ $0.59–0.74, **if** their "video" equals our setup (length, resolution and the reference clip's cost are not stated) |
| Break-even | — | ≈ 22 Seedance takes a month |
| Automation | the API our scripts use | "Unlimited models and Free Generations … are not accessible on MCP/CLI, Canvas or Supercomputer" |

Starter ($19/mo, 270 credits) has no Seedance 2.5. A $3 one-time pack (40 credits) would show the true credit cost of our
exact shot; it needs an account the founder makes.

## 7. Time per step (measured)
| Step | Time |
|---|---|
| Set-up (fetch, ffmpeg via Homebrew, `npm install`) | ≈ 6 min (3 of them a stuck first fetch) |
| `tools/ref.sh`, five reference videos | 46, 56, 39, 62, 27 s |
| S3 passes (108 frames × 4 passes) + turntable mask | 42 s + 6 s |
| Checker install | 29 s |
| Self-tests | 206 s (isnet), 63 s (u2net) |
| M1 / M2 / M3 on fal (queue + generating) | 246 s / 148 s / 209 s |

## 8. What changed from the plan, and what we learned
- **Changed:** the stills came from the founder's apps, not fal (step 1 cost $0); Gate 1 (the still's overlap) was waived
  by the founder ("now generate the video"); the outline model was changed after isnet failed its self-test; M3 (Wan 3.0)
  was added on the founder's yes; the hero still was chosen by eye.
- **Learned:**
  1. The look comes from a picture; the motion from the previs. Words alone don't make it real.
  2. Reference-mode models copy the previs's **own** models where the photo can't show them (the far side of the bowl), so
     the previs must look right from every side: its strawberries should be slices all the way round.
  3. The photo moved the bowl up; the code should follow the approved photo: text → rough code → photo from the code frame
     → code adjusted to the photo → video.
  4. LTX returns 704×1152, not 9:16; Seedance and Wan return true 9:16.
  5. Seedance bills the reference clip's seconds as well as the output's.
  6. Heavy local models don't fit an 8 GB Mac beside everything else: light checks here, heavy ones elsewhere.
  7. An outline can't catch morphing; a per-ingredient colour check can (planned, not built).
  8. `s3-run.mjs` now writes fal's job number the moment a job is queued (M1's was recovered through fal's API after the
     local script stopped).

## 9. Next (the founder decides)
1. The founder's balance after M3, to close the money table.
2. Realism numbers (1–5) for M2 and M3, so the marks can be read.
3. A light per-ingredient colour check (drift and morphing; tens of MB, seconds), proved on the previs and on deliberately
   shifted copies before it measures anything; then measure M2 and M3.
4. Fix the previs's far side (sliced strawberries all round), and frame it with headroom.
5. Seedance 2.5 or Wan 3.0 as the default, and a budget for the fall-in (S1, S2) and the honey (S4): ≈ $6.70–8.50 on
   Seedance, about a third of that on Wan.
6. Optional: Higgsfield's $3 pack to price our exact shot there.
