# fal.ai model menu · 5 s, 9:16 açaí-bowl turntable shot

Read 2026-10-17. Nothing run, nothing spent. Every price and ability below was read that day from the model's own page:
`https://fal.ai/models/<endpoint-id>/llms.txt` (fal's root llms.txt says current prices live there), plus the model's HTML
page where the price is token-based and the per-size table sits only on the page. Endpoint ids from fal's public catalogue
`https://api.fal.ai/v1/models` (1,510 endpoints listed). Anything not on a page is written "needs checking".
**Licence:** "fal: commercial" = fal's own `license_type` / `licenseType` field for that endpoint (catalogue API and model
page, read 2026-10-17). No llms.txt states licence terms, and no maker's own terms were read: unclear until read.
Our previs is 720×1280, 24 fps (ffprobe `out/previs.mp4`). Choice of "strongest" is judgement, not measured.

## A · Keyframe images that follow our layout

| Endpoint (link = page read) | Price (read 2026-10-17) | Depth / control input | Input image | 9:16 / size | Max res | Licence |
|---|---|---|---|---|---|---|
| [fal-ai/flux-control-lora-depth/image-to-image](https://fal.ai/models/fal-ai/flux-control-lora-depth/image-to-image/llms.txt) | $0.04 per MP | **yes**: `control_lora_image_url` (depth), `control_lora_strength` 0–2 | **yes**: `image_url` (img2img, `strength` 0.01–1, default 0.85) | `portrait_16_9` preset or custom w×h | needs checking | fal: commercial (FLUX.1 [dev] base) |
| [fal-ai/z-image/turbo/controlnet](https://fal.ai/models/fal-ai/z-image/turbo/controlnet/llms.txt) | $0.0065 per MP | **yes**: `image_url` is the control image; `preprocess` none/canny/depth/pose; `control_scale` | no (control only) | `portrait_16_9` or custom | needs checking | fal: commercial |
| [fal-ai/nano-banana-pro/edit](https://fal.ai/models/fal-ai/nano-banana-pro/edit/llms.txt) | $0.15 per image; 4K ×2 ($0.30) | no control field | **yes**: `image_urls` (list, required) | `aspect_ratio` incl. 9:16 | 1K / 2K / 4K | fal: commercial |
| [google/nano-banana-2.1/edit](https://fal.ai/models/google/nano-banana-2.1/edit) | token-priced; page table, edit with two 1K inputs: $0.044 (1K), $0.063 (2K), $0.138 (4K) | no | **yes**: `image_urls` | `aspect_ratio` incl. 9:16 | 4K | fal: commercial |
| [openai/gpt-image-2/edit](https://fal.ai/models/openai/gpt-image-2/edit) | token-priced; page table, high quality, one input: 1024×1536 $0.178, 1920×1080 $0.158, 3840×2160 $0.413 (medium 1024×1536 $0.054) | no; `mask_url` for local edits | **yes**: `image_urls` (≤16) | `image_size` presets/custom; 9:16 price not in table | largest listed 3840×2160 | fal: commercial |
| [bytedance/seedream/v5/pro/edit](https://fal.ai/models/bytedance/seedream/v5/pro/edit/llms.txt) | $0.0675 per image ≤1536² px area, $0.135 up to 2048²; +$0.0045 per extra input image ("tentative") | no | **yes**: `image_urls` (≤10) | custom, aspect 1/16–16 | area ≤ 2048×2048 | fal: commercial |

Also read (same day, same URL pattern): `blackforestlabs/flux-3/edit-image` $0.048 per 1K image (other tiers needs
checking; 9:16; ≤10 refs; up to 4k) · `fal-ai/flux-2-pro/edit` $0.03 first MP + $0.015 per extra MP of input and output ·
`fal-ai/flux-pro/kontext` $0.04/image, `/kontext/max` $0.08 (one `image_url`, 9:16) · `fal-ai/nano-banana-2/edit` $0.08
per 1K image · `fal-ai/qwen-image-edit-2511` $0.03/MP · `alibaba/qwen-image-3/edit` $0.04 (1K) / $0.075 (2K) ·
`fal-ai/flux-general` $0.075/MP (ControlNet, ControlNet-union, control LoRAs on FLUX.1 [dev]).

## B · Video from a first and last frame (or more keyframes)

| Endpoint | 720p (read 2026-10-17) | 1080p (read 2026-10-17) | Durations · 5 s? | 9:16 | Last-frame field | Control / extra | Licence |
|---|---|---|---|---|---|---|---|
| [fal-ai/kling-video/o3/pro/image-to-video](https://fal.ai/models/fal-ai/kling-video/o3/pro/image-to-video/llms.txt) | $0.112/s audio off, $0.14/s on (audio default off); no resolution field, one price | same (resolution needs checking) | 3–15 s · yes | follows start image (accepts aspect 0.40–2.50) | `end_image_url` (start `image_url`) | `multi_prompt`, `shot_type` | fal: commercial |
| [blackforestlabs/flux-3/keyframes-to-video](https://fal.ai/models/blackforestlabs/flux-3/keyframes-to-video/llms.txt) | $0.17/s | $0.29/s | 5–20 s · yes | `aspect_ratio` 9:16 | `keyframes[]` {`frame_index`, `image_url`}, ≤10 (sibling `first-last-frame-to-video`: `end_image_url`, same price) | audio on by default | fal: commercial |
| [luma/agent/ray/v3.2/image-to-video](https://fal.ai/models/luma/agent/ray/v3.2/image-to-video/llms.txt) | $0.30 per 5 s | $1.20 per 5 s | 5 s (10 s only with keyframes) · yes | `aspect_ratio` 9:16 | `end_image_url`, or `keyframes` (1–64) + `keyframe_indexes` (0–120 at 5 s) | HDR/EXR options (extra cost) | fal: commercial |
| [minimax/h3-max/reference-to-video](https://fal.ai/models/minimax/h3-max/reference-to-video/llms.txt) | no 720p: 768P $0.08/s (480P $0.05/s) | 1080P $0.16/s | 0.92–15 s float (may run ~0.7 s long; billed on requested) · yes | `aspect_ratio` 9:16 | `end_image_url` + `middle_image_url`/`middle_frame_time` (480P/768P only) | reference images/videos; 4,096 ref tokens included, then $0.02/1k | fal: commercial |
| [fal-ai/veo3.1/first-last-frame-to-video](https://fal.ai/models/fal-ai/veo3.1/first-last-frame-to-video/llms.txt) | $0.20/s no audio, $0.40/s with | same as 720p | 4 / 6 / 8 s · **no 5 s** | `aspect_ratio` 9:16 | `last_frame_url` (required; `first_frame_url`) | none; page status "unlisted" | fal: commercial |
| [bytedance/seedance-2.0/us/image-to-video](https://fal.ai/models/bytedance/seedance-2.0/us/image-to-video/llms.txt) | $0.3034/s | $0.682/s | 4–15 s or auto · yes | `aspect_ratio` 9:16 | `end_image_url` | none | fal: commercial |

Also read: `fal-ai/kling-video/v3/pro/image-to-video` $0.112/s audio off, $0.168/s on (**audio defaults on**;
`start_image_url`/`end_image_url`; `elements` object refs) · `alibaba/wan-3.0/image-to-video` $0.10/s 720p, $0.20/s 1080p
(2–30 s, 9:16, `end_image_url`) · `google/gemini-omni-flash/v1.1/image-to-video` $0.10/s 720p, $0.15/s 1080p (3–10 s,
9:16, `end_image_url`) · `fal-ai/veo3.1/fast/first-last-frame-to-video` $0.10/s no audio (4/6/8 s) ·
`fal-ai/pixverse/v6/transition` $0.045/s 720p, $0.09/s 1080p no audio (1–15 s, 9:16, `end_image_url`) ·
`bytedance/seedance-2.5/us/image-to-video` "roughly" $0.473/s 720p, $1.164/s 1080p (aspect always auto) ·
`minimax/h3-max/image-to-video` 768P $0.052/s promo until 31 Oct, then $0.08/s · `lightricks/ltx-2.5/image-to-video/pro`
$0.12/s 720p (6/8/10 s only: no 5 s).

## C · Video-to-video restyle

| Endpoint | Price (read 2026-10-17) | One 5 s 720p take | Max input | 9:16 | Reference image | Licence |
|---|---|---|---|---|---|---|
| [alibaba/happy-horse/video-edit](https://fal.ai/models/alibaba/happy-horse/video-edit/llms.txt) | 720p $0.28/s ($0.14 per input s + $0.14 per output s); 1080p $0.56/s | $1.40 | input 3–60 s; output = input, capped at first 15 s | output keeps source aspect (1:2.5–2.5:1) | `reference_image_urls` ≤5 | fal: commercial |
| [fal-ai/kling-video/o3/pro/video-to-video/edit](https://fal.ai/models/fal-ai/kling-video/o3/pro/video-to-video/edit/llms.txt) | $0.168/s (page: 5 s = $0.84) | $0.84 | 3–15.05 s; ≥720 px each side, ≤3840; 23–60 fps | output aspect needs checking | `image_urls` + `elements`, ≤4 total | fal: commercial |
| [fal-ai/wan-vace-14b/depth](https://fal.ai/models/fal-ai/wan-vace-14b/depth/llms.txt) | $0.08 per video s 720p ($0.06 580p, $0.04 480p), seconds counted at 16 fps | 81 frames = 5.06 s → $0.405 | `num_frames` 81–241 (≈15 s at 16 fps) | `aspect_ratio` 9:16 | `ref_image_urls`, `first_frame_url`, `last_frame_url` | fal: commercial |
| [fal-ai/ltx-2.3-quality/render-to-real](https://fal.ai/models/fal-ai/ltx-2.3-quality/render-to-real/llms.txt) | $0.0024075 per MP of output (w×h×frames, rounded up) | 720×1280×121 fr ≈ 112 MP → ≈ $0.27 | ≈6 s at 720p, ≈15 s at 480p (`num_frames` 9–481, 24 fps default) | keeps source aspect | `image_url` = first-frame anchor | fal: commercial |
| [minimax/h3-max/3d-to-video](https://fal.ai/models/minimax/h3-max/3d-to-video/llms.txt) | 768P $0.08/s, 1080P $0.16/s (min 5 s) + reference tokens as H3 Max reference-to-video | ≈ $0.96 (page's 5 s 16:9 768P example; 9:16 needs checking) | Blender video ≤15 s, ≤32 shots | needs checking | `reference_image_urls` | fal: commercial |
| [luma/agent/ray/v3.2/video-to-video](https://fal.ai/models/luma/agent/ray/v3.2/video-to-video/llms.txt) | 5 s: $0.72 540p, $1.08 720p, $2.16 1080p | $1.08 | output 5 s or 10 s; input limit needs checking | needs checking | `start_image_url` or `keyframes` ≤64; `controls` incl. depth | fal: commercial |

Also read: `fal-ai/kling-video/o3/pro/video-to-video/reference` $0.168/s (`aspect_ratio` 9:16) ·
`fal-ai/kling-video/o3/standard/video-to-video/edit` $0.126/s · `fal-ai/wan-22-vace-fun-a14b/depth` $0.10 per video s 720p
(16 fps count) · `fal-ai/wan/v2.7/edit-video` $0.10/s 720p, $0.15/s 1080p (input 2–10 s, 9:16, `reference_image_url`) ·
`google/gemini-omni-flash/v1.1/edit` $0.10/s 720p · `blackforestlabs/flux-3/edit-video` $0.03/s 720p (input <15 s, no
reference image) · `decart/lucy-restyle` $0.01/s · `xai/grok-imagine-video/edit-video` $0.08/s at 720p (input cut to
854×480 max and 8 s).

## Not readable / needs checking
- Output resolution of Kling O3 / 3.0 image-to-video (no resolution field, one price) and Kling O3 edit's output aspect.
- Max output size of FLUX control-LoRA depth and Z-Image ControlNet (schema bound 14142 px is generic, not a model limit);
  whether $/MP is billed pro rata or rounded up.
- GPT Image 2 edit at a 9:16 size (table has 1024×1536 and landscape rows only); GPT Image 2.5 Sunburst/Flare edit
  per-image prices (token-priced, table not read); FLUX 3 edit-image above 1K.
- MiniMax: reference-token cost of our 5 s clip in 3D-to-video, its 9:16 support, and whether start/middle/end images in
  reference-to-video count as reference tokens. H3 Max image-to-video and Vidu Q4 prices are promotional (end 31 Oct / 30 Nov).
- Audio: FLUX 3, Wan 3.0 and Seedance generate audio by default and list one price; whether turning it off is cheaper.
- Luma Ray 3.2 video-to-video: input length limit and output aspect.
- "Happy Horse 1.0": fal's page is titled "Happy Horse Video Edit" with no version; v1.1 exists only for image/reference/text-to-video.
- Veo 3.1 first-last-frame is "unlisted" on fal (live, not deprecated) and absent from the public catalogue listing.
- Licences: fal's field says commercial for every row; the makers' own terms (Google, OpenAI, ByteDance, Kuaishou,
  Alibaba, Black Forest Labs, Luma, MiniMax, Tongyi) were not read: **unclear** until read.
