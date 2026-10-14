# Face capture to a 3D head or full-body avatar (render, rig, animate): options a startup can ship, as of October 2026

All sources were read on 2026-10-14 unless a line says otherwise. Publication dates are given where the source shows one. "Secondary" means an aggregator, news story or competitor blog, not the licensor or vendor. "Unverified" means I could not confirm it against a primary page.

## 1. Parametric head and body models (FLAME, SMPL, SMPL-X, newer open ones): licences, commercial routes, what they represent and what they leave out

### Takeaway
The classic Max Planck models are non-commercial by default. FLAME (2017–2023), SMPL-Model and SMPL-X are licensed for "non-commercial scientific research" only. There are three exceptions you can ship with:
- **FLAME 2023 Open** is under CC-BY, with bans on pornographic use and on fake or defamatory content.
- **SMPL-Body** is CC-BY 4.0, but it does not include the shape space.
- Two newer permissive body models came out in late 2025, both Apache-2.0: Meta's **MHR (Momentum Human Rig)**, which covers body, hands and face expression, and NAVER's **Anny**.

Commercial SMPL/SMPL-X licensing used to go through Meshcapade. Epic Games agreed to acquire Meshcapade (reported 19 Feb 2026), and Max Planck Innovation is taking over SMPL licensing directly.

### Cited Findings
**FLAME (MPI-IS)**
- FLAME 2017, 2019, 2020 and 2023, and the FLAME Blender add-on (FLAME 2020), are under the Academic Model License. It grants use "for the sole purpose of performing non-commercial scientific research". It says: "Any other use, in particular any use for commercial, pornographic, military, or surveillance, purposes is prohibited. This includes, without limitation, incorporation in a commercial product, use in a commercial service". — [FLAME model licence](https://flame.is.tue.mpg.de/modellicense.html)
- The commercial contact on that page is: "For commercial uses of the Data & Software, please send email to ps-license@tue.mpg.de". — [FLAME model licence](https://flame.is.tue.mpg.de/modellicense.html)
- The FLAME 2023 Open model terms, quoted exactly:
  - Scope: "The following license applies ONLY to the FLAME 2023 Open model; all other models are covered by the non-commercial license above. Creative Commons Attribution license".
  - Grant: "Max-Planck grants you the right to share and adapt the model for any purpose, including commercial use under following terms: You must give appropriate credit, provide a link to the license, and indicate if changes were made".
  - Restrictions: "The model may not be used for pornographic purposes or to generate pornographic material whether commercial or not. The Model may further not be used to create fake, libelous, misleading, or defamatory content of any kind excluding analyses in peer-reviewed scientific research."
  - Source: [FLAME model licence, "Open Model License" section](https://flame.is.tue.mpg.de/modellicense.html)
- A Hugging Face user asked the LAM team which FLAME version their released assets use. It matters because it decides whether a separate commercial FLAME licence is needed or whether FLAME 2023 Open applies. The question was unanswered when read. — [HF discussion, LAM-20K #2 (opened "Jun 8")](https://huggingface.co/3DAIGC/LAM-20K/discussions/2)

**SMPL / SMPL-X (MPI-IS)**
- The SMPL-X licence is titled "Software Copyright License for non-commercial scientific research purposes". It grants "personally a single-user, non-exclusive, non-transferable, free of charge right ... To use the Model & Software for the sole purpose of performing non-commercial scientific research". It prohibits commercial use with the same wording as FLAME ("incorporation in a commercial product, use in a commercial service"). — [SMPL-X model licence](https://smpl-x.is.tue.mpg.de/modellicense.html)
- The SMPL-Model licence page says: "This software/data and the associated license is for academic research purposes. The software/data is also available for commercial licensing through Meshcapade.com. For commercial use please email smpl@max-planck-innovation.de". — [SMPL model licence](https://smpl.is.tue.mpg.de/modellicense.html)
- SMPL-Body: "SMPL-Body is a subset of SMPL-Model which excludes the shape blendshapes or the tools to create 3D bodies using the shape blendshapes ... SMPL-Body is licensed under the Creative Commons Attribution 4.0 International License." A SMPL-Body can be shared "in the form of OBJ file(s), animated FBX file(s), or as a set of mesh vertices, skeleton rig, pose blendshapes and dynamic blendshapes". — [SMPL-Body licence](https://smpl.is.tue.mpg.de/license.html)
- The same page cites patents: "The SMPL-Model specification is defined in the granted US patent US10395411B2 ... and the pending European EP3314577A1 ... and World WO2016207311A1 ... The Max Planck Society (MPG) owns the technology disclosed". — [SMPL-Body licence](https://smpl.is.tue.mpg.de/license.html)
- Meshcapade's SMPL licence prices (secondary; from a search snippet of Meshcapade's Notion page; not fetched; unverified). All prices are annual and "subject to annual increase". The page also says the R&D licence does not cover product development, integration into commercial tools, customer-facing use or redistribution.

  | Tier | Who qualifies | R&D | Commercial |
  |---|---|---|---|
  | "Mico" | ≤10 employees and ≤€2M turnover | €1,500 | €5,000 |
  | SME | ≤250 employees and ≤€50M turnover | €32,500 | "Contact Sales" |
  | Enterprise | Base: one team under 15 people | – | €41,400 |
  | Enterprise | Organisation-wide | €124,200 | "Contact Sales" |

  — [Meshcapade "The SMPL Model Licenses" (Notion), via search result](https://meshcapade.notion.site/The-SMPL-Model-Licenses-2144560e54388085af5eff111fcdf266)
- Epic Games is acquiring Meshcapade (article dated 19 Feb 2026; the deal was described as "set to" close). Max Planck Innovation "will now directly take over the licensing of the SMPL technology". The core technology "remains available to both existing and new customers". The Meshcapade team will "contribute to Unreal Engine and MetaHuman technologies". — [GamesMarket, 19 Feb 2026](https://www.gamesmarket.global/epic-games-acquires-meshcapade-and-will-establish-a-presence-in-tubingen/)
- SMPL-X parameters, as described in LHM's supplement: "shape parameters β ∈ R^20, and pose parameters θ ∈ R^(55×3)". — [LHM ICCV 2025 supplemental](https://openaccess.thecvf.com/content/ICCV2025/supplemental/Qiu_LHM_Large_Animatable_ICCV_2025_supplemental.pdf)

**Newer permissive models**
- **Meta MHR (Momentum Human Rig).** "MHR is licensed under the Apache Software License 2.0" (PyPI `mhr` 1.0.1; the repo LICENSE file is Apache 2.0). It provides:
  - "45 shape parameters controlling body identity"
  - "204 model parameters for full-body articulation"
  - "72 expression parameters for detailed face animation"
  - "7 levels of detail (LOD 0-6)"
  - "Neural network-based pose-dependent deformations"

  Model assets come as a GitHub release zip, and a TorchScript version is available. — [PyPI mhr](https://pypi.org/project/mhr/); [MHR LICENSE via jsDelivr mirror](https://cdn.jsdelivr.net/gh/facebookresearch/MHR@main/LICENSE); [arXiv 2511.15586](https://arxiv.org/abs/2511.15586v3)
- The MHR paper says it "combines the decoupled skeleton/shape paradigm of ATLAS with a flexible, modern rig and pose corrective system inspired by the Momentum library". — [arXiv 2511.15586](https://arxiv.org/pdf/2511.15586)
- **NAVER LABS Anny.**
  - Licence: "Anny, Copyright (C) 2025 NAVER Corporation ... licensed under the Apache License, Version 2.0" — [Anny LICENSE via jsDelivr mirror](https://cdn.jsdelivr.net/gh/naver/anny@main/LICENSE)
  - Download: available with no registration or gated download — [NAVER LABS Europe blog](https://europe.naverlabs.com/blog/anny-a-free-to-use-3d-human-parametric-model-for-all-ages/)
  - Model: scan-free and built from MakeHuman community data; over 13,000 vertices, 163 bones and 564 artist-defined blendshapes; calibrated to WHO demographic statistics from infants to elders — [arXiv 2511.03589](https://arxiv.org/html/2511.03589v2)
- **SAM 3D Body (Meta, checkpoints released 19 Nov 2025)** estimates "body, feet, and hands" pose with the MHR mesh from a single image. — [sam-3d-body README](https://github.com/facebookresearch/sam-3d-body). Its licence is covered in section 8.

### Inferences
- For a product that has to be commercial on day one without a negotiated licence, the shippable parametric bases are:
  - FLAME 2023 Open (head only, CC-BY)
  - MHR (body, hands and 72 face expressions, Apache-2.0)
  - Anny (body, all ages, Apache-2.0)
  - SMPL-Body (CC-BY, but no shape space, so you cannot fit new body shapes with it)
- Any research method that loads FLAME 2020 or SMPL-X weights inherits a non-commercial restriction, even when its own code is MIT or Apache.
- FLAME 2023 Open bans "fake, libelous, misleading ... content". That is a live risk for any likeness or "digital double" product, which can be accused of making misleading content of a real person. It needs legal review.
- From my general knowledge, not a source read in this session: FLAME, SMPL-X and MHR represent a skinned mesh's shape, expression and pose. None of them models hair, clothing, accessories, or wrinkle and pore detail. Methods add those as Gaussians, offsets or textures; for example, OMEGA-Avatar adds a separate hair deformation module ([arXiv 2602.11693](https://arxiv.org/html/2602.11693v1)).
- The Epic–Meshcapade deal may change the price and route for a commercial SMPL-X licence. Ask Max Planck Innovation directly for current terms.

### Gaps
- I could not fetch the Meshcapade price page directly, so the prices above are unverified and may predate the Epic deal.
- I found no official date for the FLAME 2023 Open release.
- I did not verify whether the FLAME 2023 Open model has the same topology and expression space as FLAME 2020, which many research codebases assume.
- I did not check Google GHUM/GHUML; a search found nothing relevant.

## 2. Single-image and few-shot 3D head reconstruction (DECA, EMOCA, MICA, SMIRK, 2024–2026 methods) and their licences

### Takeaway
The well-known FLAME regressors are all research-only:
- DECA, EMOCA and MICA use Max Planck-style non-commercial licences.
- SMIRK's code is MIT, but it needs FLAME, and its weights carry no stated licence.

So none of these is commercially clean as published. Commercial alternatives are a FLAME 2023 Open fit you build yourself, KeenTools FaceBuilder (section 5), Reallusion Headshot (section 6), Mesh to MetaHuman (section 4), or a vendor SDK (section 7).

### Cited Findings
- **DECA**: "This code and model are available for non-commercial scientific research purposes as defined in the LICENSE file". The LICENSE file is titled "Software Copyright License for non-commercial scientific research purposes". It takes a single image and outputs head pose, shape, detailed geometry and lighting, plus an OBJ with texture taken from the image. — [DECA README](https://github.com/yfeng95/DECA); [DECA LICENSE via jsDelivr mirror](https://cdn.jsdelivr.net/gh/yfeng95/DECA@master/LICENSE)
- **EMOCA**: "This code and model are available for non-commercial scientific research purposes". It reconstructs 3D from a single face image. — [EMOCA README](https://github.com/radekd91/emoca)
- **MICA**: the LICENSE is a "Software Copyright License for non-commercial scientific research purposes" covering "the MICA model, data and software ... including 3D meshes, software, and scripts". It outputs a `.ply` mesh and `.npy` FLAME parameters per subject, and uses insightface (antelopev2 / buffalo_l) models. — [MICA LICENSE via jsDelivr mirror](https://cdn.jsdelivr.net/gh/Zielon/MICA@master/LICENSE); [MICA README](https://github.com/Zielon/MICA)
- **SMIRK (CVPR 2024)**: the code is "MIT License, Copyright (c) 2024 George Retsinas". Installation "includes downloading the FLAME model. This requires registration". The README states no licence for the pretrained weights. — [SMIRK LICENSE via jsDelivr mirror](https://cdn.jsdelivr.net/gh/georgeretsi/smirk@main/LICENSE); [SMIRK README](https://github.com/georgeretsi/smirk)
- **2025–2026 single-image methods** output Gaussian heads rather than plain meshes:
  - LAM (Feb 2025)
  - "Generalizable and Animatable 3D Full-Head Gaussian Avatar from a Single Image" (arXiv 2601.12770, Jan 2026): real-time animation at 246 FPS, with Gaussians on FLAME UV space
  - OMEGA-Avatar (arXiv 2602.11693, Feb 2026): "first feed-forward framework that simultaneously generates a generalizable, 360°-complete, and animatable 3D Gaussian head from a single image"

  See section 3. — [arXiv 2601.12770](https://arxiv.org/html/2601.12770); [arXiv 2602.11693](https://arxiv.org/html/2602.11693v1)

### Inferences
- Any of these regressors could serve as a prototype tracker or fitter during R&D. Shipping one commercially would need a licence from MPI-IS / Max Planck Innovation for both the method and FLAME. For SMIRK, the only blocker is FLAME, plus whatever licence its weights turn out to have.
- A clean route is to fit FLAME 2023 Open, MHR or Anny yourself, using licence-clean landmarks and optimisation. That avoids the non-commercial regressors.

### Gaps
- I did not check every 2024–2026 FLAME regressor (for example TokenFace, Pixel3DMM or later versions). I did not find their licences.
- I found no licence statement for SMIRK's weights.
- EMOCA's LICENSE file was not fetched in full; the README statement is quoted above.

## 3. 3D Gaussian splatting head and full-body avatars: inputs, animation, browser and three.js support, licences

### Takeaway
Gaussian avatars give the best photoreal likeness, and one-shot feed-forward models now exist for heads (LAM, GAGAvatar, 2026 papers) and full bodies (LHM, LHM++). Licences are the trap:
- The original Inria 3DGS rasteriser is research and evaluation only.
- GaussianAvatars is CC BY-NC-SA.
- Gaussian Head Avatar is non-commercial and explicitly bars films, apps and games.
- **LAM's weights are CC BY-NC 4.0**, even though its code is Apache-2.0.
- LHM is Apache-2.0 for code and weights, but it is driven by SMPL-X, which is non-commercial.

For browser playback, Spark (MIT, three.js) has had experimental Linear Blend Skinning of splats since 2.0. LAM ships its own WebGL renderer.

### Cited Findings
**Licences of the building blocks**
- The Inria / MPII "Gaussian-Splatting License": "The *Software* may be used 'non-commercially', i.e., for research and/or evaluation purposes only". Derivative works may carry other terms only if "Your Terms provide that the use limitation in Section 2 applies to your derivative works". — [Inria Gaussian-Splatting LICENSE (HF mirror)](https://huggingface.co/spaces/yslan/GaussianAnything-AIGC3D/raw/a0896dd52a14e7ee5bdd71ff4c5aa0b6682ec79e/submodules/diff-surfel-rasterization/LICENSE.md)
- gsplat (nerfstudio) is "under Apache License 2.0" (secondary). — [Aalto repository record for gsplat paper](https://aaltodoc.aalto.fi/items/535d91f9-2595-49a4-bff6-47e1ad0cf9c3)
- NVIDIA nvdiffrast is under the "Nvidia Source Code License (1-Way Commercial)", where "'non-commercially' means for research or evaluation purposes only". Several avatar and image-to-3D pipelines use it. — [nvdiffrast LICENSE via jsDelivr mirror](https://cdn.jsdelivr.net/gh/NVlabs/nvdiffrast@main/LICENSE.txt)

**Head avatars**
- **GaussianAvatars** (Qian et al.):
  - Licence: "made available under CC-BY-NC-SA-4.0", with a Toyota Motor Europe notice that "Any commercial use, reproduction, disclosure or distribution of this software" is "strictly prohibited" without a licence. It also "uses Gaussian Splatting, which carries its original license".
  - Animation: Gaussians are bound to a driving mesh such as FLAME (`--bind_to_mesh`), with the VHAP tracker.
  - Sources: [GaussianAvatars README](https://github.com/ShenhanQian/GaussianAvatars); [LICENSE.md via jsDelivr mirror](https://cdn.jsdelivr.net/gh/ShenhanQian/GaussianAvatars@main/LICENSE.md)
- **Gaussian Head Avatar** (Tsinghua, CVPR 2024):
  - Input: multi-view data (NeRSemble) with fitted BFM coefficients.
  - Licence: use only "for the sole purpose of performing non-commercial scientific research, non-commercial education, or non-commercial artistic projects. Any other use, in particular any use for commercial purposes, is prohibited. This includes ... web services, movies, television programs, mobile applications, or video games." Commercial contact: liuyebin@mail.tsinghua.edu.cn.
  - Sources: [Gaussian-Head-Avatar README](https://github.com/YuelangX/Gaussian-Head-Avatar); [LICENSE via jsDelivr mirror](https://cdn.jsdelivr.net/gh/YuelangX/Gaussian-Head-Avatar@main/LICENSE)
- **GAGAvatar** (NeurIPS 2024): one image in, a one-shot 3DGS head out, "real-time" reenactment. The code is MIT. The README notes FLAME resources "have separate setup or license requirements". — [GAGAvatar README](https://github.com/xg-chu/GAGAvatar)
- **LAM, "Large Avatar Model for One-shot Animatable Gaussian Head"** (Alibaba Tongyi, arXiv 2502.17796, Feb 2025):
  - Input and animation: one image in. The avatar is animated by "standard linear blend skinning and corrective blendshapes, as FLAME does" ([arXiv 2502.17796](https://arxiv.org/abs/2502.17796v2)).
  - Speed: the README reports 562.9 FPS on an A100 and "110+FPS" on a Xiaomi 14 phone.
  - Web: a WebGL SDK on OpenAvatarChat (21 Apr 2025) and WebGL-Render (20 May 2025).
  - Audio: Audio2Expression (19 Apr 2025).
  - Follow-ups: PanoLAM (9 Sep 2025) and MeshLAM (30 Apr 2026, CVPR 2026).
  - Weights: LAM-20K on HF and ModelScope.
  - Source: [LAM README](https://github.com/aigc3d/LAM)
- **LAM licence split.** The repo's `LICENSE` is Apache 2.0. Its `LICENSE_WEIGHT` file begins "Attribution-NonCommercial 4.0 International", so **the weights are CC BY-NC 4.0**. The HF model card for 3DAIGC/LAM-20K states no licence. — [LAM LICENSE_WEIGHT via jsDelivr mirror](https://cdn.jsdelivr.net/gh/aigc3d/LAM@master/LICENSE_WEIGHT); [LAM LICENSE](https://cdn.jsdelivr.net/gh/aigc3d/LAM@master/LICENSE); [HF API, 3DAIGC/LAM-20K](https://huggingface.co/api/models/3DAIGC/LAM-20K)
- **2026 one-shot full-head Gaussian papers:** arXiv 2601.12770 (246 FPS animation, 360°) and OMEGA-Avatar arXiv 2602.11693 (360°-complete, with a hair deformation module). — [arXiv 2601.12770](https://arxiv.org/html/2601.12770); [arXiv 2602.11693](https://arxiv.org/html/2602.11693v1)
- **From a phone video:**
  - GAF (CVPR 2025) builds a re-animatable Gaussian avatar from a short smartphone clip; its videos were captured on an iPhone 14 Pro ([arXiv 2412.10209](https://arxiv.org/html/2412.10209v2)).
  - GTAvatar (arXiv 2512.09162) is relightable and editable from a single monocular video using FLAME ([arXiv 2512.09162](https://arxiv.org/pdf/2512.09162)).
  - BakedAvatar targets real-time playback on mobiles from monocular video, with a mesh-based output (secondary search summary) ([BakedAvatar repo](https://github.com/buaavrcg/BakedAvatar)).

**Full-body avatars**
- **LHM, "Large Animatable Human Reconstruction Model"** (Alibaba, ICCV 2025): a single image in, an animatable 3DGS human out "in seconds". It initialises Gaussians from "the canonical SMPL-X mesh". — [arXiv 2503.10625](https://arxiv.org/pdf/2503.10625); [ICCV supplemental](https://openaccess.thecvf.com/content/ICCV2025/supplemental/Qiu_LHM_Large_Animatable_ICCV_2025_supplemental.pdf)
- **LHM licence and hardware.** The code is Apache-2.0 ([LICENSE](https://cdn.jsdelivr.net/gh/aigc3d/LHM@main/LICENSE)). The HF weights card says `license: apache-2.0` ([HF 3DAIGC/LHM](https://huggingface.co/3DAIGC/LHM/raw/main/README.md)). The README says:
  - LHM-MINI runs on 16 GB GPUs (13 Apr 2025)
  - a memory-saving version runs on 14 GB (16 Apr 2025)
  - the Gradio app with motion input needs "at least 24 GB"
  - "[March 2026] LHM++ is now open-sourced! ... 8-view input runs on just 8GB GPU memory"

  — [LHM README via jsDelivr mirror](https://cdn.jsdelivr.net/gh/aigc3d/LHM@main/README.md)

**Browser and three.js playback**
- Spark (`@sparkjsdev/spark` 2.3.1) is MIT, "An advanced 3D Gaussian Splatting renderer for THREE.js". — [npm registry](https://registry.npmjs.org/@sparkjsdev/spark/latest)
- Spark 2.0 has "experimental support for Linear Blend Skinning, which is more typically used for rigged character animation", which "opens up the door to animating splat 'characters' using existing mesh-based rigging systems". Spark 0.1 used dual-quaternion blending. — [Spark "New features in 2.0"](https://sparkjs.dev/docs/new-features-2.0/)
- Spark reads "ply, sogs, spz, splat, ksplat". — [sparkjs.dev](https://sparkjs.dev/)
- `@mkkellogg/gaussian-splats-3d` 0.4.7 is an MIT "Three.js-based 3D Gaussian splat viewer". — [npm registry](https://registry.npmjs.org/@mkkellogg/gaussian-splats-3d/latest)

### Inferences
- There is no fully commercial-clean, pre-trained, one-shot Gaussian head model in what I checked:
  - LAM: weights are NC.
  - GAGAvatar: code is MIT, but its weights' licence is unstated and it depends on FLAME.
  - The 2026 papers: code and licences are unknown.
- LHM is the closest for full bodies, but rigging through SMPL-X needs a commercial SMPL-X licence. Swapping in MHR or Anny would mean retraining.
- A startup that wants Gaussian likeness can do one of three things: (a) licence LAM's weights from Alibaba, (b) train its own on licence-clean data, using gsplat (Apache) and not Inria code or nvdiffrast, or (c) use Gaussians only for offline renders and ship a mesh avatar.
- Running splat avatars in a browser is technically possible with Spark LBS (experimental) or LAM's WebGL renderer. There is no standard file format for a rigged Gaussian avatar yet; .ply/.spz carry static splats only.
- Compute: these models need CUDA GPUs to generate. LHM needs 14–24 GB VRAM, beyond an 8 GB M1 (the LOOKLAB host). Playback is light: LAM reports 110+ FPS on a phone.

### Gaps
- I found no licence for the 2026 papers' code or weights (2601.12770, OMEGA-Avatar, GAF, GTAvatar), and could not confirm whether their code is released.
- I did not verify the licences of LHM++ or MeshLAM.
- I did not find a rigged Gaussian avatar interchange standard (for example a glTF extension for skinned splats) that is ratified as of Oct 2026.
- The gsplat licence was confirmed only through a secondary page.

## 4. Epic MetaHuman: Mesh to MetaHuman, MetaHuman Animator from iPhone or video, Creator in UE 5.6+, licence outside Unreal, cost

### Takeaway
Since UE 5.6 (June 2025), MetaHuman Creator, Mesh to MetaHuman and MetaHuman Animator sit inside Unreal Engine under the standard UE EULA. Epic's official FAQ says:
- MetaHumans "can be used across all engines and creative software, subject to applicable terms" (so Blender is allowed).
- They are "Non-Engine Products", so no royalties are owed outside Unreal.
- A UE seat licence is needed only above $1M in annual gross revenue.

There is a strict AI clause: MetaHumans may not be used to train or test AI, including rendered output "if created to replicate the functionality of MetaHuman". The browser-based Creator web app closes on 5 Nov 2026 (secondary sources).

### Cited Findings
- The official licence page: "MetaHuman is included as part of your standard Unreal Engine license, meaning it's free to use for anyone making under $1 million USD in revenue and Unreal Engine standard terms apply above that threshold. MetaHumans can be used with any engine or creative software." — [metahuman.com/license](https://www.metahuman.com/en-US/license)
- Official FAQ answers (from the page's FAQ data):
  - Outside Unreal: "Yes. The Unreal Engine EULA provides for MetaHuman characters and animation to be used across all engines and creative software, subject to applicable terms."
  - Royalties: "No. MetaHuman characters and animation are classed as Non-Engine Products under the Unreal Engine EULA, so neither their use as linear media output or at runtime in games (or other interactive applications) using engines other than Unreal Engine triggers royalty obligations."
  - Seat licence: "If you make over $1 million USD in annual gross revenue and render MetaHuman characters and animation outside of Unreal Engine, you'll need an Unreal Engine seat license".
  - Licensing basis: "From Unreal Engine 5.6, your use of MetaHuman is included under the terms of your existing Unreal Engine license."
  - Selling: "MetaHuman assets can be packaged in Unreal Engine for sale on the Fab marketplace, as well as on third-party marketplaces."
  - DCC plug-ins: MetaHuman for Maya and for Houdini are "free to download via the Fab Marketplace under the Standard License."
  - AI: "You can use MetaHuman characters and animation in workflows that incorporate artificial intelligence technology. However, you may not use MetaHuman characters or animation curves to build or enhance any database or train or test artificial intelligence, machine learning, deep learning, neural networks, or similar technologies ... This includes the use of rendered output from MetaHuman digital characters and animation curves, if created to replicate the functionality of MetaHuman."
  - Source: [metahuman.com/license FAQ](https://www.metahuman.com/en-US/license)
- The UE seat price above the threshold was "$1,850 a year" at June 2025. This may have changed; it is dated June 2025. — [CG Channel, 4 Jun 2025](https://www.cgchannel.com/2025/06/you-can-now-sell-metahumans-or-use-them-in-unity-or-godot/)
- UE 5.6 changes (CG Channel, June 2025):
  - Creator, Mesh to MetaHuman and Animator are integrated into the engine.
  - Editor workflows are "enhanced by cloud services that deliver autorigging and texture synthesis".
  - Body sliders and a unified Outfit Asset that resizes to body proportions.
  - Animator supports mono cameras such as webcams, and can animate the face from audio alone.
  - Source access through UE C++ source.
  - Source: [CG Channel, 4 Jun 2025](https://www.cgchannel.com/2025/06/you-can-now-sell-metahumans-or-use-them-in-unity-or-godot/)
- Mesh to MetaHuman from video footage: import takes, create a MetaHuman Identity, track frames, run the Identity Solve, then submit the template mesh to the MetaHuman backend. Footage must be "captured using a compatible device, and ingested using Capture Manager in Live Link Hub". From 5.6 you then use "Conform from Identity" in the MetaHuman Character editor. — [Epic docs: From video footage](https://dev.epicgames.com/documentation/metahuman/from-video-footage); [Create a MetaHuman Identity](https://dev.epicgames.com/documentation/metahuman/create-a-metahuman-identity-in-unreal-engine)
- iPhone depth capture:
  - Offline animation from iPhone depth needs UE 5.6+, the MetaHuman Animator and Animator Depth Processing plugins, Live Link Hub and the Live Link Face iPhone app.
  - The recommended device is iPhone 12 or newer.
  - The depth preview works only on TrueDepth-equipped devices.
  - Sources: [Animation from depth data](https://dev.epicgames.com/documentation/metahuman/animation-from-depth-data); [Capture device requirements](https://dev.epicgames.com/documentation/metahuman/metahuman-animator-capture-device-requirements); [Depth capture guidelines](https://dev.epicgames.com/documentation/metahuman/metahuman-animator-depth-data-capture-guidelines-in-unreal-engine)
- Web app shutdown (secondary sources):
  - Access ends on 5 Nov 2026, per an Epic forum notice dated 16 Sep 2026 as reported by secondary sites.
  - About 90 days are allowed to export.
  - Deletion is around 3 Feb 2027 (single source).
  - Epic's download page says new users are no longer accepted on the web app.
  - Sources: [gamedev.net](https://gamedev.net/news/1981-metahuman-creator-web-application-is-being-discontinued/); [shattered.io](https://shattered.io/epic-kills-metahuman-creator-web-app-2026/); [StraySpark](https://www.strayspark.studio/blog/metahuman-2026-web-app-shutdown-migration-guide)
- **Blender.** Poly Hammer made the core of its "Character DNA" add-on free on 17 July 2026:
  - It imports MetaHuman `.dna` and MetaHuman Animator curves, animates and edits in Blender, and exports back to the DNA format.
  - It is GPLv3 and supports .dna from UE 5.6+.
  - "Epic open-sourcing its MetaHuman Rig Logic library as part of the MetaHuman DevKit". OpenRigLogic is MIT.
  - Pro edition: $79 perpetual.
  - Sources: [CG Channel, 17 Jul 2026](https://www.cgchannel.com/?p=177360); [Digital Production, 22 Jul 2026](https://digitalproduction.com/2026/07/22/character-dna-goes-free/)
- **Conflicting claim.** A StraySpark blog post (March 2026) says there is no cross-engine licensing for Blender or Maya. Epic's own FAQ, quoted above, contradicts it. — [StraySpark](https://www.strayspark.studio/blog/metahuman-2026-web-app-shutdown-migration-guide) vs [metahuman.com/license](https://www.metahuman.com/en-US/license)

### Inferences
- MetaHuman is the strongest free, commercial route to a fully rigged, film-grade head and body from a TrueDepth iPhone capture or a scan, below $1M revenue. Two limits matter:
  1. Generation happens in the UE editor and uses Epic's cloud services, so it cannot be a fully automatic server API you call from your own backend.
  2. You may not use MetaHumans or their renders as training data for your own models.
- The MetaHuman face rig is DNA/RigLogic-based. Getting it into three.js would need baking to morph targets (for example ARKit-style). That is my inference; I did not verify a supported MetaHuman-to-glTF path.

### Gaps
- I could not read the full UE EULA text (403). Seat pricing for Oct 2026 is not confirmed.
- I did not confirm whether MetaHuman creation can be scripted headless or on a server.
- I did not verify whether a plain phone video (not TrueDepth) is accepted for Mesh to MetaHuman identity in 5.7.

## 5. KeenTools FaceBuilder (Blender) and FaceTracker

### Takeaway
FaceBuilder builds a likeness head from one or several photos inside Blender. The head comes with 51 ARKit-compatible FACS blendshapes, LODs, MetaHuman-compatible UVs and one-click export to Character Creator 4. FaceTracker (sold in bundles) tracks a facial performance from reference video. Both are subscription-only. All subscriptions allow commercial work, and results belong to the user. The workflow is manual and artist-driven, not an API.

### Cited Findings
- Inputs: "several photos"; "Create a digital copy of a face even with just one image"; works with non-neutral expressions. — [KeenTools FaceBuilder for Blender](https://keentools.io/products/facebuilder-for-blender)
- Outputs: "Game and animation ready", with high, mid and low poly LODs. "51 built-in ARKit-compatible FACS blendshapes". "One-click texturing". Exports "in any 3D supporting format". UVs are compatible with MetaHuman Creator. One-click export to Character Creator 4. Custom topology is not supported; you wrap the mesh to your own topology. — [same page](https://keentools.io/products/facebuilder-for-blender)
- Pricing (excluding tax, subscription only, 15-day trial):

  | Product | Studio (annual, floating) | Freelancer annual | Freelancer monthly |
  |---|---|---|---|
  | FaceBuilder | $699/yr | $15.99/mo ($191.88/yr) | $19.99/mo |
  | FACEBundle (FaceBuilder + FaceTracker) | $999/yr | $24.99/mo | $29.99/mo |
  | FullBundle (adds GeoTracker) | $1,399/yr | $32.99/mo | $39.99/mo |

  Freelancer plans are for individuals only. — [same page](https://keentools.io/products/facebuilder-for-blender)
- Licence: "All subscriptions can be used for commercial work." "All results of your work with our products belong to you." After cancelling you can still open projects and export. — [same page](https://keentools.io/products/facebuilder-for-blender)
- FaceTracker: "Capture facial performance using only reference video and a matching face geometry", inside Blender. — [same page](https://keentools.io/products/facebuilder-for-blender)

### Inferences
- FaceBuilder is the cheapest licence-clean way to get a likeness head with ARKit-style shapes into Blender, and from there to GLB for three.js. It needs an operator, so it suits an internal pipeline, not a consumer self-serve flow.
- It makes heads only; there is no hair or body.

### Gaps
- I did not confirm which ARKit shape is missing (51 against Apple's 52).
- No API or headless batch mode is documented on the page.
- The pricing page URL (keentools.io/pricing) returned 404; prices came from the product page.

## 6. Reallusion Character Creator Headshot and similar

### Takeaway
Headshot 3 (April 2026; 3.1 on 3 July 2026) for Character Creator 5 turns a single photo into a rigged, textured head, and since 3.0 makes bodies from reference photos. It runs a proprietary model locally on Windows. It costs $199 perpetual, plus CC5 at $299 perpetual or $29/mo. Exporting Reallusion content to game engines is governed by Reallusion's export-licence regime, which needs checking for each asset.

### Cited Findings
- Headshot 3.0 was announced 27–28 Apr 2026, and 3.1 was released 3 Jul 2026. Head generation starts from a single photo; body generation uses reference photos. The head model "is proprietary, free, and runs locally". The optional AI Image Generator "is based on Google's Nano Banana and runs online, consuming DA Points" (about $0.30 for a 4K image). — [CG Channel, 7 Jul 2026](https://www.cgchannel.com/2026/07/reallusion-releases-headshot-3-0/)
- Prices: Headshot 3.1 is "$199 perpetual". CC5 is "$299 perpetual, or subscriptions at $29/month or $99/year"; the article says it runs on 64-bit Windows. — [CG Channel, 7 Jul 2026](https://www.cgchannel.com/2026/07/reallusion-releases-headshot-3-0/)
- The product page lists $199, a member price of $149, a $129 upgrade from Headshot 2, and a CC5 + Headshot 3 bundle at $329 (secondary; from a search snippet). — [Reallusion Headshot page](https://www.reallusion.com/character-creator/headshot)
- One summary describes a "fully rigged, textured 3D head with 4K PBR textures" from "a single front-facing photo" (secondary). — [creativeainews](https://www.creativeainews.com/blog/reallusion-headshot-3-ai-digital-double-character-creator-5/)
- On export licensing, Reallusion's store says: "to use content in 3D game engines (e.g. Unity, Unreal), you will need to purchase the export license version of the iContent". An older staff post (c. 2017, possibly outdated) says exported content may be embedded in commercial games, but "must not be available for public download". — [Reallusion official content store](https://www.reallusion.com/contentstore/charactercreator-official.html); [Reallusion forum print topic](https://forum.reallusion.com/PrintTopic335621.aspx)

### Inferences
- Headshot is a strong desktop "digital double" tool for an internal crew pipeline: local, perpetual and Windows-only. It is not a server API, and it does not run on macOS or an M1. Check the CC5 EULA before redistributing CC-topology characters as user-owned data in a web product.

### Gaps
- I did not read the current CC5 / Headshot 3 EULA. Rules on CC base topology and exporting to glTF or the web are unverified.
- The blendshape standard of CC5 output (ARKit 52 or otherwise) was not verified in this session.

## 7. Commercial avatar SDKs and APIs in 2026: status, inputs, outputs, rigs, pricing

### Takeaway
The market has consolidated:
- **Ready Player Me (formerly Wolf3D)** was bought by Netflix (reported 22 Dec 2025), and its public services shut down on 31 Jan 2026.
- **Union Avatars** closed in mid-2025 (competitor-reported).
- **Meta Avatars SDK** has reached End-of-Feature at v40.0.1.

The live selfie-to-avatar SDKs are:
- **Avaturn**: $800/mo for 1,000 avatars; GLB with humanoid rig, ARKit blendshapes, visemes and Mixamo compatibility.
- **Avatar SDK MetaPerson** (itSeez3D): $800/mo for 6,000 avatars; GLB, glTF or FBX, Mixamo-compatible, local compute option, realistic or cartoon.

**Apple Personas** have no export API; they are system-rendered in SharePlay.

### Cited Findings
**Ready Player Me (formerly Wolf3D)**
- Netflix acquired Ready Player Me (article dated 22 Dec 2025) for an undisclosed fee:
  - About 20 staff join Netflix; only CTO Rainer Selvet moves over among the four founders.
  - The company had raised $72M.
  - "Ready Player Me services will shut down on January 31, 2026", including the PlayerZero creation tool.
  - Netflix gave no avatar launch timeline.
  - Source: [PocketGamer.biz, 22 Dec 2025](https://www.pocketgamer.biz/netflix-acquires-avatar-creation-platform-ready-player-me/)
- A Genies blog (a competitor) gives the creation-tool shutdown as 30 Jan 2026, against the 31 Jan given elsewhere. — [Genies blog](https://genies.com/blog/ready-player-me-shutdown)
- Wolf3D is not a separate vendor. Ready Player Me was "formerly Wolf3D, originally Wolfprint 3D". The names were Wolfprint 3D (2014–2018) and Wolf3D (2018–2021), in Tallinn, Estonia. — [Wikipedia: Ready Player Me](https://en.wikipedia.org/wiki/Ready_Player_Me)

**Avaturn**
- Product: "selfie based realistic avatars". "The avatars come with standard humanoid body rig, and ARKit blendshapes, and visemes. They are compatible with Mixamo animations, and VTubing software." Avatars export to "Blender, Unity, Unreal Engine, Maya, Cinema4D". — [avaturn.me](https://avaturn.me/)
- Docs: GLB import guides, "Convert GLB into FBX" and "Convert GLB into VRM". SDKs for Web, Unreal Engine 5.0+, Unity, iOS & Android, plus a REST API. "You can integrate Avaturn for free following the tutorials ... For advanced customization options we provide API and web SDK". — [Avaturn docs overview](https://docs.avaturn.me/docs/integration/overview)
- Pricing: Pro is "$800/month", with "Up to 1.000 avatars / month + $0.15 per extra avatar", "API and SDK for customizing UX and UI", custom garments and your own user management. Enterprise is unpriced (full-body scans, a dedicated server, custom T&C). — [avaturn.me/pricing](https://avaturn.me/pricing)

**Avatar SDK (itSeez3D), MetaPerson**
- Pro: "$800 /mo", "6 000 avatars per month", "$0,03 per extra avatar". It includes MetaPerson creation, LiveSpeak lipsync, and "Compute Head avatars locally".
- Enterprise adds local or offline compute for MetaPerson, a REST API, custom topology and blendshapes, and custom hair and outfits.
- Outputs are "GLB, glTF and FBX", "rigged and Mixamo-compatible".
- The first avatar in MetaPerson Creator is free.
- Source: [avatarsdk.com/pricing-cloud](https://avatarsdk.com/pricing-cloud/)
- From the FAQ:
  - "MetaPerson avatars ... is a full-body game-ready avatar created from a single selfie"
  - "MetaPerson avatars now support both realistic and cartoon-style"
  - formats: "gltf, glb, fbx, obj, ply"
  - lipsync works with third-party tools (Oculus Lipsync, Speech Graphics, SALSA)
  - Source: [avatarsdk.com/faq](https://avatarsdk.com/faq/)

**Meta Avatars SDK**
- "The SDK's final release is 40.0.1 ... all existing integrations continue to work and backend services remain fully operational." No new versions are planned. The SDK loads users' existing Meta avatars and presets; the page does not mention creating avatars from a selfie. — [Meta Avatars docs, load avatars](https://developers.meta.com/horizon/documentation/unity/meta-avatars-load-avatars/)
- Unreal support "is not planned"; the end-of-life notices are dated April 2026 (secondary search summary). — [Meta Avatars SDK intro (Unreal)](https://developers.meta.com/horizon/documentation/unreal/as-avatars-sdk-intro/)

**Apple Personas**
- On Vision Pro, "The system automatically displays spatial Personas for existing activities that take place in a window or volume". Apps share state to keep content in sync, through GroupActivities and SystemCoordinator. — [Apple: Adding spatial Persona support to an activity](https://developer.apple.com/documentation/groupactivities/adding-spatial-persona-support-to-an-activity)
- visionOS 26 (June 2025) improved Persona hair, eyelashes and complexion, and "Personas are still created on device". — [Apple Newsroom, Jun 2025](https://www.apple.com/newsroom/2025/06/visionos-26-introduces-powerful-new-spatial-experiences-for-apple-vision-pro/)

**Other vendors**
- **Didimo** (Porto): active in Jan 2026 and moving into training and simulation; its Popul8 platform generates many characters. The last funding I found was a $7.15M Series A (Oct 2022). — [Portugal Global, Jan 2026](https://www.portugalglobal.pt/en/news/2026/janeiro/didimo-has-built-its-growth-on-the-gaming-industry); [AWN](https://awn.com/news/didimo-announces-715m-funding-expand-3d-avatar-production-system)
- **Union Avatars**: "ceased operations in mid-2025"; founder Cai Felip confirmed this on LinkedIn on 7 Jul 2026; the domain is parked; there was no acquisition. This comes from a competitor's blog. — [Avatar SDK blog, 7 Jul 2026](https://avatarsdk.com/blog/2026/07/07/union-avatars-shut-down/)
- **in3D**: phone-scan app with paid scan plans. SDK and API pricing is "on request" (aggregators only). — [Techjockey](https://www.techjockey.com/us/detail/in3d); [itechguides](https://www.itechguides.com/products/in3d/)
- **Genies**: its support page reportedly says the Avatar SDK is free for developers and end users, including commercial projects. It is Unity-based, with a customisation API for wearables, hair and makeup. A free verified version appeared on the Unity Asset Store in Nov 2025. This is a search summary; the support page returned 403 to me. I found no selfie-to-avatar feature. — [Genies support (403)](https://support.genies.com/hc/en-us/articles/41138810194324); [Genies developer roadmap, Mar 2026](https://genies.com/blog/genies-developer-roadmap-what-to-expect-and-how-you-can-help-shape-it)

### Inferences
- For a selfie-to-rigged-GLB product today, Avaturn and MetaPerson are the two live, documented options, both at about $800/mo. MetaPerson is cheaper per avatar ($0.03 against $0.15 overage) and has local compute. Avaturn documents ARKit blendshapes and visemes explicitly.
- Vendor risk is high. RPM and Union Avatars both disappeared within 12 months. Store exported GLBs in your own system so a vendor shutdown cannot take user characters with it.
- Apple Personas cannot serve as a source of user geometry.

### Gaps
- I could not read Avaturn's and Avatar SDK's terms of use, so output ownership, likeness and biometric-data clauses are unverified.
- MetaPerson's blendshape naming (ARKit 52 or not) is unconfirmed.
- I found no 2026 pricing for in3D, Didimo or Genies.
- I did not find Netflix's or RPM's own shutdown notice; readyplayer.me returned a 502 through the proxy.
- I did not check other newer entrants (for example Krikey or Convai) for selfie-to-3D.

## 8. Image-to-3D generative models for people and characters (Hunyuan3D, TRELLIS, Rodin/Hyper3D, Meshy, Tripo, SAM 3D Body): licences and API prices

### Takeaway
General image-to-3D models give a static textured mesh. Meshy and Tripo can auto-rig humanoids, and Rodin has a face-specific ChatAvatar product. The licence picture:
- **TRELLIS / TRELLIS.2**: MIT for code and weights, but the reference pipeline uses non-commercial nvdiffrast.
- **Hunyuan3D 2.x**: the community licence **does not apply in the EU, UK or South Korea**, and requires a separate licence above 1M MAU.
- **SAM 3D Body**: the SAM License is royalty-free and allows commercial use, with trade-control limits.
- **Meshy**: the free tier is CC BY 4.0; paid tiers give private ownership.

### Cited Findings
- **TRELLIS**: the HF `microsoft/TRELLIS-image-large` licence is MIT (last modified Dec 2024). `microsoft/TRELLIS.2-4B` is MIT (Dec 2025). The TRELLIS.2 repo LICENSE is MIT. — [HF API TRELLIS-image-large](https://huggingface.co/api/models/microsoft/TRELLIS-image-large); [HF API TRELLIS.2-4B](https://huggingface.co/api/models/microsoft/TRELLIS.2-4B); [TRELLIS.2 LICENSE via jsDelivr mirror](https://cdn.jsdelivr.net/gh/microsoft/TRELLIS.2@main/LICENSE)
- The TRELLIS pipeline depends on nvdiffrast, whose licence restricts use to "research or evaluation purposes only" ([nvdiffrast LICENSE](https://cdn.jsdelivr.net/gh/NVlabs/nvdiffrast@main/LICENSE.txt); issue raised at [microsoft/TRELLIS #298](https://github.com/microsoft/TRELLIS/issues/298)). ComfyUI says its native TRELLIS.2 integration has "no non-commercial dependencies" (a vendor claim). — [Comfy blog](https://blog.comfy.org/p/trellis2-and-pixal3d-are-now-native)
- **Hunyuan3D 2.1** licence, quoted:
  - "THIS LICENSE AGREEMENT DOES NOT APPLY IN THE EUROPEAN UNION, UNITED KINGDOM AND SOUTH KOREA"
  - "'Territory' shall mean the worldwide territory, excluding the territory of the European Union, United Kingdom and South Korea"
  - "You must not use, reproduce, modify, distribute, or display the Tencent Hunyuan 3D 2.1 Works, Output or results ... outside the Territory"
  - "If ... the monthly active users of all products or services made available by or for Licensee is greater than 1 million ... You must request a license from Tencent"
  - Source: [HF tencent/Hunyuan3D-2.1 LICENSE](https://huggingface.co/tencent/Hunyuan3D-2.1/resolve/main/LICENSE)
- Hunyuan3D 2.0 uses the "TENCENT HUNYUAN 3D 2.0 COMMUNITY LICENSE" with the same EU, UK and South Korea exclusion (dated 21 Jan 2025). — [Windriver licence list](https://open.windriver.com/info/uni-license-list/licenses/tencent-hunyuan-3d-2.0-cla.html)
- **SAM 3D Body (Meta)**: the "SAM License, Last Updated: November 19, 2025". It grants "a non-exclusive, worldwide, non-transferable and royalty-free limited license ... to use, reproduce, distribute, copy, create derivative works of, and make modifications to the SAM Materials". It bars ITAR and trade-control end uses, "including those related to military or warfare purposes, nuclear industries or applications, espionage, or the development or use of guns or illegal weapons". Weights on HF are gated by manual approval. — [SAM License via jsDelivr mirror](https://cdn.jsdelivr.net/gh/facebookresearch/sam-3d-body@main/LICENSE); [HF API facebook/sam-3d-body-dinov3](https://huggingface.co/api/models/facebook/sam-3d-body-dinov3)
- **Meshy**:
  - Free plan: "100 credits per month".
  - Credit costs: Image to 3D is 25 credits (Meshy 7) or 20 (Meshy 6). Rigging is 0 credits, Remesh 0, Animate 0 per clip.
  - Licence: Free outputs are "CC BY 4.0, with commercial use allowed if you give attribution". Pro has a "Private license with full commercial use", and you own the output.
  - Plan prices are Pro $20/mo and Studio $60/mo (from a search snippet of meshy.ai/pricing; not fetched directly).
  - Sources: [Meshy docs: Pricing & Credits](https://docs.meshy.ai/en/webapp/pricing); [meshy.ai/pricing (search snippet)](https://meshy.ai/pricing)
- **Hyper3D Rodin (Deemos)**:
  - Creator: $30/mo ($288/yr), about 60 models, "Unlimited export and any use".
  - Business: $120/mo, "Full API access, 120 or 240 RPM", with a commercial licence and "ChatAvatar" benefits.
  - Direct credits: "$1.5 per credit".
  - Source: [hyper3d.ai/pricing](https://hyper3d.ai/pricing)
  - A reseller lists Rodin Gen-2 at $0.80 per request (secondary). — [EmpirioLabs](https://empiriolabs.ai/models/hyper3d-gen2)
- **Tripo**:
  - The API is credit-billed; credits are reserved at task creation and refunded on failure ([Tripo billing docs](https://developers.tripo3d.com/en/docs/billing.md)).
  - $0.01 per credit beyond prepaid credits on AWS Marketplace ([AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-hwlbvx7vubh7c)).
  - Rigging is 25 credits and generation 40–50 credits (company blog; unverified against the API reference) ([Tripo blog](https://www.tripo3d.ai/blog/what-3d-model-generation-api-can-convert-images-or-text-into)).
  - The top consumer tier went up in 2026: "$110 to $330/month as of 2026-08-24" (secondary) ([CostBench price history](https://costbench.com/software/ai-3d-generation/tripo-ai/price-history/)).

### Inferences
- These tools suit stylised or "character from reference" assets more than a faithful likeness of the person. They output rigid or auto-rigged meshes without an ARKit face rig.
- For a UK- or EU-based team or users, Hunyuan3D 2.x is unlicensed, and that covers its outputs as well as its use.
- TRELLIS.2 is commercially usable only after swapping out nvdiffrast and other NC parts (DINOv3 and RMBG-2.0 were flagged by a third-party port). A legal check is needed.
- SAM 3D Body plus MHR is the most permissive open stack for "one photo → posed body mesh with a skeleton". It gives body pose and shape, not a textured likeness.

### Gaps
- I did not confirm whether Hunyuan3D 3.x for 3D is open or what its licence is. Search found only the Hunyuan 3.0 language model moving to Apache-2.0, via aggregators.
- Meshy's API price per call was not confirmed.
- Tripo's official per-task credit table was not read.
- Rodin ChatAvatar's own inputs, outputs and rig (ARKit or not) were not researched.
- Likeness and right-of-publicity clauses in these vendors' terms were not read.

## 9. What file format and rig should a "character as data" use across Blender, three.js/WebGL and Unreal?

### Takeaway
The evidence points to glTF 2.0 / GLB as the canonical runtime file. Every vendor above exports it, Avaturn treats it as primary, and three-vrm and Spark are three.js-native. The rig should be a humanoid skeleton (Mixamo-compatible or VRM humanoid naming) with ARKit's 52 named face blendshapes as morph targets. Two additions are worth considering:
- Add the **VRM 1.0** extension (glTF-based) when you need standard humanoid bone mapping, expressions and machine-readable usage permissions, including commercial use and avatar permission.
- Keep parametric parameters (FLAME 2023 Open / MHR / Anny) and any Gaussian splat (.ply/.spz) as sidecars.

Use FBX only as an export for Unreal or DCC tools.

### Cited Findings
- ARKit defines 52 face blend shape locations, grouped as:
  - Left Eye: 7
  - Right Eye: 7
  - Mouth and Jaw: 27
  - Eyebrows, Cheeks and Nose: 10
  - Tongue: 1

  These are "identifiers for specific facial features, for use with coefficients describing the relative movements of those features" (iOS 11.0+). — [Apple: ARFaceAnchor.BlendShapeLocation (docs JSON)](https://developer.apple.com/documentation/arkit/arfaceanchor/blendshapelocation)
- The vendor convergence on GLB, humanoid rigs and ARKit shapes:
  - Avaturn exports GLB with a "standard humanoid body rig, and ARKit blendshapes, and visemes", compatible with Mixamo, and documents GLB→FBX and GLB→VRM conversion ([avaturn.me](https://avaturn.me/); [docs](https://docs.avaturn.me/docs/integration/overview)).
  - MetaPerson exports GLB, glTF and FBX, "rigged and Mixamo-compatible" ([avatarsdk.com/pricing-cloud](https://avatarsdk.com/pricing-cloud/)).
  - KeenTools heads ship "51 built-in ARKit-compatible FACS blendshapes" ([KeenTools](https://keentools.io/products/facebuilder-for-blender)).
- VRM 1.0 was released in September 2022 and VRM 0.x is deprecated. It splits into:
  - VRMC_vrm-1.0 (humanoid, meta, expression)
  - VRMC_materials_mtoon-1.0 (toon shading)
  - VRMC_springBone-1.0 (secondary motion)
  - VRMC_node_constraint-1.0
  - VRMC_vrm_animation-1.0, released later

  — [vrm.dev VRM-1.0 (Japanese page)](https://vrm.dev/en/vrm1/)
- VRM meta carries licence fields: who may perform as the avatar ("only by its creator / explicitly specified person / anyone"), permission for violent or sexual acts, "For commercial use: Disallow / Allow", and a redistribution or modification licence type (CC0, CC BY, CC BY-NC, ... or Other with a URL). — [vrm.dev UniVRM meta](https://vrm.dev/en/univrm/meta/univrm_meta/)
- Libraries:
  - `@pixiv/three-vrm` 3.5.5 is MIT, a "VRM file loader for three.js" ([npm registry](https://registry.npmjs.org/@pixiv/three-vrm/latest)).
  - UniVRM provides a Unity importer and exporter ([vrm.dev](https://vrm.dev/en/vrm/vrm_about/)).
  - Spark (MIT) renders splats in three.js with experimental LBS ([Spark 2.0](https://sparkjs.dev/docs/new-features-2.0/)).
- MetaHuman characters use Epic's DNA format (`head.dna`, `body.dna`) with RigLogic. They reach Blender through Poly Hammer's GPLv3 add-on and MIT OpenRigLogic. — [Digital Production, 22 Jul 2026](https://digitalproduction.com/2026/07/22/character-dna-goes-free/)
- SMPL-Body can be shared as "OBJ file(s), animated FBX file(s), or as a set of mesh vertices, skeleton rig, pose blendshapes and dynamic blendshapes". — [SMPL-Body licence](https://smpl.is.tue.mpg.de/license.html)

### Inferences
- A proposed "character as data" record:
  1. A GLB with a humanoid skeleton using VRM or Mixamo bone names, skinned mesh, PBR textures and ARKit-52-named morph targets (plus visemes if lipsync is needed). Optionally add VRMC_vrm meta to carry consent and commercial-use flags with the file.
  2. A JSON sidecar holding the source capture hash, consent record, and parametric fits (for example FLAME 2023 Open shape and expression, MHR or Anny parameters), so the character can be refit or restyled.
  3. An optional Gaussian splat sidecar (.ply/.spz) for photoreal renders.
  4. Derived exports on demand: FBX for Unreal, .blend for Blender, MetaHuman DNA when the character went through MetaHuman.
- The following come from general knowledge and were not verified this session; confirm before relying on them:
  - three.js GLTFLoader and Blender's glTF importer handle skinning and morph targets natively.
  - Unreal imports glTF through its Interchange framework.
  - FBX is a proprietary Autodesk format.
- Not every source fits ARKit-52 out of the box. KeenTools ships 51 shapes, and MetaHuman uses its own rig controls. Plan a mapping or retargeting layer and do not assume uniform shapes.

### Gaps
- I did not read the glTF 2.0 / ISO spec, the OpenUSD / AOUSD avatar work, or Unreal's glTF import documentation in this session, so the claims about USD and the import pipeline are unverified.
- I found no ratified standard for a skinned or rigged Gaussian-splat avatar in glTF.
- I did not verify VRM 1.0's exact required humanoid bone list or expression presets from the spec itself; the GitHub spec repository was not reachable from this session.
