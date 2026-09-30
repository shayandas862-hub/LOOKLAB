# 01 · Vision

*This is my (Claude's) statement of the owner's vision, built from the conversation. The owner has not corrected it; treat it as a working interpretation and confirm before building against it.*

## In one paragraph
Taste can't be fully replicated, but parts of it can be measured. Feed the system a reference video or frame and it reverse-engineers how the image was made: framing, lens, where the light sits and how hard, colour temperature, contrast, the set and the characters. Turn that into data. Then let a person steer the data: move the light, swing the camera, change the outfit, drop a new character into the same room, and see how the look changes. Every look that works is saved as a fingerprint in a taste library and can be applied to a new scene.

## The owner's own words (verbatim, lightly trimmed)
- "understanding a mathematical and reverse engineering taste and vision, I know it cannot be fully replicated but yeah parts and bits and bobs"
- "a thing which is having the capacity of taking a video and take screenshots and analyse what is in there from framing to lighting to character to placing set design etc and understand and gain data from it and reverse engineer that thing so that we know that okay if we place the light over here it produces this kind of image which looks good"
- "then we can use our controls to move around the camera, the light, to see how it is reflecting in the footage"
- "a decision model system 1 AI's ... as well as LLMs and stuffs if needed" — a fast decision layer (Jev/Laya-class) routing work between instruments, models and the human
- "a reference video, take the full information, reverse engineer it and then pass it through a decision model, produce the next image, and with all kinds of controls"
- Latest: raw pictures of a location, cast characters and objects; generate outfits; every element movable anywhere in 3D space; reference and light matching and moving; "we need to have some image model in there".

## What it is for
1. **Learn a look** from reference material, with numbers you can inspect.
2. **Reproduce and vary it** in a scene you control, in real time.
3. **Build taste data**: a growing library of fingerprints tied to the human's accept/reject decisions, which later trains the fast decision layer.
4. **Serve client work** for a one-person VFX/3D freelance studio (Blender, Claude, free tools): faster look-dev, more convincing pitches, repeatable style matching. See `docs/11-STUDIO-CONTEXT.md`.

## What it is not
- Not a generative video tool. Image models make assets and final stills, not the interactive view.
- Not a claim that taste is solved. The numbers capture lighting contrast, direction, warmth, framing; they do not capture *why* a frame works.
- Not a replacement for Blender. Blender is the path for final-quality renders (Phase 8).

## The mental model (the owner's, corrected)
The owner framed it as System 1 (fast decision model) plus LLMs. The correction: *verification* is the System 2 part, LLMs are one tool among several, and the decision layer **routes by task type** (it starts as a rule table, then a learned router). Tiers:

| Tier | What | Examples |
|---|---|---|
| T0 | Instruments, deterministic | FFmpeg, OpenCV, the fit search, the match metric |
| T1 | Fast learned models | segmentation, depth/normals |
| T2 | Language/vision models, semantic and fallible | labels, outfit edits, image-to-3D, hero relight |
| T3 | The human | taste, accept/reject |

Route by task type; escalate when tools disagree; log every decision.

## Success looks like
- Given a real reference frame, the system proposes a light rig and camera that a colourist or DP recognises as close, in under a minute on the M1 plus cloud calls.
- A scene built from your own location photos and cast photos relights plausibly when you move the key.
- The decision log is rich enough to train the router.
