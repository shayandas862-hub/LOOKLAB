# Test 2 · S3 (the 360° turn) · the plan: look first, then motion, then exactness

Written 2026-10-18; **frozen at the founder's yes the same day** (§11). The pass marks, prompts and settings never move
after it; every change and every result is in the log (§11), and the outcome is in [`RESULTS.md`](RESULTS.md). A test, not
for commercial use. The founder's goal: **it must look like real
footage of real fruit and ingredients.**

## 1. What went wrong so far (measured, not guessed)
| | Test 1 (shoe, 6 s) | Test 1b (runner, 15 s) |
|---|---|---|
| Shape held? | yes: 0.96–0.97 overlap with the code (depth way, 3/3 takes) | nearly: 0.91 walking, 0.80 in the orbit (mark 0.85) |
| Colour / look held? | no: brand orange off by 8–12 ΔE00 on all 9 takes (mark ≤ 5) | no: rated 1 / 5, "a dark blue CG render" |
| What the model was given | depth video + a paragraph of words | depth video + a paragraph of words |
| A picture of how it should look? | **no** (the picture way, B, got the code's own CG render) | **no** |
| Model | `wan-vace-14b/depth` (Wan 2.1-based), $0.08 per video second | same |

Sources: `08-skin-test/RESULTS.md` §4, `09-runner-test/RESULTS.md`, `08-skin-test/run.mjs:16-18`, `09-runner-test/run.mjs:32`.
**The shape half works. The look half was never given a picture, and ran on the cheapest model on the menu.**
Also unfinished: Test 1's nine clips still have no realism rating.

## 2. What the five videos do instead (`VIDEOS.md`, "Added 2026-10-18")
- **The look comes from a picture; the motion comes from the grey 3D video.** Video 1: the grey frame goes to Nano
  Banana with one line about the place and comes back photoreal in the same layout; that still is the start frame; the
  grey video is the motion reference; Seedance 2.5 makes the clip. Video 2 skips the still: grey video + character and
  location pictures straight into Seedance 2.5. None uses depth; none measures.
- Their models: Seedance 2.5 (videos 1, 2, 4), Nano Banana Pro / 2.1 (videos 1, 3, 4), Kling 2.6 (video 3).

## 3. The change, and the models
**Old:** depth + words → Wan. **New:** the previs frame → image model → **one approved hero still** → video model given
the hero still (the look) and the previs clip (the motion) → the checker on the bowl.
- **Wan is dropped** (1 / 5 on realism, brand colour missed 9 / 9). **Seedance 2.0 Fast is dropped** (if Seedance is the
  bet, buy the one the videos used). **Route 2 (three keyframes) is dropped:** three separately painted stills won't
  agree (toppings, glass, light) and the video would morph between them.
- Stills: `fal-ai/nano-banana-pro/edit`, `google/nano-banana-2.1/edit` (the videos' family; they see our colour render)
  and `fal-ai/flux-control-lora-depth/image-to-image` (the only one forced to follow our depth: the baseline).
- Motion, cheapest first: `fal-ai/ltx-2.3-quality/render-to-real` (built to turn a CG render into photoreal video), then
  `bytedance/seedance-2.5/us/reference-to-video` (the videos' model) only if LTX fails a mark.

## 4. How we get "real footage, real fruit"
1. **The look is decided on one still, by the founder, before any video money.** If the still doesn't look like a
   photo, the video never will.
2. **The words describe a real food shoot, not a render:** real textures (thick frozen açaí, cut fruit with seeds and
   juice, crunchy granola, real glass with reflections and a faint cold mist, wood grain), real light, a real camera
   (cinema camera, 50 mm, shallow depth of field, film grain), and **"arranged by hand: neat, not perfect"**: our
   previs is CG-perfect, and perfect reads fake.
3. **Keep the layout, change the materials.** The prompt names what stays (camera, bowl, layers, topping rows, light
   direction) and what must become real (every surface).
4. **The strongest settings for realism:** LTX at `intensity: strong-v2` (its page: the default "light" keeps more of the
   source render's look); Seedance 2.5 with the hero still as @Image1.
5. **The strongest lever of all, free:** a phone photo of a real açaí bowl taken by the founder (homemade or bought
   anywhere; never the café's photos without their yes), added as a second reference image. Used first if no still
   passes.
6. Later shots, not S3: grain and grade in the edit, the real logo from code. Honest limit: no model guarantees "shot on
   camera"; S3 (a rigid bowl, a slow turn) is the easiest shot of the five, so it is the one to learn on.

## 5. Inputs (made 2026-10-18, free; `out/passes/s3/`, ignored by git)
- 108 frames, 7.5–11.958 s at exactly 24 fps, 720×1280: `beauty_NNN.png` (clean colour, no label), `depth_NNN.png`
  (near = white; the glass is left out, so depth shows the food, not the bowl), `mask-bowl`, `mask-tops`, `mask-plinth`.
- `beauty_24fps.mp4`: the turn as a 24 fps clip, 4.5 s, 108 frames (Seedance accepts 1.8–30.2 s at 24–60 fps).
- The turn (`src/scene.js:70`): exactly one full turn from 7.5 to 12 s, starting and ending slowly (eased).

## 6. Steps, each behind a gate
**Step 0 · free, before any spend.** The founder puts the fal key in the Keychain. The checker's S3 rule is written
(below) and its rembg environment set up; it is run on the code's own frames first (calibration, as in Tests 1 and 1b).

**Step 1 · hero still · ≈ $0.50.** Input: `beauty_000.png` (7.5 s). Two images per model, fixed seed 11.
| Model | Settings | ≈ cost |
|---|---|---|
| Nano Banana Pro edit | `image_urls` [beauty_000], `aspect_ratio` 9:16, `resolution` 2K, `num_images` 2 | $0.30 |
| Nano Banana 2.1 edit | same | $0.13 |
| FLUX control-LoRA depth | `image_url` beauty_000, `control_lora_image_url` depth_000, `strength` 0.85 and `control_lora_strength` 1 (fal's defaults), 720×1280, `num_images` 2 | $0.08 |

Prompt, the two edit models:
> Turn this 3D render into a real photograph from a professional food commercial shoot. Keep the composition exactly:
> the same camera angle, framing and lens, the clear glass bowl's shape, size and position, the round wooden turntable,
> the mustard-yellow seamless backdrop, and the direction the light comes from. Keep the same layers seen through the
> glass, from bottom to top: purple açaí, a band of granola, purple açaí; and the same rows of toppings on top, left to
> right: banana slices, strawberry slices, granola, blueberries, kiwi slices. Change only the materials, so everything is
> real: thick frozen açaí with a matte, slightly melting surface; fresh-cut fruit with natural seeds, fibres, juice and
> small imperfections; crunchy granola clusters with oats and crumbs; real glass with true reflections, refraction and a
> faint cold mist; a real wooden turntable with grain. Arranged by hand: neat, not perfect. Shot on a cinema camera with
> a 50 mm lens, shallow depth of field, natural colour, fine film grain. No text, no logo, no hands, no people.

Prompt, FLUX (not an instruction model, so a description): the same, opening "A real photograph from a professional
food commercial shoot: an açaí bowl in a clear glass bowl on a round wooden turntable against a mustard-yellow seamless
backdrop", without the "keep" sentences.

**Gate 1:** a still passes all three still marks (§7), or no video money. If none passes: one retry with the founder's
photo as a second reference (≈ $0.45), else a Blender Cycles render of the bowl (real glass; Blender is on this Mac).

**Step 2 · motion, cheapest first.**
- **M1 · LTX render-to-real · ≈ $0.24.** `video_url` beauty_24fps.mp4, `image_url` the hero still (frame 0), `intensity`
  strong-v2, `resolution` 720p, `num_frames` 108, 24 fps, `generate_audio` false, seed 11 (720×1280×108 ≈ 99.5 MP at
  $0.0024075 per MP, rounded up). Prompt:
  > 3DREAL. Real footage from a professional food commercial: the same açaí bowl in a clear glass bowl turns once on a
  > wooden turntable against a mustard-yellow backdrop, camera locked off. Real frozen açaí, fresh-cut fruit, crunchy
  > granola, real glass reflections, natural motion, fine film grain.
- **Gate 2:** M1 passes every motion mark → stop and report (the recipe works at $0.24 a shot); the founder decides on
  Seedance. M1 fails a mark → M2.
- **M2 · Seedance 2.5 reference · ≈ $2.64** (fal's "roughly": 720×1280 × (4.5 s in + 5 s out) × 24 / 1024 = 205,200
  tokens × $0.0214 per 1,000 × 0.6 for a video input). `task` reference, `image_urls` [hero still], `video_urls`
  [beauty_24fps.mp4], `resolution` 720p, `duration` 5, `aspect_ratio` 9:16, `generate_audio` false, seed 11. Prompt:
  > @Video1 is the shot: copy its camera and motion exactly. The camera stays locked off. The bowl makes one full turn on
  > the wooden turntable, starting and ending slowly, in the same direction and at the same speed as in @Video1. Nothing
  > else moves. @Image1 is the look: the same real açaí bowl, glass, toppings, turntable, backdrop and light. Real footage
  > from a professional food commercial shot on a cinema camera, 50 mm lens, natural motion, fine film grain. No text,
  > no logo, no hands, no people, no cuts.

One Seedance take is one roll of the dice: a narrow miss can't be told from bad luck. A second take needs a top-up.

**Stop rule.** If Seedance with a passing hero still fails "looks real", a glass bowl turning 360° is beyond what we
can buy today: change the shot (an opaque bowl, a half turn), never the marks.

## 7. Pass marks (freeze at the founder's yes)
**The still:**
1. Looks real ≥ 3.5 / 5: the founder scores all six blind (shown as A–F, models hidden), before any measuring.
2. Keeps the bowl: overlap ≥ 0.85 between the code's bowl + toppings (`mask-bowl` ∪ `mask-tops`) and the still's object
   outline (rembg isnet-general-use, minus `mask-plinth`, **keeping only the outline regions that touch the code's
   bowl**: Test 1b's gap closed, written before any result). The still is scaled to 720×1280 first.
3. Layers in the code's order and the five topping rows in the code's order, by eye.

**The motion take:**
1. Looks real ≥ 3.5 / 5 (the founder, before measuring).
2. Holds the bowl: overlap median ≥ 0.85 and worst tenth ≥ 0.75 over 0–4.5 s, the same rule as the still, frames matched
   by time (Test 1's marks). Calibration first: the code's own clip must read ≥ 0.90 or the checker isn't fit for S3.
3. One full turn, the same direction as the previs, layers and rows in order, no morphing: by eye.
4. Flicker reported, no mark.

## 8. Money
Balance about $4.43 (the founder's figure; agreed 2026-10-18). Planned: stills $0.50 + M1 $0.24 + M2 $2.64 = **$3.38**.
**Cap $4.00** (room for one still retry, $0.45, and fal's "roughly"). Prices read from fal's own pages on 2026-10-18
(Seedance 2.5 reference, LTX render-to-real, Nano Banana Pro, FLUX depth) and 2026-10-17 (Nano Banana 2.1, MODELS.md).
What fal actually charged: read by the founder on fal's billing page afterwards. Time per step: measured, in `RESULTS.md`.

## 9. Not now
The prompt compiler (S3's prompts are written by hand above), the Fixer (no logo in S3), S1/S2/S4/S5, a Higgsfield
account. Licences: fal marks every model above "commercial"; the makers' own terms are unread, so test only.

## 10. The founder decides
1. Yes to this plan and the **$4.00 cap**.
2. The fal key into the Keychain (`security add-generic-password -s fal-key -a "$USER" -w`), never in chat or a file.
3. Optional now: a phone photo of a real açaí bowl (yours, not the café's) as a second reference for the stills.
4. Rate Test 1's nine clips, or close Test 1 without them.

## 11. Log
- **2026-10-18, step 1 done outside fal ($0):** the founder made the stills in other apps from `s3_frame_7.5s.png` and
  the §6 prompt: three from "Luna 6" (`out/stills-in/luna6_1…3`), one from ChatGPT ("GPT 6.1 Sol"; a second image,
  "GPT 6 Astra", looks identical to it). The founder's understanding: one image model behind both; its name and terms
  are unconfirmed, so test only. Still mark 1 (looks real): **pass**, in the founder's words "all look good" (no number
  given). Still mark 3 (layers and topping rows in order): pass for all, by eye. Still mark 2 (bowl overlap): not yet
  measured; by eye every still's bowl sits a little higher than the code's (`out/stills/outline_sheet_luna6.png`).
- **Proposed before any still is measured (needs the founder's yes):** if the best still reads under 0.85, the previs
  **camera only** (not the bowl, the turn or the timing) may be moved so the code's bowl lines up with that still; the
  clip and masks are re-rendered, the still is measured again against the moved previs and must reach ≥ 0.85, and the
  move is written here. If it can't reach 0.85, step 2 doesn't start.
- `s3-run.mjs` written: `--dry` prints the exact request (checked for both models), `--yes` sends and pays.
- **2026-10-18, the founder's yes:** the $4.00 cap, the checker on this Mac, and the camera rule above. The pass marks
  in §7, the prompts and settings in §6 and the camera rule are frozen from here. Not deleting the reference videos.
- **2026-10-18, checker calibration: failed.** `s3-check.py calibrate` (rembg isnet-general-use, 206 s for 108 frames):
  the code's own frames read median **0.82**, worst tenth 0.805 (mark ≥ 0.90). Cause: the outline model leaves out the
  bottom açaí layer seen through the glass (16–20 % of the code's bowl missed on frames 0, 46, 80; under 0.2 % added);
  the turntable subtraction removes none of it (the masks don't overlap), and no threshold fixes it (16–128: best 0.837).
  So the bowl overlap can't be read as written. No still or clip measured; $0 spent. The founder decides the next step.
- **2026-10-18, the founder: "now generate the video" (option C).** Gate 1's still-overlap check is waived for M1
  ($0.24); the hero still is `luna6_1` (chosen by eye: the three are alike). In parallel, free: other rembg outline
  models, `u2net` then `birefnet-general-lite`; the first whose calibration on the code's own frames reaches ≥ 0.90 becomes
  S3's checker; the still and the clip are measured only with a checker that has passed. If none passes, position is
  judged by eye against the code's outline, and said so.
- **2026-10-18, M1 (LTX render-to-real) made.** Request `01a14cdb-92fb-7b53-9a5b-9dc891ce998b`: sent 02:33:41 UTC, 59 s
  in fal's queue, 187 s generating. The local script was stopped while waiting (the session ended); the job was found
  with fal's requests-by-endpoint API and downloaded, not paid twice (`s3-run.mjs` now writes the job number the moment
  it is queued). Planned cost ≈ $0.24; the charge is read on fal's billing page (this key can't read billing).
  `out/clips/S3_ltx.mp4`: 108 frames, 24 fps, 4.5 s, **704×1152**: a centre crop of the frame, not 9:16 (frame 0
  against the still: centre crop mean difference 5.6, stretch 13.1; best offset 68 px, centre 66). By eye at frames 0,
  27, 54, 81, 107: the topping rows face the same way as the previs at each moment, reversed at the half turn, back to
  the start view at the end. Not yet: the founder's realism score, a calibrated checker, the clip's overlap.
- **2026-10-18, the founder on M1:** "LTX may have kept the full motion right but morphed some in the middle the fruits".
  Motion mark 3 (no morphing, by eye): **fail**. No realism number given. Gate 2 → M2 (Seedance 2.5), as written.
- **2026-10-18, M2 (Seedance 2.5 reference) made.** Request `01a14ce8-1103-7e31-8900-b7a4b859f87b`, 1 s in the queue,
  147 s generating. `out/clips/S3_seedance.mp4`: **720×1280 (true 9:16)**, 24 fps, 121 frames, 5.04 s. By eye at frames
  0, 27, 54, 81, 107, 120: the rows face as in the previs at each moment, reversed at the half turn, back to the start
  view at the end; mid-turn the toppings follow the previs's own models (e.g. its strawberry row's far side), then return
  to the still's look. Planned cost ≈ $2.64 (fal's "roughly"); spent so far ≈ $2.88 of the $4.00 cap, to be read on fal.
- **Checker calibration (free):** `u2net` median **0.95**, worst tenth 0.805, lowest 0.801 (frame 0): passes the ≥ 0.90
  median mark, but its own error on a tenth of the frames is close to the clip's 0.75 worst-tenth mark.
  `birefnet-general-lite`: running.
- **2026-10-18, BiRefNet-lite calibration stopped by the founder** (at 25 of 108 frames): the founder saw about 12 GB in
  Python on the 8 GB Mac. Not measured on one frame first: my mistake. **Rule from here:** every local job runs one frame
  first under a memory meter; above 1.5 GB it doesn't run here. The clips are not yet measured by any checker.
- **Cost check (fal's pricing API, 2026-10-18):** Seedance 2.5 reference $0.0214 per 1,000 tokens; LTX $0.0024075 per MP.
  Seedance: 720 × 1280 × (4.5 s in + 5.04 s out) × 24 / 1024 ≈ 206,100 tokens × 0.6 (video input) ≈ **$2.65**. LTX:
  704 × 1152 × 108 ≈ 88 MP ≈ **$0.21**. This test ≈ $2.86; with Tests 1 and 1b ($5.57) ≈ $8.43 on fal so far.
  Calculated, not read from the bill (this key can't read billing).
- **Higgsfield, read 2026-10-18 at higgsfield.ai/pricing (no sign-in):** Starter $19/mo, 270 credits, ~15 Seedance 2.0
  Fast videos, no Seedance 2.5; Plus $59/mo ($47/mo billed annually), 1,200 credits, "~80 Seedance 2.5 videos"; $3 one-time
  for 40 credits; a "30-day unlimited Seedance 2.5" banner. "Unlimited models and Free Generations … are not accessible on
  MCP/CLI, Canvas or Supercomputer." What one "Seedance 2.5 video" is (length, resolution, a reference video) is not
  stated: needs checking (the Generate button shows the credit cost after sign-in).
- **2026-10-18, the founder: "okay do it"** for M3, Wan 3.0 reference-to-video, the Seedance take's equivalent (same
  still, clip, prompt with "Video 1"/"Image 1", marks; 720p, 9:16, no audio), planned ≈ $0.95 (fal's page: $0.10/s at
  720p, input seconds billed; fal's pricing API lists a $0.05/s base unit). The founder's fal balance before it: **$1.71**,
  so LTX + Seedance actually cost ≈ $2.72 (from $4.43), against the ≈ $2.86 calculated.
- **2026-10-18, M3 (Wan 3.0 reference) made.** Request `01a14d03-56e0-7031-a394-e216353b3289`, 1 s in the queue, 208 s
  generating. `out/clips/S3_wan3.mp4`: 720×1280 (9:16), **30 fps**, 150 frames, 5.0 s. By eye at the same six moments
  (sampled at 24 fps): the rows face as in the previs at each moment, reversed at the half turn, back to the start view;
  like Seedance, mid-turn toppings follow the previs's own models. Side by side: `out/clips/S3_previs_seedance_wan3.mp4`.
  Planned ≈ $0.95; the founder's balance after it is the real figure.
- **2026-10-18, the founder on M2 vs M3:** "similar, the motion is okay, but I think Seedance's one is more constant in
  colour". Recorded in words; no realism numbers were given for M2 or M3.
