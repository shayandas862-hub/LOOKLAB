# 07 · Grok test: code-made shots in, real-looking clips out, measured

**A test, not for commercial use.** Grok's terms on who owns and may use its outputs were not confirmed
(2026-10-15: xAI's terms page could not be read here, and summaries of it disagree). Nothing from this test goes in
a client or brand film until the founder has read the terms in their account.

**Not part of Look Lab.** Nothing here is imported, built, tested or served by Look Lab (D-LL-056).

## The idea

The four shots of ONE SENTENCE (film 05) were built in code, so every number in them is known: the shoe's exact
colour, the lens, the camera's move. Each becomes a starting frame. Grok turns it into a real-looking clip. The
clip comes back here and is measured against the shot it came from: did the shoe keep its colour and shape, did the
picture stay steady, did anything appear that shouldn't. That is the loop in `../docs/NEXT-GEN-VIDEO.md`, done by
hand with Grok.

## The starting frames (`kit/`, 1920×1080)

| File | Shot | Lens |
|---|---|---|
| `S1_dune.png` | The shoe on a dune crest at dawn | 35 mm |
| `S2_stride.png` | A leg and shoe mid-stride on a red track | 85 mm |
| `S3_shoe.png` | The shoe on a turntable in a dark studio | 50 mm |
| `S3_shoe_end.png` | The same shot 6 s later: the last frame for a 6 s clip (the turntable has turned the shoe to three-quarter front, the camera has glided round) | 50 mm |
| `S4_city.png` | A runner in a visor helmet in a neon city at night | 24 mm |

Made by `make-kit.mjs`, which draws each shot clean (no on-screen numbers) from film 05's code.

## What the founder does in Grok

Start with **S3** (the product shot: no people, easiest to measure), then **S1**. S2 and S4 after, if the first two
are worth it.

1. In Grok's video mode (Grok Imagine), upload the starting frame. The exact buttons need checking in the app.
2. Paste its prompt from below, unchanged.
3. Make 2–3 versions. Pick the longest length and highest resolution the plan offers.
4. Download them and upload them here in the chat, named like `S3_take1.mp4`, `S3_take2.mp4`.

## The prompts

**S3 · the shoe, 6 s, first and last frame (start here):** first frame `S3_shoe.png`, last frame `S3_shoe_end.png`
> Photoreal premium product shot, 6 seconds. The white running shoe with the orange stripes stands on a turntable
> in a dark studio, with a glowing orange ring around its base. The turntable turns smoothly and slowly while the
> camera glides gently around it, so the shoe goes from the side view in the first frame to the three-quarter front
> view in the last frame. Soft studio light, gentle reflections on the black floor, a warm orange glow on the wall
> behind. Keep the shoe's shape, laces and orange stripes exactly as in the images. No text, no logos, no people.

Because both ends come from the code, the code can also render every frame in between; the clip is then compared
with it frame by frame (where the shoe is, how it's turned), not only at its first frame.

**S3 · the shoe, first frame only** (if the last-frame option isn't wanted)
> Photoreal premium product shot. The white running shoe with the orange stripe stands on a slowly turning
> turntable in a dark studio, an orange glowing ring around its base. Soft studio light, gentle reflections on the
> floor. The camera orbits slowly. Keep the shoe's shape, its laces and its orange stripes exactly as in the image.
> No text, no logos, no people.

**S1 · dune at dawn**
> Photoreal cinematic shot. The white running shoe with the orange stripe rests on the crest of a sand dune at
> dawn. Slow, smooth push in towards the shoe, camera low to the sand, 35 mm lens. Warm low sun from the right,
> long soft shadows, fine sand blowing gently across the dune. Keep the shoe's shape and its orange stripes exactly
> as in the image. No people, no text, no logos.

**S2 · stride**
> Photoreal slow motion, 85 mm lens, ankle height. A runner's leg and foot in a white running shoe with an orange
> stripe strikes a red running track. Show only the leg and the shoe, never a face. The camera tracks alongside.
> Warm daylight, crisp detail of the shoe flexing. Keep the shoe's design exactly as in the image. No text.

**S4 · city at night**
> Photoreal night shot in a rainy neon city street, 24 mm lens. A runner in a sleek magenta suit and a helmet with
> a glowing visor runs past, wearing white running shoes with an orange stripe. The face stays hidden behind the
> visor. Wet ground reflecting pink and blue neon, the camera moving with the runner. No readable signs or text.

## Skin on skeleton: re-skinning the code's own video (after take 1)

Take 1 showed that animating a picture keeps the picture's look: Grok moved our render but added no real "skin".
The next test gives the model the code's whole shot as a video and asks it to change only the surface.

**Route 1, by hand, Grok's video edit** (not available in the founder's Grok, as it turned out: see the next section). `kit/S3_skeleton_6s.mp4` is the code's own 6 s of the shoe (1920×1080,
24 fps). Guides from 2026 say Grok Imagine can restyle an uploaded video (up to about 8.7 s and 50 MB) while keeping
its motion; this needs confirming in the app. Prompt:
> Turn this into real product footage. Keep the camera move, the shoe's shape, its position and the turntable
> exactly as they are. Make it photoreal: the shoe in real white leather and knit mesh with fine stitching, orange
> rubber stripes, a matte rubber sole; real studio lighting with soft reflections on a glossy black floor; the
> orange ring a real LED light. No text, no logos, no people.

Because the motion should be kept, the code's masks line up with every frame, so the checker's colour and shape
readings hold for the whole clip.

**Route 2, automatic, Wan VACE through fal.** It takes control videos the code makes (depth, outlines, masks, pose)
so the structure can't drift; this session then runs render → generate → measure → retry → put the exact brand
colours back through the masks. It needs a fal key in the environment's settings, read as `FAL_KEY`, and a new
session. fal's listing (checked 2026-10-15) gave a price per video and 81–240 frames; both need confirming.

## Skin on skeleton in Grok: re-skin the frames, then animate (2026-10-15)

The founder confirmed Grok has no video-to-video (the third-party guides above were wrong for their app), and it
animates between the frames it's given, keeping their look. So the skin goes onto the frames first:

1. **Edit `S3_shoe.png` and `S3_shoe_end.png` into real product photos** with Grok's image edit, same prompt for
   both, keeping the composition exactly. Save as `S3_real_start.png` and `S3_real_end.png`.
2. **Animate between them**: first frame `S3_real_start.png`, last frame `S3_real_end.png`, 6 s, 16:9.
3. **Upload all three here.** The two pictures are checked against the code's frames (did the shoe stay where the
   code put it, are the orange parts in the same places and on brand), then the video, as before.

**Picture prompt (the same for both frames):**
> Turn this 3D render into a real product photograph. Keep the exact composition: the same camera angle, the same
> shoe position, size and outline, and the turntable exactly where it is. Make the shoe a real premium running shoe:
> white engineered knit mesh upper with fine texture, soft white leather overlays with fine stitching, the orange
> accents as real glossy orange rubber overlays in exactly the same places and shapes, white laces through real
> eyelets, the rounded collar at the heel as a padded heel collar, a white foam midsole with a thin orange stripe
> and a dark rubber outsole. Real studio product photography: soft key light, gentle reflections on the glossy black
> floor, the orange ring as a real LED light strip, a warm orange glow on the back wall. Photoreal, sharp, 16:9. No
> text, no logos, no people.

**Video prompt (first frame `S3_real_start.png`, last frame `S3_real_end.png`, 6 s):**
> Real product footage, 6 seconds. The same real running shoe on a slowly turning turntable in a dark studio. The
> turntable turns smoothly and the camera glides gently around it, from the side view in the first frame to the
> three-quarter front view in the last frame. The shoe's materials, stitching and orange overlays stay identical
> the whole time. Soft studio light, real reflections on the glossy black floor, the orange LED ring glowing
> steadily. Photoreal, 16:9. No text, no logos, no people.

The risk to watch: the two pictures are edited separately, so they may come out as two slightly different shoes. If
they do, the video will morph between them; then edit the start frame only and animate from it alone.

## The pass marks (written 2026-10-15, before any clip came back)

These are first guesses. A clip that fails one is reported as failing, and the marks aren't loosened afterwards.

| # | Check | How | Pass | Usable with work | Fail |
|---|---|---|---|---|---|
| 1 | It starts from our frame | Likeness of the clip's first frame to the starting frame, on brightness, at 480×270 | ≥ 0.90 | 0.75–0.90 | < 0.75 |
| 2 | The shoe stays on brand | CIEDE2000 between the orange stripe in the starting frame and in the clip, over the whole clip (median and worst tenth) | ≤ 5 | 5–10: a grade can bring it back | > 10 |
| 3 | The shoe keeps its shape | By eye, on a contact sheet: no melting laces, extra or missing stripes, or swapped parts. A judgement, not a measurement | Holds | Small drift | Changes |
| 4 | No flicker | Frame-to-frame change in overall brightness, ignoring the camera's own move | ≤ 3 % | 3–6 % | > 6 % |
| 5 | Nothing that shouldn't be there | By eye: no added text or logos, no faces (S2, S4 stay faceless), any watermark noted | None | — | Any |
| 6 | The file | Resolution, frame rate, length: recorded, not judged | — | — | — |

**Mark 2 was replaced after take 1** (it would have failed the code's own frames, whose light changes as the shoe turns):
see `RESULTS.md`. Results per clip are there too.

What happens after: the passing clips are matched in colour, the Das ident goes in front, titles and logos are
added from code, and it's cut to a code-made score. It's a test cut, kept out of `deliverables/` until the
terms are checked.
