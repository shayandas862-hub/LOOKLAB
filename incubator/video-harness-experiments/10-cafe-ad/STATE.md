# Test 2 · café ad (Blend, Stirling) · where it stands

Updated 2026-10-17 at the end of the first (cloud) session. **A test, not for commercial use** until the café agrees
and the models' terms are checked. Read this first, then only the file a step names.

## Decided by the founder
- The ad: the ingredients float, fall into a glass bowl layer by layer, the bowl turns 360°, a hand drizzles honey,
  end card. Shot list and risks: [`BRIEF.md`](BRIEF.md).
- The process: brief → plan with pass marks → code skeleton → keyframes (image model on the code's depth) → animate
  (video model with first/last frame and depth) → finish (logo and type from code, edit, music). Not every frame as a
  separate image (they would flicker).
- Start small: one 5 s shot (S3, the turn) through code → keyframes → animate, under about $1, before the whole ad.

## Done (all free; nothing sent to fal, $0 spent)
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

## Waiting on the founder
1. **Budget** for Test 2 (fal balance about $4.43 on 2026-10-17, the founder's figure).
2. **The S3 test**, priced 2026-10-17 (details in `MODELS.md`):
   - route 1, one keyframe (`fal-ai/flux-control-lora-depth/image-to-image`, $0.04/MP) then
     `fal-ai/ltx-2.3-quality/render-to-real` on the previs: about $0.31;
   - route 2, three keyframes (0°, 180°, 360°) then `blackforestlabs/flux-3/keyframes-to-video` (5 s 720p): about $0.97;
   - route 3 (optional baseline), the same keyframes and the depth video into `fal-ai/wan-vace-14b/depth`: about $0.41.
   Routes 1+2 with keyframe retries: cap $1.75; all three: cap $2.50. Nothing is sent without the founder's yes.
3. Whether to compare against Higgsfield itself on the same shot (needs a Higgsfield account).

## Next, in order
1. On the founder's Mac: `tools/ref.sh` on the reference videos below; study the contact sheets and transcripts;
   note what to borrow in `VIDEOS.md`.
2. `PLAN.md`: S3's pass marks, written before anything is made (shape against the bowl mask, stripe order and
   layers, brand colour after the Fixer, flicker, the founder's realism score ≥ 3.5 / 5).
3. The checker's known gap: count only the outline touching the code's object (Test 1b's glowing-floor patch).
4. A prompt compiler: the shot list in, every image and video prompt out, so prompts never drift.
5. S3's source frames and passes at the routes' frame rates; the total; the founder's yes; run; `RESULTS.md`.

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
