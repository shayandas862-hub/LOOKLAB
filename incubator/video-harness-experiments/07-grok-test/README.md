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
