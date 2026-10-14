# Hair: giving a user a chosen hairstyle and hair colour on their own face (2D AI images/video and 3D avatars), as of October 2026

Every URL below was read on **2026-10-14** unless a line says otherwise. "(search summary only)" means the claim came from a search-engine summary of that page; the page itself was not opened, so treat it as unverified. "(not verified)" marks anything not confirmed from a primary source in this session. Licence verdicts follow the rule "unclear means no".

## 1. 2D hair try-on and hairstyle transfer: research models, commercial APIs and general image editors

### Takeaway
Hair-transfer research code with a permissive licence exists: HairFastGAN (MIT), Barbershop (MIT) and Stable-Hair (Apache-2.0). But the weights depend on base models and face datasets whose licences were not checked here. Most diffusion-era hair-transfer code is CC BY-NC-SA, or its release status is unclear. Commercial hair APIs (Perfect Corp/YouCam, Banuba, ModiFace) do not publish developer-API prices. General image editors (Nano Banana, FLUX Kontext, Qwen-Image-Edit, SeedEdit) keep identity best on hair edits of all the edit types tested. Even so, they lose 15–28% of facial similarity on hair edits, and all of them "over-edit", for example changing hair colour when asked only for a cut. That over-editing is worse on dark-skinned male faces and older faces.

### Cited Findings

**Research models (2022–2026) and licences**
- HairFastGAN (AIRI, NeurIPS 2024) works in StyleGAN's FS latent space. Its README says it transfers shape and colour "in less than a second on the Nvidia V100". The code is under the **MIT License** ("Copyright (c) 2024 AIRI"), and the weights and demo are hosted on Hugging Face. The README says it reuses code from CtrlHair, SEAN, HairCLIP, FSE, E4E and STAR — [README](https://raw.githubusercontent.com/AIRI-Institute/HairFastGAN/main/README.md); [LICENSE](https://raw.githubusercontent.com/AIRI-Institute/HairFastGAN/main/LICENSE)
- HairCLIP, one of HairFastGAN's reused components, is under **GNU LGPL v2.1** — [LICENSE](https://raw.githubusercontent.com/wty-ustc/HairCLIP/main/LICENSE)
- Barbershop (2021, StyleGAN-based) is under the **MIT License** ("Copyright (c) 2021 Peihao Zhu") — [LICENSE](https://raw.githubusercontent.com/ZPdesu/Barbershop/main/LICENSE)
- Style-Your-Hair (ECCV 2022, pose-invariant latent optimisation) is "Licensed under the **CC BY-NC-SA 4.0** license" — [README](https://raw.githubusercontent.com/Taeu/Style-Your-Hair/main/README.md)
- Stable-Hair (arXiv 2407.14078) has two stages: a "Bald Converter", then a Hair Extractor plus a "Latent IdentityNet" that keeps identity and background. It is built on diffusers Stable Diffusion **v1-5**, and the code is **Apache-2.0**. The author writes that the released model "only trained on a small dataset (6k images for stage1, 2w images for stage2) and all the face images are from FFHQ datasets which means they were cropped and aligned". An improved model "will not be publicly available" — [README](https://raw.githubusercontent.com/Xiaojiu-z/Stable-Hair/main/README.md); [LICENSE](https://raw.githubusercontent.com/Xiaojiu-z/Stable-Hair/main/LICENSE)
- Stable-Hair v2 (arXiv 2507.07591, July 2025) does multi-view hair transfer with a multi-view diffusion model, polar-azimuth pose embeddings and temporal attention. Its abstract says "Code is publicly available" (GitHub sunkymepro/StableHairV2). The code licence was not checked — [arXiv](https://arxiv.org/abs/2507.07591)
- HairFusion (arXiv 2408.16450, AAAI 2025) is a one-stage diffusion model with a hair-agnostic input and hair-align cross-attention. Its repo is "Licensed under the **CC BY-NC-SA 4.0** license" — [README](https://raw.githubusercontent.com/cychungg/HairFusion/main/README.md); [arXiv](https://arxiv.org/abs/2408.16450)
- HairShifter (arXiv 2507.12758, July 2025) is video hair transfer using "anchor frame + animation". It argues that running an image method frame by frame causes flicker. Its code "will be released" (search summary only) — [arXiv](https://arxiv.org/html/2507.12758v1)
- HairPort (arXiv 2606.12562, SIGGRAPH 2026) has three parts: a "Bald Converter" trained on a 6,000-pair "Baldy" dataset, 3D-aware re-rendering of the reference hair from the target viewpoint, and a flow-matching generator. The Bald Converter is FLUX.1 Kontext adapted with LoRA. It claims to be "identity-preserving". Whether code or weights are released is not stated — [arXiv](https://arxiv.org/abs/2606.12562)
- H-Adapter (arXiv 2606.25578, ECCV 2026) does diffusion inpainting guided by attention-derived, source-aligned hair masks, with prompt-based hair colour control and an IP-Adapter identity variant. It reports the best FID/CLIP-I under pose differences, but no identity metrics. Code status is not stated — [arXiv](https://arxiv.org/abs/2606.25578)
- DPF / "Dual-Purification" (arXiv 2607.11281) targets "identity leakage" and compares against StableHair and HairFusion (search summary only) — [arXiv](https://arxiv.org/html/2607.11281)
- FLUX.1 Kontext [dev], the base of HairPort's Bald Converter, is under the "**FLUX.1 [dev] Non-Commercial License**". The model card says "Generated outputs can be used for personal, scientific, and commercial purposes" — [Hugging Face](https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev)
- Qwen-Image-Edit and Qwen-Image-Edit-2509 declare `license: apache-2.0` in their model-card metadata — [Qwen-Image-Edit README](https://huggingface.co/Qwen/Qwen-Image-Edit/raw/main/README.md); [2509 README](https://huggingface.co/Qwen/Qwen-Image-Edit-2509/raw/main/README.md)

**Commercial hair try-on APIs**
- Perfect Corp (YouCam API) announced an 11-API hair and beard suite on **15 June 2026**:
  - Seven try-ons: Hair Color ("unlimited color options"), Hairstyle, Hair Extension, Bangs, Hair Volume, Wavy Hair, Beard Style.
  - Four diagnostics: Hair Type Detection ("straight, wavy, curly, and kinky"), Length, Frizziness, Density.
  - "Developers can obtain a free API key and begin testing immediately via the YouCam API Playground." "All YouCam APIs support native Model Context Protocol (MCP)".
  - No prices are published — [Perfect Corp news](https://www.perfectcorp.com/business/news/HairBeardAPI)
- Perfect's developer docs say API "units" are consumed only "when the resulting image is successfully generated". Hairstyle generation is asynchronous: upload a file, submit a task with a style ID, then poll (search summary only) — [Perfect AI API docs](https://app-cdn-01.perfectcorp.com/console/common/doc/ai-api/index.html); [unit system](https://docs.perfectcorp.com/developers/unit_system). The unit page returned 404 when fetched.
- The YouCam Virtual Try-On **Shopify app** is "From $379/month". It is aimed at makeup and eyewear, not a hair API (search summary only) — [Shopify listing](https://apps.shopify.com/youcam-makeup-official)
- Banuba TINT pricing guide (posted 16 June 2026, updated 10 July 2026):
  - Easy Virtual Try-On (no-code): $49/mo for 1,000 try-ons, $99/mo for 3,500, $349/mo for 15,000. The article says this path supports makeup and eyewear only, not hair dye.
  - Shopify app: $319/mo for up to 10k try-ons, $999/mo for 40k, $1,599/mo for 70k (the TL;DR says 50k). Hair dye is included from the Basic tier.
  - Custom/SDK integration is quote-only, takes 4–8 weeks, and lists "hair dye", plus "wigs… beards" support — [Banuba](https://www.banuba.com/blog/banuba-tint-virtual-try-on-pricing-guide)
- ModiFace (L'Oréal) Hair VTO runs on Android, iOS, web and Windows and is sold as a single annual licence. No public developer API was found (search summary only; sources dated 2019–2023) — [ModiFace](https://Modiface.com/products-hair.html)
- Long-tail hair APIs (search summaries only, not verified):
  - Zyla API Hub "Hairstyle Change API": monthly subscription with overage fees, free trial up to 50 requests, enterprise from $10,000/yr — [Zyla](https://zylalabs.com/api-marketplace/tools/hairstyle+change+api/4208)
  - eachlabs "change-haircut": about $0.04 per execution — [eachlabs](https://www.eachlabs.ai/tr/eachlabs/eachlabs/change-haircut)
  - AILabTools hairstyle API: exists, price not found — [dev.to](https://dev.to/ailabtools/how-to-develop-an-try-on-hairstyle-app-17g)

**General image editors used for hair edits: cost and identity retention**
- Google's official Gemini API pricing (paid tier only; "Not available" on the free tier for image output):

  | Model | Price per image |
  |---|---|
  | Gemini 2.5 Flash Image ("Nano Banana") | $0.039 (batch $0.0195) |
  | Gemini 3 Pro Image ("Nano Banana Pro") | $0.134 at 1K/2K, $0.24 at 4K |
  | Gemini 3.1 Flash Image ("Nano Banana 2") | $0.045 at 0.5K to $0.151 at 4K |
  | Gemini 3.1 Flash Lite Image | $0.0336 at 1K |

  The page warns that Gemini 2.5 Flash Image "will be shut down on October 2, 2026" (that date has already passed as of this reading) — [Google AI pricing](https://ai.google.dev/gemini-api/docs/pricing)
- The strongest independent evidence is "A Large-scale Evaluation of Text-guided Models for Facial Editing" (Nair, Pandit, Kerner; arXiv 2608.28802, ACM Multimedia 2026 Oral) — [arXiv HTML](https://arxiv.org/html/2608.28802v1); [abs](https://arxiv.org/abs/2608.28802)
  - Models tested: Flux-Dev, Nano-Banana (Gemini-2.5-Flash-Image), Bagel-Edit, FLUX.1 Kontext-Pro, Qwen-Edit and SeedEdit 3.0.
  - Identity metric: the drop in Facial Similarity Score (DropFSS, lower is better). "Most models best preserved facial identity for hair edits."
  - Hair-edit DropFSS on CelebA: Bagel-Edit 18.79, Nano-Banana 23.08, Kontext-Pro 24.60, Qwen-Edit 28.04, Flux-Dev 89.13.
  - Hair-edit DropFSS on CelebSET: Nano-Banana 16.56, Bagel-Edit 18.20, SeedEdit 18.64, Kontext-Pro 21.47, Qwen-Edit 46.56, Flux-Dev 83.53.
  - "All models over-edit (e.g., changing hair color when asked only to change the hairstyle)", at about 25 over-edits per 100 instructions. "The most common overedit patterns were associated with hair-edits", e.g. "bob cut → straight hair" and "bob cut → brown hair".
  - Hair over-edit rate on CelebA: Nano-Banana 15.02, Bagel-Edit 18.47, Kontext-Pro 19.54, Qwen-Edit 24.87, Flux-Dev 66.42.
  - Demographics: "almost all models created more overedits for dark-skinned male faces and old faces". "Flux-dev is poor at retaining the facial identity of people with darker skin tones."
- PixelSmile (expression editing, not hair) used ArcFace identity and found:
  - Nano Banana Pro, Qwen-Edit and Seedream "preserve identity well".
  - GPT-Image "introduces moderate identity drift" (search summary only) — [arXiv](https://arxiv.org/html/2603.25728v1)
- Vendor and anecdotal evidence:
  - A YouCam blog author (a competing vendor) found Gemini "transformed hair while keeping every other detail consistent" but had to reword prompts "a couple of times" to get a specific bob (search summary only) — [Perfect Corp blog](https://www.perfectcorp.com/consumer/blog/hair/i-used-gemini-to-change-my-hairstyle)
  - A production hairstyle try-on vendor (StyleMyCrown, IJERT, July 2026) documents five failure modes of composite two-image editing on Black hair: "catalog echo" (the reference is reproduced), "no-op", "identity transfer / prior drift" (the subject is replaced by a different person, "often lighter-skinned"), "timid edit", and "capture-condition segmentation failure" on backlit, darker-skinned subjects.
  - Their fixes: masked inpainting that protects the face, a layered validation stack, refuse-and-refund on verified identity failure, style-specific LoRAs, and monitoring refusal rates by skin tone.
  - The evidence is self-described as observational, the authors are company officers, and peer review is not confirmed — [IJERT](https://www.ijert.org/why-ai-gets-black-hair-wrong-documented-failure-modes-and-architectural-fixes-in-a-production-try-on-system-ijertv15is070651)

### Inferences
- **Commercial licence position.** For a commercial product, the permissive research options are HairFastGAN, Barbershop and Stable-Hair, at the code level only.
  - Their weights inherit licences that were not checked here: StyleGAN-family checkpoints, SD 1.5, and FFHQ-derived training data. Under "unclear means no", treat their weights as not cleared until each one is checked.
  - HairFusion and Style-Your-Hair are non-commercial.
  - HairPort builds on FLUX.1 Kontext [dev] (non-commercial model licence), so a self-hosted HairPort-style pipeline would need BFL's commercial licence or the Pro API.
- **Best-evidenced commercial path for 2D.** A hosted editor seems the best-evidenced route: Gemini 3.x Image, SeedEdit/Seedream or Kontext-Pro via API, or self-hosted Qwen-Image-Edit (Apache-2.0). It would be wrapped in:
  - a hair mask from segmentation that protects face pixels, so only hair pixels change;
  - an automatic identity check (face-embedding similarity) with a refuse threshold;
  - a colour check so the hair colour is not changed when only a cut was asked for.

  The ACM MM 2026 numbers suggest an unguarded editor loses roughly a fifth of facial similarity on a hair edit, and does so unevenly across demographics.
- **Video.** Frame-by-frame image editing flickers (HairShifter). The practical choices are: edit one anchor frame and drive the video from it with an image-to-video model, or use the 3D route (sections 3–4) and render.
- **Cost.** At about $0.04–$0.15 per edited image, the general editors are cheaper and more flexible per try than the vendor try-on suites, whose API prices are hidden. The vendor suites add hair diagnostics (type, density, frizz) and a fixed style catalogue.

### Gaps
- No published per-call price for the Perfect Corp/YouCam hairstyle or hair-colour API: the unit table page returned 404. No public ModiFace API terms.
- Licences of the HairFastGAN Hugging Face weights, the SD 1.5 base (CreativeML OpenRAIL-M is the usual licence, not verified here), FFHQ, and the Stable-Hair v2 repo were not checked.
- No benchmark found that measures identity retention specifically for hairstyle transfer across GPT-image (1.5/2), Gemini 3.x Image and Seedream 4.x on a demographically balanced set. GPT-image pricing and terms were not researched here.
- No independent comparison of the 2026 hair-transfer papers (HairPort, H-Adapter, DPF) against general editors.
- The 2026 ACM study "Demographic Bias in Generative Data Augmentation: A Study of Makeup and Hairstyle Transfer Models" ([doi](https://doi.org/10.1145/3810417.3810425)) returned 403. Its reported finding is "the most severe degradations were observed on Black-presenting faces and textured hairstyles" (search summary only).

## 2. Hair segmentation and real-time hair recolour (browser and phone)

### Takeaway
Google's MediaPipe HairSegmenter and the Selfie Multiclass segmenter are the standard free building blocks. They run in real time on phones, and the hair model card states Apache-2.0. The model is from 2019 and selfie-only, and it documents failures on long braids, mohawks and headwear.

### Cited Findings
- HairSegmenter (`hair_segmenter.tflite`):
  - input "512 x 512", float32; outputs "0 - background, 1 - hair";
  - average latency on a Pixel 6: 57.90 ms CPU, 52.14 ms GPU.
  - The guide says it can be used for "recoloring hair or applying other hair effects" (search summary only for the use-case line) — [MediaPipe Image Segmenter guide, last updated 2026-10-01](https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter)
- Selfie Multiclass segmenter:
  - 256×256 input; classes "0 - background, 1 - hair, 2 - body-skin, 3 - face-skin, 4 - clothes, 5 - others (accessories)";
  - Pixel 6 latency: 217.76 ms CPU, 71.24 ms GPU — [same guide](https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter)
- Licensing of that page: "content… licensed under the Creative Commons Attribution 4.0 License, and code samples are licensed under the Apache 2.0 License". The page states no separate model-file licence — [same guide](https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter)
- The hair segmentation model card:
  - "Licensed under Apache License, Version 2.0"; "Developed by researchers at Google, 2019, version 2019-01-14"; an encoder–decoder network.
  - Paper: Tkachenka et al., "Real-time Hair segmentation and recoloring on Mobile GPUs", CVPR Workshop 2019.
  - Intended use: "mobile AR"; "The primary intended application is entertainment."
  - Limitations: "not suitable for people too far away from the camera (e.g. further than 5 feet/1.5 meters) or multiple people"; "Hairstyles with thin and long pieces, such as mohawks and hairstyles with elongated braids, may not be reliably segmented"; "Hair with any sort of large occlusion like headwear may not be reliably segmented".
  - The evaluation set was captured across 17 geographic subregions — [Model card PDF](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20-%20Hair%20Segmentation.pdf)
- The Multiclass segmenter has its own model card (not opened in this session) — [Multiclass model card](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Multiclass%20Segmentation.pdf)
- Commercial alternatives:
  - Perfect Corp's hair colour try-on API, "unlimited color options" — [Perfect Corp](https://www.perfectcorp.com/business/news/HairBeardAPI)
  - Banuba's hair dye try-on (Shopify app or custom integration) — [Banuba](https://www.banuba.com/blog/banuba-tint-virtual-try-on-pricing-guide)
- Capture conditions matter. On backlit or low-contrast photos of darker-skinned subjects, a production system's face segmentation produced an almost empty protective mask (vendor report; see section 1) — [IJERT](https://www.ijert.org/why-ai-gets-black-hair-wrong-documented-failure-modes-and-architectural-fixes-in-a-production-try-on-system-ijertv15is070651)

### Inferences
- **Browser and phone recolour.** A real-time recolour in a browser or on a phone can be built from MediaPipe Tasks (web/Android/iOS) with a shader-based recolour of the hair mask (keep luminance, shift chroma), with no per-call cost. The Apache-2.0 model card makes the hair model safe to ship. The model's age (2019) and its selfie-distance limit mean it should be tested on braids, locs, afro-textured hair and head coverings before relying on it.
- **Head coverings.** For users wearing a hijab or other head covering, the documented headwear failure means the product should detect the covering (e.g. the Multiclass "others (accessories)" class or a VLM label) and offer a covering-aware mode, not segment around it blindly.

### Gaps
- No published per-skin-tone or per-hair-texture accuracy numbers for HairSegmenter were found: the model card lists regions but its one page showed no metrics.
- No study isolating hijab or headscarf segmentation failure rates was found.
- The FASHN "segmentation-free mode", meant to keep head coverings intact in garment try-on, was seen only as a search summary — [FASHN](https://fashn.ai/blog/new-feature-preview-segmentation-free-mode)

## 3. 3D hair representations and real-time cost (Blender, Unreal/MetaHuman, three.js/WebGL, phones)

### Takeaway
There are three representations:
- **Strands (curves):** the most accurate, but heavy.
- **Cards:** textured polygon strips, the real-time standard on phones and web.
- **Hair meshes / helmets:** cheapest.

Unreal 5.8 renders strands only on desktop and current-gen consoles, and on macOS only from M2 upward. Cards and meshes run everywhere. Blender 5.2 LTS has a full geometry-nodes hair toolkit including braids. three.js has no hair system: web hair means cards with custom shaders, or WebGPU experiments.

### Cited Findings
- **Unreal Engine 5.8, groom platform support**
  - "Strands rendering is only supported on" Windows (DX11, DX12 or Vulkan), macOS (it "requires Shader Model 6 on the Mac M2 and above"), Linux, and current-gen consoles "such as PlayStation 5 and Xbox Series S/X".
  - "Groom Cards and Groom Meshes geometry are supported on all platforms"; "Groom simulation is supported on all platforms".
  - Skinned attachment and RBF are "supported on all platforms except Nintendo Switch and mobile".
  - "Grooms do not yet support proper precomputed lighting (Static or Stationary)" — [Epic docs](https://dev.epicgames.com/documentation/unreal-engine/groom-platform-support-in-unreal-engine)
- The UE 5.8 overview says the groom system "uses a strand-based workflow to render each individual strand", also supports cards, and handles "hundreds of thousands (or more) photo-real hairs in real-time" — [Epic docs](https://dev.epicgames.com/documentation/en-us/unreal-engine/hair-rendering-and-simulation-in-unreal-engine)
- Groom LODs: each hair group can use strands, cards or meshes per LOD, with up to 8 LOD entries (search summary only) — [Epic LOD docs](https://dev.epicgames.com/documentation/unreal-engine/setting-up-level-of-detail-for-grooms-in-unreal-engine)
- Unreal has a built-in hair card generator — [Epic docs](https://dev.epicgames.com/documentation/en-us/unreal-engine/hair-card-generator-for-grooms-in-unreal-engine)
- **MetaHuman**
  - "Strand-based grooms (provided with MetaHumans LOD 0 and 1) use a lot of memory" and "are not suitable for platforms like mobile".
  - `r.HairStrands.UseCardsInsteadOfStrands` swaps in cards ("If there is no Cards geometry available, nothing is displayed").
  - The mobile settings use `r.HairStrands.MinLOD=3`, and the cook removes those LODs from the device.
  - "Starting in Unreal Engine 5.0, hair strands are ray traced using path tracing" — [MetaHuman requirements](https://dev.epicgames.com/documentation/metahuman/requirements-and-configuration-settings-for-metahumans-in-unreal-engine)
- Groom import uses Alembic with a naming convention that supports Ornatrix, Yeti and XGen (search summary only) — [Epic docs](https://dev.epicgames.com/documentation/unreal-engine/groom-components-and-assets-in-unreal-engine)
- **Blender 5.2 LTS** has a "Hair Nodes" category:
  - Deformation: Blend, Displace, Frizz, Hair Curves Noise, Roll, Rotate, Shrinkwrap, Smooth, Straighten, Trim.
  - Generation: Duplicate, Generate, Interpolate Hair Curves.
  - Guides: **Braid Hair Curves**, Clump, Create Guide Index Map, Curl.
  - Utility: Attach Hair Curves to Surface, Redistribute Curve Points, Restore Curve Segment Length.
  - Write: Set Hair Curve Profile — [Blender 5.2 LTS manual](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/hair/index.html)
- **Hair meshes** (Bhokare, Montalvo-Ruiz, Diaz, Yuksel, SIGGRAPH 2024): strand geometry is generated on the fly on the GPU from a hair mesh.
  - "100 characters, each with 100,000 strands" rasterise in about 2 ms with 8x MSAA on an NVIDIA "GTX 4090" (sic), using LOD.
  - All 100 models fit in 1.7 MB (13–21 KB each).
  - A WebGL demo "should work on mobile devices as well".
  - However, "Hair meshes are protected by US and Internal patents": contact the author for any use — [Yuksel project page](https://cemyuksel.com/research/hairmesh_rendering/)
- **Strands → cards**:
  - Strands2Cards (Tojo, Hu, Umetani, Li; SIGGRAPH Asia 2025) clusters strands into wisps and fits textured strips by differentiable rendering. It converts ">100 thousand strands within 20 seconds" and outperforms prior work on curly and wavy styles. Code availability not confirmed (search summary only) — [MBZUAI record](https://irep.mbzuai.ac.ae/items/042f079d-4815-4160-ac21-34f2df9a4967)
  - A separate TOG 2025 card-extraction method also exists — [arXiv 2505.18805](https://arxiv.org/html/2505.18805v2)
- **three.js / WebGL / WebGPU**
  - three.js has no hair system. A forum report says building strands from tube geometry worked, but `MeshPhysicalMaterial` "did not produce anything good" (search summary only) — [three.js forum](https://discourse.threejs.org/t/realistic-hair-fur-material-strands/88143)
  - WebHairSim (WebGPU + WGSL) does GPU Verlet physics. Each "strand" is "a ribbon of quads oriented to the view… each ribbon can represent a clump of hair strands". No LICENSE file was found — [README](https://raw.githubusercontent.com/SiTronXD/WebHairSim/main/README.md)

### Inferences
- **Device split.** A practical cross-device plan:
  - strands for offline renders (Blender Cycles/EEVEE, or Unreal path tracing on desktop);
  - cards for web/three.js and phones;
  - an automatic strands→cards step (Strands2Cards-style, or Unreal's card generator) so one groom serves both.
- **The founder's Mac.** UE strand rendering needs an M2 or later, so on the founder's M1 Mac only Unreal cards/meshes, or Blender, are available for strand hair.
- **Hair meshes.** They are the most efficient published web-friendly strand method, but the patent makes them a licensing question, not a free option.

### Gaps
- No measured phone/web frame-time figures were found for card hair in three.js. The Unreal mobile card-LOD cost per character was not found.
- The Blender version that introduced the Curves hair object and the hair node-group assets was not confirmed: the Blender 3.5 notes page did not mention them.
- No primary source was found for the Unreal "Platform and LOD Specifications" table for MetaHuman hair.

## 4. Hair from images or video (strand reconstruction and generation)

### Takeaway
The field has moved from multi-view or video optimisation, which takes hours per subject (NeuralHaircut, MonoHair, GaussianHaircut), to single-image feed-forward models that run in seconds to minutes (DiffLocks 2.33 s on an H100, Im2Haircut, HairLRM, LRM+LMM pipelines). Nearly every released codebase is **non-commercial** (CC BY-NC, CC BY-NC-SA, or MPI/Meshcapade research licences). Perm is the exception: MIT code, but its single-view pipeline is unreleased.

### Cited Findings
- **NeuralHaircut** (arXiv 2306.05872) creates "strand-based hairstyle using multi-view images or monocular video". "This code and model are available for scientific research purposes". LICENSE.txt is **CC BY-NC 4.0** — [README](https://raw.githubusercontent.com/Vanessik/NeuralHaircut/main/README.md); [LICENSE](https://raw.githubusercontent.com/Vanessik/NeuralHaircut/main/LICENSE.txt)
- **GaussianHaircut** (Zakharov, Sklyarova, Black, Nam, Thies, Hilliges; arXiv 2409.14778) is "a strand-based hair reconstruction approach for monocular videos". The hair is output as 3D polylines that work "out-of-the-box in modern computer graphics engines".
  - It needs CUDA 11.8, and Blender 3.6 for visualisation.
  - Licence: "based on the 3D Gaussian Splatting project… refer to LICENSE_3DGS. The rest… CC BY-NC-SA 4.0" — [README](https://raw.githubusercontent.com/eth-ait/GaussianHaircut/main/README.md); [arXiv](https://arxiv.org/abs/2409.14778)
- **MonoHair** (CVPR 2024 Oral) gives "a monocular video, MonoHair reconstruct a high-fidelity 3D strand model".
  - It depends on Instant-NGP, DELTA/FLAME and DeepMVSHair, and was tested on an RTX 3090Ti.
  - LICENSE.txt is **CC BY-NC 4.0** — [README](https://raw.githubusercontent.com/KeyuWu-CS/MonoHair/master/readme.md); [LICENSE](https://raw.githubusercontent.com/KeyuWu-CS/MonoHair/master/LICENSE.txt)
- **HAAR** (CVPR 2024) does text → 3D strands with a latent diffusion model in a hairstyle UV space and uses NeuralHaircut's strand prior.
  - Tested on an "NVIDIA A100 40GB".
  - "available for scientific research purposes"; LICENSE.txt is **CC BY-NC 4.0** — [README](https://raw.githubusercontent.com/Vanessik/HAAR/master/README.md); [LICENSE](https://raw.githubusercontent.com/Vanessik/HAAR/master/LICENSE.txt)
- **Perm** (parametric strand model) has **MIT** code (© 2024 Chengan He), and its checkpoints, Hair20k training set and fitted USC-HairSalon parameters are released.
  - The single-view reconstruction pipeline is not released (a "reimplementation… with a public license" is a TODO).
  - Released single-view results "span a range of quality… some… exhibit depth issues when viewed from other angles"; "curly/kinky hairstyles are currently not well reconstructed".
  - Models trained on Adobe internal data need "an individual release license" from Adobe — [README](https://raw.githubusercontent.com/c-he/perm/main/README.md); [LICENSE](https://raw.githubusercontent.com/c-he/perm/main/LICENSE)
- **DiffLocks** (Rosu et al., CVPR 2025; Meshcapade/MPI) takes a single frontal RGB image and outputs about 100K strands × 256 points via a 256×256 scalp texture of 64-D latents plus a density map.
  - "All results are obtained on an NVIDIA H100 GPU", with a total of 2.33 s.
  - Dataset: 40K synthetic hairstyles made with Blender geometry nodes.
  - It claims to recover "highly curled hair, like afro hairstyles, from a single image for the first time".
  - Its stated limitation: the dataset "lacks hairstyles with braids, accessories, ponytails, and buns" — [arXiv HTML](https://arxiv.org/html/2505.06166v1); [CVPR paper](https://openaccess.thecvf.com/content/CVPR2025/papers/Rosu_DiffLocks_Generating_3D_Hair_from_a_Single_Image_using_Diffusion_CVPR_2025_paper.pdf)
- DiffLocks licence: "Non-Commercial Scientific Research Use Only… Any other use, in particular any use for commercial, pornographic, military, or surveillance, purposes is prohibited. This includes, without limitation, incorporation in a commercial product, use in a commercial service, or production of other artifacts for commercial purposes". Training on it for commercial use is also prohibited — [LICENSE](https://raw.githubusercontent.com/Meshcapade/difflocks/main/LICENSE)
- **Im2Haircut** (ICCV 2025; arXiv 2509.01469) does single-image strand reconstruction with a transformer prior trained on synthetic data, then local optimisation. It was tested on an A100. Licence: 3DGS licence plus "CC BY-NC-SA 4.0" — [README](https://raw.githubusercontent.com/Vanessik/Im2Haircut/master/README.md); [arXiv](https://arxiv.org/abs/2509.01469)
- **HairStep** (single-view) is under CC BY-NC 4.0 — [LICENSE](https://raw.githubusercontent.com/GAP-LAB-CUHK-SZ/HairStep/main/LICENSE)
- **TANGLED** (arXiv 2502.06392, Feb 2025) generates strands from multi-view lineart and has a braid-constraint post-process. Its MultiHair dataset has "457 hairstyles… 74 attributes", "emphasizing complex and culturally significant styles". No code is linked — [arXiv](https://arxiv.org/abs/2502.06392)
- **HairLRM** (SIGGRAPH 2026; arXiv 2606.15238) uses an LRM mesh as a "structural anchor" and a "Dual Orientation AutoEncoder" to lift it into strands. It says prior regression fails on "ponytails" and "curls". Code is not stated — [arXiv](https://arxiv.org/abs/2606.15238)
- **"Strand-based Hairstyle Generation via Large Reconstruction and Multimodal Models"** (arXiv 2608.13679, Aug 2026) combines LRMs, LMMs and geometry processing with no task-specific training. It reports "production-ready strand geometry… within only a few minutes", including curly hair, ponytails and buns. No code is listed — [arXiv](https://arxiv.org/abs/2608.13679)
- **Braids**: "Unsupervised 3D Braided Hair Reconstruction from a Single-View Image" (MVA 2025) uses a braid-theory synthetic braid model. No code is listed — [arXiv](https://arxiv.org/abs/2506.23072)
- Other 2026 preprints, seen as search summaries only:
  - HairOrbit (synthesises an orbit of views from one portrait, then reconstructs strands) — [arXiv 2604.02867](https://arxiv.org/html/2604.02867)
  - CGHair (Gaussian hair with card clustering) — [arXiv 2604.03716](https://arxiv.org/pdf/2604.03716)
  - HairGS — [arXiv 2509.07774](https://arxiv.org/pdf/2509.07774)

### Inferences
- **Commercial use.** For a commercial product, none of the strong released reconstruction models (NeuralHaircut, GaussianHaircut, MonoHair, HAAR, DiffLocks, Im2Haircut, HairStep) can be shipped or used to make commercial outputs without a separate licence from the authors' institutions (MPI, Meshcapade, ETH, Samsung, Adobe).
  - DiffLocks' licence also bars "production of other artifacts for commercial purposes", which covers rendered video.
  - The realistic commercial routes are (a) to license one, (b) to build on Perm's MIT code with your own single-view fitting, or (c) to skip reconstruction: pick the nearest groom from a licensed library (section 5) and recolour and fit it.
- **Input fit for a face-scan app.** A selfie video around the head matches the GaussianHaircut and MonoHair inputs, but both are optimisation methods needing CUDA GPUs. The single-image methods (DiffLocks, Im2Haircut, HairLRM) fit "one photo", but the back of the head is invented: Perm's depth issues, and HairOrbit exists because of this problem.
- **Format.** Strands output as polylines or Alembic (Perm releases `.abc` plus a `.blend` template) drop straight into Blender hair curves or an Unreal groom.

### Gaps
- No measured end-to-end times on consumer or Apple-silicon hardware. All the methods above assume NVIDIA CUDA, so none runs natively on the founder's M1 (inference from their CUDA requirements).
- The licence terms of the 3DGS component (LICENSE_3DGS) were not opened here.
- No evidence was found that any of these methods handles locs or head coverings.

## 5. Hair libraries and assets: licences, and use inside a generated-video product

### Takeaway
MetaHuman hair is the most permissive large library. It has been under the standard UE EULA since June 2025, is usable in other engines and DCC tools, and is free under $1M per year revenue, but it must not be used to train or improve AI models. Fab assets use the Standard licence (Personal or Professional tier), plus a "NoAI" tag that bars generative-AI data collection. Reallusion's EULA (May 2026) allows selling rendered images and video, but restricts use "in any character generation system", "any character-generating business" and AI training. A "pick your hairstyle" product is the risky case for Reallusion hair.

### Cited Findings
- **MetaHuman** (CG Channel, 4 June 2025, reporting Epic's change):
  - "The MetaHuman toolset is now covered by the standard Unreal Engine EULA"; it is free for those "with under $1 million/year in revenue".
  - Larger studios need UE seat licences ($1,850/yr at the time).
  - MetaHumans can be used in Unity, Godot and other DCC apps as "non-engine products"; characters and clothing can be sold on marketplaces.
  - They can be used in "workflows that incorporate artificial intelligence technology" but not to "train or enhance the AI models themselves".
  - The Maya and Houdini plugins create MetaHuman-compatible grooms and "export them in Alembic format" — [CG Channel](https://www.cgchannel.com/2025/06/you-can-now-sell-metahumans-or-use-them-in-unity-or-godot/)
- **Fab** licences:
  - CC-BY (free) or Standard (free or paid). Standard has Personal (buyer has "not generated more than $100,000 USD" in the last 12 months) and Professional tiers.
  - "The NoAI meta tag indicates that an asset must not be used for generative AI data collection"; NoAI assets must use the Standard licence.
  - The page does not say what Standard permits for films, renders or apps — [Epic Fab docs](https://dev.epicgames.com/documentation/en-us/fab/licenses-and-pricing-in-fab)
- A 2023 Epic content-agreement text quoted on the UE forum: users "agree not to use content marked as 'NoAI' in datasets for, in the development of, or as inputs to generative AI programs" (search summary only; 2023, may be outdated) — [UE forum](https://forums.unrealengine.com/t/ai-content-spam/1779534/3)
- **Reallusion** software EULA (dated **25 May 2026**):
  - It grants the right "to generate images, videos, avatars, models, and/or animations" and says "You may sell or redistribute images and videos created with properly licensed Reallusion Software".
  - "Original Character Creation" excludes Reallusion content "including models, morphs, textures, hair, and outfit assets".
  - Restrictions forbid use "in any character generation system", "for AI training, machine learning, or synthetic data generation purpose", and "in any character-generating business".
  - The rights to content assets inside outputs are governed by the separate Content EULA — [Reallusion EULA](https://www.reallusion.com/Content/EULA/AP/EULA_AP.htm)
- In a 2022 Reallusion forum thread, an in-game face/hair/outfit selector "would be classified as an in-game character creator, and so would not be permitted under the EULA without an Enterprise license". This is an old forum reply, not verified as current policy (search summary only) — [Reallusion forum](https://forum.reallusion.com/PrintTopic525669.aspx)
- The DiffLocks 40K synthetic Blender hair dataset is covered by the non-commercial research licence (section 4) — [LICENSE](https://raw.githubusercontent.com/Meshcapade/difflocks/main/LICENSE)

### Inferences
- **MetaHuman.** MetaHuman grooms exported as Alembic look usable as a hairstyle catalogue in a product that renders characters to video, including in Blender, provided:
  - the company stays under $1M/yr or buys seats;
  - the assets are never used to train or fine-tune a model, including any LoRA trained on renders. That bar matters if the plan is to train a hair-style adapter.
- **Reallusion hair.** It looks unsafe for a consumer "choose your hairstyle" feature without an Enterprise licence: the "character generation system" and "character-generating business" bars.
- **Fab.** Each asset needs its own check: read the Fab EULA for the Standard licence's scope and avoid NoAI-tagged assets in any AI step.

### Gaps
- The current Fab EULA text on the Standard licence's scope (films, renders, apps, SaaS outputs) was not read: fab.com/eula was not fetched.
- Epic's own MetaHuman licence or FAQ page was not read directly; the CG Channel report was used.
- Blender Market / Superhive hair-asset licences, and other groom vendors (e.g. CGTrader, ArtStation), were not researched.
- The Reallusion Content EULA (as opposed to the software EULA) was not read.

## 6. Hair physics and simulation in a code or Blender pipeline

### Takeaway
- **Blender 5.2 LTS** (released July 2026) added an experimental geometry-nodes Hair Dynamics node on a new XPBD solver. It is scriptable headless, but marked experimental.
- **Unreal** simulates grooms with Niagara on the GPU, using an XPBD option and guide strands, and simulation runs on all platforms.
- **Web**: GPU Verlet on WebGPU is experimental and hobby-grade.

### Cited Findings
- **Blender Hair Dynamics node** (Blender 5.2 LTS manual)
  - "creates movement of curve geometry as animated or dynamic physical strands".
  - *Animation* mode follows the surface; *Physics* mode simulates "flexible, thin rods".
  - "The motion of the hair curves simulated over time using the XPBD Solver node". "The shape of the hair curves defines the natural rest shape."
  - Parameters: Substeps, Constraint Iterations, Time Scale, Mass, Friction, Stretchiness, Bendiness.
  - It sets up structural constraints, gravity, damping and collision with the surface mesh.
  - "Physics simulation for hair dynamics is an experimental feature and may change significantly in the future" — [Blender manual](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/simulation/hair_dynamics.html)
- Blender 5.2 LTS was released on 14 July 2026. Its headline is experimental hair and cloth physics "implemented as built-in node group assets" on "a more general declarative XPBD simulation framework" (search summary only) — [CG Channel](https://www.cgchannel.com/2026/07/blender-5-2-lts-is-here-discover-its-5-key-features/); [Digital Production](https://digitalproduction.com/2026/07/21/blender-5-2-lts-lands-with-node-physics/)
- **Unreal groom physics** (search summary only):
  - It is enabled in the Groom Asset Editor Physics panel.
  - Settings include the Niagara solver choice, sub-steps, XPBD iteration count, gravity, air drag, air velocity and bend constraints.
  - Simulation guides are resampled from the rendering guides — [Epic docs](https://dev.epicgames.com/documentation/en-us/unreal-engine/enabling-physics-simulation-on-grooms-in-unreal-engine); [hair physics overview](https://dev.epicgames.com/documentation/unreal-engine/hair-physics-in-unreal-engine---overview)
- Epic's UE 4.24 blog (Jan 2020, dated) said hair simulation lives in Niagara on the GPU. A physics asset handles body collisions, and self-collision uses an average velocity field (search summary only) — [Unreal tech blog](https://www.unrealengine.com/en-US/tech-blog/an-early-look-at-next-generation-real-time-hair-and-fur)
- MetaHuman configuration sets `fx.Niagara.ForceLastTickGroup=1` so Niagara hair collision runs after everything else — [MetaHuman requirements](https://dev.epicgames.com/documentation/metahuman/requirements-and-configuration-settings-for-metahumans-in-unreal-engine)
- UE 5.8 states "Groom simulation is supported on all platforms" — [Epic docs](https://dev.epicgames.com/documentation/unreal-engine/groom-platform-support-in-unreal-engine)
- On the web, WebHairSim runs "GPU-based hair strand physics using Verlet integration" in WebGPU/WGSL. Strand-to-strand interaction is listed as future work — [README](https://raw.githubusercontent.com/SiTronXD/WebHairSim/main/README.md)

### Inferences
- **Blender pipeline.**
  1. Import the strands (Alembic or curves) as a hair-curves object.
  2. Attach them to the scalp ("Attach Hair Curves to Surface").
  3. Add the Hair Dynamics node group.
  4. Bake via `bpy` headless.

  This needs Blender 5.2 LTS. A pipeline pinned to an earlier Blender (e.g. LOOKLAB's 5.1.1) would need an upgrade or older particle-hair dynamics. Because the feature is experimental, results may change between versions, so pin the version and keep golden renders.
- **Generated video.** If hair motion comes from a video model rather than a simulation, physics matters only for the 3D-avatar path. Cards with a few guide strands simulated (Unreal-style) is the cheap real-time pattern.

### Gaps
- No primary Blender 5.2 release-notes page was opened. Performance figures (strands × substeps vs time) for Blender XPBD hair were not found.
- Neural or learned hair-simulation methods (2024–2026) were not researched.
- No benchmark of Unreal groom simulation cost on mobile was found.

## 7. Hardest hair problems and documented bias (curly/coily/afro-textured hair, braids, locs, head coverings)

### Takeaway
Every layer of the pipeline is weakest on coily and afro-textured hair, braids and locs, and head coverings:
- training sets under-represent them;
- the segmenter's model card names braids and headwear as failures;
- strand models (Perm, earlier reconstruction methods) fail on tight curls;
- general editors over-edit dark-skinned faces more.

DiffLocks (afro-like curls) and TANGLED/MultiHair (culturally significant styles, braids) are the main attempts at fixes. Both are research-only. No method was found for locs or for hair under a hijab.

### Cited Findings
- Perm: "Due to limitations in training data, curly/kinky hairstyles are currently not well reconstructed" — [Perm README](https://raw.githubusercontent.com/c-he/perm/main/README.md)
- DiffLocks claims it "can recover highly curled hair, like afro hairstyles, from a single image for the first time". Its data still "lacks hairstyles with braids, accessories, ponytails, and buns" — [DiffLocks arXiv](https://arxiv.org/html/2505.06166v1)
- Hairmony (Meishvili et al., Microsoft; SIGGRAPH Asia 2024; arXiv 2410.11528), seen as search summaries only:
  - It says strand-level parametric models "cannot yet represent short, frizzy, coily hair and gathered hairstyles".
  - Its classifier is trained only on synthetic images (reported as 100,000 images, 480 hairstyles), balanced by an expert taxonomy that also measures fairness.
  - It releases synthetic training data and a real evaluation set — [arXiv](https://arxiv.org/html/2410.11528v1); [Microsoft Research](https://www.microsoft.com/en-us/research/publication/hairmony/)
- TANGLED's MultiHair: 457 styles, 74 attributes, "emphasizing complex and culturally significant styles", with braid-specific constraints — [arXiv](https://arxiv.org/abs/2502.06392)
- Other papers on braids and very curly hair:
  - Braids get their own single-view method with a braid-theory model (MVA 2025) — [arXiv](https://arxiv.org/abs/2506.23072)
  - GeomHair notes that "very curly scenes remain challenging" because scans miss high-frequency detail (search summary only) — [arXiv](https://arxiv.org/pdf/2505.05376)
- MediaPipe hair model card: "hairstyles with elongated braids, may not be reliably segmented"; "Hair with any sort of large occlusion like headwear may not be reliably segmented" — [Model card](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20-%20Hair%20Segmentation.pdf)
- General editors on hair edits: "almost all models created more overedits for dark-skinned male faces and old faces"; "Flux-dev is poor at retaining the facial identity of people with darker skin tones" — [arXiv 2608.28802](https://arxiv.org/html/2608.28802v1)
- Production vendor report: identity drift in which the subject is replaced by someone "often lighter-skinned", and segmentation failure on backlit darker-skinned subjects. This is observational, vendor-authored and not confirmed as peer-reviewed — [IJERT](https://www.ijert.org/why-ai-gets-black-hair-wrong-documented-failure-modes-and-architectural-fixes-in-a-production-try-on-system-ijertv15is070651)
- A 2026 ACM study of makeup and hairstyle transfer models reportedly found "the most severe degradations were observed on Black-presenting faces and textured hairstyles", with realism declining as hairstyle complexity rises (search summary only; the page returned 403) — [doi](https://doi.org/10.1145/3810417.3810425)
- Perfect Corp's Hair Type Detection classifies "straight, wavy, curly, and kinky hair" (marketing claim; accuracy not published) — [Perfect Corp](https://www.perfectcorp.com/business/news/HairBeardAPI)

### Inferences
- **Test set.** Any "set my hair" feature needs a test set balanced across skin tone, age, gender and hair texture (straight, wavy, curly, coily, braids, locs, protective styles), plus head coverings, before launch. Measure per group:
  - identity similarity;
  - unwanted colour or texture change;
  - segmentation coverage.

  The research shows that averages hide the failures.
- **Head coverings.** For users who wear a hijab or other covering, the honest product behaviour is to keep the covering as it is (or offer styles shown under or around it) rather than "transfer hair" onto it. No method was found that handles this, so it needs explicit design and testing.
- **Coily and locs in 3D.** On the 3D path, a curated groom library that deliberately includes coily, braided and loc styles is more reliable today than reconstruction, which fails on exactly those styles. Commercially usable libraries were not checked for how well they cover these styles.

### Gaps
- No paper or dataset specific to locs (dreadlocks) for 3D strands was found.
- No study measuring hijab or head-covering handling in hair try-on or segmentation was found.
- No independent audit of Perfect Corp, Banuba or ModiFace hair try-on across skin tones or hair textures was found.
- The Hairmony dataset licence and the full results of the 2026 ACM demographic-bias study were not verified.
