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

---

# Added 2026-10-18 on the founder's Mac: the five reference videos themselves

`tools/ref.sh` on each link. Study only: the videos, captions and sheets stay in `tools/out/` (ignored by git), nothing
was sent to fal, no shot is copied. **Said** = in the video's transcript (YouTube's automatic captions, which mishear
names: "Kick sell" and "Hixson" for Higgsfield, "C dance" for Seedance; corrected here only where the screen or the
description confirms the name). **Shown** = visible on the one contact sheet looked at (sheet 1: the first 48 cuts) or in
the video's description. A "said" result is the narrator's claim; nobody here has checked it.

| # | Video | Channel, posted, length | Sheet 1 covers | Who pays |
|---|---|---|---|---|
| 1 | `vUYq38wC_xI` GPT Astra 6 + Blender + Higgsfield | Higgsfield AI, 12 Sep 2026, 15:36 | 0:00–4:30 | Higgsfield's own channel |
| 2 | `OiULPvTJ-0E` How to save AI credits with Higgsfield + Blender | Higgsfield AI, 28 Aug 2026, 19:48 | 0:00–1:17 | Higgsfield's own channel |
| 3 | `AdjllfZuqYM` A $1,000,000 ad using just 2 tools | Higgsfield AI, 23 Dec 2025, 15:32 | 0:00–6:42 | Higgsfield's own channel |
| 4 | `VlBbcYQBlOo` Cinematic product ad with Higgsfield (full workflow) | Maamria AI, 16 Oct 2026, 10:44 | 0:00–0:44 (the finished ad) | affiliate link (shown) |
| 5 | `nAyV8ZzbG2w` The AI ad workflow agencies don't want you to know | Lucas AI, 15 Oct 2026, 7:35 | 0:00–0:41 (a promo reel) | affiliate link (shown) |

## Video 1 · an agent builds the blocking in Blender, Seedance 2.5 renders it
1. Install the Higgsfield plugin in Blender and log in; in the chat app turn on Higgsfield's plugin and call its Blender
   skill, which joins the chat, Blender and Higgsfield's MCP (said). The chat with "GPT-6 Astra" picked, and the plugin
   page: shown.
2. Give the story and ask for an editable camera path with slight handheld drift. Astra plans the beats and builds a room
   of flat-coloured boxes, the character's path, and a camera on a curve aimed at a separate target; it checks the 3D view
   by looking at it as it builds (said). The chat beside a Blender view of pastel boxes: shown.
3. Revise in words (keep the room and opening move, replace the ending with a pull-back into a bigger copy of the room);
   Astra edits the scene (said).
4. Send the blocking's first frame to Nano Banana as a layout reference with a short look description; pick one result.
   **For the loop, that one picture is used as both the opening and the closing frame** (said).
5. Export the blocking as a video, used as a motion reference. Seedance 2.5 through the MCP: 30 s, 16:9, one continuous
   shot, two versions to choose from (said).
6. Same pattern, other scenes (said): a mirror shot (15 s; the mirror is an opening into a mirrored copy of the room;
   four character options generated, one attached with the blocking, two 15 s versions); a concert (30 s with the cuts
   already in the blocking; 66 boxes in rings of 10, 20 and 36; the choreography goes in the prompt so the model doesn't
   copy the stiff boxes; music and vocal directions in the same request); a 30 s one-take vacuum ad that ends on the
   product, with references for the hero, a woman's outfit and the vacuum.
7. 3D Jutsu, in the browser (said): build or edit blocking there, or pull blocking and camera out of a reference video;
   stand-ins coloured by role (black the man, white the woman, yellow the cooks), separate paths for camera and people;
   four reference images (two character sheets, two locations), the rest described in words; Astra writes the prompt.
- Claims vs shown: no 3D skills needed, Astra built it alone (said). The coloured blocking and the finished frames are both
  on the sheet (shown); how much was fixed by hand is not. No depth, mask or start/end-frame setting is mentioned. The
  description links "skills & prompts" and the blocking files (shown; not opened).

## Video 2 · Claude builds the blocking; a second-by-second prompt from the playblast
1. Download the plugin, paste its Bridge URL into Claude's Connectors, drag the plugin into Blender, log in (said). The
   Claude prompt box with "Opus 5" picked: shown. The captions also say to change a mode and set the model to high, but
   the words are garbled: unclear.
2. Ask in plain words (a corridor, a man walking, the camera following); press 0 for the camera view and play; then ask
   for textured walls, different framings and an animated lens (said). The Bridge keeps Claude to sound 3D rules (said,
   not explained).
3. Playblast: Output properties → video, 1920×1080, 24 fps, MPEG-4 → View → Viewport Render, about 15 s (said).
4. Give Claude the playblast and the assets; ask for a 30 s Seedance prompt written second by second to match the camera
   in the clip; paste it into Higgsfield, Seedance 2.5, 30 s (said). Later scenes attach the grey-box render, the
   character sheet and the assets in Cinema Studio: "the gray box handles camera timing and the references handle
   visuals" (said).
5. Dialogue (said): six people at a round table, four cuts, 30 s; the camera given as a shot list (rails, targets, cuts),
   then subtle handheld added; Claude also writes the lines; three iterations. The same prompt without blocking: seats
   swap between takes, the 180° rule breaks, nearly 5,000 credits spent with no usable shot.
6. Camera moves (said): an orbit across three scenes, a floor rise, a robo-arm whip; the path has control points to drag
   instead of re-prompting; the camera aims at a target beside the head, not at the head. Without blocking the camera spins
   on its own axis, goes top-down and the character shrinks; with blocking it worked first time.
7. Soda ad, "hypermotion" (said): can = cylinder, ice = cubes, limes = spheres; a 10-scene skeleton from one message;
   client notes fixed by recutting the blocking, not rewriting prompts; **the liquid scene is left black in the blocking
   and the model fills it**; extra cans coloured by flavour, with one line of text saying which colour is which; a speed
   ramp built into the blocking. Blocking and result side by side for the can and for the glass: shown, same layout.
8. Car ad, 19 shots in 30 s (said): four assets (two characters, the car, the location) plus the blocking render; **every
   prompt has two halves: the structure (the reference video, cuts, camera, timing; never changes) and the style (the
   look)**; the same edit remade as 2.5D, 2D ink and toy-box 3D. The same wheel framing in three looks: shown.

## Video 3 · no 3D: keyframes in Nano Banana Pro, then Kling 2.6
- Dec 2025, before the Blender plugin. Said: short prompts plus style words (commercial shot, shot on ARRI, anamorphic);
  Nano Banana Pro at 4K, four results at a time, 21:9 (that 21:9 looks more cinematic because of the training data: said,
  unchecked); then **edit the chosen still in words instead of regenerating** (remove the reindeer but keep the rigs,
  rename the jar's label, change the expression) and compose from earlier stills by number (the jar from image two on
  the table from image one); animate each still with Kling 2.6, no audio, one camera move each, Higgsfield's prompt
  enhancer on; keep the usable half of a take; fix in the edit (crop out a stray pole, speed-ramp to the beat, push in
  on the product); a pack shot as the last keyframe, static camera; royalty-free music.
- Shown: Nano Banana Pro · 21:9 · 4K · 4 results; Kling 2.6 with an Audio switch. The label "Crush Candy" reads clearly
  on the jar and the wrapper, but it is the model's own invented logo, checked against nothing.
- Claims vs shown: an ad that would need $50,000, a 30-person crew and a month, made for $0 in one night (said); a price card
  ($17.4–$75) is on the same sheet (shown), so it is not $0.

## Video 4 · Cinema Studio: element sheets → scene stills → Seedance 2.5
- Said: a project with folders (characters, locations, props, scene images, videos); each character as one three-panel
  sheet (face, full front, back), the prompt asking for the same face, clothes and proportions in all three, saved as an
  element; locations in Nano Banana 2.1 (16:9, 2K–4K), another angle made with the first image as reference; the pack
  in Nano Banana 2.1 at 1:1, then the display box made from the approved pack so logo, mascot and colours carry over;
  **every scene composed as a still first (location + characters + product + framing and positions) and fixed there
  before any video credits**; then Seedance 2.5, 16:9, 1080p, one prompt per section with timed actions, acting notes,
  camera, dialogue, music and sound, each named reference attached to its image; busy sections split into shorter
  clips; end shot 4 s. **Check the brand lettering and, if needed, put the original approved logo back in the edit**:
  the only one of the five to say this. The character model's name is garbled ("GPT image 2.5 Sunburst"): needs checking.
- Shown: the finished ad, the same shopkeeper and teens across shots at thumbnail size (judged by eye, not measured).

## Video 5 · Ads Studio: a brand kit from a URL, then image ads and "Ad Multiplier"
- Said: paste a brand's website and it builds a brand kit (name, logo, tagline, palette, selling points, look, audience,
  tone, fonts) to correct by hand; it pulls the products; choose how many ads, the credit cost shows before generating;
  edit one in words while keeping product, logo, text, price and call to action unchanged; Ad Multiplier takes a
  reference video (yours or a preset), the product and a prompt, and makes a variation. Admitted: the results still need
  checking for product details, text and consistency before use.
- Shown: Higgsfield's promo reel (brand-kit fields, a batch count, product cards "Analyzing"). Nothing on 3D or camera.

## What the transcripts settle from the open questions above
- What the video model gets: the blocking's **playblast as a motion reference**, plus image references (videos 1 and 2,
  said). The look still comes from the blocking's first frame through Nano Banana (video 1, said). Depth passes, masks or
  ControlNet: **not mentioned in any of the five**.
- Start/end frames: video 1 uses one picture as both the opening and the closing frame of a loop, with the blocking video
  carrying the motion between (said).
- The playblast settings (1920×1080, 24 fps, about 15 s) do come from video 2 (said), as [S10] had them.
- Video 1 went up on 12 Sep 2026 (shown, in its metadata).
- The agent: video 1 is GPT-6 Astra with Higgsfield's chat plugin; video 2 is Claude through the Bridge connector, with
  Opus 5 on screen.
- Attempts: two versions per shot (video 1), three iterations (video 2), first try for the camera moves (video 2): all
  said, none counted by us.

## What we could borrow for S3 (our reading; untested)
1. **One keyframe as both first and last frame, with the previs as the motion reference** (video 1's loop). A 360° turn
   starts and ends on the same view; given the previs video too, the model is shown what the far side does instead of
   inventing it. Route 1 (`render-to-real` on the previs) already has this shape; a route-2 variant using the 0° keyframe
   twice is worth pricing against three keyframes.
2. **The prompt in two halves**: structure (camera, timing, the turn, second by second) and style (the look). Video 2 has
   Claude read the playblast to get the timing; our prompt compiler (Next 4) can write it exactly from the shot list.
   The structure half is frozen per shot; only the style half changes between retries.
3. **A colour legend in the prompt**: our previs layers are already coloured stand-ins; add one line saying which colour
   is which ingredient (video 1's roles, video 2's flavours).
4. **Fix the still before paying for motion** (videos 3 and 4): edit the S3 keyframe in words (keep the bowl, layers and
   turntable, change only the named thing) rather than re-rolling it, and let the checker pass it before any video call.
5. **Name each reference in the prompt and attach it under that name** (video 4): the slots our product reference pack
   will fill once the café agrees.
6. **Two takes per route, then choose** (video 1): a per-route cap of two in the S3 total.
7. **The real logo goes back in afterwards** (video 4): already our plan (logo and end card from code); S3 has no logo,
   so it doesn't test this.
8. Later shots, not S3: leave the honey out of S4's blocking and let the model fill it (video 2's black liquid scene);
   keep the usable part of a take and speed-ramp in the edit (video 3).
- Not borrowed: the 21:9 advice (we are 9:16), the "$0" and "first try" claims, any shot or look from the videos.

## Sources (read 2026-10-18 on the founder's Mac)
The five YouTube pages above: each video's automatic English captions (`en-orig`), its description and chapters
(`video.info.json`) and one contact sheet (`sheet_1.png`), made by `tools/ref.sh` into `tools/out/<id>/` (ignored by
git). Not opened: the prompt and project-file links in the descriptions (higgsfield.ai/s/…, a Notion page of prompts).
