# How AI ad platforms turn a product into a "commercial": the mechanism

Research 2026-10-17. Public pages only, **every link below read 2026-10-17**. Nothing was signed up for, run or spent.
**Stated** means the platform's own page (or the named article) says it. **Inferred** is my reading, and no page says it.
Prices are as read that day, and conflicting figures are both given. Freepik's pages blocked the reader (403), so Freepik is not covered.

## What they do, step by step (plain English)
1. **Get the product.** You paste a shop link or upload a few photos, and the site pulls out the pictures, name, logo and colours. *Stated* (Higgsfield, Creatify).
2. **Plan the ad.** You pick a template ("Unboxing", "TV Spot"), or a language model writes the script and shots. *Stated* for templates. *Stated by OpenAI* for Higgsfield's planning. Any detail beyond that is *inferred*.
3. **Make the first picture.** An image model puts the product into a scene (Nano Banana, Seedream, Higgsfield Soul). *Stated* that these are on the menus. That ads usually start this way is *inferred*, backed by one teardown (Fooh).
4. **Animate it.** A video model (Seedance, Kling, Veo, Hailuo, Wan) moves the picture. It works from the first frame alone, from a first and a last frame, or with product photos passed in as "references" it must copy. *Stated.*
5. **Move the camera.** You pick a named move ("Dolly In", "360 Orbit"), type it, or draw an arrow. *Stated.* How a named move is built (a trained add-on or just prompt words) is *not stated*.
6. **Keep the product right.** Nobody promises it. Their levers are cleaner and more product photos, reference slots, prompts saying "exact logo", and regenerating. *Stated* as tips. That retrying is the main fix is *inferred*.
7. **Finish.** They upscale (Topaz or ByteDance), add captions, music, voice and an avatar, and cut to 9:16. *Stated* (Higgsfield, Creatify).
**In one line:** menus, templates and a prompt-writer sit on top of other companies' video models, plus a few house models
(Higgsfield Soul and DoP, Creatify Boreal and Aurora, Runway Gen-4.5 and Aleph). *Inferred* from the tables below.

## Higgsfield (aggregator with some house models)
| Q | Finding | Stated / inferred | Source |
|---|---|---|---|
| 1 | "30+ models including Sora 2, Kling 3.0, Veo 3.1". The home page also shows Wan 3.0, Seedance 2.5 and Nano Banana Pro | stated | [home](https://higgsfield.ai) |
| 1 | Sora 2 has gone: "Sora 2 is no longer part of the Higgsfield model lineup" (OpenAI removed it 24 Sep 2026). The home page meta still lists it | stated (pages conflict) | [blog 2026-10-03](https://higgsfield.ai/blog/sora-api-migration-guide) |
| 1 | House models: DoP is "Higgsfield's own proprietary model", "alongside Soul, Popcorn, and Cinema Studio". DoP is image-to-video only: one keyframe, 3 or 5 s | stated | [help: DoP](https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-dop) |
| 1 | Marketing Studio: "Every generation runs on Seedance 2.0"; avatars come from Soul 2.0 | stated | [marketing-automation](https://higgsfield.ai/marketing-automation) |
| 1 | GPT-4.1/GPT-5 plan the video and Sora 2 rendered it (OpenAI case study, Jan 2026) | stated by OpenAI, but seen only in a search excerpt (the page blocks readers) | openai.com/index/higgsfield |
| 2 | Marketing Studio steps: a link or ≤5 photos, then "the page is read automatically" (images, logo, colours, copy), then an avatar, then a mode (TV Spot, UGC, Tutorial, Product Review, Unboxing, Hyper Motion, Virtual Try On, Wild Card), then framing, then generate. ≤15 s per generation. Only Posters can be edited; everything else is regenerated | stated | [intro](https://higgsfield.ai/marketing-studio-intro), [help](https://higgsfield.ai/creator-hub/help-center/tools-and-workflows/how-do-i-use-marketing-studio-to-create-video-ads) |
| 2 | The product photos go into Seedance 2.0 as reference images. Seedance 2.0 takes ≤9 images, 3 videos and 3 audio files, with the tags @character, @style, @motion and @audio | inferred (the limits are stated) | [help: Seedance](https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-seedance) |
| 2 | Product-to-Video (Aug 2025): start from an image (upload or Soul). "Add Image" pastes the product photo into the frame at real scale. Then add arrows and short numbered labels, 2–3 actions, and generate. Image insertion works on Veo 3 and Hailuo 02 only, not Seedance | stated (Higgsfield's posts as reported by 2 write-ups; the posts now 404) | [aistudynow](https://aistudynow.com/higgsfield-product-to-video-no-prompts-draw-place-publish/), [postium](https://postium.ru/higgsfield-product-to-video/) |
| 2 | The marked-up frame (the pasted product plus arrows) is sent as the first frame, as visual instructions | inferred | – |
| 2 | Apps: "Bullet Time White: Spin around your product on a clean white background", "Angles 2.0: Generate any angle view for any image", Video Background Remover, Relight, Click to Ad. No model is named | stated | [apps](https://higgsfield.ai/apps) |
| 2 | A spin made from one photo has to invent the back of the product (the same problem as our 360° shot) | inferred | – |
| 2 | Genjutsu Object Swap takes a 4–30 s source video and ≤30 reference images, and replaces "a selected … product". "The movement and camera stay exactly as filmed." The model is not named | stated | [genjutsu](https://higgsfield.ai/genjutsu), [blog](https://higgsfield.ai/blog/higgsfield-genjutsu) |
| 2 | Upscale: "Choose ByteDance or Topaz Video for each clip", to 1080p, 2K or 4K | stated | [upscaler](https://higgsfield.ai/ai-video-upscaler) |
| 3 | Keeping the product exact: reference photos (≤5 product photos; a Brand Kit with logo, colours and fonts), Soul ID for faces (≥20 photos), Genjutsu references. None of the pages read describes a mask, inpainting, compositing or a logo check | stated (absence = not found) | pages above |
| 3 | In practice they regenerate until it looks right, and each retry costs credits | inferred | – |
| 4 | Camera: about 65 named presets, e.g. Dolly In, Super Dolly In, 360 Orbit, Lazy Susan, Bullet Time, Crash Zoom In, Robo Arm, FPV Drone, 3D Rotation. A preset is "a motion blueprint that defines the camera logic", and "Mix" combines presets | stated | [camera-controls](https://higgsfield.ai/camera-controls), DoP help |
| 4 | Preset preview files are named `wan2_5_motion`, `kling_motion` and `minimax_hailuo_motion`, so presets also run on those models, probably as motion LoRAs or prompt templates | inferred | camera-controls page source |
| 4 | Cinema Studio 4.0: "30+ camera movement presets and 50+ color palettes". Camera body, lens and focal-length (8–75 mm) dropdowns. Whether these become prompt words is not stated | stated, partly a third party | [cinema-studio](https://higgsfield.ai/cinema-studio), [vidpros 2026-06-06](https://vidpros.com/higgsfield-cinema-studio/) |
| 4 | Typed moves Seedance follows: "dolly in, truck left, arc shot, push in, pull back wide, handheld follow, crane up, orbital move". First and last frame are used for transitions | stated | help: Seedance |
| 5 | The pricing page needs JavaScript to read, so these figures come from two re-reads (aliteq 2026-10-04, hooked 2026-09-25). Per 5 s: Kling 3.0 ~7 credits at 720p, ~8 at 1080p; Seedance 2.0 ~22 at 720p; Seedance 1.5 ~3. A credit costs $0.030–0.070 depending on the plan (Starter is $19 for 270) | stated by third parties | [aliteq](https://aliteq.com/higgsfield-credits-explained), [hooked](https://www.hooked.so/compare/higgsfield-pricing) |
| 5 | So a 5 s 720p clip costs ≈ $0.21–0.49 on Kling 3.0 and ≈ $0.66–1.54 on Seedance 2.0. Genjutsu: 15 s at 720p is 104 credits ≈ $5.20 | inferred (arithmetic); Genjutsu stated | Genjutsu blog |

## Kling (makes its own model; checked as the engine the aggregators resell)
| Q | Finding | Stated / inferred | Source |
|---|---|---|---|
| 1 | Its own models: Kling VIDEO 3.0, 3.0 Omni and O1 (video and image) | stated | [elements guide 2026-02-05](https://kling.ai/quickstart/klingai-element-library-3-user-guide) |
| 2 | No product-ad wizard on the pages read; the building blocks are listed below | stated (absence = not found) | kling.ai |
| 3 | Elements: 2–4 photos of one thing (a main photo plus up to 3 more), props included. Element features "remain stable and consistent across all shots". With 3.0 start/end frames you can bind ≤3 elements, which "must appear in the reference frames" | stated | elements guide |
| 3/4 | Motion Brush: select or paint ≤6 elements and draw a path for each ("strictly follow the drawn trajectory"). The Static Brush will "fix pixels in the brushed areas". A path drawn on the background is "interpreted as a camera movement path" | stated | [motion brush](https://kling.ai/quickstart/how-to-animate-image-parts) |
| 2/3 | A teardown of a real ad: Nano Banana Pro makes the start frame ("Use the exact SKIMS logo from the reference (identical letter shapes, kerning, weight, proportions)"). The same model edits it into the end frame ("Take this exact picture as the base"). Kling 3.0 animates between the two: "Fast cinematic push-in … stabilized, premium product-commercial style", with a 360° turn | stated (Fooh, 2026-03-19) | [fooh](https://www.fooh.com/blog/skims-toothpaste-ai-ad) |
| 5 | kling.ai pricing wasn't readable. Atlas Cloud (2026-07-14): VIDEO 3.0, 5 s, 720p with audio is 45 credits, and Pro is ~$23.99 for ~3,000 credits, so ≈ $0.36 (that article contradicts itself). Runway's API: Kling 3.0 Pro without audio is 12 credits/s = $0.60 per 5 s | third party / stated; $ is arithmetic | [atlas](https://www.atlascloud.ai/blog/guides/kling-ai-pricing), Runway API |

## Runway (house models plus resold ones)
| Q | Finding | Stated / inferred | Source |
|---|---|---|---|
| 1 | House models: Gen-4.5 (first-frame image since 2026-01-21), Gen-4 References, Aleph 2.0 ("Edit a frame…", and the change carries through the video), Ruby (HDR grading). Resold: Kling 3.0/2.6/2.5, Sora 2 Pro, GPT-Image-1.5, Seedance 2.0 and 2.5 (first and last frame plus references), Hailuo 3.0 (keyframes plus refs), Seedream 5.0 (≤14 refs), Nano Banana 2, Wan 3.0 | stated | [changelog](https://runway.com/changelog) |
| 2 | Tutorials "How to Go from Product Shot to Social Ad in Minutes" and "Using 3D Assets in Gen-4 References": "use 3D asset pre-comps with Gen-4 References for even more control, consistency and production-ready fidelity". The method itself is in the video, not the page text | stated | [academy](https://academy.runwayml.com/tutorials) |
| 2 | Agent Skills: "Build an ad campaign, create a commercial … with a simple command" (07-02). Brand Kits "so you never re-upload logos, product shots or style references" (08-11) | stated | changelog |
| 3 | SAM3 Video Segmentation cuts an object out "as a transparent webm video" (07-28), and Seedream 5.0 Pro Layers handles "asset extraction". These are the tools you would need to composite a real product back in | tools stated; that use is inferred | changelog |
| 4 | Camera: no 2026 changelog entry covers camera control. There is a tutorial "Generate New Angles with Aleph" | stated | changelog, academy |
| 5 | API credits are $0.01 each. A 5 s clip: Gen-4.5 at 12/s = $0.60; Aleph 2 at 28/s = $1.40; Seedance 2.0 720p at 36/s = $1.80; Veo 3.1 without audio at 20/s = $1.00. App: Standard is $15 for 625 credits | rates stated; $ per 5 s is arithmetic | [API pricing](https://docs.dev.runwayml.com/guides/pricing/), [pricing](https://runway.com/pricing) |

## Creatify (built for ads)
| Q | Finding | Stated / inferred | Source |
|---|---|---|---|
| 1 | House models: Boreal ("Creatify's family of video generation models, built for video ads": Boreal-H3 and Boreal) and Aurora (avatars). The Asset Generator lists 71 video models (Seedance 2.5/2.0, Kling O3/3.0, MiniMax H3, Veo 3.1, Wan 3.0, Grok, Pixverse, LTX) and image models (Nano Banana 2.1/Pro, GPT-image-2, Flux 2, Seedream 5.0) | stated | [docs](https://docs.creatify.ai), [models](https://docs.creatify.ai/api-documentation/ai-generation/models), [Boreal](https://docs.creatify.ai/api-documentation/boreal/boreal) |
| 2 | URL to Video: the link is scraped for title, description, `image_urls`, `video_urls`, reviews, `logo_url` and `ai_target_audiences`. An optional edit adds a logo or drops poor images. Then a `script_style` and a `visual_style` template are applied (e.g. DynamicProductTemplate), an avatar (`aurora_v1_fast`) is added, with stock B-roll on by default, music, captions and a call to action | stated | [URL to Video](https://docs.creatify.ai/api-documentation/url-to-video/link-to-video) |
| 3 | Here the product stays exact because the shop's real photos and clips are cut into a template rather than regenerated | inferred (the scraped media are stated inputs) | – |
| 3/4 | Boreal-H3: ≤9 reference images, 3 videos and 3 audio files, plus a start and end frame; no claim about consistency. The camera has no setting and goes in the prompt ("Slow dolly-in, warm kitchen light, gentle steam") | stated | Boreal doc |
| 5 | Boreal-H3 costs 0.4 credits/s at 768p and 1.2 at 1088p, so 5 s is 2 or 6 credits. API Starter is $99 for 500 credits, so ≈ $0.40 or $1.19 | rates stated; $ is arithmetic | [billing](https://docs.creatify.ai/billing) |

**Also read: Krea.** It resells Seedance 2.5, Veo 3.1, Sora 2, Kling, Wan and Runway ([video](https://www.krea.ai/video), stated). Its own image
model is Krea 3 ("our latest in-house model"). It has a Node Editor and Train LoRA. Pro is $35 for 20,000 units, about 77 Kling 2.6 5 s videos, so ≈ $0.45 each
([pricing](https://www.krea.ai/pricing); the counts are stated, the $ is arithmetic).

## What this means for us
| Their step | Us today | Verdict |
|---|---|---|
| Product in from a link or photos (images, logo, colours) | No photos of the real bowl, and not the café's logo file (BRIEF.md) | **lack**: cheap (phone photos from 4+ angles plus their logo file) |
| An LLM plan or a template | Claude plus our shot list | have |
| An image model puts the product into a scene for the first frame | fal image models incl. depth-controlled FLUX; the previs fixes layout, depth and masks | have, and the layout is exact rather than prompted (stronger) |
| First and last frame, or several keyframes, into video | fal: Kling O3 `end_image_url`, FLUX 3 keyframes, Luma ≤64 keyframes (MODELS.md) | have access, not run yet |
| Product photos as references inside the video call (Seedance refs, Kling Elements) | Not wired; fal's Kling V3/O3 `elements`, MiniMax H3 reference and Happy Horse refs are listed | **lack**: cheap (2–4 photos per call) |
| Named camera presets, arrows, Motion Brush | Our moves are exact in code, and we can send a depth video for video-to-video (Wan VACE depth, Luma controls, MiniMax 3D-to-video) | have, and exact (stronger). Cheap to copy: their move words as prompt text |
| Swapping a video while keeping camera and motion (Genjutsu, Aleph) | Restyle endpoints are listed in MODELS.md | have access, not run yet |
| Other angles of one product (Angles 2.0, Bullet Time) | Our 3D gives the 0°/180°/360° keyframes, but the real bowl's back needs photos | half |
| Measuring whether the product came out right | None of the four states a measured check; our checker measures shape and brand colour | **only we have it** |
| Putting the real logo or end card back over the video | We have previs masks but no compositing or tracking step. No platform states it does this; Runway sells the cut-out tool | **lack**: cheap where the video follows the previs (masks line up; inferred, untested) |
| Retry until it is good | The checker can decide when to retry automatically | have the check; it needs a cap per shot |
| Upscale (Topaz or ByteDance) | Not set up; whether fal has it needs checking | **lack**: likely cheap |
| Captions, music, voice, avatar | Not built | lack; only type and music matter for this ad |

**Top three we lack:** (1) a product reference pack (real photos and the logo file) passed into the video model as references;
(2) a step that composites the real logo or end card back over the video using our masks, with the checker deciding when to retry; (3) finishing: upscale, then edit and music.
