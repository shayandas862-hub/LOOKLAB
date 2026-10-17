# Two Higgsfield videos: Blender + AI · what they show, and how it compares with ours

Research only, 2026-10-17. Nothing run, nothing spent. **No transcript was found**: YouTube blocks this server, and so
did a transcript site (youtubetranscript.com) and the YouTube mirrors (Piped, Invidious). Nothing below quotes what is
said in the videos. "Stated" = a source says it (tag in [ ], list at the end). "Inferred" = my reading only.

## The two videos
1. `vUYq38wC_xI` "GPT Astra 6 + Blender + Higgsfield Builds The Craziest Cinematic Scenes!", channel Higgsfield AI
   (stated [S1]). Put up around mid-September 2026 (inferred from a search snippet, "about 35 days ago" [S15]).
2. `OiULPvTJ-0E` "How To Save AI Credits With Higgsfield + Blender (No One Talks About This Workflow)", Higgsfield AI
   (stated [S1]); Higgsfield's official tutorial, 28 Aug 2026 (stated [S10]). Snippet of its description: it blocks
   "every shot in Blender before generating, which locks the camera and timing and burns far fewer credits" ([S15]).
3. Thumbnails (our saved copy `tools/out/yt/thumbs.png`): left, a grey sculpted man in Blender (video 1 shows the mesh
   wireframe; video 2 a plain grey clay man in a grey cockpit); right, the same man photoreal, same pose, framing and
   expression. That the right was made from the left by an image model: inferred.

## The workflow, step by step
1. Install Higgsfield's free Blender plugin (Blender 5.1+), sign in: a bar over the 3D view with 7 tabs (Scene builder,
   3D Model, Character animation, Image, Video, Camera, Asset), paid from the website's credits (stated [S2][S3]).
2. Build the scene by hand, or an AI agent (Claude, Codex, GPT-6 Astra) builds it through Higgsfield's "Bridge"
   (bridge.higgsfield.ai/mcp): real editable objects, "not a rendered image" (stated [S2][S3][S13]).
3. The character: "3D Model" (Meshy 5) makes a mesh, "Character animation" rigs it (stated [S2]). Higgsfield's own Astra
   prompt: Soul 2.0 concept image, textured 3D model, into Blender, clean up the mesh, UV map, rig, then Seedance 2.5,
   "Made in 30 minutes" (stated [S8], 5 Sep). That video 1's man was made this way: inferred (thumbnail wireframe).
4. The camera: keyframe it in Blender, or move a phone and the "Camera" tab moves the scene camera (stated [S2][S12]).
   Launch post: "Describe the camera move and get it animated" (stated [S8], 25 Aug).
5. A playblast (quick video straight from the 3D view): 1920×1080, 24 fps, about 15 s to make, no credits (stated [S10],
   not said to come from the video).
6. Photoreal still: the Image tab takes the 3D view and returns a 4K frame, "viewport in, frame out"; models Nano Banana 2,
   GPT Image, Seedream 5.0 Pro, Z Image (stated [S2]). Which model the videos use, and whether they send a clay render,
   a screen grab or a depth pass: **not found**. No source mentions depth or masks.
7. Video: the Video tab runs Seedance 2.5, "fed straight from your viewport", with an "Anti-Slop" mode (stated [S2]).
   Others feed the playblast to Seedance 2.5 "as a motion reference" (stated [S9]) with a prompt that follows the camera
   second by second (stated [S10]). Seedance 2.5 Draft Mode takes a start and an end image (stated [S4], 22 Sep);
   whether the videos use start/end frames: **not found**. A wrong shot: fix it and redo only that one (stated [S10]).

## What "GPT Astra 6" is
- Real name **GPT-6 Astra**: OpenAI's flagship model, released 3 Sep 2026 (stated [S4][S14]), "built for computer use,
  coding, research, and multi-step agentic tasks" (stated [S6]). Not made by Higgsfield, not Blender-specific.
- Here it is the operator: it drives Blender (Codex writing Blender's Python, or Higgsfield's Bridge or "Supercomputer")
  and calls Higgsfield's image and video models (stated [S4][S13]). Which route video 1 uses: not found.
- Price: OpenAI API $10 per million tokens in, $50 out, up to 272K tokens in (stated [S14]); about 17 Higgsfield credits
  a chat message (stated [S7]). Licence and terms: OpenAI's pages refused this server, so **needs checking**.

## How they "save credits"
- Every attempt is paid, kept or not: "You pay per attempt, not per finished video", usually 3 to 10 attempts per kept
  clip (stated [S5]). So settle layout, camera and timing in Blender for free, then generate.
- Higgsfield's figure: a dialogue scene without blocking "consumed almost 5,000 credits" and never got the shot; with
  blocking it came "within the first iterations" (stated [S10], attributed to Higgsfield; checked by no one).
- Also: price on the Generate button; variants multiply it; draft at 480p, render 1080p; failed generations refunded;
  plugins, MCP and CLI always use credits (stated [S2][S4][S5]). "60–70% fewer wasted generations": a guess ([S11]).

## Limits and failures admitted
- Text-only video: characters swap places, the 180-degree rule breaks, the camera wanders (stated [S10]). Camera drift;
  complex paths still confuse models, a 270° orbit split in two (stated [S11]). Generated meshes suit stand-ins, not hero
  assets (stated [S12]). Needs internet and an account (stated [S3]). Viewer comments call the credit use "shocking"
  ([S15], snippets). The most-watched Astra + Blender video is paid for by Higgsfield (stated [S10]); [S13] is too.
  What the two videos themselves admit: unknown, no transcript.

## Same as ours / different from ours
- **Same:** lock the shot in 3D first (layout, camera, timing) with grey stand-ins, pay the AI only for the look; the 3D
  view goes to an image model, then a video model.
- **Different:** they build in Blender, by hand or with an AI agent; we build in code with three.js.
- **Different:** they send a picture of the 3D view; we send depth and masks (inferred: no source mentions either).
- **Same, mostly:** they hand the video model the whole moving preview as a motion reference. So do we: Tests 1 and 1b
  gave `wan-vace-14b/depth` the whole depth video, and S3's route 1 gives `ltx-2.3-quality/render-to-real` the whole
  previs. Where they differ: they send the picture (a playblast), we send depth, or the picture in route 1.
  (Corrected by the main session 2026-10-17: the researcher had written that we send only keyframes.)
- **Different:** no source shows an automatic check, they look and regenerate; we check shape and brand colour against
  masks (inferred from absence). One vendor, one credit pot, licence per Higgsfield's plan (stated [S3]; unread by us).

## Sources (each read 2026-10-17)
[S1] noembed.com oEmbed for both video ids (titles, channel @HiggsfieldAI) · [S2] higgsfield.ai/blog/higgsfield-blender-plugin
(20 Aug 2026) · [S3] higgsfield.ai/plugins/blender · [S4] higgsfield.ai/creator-hub/changelog · [S5]
higgsfield.ai/blog/why-ai-video-credits-run-out · [S6] higgsfield.ai/blog/higgsfield-mcp-gpt6-astra-games-2 · [S7]
higgsfield.ai/blog/higgsfield-3d-jutsu · [S8] x.com/higgsfield/status/2092255768770920506 and
x.com/higgsfield_ai/status/2096342420543660277 (text via api.fxtwitter.com) · [S9] x.com/JSFILMZ0412/status/2093663876692754713
· [S10] erikataranto.com/en/blog/higgsfield-blender (cites video 2) · [S11] neurosignal.tech/save-ai-credits-higgsfield-blender-workflow
(links video 2; its install steps differ from Higgsfield's pages: treat with care) · [S12] rar.design/posts/higgsfield-blender-plugin-guide.md
(Chinese) · [S13] developersdigest.tech/blog/gpt-6-blender-interactive-3d (sponsored by Higgsfield) · [S14]
developers.openai.com/api/docs/pricing, vorplabs.com/models/releases/gpt-6-astra · [S15] search snippets of youtube.com
