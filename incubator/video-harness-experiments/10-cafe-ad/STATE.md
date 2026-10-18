# Test 2 · café ad (Blend, Stirling) · where it stands

Updated 2026-10-18 on the founder's Mac, after the first S3 takes ([`RESULTS.md`](RESULTS.md)). **A test, not for commercial use** until the café agrees
and the models' terms are checked. Read this first, then only the file a step names.

## Decided by the founder
- The ad: the ingredients float, fall into a glass bowl layer by layer, the bowl turns 360°, a hand drizzles honey,
  end card. Shot list and risks: [`BRIEF.md`](BRIEF.md).
- The process (changed 2026-10-18, PLAN.md §3): brief → plan with pass marks → code previs → **one approved photo** made
  from the previs frame (the look) → a video model given the photo and the previs clip (the motion) → checks → finish
  (logo and type from code, edit, music). Depth-only video and three separate keyframes are dropped.
- Start small: one 5 s shot (S3, the turn) through code → keyframes → animate, under about $1, before the whole ad.

## Done
| What | Where | How to run |
|---|---|---|
| Brief, the founder's pick, shot list | `BRIEF.md` | — |
| Previs: 17.5 s, 9:16, 24 fps, five shots in three.js | `index.html`, `src/*.js`, `render.mjs` | `npm install`, then `node render.mjs video` → `out/previs.mp4` (12 min 14 s on the cloud's software renderer, 1.7 s a frame with 4 workers) |
| Contact sheet, stills | `render.mjs` | `node render.mjs sheet 0 17.5 1.25` · `node render.mjs stills 9 13.8` |
| Passes for the AI steps: clean frame, depth (near white, glass left out), masks (bowl, tops, plinth, honey, float) | `src/passes.js` | `node render.mjs passes 7.5 12 81 --name s3 --passes beauty,depth,mask:bowl,mask:tops` → `out/passes/s3/` |
| fal model menu with prices read 2026-10-17 | `MODELS.md` | — |
| Reference-video tool: link or file → transcript, cut list, contact sheet | `../tools/ref.sh` | `tools/ref.sh <youtube-link or file>` → `tools/out/<id>/` (links only work from a home connection: YouTube blocks cloud servers) |
| How AI ad platforms (Higgsfield, Kling, Runway, Creatify) build ads, stated vs inferred | `PLATFORMS.md` | — |
| The two Higgsfield "Blender + Higgsfield" videos, from public pages (no transcript reachable from the cloud) | `VIDEOS.md` | — |
| 2026-10-18: the five reference videos from their transcripts and sheets | `VIDEOS.md` ("Added 2026-10-18") | — |
| 2026-10-18: S3 plan, marks, three takes on fal (LTX, Seedance 2.5, Wan 3.0), the money; **≈ $3.67 spent** | `PLAN.md`, `RESULTS.md` | `node s3-run.mjs ltx\|seedance\|wan3 --still <photo> --dry` (`--yes` pays) |
| S3's checker (outline overlap; self-test first) | `s3-check.py` | `../07-grok-test/.venv/bin/python -I s3-check.py calibrate --model u2net` |
| 2026-10-18 (cloud): per-ingredient masks (8 foods, seen without the glass) and the colour check v1; a pass bug fixed (the upper layers vanished from the masks and depth; the beauty and old masks unchanged) | `src/passes.js`, `s3-colour.py`, PLAN.md §11 | `../07-grok-test/.venv/bin/python -I s3-colour.py prove` (needs only numpy + Pillow): **5 of 6 proofs pass; the recoloured kiwi fails** (+7.6, mark ≥ 10); strawberry and kiwi change colour over the previs's own turn (cut face vs skin), so v1 must not judge any take. v2 (each food's few colours, not one median) waits on the founder |

## Waiting on the founder
1. The fal balance after the Wan 3.0 take (to close RESULTS.md §5; expected ≈ $0.76).
2. Realism numbers (1–5) for the Seedance and Wan takes.
3. Seedance 2.5 or Wan 3.0 as the default, and a budget for the fall-in (S1, S2) and the honey (S4).
4. Optional: Higgsfield's $3 pack to price the same shot there (needs an account the founder makes).

## Next, in order
The next session's opening prompt: [`NEXT-SESSION.md`](NEXT-SESSION.md).
1. A light per-ingredient colour check (drift and morphing), proved on the previs and on shifted copies, its marks
   written before it measures; then measure the Seedance and Wan takes. Heavy models don't run on this Mac.
2. Fix the previs's far side (sliced strawberries all round) and frame it with headroom.
3. The order of work: text → rough code → photo from the code frame → code adjusted to the photo → video.
4. A prompt compiler: the shot list in, every image and video prompt out, so prompts never drift.

## Only on the founder's Mac (not in git), and how to rebuild it
| What | Where | Rebuild |
|---|---|---|
| The hero still and the other photos (the founder's, from "Luna 6") | `out/stills-in/luna6_1…3.png` (+ `.webp`) | can't be rebuilt: keep them; the hero still is `luna6_1` |
| The three takes and the side-by-sides | `out/clips/S3_ltx.mp4`, `S3_seedance.mp4`, `S3_wan3.mp4`, `S3_previs_*.mp4` | re-buying costs money: keep them; fal's job numbers are in `RESULTS.md` |
| S3's passes (108 frames, 24 fps) | `out/passes/s3/` | `node render.mjs passes 7.5 11.958333333333334 108 --name s3 --passes beauty,depth,mask:bowl,mask:tops,mask:plinth` (≈ 50 s on the Mac; 393 s in the cloud), then the food masks: `--passes depth,mask:acai-low,mask:granola-band,mask:acai-high,mask:banana,mask:strawberry,mask:granola-top,mask:blueberry,mask:kiwi` (201 s in the cloud). **Re-render on the Mac after 2026-10-18:** its depth pass predates the fix |
| The previs clip the models were given | `out/passes/s3/beauty_24fps.mp4` | `ffmpeg -framerate 24 -i out/passes/s3/beauty_%03d.png -vf format=yuv420p -c:v libx264 -crf 12 -movflags +faststart out/passes/s3/beauty_24fps.mp4` |
| The checker's environment (461 MB) and outline models (552 MB in `~/.rembg`) | `../07-grok-test/.venv` | `/Library/Frameworks/Python.framework/Versions/3.13/bin/python3.13 -m venv ../07-grok-test/.venv && ../07-grok-test/.venv/bin/pip install "rembg[cpu]==2.0.85"` (29 s) |
| The fal key | macOS Keychain, service `fal-key` | runs read it with `FAL_KEY="$(security find-generic-password -s fal-key -w)"`; never in a file |
| The five reference videos (study only) | `../tools/out/<id>/` (329 MB) | `../tools/ref.sh <link>` |

**This Mac has 8 GB:** every local job runs one frame first under a memory meter (`/usr/bin/time -l`); above 1.5 GB it
doesn't run here (BiRefNet reached about 12 GB on 2026-10-18).

## Reference videos (study only: never sent to fal, never committed, never copied shot for shot)
- `https://youtu.be/vUYq38wC_xI` Higgsfield: "GPT Astra 6 + Blender + Higgsfield Builds The Craziest Cinematic Scenes!"
- `https://youtu.be/OiULPvTJ-0E` Higgsfield: "How To Save AI Credits With Higgsfield + Blender"
- `https://youtu.be/AdjllfZuqYM` Higgsfield: "A $1,000,000 AD Using Just 2 tools"
- `https://youtu.be/VlBbcYQBlOo` "Create a Cinematic Product Ad with Higgsfield AI (FULL Workflow)"
- `https://youtu.be/nAyV8ZzbG2w` "The AI Ad Workflow That Agencies Don't Want You To Know"

## What the research says we lack (PLATFORMS.md, VIDEOS.md)
1. A product reference pack (real photos of the bowl, the café's logo file) passed into the image and video calls:
   needs the café's yes first.
2. A step that puts the real logo and end card back over the video through the previs masks, with the checker
   deciding when to retry (our Fixer, planned, not built).
3. Finishing: an upscaler (on fal: needs checking), the edit, music.

## Found along the way
- A full 360° starts and ends on the same view: its first and last keyframes would be the same picture. Paint three
  keyframes (0°, 180°, 360°) and use a model that takes more than two, or make the turn as two halves.
- The café's photos are not used or sent anywhere until the café agrees; the logo yellow (about `#CAAC3A`) was
  sampled from a screenshot and is replaced by their file.
- The `wan-vace` results of Tests 1 and 1b (shape held, colour and realism did not) are in `08-skin-test/RESULTS.md`
  and `09-runner-test/RESULTS.md`.
