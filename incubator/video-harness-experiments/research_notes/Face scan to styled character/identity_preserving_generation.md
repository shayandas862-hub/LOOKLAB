# Keeping a real person's identity (face, chosen hair, chosen outfit) consistent across AI images and AI video — routes, licences, prices (as of October 2026)

All pages below were read on **2026-10-14** unless a different date is stated. Prices change often; treat every price as "as read on 2026-10-14". "Secondary" marks a non-primary source (blog, reseller, aggregator); "search summary" marks a fact taken from a search-engine summary of the named page, not from a full page read. Older information keeps its own date.

## 1. Fine-tuning a person (LoRA): FLUX, Kontext, Qwen-Image, Wan, Hunyuan — trainers, photos, time, price, licence

### Takeaway
A person LoRA is cheap and fast on hosted trainers (about $2 per FLUX run on fal or Replicate; $4–5 per 1,000 steps for Wan 2.2 video LoRAs on fal). The licence depends on where the LoRA runs, not only on how it was trained. FLUX.1 [dev], Kontext [dev], FLUX.2 [dev] and klein-9B weights are non-commercial when you run them yourself. Images generated on Replicate (and, per its page tag, on fal) may be used commercially, and BFL sells a self-hosted [dev] licence. FLUX.1 [schnell], FLUX.2 klein-4B, Qwen-Image(-Edit) and Wan 2.2 are Apache-2.0 and safe to run yourself. HunyuanVideo's licence excludes the EU, UK and South Korea.

### Cited Findings
**FLUX.1 [dev] licence (Black Forest Labs, BFL)**
- The licence is titled "FLUX [dev] Non-Commercial License v2.0", "Last Updated: November 25, 2025". — [BFL non-commercial licence](https://bfl.ai/legal/non-commercial-license-terms)
- Non-commercial purpose is limited "only so far as you do not receive any direct or indirect payment arising from the use of the FLUX [dev] Model". The licence adds: "For clarity, use (a) for revenue-generating activity, (b) in direct interactions with or that has impact on end users, or (c) to train, fine tune, or distill other models for commercial use, in each case, is not a Non-Commercial Purpose." — [BFL licence](https://bfl.ai/legal/non-commercial-license-terms)
- Outputs, §2(d): "We claim no ownership rights in and to the Outputs." "You may use Output for any purpose (including for commercial purposes), except as expressly prohibited herein." "You may not use the Output to train, fine-tune, or distill a model that is competitive with a FLUX [dev] Model." — [BFL licence](https://bfl.ai/legal/non-commercial-license-terms)
- Fine-tunes and LoRAs are Derivatives: "any (i) modified version of the FLUX [dev] Model (including but not limited to any customized or fine-tuned version thereof)". "Any restrictions set forth herein regarding the FLUX [dev] Model also apply to any Derivative you create". — [BFL licence](https://bfl.ai/legal/non-commercial-license-terms)
- Tension: outputs are commercially usable, but generating them commercially (revenue-generating use, or use that reaches end users) is not a Non-Commercial Purpose. A product that runs [dev] itself for paying users therefore needs a commercial licence. — [BFL licence](https://bfl.ai/legal/non-commercial-license-terms) (this reading is our inference from the two quoted clauses)
- BFL's self-hosted [dev] commercial licence: "$999 for up to 100,000 images" a month, plus "$0.01 per generated image above 100,000" (search summary of BFL's help centre). — [BFL Help: Self-serve dev license overview & pricing](https://help.bfl.ai/articles/9272590838-self-serve-dev-license-overview-pricing)
- BFL's pricing page now offers licence tiers that include "Fine-tuning & LoRA rights" and "Permissive commercial use" (Enterprise). Its model menu lists "FLUX 3 Image", FLUX.2 [flex]/[pro]/[max]/[klein] 4B/[klein] 9B and FLUX VTO (virtual try-on). The calculator showed "$0.048 / image" at 768×768 with no model selected. — [BFL pricing](https://bfl.ai/pricing)

**Hosted generation clears the output question (Replicate)**
- "If you generate images on Replicate with FLUX.1 models and their fine-tunes, then you can use the images commercially." "If you download the weights off Replicate and generate images on your own computer, you can't use the images commercially." — [Replicate FLUX.1 dev readme](https://replicate.com/black-forest-labs/flux-dev/readme)

**Other FLUX variants**
- FLUX.1 [schnell] is "Released under the `apache-2.0` licence, the model can be used for personal, scientific, and commercial purposes." — [HF FLUX.1-schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell)
- FLUX.1 Kontext [dev] "falls under the FLUX.1 [dev] Non-Commercial License". Its card claims it can "Have character, style and object reference without any finetuning" with "minimal visual drift" across successive edits. — [HF FLUX.1-Kontext-dev](https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev)
- FLUX.2 [klein] 4B is Apache 2.0 ("you can use it commercially with no fees or approvals"). klein 9B is under the FLUX Non-Commercial License, and its commercial rights come via the API (search summary of BFL's help centre). — [BFL Help: run or fine-tune FLUX.2 klein locally](https://help.bfl.ai/articles/7108141705-can-i-run-or-fine-tune-flux-2-klein-locally); [HF FLUX.2-klein-4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B)
- FLUX.2 [dev] (32B) is under the FLUX Non-Commercial License. FLUX.2 [max] reportedly takes "Up to 10 reference images simultaneously" (secondary, August 2026). — [invideo blog](https://invideo.io/blog/flux-ai-image-generator/)

**Trainers and prices**
- fal `flux-lora-fast-training` costs "$2 per training run", scaling linearly with steps (default 1,000). Inputs are a ZIP of images, a `trigger_word`, `is_style` and `steps`. It advises images "ideally 1024x1024 or greater". The page states "Commercial usage rights included for trained models" and claims "From concept to model in minutes". It gives no image count. — [fal FLUX LoRA fast training](https://fal.ai/models/fal-ai/flux-lora-fast-training)
- fal `flux-kontext-trainer` costs "$2.5 per 1000-step training run" (minimum 500 steps, $1.25). It trains on before/after image pairs (`INDEX_start` / `INDEX_end`), so it is an edit LoRA, not a straightforward identity LoRA. The page is tagged "Commercial use". — [fal FLUX Kontext trainer](https://fal.ai/models/fal-ai/flux-kontext-trainer)
- Replicate's fast FLUX trainer is "under 2 minutes" and "under $2" (changelog, 2025-05-23, search summary). Replicate's blog says training runs on H100 at "$0.001528 per second", and "a 20-minute training (typical when using about 20 training images and 1000 steps)" costs "about $1.85" (older post, search summary). — [Replicate changelog 2025-05-23](https://replicate.com/changelog/2025-05-23-faster-flux-trainer); [Replicate blog: fine-tune FLUX](https://frontend.replicate.com/blog/fine-tune-flux)
- Wan 2.2 trainers on fal (search summary of fal pages):
  - `wan-22-image-trainer`: $0.0045/step.
  - `wan-22-trainer/t2v-a14b`: $0.004/step; accepts images, videos or both.
  - `wan-22-trainer/i2v-a14b`: $0.005/step; needs at least one video.
  - Older Wan 2.1 trainers: $0.005/step.
  - All have a 100-step minimum. Wan 2.1 guidance: "at least 10 images and/or videos".
  — [fal Wan 2.2 image trainer](https://fal.ai/models/fal-ai/wan-22-image-trainer); [fal Wan 2.2 T2V trainer](https://fal.ai/models/fal-ai/wan-22-trainer/t2v-a14b); [fal Wan 2.2 I2V trainer](https://fal.ai/models/fal-ai/wan-22-trainer/i2v-a14b); [fal Wan 2.1 trainer](https://fal.ai/models/fal-ai/wan-trainer/llms.txt)

**Open-weight video and image bases**
- Wan 2.2 weights: "The models in this repository are licensed under the Apache 2.0 License." "We claim no rights over the your generated contents, granting you the freedom to use them while ensuring that your usage complies with the provisions of this license." Variants are T2V-A14B and I2V-A14B (480P/720P) and TI2V-5B (720P, 24 fps). — [HF Wan2.2-I2V-A14B](https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B)
- Wan open weights stop at 2.2 (July 2025). Wan 2.5-Preview, 2.6 (16 December 2025), 2.7 and 3.0 have no weights on Hugging Face and are hosted-only (secondary analysis; some aggregators wrongly list 2.6 as open). — [howaiworks: Wan open weights stopped at 2.2](https://howaiworks.ai/blog/alibaba-wan-open-weights-stopped-at-2-2)
- HunyuanVideo licence: "THIS LICENSE AGREEMENT DOES NOT APPLY IN THE EUROPEAN UNION, UNITED KINGDOM AND SOUTH KOREA AND IS EXPRESSLY LIMITED TO THE TERRITORY". A Hugging Face commit shows the exclusion was widened from EU-only to add the UK and South Korea. — [HF HunyuanVideo commit](https://huggingface.co/tencent/HunyuanVideo/commit/a4ed25a99d7eb9cf21e12f5fd8052d266f2105fc); [DeepWiki HunyuanVideo license](https://deepwiki.com/Tencent/HunyuanVideo/5-license-and-legal)
- Qwen-Image-Edit-2511: "Qwen-Image is licensed under Apache 2.0." It claims "character consistency has been significantly improved" and preservation of "the identity and visual characteristics of the subject" in portrait edits. It accepts multiple input images (the example uses 2). — [HF Qwen-Image-Edit-2511](https://huggingface.co/Qwen/Qwen-Image-Edit-2511)

### Inferences
- For a commercial agent, the cheapest licence-clean LoRA path is one of two:
  - Train and infer a FLUX LoRA on a hosted platform (Replicate states commercial output rights; fal tags "Commercial use").
  - Self-host an Apache-2.0 base: FLUX.1 schnell, FLUX.2 klein-4B, Qwen-Image or Wan 2.2.
- Self-hosting FLUX.1 [dev] or Kontext [dev] for a product needs BFL's paid licence (about $999 a month for up to 100k images).
- A LoRA locks the face, and hair and outfit too if the training photos show them consistently. Varying hair or outfit per shot works better with a face-only dataset plus prompting or a reference image; that is practice knowledge, not verified in a source here.
- Wan 2.2 LoRAs are the main open route to a person-specific *video* model. A 1,000-step run costs about $4–5 on fal.

### Gaps
- Recommended photo counts and wall-clock training times for fal's FLUX trainer: not stated on the page. Replicate's "about 20 images" figure comes from an older blog post.
- HunyuanVideo LoRA trainer price on fal or Replicate: not found.
- Whether fal's "Commercial use" tag covers FLUX.1 [dev] LoRA outputs generated on fal in the same way as Replicate's statement: no explicit fal licence text found.
- FLUX.2 / FLUX 3 per-model API prices and reference counts on docs.bfl.ai: not read.
- HunyuanCustom's own licence: not checked. It probably inherits the Hunyuan territory clause, but this is unverified.

## 2. Zero-shot identity adapters (InstantID, PuLID / PuLID-FLUX, IP-Adapter FaceID, PhotoMaker, InfiniteYou, UNO/USO, 2025–26 successors) and the InsightFace licence problem

### Takeaway
Almost every popular zero-shot face adapter conditions on an InsightFace ArcFace embedding (antelopev2 or buffalo_l), and InsightFace's pretrained models are "for non-commercial research purposes only". Several adapters also carry non-commercial weights themselves (IP-Adapter FaceID: research only; InfiniteYou: CC BY-NC 4.0). InsightFace now sells commercial model licences by email, with no published price. For a commercial agent these adapters are blocked unless InsightFace (and, for InfiniteYou, ByteDance) license them. An Apache-2.0 face encoder (AuraFace) exists as a substitute, but the adapters would have to be retrained on it.

### Cited Findings
- InsightFace README: "The code of InsightFace is released under the MIT License. There is no limitation for both academic and commercial usage." The training data and models trained on it "are available for non-commercial research purposes only." Models auto-downloaded by the Python library "follow the above license policy(which is for non-commercial research purposes only)." — [InsightFace GitHub](https://github.com/deepinsight/insightface)
- InsightFace update dated 2025-11-24: "For open-sourced face recognition models (e.g., buffalo_l package) … please contact recognition-oss-pack@insightface.ai for licensing". "For inswapper series face swap models … please contact contact@insightface.ai for licensing and additional support." — [InsightFace GitHub](https://github.com/deepinsight/insightface)
- InsightFace licensing page: for open-source packs "(buffalo_l, antelopev2, buffalo_s, buffalo_m, etc.)": "Code is MIT licensed; models require separate commercial licensing." Terms are "tailored to your deployment scale and use case". It also lists "face swapping commercial rights". No prices are published. — [InsightFace licensing](https://www.insightface.ai/solutions/face-recognition-licensing)
- IP-Adapter-FaceID: "IP-Adapter-FaceID models are released exclusively for research purposes and is not intended for commercial use." It uses InsightFace `buffalo_l` embeddings. Variants are FaceID, FaceID-Plus, PlusV2, the SDXL versions, and FaceID-Portrait (multiple face images, default 5). — [HF IP-Adapter-FaceID](https://huggingface.co/h94/IP-Adapter-FaceID)
- InfiniteYou (ByteDance, FLUX.1-dev base): "Our model is released under the Creative Commons Attribution-NonCommercial 4.0 International Public License … for academic research purposes only." InsightFace downloads "must follow their original licenses and be used only for academic research purposes." Variants are aes_stage2 (default) and sim_stage1 (higher identity similarity). — [HF ByteDance/InfiniteYou](https://huggingface.co/ByteDance/InfiniteYou)
- ByteDance on InfiniteYou (April 2025 thread): it "cannot be used for commercial purpose at this point due to some data, policy, and license issues" (search summary). — [HF InfiniteYou discussion #13](https://huggingface.co/ByteDance/InfiniteYou/discussions/13)
- InstantID: its weights are listed as Apache 2.0. The HF thread argues "Anything trained on the insight face embeddings has to inherit the license". An InstantX member replied: "We agree, we plan to train on other face encoders that support commercial license" (no ETA, no follow-up). — [HF InstantID discussion #2](https://huggingface.co/InstantX/InstantID/discussions/2)
- PuLID: the code is "Apache-2.0" and the README states no weights licence. PuLID-FLUX v0.9.0 was the first version ("ID fidelity is not high enough for some male inputs"); v0.9.1 has "better ID fidelity". — [PuLID GitHub](https://github.com/ToTheBeginning/PuLID)
- PuLID-FLUX loads InsightFace through a dedicated node, "Load InsightFace (PuLID Flux)" (secondary). PuLID-FLUX also sits on FLUX.1-dev, so it inherits BFL's [dev] terms when self-hosted. — [comfy.icu PulidFluxInsightFaceLoader](https://comfy.icu/node/PulidFluxInsightFaceLoader)
- AuraFace-v1 (fal), an ArcFace-style encoder: "License: apache-2.0", "trained on commercially and publicly available data sources to enable its usage in commercial setting". It lists "avatars via an IP-Adapter" as a use. LFW 0.99650, CFP-FP 0.95186, AgeDB 0.96100, CALFW 0.94700, CPLFW 0.90933. "The efficacy of the model in subject preservation may vary on the basis of etchnicity" [sic]. It is loaded via InsightFace's `FaceAnalysis(name="auraface")`, which uses MIT code. — [HF fal/AuraFace-v1](https://huggingface.co/fal/AuraFace-v1)
- 2025–26 successors in research:
  - Lynx (ByteDance, CVPR 2026) adds an "ID-adapter" using ArcFace face embeddings plus a "Ref-adapter" on an open DiT video model. — [arXiv 2509.15496](https://arxiv.org/pdf/2509.15496)
  - Stand-In is a plug-in identity control with about 1% extra parameters, trained on 2,000 pairs (CVPR 2026). — [arXiv 2508.07901](https://arxiv.org/html/2508.07901v3)
  - Phantom and MAGREF appear as subject-to-video baselines in Lynx's tables. — [arXiv 2509.15496](https://arxiv.org/pdf/2509.15496)

### Inferences
- Any adapter that computes an ArcFace embedding with antelopev2 or buffalo_l at inference carries InsightFace's non-commercial model restriction into production (InstantID, PuLID / PuLID-FLUX, IP-Adapter FaceID, InfiniteYou, very likely Lynx). The cure is a paid InsightFace licence or retraining on AuraFace or another commercially licensed encoder.
- Adapters also inherit their base model's licence. Most new ones target FLUX.1-dev, which is BFL non-commercial when self-hosted.
- In 2026 the pragmatic commercial route for zero-shot identity is hosted multi-reference models (section 3), not self-hosted adapters.

### Gaps
- PhotoMaker (V1, V2) licence text and whether V2 uses InsightFace: the README page did not show them.
- UNO / USO (ByteDance) weight licences: not checked.
- Lynx, Stand-In, Phantom and MAGREF weight releases and licences: not confirmed.
- InsightFace commercial licence prices: not published, email only.
- Whether InsightFace's licensing covers antelopev2 for generation use (rather than recognition) is not stated.

## 3. Multi-reference image models that keep identity without training (Gemini "Nano Banana" family, GPT Image, FLUX Kontext / FLUX.2, Seedream, Qwen-Image-Edit)

### Takeaway
Hosted multi-reference image models are now the cheapest zero-training way to make identity-locked keyframes with a chosen hair and outfit:
- Gemini 3 Pro Image takes up to 5 character images plus 6 object images and 3 style images, at $0.134 per 1K/2K image.
- Gemini 3.1 Flash Image takes up to 4 character images plus 10 object images, at $0.067 per 1K image.
- Seedream 4.5 takes up to 10 references at about $0.03–0.04 per image (secondary).
- GPT Image accepts several input images and is billed per token.
- Qwen-Image-Edit-2511 is the Apache-2.0 self-hostable option.

Google requires you to hold the rights to uploaded images, and all Gemini outputs carry SynthID. Gemini 2.5 Flash Image ("nano banana") was shut down on 2 October 2026.

### Cited Findings
- Gemini API pricing page ("Last updated 2026-10-14 UTC"):

  | Model | Standard price per image | Batch / Flex price per image |
  |---|---|---|
  | Gemini 2.5 Flash Image (shut down 2026-10-02) | $0.039 | $0.0195 |
  | Gemini 3 Pro Image ("Nano Banana Pro"), 1K/2K | $0.134 | $0.067 |
  | Gemini 3 Pro Image, 4K | $0.24 | $0.12 |
  | Gemini 3.1 Flash Image ("Nano Banana 2"), 0.5K / 1K / 2K / 4K | $0.045 / $0.067 / $0.101 / $0.151 | $0.022 / $0.034 / $0.050 / $0.076 |
  | Gemini 3.1 Flash Lite Image, 1K | $0.0336 | $0.0168 |
  | "Gemini Nano Banana 2.1", 1K / 2K / 4K | $0.0336 / $0.0504 / $0.113 | $0.0168 / $0.0252 / $0.0567 |

  The page says Gemini 2.5 Flash Image "will be shut down on October 2, 2026". — [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- Gemini image references (up to 14 in total):
  - `gemini-3-pro-image`: up to 6 object, 5 character and 3 style images.
  - `gemini-3.1-flash-image` and `gemini-nano-banana-2.1`: up to 10 object and 4 character images.
  - `gemini-3.1-flash-lite-image`: up to 14 object images and no character images.
  - Uploaders must have rights to the images, and the Prohibited Use Policy applies ("Don't generate content that infringe on others' rights, including videos or images that deceive, harass, or harm").
  - "All generated images include a SynthID watermark."
  — [Gemini API image generation](https://ai.google.dev/gemini-api/docs/image-generation)
- TechCrunch at the Nano Banana Pro launch (2025-11-20): "consistency for up to five people", and $0.139 per 2K image at launch, since superseded by $0.134. — [TechCrunch](https://techcrunch.com/2025/11/20/google-releases-nano-banana-pro-its-latest-image-generation-model); fal lists Nano Banana Pro at $0.15 (1K) and $0.30 (4K) (secondary, search summary) — [fal: nano banana pro vs 2](https://fal.ai/learn/tools/nano-banana-pro-vs-nano-banana-2)
- OpenAI image token prices per 1M tokens:

  | Model | Image input | Image output | Text input |
  |---|---|---|---|
  | gpt-image-2 | $8 | $30 | $5 |
  | gpt-image-2.5-sunburst | $8 | $30 | $5 |
  | gpt-image-2.5-flare | $8 | $30 | $5 |
  | gpt-image-1.5 | $8 | $32 | $5 |
  | gpt-image-1-mini | $2.50 | $8 | $2 |
  | gpt-image-1 | $10 | $40 | $5 |

  Per-image prices are only in the calculator. — [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
- OpenAI image edits accept multiple input images (the docs example uses four). "If you provide multiple input images, the mask will be applied to the first image." Outputs are "filtered in accordance with our content policy". — [OpenAI image generation guide](https://developers.openai.com/api/docs/guides/image-generation)
- Runway's API resells image models with per-reference fees:
  - `gpt_image_2_5_flare` / `_sunburst`: "1 credit ($0.01) per reference image".
  - `grok_imagine_image_2`: $0.01 per reference, once per request.
  - `gen4_image` (Runway References): $0.05 at 720p, $0.08 at 1080p.
  - `gen4_image_turbo`: $0.02.
  — [Runway API pricing](https://docs.dev.runwayml.com/guides/pricing/)
- Seedream:
  - Seedream 4.5 takes up to 10 reference images (secondary). — [The Rundown](https://www.therundown.ai/tools/seedream-4-5)
  - About $0.04 per image on BytePlus (secondary). Volcengine lists ¥0.25 per image (secondary). — [EvoLink](https://evolink.ai/seedream-4-5)
  - BytePlus's official Seedream 4.0 doc lists $0.03 per image; failed generations are not charged. — [BytePlus ModelArk Seedream 4.0](https://docs.byteplus.com/en/docs/ModelArk/1824718)
- FLUX.1 Kontext [dev] offers character reference "without any finetuning" (non-commercial weights; see section 1). FLUX.2 [max] takes up to 10 references (secondary). — [HF FLUX.1-Kontext-dev](https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev); [invideo](https://invideo.io/blog/flux-ai-image-generator/)
- Qwen-Image-Edit-2511 is Apache 2.0, multi-image, with "character consistency … significantly improved" and the ability to fuse "two separate person images into a coherent group shot". — [HF Qwen-Image-Edit-2511](https://huggingface.co/Qwen/Qwen-Image-Edit-2511)

### Inferences
- For "face + chosen hair + chosen outfit", one pattern fits these models: send face references in the *character* slots and the hair and outfit references in the *object* slots. Gemini 3 Pro Image's split (5 character, 6 object, 3 style) suits this. This is practice, not a vendor claim.
- Gemini 3.1 Flash Image at $0.067 per 1K image is about half the price of 3 Pro Image. It has one fewer character slot.
- None of these image models publish an identity-fidelity number. The agent needs its own face-similarity verifier (section 6).

### Gaps
- Exact per-image costs of GPT Image models by quality and size: calculator only, not read.
- OpenAI's `input_fidelity` parameter for faces: not found in the part of the guide that was read.
- Seedream real-person policy on BytePlus: not found.
- Official Seedream 4.5 / 5.0 BytePlus prices: secondary sources only.
- No independent benchmark comparing identity fidelity across these models was found.

## 4. Video models with reference / character consistency (Kling, Runway, Veo, Sora, Higgsfield, MiniMax Hailuo, Vidu, Wan, Hunyuan, Seedance)

### Takeaway
Real-person video with reference images is now gated by policy as much as by quality:
- OpenAI shut down the Sora API on 24 September 2026. Its API had already rejected human faces.
- Seedance 2.x blocks real faces unless the user is identity-verified or pre-authorized.
- Veo 3.1 takes up to 3 subject images (8 s, `allow_adult`) at $0.40/s standard or $0.10–0.12/s Fast.
- Kling O1 / 3.0 take up to 7 references with "elements" at about $0.112/s.
- Vidu Q2 takes up to 7 references at $0.10–0.30 per clip up to 720p.
- Runway Act-Two drives motion at $0.05/s, and Runway's policy requires the depicted person's permission.

The open-weight video options are Wan 2.2 (Apache 2.0) and HunyuanVideo (not licensed in the EU, UK or South Korea).

### Cited Findings
**Google Veo 3.1**
- Gemini API: "Veo 3.1 now accepts up to 3 reference images", `referenceType: "asset"`. Veo 3.1 Lite and Veo 3 do not support references. Duration "Must be "8" when using extension, reference images or with 1080p and 4k". Resolutions are 720p (default), 1080p and 4k. — [Gemini API Veo](https://ai.google.dev/gemini-api/docs/veo)
- Person rules: image-to-video and reference images allow `allow_adult` only. "In EU, UK, CH, MENA locations, `allow_adult` is the only allowed value for `personGeneration`." — [Gemini API Veo](https://ai.google.dev/gemini-api/docs/veo)
- Watermark: "Videos created by Veo are watermarked using SynthID". — [Gemini API Veo](https://ai.google.dev/gemini-api/docs/veo)
- Vertex AI: `veo-3.1-generate-001` and `veo-3.1-fast-generate-001` take "up to three images of a single person, character, or product". `veo-3.1-generate-preview` "only returns 8 second videos when you use subject images". `allow_adult` "Only allow generation of adult people and faces". — [Vertex AI: generate videos from references](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/use-reference-images-to-guide-video-generation)
- Prices per second, with audio:

  | Model | 720p | 1080p | 4K |
  |---|---|---|---|
  | Veo 3.1 | $0.40 | $0.40 | $0.60 |
  | Veo 3.1 Fast | $0.10 | $0.12 | $0.30 |
  | Veo 3.1 Lite | $0.05 | $0.08 | not supported |

  — [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing). Via Runway's API: veo3.1 costs $0.40/s with audio and $0.20/s without; veo3.1_fast costs $0.15/s and $0.10/s. — [Runway API pricing](https://docs.dev.runwayml.com/guides/pricing/)
- Google's video overview now recommends "Gemini Omni Flash" as the default video model, with Veo 3.1 for extension and last-frame control. Omni's reference support was not documented on the pages read. — [Gemini API video](https://ai.google.dev/gemini-api/docs/video)

**OpenAI Sora 2 (cameos, now "characters")**
- The API docs say the Sora 2 models and Videos API "were shut down on September 24, 2026" and "No one-to-one replacement API is available". While it ran:
  - Durations were 16/20 s, extendable to 120 s.
  - "Input images with faces of humans are currently rejected."
  - Characters were "reusable non-human subjects" uploaded as MP4 to `POST /v1/videos/characters`; character uploads depicting human likeness were blocked by default, with access only through sales.
  - "Real people—including public figures—cannot be generated."
  — [OpenAI video generation guide](https://developers.openai.com/api/docs/guides/video-generation)
- The Sora app shutdown was announced on 24 March 2026, with app and website off on 26 April 2026 and the API on 24 September 2026 (secondary). Cameos were renamed "characters" after Cameo sued. Sora 2 reportedly remains inside paid ChatGPT. — [TechCrunch 2026-03-24](https://techcrunch.com/2026/03/24/openais-sora-was-the-creepiest-app-on-your-phone-now-its-shutting-down/); [TheStreet](https://www.thestreet.com/technology/openai-is-shutting-down-sora-and-the-disney-deal-is-off); [techjournal (secondary)](https://techjournal.org/what-happened-to-sora-openai-shutdown)
- In-app cameo creation used a one-time face-and-voice recording, and the owner controlled and could revoke access (secondary; OpenAI's help article returned 403). — [aifreeapi (secondary)](https://www.aifreeapi.com/en/posts/sora-2-cameo-yourself-tutorial); [OpenAI Help (403)](https://help.openai.com/en/articles/12435986-generating-content-with-cameos)

**Kling (Kuaishou)**
- Official API rates (search summary of kling.ai/dev/pricing, page 72 days old; the direct fetch rendered nothing). One unit is $0.14.

  | Kling model | 720p | 1080p |
  |---|---|---|
  | 3.0, no audio | $0.084/s (0.6 units) | $0.112/s (0.8 units) |
  | 3.0, native audio | $0.126/s | $0.168/s |
  | Omni, with video input | $0.126/s | $0.168/s |

  — [Kling API pricing](https://kling.ai/dev/pricing)
- fal Kling O1 reference-to-video:
  - "supporting up to 7 simultaneous reference inputs", shared across elements, style references and a start frame.
  - "Each tracked element supports one frontal image plus multiple reference angles."
  - 5 or 10 s; "$0.112 per second".
  - It claims to keep characters' "identity through complex camera movements".
  — [fal Kling O1 reference-to-video](https://fal.ai/models/fal-ai/kling-video/o1/reference-to-video)
- Kling V3 on fal adds "element referencing, multi-character coreference". The Pro image-to-video tier is listed at $0.112/s without audio, $0.168/s with audio and $0.196/s with voice control (search summary; fal pages conflict). — [fal Kling 3](https://fal.ai/kling-3)
- Kling's privacy policy says: "We do not analyze any facial recognition features in pictures or identify individuals from such pictures" (secondary record). No Kling-specific consent rule for real faces was found. — [ConductAtlas Kling privacy record](https://conductatlas.com/platform/kling-ai/kling-ai-privacy-policy/provision/CA-P-077887/no-facial-recognition-or-individual-identification/)

**Runway**
- API at $0.01 per credit:

  | Runway model | Price |
  |---|---|
  | `gen4_image` (References) | $0.05 (720p) / $0.08 (1080p) per image |
  | `gen4_turbo` | $0.05/s |
  | `gen4.5` | $0.12/s |
  | `act_two` (performance capture) | $0.05/s |
  | `aleph2` | $0.28/s, $0.56 minimum |
  | `gwm1_avatars` (real-time avatars) | $0.02 upfront plus $0.02 per 6 s |
  | `hailuo3` (resold) | $0.02 per reference image or keyframe |
  | `seedance2_5` (resold) | "reference images and audio are free" |

  — [Runway API pricing](https://docs.dev.runwayml.com/guides/pricing/)
- Runway's usage policy (secondary summaries; the primary URL returned 404) reportedly bans using another person's image, video or audio without their permission. "absence of objection is insufficient", and the ban applies "regardless of whether the resulting content is distributed externally". — [ConductAtlas Runway usage policy](https://conductatlas.com/platform/runway/runway-usage-policy/prohibition-on-real-person-likeness-without-permission/); [ConductAtlas content policy](https://conductatlas.com/platform/runway/runway-content-policy/prohibition-on-unauthorized-use-of-another-persons-likeness/)

**ByteDance Seedance**
- fal prices (search summary of fal pages):
  - Seedance 2.0 reference-to-video: $0.3034/s at 720p, $0.682/s at 1080p.
  - Seedance 2.0 Fast: $0.2419/s at 720p.
  - A 0.6 multiplier applies when video inputs are given.
  - Seedance 2.5 is about $0.473/s at 720p with audio (secondary).
  — [fal Seedance 2.0 reference-to-video](https://fal.ai/models/bytedance/seedance-2.0/reference-to-video); [fal Seedance 2.5 reference-to-video](https://fal.ai/models/bytedance/seedance-2.5/reference-to-video); [cellcog (secondary)](https://cellcog.ai/blog/seedance-2-5-pricing/)
- Real faces:
  - ByteDance suspended a Seedance 2.0 feature on 2026-02-10 after a face photo produced a voice like the subject's. — [TechNode](https://technode.com/2026/02/10/bytedance-suspends-seedance-2-0-feature-that-turns-facial-photos-into-personal-voices-over-potential-risks/)
  - Seedance was relaunched globally with a ban on real-face uploads. — [Phemex news (secondary)](https://phemex.com/news/article/bytedance-relaunches-seedance-20-globally-with-restrictions-on-realface-uploads-68605)
  - Reports quote the API docs: the models "do not support direct upload of reference images or videos containing real human faces". Identity verification or prior legal authorization is required for real-person subjects (secondary; no primary ByteDance page read). — [seedrouter (secondary)](https://seedrouter.ai/blog/seedance-real-person-error); [ruoqijin (secondary)](https://ruoqijin.com/blog/seedance-access-and-face-policy)

**MiniMax Hailuo**
- S2V-01 (subject reference) takes "a subject's face photo" in `subject_reference` to keep facial features consistent. — [MiniMax API docs S2V](https://platform.minimax.io/docs/api-reference/video-generation-s2v)
- At launch MiniMax said S2V-01 "may occasionally follow prompts less precisely" (January 2025). — [Hailuo on X](https://x.com/Hailuo_AI/status/1877393578818941298)
- Reseller prices are about $0.64–0.65 per 6 s 720p clip. — [EachLabs](https://www.eachlabs.ai/minimax/sv2/minimax-s2v-01); [OminiGate](https://ominigate.ai/en/models/minimax/s2v-01)
- MiniMax's newer "H3" model restricts open-source use in the US, Europe and South Korea (secondary news). — [SCMP](https://www.scmp.com/tech/tech-trends/article/3362951/chinas-minimax-curbs-overseas-access-new-ai-video-model-over-copyright-disputes)

**Vidu Q2 (fal reference-to-video)**
- Up to 7 reference images; 1–8 s; 360p, 520p, 720p and 1080p.
- "0.1 $ for every 360p video, 0.2 $ for every 520p video, 0.3 $ for 720 p video"; 1080p is "0.2 $ along with 0.1 $ for every video second".
- It claims to keep identity "through 180° camera moves" (vendor claim).
— [fal Vidu Q2 reference-to-video](https://fal.ai/models/fal-ai/vidu/q2/reference-to-video)

**Higgsfield Soul ID**
- Higgsfield's blog says to train Soul ID once "on 20+ photos of a person". — [Higgsfield blog](https://higgsfield.ai/blog/Soul-ID-AI-Character-Consistency)
- A third-party guide reports 20–80 photos on the website, about 25 credits (about $1.25) per training or generation, and consent required for any identifiable face (terms §4.2, §5.3) (secondary, unverified). — [Creatify (secondary)](https://creatify.ai/blog/higgsfield-soul-prompts-for-product-ads)

**Wan and Hunyuan (open weights)**
- Wan 2.2 is Apache 2.0, at 480p/720p (see section 1). Alibaba's hosted Wan 2.6 / 2.7 is about $0.10/s at 720p and $0.15/s at 1080p (secondary). — [HF Wan2.2](https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B); [cliprise (secondary)](https://www.cliprise.app/news/alibaba-wan-2-2-2-6)
- HunyuanVideo's licence excludes the EU, UK and South Korea (see section 1).

### Inferences
- These are the providers a real-person pipeline can use today, each with its own policy:
  - Google: Veo 3.1 references with `allow_adult`, and you must own the rights.
  - Kling O1 / 3.0: elements, with no explicit consent rule found.
  - Vidu Q2.
  - Runway: Act-Two and Gen-4 References, with consent required.
  - Higgsfield: consent required.
  - Self-hosted Wan 2.2 with a person LoRA.
- Sora is gone from the API. Seedance needs verified identity.
- Kling elements at about $0.112/s and Vidu Q2 at $0.30 per 720p clip are much cheaper per second than Veo 3.1 standard ($0.40/s). Veo 3.1 Fast ($0.10–0.12/s) competes on price but caps references at 3 and clips at 8 s.
- A sensible agent design is a keyframe-first pipeline:
  1. An identity-locked still from a multi-reference image model (section 3).
  2. Image-to-video, or reference-to-video with the same face, hair and outfit references.
  3. An automatic face-similarity check on sampled frames (section 6).
- Every provider that has a policy wants proof of consent from the depicted person, so the agent should store a signed consent record with each identity.

### Gaps
- Kling's official reference ("elements") pricing and limits for 3.0 / 3.x, and Kling's terms on uploading real faces: not confirmed from primary pages.
- Runway's primary usage-policy text and date: the URL returned 404, so only secondary summaries were used.
- Whether Runway Gen-4 / Gen-4.5 video accepts reference images through the API: not confirmed.
- Higgsfield's official prices and terms: not read directly.
- Official MiniMax S2V and Hailuo 3 prices: not found.
- Gemini Omni Flash reference-image support and price: not documented on the pages read.
- Max lengths with references: Kling 10 s and Vidu 8 s per the fal pages; Veo 8 s with references.

## 5. Face swap and face restoration routes and their licences

### Takeaway
The standard swap model (InsightFace inswapper) is not free for commercial use; InsightFace now sells "face swapping commercial rights" by email. CodeFormer is S-Lab non-commercial. GFPGAN code is Apache 2.0. FaceFusion appears to be OpenRAIL-AS, but its default swap models carry their own licences.

### Cited Findings
- InsightFace: "For inswapper series face swap models … please contact contact@insightface.ai for licensing". Its licensing page lists "face swapping commercial rights" with no terms published. — [InsightFace GitHub](https://github.com/deepinsight/insightface); [InsightFace licensing](https://www.insightface.ai/solutions/face-recognition-licensing)
- CodeFormer: "This project is licensed under NTU S-Lab License 1.0". The licence text permits "Redistribution and use for non-commercial purpose" and adds "In the event that redistribution and/or use for commercial purpose in source or binary forms…" (permission from the authors is required). — [CodeFormer GitHub](https://github.com/sczhou/CodeFormer); [CodeFormer LICENSE](https://raw.githubusercontent.com/sczhou/CodeFormer/master/LICENSE)
- GFPGAN: "GFPGAN is released under Apache License Version 2.0." The README does not state the weights' licence or the licences of its dependencies (StyleGAN2, facexlib). — [GFPGAN GitHub](https://github.com/TencentARC/GFPGAN)
- FaceFusion: the README licence badge reads "OpenRAIL-AS". The README did not list model licences. — [FaceFusion GitHub](https://github.com/facefusion/facefusion)

### Inferences
- Face swap as a final consistency pass is the riskiest route for licence and policy reasons:
  - inswapper is unlicensed for commercial use unless bought.
  - Swapping a real person's face sits at the edge of every provider's likeness policy.
- If restoration is needed, GFPGAN (Apache code) is the clean option to check. CodeFormer is non-commercial.

### Gaps
- FaceFusion's exact model list and each model's licence (hyperswap, simswap, ghost, blendswap, uniface): not read.
- GFPGAN weight licence and facexlib's detector licences: not confirmed.

## 6. Measuring identity consistency automatically (verifier for the agent)

### Takeaway
The usual metric is cosine similarity between face embeddings of a reference and generated frames. InsightFace ArcFace (buffalo_l / antelopev2) is non-commercial. For a commercial verifier the options are:
- AuraFace-v1 (Apache 2.0, LFW 99.65%).
- YuNet + SFace (Apache 2.0, secondary source).
- A paid InsightFace licence.
- A managed API such as AWS Rekognition (Group 1 APIs including CompareFaces at $0.001 per image for the first 1M a month).

### Cited Findings
- InsightFace pretrained models (the ArcFace packs) are "for non-commercial research purposes only" unless licensed commercially. — [InsightFace GitHub](https://github.com/deepinsight/insightface)
- AuraFace-v1 is Apache-2.0 and trained on commercial or public data "to enable its usage in commercial setting". It scores LFW 0.99650, CFP-FP 0.95186, AgeDB 0.96100, CALFW 0.94700 and CPLFW 0.90933. It warns that efficacy "may vary on the basis of etchnicity" [sic]. It returns `normed_embedding` via InsightFace's MIT code. — [HF fal/AuraFace-v1](https://huggingface.co/fal/AuraFace-v1); the HF blog says it "does not match the performance of the original ArcFace" (search summary) — [HF blog: AuraFace](https://huggingface.co/blog/isidentical/auraface)
- YuNet (detector) plus SFace (recogniser) is listed as "Apache 2.0 - commercial-safe" (secondary). — [LocalAI face recognition docs](https://localai.io/docs/features/face-recognition/)
- AWS Rekognition Image prices: Group 1 APIs (including CompareFaces) cost $0.0010 per image for the first 1M a month, then $0.0008 for the next 3M, $0.0006 for the next 30M and $0.0004 beyond. — [AWS Rekognition pricing](https://aws.amazon.com/rekognition/pricing/)
- Lynx (ByteDance) itself conditions on ArcFace embeddings. ArcFace is the de facto identity signal in research on identity-preserving video. — [arXiv 2509.15496](https://arxiv.org/pdf/2509.15496)

### Inferences
- A practical verifier would work like this:
  1. Detect and align the face in each sampled frame (for example every 0.5 s).
  2. Embed it with AuraFace (self-hosted, Apache) or call Rekognition CompareFaces.
  3. Compare against the consented reference set.
  4. Take the per-shot minimum and median similarity.
  5. Reject or regenerate when the score falls below a threshold calibrated on the person's own photos.
- Hair and outfit consistency need a separate check, for example a garment or hair crop compared with an image embedding such as CLIP or DINO. Face-recognition models are designed to ignore hair and clothing. This is general knowledge, not sourced here.
- Biometric processing of a real person's face probably triggers BIPA or GDPR special-category rules, so consent must cover the verifier as well. This is not legal advice and is not sourced here beyond ConductAtlas's note on BIPA and GDPR in section 4.

### Gaps
- AdaFace weight licence and dlib's face-recognition model licence: not confirmed.
- How Rekognition CompareFaces is metered (per call versus per image in a pair): not confirmed.
- Azure Face (Limited Access) and Google Cloud options: not checked.
- No published threshold for "same identity" in generated media was found.

## 7. Watermarking and provenance on outputs (C2PA, SynthID) by provider

### Takeaway
Google marks every Gemini image and Veo video with SynthID (documented), and reportedly adds C2PA to Nano Banana 2 images (secondary). OpenAI images carry C2PA plus SynthID. Runway is a C2PA signer. Nothing was found for Kling, Vidu, MiniMax or Seedance.

### Cited Findings
- Gemini images: "All generated images include a SynthID watermark." — [Gemini API image generation](https://ai.google.dev/gemini-api/docs/image-generation)
- Veo: "Videos created by Veo are watermarked using SynthID", verifiable on the SynthID platform. — [Gemini API Veo](https://ai.google.dev/gemini-api/docs/veo)
- Nano Banana 2 images reportedly carry both SynthID and a C2PA manifest (secondary). — [Promptyze (secondary)](https://promptyze.com/nano-banana-2-stamps-every-image-with-synthid-and-c2pa-heres-what-that-actually-means/)
- OpenAI's help article "C2PA and SynthID in OpenAI-generated images" says images from ChatGPT, Codex and the API carry C2PA metadata and a SynthID watermark, checkable at openai.com/verify. It warns that the signals "are not a guarantee that content is accurate, unedited, legally owned" (search summary). — [OpenAI Help 8912793](https://help.openai.com/en/articles/8912793-c2pa-in-images)
- Runway is listed as a C2PA signer ("C2PA 2024-06 | 2.2 | Runway Trust List"). — [Wikipedia: Content Credentials](https://en.wikipedia.org/wiki/Content_Credentials)
- C2PA metadata is easy to strip, while SynthID is designed to survive compression, cropping and screenshots (secondary). — [Layer3 Labs (secondary)](https://www.layer3labs.io/guides/synthid-explained)

### Inferences
- The agent should keep (not strip) provider C2PA manifests and add its own C2PA manifest recording the consent record and the models used. Re-encoding video generally drops C2PA, so signing should happen at final export.

### Gaps
- Kling, Vidu, MiniMax, Seedance / BytePlus, Higgsfield and fal/Replicate-hosted open models: no provenance or watermark statements found.
- Whether OpenAI SynthID adoption applies to all API image models: the help article was read only via search summary.
