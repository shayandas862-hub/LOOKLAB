# Next experiment — generated video on top of code video, checked against the truth

**The question:** can a layout made in code steer a video model into real-looking footage, close enough to measure?
If yes, within tolerances written down first, that's the first measured proof of the core idea: code video and
generated video combined in one cut. It does not prove the whole simulation idea.

## Why code video makes this measurable

Every frame of a code-made film can also export the right answer for itself:
- **Depth:** how far away each pixel is.
- **Masks:** which pixels are the hero, the product, the floor.
- **Outlines.**
- **The hero's skeleton.**
- **The exact camera.**

A video-to-video model takes the guides and repaints the shot. We then measure the result against that truth.

## The loop (one per shot), which is the product's own loop in miniature

1. **Plan:** the film's code stays the master: shots, timeline and music are unchanged.
2. **Guides:** export depth, masks, outlines, skeleton, camera and a truth file for each shot. Free; runs on the CPU.
3. **Shot package:**
   - the guides
   - the prompt
   - the rules: keep the visor, no face, don't change the product
   - the model, the seed and the spending cap
4. **Generate (fal):** upload the guide video, call the model, wait, download. Log every call's time and cost, and
   stop at the cap.
5. **Verify:** compare against the truth, with pass marks written before the run:
   - layout: depth read from the generated frame against the true depth
   - objects: overlap with the true masks, especially the product
   - camera: the path recovered from the generated video against the true camera
   - body: the pose read from the generated person against the true skeleton
   - look: palette and colour match
   - steadiness: flicker from frame to frame
   - no face anywhere
6. **Fix or fail:** up to three tries per shot, each with stronger guides, another seed or another model. Report
   pass or fail with the numbers; never loosen a pass mark after the run.
7. **Assemble:** passing shots go back onto the same timeline and music. For product shots, the exact code-made
   product is composited over the generated scene. Side-by-side comparisons are made for posts.

**First calibration:** the measuring tools have their own errors. The verifier must pass the original code render
and fail a copy broken on purpose before its numbers mean anything.

## First run

- **Shots:** three from ACTION, 3 s each: the neon run, the perfume drop, the runway. Some models need more than 2 s.
- **Models:** two, one hosted and one open-weight, at 720p.

## Prerequisites

- **The key:** `FAL_KEY` added in the environment's settings (session title bar → cloud environment → Edit →
  Network secrets or an environment variable). Never in chat. Only a new session picks it up, which is why the
  code is pushed first.
- **Network:** fal's API hosts answered from the cloud container on 2026-10-14. No change needed.
- **Licences:** each model's commercial-use terms, and the terms for its outputs, are checked before use. Unclear
  means no.
- **Budget:** a cap per run set by the founder. Prices per model need checking at the time.

## Candidates seen on 2026-10-14 (each needs checking before use)

- **LTX 2.3:** video-to-video with pose, depth and edge guides.
- **LTX-2.3-3DREAL-LoRA:** turns 3D renders into photoreal video; on fal.
- **Wan VACE:** depth and pose guides; on fal. One listing gave 720p at $0.08 per second, which needs checking.
- **Runway Aleph** and **Luma Modify Video:** restyle while keeping structure. Sources disagree on their limits.
- **RealMaster** (research, March 2026): rendered scenes to photoreal video aligned to the engine.

## Expected to break (to be measured, not assumed)

- The same hero across shots.
- The product's exact shape: the reason the product stays in code.
- Clip-length limits.
- Flicker.
- A face appearing under the visor.
