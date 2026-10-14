# Dressing a personalised character in a chosen outfit: 2D try-on, video try-on and 3D garments (as of 14 October 2026)

All sources read on 2026-10-14 unless marked otherwise. "Unverified" means the claim comes only from a secondary source or an extraction that could not be cross-checked. A licence that is missing or unclear is treated as **not cleared for commercial use**.

---

## 1. 2D diffusion virtual try-on research models (IDM-VTON, OOTDiffusion, CatVTON, StableVITON, Leffa, FitDiT, Any2AnyTryon and 2025–2026 successors): inputs, full outfits vs single garments, exact licences

### Takeaway
Almost every well-known open try-on model is non-commercial. IDM-VTON, OOTDiffusion, CatVTON, StableVITON and FitDiT are CC BY-NC-SA 4.0. Any2AnyTryon has no licence and runs on FLUX.1 [dev], which is non-commercial. Leffa's MIT label covers code and weights that were trained on non-commercial datasets (VITON-HD, Dress Code), so its commercial status is unclear, which means no. All of these models do one garment category per pass (upper, lower or dress) and depend on a mask, DensePose or human parsing. The 2026 research frontier (Tstars-Tryon, Oxygen-TryOn, WearWow, Garments2Look) is multi-reference, mask-free and outfit-level. Those systems are mostly unreleased or proprietary, and their own papers show general editors and specialised models still fail on full outfits and layering.

### Cited Findings
**Licences (quoted from LICENSE files, READMEs and model cards)**
- **IDM-VTON**: the repo LICENSE.txt is "Attribution-NonCommercial-ShareAlike 4.0 International". The README says: "The codes and checkpoints in this repository are under the CC BY-NC-SA 4.0 license." The HF card says `license: cc-by-nc-sa-4.0` and `base_model: stable-diffusion-xl-1.0-inpainting-0.1` (last modified 2024-04-22) — [GitHub LICENSE.txt](https://raw.githubusercontent.com/yisol/IDM-VTON/main/LICENSE.txt); [README](https://raw.githubusercontent.com/yisol/IDM-VTON/main/README.md); [HF API](https://huggingface.co/api/models/yisol/IDM-VTON)
- **IDM-VTON inputs**: the dataset layout requires `image-densepose` and `agnostic-mask` per image, and DensePose comes from detectron2. It supports VITON-HD and the Dress Code categories, including `dresses` — [README](https://raw.githubusercontent.com/yisol/IDM-VTON/main/README.md)
- **OOTDiffusion**: the LICENSE is "Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International", and the HF card says `cc-by-nc-sa-4.0`. Checkpoints come trained on "VITON-HD (half-body) and Dress Code (full-body)". The full-body model needs "Garment category must be paired: 0 = upperbody; 1 = lowerbody; 2 = dress". It ships humanparsing and openpose checkpoints — [LICENSE](https://raw.githubusercontent.com/levihsu/OOTDiffusion/main/LICENSE); [README](https://raw.githubusercontent.com/levihsu/OOTDiffusion/main/README.md); [HF API](https://huggingface.co/api/models/levihsu/OOTDiffusion); paper [arXiv 2403.01779](https://arxiv.org/abs/2403.01779)
- **CatVTON**: the README says "All the materials, including code, checkpoints, and demo, are made available under the Creative Commons BY-NC-SA 4.0 license. You are free to copy, redistribute, remix, transform, and build upon the project for non-commercial purposes…". It has 899.06M parameters in total (49.57M trainable). At 1024×768 in bf16 it needs about 8 GB VRAM. The app needs Detectron2 and DensePose and uses agnostic masks — [README](https://raw.githubusercontent.com/Zheng-Chong/CatVTON/main/README.md); [LICENSE](https://raw.githubusercontent.com/Zheng-Chong/CatVTON/main/LICENSE). Its HF card is `cc-by-nc-sa-4.0` (last modified 2025-01-01) — [HF API](https://huggingface.co/api/models/zhengchong/CatVTON)
- **StableVITON**: the README says "Licensed under the CC BY-NC-SA 4.0 license". Inputs are an agnostic mask, an image-densepose map and a cloth mask. For arbitrary images, the README suggests segmentation tools such as SAM. No root LICENSE file was found on main or master, and the HF card has no licence field — [README](https://raw.githubusercontent.com/rlawjdghek/StableVITON/master/README.md); [HF API](https://huggingface.co/api/models/rlawjdghek/StableVITON)
- **Leffa** (CVPR 2025): the repo LICENSE is MIT ("Copyright (c) 2024 Zijian Zhou") and the HF card says `license: mit`. The README says the try-on models were "trained on VITON-HD" and "trained on DressCode", and that inference "generat[es] an image in 6 seconds (on A100)" (09/Jan/2025). The HF repo also bundles `stable-diffusion-inpainting`, `stable-diffusion-xl-1.0-inpainting-0.1`, `densepose`, `openpose`, `schp` and `humanparsing` folders — [LICENSE](https://raw.githubusercontent.com/franciszzj/Leffa/main/LICENSE); [HF card](https://huggingface.co/franciszzj/Leffa/raw/main/README.md); [HF file tree](https://huggingface.co/api/models/franciszzj/Leffa/tree/main)
- **The training datasets behind most weights are non-commercial.**
  - VITON-HD: "We collected a 1024×768 virtual try-on dataset for research purposes only… All material is made available under Creative Commons BY-NC 4.0" — [VITON-HD README](https://raw.githubusercontent.com/shadow2496/VITON-HD/main/README.md)
  - Dress Code: "You are free to use and distribute the Dress Code Dataset for the purposes of non-commercial academic research, teaching and publication" — [Dress Code LICENCE](https://raw.githubusercontent.com/aimagelab/dress-code/main/LICENCE)
- **FitDiT**: the LICENSE is CC BY-NC-SA 4.0. The README says: "This model can only be used **for non-commercial use**. For commercial use, please visit [Tencent Cloud]". It runs in two steps (generate the try-on mask, then try on inside the mask), and the mask can be edited by hand — [README](https://raw.githubusercontent.com/BoyuanJiang/FitDiT/main/README.md); [LICENSE](https://raw.githubusercontent.com/BoyuanJiang/FitDiT/main/LICENSE); paper [arXiv 2411.10499](https://arxiv.org/abs/2411.10499)
- **Any2AnyTryon**: there is no LICENSE file (main and master both return 404), no licence text in the README, and no licence field on the HF card. The README's inference commands use `--model_path black-forest-labs/FLUX.1-dev` and generate masks with CatVTON's AutoMasker for VITON-HD — [README](https://raw.githubusercontent.com/logn-2024/Any2anyTryon/main/README.md); [HF API](https://huggingface.co/api/models/loooooong/Any2anyTryon). FLUX.1-dev is `flux-1-dev-non-commercial-license` — [HF API](https://huggingface.co/api/models/black-forest-labs/FLUX.1-dev)
- **OmniTry** (NeurIPS 2025, Kunbyte AI and Zhejiang Univ.):
  - Try-on for "any wearable objects, e.g., jewelries and accessories, with mask-free setting" — [arXiv 2508.13632](https://arxiv.org/abs/2508.13632)
  - Licence: the GitHub LICENSE and HF card are Apache-2.0 — [LICENSE](https://raw.githubusercontent.com/Kunbyte-AI/OmniTry/main/LICENSE); [HF card](https://huggingface.co/Kunbyte/OmniTry/raw/main/README.md)
  - Base model: a secondary summary says the data pipeline used a fine-tuned FLUX.1 Fill for erasing. Whether the try-on model itself is built on FLUX.1-Fill-dev was not confirmed — [search summary of the paper](https://arxiv.org/pdf/2508.13632). FLUX.1-Fill-dev is `flux-1-dev-non-commercial-license` — [HF API](https://huggingface.co/api/models/black-forest-labs/FLUX.1-Fill-dev)

**Specialised vs general models on try-on benchmarks (2026)**
- **VTEdit-Bench** (arXiv 2603.11734, v2 29 Jun 2026) has 24,220 test pairs across five try-on tasks and compares 8 universal multi-reference editors with 7 specialised try-on models.
  - Its conclusion: "top universal editors are competitive on conventional tasks and generalize more stably to harder scenarios, but remain challenged by complex reference configurations, particularly multi-cloth conditioning", and "challenges remain in strict identity preservation and compositional multi-item control."
  - In the extracted results table, the last column appears to be an average rank (my reading of the table; not verified). It reads Flux.2 2.2, Qwen-Image-Edit-2511 3.0, FastFit 4.8, CatVTON 5.4, OOTDiffusion 7.6, Any2AnyTryon 9.2.
  - Sources: [abstract](https://arxiv.org/abs/2603.11734); [HTML](https://arxiv.org/html/2603.11734v2)
- **Tstars-Tryon 1.0** (Alibaba/Taobao, arXiv 2604.19748):
  - Scores on its own Tstars-VTON benchmark (single garment, 0–10 scale, columns Overall / Identity / Garment Fidelity / Background / Physical & Structural Logic). Overall: CatVTON 6.663 (garment fidelity 4.007), Leffa 6.048, FitDiT 5.152, FastFit 6.448, QwenEdit-2511 8.121, FLUX.2-dev 8.764, FLUX.2-klein-9B 8.797, GPT-Image-1.5 8.892, GPT-Image-2 9.200, Nano Banana Pro 9.229, Seedream5 lite 9.301, Tstars-Tryon 9.372.
  - Up to 6 reference images across 8 categories. The model is a 5B DiT running in 3.92 s for one garment and 6.74 s for multiple garments.
  - It is "deployed at an industrial scale on the Taobao App". The weights are not stated as released; only a benchmark is promised.
  - This is the authors' own benchmark.
  - Sources: [abstract](https://arxiv.org/abs/2604.19748); [HTML](https://arxiv.org/html/2604.19748)
- **Oxygen-TryOn** (arXiv 2607.21694) is a "fashion-native" model for multiple items from multiple references, trained with continued pre-training, supervised fine-tuning and RL. It claims to match or beat "Nano Banana Pro, GPT-Image-2, Seedream5 Lite" and FLUX.2 on single- and multi-item try-on. These are the authors' claims; release status and licence were not found — [arXiv 2607.21694](https://arxiv.org/abs/2607.21694)
- **WearWow** (arXiv 2607.19923) does native 2K multi-garment try-on without masks. It says general foundation models "frequently suffer from cross-garment feature leakage", and that "Commercial APIs like Nano Banana Pro and KeLingv3… often encounter difficulties with strict spatial control and structural consistency" — [arXiv 2607.19923](https://arxiv.org/abs/2607.19923); [HTML](https://arxiv.org/html/2607.19923)
- **Garments2Look** (arXiv 2603.14153) is a dataset of 80K outfit-level pairs, each with 3–12 reference garments (average 4.48), across 40 categories and 300+ sub-categories. It finds that "current methods struggle to try on complete outfits seamlessly and to infer correct layering and styling, leading to misalignment and artifacts" — [arXiv 2603.14153](https://arxiv.org/abs/2603.14153)
- **Other 2026 directions**:
  - Layering try-on (LVTON): [arXiv 2607.22924](https://arxiv.org/abs/2607.22924)
  - Fit-aware try-on: FIT dataset [arXiv 2604.08526](https://arxiv.org/abs/2604.08526); FitVTON [arXiv 2606.12012](https://arxiv.org/abs/2606.12012)
  - Fully on-device try-on (Mobile-VTON), motivated by privacy: [arXiv 2603.00947](https://arxiv.org/abs/2603.00947)
  - Jewellery, footwear and ring try-on: JewelTry 2609.16626, ShoeFit 2610.18325, Virtual Ring Try-On 2606.28792 — [arXiv listing query](https://export.arxiv.org/api/query?search_query=ti:%22try-on%22&sortBy=submittedDate&sortOrder=descending&max_results=60)

### Inferences
- None of IDM-VTON, OOTDiffusion, CatVTON, StableVITON, FitDiT, CatV2TON or Any2AnyTryon can be shipped in a commercial app as-is. Leffa should be treated the same way, because its weights derive from CC BY-NC and academic-only datasets, and its bundled OpenPose and SD checkpoints carry their own terms, which were not checked here.
- The open model with the cleanest commercial terms for "person + garment → dressed person" is a general editor, not a try-on model: Qwen-Image-Edit-2511 (Apache-2.0, see §3) or FLUX.2-klein-4B (Apache-2.0). OmniTry is Apache-2.0 but its base model is unconfirmed.
- In the 2026 benchmarks, general editors and new proprietary systems beat the 2024 open try-on models by a wide margin on garment fidelity (Tstars: about 8.6–8.8 vs about 4.0–4.7). That makes the 2024 open models a poor base for a new product even before licences are considered.

### Gaps
- No LICENSE was found for the 2026 successors (Tstars-Tryon, Oxygen-TryOn, WearWow, LVTON, FitVTON). Most appear to have no released weights.
- OmniTry's exact base checkpoint, and so whether its Apache-2.0 label survives a FLUX-dev dependency, is unconfirmed.
- No independent full-outfit comparison was found for IDM-VTON, OOTDiffusion and the other 2024 models. Their papers evaluate single garments on VITON-HD and Dress Code.
- The CreativeML OpenRAIL licences of the SD 1.5 and SDXL-inpainting bases were not re-read in this session.

---

## 2. Commercial try-on APIs: FASHN, Kling (incl. fal.ai), Google (Vertex AI Virtual Try-On and Shopping try-on), Perfect Corp, Revery, Botika and others

### Takeaway
Per-image prices for a dedicated try-on API run from about **$0.04 to $0.15**:

| Service | Price per image | Notes |
|---|---|---|
| fal image-apps-v2 try-on | $0.04 | |
| Vertex AI Virtual Try-On | $0.06 | |
| Kling Kolors (via fal) | $0.07 | deprecated on fal |
| FASHN v1.6 | $0.075 | 864×1296 |
| Perfect Corp | about $0.10 | |
| FASHN Try-On Max | $0.15 at 1K to $0.30 at 4K | |
| Botika (product-on-model photos) | about $0.5–1 | not a try-on API |

FASHN has the most complete public documentation: models, credits, timings, moderation and data retention. Google's consumer Shopping try-on is not an API. Its developer equivalent is Vertex `virtual-try-on-001`, which takes one person image and product images.

### Cited Findings
**FASHN** (all from the official docs; prices as of the page read)
- **Pricing**:
  - On demand: "$0.075 per credit", minimum purchase $7.50 (100 credits), top-ups expire after 12 months.
  - Tier I: $19/mo with 282 credits, top-up $0.0675.
  - Tier II: $249/mo with 4,150 credits, top-up $0.0600.
  - Tier III: $1,249/mo with 25,594 credits, top-up $0.0488.
  - Failed predictions cost nothing.
  - Source: [FASHN API pricing](https://help.fashn.ai/plans-and-pricing/api-pricing)
- **Credits per output for the image endpoints** (Try-On Max, Product-to-Model, Model Create, Model Swap, Face to Model, Edit, Reframe):

  | Mode | 1K | 2K | 4K |
  |---|---|---|---|
  | Fast | 1 | 2 | 3 |
  | Balanced | 2 | 3 | 4 |
  | Quality | 3 | 4 | 5 |

  - Try-On v1.6 costs 1 credit.
  - Face Reference adds 3 credits per output.
  - Video: 5 s costs 1 / 3 / 6 credits at 480p / 720p / 1080p, and 10 s costs double.
  - Source: [FASHN API pricing](https://help.fashn.ai/plans-and-pricing/api-pricing)
- **Try-On Max** (`tryon-max`): released January 26, 2026, lifecycle **Preview**.
  - Supports "clothing, shoes, hats, jewelry, bags, and other wearable fashion items".
  - Inputs: `product_image`, `model_image`, and an optional `prompt` (e.g. "tuck in shirt", "open jacket").
  - Resolution: 1k / 2k / 4k (about 1 / 4 / 16 MP). `num_images` runs 1–4, and an omitted `generation_mode` "is currently billed as 'balanced'".
  - Timing: about 10 s at fast+1k, about 25 s at balanced+2k, about 55 s at quality+4k.
  - Input limits: 30 MiB per image, aspect ratio 1:16 to 16:1.
  - Source: [FASHN docs (llms-full)](https://docs.fashn.ai/llms-full.txt)
- **Try-On Max price change**: the changelog of March 30, 2026 says "Try-On Max can now run at 2 credits with Balanced + 1K (previously 4 credits)". At the on-demand rate, that makes Try-On Max about $0.15 per image at balanced 1K and $0.30 at balanced 4K — [FASHN changelog](https://fashn.ai/changelog/new-resolution-tiers-and-generation-mode-controls)
- **Try-On v1.6** (`tryon-v1.6`): released June 25, 2025, **Stable**, 1 credit (about $0.075).
  - "Input images are processed at 864 × 1296 px."
  - `category`: auto / tops / bottoms / one-pieces. With auto, "full-body shots default to a full outfit swap".
  - `segmentation_free` (default true) is meant for "bulkier garment try-ons".
  - `garment_photo_type`: flat-lay or model.
  - `moderation_level`: conservative / permissive / none. Conservative "blocks underwear, swimwear, and revealing outfits".
  - Source: [FASHN docs](https://docs.fashn.ai/llms-full.txt)
- **Other FASHN endpoints**: Face to Model (Sept 19, 2025, Experimental), Model Create, Model Swap, Product to Model and Image to Video (Oct 15, 2025, Experimental). With `face_reference`, "output resolution is capped at 2K" and processing takes "around 20 seconds" longer — [FASHN docs](https://docs.fashn.ai/llms-full.txt)
- **FASHN rate limits and data retention**:
  - `/v1/run` allows 50 requests per 60 s.
  - Outputs on the CDN are "Scheduled for deletion after three days". Base64 outputs are available for 60 minutes. Request records are "Not deleted automatically", and there is no deletion endpoint (email legal@fashn.ai).
  - "FASHN does not use Customer Content to train… unless you expressly opt in."
  - Source: [FASHN docs](https://docs.fashn.ai/llms-full.txt)

**Kling (Kolors) virtual try-on**
- **On fal**: model ID `fal-ai/kling/v1-5/kolors-virtual-try-on`, $0.07 per generation.
  - The page says "This model is no longer supported" (deprecated).
  - Inputs are `human_image_url` and `garment_image_url`, with no mask. The example output is 768×1024.
  - It "Works best with upper-body garments", "Struggles with garment type switching (e.g., skirt to pants)", and "Complex layering may not render accurately".
  - Source: [fal model page](https://fal.ai/models/fal-ai/kling/v1-5/kolors-virtual-try-on)
- **Kling's official API price**: not verified. Third-party sources conflict:
  - $350 vs $700 for a 5,000-unit package — [PricingSaaS](https://pricingsaas.com/companies/klingai); [Atlas Cloud](https://www.atlascloud.ai/blog/tips/kling-ai-api-pricing)
  - $0.06608 per request, with an "official" $0.0826, from the reseller CometAPI — [CometAPI](https://www.cometapi.com/models/kling/kling-virtual-try-on/)

**Google**
- **Vertex AI Virtual Try-On**:
  - Model ID `virtual-try-on-001`. Inputs are one `personImage` (base64) and a `productImages` array. `sampleCount` runs 1–4, and the output is PNG.
  - The docs state no resolution, garment-type list or launch stage.
  - The page is "Last updated 2026-10-09" and says "Vertex AI documentation is no longer being updated" (pointing to the Agent Platform docs).
  - Source: [Vertex VTO docs](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/generate-virtual-try-on-images)
- **Vertex AI price**: "Virtual Try-On – Create images of people wearing different clothes – 1 image of a person and 1 image of clothing – Image – $0.06". On the same page, Imagen Product Recontext is $0.12 — [Google Cloud Agent Platform pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)
- **Google Shopping try-on** (consumer feature, not an API):
  - May 2025: the AI Mode virtual dressing room lets users try on Shopping Graph apparel on their own full-length photo — [Google blog](https://blog.google/products-and-platforms/products/shopping/google-shopping-ai-mode-virtual-try-on-update/)
  - December 11, 2025: users can make a full-body try-on image from a single selfie with Nano Banana (Gemini 2.5 Flash Image) after picking their usual clothing size. It launched in the U.S., and preset models with diverse body types remain available — [TechCrunch](https://techcrunch.com/2025/12/11/googles-ai-try-on-feature-for-clothes-now-works-with-just-a-selfie/); [Google blog](https://blog.google/products-and-platforms/products/shopping/studio-quality-digital-try-on/)
  - Google's experimental **Doppl** app makes try-on images and animated videos. Testers reported trouble with pants and warped fabric. This is secondary and unverified — [CO/AI](https://getcoai.com/news/googles-doppl-app-creates-virtual-try-on-videos-from-any-outfit)

**Other try-on endpoints on fal.ai** (fal's own blog, published July 2, 2026, tested with one person and one dress)
- `fal-ai/fashn/tryon/v1.6`: $0.075, 864×1296.
- `fal-ai/flux-pro/v1/vto` (FLUX Virtual Try-On Pro):
  - Price: "$0.0375 for the first input megapixel, plus $0.005 per extra input megapixel and $0.005 per output megapixel" ([fal page](https://fal.ai/models/fal-ai/flux-pro/v1/vto))
  - One garment per request; the person image can be up to 2 MP.
- `fal-ai/image-apps-v2/virtual-try-on`: $0.04 per image. It has a `preserve_pose` toggle; the underlying model is not stated.
- `fal-ai/leffa/virtual-tryon`: $0.10. It takes `garment_type` (upper_body / lower_body / dresses) and "Altered the model's face in the author's test". fal labels it commercial-cleared, which conflicts with §1.
- `fal-ai/cat-vton`: $0.00125 per compute second. fal says it is "Research-only; no commercial clearance".
- `decart/lucy2-vton/realtime`: $0.02 per second, live over WebRTC.
- `fal-ai/flux-2-lora-gallery/virtual-tryon`: $0.021 per processed MP.
- Sources for the list: [fal blog](https://fal.ai/learn/tools/best-virtual-try-on-apis-2026); [image-apps-v2 page](https://fal.ai/models/fal-ai/image-apps-v2/virtual-try-on)

**Perfect Corp, Botika, Revery**
- **Perfect Corp** (YouCam AI Clothes try-on API):
  - Pricing: "2 units per generated result". A $24/month subscription gives 500 units (about $0.096 per result), pay-as-you-go is $27.50 for 500 units (about $0.11 per result), and free accounts get 40 trial units.
  - The article covers upper-body, lower-body and full-body garments. It states no resolution or speed.
  - The article date is unclear (image paths show 2026-07-30).
  - Source: [Perfect Corp blog](https://www.perfectcorp.com/business/blog/ai-clothes/virtual-try-on-api-pricing)
- **Botika** (AI fashion models for product photos, not end-user try-on):
  - Pro: $55/mo monthly or $46/mo billed yearly, 600 credits per year, 2K.
  - Advanced: $100/mo monthly; the page also shows "$40/mo" yearly, which is inconsistent. 1,000 credits per year, 4K.
  - Each photo costs 1 credit and each video 5. The page mentions no API and states no commercial-rights terms.
  - Source: [Botika pricing](https://botika.com/pricing)
- **Revery AI**:
  - Only secondary sources were found: an enterprise virtual dressing room with mix and match, an API/SDK, and a "free API" mentioned in a directory — [AlternativeTo](https://alternativeto.net/software/revery-ai/about/)
  - Similarweb counted 3 sites using it on March 11, 2026 — [Similarweb](https://www.similarweb.com/technology/revery/)
  - revery.ai did not resolve when fetched.

### Inferences
- **For a pipeline that needs commercially licensed, documented outputs**: FASHN (Try-On Max for accessories, prompts and 4K; v1.6 for cheap 864×1296 previews) and Vertex VTO ($0.06) are the two best-documented options.
- **fal's catalogue is volatile.** Kling Kolors is already deprecated on fal, so a model ID should be wrapped behind your own adapter.
- **One-garment-per-call APIs** (FLUX VTO Pro, Kling Kolors and probably Vertex) need sequential passes or a composite garment image to build a full outfit. Each pass risks drift in identity and garment.

### Gaps
- Kling's official per-image try-on API price could not be verified from a primary source.
- Vertex VTO's output resolution, supported categories, launch stage and person-generation restrictions are not stated in the current docs.
- No independent quality benchmark of FASHN, Vertex VTO, Perfect Corp or Revery was found.
- Botika's and Revery's commercial-use terms and API pricing were not found.

---

## 3. General image-editing models used for try-on (Nano Banana family, GPT-image, FLUX Kontext/FLUX.2, Seedream, Qwen-Image-Edit): identity and garment fidelity, prices

### Takeaway
By 2026, multi-reference general editors beat 2024 specialised try-on models on most measures. In Tstars-Tryon's own benchmark, Seedream5 lite, Nano Banana Pro and GPT-Image-2 all score about 9.2–9.3 out of 10. They still fail on multi-garment conditioning, strict pose control and layering. GPT-image also refused a noticeable share of try-on requests. Prices run from **$0.03 to $0.15 per edit**. Open, commercially usable options are **Qwen-Image-Edit-2511 (Apache-2.0)** and **FLUX.2-klein-4B (Apache-2.0)**; FLUX.1 Kontext [dev], FLUX.2 [dev] and klein-9B are non-commercial. Gemini 2.5 Flash Image (the original Nano Banana) was **shut down on 2 October 2026**.

### Cited Findings
**Prices: official APIs**
- **Gemini API** (page last updated 2026-10-14):
  - `gemini-2.5-flash-image`: $0.039 per image. It "is deprecated and will be shut down on October 2, 2026; migrate to Gemini 3.1 Flash Image or Gemini 3.1 Flash Lite Image".
  - Gemini 3 Pro Image (Nano Banana Pro): "$0.134 per 1K/2K image and $0.24 per 4K image". Input images cost about $0.0011 each.
  - Gemini 3.1 Flash Image (Nano Banana 2): $0.045 at 0.5K, $0.067 at 1K, $0.101 at 2K, $0.151 at 4K.
  - `gemini-nano-banana-2.1` (an update to Nano Banana 2 with "multi-turn character consistency"): $0.0336 at 1K, $0.0504 at 2K, $0.113 at 4K.
  - Source: [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- **Vertex AI**: Gemini 3 Pro Image "charges 560 tokens per input image". Its output costs are $0.134 at 1K/2K and $0.24 at 4K; Gemini 3.1 Flash Image is $0.067 at 1K — [Google Cloud pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)
- **OpenAI** (prices per 1M tokens; the page's tab layout made the extraction partly ambiguous):
  - Standard: `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare` image input $8.00, cached $2.00, output $30.00.
  - Batch: `gpt-image-2` image input $4.00 and output $15.00.
  - Per-image costs come from OpenAI's calculator, which was not read.
  - Source: [OpenAI pricing](https://platform.openai.com/docs/pricing)

**Prices on fal.ai** (fal pages, read 2026-10-14)
- **Gemini models**:
  - `fal-ai/nano-banana/edit`: $0.039 per image.
  - `fal-ai/nano-banana-pro/edit`: $0.15 per image; 4K costs double, and web search adds $0.015.
  - `fal-ai/nano-banana-2/edit`: $0.08 per image; 2K costs ×1.5 and 4K ×2.
  - Sources: [nano-banana](https://fal.ai/models/fal-ai/nano-banana/edit); [nano-banana-pro](https://fal.ai/models/fal-ai/nano-banana-pro/edit); [nano-banana-2](https://fal.ai/models/fal-ai/nano-banana-2/edit)
- **Seedream**:
  - `fal-ai/bytedance/seedream/v4/edit`: $0.03 per image.
  - `fal-ai/bytedance/seedream/v4.5/edit`: $0.04, "up to 10 reference images".
  - Seedream 5.0 is linked from the v4 page.
  - Sources: [v4 edit](https://fal.ai/models/fal-ai/bytedance/seedream/v4/edit); [v4.5 edit](https://fal.ai/models/fal-ai/bytedance/seedream/v4.5/edit)
- **Qwen**: `fal-ai/qwen-image-edit-2511` is "$0.03 per megapixel" — [fal page](https://fal.ai/models/fal-ai/qwen-image-edit-2511)
- **FLUX**:
  - `fal-ai/flux-pro/kontext/max/multi`: $0.08 per image — [fal page](https://fal.ai/models/fal-ai/flux-pro/kontext/max/multi)
  - `fal-ai/flux-2-pro/edit`: "$0.03 for first megapixel, $0.015 per additional megapixel", "up to 9 reference images" — [fal page](https://fal.ai/models/fal-ai/flux-2-pro/edit)
- **GPT-image**:
  - `fal-ai/gpt-image-1/edit-image`: three tiers per output image — $0.011 / $0.016, $0.042 / $0.063, and $0.167 / $0.25 (1024² / other sizes). The tier labels were not shown in the extraction; they are presumably low, medium and high.
  - `fal-ai/gpt-image-1.5/edit` is token-based: low quality is $0.009 at 1024² and medium is $0.034 at 1024².
  - Sources: [gpt-image-1](https://fal.ai/models/fal-ai/gpt-image-1/edit-image); [gpt-image-1.5](https://fal.ai/models/fal-ai/gpt-image-1.5/edit)

**Open-weight licences (HF model cards)**
- Qwen-Image-Edit, -2509 and -2511 are `apache-2.0` (2511 last modified 2025-12-23) — [HF API 2511](https://huggingface.co/api/models/Qwen/Qwen-Image-Edit-2511)
- FLUX.1-Kontext-dev is `flux-1-dev-non-commercial-license` — [HF API](https://huggingface.co/api/models/black-forest-labs/FLUX.1-Kontext-dev)
- FLUX.2-dev is `flux-non-commercial-license` — [HF API](https://huggingface.co/api/models/black-forest-labs/FLUX.2-dev)
- FLUX.2-klein-4B is `apache-2.0`, while FLUX.2-klein-9B is `flux-non-commercial-license` — [HF API klein-4B](https://huggingface.co/api/models/black-forest-labs/FLUX.2-klein-4B); [HF API klein-9B](https://huggingface.co/api/models/black-forest-labs/FLUX.2-klein-9B)
- ByteDance DreamO is `apache-2.0` — [HF API](https://huggingface.co/api/models/ByteDance/DreamO)

**How well identity and garment detail hold (evidence)**
- **Tstars-Tryon single-garment benchmark** (Identity / Garment Fidelity):

  | Model | Identity | Garment fidelity |
  |---|---|---|
  | Nano Banana Pro | 9.861 | 8.598 |
  | Seedream5 lite | 9.854 | 8.639 |
  | GPT-Image-2 | 9.597 | 8.794 |
  | GPT-Image-1.5 | 9.381 | 8.563 |
  | FLUX.2-dev | 9.419 | 7.920 |
  | QwenEdit-2511 | 9.214 | 6.787 |

  - "Due to platform restrictions, GPT-Image-1.5 failed to generate results for 120 test cases and GPT-Image-2 failed to generate results for 107 test cases."
  - Source: [arXiv 2604.19748 HTML](https://arxiv.org/html/2604.19748)
- **Garments2Look expert study**: three fashion experts compared 500 results from OmniTry, FastFit, Nano Banana, Seedream 4.0 and Qwen-Image-Edit-2509, and preferred Nano Banana in 66% of cases.
  - But "Nano Banana does not natively support image inpainting, and it lacks accurate explicit control over skeletal pose".
  - On FID, FastFit scored 9.311 against Nano Banana's 15.220 (N references).
  - Feeding Nano Banana a single "OOTD grid image" of all items kept them more consistent than passing separate images.
  - Source: [arXiv 2603.14153 HTML](https://arxiv.org/html/2603.14153)
- **VTEdit-Bench** (see §1): universal editors are "challenged by… multi-cloth conditioning" and by "strict identity preservation" — [arXiv 2603.11734](https://arxiv.org/abs/2603.11734)

### Inferences
- **Practical recipe for "put this person in this outfit"**: one multi-reference call with the identity image plus all garments, or a single grid image of all garments, through Nano Banana Pro, Seedream 4.5/5 or GPT-Image-2. Each costs about $0.04–0.15. Then check identity and garment drift automatically (face embedding, garment colour and logo checks) and retry.
- **Self-hosted fallback**: Qwen-Image-Edit-2511 (Apache-2.0) is the self-hostable, commercially licensed option. It trails the closed models on garment fidelity (6.8 vs about 8.6 in Tstars).
- **Wrap model IDs in an adapter.** Gemini 2.5 Flash Image is already shut down, so any pipeline built on it must migrate to 3.1 Flash Image / Nano Banana 2.x or Pro.
- **Expect refusals.** GPT-image models refused roughly 100+ cases on a try-on benchmark ("platform restrictions"). A pipeline needs a fallback model for refused requests (swimwear, lingerie and similar).

### Gaps
- No public benchmark was found that measures *the same person's* identity across many outfits (character consistency), which is the core need for a personalised character.
- Official per-image prices for GPT-Image-2 and the 2.5 variants were not extracted. Seedream 5.0 pricing on fal and the BytePlus official price were not read.
- Tstars, VTEdit and Garments2Look use VLM-based or FID scoring designed by the authors. Independent human studies are scarce.

---

## 4. Video try-on: keeping an outfit consistent across generated video

### Takeaway
There are two families. **Video try-on research** (ViViD, CatV2TON, MagicTryOn, then 2026's OmniTryOn, UniVVT, TexTailor, LiveVVT and TripVVT) re-dresses an *existing* video. Most of it is non-commercial or unreleased; ViViD is Apache-2.0 but sits on SD 1.5 and AnimateDiff. **Commercial reference-to-video** (Kling O3 "Elements", Veo 3.1 reference images, Vidu Q3) generates new video conditioned on character and outfit reference images, at about **$0.07–0.40 per second**. The practical pattern for consistency is to make a dressed "hero" still first (§2–3) and pass it as the reference or first frame.

### Cited Findings
**Video try-on research**
- **ViViD**: the GitHub LICENSE is Apache License 2.0. It uses "Stable Diffusion Image Variations" and AnimateDiff `mm_sd_v15_v2`. Inputs are an agnostic mask video, a DensePose video and a cloth mask (from SAM), with upper and lower configs. The HF card has no licence field — [LICENSE](https://raw.githubusercontent.com/alibaba-yuanjing-aigclab/ViViD/main/LICENSE); [README](https://raw.githubusercontent.com/alibaba-yuanjing-aigclab/ViViD/main/README.md); [HF API](https://huggingface.co/api/models/alibaba-yuanjing-aigclab/ViViD)
- **CatV2TON**: it uses a DiT with temporal concatenation for image and long-video try-on — [arXiv 2501.11325](https://arxiv.org/abs/2501.11325). Its licence **conflicts**: the GitHub README badge says CC BY-NC-SA 4.0, but the HF card says `cc-by-nc-nd-4.0`. Either way it is non-commercial — [README](https://raw.githubusercontent.com/Zheng-Chong/CatV2TON/main/README.md); [HF API](https://huggingface.co/api/models/zhengchong/CatV2TON)
- **MagicTryOn** (vivo): the LICENSE.txt points to CC BY-NC-SA 4.0. The README says "All the materials, including code, checkpoints, and demo, are made available under the Creative Commons BY-NC-SA 4.0 license". It uses "Wan2.1-I2V-14B as the base model", and the HF weights are `cc-by-nc-sa-4.0` — [README](https://raw.githubusercontent.com/vivoCameraResearch/Magic-TryOn/main/README.md); [HF API](https://huggingface.co/api/models/LuckyLiGY/MagicTryOn). For comparison, Wan2.2-I2V-A14B and Wan2.1-VACE-14B are `apache-2.0` — [HF API](https://huggingface.co/api/models/Wan-AI/Wan2.2-I2V-A14B)
- **2026 research**:
  - OmniTryOn (arXiv 2606.08514) moves several wearables onto a person in one pass with no masks. It notes that existing methods are "restricted to single-garment transfer" and depend on garment masks — [arXiv](https://arxiv.org/abs/2606.08514)
  - UniVVT (2608.05745) is end-to-end and drops the "mask, pose, and warping modules at inference" — [arXiv](https://arxiv.org/abs/2608.05745)
  - TexTailor (2609.39335) targets high-resolution texture preservation and notes that existing methods "primarily focus on low-resolution settings" — [arXiv](https://arxiv.org/abs/2609.39335)
  - LiveVVT (2608.26714) does real-time streaming try-on with a "persistent global appearance memory" built from the garment and a frontal try-on keyframe — [arXiv](https://arxiv.org/abs/2608.26714)
  - TripVVT-10K is an in-the-wild triplet dataset, and its benchmark covers multi-person scenes — [arXiv 2604.27958](https://arxiv.org/abs/2604.27958)
  - Also listed: TryOnCrafter (camera trajectories through a 4D proxy, 2606.26092), Vanast (try-on plus human animation, 2604.04934), and the mask-free BooM-VVT and FlowVVTON — [arXiv listing](https://export.arxiv.org/api/query?search_query=ti:%22try-on%22&sortBy=submittedDate&sortOrder=descending&max_results=60)

**Commercial reference-to-video and video try-on prices**
- **Veo 3.1 reference-to-video on fal**:
  - Per second: $0.20 at 720p/1080p without audio, $0.40 with audio; $0.40 / $0.60 at 4K. The example takes 3 reference images.
  - The endpoint "will be deprecated on November 17, 2026".
  - Source: [fal page](https://fal.ai/models/fal-ai/veo3.1/reference-to-video)
  - Vertex lists Veo 3.1 at $0.40 per count with audio and $0.20 per count video-only at 720p/1080p. The page labels prices "per count"; per second is assumed — [Google Cloud pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)
- **Kling O3 reference-to-video [Standard] on fal**:
  - $0.084 per second with audio off, $0.112 with audio on.
  - It supports start and end images, extra reference images and multiple "Elements", each with a frontal image plus reference images.
  - The page claims "stable character identity, object details, and environments" but describes no outfit-specific control.
  - Source: [fal page](https://fal.ai/models/fal-ai/kling-video/o3/standard/reference-to-video)
  - Kling O1 reference video-to-video is $0.168 per second — [fal page](https://fal.ai/models/fal-ai/kling-video/o1/video-to-video/reference)
- **Vidu Q3 reference-to-video**: "0.07 $ per video second for 360p and 540p, cost will be 2.2x for 720p and 1080p" — [fal page](https://fal.ai/models/fal-ai/vidu/q3/reference-to-video)
- **Decart Lucy2 VTON realtime**: changes outfits on live video from a reference image, at $0.02 per second — [fal page](https://fal.ai/models/decart/lucy2-vton/realtime)
- **FASHN Image to Video**: 5 s at 1080p costs 6 credits (about $0.45 on demand) — [FASHN pricing](https://help.fashn.ai/plans-and-pricing/api-pricing)

### Inferences
- **Generate-new-video pipeline**: dress the character in a still (try-on API or editor), check it, then use that still as the Kling Element frontal image, a Veo 3.1 reference image, or the I2V first frame. Garment drift then becomes a function of the video model's reference adherence, not of re-dressing every frame.
- **Re-dress-existing-footage pipeline** (e.g. a 3D render or an actor plate): video try-on research is mostly non-commercial. Lucy2 VTON (live) and the Kling O1 reference V2V endpoint are the commercial paths found, and their fidelity is untested here.
- **Outfit drift should be expected** on long or multi-shot sequences. LiveVVT's "global appearance memory" and Kling's Elements are both attempts to anchor it.

### Gaps
- No independent benchmark was found of outfit consistency across shots for Kling O3, Veo 3.1 and Vidu Q3.
- No licences were found for OmniTryOn, UniVVT, TexTailor or LiveVVT, and most have no weights confirmed.
- The maximum number of reference images and Elements for Veo 3.1 and Kling O3 on fal is not stated on the pages.

---

## 5. 3D garments: CLO3D and Marvelous Designer, Blender cloth, Unreal Chaos Cloth, garment-from-image and sewing-pattern research, fitting garments to arbitrary bodies (SMPL licensing)

### Takeaway
Pattern-based authoring in Marvelous Designer ($39/mo personal) or CLO ($50/mo individual) remains the production route. Both export FBX/Alembic/USD/OBJ; CLO and MD 2026.0 also export glTF. The garments can then be simulated offline in Blender (cached, not real-time) or at runtime in Unreal's Chaos Cloth panel workflow.

Image-to-sewing-pattern research has advanced quickly in 2026 (DressWild, NGL, Image2Garment, ReWeaver). Of the older models, only ChatGarment (Apache-2.0) and GarmentCode (MIT) have permissive code licences. DressCode and AIpparel have no licence file, and Garment3DGen's licence could not be verified.

SMPL and SMPL-X are non-commercial without a paid Meshcapade or Max Planck licence. Apache-2.0 alternatives now exist: NAVER **Anny** and Meta **MHR**, the body model behind SAM 3D Body.

### Cited Findings
**Marvelous Designer**
- **2026.1** (Aug 24, 2026):
  - Pricing: Personal "$39/month or $280/year"; Enterprise "$199/month or $2,000/year", or $2,300/year with Linux. Indie is for studios with "at least two staff and earnings under $500,000/year", price undisclosed. It is rental-only.
  - Export: Alembic, FBX, USD, OBJ sequence, Maya cache, PC2 and MDD. glTF/GLB is listed for *camera* data in 2026.1.
  - Source: [CG Channel](https://www.cgchannel.com/2026/08/clo-virtual-fashion-releases-marvelous-designer-2026-1/)
- **2026.0** (Apr 2026): "new and expanded format support, including glTF and VRM", and play-region selection "for FBX and glTF export". Enterprise standalone licensing was "discontinued from December 2, 2025" — [Digital Production](https://digitalproduction.com/2026/04/15/marvelous-designer-2026-0-adds-3d-pencil-and-lacing/)
- **Licence**: the official support article says freelancers may use personal licences, while "all other companies (studios, game companies, research companies, etc.) must purchase enterprise licenses" (via search summary) — [MD support](https://support.marvelousdesigner.com/hc/en-us/articles/47358297616153-What-is-the-difference-between-Personal-and-Enterprise-License)

**CLO**
- **Pricing**: $50/month or $450/year individual, with 50% off for students. This comes via a search summary of CLO's support page, which returned 403 when fetched directly, so it is unverified — [CLO support](https://support.clo3d.com/hc/en-us/articles/115012815487-How-much-does-CLO-cost)
- **glTF 2.0**: CLO's support article lists GLTF/GLB export with avatars, patterns, trims, welded or unwelded vertices, combined UVs, garment and avatar animation (joint or cached) and embedded textures (via search summary) — [CLO support](https://support.clo3d.com/hc/en-us/articles/360051525034-glTF-2-0-GLTF-GLB-File)

**Blender** (manual 5.2 LTS)
- Cloth is a modifier on the stack. Results are cached and baked over a frame range.
- Pinning uses a vertex group. "Sewing springs are virtual springs that pull vertices in one part of a cloth mesh toward vertices in another", created as loose edges, and "Max Sewing Force… Zero means unbounded… can cause instability".
- Collisions require mesh colliders; self-collision is optional.
- "Editing the cached simulation is not currently working, see: blender/blender#77114."
- Sources: [Introduction](https://docs.blender.org/manual/en/latest/physics/cloth/introduction.html); [Shape](https://docs.blender.org/manual/en/latest/physics/cloth/settings/shape.html); [Collisions](https://docs.blender.org/manual/en/latest/physics/cloth/settings/collisions.html); [Cache](https://docs.blender.org/manual/en/latest/physics/cloth/settings/cache.html)

**Unreal Engine** (docs header 5.8)
- "Unreal Engine 5.3 introduces a new way of authoring cloth": the Chaos Cloth Panel node editor, built on a Dataflow graph.
- It imports static meshes "from external panel-based DCC packages" and transfers skin weights and masks. It offers optional XPBD constraints and Level Set Volume collision.
- A cloth asset can be applied to "any skeletal or static mesh through a Chaos Cloth component", at slightly higher rendering cost.
- Source: [Epic docs](https://dev.epicgames.com/documentation/unreal-engine/panel-cloth-editor-overview)

**Garment-from-image, text or sewing patterns (research)**
- **Garment3DGen**: synthesises "3D garment assets from a base mesh given a single input image… can be directly draped and simulated on human bodies" — [arXiv 2403.18816](https://arxiv.org/abs/2403.18816). Its licence was **not verified** (the GitHub page could not be fetched).
- **DressCode**: text-driven sewing-pattern generation, built on NeuralTailor and Sewformer code, using SD 2.1 for CLIP embeddings — [arXiv 2401.16465](https://arxiv.org/abs/2401.16465); [README](https://raw.githubusercontent.com/IHe-KaiI/DressCode/main/README.md). No LICENSE file was found, so its licence is unclear.
- **ChatGarment**: a VLM estimates, generates and edits sewing patterns from in-the-wild images, sketches or text — [arXiv 2412.17811](https://arxiv.org/abs/2412.17811). The repo LICENSE is Apache 2.0, and it is "built extensively on top of LLaVA and LISA", whose own licences were not checked — [README](https://raw.githubusercontent.com/biansy000/ChatGarment/main/README.md)
- **AIpparel** (CVPR 2025 Highlight): fine-tunes large multimodal models to generate and edit sewing patterns — [arXiv 2412.03937](https://arxiv.org/abs/2412.03937). No licence statement was found in its README, so its licence is unclear — [README](https://raw.githubusercontent.com/georgeNakayama/AIpparel-Code/master/README.md)
- **GarmentCode** (the parametric pattern DSL used by many of these): MIT License — [LICENSE](https://raw.githubusercontent.com/maria-korosteleva/GarmentCode/main/LICENSE)
- **2026 work**:
  - DressWild: "physics-consistent 2D sewing patterns and the corresponding 3D garments from a single in-the-wild image… multi-layer virtual try-on" — [arXiv 2602.16502](https://arxiv.org/abs/2602.16502)
  - NGL: training-free VLM to sewing pattern; notes prior methods are "restricted to single-layer outfits" — [arXiv 2602.20700](https://arxiv.org/abs/2602.20700)
  - Image2Garment: infers fabric and physics parameters from a single image — [arXiv 2601.09658](https://arxiv.org/abs/2601.09658)
  - ReWeaver: sewing patterns from at least 4 views — [arXiv 2601.16672](https://arxiv.org/abs/2601.16672)
  - Forwardrobe: a garment-aware Gaussian avatar from one image, with a separable garment layer for 3D try-on — [arXiv 2607.29106](https://arxiv.org/abs/2607.29106)

**Fitting a garment to an arbitrary body**
- **LUIVITON** uses "SMPL as an intermediate proxy" to dress "complex, multi-layer garments onto diverse, arbitrarily posed humanoids" through simulator-driven fitting — [arXiv 2509.05030](https://arxiv.org/abs/2509.05030)
- **Neural real-time garment simulation**: HyperBones (bone-driven, real-time) — [arXiv 2605.20460](https://arxiv.org/abs/2605.20460); PhysDrape (hybrid neural-physical draping with explicit collision constraints) — [arXiv 2602.08020](https://arxiv.org/abs/2602.08020)
- **SMPL-X licence**:
  - Grant: "for the sole purpose of performing non-commercial scientific research" (plus non-commercial education and artistic projects).
  - Commercial use "includes, without limitation, incorporation in a commercial product, use in a commercial service".
  - It forbids redistribution and forbids using it "to train methods/algorithms/neural networks" for commercial purposes.
  - Commercial contact: smpl@max-planck-innovation.de or Meshcapade.
  - Source: [SMPL-X model licence](https://smpl-x.is.tue.mpg.de/modellicense.html)
  - The SMPLify-X code carries the same "non-commercial scientific research" licence — [LICENSE](https://raw.githubusercontent.com/vchoutas/smplify-x/master/LICENSE)
- **Meshcapade commercial SMPL licence**: Micro tier (≤10 employees, ≤€2M turnover) at €5,000/yr commercial vs €1,500 R&D; Avatar Tech add-on at Micro €2,000/yr and SME €10,000/yr. These figures are unverified: they come from a search summary, and the pages returned blank or 403 — [Meshcapade SMPL licences](https://meshcapade.notion.site/The-SMPL-Model-Licenses-2144560e54388085af5eff111fcdf266); [Meshcapade Avatar Tech](https://meshcapade.com/assets/avatar-tech)
- **Permissive body models**:
  - NAVER **Anny**: Apache License 2.0, "based on… MakeHuman", covers all ages. Its "smplx" topology option for SMPL-X interoperability is "non-commercial use only", and "the free install may download non-commercial only assets when needed" — [LICENSE](https://raw.githubusercontent.com/naver/anny/main/LICENSE); [README](https://raw.githubusercontent.com/naver/anny/main/README.md)
  - Meta **MHR**: Apache 2.0 — [LICENSE](https://raw.githubusercontent.com/facebookresearch/MHR/main/LICENSE)

### Inferences
- **3D route for a pipeline that also renders 3D scenes**:
  1. Author or buy pattern-based garments in MD or CLO.
  2. Export glTF or FBX (game/real-time) or Alembic/USD (baked offline).
  3. Fit them to the character's body. For an Anny- or MHR-based avatar this avoids SMPL fees.
  4. Simulate in Blender for offline renders, or in Unreal Chaos Cloth for real time.
  5. Optionally feed renders to video models as references or first frames (§4).
- **Image-to-garment research is not production-ready.** Most outputs are GarmentCode-style patterns limited to its garment templates. DressWild, NGL and Image2Garment are 2026 preprints with no licence information. Use them for drafts, then refine in MD or CLO.
- **Any SMPL-family dependency needs a paid licence for an app.** That includes 4D-Humans, SMPLer-X and LUIVITON-style SMPL proxies, and the dependency is easy to miss when the code itself is MIT.

### Gaps
- Garment3DGen's licence and the upstream licences of ChatGarment's weights (LLaVA and LISA bases) were not verified.
- CLO's and Meshcapade's current prices could not be read first-hand (403).
- Whether the MD Personal licence allows shipping garments inside a commercial app or product (as opposed to rendered output) was not found in a primary EULA.
- No head-to-head quality comparison of Blender cloth and Unreal Chaos Cloth for garments was found.

---

## 6. Body shape from photos for fit (SMPL-X fitting, phone body-scan apps): accuracy and privacy trade-offs

### Takeaway
Single-image human mesh recovery is mature, but most of it is non-commercial: SMPLify-X, SMPLer-X/SMPLest-X (S-Lab), Multi-HMR (NAVER NC) and anything outputting SMPL. **SAM 3D Body** (SAM License, which appears commercially permissive) with Meta's Apache-2.0 **MHR** body model is the notable commercially usable option found. Phone measurement apps report about 1–2 cm circumference errors in vendor or small studies, with larger errors at some sites (abdomen, forearm). Independent validation of two-photo services such as 3DLOOK and Bodygram was not found. Body and face photos are personal data, and facial images are named as biometric data under GDPR once processed for identification.

### Cited Findings
**Licences of body-estimation models**
- **SMPLer-X and SMPLest-X**: "S-Lab License 1.0… Redistribution and use for non-commercial purpose"; for commercial use, "please contact the contributor(s)" — [SMPLer-X LICENSE](https://raw.githubusercontent.com/caizhongang/SMPLer-X/main/LICENSE); [SMPLest-X LICENSE](https://raw.githubusercontent.com/wqyin/SMPLest-X/main/LICENSE.txt). SMPLest-X claims state-of-the-art results on seven benchmarks — [alphaXiv 2501.09782](https://alphaxiv.org/abs/2501.09782)
- **Multi-HMR** (NAVER): "Non-Commercial License… The Materials are used solely for non-commercial purposes" — [LICENSE](https://raw.githubusercontent.com/naver/multi-hmr/master/LICENSE.txt)
- **4D-Humans and TRAM**: both have MIT code licences — [4D-Humans](https://raw.githubusercontent.com/shubham-goel/4D-Humans/main/LICENSE.md); [TRAM](https://raw.githubusercontent.com/yufu-wang/tram/main/LICENSE). Their dependence on the SMPL body model (non-commercial without a licence, §5) was not re-verified in this session.
- **SAM 3D Body**: "a promptable model for single-image full-body 3D human mesh recovery". It uses `mhr_model.pt` (the MHR body model) — [README](https://raw.githubusercontent.com/facebookresearch/sam-3d-body/main/README.md)
  - Its "SAM License" (Last Updated: November 19, 2025) grants "a non-exclusive, worldwide, non-transferable and royalty-free limited license… to use, reproduce, distribute, copy, create derivative works of, and make modifications". Restrictions cover trade controls, ITAR and "military or warfare purposes"; no non-commercial clause was seen in a keyword scan — [SAM License](https://raw.githubusercontent.com/facebookresearch/sam-3d-body/main/LICENSE)
  - MHR is Apache 2.0 — [MHR LICENSE](https://raw.githubusercontent.com/facebookresearch/MHR/main/LICENSE)

**Accuracy**
- A 2021 LSU study of the MeThreeSixty app found circumference absolute errors of 0.79–1.96 cm against tape — [3DBODY.TECH 2021](https://proc.3dbody.tech/papers/2021/2133smith.pdf)
- 3DLOOK claims "1.5–2.2 cm for most measurements" from internal validation, with no study published — [3DLOOK](https://3dlook.ai/?p=41875)
- Prism Labs' 2026 white paper reports circumference repeatability of 0.27–0.81 cm (vendor) — [Prism Labs](https://www.prismlabs.tech/white-papers/body-composition-dxa-alternative-2026)
- A 2025 conference abstract found error varied by site, best at hip and calf and worst at forearm and abdomen — [WKU IJESAB](https://digitalcommons.wku.edu/ijesab/vol2/iss17/127)
- A December 2025 ITAA paper (US female firefighters) judged a remote scanning app accurate enough for apparel sizing — [Iowa State Digital Press](https://www.iastatedigitalpress.com/itaa/article/id/21680/)
- Bodygram markets measurements from 2 photos, but its Estimation API guide is marked deprecated — [Bodygram developers](https://developers.bodygram.com/estimations/guide/)
- **Try-on models ignore measured size.** The FIT paper: "current VTO methods default to generating well-fitted results regardless of the garment or person size" — [arXiv 2604.08526](https://arxiv.org/abs/2604.08526). FitVTON encodes body and garment size in structured text prompts — [arXiv 2606.12012](https://arxiv.org/abs/2606.12012)

**Privacy**
- GDPR Art. 4(14): "'biometric data' means personal data resulting from specific technical processing relating to the physical, physiological or behavioural characteristics of a natural person, which allow or confirm the unique identification of that natural person, such as facial images or dactyloscopic data" — [GDPR Art. 4](https://gdpr-info.eu/art-4-gdpr/)
- Vendor retention example (FASHN): outputs are deleted after 3 days, request records are kept with no deletion endpoint, and there is no training without opt-in — [FASHN docs](https://docs.fashn.ai/llms-full.txt)
- Mobile-VTON is motivated by the fact that "most existing systems require uploading personal photos to cloud-based GPUs, raising privacy concerns" — [arXiv 2603.00947](https://arxiv.org/abs/2603.00947)
- Google's selfie try-on asks the user for their usual clothing size instead of measuring the body — [TechCrunch](https://techcrunch.com/2025/12/11/googles-ai-try-on-feature-for-clothes-now-works-with-just-a-selfie/)

### Inferences
- For a *styled character*, as opposed to e-commerce fit, a coarse body shape is enough. SAM 3D Body plus MHR, or Anny parameters set from a few sliders or self-reported sizes, avoids SMPL licence costs and keeps measurement claims out of the product.
- Do not present fit as accurate. The 2D try-on models render garments as well fitted regardless of size, and phone measurement errors of 1–2 cm or more fall inside size-grade steps.
- **Privacy options**: keep body photos on-device or delete them after fitting, store only shape parameters, and send API calls as base64 with short retention.

### Gaps
- No independent accuracy study was found for 3DLOOK, Bodygram or Meshcapade photo-to-avatar.
- The SAM License was only keyword-scanned; a full legal read for commercial or biometric restrictions is needed.
- The accuracy of SAM 3D Body or SMPLest-X *shape* (not pose) on real tape-measured subjects was not found.

---

## 7. Known failure modes and bias (hands, logos and text, patterns, layering, modest wear, body types)

### Takeaway
The documented failure modes, in rough order of evidence:
1. **Multi-garment and full-outfit composition and layering**: every 2026 benchmark flags it.
2. **Garment type changes** (skirt to trousers).
3. **Identity drift**, especially faces altered by some models.
4. **Fine detail and logos**: classic metrics do not even measure them.
5. **Fit**: always rendered as well fitted.
6. **Non-Western and modest garments**: datasets skew to Western clothes and young women.
7. **Safety refusals** from closed models.

No specific study of hand failures was found.

### Cited Findings
- **Layering and full outfits**:
  - Garments2Look: methods "struggle to try on complete outfits seamlessly and to infer correct layering and styling, leading to misalignment and artifacts" — [arXiv 2603.14153](https://arxiv.org/abs/2603.14153)
  - LVTON: existing try-on "excel[s] at single-layer replacement but [is] not designed to layer or de-layer an existing outfit" — [arXiv 2607.22924](https://arxiv.org/abs/2607.22924)
  - VTEdit-Bench: universal editors are challenged by "multi-cloth conditioning" — [arXiv 2603.11734](https://arxiv.org/abs/2603.11734)
  - WearWow: foundation models suffer "cross-garment feature leakage" — [arXiv 2607.19923](https://arxiv.org/abs/2607.19923)
- **Garment type switching, pose and occlusion**: Kling Kolors "Struggles with garment type switching (e.g., skirt to pants)"; "Complex layering may not render accurately". The page advises avoiding crossed arms and heavy shadows or folds — [fal Kolors page](https://fal.ai/models/fal-ai/kling/v1-5/kolors-virtual-try-on)
- **Identity**:
  - Leffa on fal "Altered the model's face in the author's test" — [fal blog](https://fal.ai/learn/tools/best-virtual-try-on-apis-2026)
  - VTEdit-Bench notes "strict identity preservation" as an open challenge — [arXiv 2603.11734](https://arxiv.org/abs/2603.11734)
  - Nano Banana "lacks accurate explicit control over skeletal pose" — [arXiv 2603.14153 HTML](https://arxiv.org/html/2603.14153)
- **Logos, text, patterns and fine detail**:
  - The DAT evaluation splits garment fidelity into seven dimensions, including "fine-detail fidelity, and logo preservation", because "PSNR, SSIM, KID and FID struggle to measure the consistency between the generated and reference garments" — [arXiv 2608.29804](https://arxiv.org/abs/2608.29804)
  - TryOnReward: "classic fidelity metrics exhibit weak correlation with human judgments", and generic VLM judges lead to "severe reward hacking" — [arXiv 2609.13259](https://arxiv.org/abs/2609.13259)
  - In fal's single test, FASHN v1.6 "Keeps text and patterns sharp" (vendor blog, n=1) — [fal blog](https://fal.ai/learn/tools/best-virtual-try-on-apis-2026)
- **Garment fidelity remains the weakest dimension** even for top systems: 8.6–8.8/10 vs identity at about 9.6–9.9 (Nano Banana Pro, GPT-Image-2, Seedream5 lite), and 4.0–4.7 for 2024 open try-on models — [arXiv 2604.19748 HTML](https://arxiv.org/html/2604.19748)
- **Fit and body size**: try-on methods "default to generating well-fitted results regardless of the garment or person size" — [arXiv 2604.08526](https://arxiv.org/abs/2604.08526). FitVTON says 2D inpainting methods "often produce plausible-looking images that fail to reflect authentic garment fit across diverse body shapes" — [arXiv 2606.12012](https://arxiv.org/abs/2606.12012)
- **Cultural and modest garments, and gender skew**:
  - BD-VITON: benchmarks "are based on datasets that are dominant in western-style clothing and female models". Sarees, panjabi and salwar kameez bring "complex draping, asymmetric layering, and high deformation complexities", and retraining improves over zero-shot — [arXiv 2603.07291](https://arxiv.org/abs/2603.07291)
  - The Tstars-VTON benchmark itself is "74.9% female and 25.1% male" and "85% youth" — [arXiv 2604.19748 HTML](https://arxiv.org/html/2604.19748)
  - A 2024 IEEE Access survey flags "the domination of female models, limited diversity in clothing… and relatively simple and clean backgrounds" (via search summary) — [DOAJ / IEEE Access](https://doaj.org/article/ee32e002e7ab46df90bccce0c9b31017)
- **Moderation and refusals**:
  - GPT-Image-1.5 and GPT-Image-2 failed on 120 and 107 test cases "due to platform restrictions" — [arXiv 2604.19748 HTML](https://arxiv.org/html/2604.19748)
  - FASHN's `conservative` moderation "Blocks underwear, swimwear, and revealing outfits". Its docs warn that `none` does not remove responsibility and that misuse "may result in service denial" — [FASHN docs](https://docs.fashn.ai/llms-full.txt)
- **Video**: existing video try-on is "restricted to single-garment transfer" and depends on masks that "destroy[] crucial physical dynamics" — [OmniTryOn arXiv 2606.08514](https://arxiv.org/abs/2606.08514). Doppl testers reported trouble with pants and warped fabric (secondary) — [CO/AI](https://getcoai.com/news/googles-doppl-app-creates-virtual-try-on-videos-from-any-outfit)

### Inferences
- **A pipeline should check its own output.**
  - Identity: a face-embedding distance to the reference.
  - Garment: colour histogram, logo or OCR checks, and a silhouette check against the garment image.
  - Policy: retry or fall back on refusals.
- Build full outfits **garment by garment in a fixed layering order** (inner to outer), or as a single grid reference, and verify each step.
- **For modest and non-Western clothing** (hijab, saree, abaya), expect worse zero-shot quality from any model trained on VITON-HD or Dress Code. The 3D route (pattern-made garment plus simulation) is more controllable for these.
- **Bias claims need in-house testing** across skin tones, body sizes, ages and genders. No vendor publishes a bias report for its try-on model.

### Gaps
- No study was found that specifically measures hand and finger artefacts in try-on, logo and text legibility rates per model, or failure rates by skin tone or body size (plus-size).
- No vendor (FASHN, Google, Kling, Perfect Corp) publishes bias or fairness documentation for its try-on model. Google's 2023 TryOnDiffusion statements on diverse models were not re-read in this session.
- No study was found of hijab, abaya or other headwear and modest-coverage try-on quality.
