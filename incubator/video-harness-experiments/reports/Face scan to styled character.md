# Own the consent record, rent the pixels

As of 14 October 2026, your app can let users scan their own face with a phone's selfie camera, choose hair and an outfit, and appear as the same person in AI images, 3D scenes and AI video. None of this requires training a model of your own. The hard part is now licences, consent and verification, not the pixels. The fastest commercially clean route has three steps. First, the user records a guided 10–30-second selfie video in the app or browser. Second, a certified liveness check and a face match prove a live person is present, for about **$0.015 per check plus $0.001 per photo compared** at AWS list price. Third, hosted image models take the face, hair and outfit as separate references (**$0.03–0.134 per image**), and reference-to-video models carry them into motion (**about $0.08–0.40 per second**). Most famous open tools in this field are research-only. That includes InsightFace's face models, which power InstantID, PuLID, IP-Adapter FaceID and the standard face-match check, the FLAME and SMPL-X body models, LAM's avatar weights, nearly every open try-on model and nearly all 3D hair reconstruction. The 3D bases you can legally ship are few and new: FLAME 2023 Open, Meta's MHR and NAVER's Anny. They travel in a GLB file that uses Apple's 52 named face shapes. Law in the EU, UK, US and India points to one design: once you check "is this really you?", you are processing biometric data. That means separate explicit consent, a risk assessment before launch (a DPIA), a path for users who refuse, short retention, no sexual content of real people, and an AI label with machine-readable marks on every output. Several of these became binding in 2026. Build three things first: the consented character record, the capture-and-consent flow, and the verifier. All three routes (2D, 3D and hybrid) depend on them. Then ship the 2D route, and grow the 3D "scene as data" route into the base for your simulation company.

*How to read the citations.* Every claim links to a page the research team read on 14 October 2026. The marker *(search summary)* means the fact came from a search engine's summary of that page, not a full read. *(secondary)* means a news site, reseller, aggregator or competitor rather than the vendor or licensor. *(unverified)* means the notes could not confirm the claim. **Lawyer to confirm** marks a legal reading that a qualified lawyer must sign off before a design decision rests on it. Prices are list prices in USD on that date. Licences follow your own rule: unclear means no. This is research, not legal advice.

## The asset you are building is a consented character record

The product is a record, not a picture. The record holds several things. The **capture** is a short video, deleted soon after use. The **proof** is the liveness result, a reference image and the consent record. The **identity references** are a few clean photos, and optionally a personal model add-on (a LoRA) or a 3D head and body. The **look** is the chosen hair and outfit, stored as reference images or 3D assets. The **permissions** say who may use this character, and for what. It also keeps a **deletion trail**. Every generation call reads from this record, and every output is checked against it. That is your "scene as data" principle applied to people: a cast member is data too. The VRM 1.0 avatar format already carries machine-readable permission fields, such as who may perform as the avatar and whether commercial use is allowed ([vrm.dev UniVRM meta](https://vrm.dev/en/univrm/meta/univrm_meta/)). It is a sensible place to store the record's permissions inside the 3D file itself.

The stages, and the best commercially usable option found for each, look like this. Each row is sourced in the sections that follow.

| Stage | What happens | Best commercially usable option found | Price as read | Main trap |
|---|---|---|---|---|
| Capture | Guided selfie video; pose, distance and expression checks | MediaPipe Face Landmarker (Apache-2.0) in any browser; ARKit with depth on Face ID iPhones | Free | MediaPipe is not an identity tool; Apple bans using Face Data "for authentication" |
| Liveness and ownership | Prove a live person is present; tie the face to the account | AWS Face Liveness or Azure Face liveness; AWS CompareFaces | $0.015 per check; $0.001 per image | Liveness in a web browser is weaker than in a mobile app |
| Identity | Keep the face consistent | Reference sets sent to hosted multi-reference models; a LoRA trained on fal or Replicate | No extra cost; about $2 per FLUX LoRA | Face adapters built on InsightFace are non-commercial |
| Hair | Choose a style and colour | Hosted editors behind a face-protecting mask and checks; MediaPipe hair segmenter for live recolour | $0.04–0.15 per edit | Identity drift, worse on darker skin, coily hair and head coverings |
| Outfit | Dress the character | FASHN, Vertex Virtual Try-On, Nano Banana Pro, Seedream | $0.04–0.30 per image | Open try-on models are non-commercial; layering fails |
| 3D | Rigged head, body, hair and clothes | MHR, Anny, FLAME 2023 Open; Avaturn or MetaPerson; MetaHuman; Marvelous Designer | $0 to $800 a month | SMPL-X and FLAME licences; vendor shutdowns |
| Video | Make it move | Kling O1/O3 with references, Veo 3.1 with references, Vidu, Runway | About $0.08–0.40 per second | Regional rules; Seedance blocks real faces; Sora API gone |
| Verify | Check every output | AuraFace (Apache-2.0) or AWS CompareFaces; C2PA plus a watermark | About $0.001 per checked frame on AWS | InsightFace's ArcFace face-match models are non-commercial |

## A guided 20-second selfie video beats a photo upload

### Phone sensors help, but a browser is enough

On iPhone, Apple's ARKit tracks the face through the front camera. For each face it gives the face's position and orientation, a fixed-topology face mesh, **52 expression coefficients** and eye positions with gaze. Each coefficient is a named facial movement, such as jawOpen or eyeBlinkLeft, scored from 0 to 1. On Face ID phones it also gives a depth map synchronised to the colour image ([Apple ARFaceAnchor](https://developer.apple.com/documentation/arkit/arfaceanchor); [Apple BlendShapeLocation](https://developer.apple.com/documentation/arkit/arfaceanchor/blendshapelocation); [Apple ARFrame.capturedDepthData](https://developer.apple.com/documentation/arkit/arframe/captureddepthdata)). Face ID phones run from the iPhone X onward and exclude every iPhone SE ([Apple Support 102854](https://support.apple.com/en-us/102854)). Since iOS 14, phones with Apple's Neural Engine can track a face without the depth camera ([Apple ARFaceTrackingConfiguration](https://developer.apple.com/documentation/arkit/arfacetrackingconfiguration)). Those phones get no depth, so any depth-based feature needs a fallback. ARKit's mesh covers only the front of the face: no hair, ears or back of the head. So treat it as a capture aid and a measured face-shape guide, not a head scan.

Android's ARCore Augmented Faces gives a **468-point face mesh** ([ARCore Augmented Faces](https://developers.google.com/ar/develop/augmented-faces)). No Google documentation of front-camera depth was found. A 2022 community thread reports that depth works only on the rear camera ([r/Arcore](https://redlib.ssps.io/r/Arcore/comments/rznkzf/how_to_depth_api_with_selfie_camera), *unofficial*). So treat Android selfie capture as colour-only.

The universal fallback is the browser. Google's MediaPipe Face Landmarker runs on the web, Android, iOS and Python. It returns **478 3D landmarks**, **52 expression scores named the same way as ARKit's**, and a head-pose matrix ([MediaPipe Face Landmarker guide](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker)). It is Apache-2.0 licensed ([MediaPipe LICENSE](https://raw.githubusercontent.com/google-ai-edge/mediapipe/master/LICENSE)). Its model card sets clear limits. Its depth values are relative and learned from synthetic data, not measured. It "do[es] not provide facial recognition or identification". It degrades beyond 80° of head turn, beyond 8° of tilt, or with less than half the face visible. It also publishes error rates by group: 2.06–3.27% across 17 world regions and 2.49–2.90% across skin tones 1–6 ([MediaPipe Face Mesh V2 model card](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Face%20Mesh%20V2.pdf)). That per-group reporting is the standard your own pipeline should meet. Browsers allow camera access only on HTTPS or localhost, and always ask the user first ([MDN getUserMedia](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/mediadevices/getusermedia/index.md)). Because MediaPipe and ARKit share the same 52 names, one character rig can be driven live from an iPhone or a laptop webcam. That matters for the simulation goal.

The best published playbook for self-captured faces is Apple's setup guide for Vision Pro Personas. It asks for front-facing, even light with "no strong shadows", and no bright windows or lamps behind the user. Hair goes off the face, and the device sits at eye level with the whole face in frame. The user turns their head slowly right, left, up and down. Then they make four expressions: a closed-mouth smile, a smile with teeth, raised eyebrows and closed eyes ([Apple Support 118496](https://support.apple.com/en-us/118496)). Secondary reports add that glasses must come off ([MacRumors](https://macrumors.com/guide/vision-pro-persona-tips), *secondary*). Classic photogrammetry, which builds 3D from many photos, wants subjects that "are static and won't bend or deform", with at least 70% overlap between shots ([Apple Object Capture guide](https://developer.apple.com/documentation/realitykit/capturing-photographs-for-realitykit-object-capture)). A blinking, breathing person is neither. Research shows the way round this: a learned head model does the heavy lifting. Meta's URAvatar builds relightable, animatable heads "from a phone scan with unknown illumination" ([arXiv 2410.24223](https://arxiv.org/abs/2410.24223)), but it has no public code or commercial licence. A self-held front camera cannot see the back of the head. A second person must film it with the rear camera, or a model must invent it.

How much input you collect decides what each later stage can do.

| Input | What it enables | Weakness |
|---|---|---|
| One photo | 2D identity conditioning; one-shot 3D heads such as LAM, which reconstructs a head in 1.4 s ([LAM README](https://github.com/aigc3d/LAM)) | Weak on profiles, hair volume and teeth; the easiest input to spoof |
| 5 to 20+ photos | Personal-model training: Higgsfield's Soul ID guidance ranges from 5+ to 20+, up to 80 ([Higgsfield blog](https://higgsfield.ai/blog/sould-id-best-character-consistency), *search summary*) | Every photo still needs matching against the verified face |
| A guided 10–30 s video | Every angle, expression samples for rigging, and the liveness reference, all in one session | Longer for the user; this is the notes' synthesis, not a published benchmark |

### Liveness and "is this the account holder" cost about two cents

Liveness proves that a real, present person is in front of the camera, not a photo, a screen or a mask. The market benchmark is an ISO/IEC 30107-3 presentation-attack test run by the lab iBeta. **Level 1** uses attack props costing up to $30, and none may get through. **Level 2** uses props up to $300, including 3D masks, and allows up to 1% through. Check that figure against iBeta's exact wording, because vendors such as Azure claim 0%. **Level 3** uses hyper-realistic masks. iBeta states that a pass "does not certify the vendor product". Its listed letters include AWS (Levels 1 and 2, 2023), Azure (2023, retested 2025), Veriff, Persona and Jumio (Level 2), Incode (Level 3, February 2026), iProov, FaceTec and Paravision ([iBeta confirmation letters](https://www.ibeta.com/iso-30107-3-presentation-attack-detection-confirmation-letters/)).

AWS Face Liveness has the user follow prompts in a short video selfie while the screen flashes coloured lights. AWS calls this mode "the best setting to maximize accuracy". It returns a confidence score from 0 to 100 and a "reference image that can be used for face match". Client libraries exist for React on the web, Swift and Android ([AWS Face Liveness docs](https://docs.aws.amazon.com/rekognition/latest/dg/face-liveness.html)). It costs **$0.015 per check** for the first 500,000, then $0.0125, then $0.010. CompareFaces, which checks two images show the same person, costs **$0.0010 per image**. The free tier covers 1,000 images a month for 12 months ([AWS Rekognition pricing](https://aws.amazon.com/rekognition/pricing/)).

Azure Face liveness costs **$15 per 1,000 checks**, or $15.50 per 1,000 with face verification ([Azure Retail Prices API](https://prices.azure.com/api/retail/prices)). Microsoft says it does not store "any images or videos from the Face Liveness Check". It also warns that its web version lacks the app hardening of its mobile version and "may be more vulnerable to certain types of attacks" ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/concept-face-liveness-detection)). That matters for a laptop-webcam path.

Full identity verification checks a passport or licence against a selfie. It is needed only when legal identity matters, for example paid likeness rights or disputes. Veriff's self-serve plans cost **$0.80, $1.39 or $1.89 per check**, with monthly minimums of $49, $99 and $209 ([Veriff pricing](https://www.veriff.com/pricing)). FaceTec quotes prices only on request ([FaceTec pricing](https://www.facetec.com/pricing), *search summary*).

Liveness alone proves that a live person was present, not that it is the account holder. The link comes from running liveness at signup and storing the reference image. Every later upload and every final render is then face-matched against it.

Apple adds a catch. Its developer licence defines "Face Data" to include "data from an uploaded photo". It allows Face Data off the device only with "clear and conspicuous consent" and for a specific function. It also states: "You may not use Face Data for authentication, advertising, or marketing purposes" ([Apple Developer Program License Agreement §3.3.3(K)](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)). No Apple text settles whether a one-time "is this your face" check counts as authentication. **Lawyer to confirm.** Until then, design it as one-time identity and consent verification for the likeness, never as a login.

### What Sora and Higgsfield did, and what survives

Sora's cameo feature was the reference design. OpenAI's system card says it required "explicit opt-in consent". It blocked generations of real people other than consenting cameo users, put C2PA provenance data on all assets, and added a visible moving watermark ([Sora 2 System Card](https://cdn.openai.com/pdf/50d5973c-c4ff-4c2d-986f-c72b5d0ff069/sora_2_system_card.pdf)). Secondary reports describe the one-time check: users read random numbers aloud and turned their head on prompt ([VentureBeat](https://venturebeat.com/ai/openai-debuts-sora-2-ai-video-generator-app-with-sound-and-self-insertion); [lilys.ai](https://lilys.ai/en/notes/how-to-use-sora-20251021/use-cameo-in-sora-two-guide), *secondary*). One hands-on account claimed the check was bypassed with generated video soon after launch ([TechRadar](https://www.techradar.com/ai-platforms-assistants/i-tried-sora-2-i-love-it-and-its-about-to-ruin-everything), *secondary, unverified*). The Sora app went offline on 26 April 2026 ([The Decoder](https://the-decoder.com/openai-sets-two-stage-sora-shutdown-with-app-closing-april-2026-and-api-following-in-september/), *secondary*). Its API closed on 24 September 2026, with "no one-to-one replacement" ([OpenAI video generation guide](https://developers.openai.com/api/docs/guides/video-generation)). Higgsfield's Soul ID has no documented liveness step. Its own search-optimised pages describe only a consent checkbox ([Higgsfield face-data FAQ](https://geo.higgsfield.ai/is-higgsfield-ai-safe-for-face-data-faq), *low reliability*). The lesson: a random spoken challenge is good consent evidence, but it should sit on top of a certified liveness vendor, not replace one.

No single control stops someone uploading a friend's or a celebrity's photos. It takes a chain. The master likeness comes only from a live in-app capture, never a gallery upload, and it passes certified liveness. Every extra upload and every final render is face-matched against the reference, at $0.001 per image on AWS, and photos containing more than one face are flagged. Matches against AWS celebrity recognition, which covers "tens of thousands" of public figures ([AWS celebrity recognition](https://docs.aws.amazon.com/rekognition/latest/dg/celebrities.html)), are blocked or sent to review. A short clip of the user reading a random challenge is kept as consent evidence. Generation refuses other real faces unless they belong to another verified, consenting user. Copy Sora's sharing levels: "only me", "approved people" or "everyone" ([lilys.ai](https://lilys.ai/en/notes/how-to-use-sora-20251021/use-cameo-in-sora-two-guide), *secondary*). Every output carries C2PA data and a watermark. Celebrity detection only covers famous people. For private individuals, the real defence is liveness plus face matching.

## Three ways to hold a face, and the open ones are mostly research-only

Once you have a verified face, the system needs a way to "hold" it, so every image, 3D render and video shows the same person. In 2D there are three options. You can send reference photos to a hosted model each time. You can train a small personal add-on. Or you can use a zero-shot "face adapter". In 3D, the face lives in a parametric head-and-body model or an avatar file. The licence picture differs sharply between these options.

### Reference photos sent to hosted models: no training, no licence trap

In 2026 the simplest route is also the cleanest. Hosted multi-reference image models keep a face across shots without any training, and they take hair and outfit references in the same call. **Gemini 3 Pro Image ("Nano Banana Pro") takes up to 5 character images, 6 object images and 3 style images.** It costs **$0.134 per 1K/2K image** and $0.24 at 4K, with batch at half price. **Gemini 3.1 Flash Image ("Nano Banana 2") takes 4 character images and 10 object images** for $0.067 per 1K image. "Nano Banana 2.1" costs $0.0336 at 1K. Gemini 3.1 Flash Lite Image has no character slots at all ([Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing); [Gemini API image generation](https://ai.google.dev/gemini-api/docs/image-generation)). Google requires uploaders to hold rights to their images, and "All generated images include a SynthID watermark" ([Gemini API image generation](https://ai.google.dev/gemini-api/docs/image-generation)).

Seedream 4.5 takes up to 10 references ([The Rundown](https://www.therundown.ai/tools/seedream-4-5), *secondary*) at $0.04 per edit on fal ([fal Seedream 4.5 edit](https://fal.ai/models/fal-ai/bytedance/seedream/v4.5/edit)). BytePlus lists Seedream 4.0 at $0.03 and does not charge for failed generations ([BytePlus ModelArk](https://docs.byteplus.com/en/docs/ModelArk/1824718)). OpenAI's GPT Image models accept several input images and bill per token: gpt-image-2 costs $8 per million image-input tokens and $30 per million output tokens ([OpenAI API pricing](https://developers.openai.com/api/docs/pricing); [OpenAI image generation guide](https://developers.openai.com/api/docs/guides/image-generation)). FLUX.2 Pro edit on fal takes up to 9 references, at $0.03 for the first megapixel ([fal FLUX.2 Pro edit](https://fal.ai/models/fal-ai/flux-2-pro/edit)). The self-hostable option is **Qwen-Image-Edit-2511**. It is Apache-2.0, takes several input images, and claims much improved "character consistency" ([HF Qwen-Image-Edit-2511](https://huggingface.co/Qwen/Qwen-Image-Edit-2511)). On fal it costs $0.03 per megapixel ([fal Qwen-Image-Edit-2511](https://fal.ai/models/fal-ai/qwen-image-edit-2511)).

None of these vendors publishes an identity-fidelity number, so you need your own verifier. Models also disappear fast. Gemini 2.5 Flash Image, the original "Nano Banana", was shut down on 2 October 2026 ([Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)), so every model ID belongs behind your own adapter. A useful pattern, from practice rather than any vendor claim, is to put face references in the *character* slots and hair and outfit references in the *object* slots.

### A personal LoRA costs two dollars, if you run it in the right place

A LoRA is a small add-on file that teaches an existing model one person's face. It is cheap to make. fal trains a FLUX LoRA for "$2 per training run" (1,000 steps by default) and states "Commercial usage rights included for trained models" ([fal FLUX LoRA fast training](https://fal.ai/models/fal-ai/flux-lora-fast-training)). Replicate's trainer runs in "under 2 minutes" for "under $2" ([Replicate changelog](https://replicate.com/changelog/2025-05-23-faster-flux-trainer), *search summary*). Video LoRAs on Wan 2.2 cost $0.004–0.005 per step on fal, so about **$4–5 per 1,000-step run** ([fal Wan 2.2 T2V trainer](https://fal.ai/models/fal-ai/wan-22-trainer/t2v-a14b); [fal Wan 2.2 I2V trainer](https://fal.ai/models/fal-ai/wan-22-trainer/i2v-a14b), *search summary*). fal's Wan 2.1 guidance asks for "at least 10 images and/or videos" ([fal Wan trainer](https://fal.ai/models/fal-ai/wan-trainer/llms.txt), *search summary*).

The licence depends on where the LoRA runs. Black Forest Labs' FLUX [dev] Non-Commercial License v2.0 (25 November 2025) says use "for revenue-generating activity" or "in direct interactions with or that has impact on end users" is not a non-commercial purpose. It also classes fine-tunes, LoRAs included, as Derivatives that inherit the restrictions. Outputs, though, may be used "for any purpose (including for commercial purposes)", except to train a competing model ([BFL licence](https://bfl.ai/legal/non-commercial-license-terms)). Replicate draws the practical line: "If you generate images on Replicate with FLUX.1 models and their fine-tunes, then you can use the images commercially", but not if you download the weights and run them yourself ([Replicate FLUX.1 dev readme](https://replicate.com/black-forest-labs/flux-dev/readme)). BFL sells a self-hosted [dev] licence at **$999 a month for up to 100,000 images** ([BFL Help](https://help.bfl.ai/articles/9272590838-self-serve-dev-license-overview-pricing), *search summary*).

The bases you can safely run yourself are Apache-2.0: FLUX.1 [schnell] ([HF FLUX.1-schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell)), FLUX.2 [klein] 4B ([HF FLUX.2-klein-4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B)), Qwen-Image-Edit and Wan 2.2. Wan 2.2's card says "We claim no rights over the your generated contents" ([HF Wan2.2](https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B)). By contrast, FLUX.1 Kontext [dev], FLUX.2 [dev] and klein 9B are non-commercial when self-hosted ([HF FLUX.1-Kontext-dev](https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev); [HF FLUX.2-klein-9B](https://huggingface.co/api/models/black-forest-labs/FLUX.2-klein-9B)).

Two region traps matter for a UK-based company. **HunyuanVideo's licence "DOES NOT APPLY IN THE EUROPEAN UNION, UNITED KINGDOM AND SOUTH KOREA"** ([HF HunyuanVideo commit](https://huggingface.co/tencent/HunyuanVideo/commit/a4ed25a99d7eb9cf21e12f5fd8052d266f2105fc)), so you cannot use it. And Alibaba's open Wan weights stopped at 2.2; versions 2.5 and later are hosted only ([howaiworks](https://howaiworks.ai/blog/alibaba-wan-open-weights-stopped-at-2-2), *secondary*).

One practical note, from practice and not a source: a LoRA locks in hair and outfit as well as the face if the training photos show them consistently. Train on face-varied, style-varied photos if users will restyle the character.

### Zero-shot face adapters inherit InsightFace's non-commercial models

The famous zero-shot adapters, InstantID, PuLID, IP-Adapter FaceID and InfiniteYou, all read a face "embedding". An embedding is a list of numbers summarising a face, computed by InsightFace's ArcFace models (antelopev2 or buffalo_l). InsightFace's code is MIT, but its trained models "are available for non-commercial research purposes only". Commercial licences are sold by email, with no published price ([InsightFace GitHub](https://github.com/deepinsight/insightface); [InsightFace licensing](https://www.insightface.ai/solutions/face-recognition-licensing)). The adapters also carry their own terms:

- **IP-Adapter-FaceID** is "released exclusively for research purposes" ([HF IP-Adapter-FaceID](https://huggingface.co/h94/IP-Adapter-FaceID)).
- **InfiniteYou** is CC BY-NC 4.0 ([HF InfiniteYou](https://huggingface.co/ByteDance/InfiniteYou)).
- **InstantID** has Apache weights, but it states that the InsightFace models it downloads are "for non-commercial research purposes only" ([InstantID GitHub](https://github.com/instantX-research/InstantID)). Its team said it planned to retrain on a commercially licensed encoder, with no follow-up found ([HF InstantID discussion #2](https://huggingface.co/InstantX/InstantID/discussions/2)).
- **PuLID-FLUX** loads InsightFace and sits on FLUX.1 [dev] ([PuLID GitHub](https://github.com/ToTheBeginning/PuLID); [comfy.icu](https://comfy.icu/node/PulidFluxInsightFaceLoader), *secondary*).

An Apache-2.0 substitute exists: **AuraFace-v1**, "trained on commercially and publicly available data sources to enable its usage in commercial setting" ([HF fal/AuraFace-v1](https://huggingface.co/fal/AuraFace-v1)). But the adapters would need retraining on it. In 2026, the commercial route to zero-shot identity is hosted multi-reference models, not self-hosted adapters.

### 3D heads and bodies: the clean bases are new and few

A parametric model is a template 3D mesh with "sliders" for body shape, pose and expression. Most avatar research is built on two from the Max Planck Institute, and both are non-commercial. FLAME (2017–2023) is licensed only "for non-commercial scientific research" and bans "incorporation in a commercial product, use in a commercial service" ([FLAME licence](https://flame.is.tue.mpg.de/modellicense.html)). SMPL-X carries the same terms ([SMPL-X licence](https://smpl-x.is.tue.mpg.de/modellicense.html)).

There are two exceptions. **FLAME 2023 Open** is CC-BY "for any purpose, including commercial use". It bars pornographic use and use "to create fake, libelous, misleading, or defamatory content of any kind" ([FLAME licence](https://flame.is.tue.mpg.de/modellicense.html)). A digital-double product could be accused of exactly that. **Lawyer to confirm.** **SMPL-Body** is CC-BY 4.0 but "excludes the shape blendshapes", so you cannot fit new body shapes with it ([SMPL-Body licence](https://smpl.is.tue.mpg.de/license.html)).

Commercial SMPL licences went through Meshcapade. Its micro tier is listed at €5,000 a year ([Meshcapade Notion](https://meshcapade.notion.site/The-SMPL-Model-Licenses-2144560e54388085af5eff111fcdf266), *search summary, unverified*). Epic agreed to acquire Meshcapade, and Max Planck Innovation "will now directly take over the licensing" ([GamesMarket, 19 Feb 2026](https://www.gamesmarket.global/epic-games-acquires-meshcapade-and-will-establish-a-presence-in-tubingen/)). Ask Max Planck Innovation directly for current terms.

The news of late 2025 was two permissive body models:

- **Meta's MHR (Momentum Human Rig)** is Apache-2.0, with "45 shape parameters", "204 model parameters for full-body articulation", "72 expression parameters" for the face and 7 levels of detail ([PyPI mhr](https://pypi.org/project/mhr/)).
- **NAVER's Anny** is Apache-2.0 and built from MakeHuman data. It has over 13,000 vertices, 163 bones and 564 artist-made blendshapes, and covers infants to elders ([Anny LICENSE](https://cdn.jsdelivr.net/gh/naver/anny@main/LICENSE); [arXiv 2511.03589](https://arxiv.org/html/2511.03589v2)). Its optional SMPL-X-compatible topology is non-commercial, and the free install "may download non-commercial only assets" ([Anny README](https://raw.githubusercontent.com/naver/anny/main/README.md)).
- **Meta's SAM 3D Body** estimates an MHR body from one photo. It is under the royalty-free SAM License, which allows commercial use but bars military and trade-control uses ([SAM License](https://cdn.jsdelivr.net/gh/facebookresearch/sam-3d-body@main/LICENSE)).

The popular single-photo face fitters are all research-only. DECA ([DECA README](https://github.com/yfeng95/DECA)), EMOCA ([EMOCA README](https://github.com/radekd91/emoca)) and MICA ([MICA LICENSE](https://cdn.jsdelivr.net/gh/Zielon/MICA@master/LICENSE)) say so outright. SMIRK's code is MIT, but it needs FLAME and states no licence for its weights ([SMIRK README](https://github.com/georgeretsi/smirk)). The clean path is to fit FLAME 2023 Open, MHR or Anny yourself, using licence-clean landmarks such as MediaPipe's.

**Gaussian splats** give the most photoreal likeness. A splat is a cloud of soft, coloured 3D blobs, and it can now be rigged and animated. **LAM** builds an animatable Gaussian head from one image, renders at 562.9 frames per second on an A100 and "110+FPS" on a Xiaomi 14 phone, and ships a WebGL renderer. Its code is Apache-2.0, but **its weights are CC BY-NC 4.0** ([LAM README](https://github.com/aigc3d/LAM); [LAM LICENSE_WEIGHT](https://raw.githubusercontent.com/aigc3d/LAM/master/LICENSE_WEIGHT)). The rest of the field is also restricted:

- **GaussianAvatars** is CC-BY-NC-SA ([GaussianAvatars](https://github.com/ShenhanQian/GaussianAvatars)).
- **Gaussian Head Avatar** explicitly bars "web services, movies, television programs, mobile applications, or video games" ([Gaussian-Head-Avatar](https://github.com/YuelangX/Gaussian-Head-Avatar)).
- **The original Inria splatting rasteriser** is for "research and/or evaluation purposes only" ([Inria Gaussian-Splatting License](https://huggingface.co/spaces/yslan/GaussianAnything-AIGC3D/raw/a0896dd52a14e7ee5bdd71ff4c5aa0b6682ec79e/submodules/diff-surfel-rasterization/LICENSE.md)).
- **NVIDIA's nvdiffrast**, used by many pipelines, is research or evaluation only ([nvdiffrast LICENSE](https://cdn.jsdelivr.net/gh/NVlabs/nvdiffrast@main/LICENSE.txt)).
- **gsplat**, by contrast, is Apache-2.0 ([Aalto record](https://aaltodoc.aalto.fi/items/535d91f9-2595-49a4-bff6-47e1ad0cf9c3), *secondary*).

For full bodies, **LHM** turns one image into an animatable Gaussian human, with Apache-2.0 code and weights. But it is built on SMPL-X, so it inherits SMPL-X's licence. It also needs 14–24 GB of GPU memory, though LHM++ runs 8-view input "on just 8GB GPU memory" ([LHM README](https://cdn.jsdelivr.net/gh/aigc3d/LHM@main/README.md); [arXiv 2503.10625](https://arxiv.org/pdf/2503.10625)). Phone-video methods such as GAF ([arXiv 2412.10209](https://arxiv.org/html/2412.10209v2)) and GTAvatar ([arXiv 2512.09162](https://arxiv.org/pdf/2512.09162)) have no licence found.

So no pre-trained, one-shot Gaussian head in this survey is commercially clean. You can license LAM's weights from Alibaba, train your own on clean data with gsplat, or use splats only for offline renders and ship a mesh avatar. Playback is the easy part. **Spark** is an MIT-licensed three.js renderer that reads .ply, .spz and other splat formats ([Spark](https://sparkjs.dev/)), and has had "experimental support for Linear Blend Skinning" since version 2.0 ([Spark 2.0](https://sparkjs.dev/docs/new-features-2.0/)). There is no ratified file format yet for a rigged splat avatar. None of these models runs on an 8 GB M1: they need cloud NVIDIA GPUs to build avatars, though playback is light.

### Desktop tools and avatar vendors: useful, but keep your own copy

**Epic's MetaHuman** is the strongest free route to a film-grade rigged human. It is "free to use for anyone making under $1 million USD in revenue", and "MetaHumans can be used with any engine or creative software". Outside Unreal it owes no royalties. Above $1 million you need an Unreal seat licence if you render MetaHumans outside Unreal ([metahuman.com/license](https://www.metahuman.com/en-US/license)); that seat cost $1,850 a year in June 2025 ([CG Channel](https://www.cgchannel.com/2025/06/you-can-now-sell-metahumans-or-use-them-in-unity-or-godot/)). The key restriction is that you "may not use MetaHuman characters or animation curves to build or enhance any database or train or test artificial intelligence". That includes rendered output "if created to replicate the functionality of MetaHuman" ([metahuman.com/license](https://www.metahuman.com/en-US/license)). Use in AI workflows is allowed, but training on MetaHumans is not.

Mesh to MetaHuman works from iPhone depth capture (iPhone 12 or newer recommended) inside Unreal 5.6+ ([Epic: animation from depth data](https://dev.epicgames.com/documentation/metahuman/animation-from-depth-data); [Epic: capture device requirements](https://dev.epicgames.com/documentation/metahuman/metahuman-animator-capture-device-requirements)). It uses Epic's cloud for auto-rigging inside the editor, so it is not a server API you can call. The browser Creator web app closes on 5 November 2026 ([gamedev.net](https://gamedev.net/news/1981-metahuman-creator-web-application-is-being-discontinued/), *secondary*). MetaHumans reach Blender through Poly Hammer's free GPLv3 "Character DNA" add-on and Epic's MIT OpenRigLogic ([Digital Production](https://digitalproduction.com/2026/07/22/character-dna-goes-free/)). One blog claims MetaHumans cannot be used in Blender ([StraySpark](https://www.strayspark.studio/blog/metahuman-2026-web-app-shutdown-migration-guide)), but Epic's own FAQ contradicts it.

**KeenTools FaceBuilder** builds a likeness head inside Blender from one or more photos. The head has "51 built-in ARKit-compatible FACS blendshapes" and MetaHuman-compatible UVs. Freelancers pay $15.99 a month billed annually or $19.99 monthly; studios pay $699 a year. "All subscriptions can be used for commercial work", but it needs an operator and has no API ([KeenTools](https://keentools.io/products/facebuilder-for-blender)). **Reallusion Headshot 3.1** turns one photo into a rigged head for $199, plus Character Creator 5 at $299 or $29 a month, on Windows only ([CG Channel, Jul 2026](https://www.cgchannel.com/2026/07/reallusion-releases-headshot-3-0/)). Reallusion's EULA forbids use "in any character generation system" or "any character-generating business" ([Reallusion EULA](https://www.reallusion.com/Content/EULA/AP/EULA_AP.htm)), which is exactly what your product is.

The selfie-to-avatar SDK market has been brutal. Netflix bought Ready Player Me, and "Ready Player Me services will shut down on January 31, 2026" ([PocketGamer.biz](https://www.pocketgamer.biz/netflix-acquires-avatar-creation-platform-ready-player-me/)). Union Avatars ceased operations in mid-2025 ([Avatar SDK blog](https://avatarsdk.com/blog/2026/07/07/union-avatars-shut-down/), *competitor source*). Meta's Avatars SDK has reached its final release, 40.0.1 ([Meta Avatars docs](https://developers.meta.com/horizon/documentation/unity/meta-avatars-load-avatars/)). Apple Personas cannot be exported at all ([Apple spatial Persona docs](https://developer.apple.com/documentation/groupactivities/adding-spatial-persona-support-to-an-activity)).

Two live vendors remain:

| Vendor | Output | Price |
|---|---|---|
| **Avaturn** | Selfie to GLB with a "standard humanoid body rig, and ARKit blendshapes, and visemes" ([avaturn.me](https://avaturn.me/)). Free integration via tutorials ([Avaturn docs](https://docs.avaturn.me/docs/integration/overview)) | Pro **$800 a month** for up to 1,000 avatars, then $0.15 each ([Avaturn pricing](https://avaturn.me/pricing)) |
| **Avatar SDK MetaPerson** | Full-body, Mixamo-compatible GLB, glTF or FBX; realistic or cartoon; heads can be computed locally ([Avatar SDK FAQ](https://avatarsdk.com/faq/)) | **$800 a month** for 6,000 avatars, then $0.03 each ([Avatar SDK pricing](https://avatarsdk.com/pricing-cloud/)) |

Neither vendor's terms on output ownership or biometric data were read. Whichever you use, store every exported GLB in your own system, so a vendor shutdown cannot take users' characters with it.

General image-to-3D tools make stylised assets rather than faithful likenesses. TRELLIS is MIT, but its reference pipeline uses the non-commercial nvdiffrast ([HF TRELLIS](https://huggingface.co/api/models/microsoft/TRELLIS-image-large); [TRELLIS issue #298](https://github.com/microsoft/TRELLIS/issues/298)). Hunyuan3D 2.1's licence "DOES NOT APPLY IN THE EUROPEAN UNION, UNITED KINGDOM AND SOUTH KOREA" and requires a separate licence above 1 million monthly users ([Hunyuan3D 2.1 LICENSE](https://huggingface.co/tencent/Hunyuan3D-2.1/resolve/main/LICENSE)). Meshy's free outputs are CC BY 4.0, and its paid tiers give private ownership ([Meshy docs](https://docs.meshy.ai/en/webapp/pricing)). Rodin costs $30 or $120 a month ([Hyper3D pricing](https://hyper3d.ai/pricing)).

The file all of this should land in is **glTF 2.0/GLB**. It should hold a humanoid skeleton with VRM or Mixamo bone names, and morph targets named after ARKit's 52 shapes: 7 per eye, 27 for mouth and jaw, 10 for brows, cheeks and nose, and 1 for the tongue ([Apple BlendShapeLocation](https://developer.apple.com/documentation/arkit/arfaceanchor/blendshapelocation)). Add VRM 1.0 metadata for the consent and commercial-use flags ([vrm.dev VRM 1.0](https://vrm.dev/en/vrm1/)), which three.js loads through the MIT three-vrm library ([npm @pixiv/three-vrm](https://registry.npmjs.org/@pixiv/three-vrm/latest)). Keep a JSON sidecar with the capture hash, the consent record ID and the parametric fits (FLAME 2023 Open, MHR or Anny), plus an optional splat file. Plan a mapping layer too, because sources disagree: KeenTools ships 51 shapes and MetaHuman uses its own rig.

## Hair is where likeness quietly breaks

Hair looks like a styling feature, but it is where identity most often slips. The strongest independent evidence is a 2026 study of text-guided face editing, by Nair, Pandit and Kerner (ACM Multimedia 2026, oral) ([arXiv 2608.28802](https://arxiv.org/html/2608.28802v1)). It found that "Most models best preserved facial identity for hair edits", but that every model over-edits. They make about 25 unrequested changes per 100 instructions, and the most common are on hair: a "bob cut" request that also turns the hair brown. Each model's drop in face-similarity score on hair edits (lower is better) is shown below.

| Model | CelebA | CelebSET |
|---|---|---|
| Bagel-Edit | 18.79 | 18.20 |
| Nano Banana | 23.08 | 16.56 |
| FLUX.1 Kontext Pro | 24.60 | 21.47 |
| Qwen-Edit | 28.04 | 46.56 |
| Open FLUX dev | 89.13 | 83.53 |

The demographic finding matters most for a global product. "Almost all models created more overedits for dark-skinned male faces and old faces", and "Flux-dev is poor at retaining the facial identity of people with darker skin tones" ([arXiv 2608.28802](https://arxiv.org/html/2608.28802v1)). A production try-on vendor, StyleMyCrown, describes five failure modes on Black hair ([IJERT, July 2026](https://www.ijert.org/why-ai-gets-black-hair-wrong-documented-failure-modes-and-architectural-fixes-in-a-production-try-on-system-ijertv15is070651), *vendor-authored, observational, peer review unconfirmed*):

- "Catalog echo": the reference hairstyle is copied in unchanged.
- "No-op": nothing changes.
- "Identity transfer": the subject becomes a different person, "often lighter-skinned".
- "Timid edit": the change is too small.
- Segmentation failure on backlit, darker-skinned subjects.

Its fixes are masked inpainting that protects the face, a layered validation stack, refusing and refunding on a verified identity failure, style-specific LoRAs, and tracking refusal rates by skin tone. A 2026 ACM study reportedly found "the most severe degradations were observed on Black-presenting faces and textured hairstyles" ([doi 10.1145/3810417.3810425](https://doi.org/10.1145/3810417.3810425), *search summary; the page returned 403*).

Open hair-transfer research has some permissive code, but no cleared weights. HairFastGAN is MIT and runs "in less than a second on the Nvidia V100" ([HairFastGAN README](https://raw.githubusercontent.com/AIRI-Institute/HairFastGAN/main/README.md)). Barbershop is MIT ([Barbershop LICENSE](https://raw.githubusercontent.com/ZPdesu/Barbershop/main/LICENSE)). Stable-Hair is Apache-2.0, but it is built on Stable Diffusion 1.5 and trained only on FFHQ faces, and its improved model "will not be publicly available" ([Stable-Hair README](https://raw.githubusercontent.com/Xiaojiu-z/Stable-Hair/main/README.md)). The licences of their weights, base models and training data were not checked. Under your rule, treat them as not cleared. Others are plainly restricted. HairFusion ([HairFusion README](https://raw.githubusercontent.com/cychungg/HairFusion/main/README.md)) and Style-Your-Hair ([Style-Your-Hair README](https://raw.githubusercontent.com/Taeu/Style-Your-Hair/main/README.md)) are CC BY-NC-SA. HairPort (SIGGRAPH 2026) builds on the non-commercial FLUX.1 Kontext [dev] ([arXiv 2606.12562](https://arxiv.org/abs/2606.12562)). For video, HairShifter argues that editing frame by frame causes flicker. Its alternative is to edit an anchor frame and animate from it ([arXiv 2507.12758](https://arxiv.org/html/2507.12758v1)). That is the same keyframe-first pattern this report recommends for video.

Commercial hair APIs exist, but none publishes prices:

- **Perfect Corp's YouCam** launched 11 hair and beard APIs on 15 June 2026: hair colour with "unlimited color options", hairstyle, extensions, bangs, volume, waves and beard. It added diagnostics that classify "straight, wavy, curly, and kinky" hair. API keys are free, and the APIs support MCP natively ([Perfect Corp](https://www.perfectcorp.com/business/news/HairBeardAPI)).
- **Banuba** sells a Shopify app with hair dye from $319 a month for up to 10,000 try-ons. Its SDK is quote-only and takes 4–8 weeks to integrate ([Banuba](https://www.banuba.com/blog/banuba-tint-virtual-try-on-pricing-guide)).
- **ModiFace (L'Oréal)** sells annual licences, with no public API found ([ModiFace](https://Modiface.com/products-hair.html), *search summary*).

At **$0.04–0.15 per edited image**, general editors are cheaper and more flexible. To keep them honest, wrap them in three checks: a hair mask that stops face pixels changing, an identity check, and a check that hair colour did not change when only the cut was asked for.

Live hair recolour in the browser is free and licence-clean. MediaPipe's HairSegmenter takes a 512×512 image and returns hair versus background. It runs in about 52 ms on a Pixel 6's GPU. Its model card says "Licensed under Apache License, Version 2.0" ([MediaPipe Image Segmenter guide](https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter); [Hair segmentation model card](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20-%20Hair%20Segmentation.pdf)). The model dates from 2019, and its card admits its limits: "Hairstyles with thin and long pieces, such as mohawks and hairstyles with elongated braids, may not be reliably segmented", and neither may "Hair with any sort of large occlusion like headwear" ([model card](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20-%20Hair%20Segmentation.pdf)). For users who wear a hijab or another head covering, the honest design is a covering-aware mode, not a blind hair swap. Keep the covering, or show styles beneath it. No method was found that handles this, so it needs its own design and testing.

### 3D hair: strands for films, cards for phones, and a licensed library instead of reconstruction

3D hair comes in three forms:

- **Strands** are individual curves. They look best and cost the most to render.
- **Cards** are textured strips. They are the real-time standard on phones and the web.
- **Hair meshes** are the cheapest.

Unreal 5.8 renders strands only on desktops and current consoles. On a Mac, "requires Shader Model 6 on the Mac M2 and above", which rules out your M1. Cards and meshes run everywhere ([Epic groom platform support](https://dev.epicgames.com/documentation/unreal-engine/groom-platform-support-in-unreal-engine)). MetaHuman's strand grooms "are not suitable for platforms like mobile" ([MetaHuman requirements](https://dev.epicgames.com/documentation/metahuman/requirements-and-configuration-settings-for-metahumans-in-unreal-engine)). Blender 5.2 LTS has a full set of geometry-node hair tools, including "Braid Hair Curves", Curl and Clump ([Blender manual](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/hair/index.html)). It also has an experimental Hair Dynamics node for physics; the manual warns it "may change significantly in the future" ([Blender hair dynamics](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/simulation/hair_dynamics.html)). Look Lab's pinned Blender 5.1.1 would need upgrading to use it. three.js has no hair system ([three.js forum](https://discourse.threejs.org/t/realistic-hair-fur-material-strands/88143), *search summary*), so web hair means cards with custom shaders.

The most efficient published web-friendly method is Cem Yuksel's "hair meshes". It draws 100 characters with 100,000 strands each in about 2 ms, at 13–21 KB per hairstyle, with a WebGL demo. But "Hair meshes are protected by US and Internal patents" ([Yuksel project page](https://cemyuksel.com/research/hairmesh_rendering/)), which makes it a licensing question, not a free option.

Rebuilding a user's own hair in 3D from photos is research-only. Licence by licence:

- **NeuralHaircut:** CC BY-NC ([LICENSE](https://raw.githubusercontent.com/Vanessik/NeuralHaircut/main/LICENSE.txt)).
- **GaussianHaircut:** CC BY-NC-SA, plus the splatting licence ([README](https://raw.githubusercontent.com/eth-ait/GaussianHaircut/main/README.md)).
- **MonoHair:** CC BY-NC ([LICENSE](https://raw.githubusercontent.com/KeyuWu-CS/MonoHair/master/LICENSE.txt)).
- **HAAR:** CC BY-NC ([LICENSE](https://raw.githubusercontent.com/Vanessik/HAAR/master/LICENSE.txt)).
- **Im2Haircut:** CC BY-NC-SA ([README](https://raw.githubusercontent.com/Vanessik/Im2Haircut/master/README.md)).
- **HairStep:** CC BY-NC ([LICENSE](https://raw.githubusercontent.com/GAP-LAB-CUHK-SZ/HairStep/main/LICENSE)).

The strongest single-image model is **DiffLocks** (CVPR 2025). It outputs about 100,000 strands in 2.33 seconds on an H100 and is the first to recover "highly curled hair, like afro hairstyles" ([arXiv 2505.06166](https://arxiv.org/html/2505.06166v1)). Its licence bars "production of other artifacts for commercial purposes" ([DiffLocks LICENSE](https://raw.githubusercontent.com/Meshcapade/difflocks/main/LICENSE)), which covers rendered video. **Perm** has MIT code and released checkpoints, but its single-photo pipeline is unreleased, and "curly/kinky hairstyles are currently not well reconstructed" ([Perm README](https://raw.githubusercontent.com/c-he/perm/main/README.md)). All of these need CUDA GPUs, so none runs on your M1.

The realistic commercial path is a curated groom library. Match the user to the nearest groom, recolour it and fit it to the head. MetaHuman grooms export as Alembic through Epic's Maya and Houdini plugins ([CG Channel](https://www.cgchannel.com/2025/06/you-can-now-sell-metahumans-or-use-them-in-unity-or-godot/)). They are usable in Blender under the same "no AI training" rule. That rule blocks one tempting shortcut: training a hairstyle LoRA on MetaHuman renders. Fab assets come under a Standard licence, and a "NoAI" tag means "an asset must not be used for generative AI data collection" ([Epic Fab docs](https://dev.epicgames.com/documentation/en-us/fab/licenses-and-pricing-in-fab)). Reallusion hair falls under the "character generation system" bar mentioned above. A curated library should deliberately include coily, braided and loc styles. No 3D dataset for locs was found, and Hairmony notes that strand models "cannot yet represent short, frizzy, coily hair" ([arXiv 2410.11528](https://arxiv.org/html/2410.11528v1), *search summary*).

## General editors now out-dress the try-on specialists

Almost every well-known open virtual try-on model is non-commercial:

- **IDM-VTON:** "The codes and checkpoints in this repository are under the CC BY-NC-SA 4.0 license" ([IDM-VTON README](https://raw.githubusercontent.com/yisol/IDM-VTON/main/README.md)).
- **OOTDiffusion:** CC BY-NC-SA ([OOTDiffusion LICENSE](https://raw.githubusercontent.com/levihsu/OOTDiffusion/main/LICENSE)).
- **CatVTON:** CC BY-NC-SA ([CatVTON README](https://raw.githubusercontent.com/Zheng-Chong/CatVTON/main/README.md)).
- **StableVITON:** CC BY-NC-SA ([StableVITON README](https://raw.githubusercontent.com/rlawjdghek/StableVITON/master/README.md)).
- **FitDiT:** "can only be used for non-commercial use" ([FitDiT README](https://raw.githubusercontent.com/BoyuanJiang/FitDiT/main/README.md)).
- **Any2AnyTryon:** no licence file at all, and it runs on FLUX.1 [dev] ([Any2AnyTryon README](https://raw.githubusercontent.com/logn-2024/Any2anyTryon/main/README.md)).
- **Leffa:** labelled MIT ([Leffa LICENSE](https://raw.githubusercontent.com/franciszzj/Leffa/main/LICENSE)), but its weights were trained on VITON-HD, which is "for research purposes only" under CC BY-NC 4.0 ([VITON-HD README](https://raw.githubusercontent.com/shadow2496/VITON-HD/main/README.md)), and on Dress Code, which is limited to "non-commercial academic research" ([Dress Code LICENCE](https://raw.githubusercontent.com/aimagelab/dress-code/main/LICENCE)). fal labels Leffa commercially cleared, which contradicts this. Unclear means no.
- **OmniTry:** Apache-2.0 ([OmniTry LICENSE](https://raw.githubusercontent.com/Kunbyte-AI/OmniTry/main/LICENSE)), but whether it is built on the non-commercial FLUX.1 Fill [dev] is unconfirmed.

These models also dress one garment category per pass (upper body, lower body or dress), and they need masks and body-pose maps.

The 2026 benchmarks make the licence question almost academic, because the general editors now win anyway. Alibaba's Tstars-Tryon paper scores single-garment try-on out of 10 on its own benchmark ([arXiv 2604.19748](https://arxiv.org/html/2604.19748)):

| Model | Overall | Identity | Garment fidelity |
|---|---|---|---|
| Tstars-Tryon (Alibaba, not released) | 9.372 | — | — |
| Seedream5 lite | 9.301 | 9.854 | 8.639 |
| Nano Banana Pro | 9.229 | 9.861 | 8.598 |
| GPT-Image-2 | 9.200 | 9.597 | 8.794 |
| FLUX.2 dev | 8.764 | 9.419 | 7.920 |
| Qwen-Image-Edit-2511 | 8.121 | 9.214 | 6.787 |
| CatVTON (2024 open try-on) | 6.663 | — | 4.007 |
| Leffa (2024 open try-on) | 6.048 | — | — |

GPT-Image-1.5 and GPT-Image-2 "failed to generate results for 120 [and] 107 test cases" because of "platform restrictions". So any pipeline needs a fallback model for refusals ([arXiv 2604.19748](https://arxiv.org/html/2604.19748)).

The Garments2Look study had three fashion experts compare 500 results, and they preferred Nano Banana in 66% of cases. But "Nano Banana does not natively support image inpainting, and it lacks accurate explicit control over skeletal pose". Giving it one "OOTD grid image" (all the outfit's items in a single picture) kept the items more consistent than separate images ([arXiv 2603.14153](https://arxiv.org/html/2603.14153)). Every 2026 benchmark flags the same open problem: full outfits and layering. "Current methods struggle to try on complete outfits seamlessly and to infer correct layering and styling" ([arXiv 2603.14153](https://arxiv.org/abs/2603.14153)). General editors "remain challenged by ... multi-cloth conditioning" ([VTEdit-Bench, arXiv 2603.11734](https://arxiv.org/abs/2603.11734)) and suffer "cross-garment feature leakage" ([WearWow, arXiv 2607.19923](https://arxiv.org/abs/2607.19923)).

Dedicated try-on APIs cost about **$0.04–0.30 per image**:

| Service | Price per image | Notes |
|---|---|---|
| fal `image-apps-v2/virtual-try-on` | $0.04 | Underlying model not stated ([fal](https://fal.ai/models/fal-ai/image-apps-v2/virtual-try-on)) |
| Vertex AI Virtual Try-On | $0.06 | One person image plus product images ([Google Cloud pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing); [Vertex VTO docs](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/generate-virtual-try-on-images)) |
| FASHN Try-On v1.6 | $0.075 (1 credit) | 864 × 1296 px; full-body shots default to a full outfit swap ([FASHN docs](https://docs.fashn.ai/llms-full.txt)) |
| Perfect Corp clothes API | about $0.096–0.11 | Upper, lower and full body ([Perfect Corp](https://www.perfectcorp.com/business/blog/ai-clothes/virtual-try-on-api-pricing)) |
| FASHN Try-On Max | about $0.15 at 1K, $0.30 at 4K | Clothing, shoes, hats, jewellery and bags; accepts prompts like "tuck in shirt" ([FASHN changelog](https://fashn.ai/changelog/new-resolution-tiers-and-generation-mode-controls); [FASHN pricing](https://help.fashn.ai/plans-and-pricing/api-pricing)) |
| FLUX Virtual Try-On Pro (fal) | $0.0375 for the first megapixel | One garment per request ([fal](https://fal.ai/models/fal-ai/flux-pro/v1/vto)) |
| Kling Kolors try-on (fal) | $0.07 | Deprecated on fal ([fal](https://fal.ai/models/fal-ai/kling/v1-5/kolors-virtual-try-on)) |

FASHN has the most complete documentation. Failed predictions are free. Outputs are "Scheduled for deletion after three days", but request records are "Not deleted automatically" and there is no deletion endpoint. It does not train on customer content "unless you expressly opt in". Its "conservative" moderation "blocks underwear, swimwear, and revealing outfits" ([FASHN docs](https://docs.fashn.ai/llms-full.txt)). Google's consumer Shopping try-on can make a full-body image from one selfie and the user's stated size ([TechCrunch](https://techcrunch.com/2025/12/11/googles-ai-try-on-feature-for-clothes-now-works-with-just-a-selfie/)), but it is not an API.

For video, the practical pattern is to dress the character once in a still, check it, and pass that still as the reference or first frame. Garment drift then depends on how well the video model follows references, rather than on re-dressing every frame. Research that re-dresses existing video is mostly non-commercial: CatV2TON ([CatV2TON README](https://raw.githubusercontent.com/Zheng-Chong/CatV2TON/main/README.md)) and MagicTryOn ([MagicTryOn README](https://raw.githubusercontent.com/vivoCameraResearch/Magic-TryOn/main/README.md)) are both NC. ViViD is Apache-2.0 but built on Stable Diffusion 1.5 and AnimateDiff ([ViViD LICENSE](https://raw.githubusercontent.com/alibaba-yuanjing-aigclab/ViViD/main/LICENSE)). The commercial options found are Decart's Lucy2, which restyles outfits on live video for $0.02 per second ([fal](https://fal.ai/models/decart/lucy2-vton/realtime)), and Kling O1 reference video-to-video at $0.168 per second ([fal](https://fal.ai/models/fal-ai/kling-video/o1/video-to-video/reference)). Neither was quality-tested here.

### 3D garments, body shape, and the clothes the datasets forgot

3D clothes are still made from sewing patterns. **Marvelous Designer** 2026.1 costs $39 a month or $280 a year for Personal, and $199 a month or $2,000 a year for Enterprise ([CG Channel, Aug 2026](https://www.cgchannel.com/2026/08/clo-virtual-fashion-releases-marvelous-designer-2026-1/)). Its support page says companies other than freelancers "must purchase enterprise licenses" ([MD support](https://support.marvelousdesigner.com/hc/en-us/articles/47358297616153-What-is-the-difference-between-Personal-and-Enterprise-License), *search summary*). Version 2026.0 added glTF and VRM support ([Digital Production](https://digitalproduction.com/2026/04/15/marvelous-designer-2026-0-adds-3d-pencil-and-lacing/)). **CLO** costs $50 a month or $450 a year ([CLO support](https://support.clo3d.com/hc/en-us/articles/115012815487-How-much-does-CLO-cost), *search summary, unverified*) and exports glTF with avatars and animation ([CLO glTF](https://support.clo3d.com/hc/en-us/articles/360051525034-glTF-2-0-GLTF-GLB-File), *search summary*). Blender's cloth simulation is baked offline, and it stitches garments with "sewing springs" ([Blender cloth](https://docs.blender.org/manual/en/latest/physics/cloth/introduction.html)). Unreal's Chaos Cloth panel editor applies cloth to "any skeletal or static mesh" at runtime ([Epic panel cloth](https://dev.epicgames.com/documentation/unreal-engine/panel-cloth-editor-overview)).

Turning a photo into a sewing pattern is a fast-moving research area. GarmentCode is MIT ([GarmentCode LICENSE](https://raw.githubusercontent.com/maria-korosteleva/GarmentCode/main/LICENSE)) and ChatGarment is Apache-2.0 ([ChatGarment README](https://raw.githubusercontent.com/biansy000/ChatGarment/main/README.md)), though its LLaVA and LISA bases were not checked. The 2026 preprints, such as DressWild ([arXiv 2602.16502](https://arxiv.org/abs/2602.16502)), have no licence information. Use them for drafts and finish in Marvelous Designer or CLO.

For body shape, a styled character needs a rough shape, not a tailor's measurements. SAM 3D Body plus MHR, or Anny driven by a few sliders, avoids SMPL fees. Single-image fitters such as SMPLer-X are S-Lab non-commercial ([SMPLer-X LICENSE](https://raw.githubusercontent.com/caizhongang/SMPLer-X/main/LICENSE)). Phone measurement apps report circumference errors of 0.79–1.96 cm in a 2021 study ([3DBODY.TECH 2021](https://proc.3dbody.tech/papers/2021/2133smith.pdf)). 3DLOOK claims 1.5–2.2 cm from internal tests ([3DLOOK](https://3dlook.ai/?p=41875), *vendor claim*). Try-on models also "default to generating well-fitted results regardless of the garment or person size" ([FIT, arXiv 2604.08526](https://arxiv.org/abs/2604.08526)). So never present fit as accurate.

The cultural gap matters for your users in India. The BD-VITON study notes that try-on benchmarks "are based on datasets that are dominant in western-style clothing and female models". It says sarees, panjabi and salwar kameez bring "complex draping, asymmetric layering, and high deformation complexities", and that retraining beats zero-shot use ([BD-VITON, arXiv 2603.07291](https://arxiv.org/abs/2603.07291)). The Tstars benchmark itself is "74.9% female" and "85% youth" ([arXiv 2604.19748](https://arxiv.org/html/2604.19748)). No vendor publishes a bias report for its try-on model.

Logos and fine detail are poorly measured. Researchers note that "PSNR, SSIM, KID and FID struggle to measure the consistency between the generated and reference garments" ([DAT, arXiv 2608.29804](https://arxiv.org/abs/2608.29804)). Generic AI judges invite "severe reward hacking" ([TryOnReward, arXiv 2609.13259](https://arxiv.org/abs/2609.13259)). That second warning applies to your agent's own retry loop.

The working rules follow from this. Build outfits garment by garment, from inner to outer layers, or from a single grid image, and verify each step. Expect weak zero-shot results on modest and South Asian clothing. For those, a pattern-made 3D garment is the more controllable route.

## Keyframe first, then video: identity rides on a still

The reliable pattern for video of a real person is to generate the image first. Make an identity-locked still of the character in their chosen hair and outfit, using a multi-reference image model. Check it. Then hand the same face, hair and outfit references, plus that still, to a video model as references or as the first frame. Check sampled frames again. The pattern also suits today's market, where what a video model will do with a real person is decided as much by policy as by quality.

| Video model | References | Clip length with references | Price per second | Person rules |
|---|---|---|---|---|
| Veo 3.1 (Gemini API) | Up to 3 images ("asset") | Must be 8 s | $0.40 at 720p/1080p, $0.60 at 4K | Only `allow_adult`; in the EU, UK, Switzerland and MENA, `allow_adult` is the only person setting; SynthID on all output ([Gemini API Veo](https://ai.google.dev/gemini-api/docs/veo); [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)) |
| Veo 3.1 Fast | Up to 3 | 8 s | $0.10 at 720p, $0.12 at 1080p | As above. Veo 3.1 Lite ($0.05–0.08/s) takes no references ([Gemini API Veo](https://ai.google.dev/gemini-api/docs/veo)) |
| Kling O1 reference-to-video (fal) | Up to 7, shared across "elements", style images and a start frame | 5 or 10 s | $0.112 | No consent rule found; claims identity holds "through complex camera movements" ([fal Kling O1](https://fal.ai/models/fal-ai/kling-video/o1/reference-to-video)) |
| Kling O3 Standard reference-to-video (fal) | Multiple elements, each a front image plus references; start and end images | Not stated | $0.084 without audio, $0.112 with | As above ([fal Kling O3](https://fal.ai/models/fal-ai/kling-video/o3/standard/reference-to-video)) |
| Vidu Q2 reference-to-video (fal) | Up to 7 | 1–8 s | $0.10, $0.20 or $0.30 per clip at 360p, 520p or 720p | Claims identity holds "through 180° camera moves" ([fal Vidu Q2](https://fal.ai/models/fal-ai/vidu/q2/reference-to-video)) |
| Vidu Q3 reference-to-video (fal) | References | Not stated | $0.07 at 360p/540p; 2.2× that at 720p/1080p | ([fal Vidu Q3](https://fal.ai/models/fal-ai/vidu/q3/reference-to-video)) |
| Runway Gen-4.5 / Act-Two / Gen-4 References | Image references at $0.05–0.08 per image | Not stated | $0.12 (Gen-4.5); $0.05 (Act-Two performance capture) | Bans using another person's likeness without permission ([Runway API pricing](https://docs.dev.runwayml.com/guides/pricing/); [ConductAtlas](https://conductatlas.com/platform/runway/runway-usage-policy/prohibition-on-real-person-likeness-without-permission/), *secondary*) |
| Seedance 2.0 reference-to-video (fal) | References | Not stated | $0.3034 at 720p | Real-face uploads blocked unless the user is identity-verified or pre-authorised ([fal Seedance 2.0](https://fal.ai/models/bytedance/seedance-2.0/reference-to-video), *search summary*; [seedrouter](https://seedrouter.ai/blog/seedance-real-person-error), *secondary*) |
| Sora 2 | — | — | — | API shut down 24 Sep 2026; it had already rejected "Input images with faces of humans" ([OpenAI video guide](https://developers.openai.com/api/docs/guides/video-generation)) |

Kling's own API lists Kling 3.0 at $0.084 per second at 720p and $0.112 at 1080p without audio ([Kling API pricing](https://kling.ai/dev/pricing), *search summary*). Higgsfield's Soul ID is a photo-trained identity that a third-party guide prices at about 25 credits (roughly $1.25) per training or generation ([Creatify](https://creatify.ai/blog/higgsfield-soul-prompts-for-product-ads), *secondary, unverified*). MiniMax's S2V-01 takes "a subject's face photo" ([MiniMax API docs](https://platform.minimax.io/docs/api-reference/video-generation-s2v)) and resells at about $0.64 per 6-second clip ([EachLabs](https://www.eachlabs.ai/minimax/sv2/minimax-s2v-01), *reseller*).

The open-weight video route is **Wan 2.2**: Apache-2.0, 480p/720p, with the 5B model at 720p and 24 fps ([HF Wan2.2](https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B)). Paired with a person LoRA, it is the only open way found to build a person-specific video model. HunyuanVideo is excluded for UK and EU use.

Vendor churn is the main operational risk. In the past year, all of these went: Gemini 2.5 Flash Image (2 October 2026), the Sora API (24 September 2026) and Kling Kolors on fal. fal's Veo 3.1 reference endpoint "will be deprecated on November 17, 2026" ([fal Veo 3.1 reference-to-video](https://fal.ai/models/fal-ai/veo3.1/reference-to-video)). Google now recommends "Gemini Omni Flash" as its default video model, and its reference support is undocumented ([Gemini API video](https://ai.google.dev/gemini-api/docs/video)). Your router should treat every model as replaceable.

Face swapping as a final consistency pass is the riskiest shortcut. InsightFace's inswapper needs a paid licence ([InsightFace GitHub](https://github.com/deepinsight/insightface)). The CodeFormer restorer is under the non-commercial S-Lab licence ([CodeFormer LICENSE](https://raw.githubusercontent.com/sczhou/CodeFormer/master/LICENSE)). GFPGAN's code is Apache-2.0, but its weights' licence was not confirmed ([GFPGAN](https://github.com/TencentARC/GFPGAN)). Swapping also sits at the edge of every provider's likeness policy.

### What a character and a film cost, roughly

The figures below are illustrative arithmetic from the list prices above, not measured runs. The three-attempts-per-shot retry rate is an assumption you should replace with your own data.

Onboarding one character costs:

| Item | Cost |
|---|---|
| Liveness check | $0.015 |
| About ten upload matches | $0.01 |
| Four character-sheet stills on Gemini 3 Pro Image (front, three-quarter, profile, full body in the chosen look) | $0.54 |
| **Total** | **about $0.56** |
| Optional FLUX LoRA | $2 |
| Optional Wan 2.2 video LoRA | about $4–5 |
| Optional full identity verification | $0.80–1.89 |

A 30-second film made of six shots, at three attempts per shot:

| Route | Keyframes | Video | Verification | Total |
|---|---|---|---|---|
| Kling O3 Standard (5 s shots) | 18 × $0.134 = $2.41 | 90 s × $0.084 = $7.56 | 180 frames × $0.001 = $0.18 | **about $10** |
| Veo 3.1 Fast at 1080p (8 s shots, as references require) | $2.41 | 144 s × $0.12 = $17.28 | about $0.29 | **about $20** |
| Veo 3.1 standard with audio | $2.41 | 144 s × $0.40 = $57.60 | about $0.29 | **about $60** |

These numbers fill the "cost per film" gap in your PRD with a first estimate. Measure them against the real retry rate.

## The verifier cannot use the research world's favourite face model

Your agent's verifier needs a face-similarity score. The research standard is cosine similarity between ArcFace embeddings: two lists of numbers, compared by how closely they point the same way. ArcFace's usual packs (InsightFace's buffalo_l and antelopev2) are "for non-commercial research purposes only" ([InsightFace GitHub](https://github.com/deepinsight/insightface)). There are three commercial options.

- **AuraFace-v1** (Apache-2.0) scores 99.65% on the LFW benchmark, with lower scores on harder sets: 0.95186 on CFP-FP and 0.90933 on CPLFW. It warns that "efficacy ... may vary on the basis of etchnicity" [sic] ([HF fal/AuraFace-v1](https://huggingface.co/fal/AuraFace-v1)). Hugging Face's write-up says it "does not match the performance of the original ArcFace" ([HF blog](https://huggingface.co/blog/isidentical/auraface), *search summary*).
- **YuNet plus SFace** is listed as "Apache 2.0 - commercial-safe" ([LocalAI docs](https://localai.io/docs/features/face-recognition/), *secondary*).
- **AWS Rekognition CompareFaces** costs **$0.0010 per image** for the first million a month, then $0.0008, $0.0006 and $0.0004 ([AWS Rekognition pricing](https://aws.amazon.com/rekognition/pricing/)).

A paid InsightFace licence is a fourth route, at an unpublished price.

A workable verifier detects and aligns the face in a frame sampled every half second. It embeds the face and compares it with the user's consented reference set, then records the lowest and the median score for each shot. It rejects or regenerates any shot below a threshold calibrated on that person's own photos. No published threshold for "same identity" in generated media was found, so calibrate per person.

Face-recognition models are built to ignore hair and clothing, so the look needs its own checks:

- the hair colour inside the hair mask;
- a garment colour histogram;
- logo text read by OCR;
- a silhouette comparison against the garment image.

This split is general knowledge rather than sourced, but the outfit research supports it. Classic image metrics miss logos, and generic AI judges can be gamed ([DAT, arXiv 2608.29804](https://arxiv.org/abs/2608.29804); [TryOnReward, arXiv 2609.13259](https://arxiv.org/abs/2609.13259)).

Add one more check your PRD already names, "consent for faces". Every face detected in an output must match a verified, consenting identity listed in that shot package. If any face does not, block the shot.

Fairness has to be measured, not assumed, because averages hide the failures shown in the hair and outfit sections. Before launch, build a test set balanced across:

- skin tone, age, gender and body size;
- hair texture: straight, wavy, curly, coily, braids and locs;
- head coverings;
- Western and South Asian garments.

Report identity similarity, unwanted colour or texture changes, and segmentation coverage for each group, as MediaPipe's model card does for its regions and skin tones.

Provenance is part of verification. Every Gemini image and every Veo video carries SynthID ([Gemini API image generation](https://ai.google.dev/gemini-api/docs/image-generation); [Gemini API Veo](https://ai.google.dev/gemini-api/docs/veo)). OpenAI images carry both C2PA metadata and SynthID ([OpenAI Help](https://help.openai.com/en/articles/8912793-c2pa-in-images), *search summary*). Runway is listed as a C2PA signer ([Wikipedia: Content Credentials](https://en.wikipedia.org/wiki/Content_Credentials), *secondary*). Nano Banana 2 images reportedly carry both ([Promptyze](https://promptyze.com/nano-banana-2-stamps-every-image-with-synthid-and-c2pa-heres-what-that-actually-means/), *secondary*). No statement was found for Kling, Vidu, MiniMax or Seedance.

C2PA metadata is easy to strip, while SynthID is designed to survive compression and screenshots ([Layer3 Labs](https://www.layer3labs.io/guides/synthid-explained), *secondary*). Re-encoding video generally drops C2PA. So the agent should keep upstream marks, and sign its own C2PA manifest at final export, recording the consent record and the models used. C2PA calls this "Content Credentials" ([C2PA](https://c2pa.org/)).

## Checking "it's really you" is what makes the face biometric

### Europe and the UK: explicit consent, a DPIA and a path for people who say no

Under the GDPR, a selfie is not automatically biometric data. Article 4(14) defines biometric data as data "resulting from specific technical processing" that "allow[s] or confirm[s] the unique identification" of a person, "such as facial images" ([GDPR Art. 4](https://gdpr-info.eu/art-4-gdpr/)). Recital 51 adds that photographs count "only when processed through a specific technical means allowing the unique identification or authentication" ([GDPR Recital 51](https://gdpr-info.eu/recitals/no-51/)). Article 9 bans processing "biometric data for the purpose of uniquely identifying a natural person" unless an exception such as "explicit consent" applies. Member states "may maintain or introduce further conditions" ([GDPR Art. 9](https://gdpr-info.eu/art-9-gdpr/)). Commentary on the EDPB's facial-recognition guidelines reports its view that one-to-one checks (is this the same person?) and one-to-many searches (who is this?) both process biometric data ([Stibbe](https://www.stibbe.com/publications-and-insights/digital-law-uptodate-edpb-guidelines-on-facial-recognition-in-the-area-of), *search summary*).

The design consequence is unavoidable. Your own-face verification, a liveness check plus a one-to-one match, is processing for unique identification. So the safeguard itself puts the pipeline under Article 9. A face embedding or a personal LoRA used "only to keep the character looking like you" is very likely biometric data. Whether it is special-category data turns on its purpose, and that argument is weak and contested. **Lawyer to confirm.** The practical answer is to treat the whole pipeline as Article 9 from day one.

The UK ICO's guidance makes this concrete:

- "Not all biometric data is automatically special category biometric data. It only becomes this if you use it to uniquely identify someone" ([ICO key concepts](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/key-data-protection-concepts/)).
- "Biometric recognition includes both biometric identification and biometric verification" ([ICO biometric recognition](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/biometric-recognition/)).
- "Explicit consent is likely to be the most appropriate condition". Consent information must be "set apart from other terms and conditions". "You must also offer a suitable alternative to people who choose not to consent" ([ICO lawful processing](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/how-do-we-process-biometric-data-lawfully/)).
- "You must complete a DPIA before you use a biometric recognition system" ([ICO compliance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/how-do-we-demonstrate-our-compliance-with-our-data-protection-obligations/)).
- "You must also appropriately encrypt any biometric data", to a higher bar than for other personal data. The ICO recommends templates that are irreversible, unlinkable and revocable (ISO/IEC 24745), and on-device verification in which "only a token or proof of the verification" leaves the phone ([ICO security](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/how-do-we-keep-biometric-data-secure/)).

The ICO also warns that biometric data can reveal racial or ethnic origin even when that is not your purpose ([ICO key concepts](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/key-data-protection-concepts/)). Its biometric guidance is "under review" because of the Data (Use and Access) Act 2025 ([ICO hub](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/)). That Act's main data changes came into force on 5 February 2026 ([gov.uk](https://www.gov.uk/guidance/data-use-and-access-act-2025-plans-for-commencement), *search summary*), including a new "not materially lower" test for international transfers ([Burges Salmon](https://www.burges-salmon.com/?p=15019), *search summary*). Since 6 February 2026 it has been a UK criminal offence to create, or request, a sexually explicit deepfake of an adult without consent ([gov.uk](https://gov.uk/government/news/better-protection-for-victims-thanks-to-new-law-on-sexually-explicit-deepfakes), *search summary*).

The "suitable alternative" is a product requirement. Offer a manual avatar builder or a text-described character for anyone who will not scan their face.

Transfers of EU users' faces to US model providers can rely on the EU–US Data Privacy Framework. But an appeal against it (C-703/25 P) is pending at the EU's Court of Justice ([WilmerHale](https://www.wilmerhale.com/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20251201-european-court-of-justice-to-review-challenge-to-eu-us-data-privacy-framework); [IEU Monitoring](https://ieu-monitoring.com/editorial/microsoft-backs-eu-commission-in-eu-court-case-on-transatlantic-data-flows-and-privacy/1244467/), *search summary*). Keep standard contractual clauses (SCCs) ready as a fallback. Whether the UK–US data bridge still stands was not verified.

The EU AI Act adds output duties. Since 2 August 2026, Article 50(2) has required providers of generative systems to mark outputs "in a machine-readable format and detectable as artificially generated or manipulated". Article 50(4) requires deployers to disclose deepfakes. "Evidently artistic, creative, satirical, fictional" work gets a lighter disclosure that "does not hamper the display or enjoyment of the work" ([AI Act Art. 50](https://artificialintelligenceact.eu/article/50/)). The final Code of Practice (10 June 2026) expects "at least two layers of machine-readable marking" and the EU icon for labelling deepfakes ([Jones Day](https://www.jonesday.com/en/insights/2026/06/european-commission-publishes-final-code-of-practice-on-marking-and-labelling-aigenerated-content)).

The Digital Omnibus, Regulation (EU) 2026/1744, gives systems already on the market before 2 August 2026 until 2 December 2026 to comply with the marking duty ([Cuatrecasas](https://www.cuatrecasas.com/en/spain/intellectual-property/art/digital-omnibus-ai-has-been-published)). From 2 December 2026, it also adds an Article 5 ban on AI systems that generate realistic intimate imagery of an identifiable person without consent, or child sexual abuse material ([AI Act Art. 5](https://artificialintelligenceact.eu/article/5/); [Gibson Dunn](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/)). Article 5(1)(g) already bans biometric categorisation "to deduce or infer their race" ([AI Act Art. 5](https://artificialintelligenceact.eu/article/5/)). So never pick or suggest hairstyles from an ethnicity inferred from the face scan.

An app that wraps third-party models under its own name is very likely a "provider" under Article 50(2). **Lawyer to confirm.** It should therefore mark outputs itself, not rely on its model providers. Denmark has also tabled a bill giving people copyright-like control over their face and voice, targeted for 1 January 2027 ([Euronews](https://www.euronews.com/2026/10/08/denmark-introduces-a-bill-protecting-peoples-faces-and-voices-from-deepfakes)). Your "only your own verified face" model already fits it.

### United States: design every US flow as if Illinois law applies

Illinois' Biometric Information Privacy Act (BIPA) is the biggest exposure. It requires notice of "the specific purpose and length of term" and a written release before collecting biometric data. Electronic signatures have counted since 2024. It also requires a public retention and destruction policy. It sets damages of **$1,000 per negligent and $5,000 per intentional violation**, with a private right to sue that needs no proof of actual harm ([Davis Wright Tremaine](https://www.dwt.com/blogs/privacy--security-law-blog/2024/08/illinois-bipa-biometrics-law-amended-for-damages)). Since a 2024 amendment, repeated collection from the same person by the same method is one violation. The Seventh Circuit applied that retroactively on 1 April 2026 ([Paul Hastings](https://www.paulhastings.com/insights/ph-privacy/7th-circuit-confirms-bipa-amendment-has-retroactive-application)). The BIPA statute text itself could not be fetched, so its photograph exclusion, its three-year outer limit for destruction and its no-profit clause are *unverified*.

Other states add their own duties:

- **Texas.** CUBI covers a "record of hand or face geometry". It requires notice and consent and bans selling the data. Data must be destroyed no later than one year after the purpose expires, with penalties up to **$25,000 per violation** ([Tex. Bus. & Com. Code §503.001](https://texas.public.law/statutes/tex._bus._and_com._code_section_503.001)).
- **Washington.** Its biometric statute excludes photographs ([RCW 19.375](https://app.leg.wa.gov/RCW/default.aspx?cite=19.375&full=true)). But its My Health My Data Act covers face imagery "from which an identifier template can be extracted" and requires opt-in consent ([RCW 19.373.010](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373.010)). It is enforced through a private right of action ([Sidley](https://datamatters.sidley.com/?p=4971), *search summary*).
- **Colorado** added biometric rules on 1 July 2025 ([ACLU of Colorado](https://www.aclu-co.org/legislation/hb24-1130-privacy-biometric-identifiers-data-0/), *search summary*).
- **California** treats biometric data used for identification as sensitive personal information ([DLA Piper](https://www.dlapiper.com/insights/publications/2025/09/ccpa-2025-updated-regulations), *search summary*).

At federal level, the TAKE IT DOWN Act has required covered platforms to remove non-consensual intimate images within 48 hours of a valid request since 19 May 2026 ([Wiley](https://www.wiley.law/alert-May-19-Deadline-for-TAKE-IT-DOWN-Act-Compliance-Is-Your-Company-Prepared); [WilmerHale](https://wilmerhale.com/en/insights/client-alerts/20260615-the-take-it-down-act-goes-live), *search summary*). It applies if users can share or host outputs. The NO FAKES Act passed the Senate Judiciary Committee in June 2026 but is not law ([Sen. Blackburn](https://www.blackburn.senate.gov/2026/6/blackburn-coons-bipartisan-bill-to-protect-individuals-and-creators-from-deepfakes-passes-senate-judiciary-committee), *search summary*). State digital-replica laws in California, Tennessee (the ELVIS Act) and New York make likenesses of anyone other than the verified user high-risk ([Foley](https://www.foley.com/p/102jk3d/california-governor-gavin-newsom-signs-two-ai-bills-to-protect-entertainment-indu/); [DWT](https://www.dwt.com/insights/2025/03/state-laws-regulating-ai-in-entertainment-industry); [MSK](https://www.msk.com/newsroom-alerts-3114), *search summary*).

One global policy satisfies most of these together:

- Delete raw captures as soon as the character is built.
- Delete embeddings and LoRAs on account deletion, consent withdrawal, or after 12 months of inactivity, which falls inside CUBI's one-year cap.
- Push every deletion to every model provider.

### India: labels and takedowns now, data duties from 2027

The DPDP Rules were notified around 13 November 2025 and phase in. Consent managers start around 13 November 2026, and the core duties (notice, security, breach notification, user rights and children) apply from around 13 May 2027 ([Deccan Herald](https://www.deccanherald.com/amp/story/india%2Fcentre-notifies-dpdp-rules-implementation-planned-in-phases-spread-over-12-18-months-3798465), *search summary*). A child is anyone under 18 ([KS&K](https://ksandk.com/data-protection-and-data-privacy/childrens-data-protection-under-indias-dpdp-rules/), *search summary*). Section 9 requires "verifiable consent of the parent" and bans "tracking or behavioural monitoring of children" ([DPDP s.9](https://www.dpdpa.com/dpdpa2023/chapter-2/section9.html), *unofficial mirror*). Rule 10 ties parental verification to identity or age tokens, including DigiLocker ([DPDP Rule 10](https://dpdpa.com/dpdparules/rule10.html), *unofficial mirror*). A hard block on face scans by under-18s is far simpler than building that. Cross-border transfers are allowed unless the government restricts a country ([DPDP s.16](https://www.dpdpa.com/dpdpa2023/chapter-4/section16.html), *unofficial mirror*). Whether the DPDP Act has any separate biometric category, and whether the older SPDI Rules still apply during the transition, was not verified. **Lawyer to confirm.**

The duty that already binds you is the IT Rules amendment on "synthetically generated information". It was notified on 10 February 2026 and took effect on 20 February 2026 ([Hogan Lovells](https://www.hlc.com/en/publications/india-introduces-mandatory-labelling-for-ai-and-3hour-takedown-for-illegal-content)). It has three parts:

- Realistic AI media must be "prominently labelled and embedded with permanent metadata or provenance markers".
- Services offering such tools must deploy measures, including automated tools, to prevent unlawful content, including non-consensual intimate imagery and "deceptive portrayals of individuals".
- Takedowns ordered by government or courts must happen within **3 hours**.

A separate 2-hour window for intimate-image complaints is reported by only one secondary source ([Mondaq](https://mondaq.com/india/new-technology/1760554/it-rules-2026-deepfake-regulation-three-hour-takedowns-and-ai-labelling-obligations), *search summary*).

### China-hosted APIs, app stores and model providers

Kling's privacy policy (updated 21 April 2026) reportedly says Kling does not analyse facial features ([Kling privacy policy](https://kling.ai/docs/privacy-policy), *search summary*). Third-party analyses say its terms grant a broad licence over uploads, including for model development, and that data "may" be processed in China ([ConductAtlas on Kling ToS](https://conductatlas.com/platform/kling-ai/kling-ai-terms-of-service/), *secondary*). China has no EU adequacy decision, treats biometrics as sensitive personal information under its PIPL, and has required visible and hidden AI labels since 1 September 2025 ([Loeb & Loeb](https://www.loeb.com/en/insights/publications/2025/03/chinas-ai-labeling-measures-and-mandatory-national-standards-take-effect-september-1); [Seers.ai](https://seers.ai/blogs/china-data-privacy-2-0-cross-border-consent-rules/), *search summary, weak source*). Until a data processing agreement confirms no training, a set retention period and the processing region, do not make Kling, Seedance or Hailuo the default for face-bearing inputs. Where you use them, require an opt-in that names the country. **Lawyer to confirm.**

Apple's guidelines ([App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)) say:

- Face and depth mapping data "may not be used for marketing, advertising or use-based data mining" (5.1.2(vi)).
- You must "obtain explicit permission" before sharing personal data "with third-party AI" (5.1.2(i)).
- In-app account deletion is mandatory (5.1.1(v)).
- Creator apps need an age-restriction mechanism (1.2.1(a)).

Google Play's AI-generated content policy covers "Apps that create voice and/or video recordings of real-life individuals using AI". It bans "AI-generated non-consensual deepfake sexual material" and makes developers "responsible for ensuring that their generative AI apps do not generate offensive content" ([Google Play policy](https://support.google.com/googleplay/android-developer/answer/14094294)). Since 2024 Play has also required in-app ways to flag offensive output ([TechCrunch](https://techcrunch.com/2024/06/06/google-play-cracks-down-on-ai-apps-after-circulation-of-apps-for-making-deepfake-nudes), *search summary*).

Model providers add their own terms. Google bans "using personal data or biometrics without legally-required consent" and "Impersonating an individual ... without explicit disclosure" ([Google Generative AI Prohibited Use Policy](https://policies.google.com/terms/generative-ai/use-policy)). OpenAI bans "using someone's likeness ... without their consent in ways that could confuse authenticity" ([OpenAI Usage Policies](https://openai.com/policies/usage-policies/), *search summary*). fal matters most, because your PRD names it as a worker. Its acceptable use policy makes you "fully responsible for your and your users' use". Read literally, its security clause lists "Biometric data (such as facial recognition data...)" among the data you must not "collect, process, or disclose" ([fal.ai AUP](https://fal.ai/legal/acceptable-use-policy)). Get fal's written clarification before routing selfies or face embeddings through it. Runway's terms reportedly let it train on uploads ([ConductAtlas](https://conductatlas.com/platform/runway/runway-usage-policy/prohibition-on-real-person-likeness-without-permission/), *secondary*), so use opt-out or enterprise terms.

For every provider, check:

- a data processing agreement, with the provider as processor;
- no training on your inputs;
- input and output retention, and any zero-retention option;
- the processing region;
- a deletion route;
- for EU data, DPF certification.

### What a lawyer must confirm before launch

| Question | Why it matters | Source |
|---|---|---|
| Is a one-time liveness and face-match check "authentication" under Apple's DPLA? | Apple bans using Face Data "for authentication" | [Apple DPLA](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/) |
| Are consistency-only embeddings and LoRAs special-category data (GDPR Art. 9), "face geometry" (CUBI) or MHMDA biometric data? | Decides the legal basis, retention and deletion for the core identity asset | [GDPR Art. 9](https://gdpr-info.eu/art-9-gdpr/); [Tex. §503.001](https://texas.public.law/statutes/tex._bus._and_com._code_section_503.001); [RCW 19.373.010](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373.010) |
| Are we a "provider" or a "deployer" under AI Act Art. 50? | Decides who must mark outputs | [AI Act Art. 50](https://artificialintelligenceact.eu/article/50/) |
| Does FLAME 2023 Open's ban on "fake ... misleading" content cover a consented digital double? | It is the only commercial FLAME | [FLAME licence](https://flame.is.tue.mpg.de/modellicense.html) |
| Does fal's AUP security clause bar consented biometric inputs? | fal is a planned worker | [fal.ai AUP](https://fal.ai/legal/acceptable-use-policy) |
| Can EU, UK and Indian faces go to China-hosted APIs at all? | Transfers, state access, training licences | [Kling privacy policy](https://kling.ai/docs/privacy-policy) |
| Does India's DPDP treat biometrics separately, and do the SPDI Rules still apply? | Consent standard for Indian users | [DPDP s.9](https://www.dpdpa.com/dpdpa2023/chapter-2/section9.html) |
| What does the full BIPA text say (photograph exclusion, destruction limit, no-profit clause)? | It was read only through secondary sources | [DWT](https://www.dwt.com/blogs/privacy--security-law-blog/2024/08/illinois-bipa-biometrics-law-amended-for-damages) |
| Does the SAM License carry any biometric or use restrictions beyond trade controls? | It was only keyword-scanned | [SAM License](https://cdn.jsdelivr.net/gh/facebookresearch/sam-3d-body@main/LICENSE) |
| What does the UK Online Safety Act require of an app that hosts or shares user AI content? | Not researched | — |
| Do the MetaHuman, Fab and Reallusion asset terms allow a consumer "choose your hair and outfit" feature? | Reallusion bars "character generation system" use | [Reallusion EULA](https://www.reallusion.com/Content/EULA/AP/EULA_AP.htm) |

## Three routes, one record: the recommended build

All three routes share the same front end and back end. The front end is an age gate, a consent screen, a guided capture, liveness and a face match. The back end is the verifier, provenance marks and deletion. They differ only in how the character is drawn. Every heavy step runs in the cloud, so the 8 GB M1 only needs a browser for development and capture. MediaPipe runs in the browser, and Blender, which Look Lab already runs on the M1, handles light 3D work. Note two hardware limits: Unreal strand hair needs an M2 or newer, and Reallusion Headshot needs Windows.

### Route 1: the fastest 2D route

The user passes an 18+ age gate and a separate consent screen. That screen names each purpose (building the character, verifying it is you, generating images and video), each model provider and its country, and the retention period, and takes an e-signature for BIPA. The user then records a 10–30-second guided selfie video in the browser, with MediaPipe checking distance, angle and neutral expression. AWS Face Liveness runs through its React component and returns the reference image, and any uploaded photos are face-matched to it.

The system then makes a character sheet of four to six identity-locked stills, such as front, three-quarter, profile and full body. It uses Gemini 3 Pro Image or 3.1 Flash Image, with face references in the character slots and the chosen hair and outfit as object references. FASHN or Vertex Try-On can serve as the outfit specialist, and Perfect Corp's API as the hair specialist. The user approves the look. Shots are then generated keyframe-first and animated with Kling O3/O1 elements or Veo 3.1 references, with Vidu as a fallback. Every frame sample passes the verifier. Every export gets a visible "AI-generated" label, its own C2PA manifest and the upstream SynthID.

Heavy users can add a personal LoRA, either FLUX on fal or Replicate for stills or Wan 2.2 for video, and Wan 2.2 can later move to your own GPUs because it is Apache-2.0. Onboarding costs under a dollar, and a 30-second film costs roughly $10–60. It is the quickest route to ship. Its limits:

- It keeps no scene data.
- Identity drifts on hair edits, worst for darker-skinned and older users.
- Layered and South Asian outfits are weak.
- Some requests are refused.
- The model menu changes every few months.

### Route 2: the 3D "scene as data" route

Capture is the same. On Face ID iPhones, add ARKit's depth and 52 expression coefficients. The character then becomes a rigged GLB in your own storage, built one of three ways:

1. **Bought.** MetaPerson ($800 a month for 6,000 avatars, with local head compute) or Avaturn turns the selfie into a GLB with a humanoid rig and ARKit blendshapes. Keep the exported files; never rely on the vendor's hosting.
2. **Built.** Fit FLAME 2023 Open for the head (after the lawyer check), MHR for body and face expressions, and Anny for all ages, using MediaPipe landmarks. This is the licence-cleanest route and the most work.
3. **Hand-made for hero characters.** MetaHuman through the Unreal editor is free under $1 million revenue, cannot be used to train or test AI, and could not be confirmed as server-automatable. For heads only, KeenTools FaceBuilder makes a likeness head in Blender for about $16 a month.

Hair comes from a licensed groom library such as MetaHuman grooms exported as Alembic. It is recoloured to the user's choice, rendered as cards for web and real time and as strands for offline Blender renders, with Blender 5.2's experimental hair dynamics if needed. Outfits are Marvelous Designer or CLO garments, exported as glTF or Alembic, fitted to the MHR or Anny body, simulated in Blender offline or in Unreal Chaos Cloth live.

Rendering runs headless in Blender on a cloud GPU for film output, and in three.js for live browser scenes, using three-vrm for rigs and Spark for any splats. The face can be driven live from a webcam: MediaPipe's 52 expression scores map straight onto the ARKit-named morph targets.

This is the base for the simulation company. The character is a rigged, permissioned asset inside a scene description, and that scene can be rendered to film today and run live tomorrow. The trade-off is likeness: a mesh avatar looks less photoreal than AI video. The photoreal Gaussian heads (LAM) are blocked by non-commercial weights, and the full-body Gaussian model (LHM) by SMPL-X. Revisit both, either as licensing deals or as your own training on gsplat with clean data.

### Route 3: the hybrid, and the destination

The hybrid splits the work. 3D owns everything that must be exact: where the character stands, the camera, the lights, the pose, the outfit's silhouette and timing. AI owns the skin: a photoreal face, hair texture and cloth detail, conditioned on the user's verified references.

In practice:

1. The director builds the shot as a 3D scene, the same "shot package" your PRD describes, and renders its first frame, and its last frame where useful, in Blender or three.js.
2. A multi-reference image model restyles that render into a photoreal keyframe, using the user's face references and the render as the composition.
3. A video model animates from that keyframe. Veo 3.1 offers last-frame control, and Kling takes start and end images.
4. The verifier checks identity, outfit and motion against the shot package. The 3D scene is the ground truth for pose and camera, which is exactly the role Look Lab's measuring could play.

Nothing in the research measures how faithfully video models keep 3D blocking, so this route must be proven with your own tests. One licence nuance: Epic allows MetaHuman characters "in workflows that incorporate artificial intelligence technology", but not to "train or test" AI. So conditioning a video model on a MetaHuman render is allowed, while training a LoRA on MetaHuman renders is not ([metahuman.com/license](https://www.metahuman.com/en-US/license)). Live restyling services hint at where the hybrid ends up for simulation: Decart's Lucy2 restyles outfits on live video at $0.02 per second ([fal](https://fal.ai/models/decart/lucy2-vton/realtime)), and Runway lists real-time avatars at $0.02 up front plus $0.02 per 6 seconds ([Runway API pricing](https://docs.dev.runwayml.com/guides/pricing/)).

### What to build first

Build in the order below. Run the DPIA and the lawyer questions in parallel with steps 1–3. Until both are done, the only faces in the system should be yours and those of crew who have consented, which matches your PRD's rule.

| Order | Build | Why it comes first | Running cost as read |
|---|---|---|---|
| 1 | The character record: an append-only consent ledger (user, timestamp, notice-version hash, purposes, providers, countries, method, app version); GLB plus JSON sidecar format with VRM permission flags; deletion that propagates to providers | Every route, the verifier and every legal duty read from it | Storage only |
| 2 | Browser capture: age gate, consent screen, MediaPipe-guided video, AWS Face Liveness, reference image, matching of uploads, celebrity screen | It creates the only trustworthy input | $0.015 per signup, $0.001 per photo |
| 3 | Verifier v0: AuraFace or CompareFaces with per-shot minimum and median scores; the "every face is consented" check; hair-colour and garment-colour checks; C2PA signing at export | Without it, nothing can run unattended | About $0.001 per checked frame |
| 4 | A provider adapter for image, try-on and video models, with fallbacks for refusals | Model IDs disappear every few months | — |
| 5 | Route 1 end to end on a balanced test set (skin tones, ages, coily hair and locs, head coverings, sarees and salwar kameez) | First shippable product, and it measures the real cost per film | About $0.56 per character; $10–60 per 30-second film |
| 6 | Route 2: one GLB character (vendor or MHR/Anny fit), a small groom and garment library, a three.js live preview driven by the webcam | The base for the simulation goal | $0–800 a month |
| 7 | Route 3 experiments: a 3D blocking render, an identity-locked keyframe, then video, verified against the scene | The destination, and the least proven | Per-shot costs as in Route 1 |

## Conclusion

The research changes where the value sits. The pixels are rented, and the rentals are unstable: Ready Player Me, Union Avatars, the Sora API, Gemini 2.5 Flash Image and Kling's try-on on fal all disappeared or were deprecated within roughly eighteen months. What lasts is the asset no vendor provides: a consented, verified, portable character record, plus a verifier that can prove every frame matches it. Your agent's architecture already has a slot for both, in its memory and its "consent for faces" check. They should be built before the first generation call, not after.

The open-source research world is no shortcut. Its foundations (InsightFace, FLAME, SMPL-X, VITON-HD and the splatting rasteriser) are non-commercial, so "open" rarely means shippable. The licence-clean kit is small but sufficient for the layer you most need to own, the 3D and simulation layer. That kit is MediaPipe, MHR, Anny, FLAME 2023 Open, gsplat, Spark, three-vrm, GarmentCode, Wan 2.2, Qwen-Image-Edit, FLUX.2 klein 4B and AuraFace. Two findings should shape the roadmap more than any price. First, the safety check that makes the product defensible, "only your own verified face", is the very thing that turns it into biometric processing, so consent, a DPIA and deletion are launch requirements, not polish. Second, the tools fail hardest on darker skin, coily hair, head coverings and South Asian clothing. For a company serving India and global users, a balanced in-house test set is a product requirement, and pattern-made 3D garments and curated groom libraries may serve those users better than any 2D model available today.

## Appendix: source register

This register lists every source cited in the six research notes behind this report (561 unique links), so each one stays traceable even where the report body does not quote it. Sources are grouped by the note in which they first appear. The qualifier column repeats how the notes marked each source: "search summary" means the fact came from a search engine's summary rather than a full read, "secondary" means a news, reseller, aggregator or competitor source, "unverified" means the notes could not confirm it, and "page did not load in full" means the fetch returned an error such as 403 or 404. A dash means the notes gave no qualifier. The qualifier is matched from the note's text around each link, so check the note itself before relying on a borderline source. "In body" marks sources also cited in the report above. All pages were read on 14 October 2026.


### Capture, liveness and ownership checks (`research_notes/Face scan to styled character/capture_and_liveness.md`, 55 sources)

| Source | Notes' qualifier | In body |
|---|---|---|
| [Apple ARFaceTrackingConfiguration](https://developer.apple.com/documentation/arkit/arfacetrackingconfiguration) | — | yes |
| [Apple ARFaceAnchor](https://developer.apple.com/documentation/arkit/arfaceanchor) | — | yes |
| [Apple ARFaceGeometry](https://developer.apple.com/documentation/arkit/arfacegeometry) | — |  |
| [Apple ARFaceAnchor.blendShapes](https://developer.apple.com/documentation/arkit/arfaceanchor/blendshapes) | — |  |
| [Apple ARFaceAnchor.BlendShapeLocation](https://developer.apple.com/documentation/arkit/arfaceanchor/blendshapelocation) | — | yes |
| [Apple ARFrame.capturedDepthData](https://developer.apple.com/documentation/arkit/arframe/captureddepthdata) | — | yes |
| [Apple builtInTrueDepthCamera](https://developer.apple.com/documentation/avfoundation/avcapturedevice/devicetype-swift.struct/builtintruedepthcamera) | — |  |
| [Apple AVDepthData](https://developer.apple.com/documentation/avfoundation/avdepthdata) | — |  |
| [Apple Support 102854](https://support.apple.com/en-us/102854) | — | yes |
| [Apple, Capturing photographs for RealityKit Object Capture](https://developer.apple.com/documentation/realitykit/capturing-photographs-for-realitykit-object-capture) | — | yes |
| [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) | — | yes |
| [Apple Developer Program License Agreement (Schedule 1 last updated October 13, 2026)](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/) | — | yes |
| [Apple, Verifying Device Support and User Permission](https://developer.apple.com/documentation/arkit/verifying-device-support-and-user-permission) | — |  |
| [ARCore Augmented Faces overview](https://developers.google.com/ar/develop/augmented-faces) | — | yes |
| [ARCore Augmented Faces developer guide (Android)](https://developers.google.com/ar/develop/java/augmented-faces/developer-guide) | — |  |
| [ARCore Depth developer guide](https://developers.google.com/ar/develop/java/depth/developer-guide) | — |  |
| [r/Arcore thread (2022)](https://redlib.ssps.io/r/Arcore/comments/rznkzf/how_to_depth_api_with_selfie_camera) | unofficial | yes |
| [MediaPipe Face Landmarker guide](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker) | — | yes |
| [google-ai-edge/mediapipe LICENSE](https://raw.githubusercontent.com/google-ai-edge/mediapipe/master/LICENSE) | — | yes |
| [MediaPipe Face Mesh V2 model card (PDF)](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Face%20Mesh%20V2.pdf) | — | yes |
| [MediaPipe Blendshape V2 model card (PDF)](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Blendshape%20V2.pdf) | — |  |
| [MDN getUserMedia (mdn/content source)](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/mediadevices/getusermedia/index.md) | — | yes |
| [Apple Support 118496, Set up your Persona](https://support.apple.com/en-us/118496) | — | yes |
| [MacRumors Persona tips](https://macrumors.com/guide/vision-pro-persona-tips) | secondary | yes |
| [iMore](https://www.imore.com/vision-pro/how-to-create-a-persona-on-apple-vision-pro) | secondary |  |
| [arXiv 2410.24223](https://arxiv.org/abs/2410.24223) | — | yes |
| [arXiv 2504.09671 (via search summary)](https://arxiv.org/abs/2504.09671v1) | search summary |  |
| [CVF Open Access](https://openaccess.thecvf.com/content/CVPR2025/html/Zhang_HRAvatar_High-Quality_and_Relightable_Gaussian_Head_Avatar_CVPR_2025_paper.html) | — |  |
| [KIRI Engine Basic vs Pro](https://www.kiriengine.app/blog/kiri-engine-basic-vs-pro) | — |  |
| [3dprintingservices.com head-scan guide](https://3dprintingservices.com/blog/how-to-scan-and-3d-print-your-head-for-free-using-just-your-phone/) | — |  |
| [InstantID GitHub](https://github.com/instantX-research/InstantID) | — | yes |
| [aigc3d/LAM README](https://github.com/aigc3d/LAM) | — | yes |
| [LAM LICENSE_WEIGHT](https://raw.githubusercontent.com/aigc3d/LAM/master/LICENSE_WEIGHT) | — | yes |
| [FLAME model licence page](https://flame.is.tue.mpg.de/modellicense.html) | — | yes |
| [Higgsfield blog: Soul ID character consistency](https://higgsfield.ai/blog/sould-id-best-character-consistency) | search summary | yes |
| [geo.higgsfield.ai Soul ID page](https://geo.higgsfield.ai/blog/higgsfield-soul-id-character-consistency-ai-videos) | search summary |  |
| [iBeta ISO 30107-3 PAD confirmation letters](https://www.ibeta.com/iso-30107-3-presentation-attack-detection-confirmation-letters/) | — | yes |
| [AWS Face Liveness docs](https://docs.aws.amazon.com/rekognition/latest/dg/face-liveness.html) | — | yes |
| [AWS Rekognition pricing](https://aws.amazon.com/rekognition/pricing/) | — | yes |
| [Microsoft Learn: Face liveness detection](https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/concept-face-liveness-detection) | — | yes |
| [Azure Retail Prices API query, productName contains 'Face', eastus](https://prices.azure.com/api/retail/prices) | — | yes |
| [Azure Face pricing page](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/face-api/) | — |  |
| [Veriff pricing](https://www.veriff.com/pricing) | — | yes |
| [FaceTec pricing (via search summary)](https://www.facetec.com/pricing) | search summary | yes |
| [Sora 2 System Card PDF](https://cdn.openai.com/pdf/50d5973c-c4ff-4c2d-986f-c72b5d0ff069/sora_2_system_card.pdf) | — | yes |
| [VentureBeat](https://venturebeat.com/ai/openai-debuts-sora-2-ai-video-generator-app-with-sound-and-self-insertion) | search summary, page did not load in full, secondary | yes |
| [TechRadar](https://www.techradar.com/ai-platforms-assistants/i-tried-sora-2-i-love-it-and-its-about-to-ruin-everything) | search summary, page did not load in full, secondary | yes |
| [The Neuron](https://www.theneuron.ai/explainer-articles/your-complete-guide-to-ai-video-memes-and-mayhem-with-openais-sora-2) | search summary, page did not load in full, secondary |  |
| [lilys.ai guide](https://lilys.ai/en/notes/how-to-use-sora-20251021/use-cameo-in-sora-two-guide) | search summary, page did not load in full, secondary | yes |
| [OpenAI community forum](https://community.openai.com/t/sora-2-api-are-the-cameo-features-coming-to-the-api/1361267) | secondary |  |
| [The Decoder](https://the-decoder.com/openai-sets-two-stage-sora-shutdown-with-app-closing-april-2026-and-api-following-in-september/) | — | yes |
| [geo.higgsfield.ai face-data FAQ](https://geo.higgsfield.ai/is-higgsfield-ai-safe-for-face-data-faq) | low reliability | yes |
| [Higgsfield privacy policy (archived version dated 7 Aug 2026)](https://higgsfield.ai/privacy-policy-23-07-2026) | low reliability |  |
| [AWS Recognizing celebrities](https://docs.aws.amazon.com/rekognition/latest/dg/celebrities.html) | — | yes |
| [Veriff plans description (via search summary)](https://help.veriff.com/en/articles/10853865-veriff-plans-description) | search summary |  |

### Identity in images and video, verification and provenance (`research_notes/Face scan to styled character/identity_preserving_generation.md`, 84 sources)

| Source | Notes' qualifier | In body |
|---|---|---|
| [BFL non-commercial licence](https://bfl.ai/legal/non-commercial-license-terms) | — | yes |
| [BFL Help: Self-serve dev license overview & pricing](https://help.bfl.ai/articles/9272590838-self-serve-dev-license-overview-pricing) | search summary | yes |
| [BFL pricing](https://bfl.ai/pricing) | — |  |
| [Replicate FLUX.1 dev readme](https://replicate.com/black-forest-labs/flux-dev/readme) | — | yes |
| [HF FLUX.1-schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell) | — | yes |
| [HF FLUX.1-Kontext-dev](https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev) | — | yes |
| [BFL Help: run or fine-tune FLUX.2 klein locally](https://help.bfl.ai/articles/7108141705-can-i-run-or-fine-tune-flux-2-klein-locally) | search summary |  |
| [HF FLUX.2-klein-4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B) | search summary | yes |
| [invideo blog](https://invideo.io/blog/flux-ai-image-generator/) | secondary |  |
| [fal FLUX LoRA fast training](https://fal.ai/models/fal-ai/flux-lora-fast-training) | — | yes |
| [fal FLUX Kontext trainer](https://fal.ai/models/fal-ai/flux-kontext-trainer) | — |  |
| [Replicate changelog 2025-05-23](https://replicate.com/changelog/2025-05-23-faster-flux-trainer) | search summary | yes |
| [Replicate blog: fine-tune FLUX](https://frontend.replicate.com/blog/fine-tune-flux) | search summary |  |
| [fal Wan 2.2 image trainer](https://fal.ai/models/fal-ai/wan-22-image-trainer) | search summary |  |
| [fal Wan 2.2 T2V trainer](https://fal.ai/models/fal-ai/wan-22-trainer/t2v-a14b) | search summary | yes |
| [fal Wan 2.2 I2V trainer](https://fal.ai/models/fal-ai/wan-22-trainer/i2v-a14b) | search summary | yes |
| [fal Wan 2.1 trainer](https://fal.ai/models/fal-ai/wan-trainer/llms.txt) | search summary | yes |
| [HF Wan2.2-I2V-A14B](https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B) | — | yes |
| [howaiworks: Wan open weights stopped at 2.2](https://howaiworks.ai/blog/alibaba-wan-open-weights-stopped-at-2-2) | secondary | yes |
| [HF HunyuanVideo commit](https://huggingface.co/tencent/HunyuanVideo/commit/a4ed25a99d7eb9cf21e12f5fd8052d266f2105fc) | — | yes |
| [DeepWiki HunyuanVideo license](https://deepwiki.com/Tencent/HunyuanVideo/5-license-and-legal) | — |  |
| [HF Qwen-Image-Edit-2511](https://huggingface.co/Qwen/Qwen-Image-Edit-2511) | — | yes |
| [InsightFace GitHub](https://github.com/deepinsight/insightface) | — | yes |
| [InsightFace licensing](https://www.insightface.ai/solutions/face-recognition-licensing) | — | yes |
| [HF IP-Adapter-FaceID](https://huggingface.co/h94/IP-Adapter-FaceID) | — | yes |
| [HF ByteDance/InfiniteYou](https://huggingface.co/ByteDance/InfiniteYou) | — | yes |
| [HF InfiniteYou discussion #13](https://huggingface.co/ByteDance/InfiniteYou/discussions/13) | search summary |  |
| [HF InstantID discussion #2](https://huggingface.co/InstantX/InstantID/discussions/2) | — | yes |
| [PuLID GitHub](https://github.com/ToTheBeginning/PuLID) | — | yes |
| [comfy.icu PulidFluxInsightFaceLoader](https://comfy.icu/node/PulidFluxInsightFaceLoader) | secondary | yes |
| [HF fal/AuraFace-v1](https://huggingface.co/fal/AuraFace-v1) | — | yes |
| [arXiv 2509.15496](https://arxiv.org/pdf/2509.15496) | — |  |
| [arXiv 2508.07901](https://arxiv.org/html/2508.07901v3) | — |  |
| [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) | — | yes |
| [Gemini API image generation](https://ai.google.dev/gemini-api/docs/image-generation) | — | yes |
| [TechCrunch](https://techcrunch.com/2025/11/20/google-releases-nano-banana-pro-its-latest-image-generation-model) | search summary, secondary |  |
| [fal: nano banana pro vs 2](https://fal.ai/learn/tools/nano-banana-pro-vs-nano-banana-2) | — |  |
| [OpenAI API pricing](https://developers.openai.com/api/docs/pricing) | — | yes |
| [OpenAI image generation guide](https://developers.openai.com/api/docs/guides/image-generation) | — | yes |
| [Runway API pricing](https://docs.dev.runwayml.com/guides/pricing/) | — | yes |
| [The Rundown](https://www.therundown.ai/tools/seedream-4-5) | secondary | yes |
| [EvoLink](https://evolink.ai/seedream-4-5) | secondary |  |
| [BytePlus ModelArk Seedream 4.0](https://docs.byteplus.com/en/docs/ModelArk/1824718) | — | yes |
| [Gemini API Veo](https://ai.google.dev/gemini-api/docs/veo) | — | yes |
| [Vertex AI: generate videos from references](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/use-reference-images-to-guide-video-generation) | — |  |
| [Gemini API video](https://ai.google.dev/gemini-api/docs/video) | — | yes |
| [OpenAI video generation guide](https://developers.openai.com/api/docs/guides/video-generation) | — | yes |
| [TechCrunch 2026-03-24](https://techcrunch.com/2026/03/24/openais-sora-was-the-creepiest-app-on-your-phone-now-its-shutting-down/) | secondary |  |
| [TheStreet](https://www.thestreet.com/technology/openai-is-shutting-down-sora-and-the-disney-deal-is-off) | secondary |  |
| [techjournal (secondary)](https://techjournal.org/what-happened-to-sora-openai-shutdown) | secondary |  |
| [aifreeapi (secondary)](https://www.aifreeapi.com/en/posts/sora-2-cameo-yourself-tutorial) | secondary, page did not load in full |  |
| [OpenAI Help (403)](https://help.openai.com/en/articles/12435986-generating-content-with-cameos) | page did not load in full, secondary |  |
| [Kling API pricing](https://kling.ai/dev/pricing) | — | yes |
| [fal Kling O1 reference-to-video](https://fal.ai/models/fal-ai/kling-video/o1/reference-to-video) | — | yes |
| [fal Kling 3](https://fal.ai/kling-3) | search summary |  |
| [ConductAtlas Kling privacy record](https://conductatlas.com/platform/kling-ai/kling-ai-privacy-policy/provision/CA-P-077887/no-facial-recognition-or-individual-identification/) | secondary |  |
| [ConductAtlas Runway usage policy](https://conductatlas.com/platform/runway/runway-usage-policy/prohibition-on-real-person-likeness-without-permission/) | secondary, page did not load in full | yes |
| [ConductAtlas content policy](https://conductatlas.com/platform/runway/runway-content-policy/prohibition-on-unauthorized-use-of-another-persons-likeness/) | secondary, page did not load in full |  |
| [fal Seedance 2.0 reference-to-video](https://fal.ai/models/bytedance/seedance-2.0/reference-to-video) | search summary | yes |
| [fal Seedance 2.5 reference-to-video](https://fal.ai/models/bytedance/seedance-2.5/reference-to-video) | search summary |  |
| [cellcog (secondary)](https://cellcog.ai/blog/seedance-2-5-pricing/) | secondary, search summary |  |
| [TechNode](https://technode.com/2026/02/10/bytedance-suspends-seedance-2-0-feature-that-turns-facial-photos-into-personal-voices-over-potential-risks/) | — |  |
| [Phemex news (secondary)](https://phemex.com/news/article/bytedance-relaunches-seedance-20-globally-with-restrictions-on-realface-uploads-68605) | secondary |  |
| [seedrouter (secondary)](https://seedrouter.ai/blog/seedance-real-person-error) | secondary | yes |
| [ruoqijin (secondary)](https://ruoqijin.com/blog/seedance-access-and-face-policy) | secondary |  |
| [MiniMax API docs S2V](https://platform.minimax.io/docs/api-reference/video-generation-s2v) | — | yes |
| [Hailuo on X](https://x.com/Hailuo_AI/status/1877393578818941298) | — |  |
| [EachLabs](https://www.eachlabs.ai/minimax/sv2/minimax-s2v-01) | secondary | yes |
| [OminiGate](https://ominigate.ai/en/models/minimax/s2v-01) | secondary |  |
| [SCMP](https://www.scmp.com/tech/tech-trends/article/3362951/chinas-minimax-curbs-overseas-access-new-ai-video-model-over-copyright-disputes) | secondary |  |
| [fal Vidu Q2 reference-to-video](https://fal.ai/models/fal-ai/vidu/q2/reference-to-video) | — | yes |
| [Higgsfield blog](https://higgsfield.ai/blog/Soul-ID-AI-Character-Consistency) | — |  |
| [Creatify (secondary)](https://creatify.ai/blog/higgsfield-soul-prompts-for-product-ads) | secondary, unverified | yes |
| [cliprise (secondary)](https://www.cliprise.app/news/alibaba-wan-2-2-2-6) | secondary |  |
| [CodeFormer GitHub](https://github.com/sczhou/CodeFormer) | — |  |
| [CodeFormer LICENSE](https://raw.githubusercontent.com/sczhou/CodeFormer/master/LICENSE) | — | yes |
| [GFPGAN GitHub](https://github.com/TencentARC/GFPGAN) | — | yes |
| [FaceFusion GitHub](https://github.com/facefusion/facefusion) | — |  |
| [HF blog: AuraFace](https://huggingface.co/blog/isidentical/auraface) | — | yes |
| [LocalAI face recognition docs](https://localai.io/docs/features/face-recognition/) | secondary | yes |
| [Promptyze (secondary)](https://promptyze.com/nano-banana-2-stamps-every-image-with-synthid-and-c2pa-heres-what-that-actually-means/) | secondary | yes |
| [OpenAI Help 8912793](https://help.openai.com/en/articles/8912793-c2pa-in-images) | search summary | yes |
| [Wikipedia: Content Credentials](https://en.wikipedia.org/wiki/Content_Credentials) | — | yes |
| [Layer3 Labs (secondary)](https://www.layer3labs.io/guides/synthid-explained) | secondary | yes |

### 3D heads, bodies, avatars and file formats (`research_notes/Face scan to styled character/head_and_avatar_reconstruction.md`, 105 sources)

| Source | Notes' qualifier | In body |
|---|---|---|
| [HF discussion, LAM-20K #2 (opened "Jun 8")](https://huggingface.co/3DAIGC/LAM-20K/discussions/2) | — |  |
| [SMPL-X model licence](https://smpl-x.is.tue.mpg.de/modellicense.html) | — | yes |
| [SMPL model licence](https://smpl.is.tue.mpg.de/modellicense.html) | — |  |
| [SMPL-Body licence](https://smpl.is.tue.mpg.de/license.html) | — | yes |
| [Meshcapade "The SMPL Model Licenses" (Notion), via search result](https://meshcapade.notion.site/The-SMPL-Model-Licenses-2144560e54388085af5eff111fcdf266) | search summary | yes |
| [GamesMarket, 19 Feb 2026](https://www.gamesmarket.global/epic-games-acquires-meshcapade-and-will-establish-a-presence-in-tubingen/) | — | yes |
| [LHM ICCV 2025 supplemental](https://openaccess.thecvf.com/content/ICCV2025/supplemental/Qiu_LHM_Large_Animatable_ICCV_2025_supplemental.pdf) | — |  |
| [PyPI mhr](https://pypi.org/project/mhr/) | — | yes |
| [MHR LICENSE via jsDelivr mirror](https://cdn.jsdelivr.net/gh/facebookresearch/MHR@main/LICENSE) | — |  |
| [arXiv 2511.15586](https://arxiv.org/abs/2511.15586v3) | — |  |
| [arXiv 2511.15586](https://arxiv.org/pdf/2511.15586) | — |  |
| [Anny LICENSE via jsDelivr mirror](https://cdn.jsdelivr.net/gh/naver/anny@main/LICENSE) | — | yes |
| [NAVER LABS Europe blog](https://europe.naverlabs.com/blog/anny-a-free-to-use-3d-human-parametric-model-for-all-ages/) | — |  |
| [arXiv 2511.03589](https://arxiv.org/html/2511.03589v2) | — | yes |
| [sam-3d-body README](https://github.com/facebookresearch/sam-3d-body) | — |  |
| [arXiv 2602.11693](https://arxiv.org/html/2602.11693v1) | — |  |
| [DECA README](https://github.com/yfeng95/DECA) | — | yes |
| [DECA LICENSE via jsDelivr mirror](https://cdn.jsdelivr.net/gh/yfeng95/DECA@master/LICENSE) | — |  |
| [EMOCA README](https://github.com/radekd91/emoca) | — | yes |
| [MICA LICENSE via jsDelivr mirror](https://cdn.jsdelivr.net/gh/Zielon/MICA@master/LICENSE) | — | yes |
| [MICA README](https://github.com/Zielon/MICA) | — |  |
| [SMIRK LICENSE via jsDelivr mirror](https://cdn.jsdelivr.net/gh/georgeretsi/smirk@main/LICENSE) | — |  |
| [SMIRK README](https://github.com/georgeretsi/smirk) | — | yes |
| [arXiv 2601.12770](https://arxiv.org/html/2601.12770) | — |  |
| [Inria Gaussian-Splatting LICENSE (HF mirror)](https://huggingface.co/spaces/yslan/GaussianAnything-AIGC3D/raw/a0896dd52a14e7ee5bdd71ff4c5aa0b6682ec79e/submodules/diff-surfel-rasterization/LICENSE.md) | — | yes |
| [Aalto repository record for gsplat paper](https://aaltodoc.aalto.fi/items/535d91f9-2595-49a4-bff6-47e1ad0cf9c3) | secondary | yes |
| [nvdiffrast LICENSE via jsDelivr mirror](https://cdn.jsdelivr.net/gh/NVlabs/nvdiffrast@main/LICENSE.txt) | — | yes |
| [GaussianAvatars README](https://github.com/ShenhanQian/GaussianAvatars) | — | yes |
| [GaussianAvatars LICENSE.md via jsDelivr mirror](https://cdn.jsdelivr.net/gh/ShenhanQian/GaussianAvatars@main/LICENSE.md) | — |  |
| [Gaussian-Head-Avatar README](https://github.com/YuelangX/Gaussian-Head-Avatar) | — | yes |
| [Gaussian-Head-Avatar LICENSE via jsDelivr mirror](https://cdn.jsdelivr.net/gh/YuelangX/Gaussian-Head-Avatar@main/LICENSE) | — |  |
| [GAGAvatar README](https://github.com/xg-chu/GAGAvatar) | — |  |
| [arXiv 2502.17796](https://arxiv.org/abs/2502.17796v2) | — |  |
| [LAM LICENSE_WEIGHT via jsDelivr mirror](https://cdn.jsdelivr.net/gh/aigc3d/LAM@master/LICENSE_WEIGHT) | — |  |
| [LAM LICENSE](https://cdn.jsdelivr.net/gh/aigc3d/LAM@master/LICENSE) | — |  |
| [HF API, 3DAIGC/LAM-20K](https://huggingface.co/api/models/3DAIGC/LAM-20K) | — |  |
| [arXiv 2412.10209](https://arxiv.org/html/2412.10209v2) | — | yes |
| [arXiv 2512.09162](https://arxiv.org/pdf/2512.09162) | — | yes |
| [BakedAvatar repo](https://github.com/buaavrcg/BakedAvatar) | search summary, secondary |  |
| [arXiv 2503.10625](https://arxiv.org/pdf/2503.10625) | — | yes |
| [LHM LICENSE](https://cdn.jsdelivr.net/gh/aigc3d/LHM@main/LICENSE) | — |  |
| [HF 3DAIGC/LHM](https://huggingface.co/3DAIGC/LHM/raw/main/README.md) | — |  |
| [LHM README via jsDelivr mirror](https://cdn.jsdelivr.net/gh/aigc3d/LHM@main/README.md) | — | yes |
| [npm registry](https://registry.npmjs.org/@sparkjsdev/spark/latest) | — |  |
| [Spark "New features in 2.0"](https://sparkjs.dev/docs/new-features-2.0/) | — | yes |
| [sparkjs.dev](https://sparkjs.dev/) | — | yes |
| [npm registry](https://registry.npmjs.org/@mkkellogg/gaussian-splats-3d/latest) | — |  |
| [metahuman.com/license](https://www.metahuman.com/en-US/license) | — | yes |
| [CG Channel, 4 Jun 2025](https://www.cgchannel.com/2025/06/you-can-now-sell-metahumans-or-use-them-in-unity-or-godot/) | — | yes |
| [Epic docs: From video footage](https://dev.epicgames.com/documentation/metahuman/from-video-footage) | — |  |
| [Create a MetaHuman Identity](https://dev.epicgames.com/documentation/metahuman/create-a-metahuman-identity-in-unreal-engine) | — |  |
| [Animation from depth data](https://dev.epicgames.com/documentation/metahuman/animation-from-depth-data) | — | yes |
| [Capture device requirements](https://dev.epicgames.com/documentation/metahuman/metahuman-animator-capture-device-requirements) | — | yes |
| [Depth capture guidelines](https://dev.epicgames.com/documentation/metahuman/metahuman-animator-depth-data-capture-guidelines-in-unreal-engine) | — |  |
| [gamedev.net](https://gamedev.net/news/1981-metahuman-creator-web-application-is-being-discontinued/) | secondary | yes |
| [shattered.io](https://shattered.io/epic-kills-metahuman-creator-web-app-2026/) | secondary |  |
| [StraySpark](https://www.strayspark.studio/blog/metahuman-2026-web-app-shutdown-migration-guide) | secondary | yes |
| [CG Channel, 17 Jul 2026](https://www.cgchannel.com/?p=177360) | — |  |
| [Digital Production, 22 Jul 2026](https://digitalproduction.com/2026/07/22/character-dna-goes-free/) | — | yes |
| [KeenTools FaceBuilder for Blender](https://keentools.io/products/facebuilder-for-blender) | — | yes |
| [CG Channel, 7 Jul 2026](https://www.cgchannel.com/2026/07/reallusion-releases-headshot-3-0/) | — | yes |
| [Reallusion Headshot page](https://www.reallusion.com/character-creator/headshot) | search summary, secondary |  |
| [creativeainews](https://www.creativeainews.com/blog/reallusion-headshot-3-ai-digital-double-character-creator-5/) | secondary |  |
| [Reallusion official content store](https://www.reallusion.com/contentstore/charactercreator-official.html) | — |  |
| [Reallusion forum print topic](https://forum.reallusion.com/PrintTopic335621.aspx) | — |  |
| [PocketGamer.biz, 22 Dec 2025](https://www.pocketgamer.biz/netflix-acquires-avatar-creation-platform-ready-player-me/) | — | yes |
| [Genies blog](https://genies.com/blog/ready-player-me-shutdown) | secondary |  |
| [Wikipedia: Ready Player Me](https://en.wikipedia.org/wiki/Ready_Player_Me) | — |  |
| [avaturn.me](https://avaturn.me/) | — | yes |
| [Avaturn docs overview](https://docs.avaturn.me/docs/integration/overview) | — | yes |
| [avaturn.me/pricing](https://avaturn.me/pricing) | — | yes |
| [avatarsdk.com/pricing-cloud](https://avatarsdk.com/pricing-cloud/) | — | yes |
| [avatarsdk.com/faq](https://avatarsdk.com/faq/) | — | yes |
| [Meta Avatars docs, load avatars](https://developers.meta.com/horizon/documentation/unity/meta-avatars-load-avatars/) | — | yes |
| [Meta Avatars SDK intro (Unreal)](https://developers.meta.com/horizon/documentation/unreal/as-avatars-sdk-intro/) | search summary, secondary |  |
| [Apple: Adding spatial Persona support to an activity](https://developer.apple.com/documentation/groupactivities/adding-spatial-persona-support-to-an-activity) | — | yes |
| [Apple Newsroom, Jun 2025](https://www.apple.com/newsroom/2025/06/visionos-26-introduces-powerful-new-spatial-experiences-for-apple-vision-pro/) | — |  |
| [Portugal Global, Jan 2026](https://www.portugalglobal.pt/en/news/2026/janeiro/didimo-has-built-its-growth-on-the-gaming-industry) | — |  |
| [AWN](https://awn.com/news/didimo-announces-715m-funding-expand-3d-avatar-production-system) | — |  |
| [Avatar SDK blog, 7 Jul 2026](https://avatarsdk.com/blog/2026/07/07/union-avatars-shut-down/) | secondary | yes |
| [Techjockey](https://www.techjockey.com/us/detail/in3d) | secondary |  |
| [itechguides](https://www.itechguides.com/products/in3d/) | secondary |  |
| [Genies support (403)](https://support.genies.com/hc/en-us/articles/41138810194324) | page did not load in full, search summary |  |
| [Genies developer roadmap, Mar 2026](https://genies.com/blog/genies-developer-roadmap-what-to-expect-and-how-you-can-help-shape-it) | search summary, page did not load in full |  |
| [HF API TRELLIS-image-large](https://huggingface.co/api/models/microsoft/TRELLIS-image-large) | — | yes |
| [HF API TRELLIS.2-4B](https://huggingface.co/api/models/microsoft/TRELLIS.2-4B) | — |  |
| [TRELLIS.2 LICENSE via jsDelivr mirror](https://cdn.jsdelivr.net/gh/microsoft/TRELLIS.2@main/LICENSE) | — |  |
| [microsoft/TRELLIS #298](https://github.com/microsoft/TRELLIS/issues/298) | — | yes |
| [Comfy blog](https://blog.comfy.org/p/trellis2-and-pixal3d-are-now-native) | — |  |
| [HF tencent/Hunyuan3D-2.1 LICENSE](https://huggingface.co/tencent/Hunyuan3D-2.1/resolve/main/LICENSE) | — | yes |
| [Windriver licence list](https://open.windriver.com/info/uni-license-list/licenses/tencent-hunyuan-3d-2.0-cla.html) | — |  |
| [SAM License via jsDelivr mirror](https://cdn.jsdelivr.net/gh/facebookresearch/sam-3d-body@main/LICENSE) | — | yes |
| [HF API facebook/sam-3d-body-dinov3](https://huggingface.co/api/models/facebook/sam-3d-body-dinov3) | — |  |
| [Meshy docs: Pricing & Credits](https://docs.meshy.ai/en/webapp/pricing) | — | yes |
| [meshy.ai/pricing (search snippet)](https://meshy.ai/pricing) | search summary |  |
| [hyper3d.ai/pricing](https://hyper3d.ai/pricing) | — | yes |
| [EmpirioLabs](https://empiriolabs.ai/models/hyper3d-gen2) | secondary |  |
| [Tripo billing docs](https://developers.tripo3d.com/en/docs/billing.md) | — |  |
| [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-hwlbvx7vubh7c) | — |  |
| [Tripo blog](https://www.tripo3d.ai/blog/what-3d-model-generation-api-can-convert-images-or-text-into) | unverified |  |
| [CostBench price history](https://costbench.com/software/ai-3d-generation/tripo-ai/price-history/) | secondary |  |
| [vrm.dev VRM-1.0 (Japanese page)](https://vrm.dev/en/vrm1/) | — | yes |
| [vrm.dev UniVRM meta](https://vrm.dev/en/univrm/meta/univrm_meta/) | — | yes |
| [npm registry](https://registry.npmjs.org/@pixiv/three-vrm/latest) | — | yes |
| [vrm.dev](https://vrm.dev/en/vrm/vrm_about/) | — |  |

### Hair (`research_notes/Face scan to styled character/hair.md`, 83 sources)

| Source | Notes' qualifier | In body |
|---|---|---|
| [HairFastGAN README](https://raw.githubusercontent.com/AIRI-Institute/HairFastGAN/main/README.md) | — | yes |
| [HairFastGAN LICENSE](https://raw.githubusercontent.com/AIRI-Institute/HairFastGAN/main/LICENSE) | — |  |
| [HairCLIP LICENSE](https://raw.githubusercontent.com/wty-ustc/HairCLIP/main/LICENSE) | — |  |
| [Barbershop LICENSE](https://raw.githubusercontent.com/ZPdesu/Barbershop/main/LICENSE) | — | yes |
| [Style-Your-Hair README](https://raw.githubusercontent.com/Taeu/Style-Your-Hair/main/README.md) | — | yes |
| [Stable-Hair README](https://raw.githubusercontent.com/Xiaojiu-z/Stable-Hair/main/README.md) | — | yes |
| [Stable-Hair LICENSE](https://raw.githubusercontent.com/Xiaojiu-z/Stable-Hair/main/LICENSE) | — |  |
| [arXiv 2507.07591](https://arxiv.org/abs/2507.07591) | — |  |
| [HairFusion README](https://raw.githubusercontent.com/cychungg/HairFusion/main/README.md) | — | yes |
| [arXiv 2408.16450](https://arxiv.org/abs/2408.16450) | — |  |
| [arXiv 2507.12758](https://arxiv.org/html/2507.12758v1) | search summary | yes |
| [arXiv 2606.12562](https://arxiv.org/abs/2606.12562) | — | yes |
| [arXiv 2606.25578](https://arxiv.org/abs/2606.25578) | — |  |
| [arXiv 2607.11281](https://arxiv.org/html/2607.11281) | search summary |  |
| [Qwen-Image-Edit README](https://huggingface.co/Qwen/Qwen-Image-Edit/raw/main/README.md) | — |  |
| [2509 README](https://huggingface.co/Qwen/Qwen-Image-Edit-2509/raw/main/README.md) | — |  |
| [Perfect Corp news](https://www.perfectcorp.com/business/news/HairBeardAPI) | — | yes |
| [Perfect AI API docs](https://app-cdn-01.perfectcorp.com/console/common/doc/ai-api/index.html) | search summary |  |
| [unit system](https://docs.perfectcorp.com/developers/unit_system) | page did not load in full, search summary |  |
| [Shopify listing](https://apps.shopify.com/youcam-makeup-official) | search summary |  |
| [Banuba](https://www.banuba.com/blog/banuba-tint-virtual-try-on-pricing-guide) | — | yes |
| [ModiFace](https://Modiface.com/products-hair.html) | search summary | yes |
| [Zyla](https://zylalabs.com/api-marketplace/tools/hairstyle+change+api/4208) | search summary, unverified |  |
| [eachlabs](https://www.eachlabs.ai/tr/eachlabs/eachlabs/change-haircut) | search summary, unverified |  |
| [dev.to](https://dev.to/ailabtools/how-to-develop-an-try-on-hairstyle-app-17g) | search summary, unverified |  |
| [arXiv 2608.28802 HTML](https://arxiv.org/html/2608.28802v1) | — | yes |
| [arXiv 2608.28802 abs](https://arxiv.org/abs/2608.28802) | — |  |
| [arXiv 2603.25728](https://arxiv.org/html/2603.25728v1) | search summary |  |
| [Perfect Corp blog](https://www.perfectcorp.com/consumer/blog/hair/i-used-gemini-to-change-my-hairstyle) | search summary |  |
| [IJERT](https://www.ijert.org/why-ai-gets-black-hair-wrong-documented-failure-modes-and-architectural-fixes-in-a-production-try-on-system-ijertv15is070651) | — | yes |
| [doi](https://doi.org/10.1145/3810417.3810425) | search summary, page did not load in full | yes |
| [MediaPipe Image Segmenter guide, last updated 2026-10-01](https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter) | search summary | yes |
| [Model card PDF](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20-%20Hair%20Segmentation.pdf) | — | yes |
| [Multiclass model card](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Multiclass%20Segmentation.pdf) | — |  |
| [FASHN](https://fashn.ai/blog/new-feature-preview-segmentation-free-mode) | search summary |  |
| [Epic docs](https://dev.epicgames.com/documentation/unreal-engine/groom-platform-support-in-unreal-engine) | — | yes |
| [Epic docs](https://dev.epicgames.com/documentation/en-us/unreal-engine/hair-rendering-and-simulation-in-unreal-engine) | — |  |
| [Epic LOD docs](https://dev.epicgames.com/documentation/unreal-engine/setting-up-level-of-detail-for-grooms-in-unreal-engine) | search summary |  |
| [Epic docs](https://dev.epicgames.com/documentation/en-us/unreal-engine/hair-card-generator-for-grooms-in-unreal-engine) | — |  |
| [MetaHuman requirements](https://dev.epicgames.com/documentation/metahuman/requirements-and-configuration-settings-for-metahumans-in-unreal-engine) | — | yes |
| [Epic docs](https://dev.epicgames.com/documentation/unreal-engine/groom-components-and-assets-in-unreal-engine) | search summary |  |
| [Blender 5.2 LTS manual](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/hair/index.html) | — | yes |
| [Yuksel project page](https://cemyuksel.com/research/hairmesh_rendering/) | — | yes |
| [MBZUAI record](https://irep.mbzuai.ac.ae/items/042f079d-4815-4160-ac21-34f2df9a4967) | search summary |  |
| [arXiv 2505.18805](https://arxiv.org/html/2505.18805v2) | — |  |
| [three.js forum](https://discourse.threejs.org/t/realistic-hair-fur-material-strands/88143) | search summary | yes |
| [WebHairSim README](https://raw.githubusercontent.com/SiTronXD/WebHairSim/main/README.md) | — |  |
| [NeuralHaircut README](https://raw.githubusercontent.com/Vanessik/NeuralHaircut/main/README.md) | — |  |
| [NeuralHaircut LICENSE](https://raw.githubusercontent.com/Vanessik/NeuralHaircut/main/LICENSE.txt) | — | yes |
| [GaussianHaircut README](https://raw.githubusercontent.com/eth-ait/GaussianHaircut/main/README.md) | — | yes |
| [arXiv 2409.14778](https://arxiv.org/abs/2409.14778) | — |  |
| [MonoHair README](https://raw.githubusercontent.com/KeyuWu-CS/MonoHair/master/readme.md) | — |  |
| [MonoHair LICENSE](https://raw.githubusercontent.com/KeyuWu-CS/MonoHair/master/LICENSE.txt) | — | yes |
| [HAAR README](https://raw.githubusercontent.com/Vanessik/HAAR/master/README.md) | — |  |
| [HAAR LICENSE](https://raw.githubusercontent.com/Vanessik/HAAR/master/LICENSE.txt) | — | yes |
| [perm README](https://raw.githubusercontent.com/c-he/perm/main/README.md) | — | yes |
| [perm LICENSE](https://raw.githubusercontent.com/c-he/perm/main/LICENSE) | — |  |
| [arXiv 2505.06166 HTML](https://arxiv.org/html/2505.06166v1) | — | yes |
| [CVPR paper](https://openaccess.thecvf.com/content/CVPR2025/papers/Rosu_DiffLocks_Generating_3D_Hair_from_a_Single_Image_using_Diffusion_CVPR_2025_paper.pdf) | — |  |
| [difflocks LICENSE](https://raw.githubusercontent.com/Meshcapade/difflocks/main/LICENSE) | — | yes |
| [Im2Haircut README](https://raw.githubusercontent.com/Vanessik/Im2Haircut/master/README.md) | — | yes |
| [arXiv 2509.01469](https://arxiv.org/abs/2509.01469) | — |  |
| [HairStep LICENSE](https://raw.githubusercontent.com/GAP-LAB-CUHK-SZ/HairStep/main/LICENSE) | — | yes |
| [arXiv 2502.06392](https://arxiv.org/abs/2502.06392) | — |  |
| [arXiv 2606.15238](https://arxiv.org/abs/2606.15238) | — |  |
| [arXiv 2608.13679](https://arxiv.org/abs/2608.13679) | — |  |
| [arXiv 2506.23072](https://arxiv.org/abs/2506.23072) | — |  |
| [arXiv 2604.02867](https://arxiv.org/html/2604.02867) | search summary |  |
| [arXiv 2604.03716](https://arxiv.org/pdf/2604.03716) | search summary |  |
| [arXiv 2509.07774](https://arxiv.org/pdf/2509.07774) | search summary |  |
| [Epic Fab docs](https://dev.epicgames.com/documentation/en-us/fab/licenses-and-pricing-in-fab) | — | yes |
| [UE forum](https://forums.unrealengine.com/t/ai-content-spam/1779534/3) | search summary |  |
| [Reallusion EULA](https://www.reallusion.com/Content/EULA/AP/EULA_AP.htm) | — | yes |
| [Reallusion forum](https://forum.reallusion.com/PrintTopic525669.aspx) | search summary, unverified |  |
| [Blender manual](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/simulation/hair_dynamics.html) | — | yes |
| [CG Channel](https://www.cgchannel.com/2026/07/blender-5-2-lts-is-here-discover-its-5-key-features/) | search summary |  |
| [Digital Production](https://digitalproduction.com/2026/07/21/blender-5-2-lts-lands-with-node-physics/) | search summary |  |
| [Epic docs](https://dev.epicgames.com/documentation/en-us/unreal-engine/enabling-physics-simulation-on-grooms-in-unreal-engine) | search summary |  |
| [hair physics overview](https://dev.epicgames.com/documentation/unreal-engine/hair-physics-in-unreal-engine---overview) | search summary |  |
| [Unreal tech blog](https://www.unrealengine.com/en-US/tech-blog/an-early-look-at-next-generation-real-time-hair-and-fur) | search summary |  |
| [arXiv 2410.11528](https://arxiv.org/html/2410.11528v1) | search summary | yes |
| [Microsoft Research](https://www.microsoft.com/en-us/research/publication/hairmony/) | search summary |  |
| [arXiv 2505.05376](https://arxiv.org/pdf/2505.05376) | search summary |  |

### Outfits, body shape and garments (`research_notes/Face scan to styled character/outfits.md`, 148 sources)

| Source | Notes' qualifier | In body |
|---|---|---|
| [IDM-VTON GitHub LICENSE.txt](https://raw.githubusercontent.com/yisol/IDM-VTON/main/LICENSE.txt) | — |  |
| [IDM-VTON README](https://raw.githubusercontent.com/yisol/IDM-VTON/main/README.md) | — | yes |
| [IDM-VTON HF API](https://huggingface.co/api/models/yisol/IDM-VTON) | — |  |
| [OOTDiffusion LICENSE](https://raw.githubusercontent.com/levihsu/OOTDiffusion/main/LICENSE) | — | yes |
| [OOTDiffusion README](https://raw.githubusercontent.com/levihsu/OOTDiffusion/main/README.md) | — |  |
| [OOTDiffusion HF API](https://huggingface.co/api/models/levihsu/OOTDiffusion) | — |  |
| [arXiv 2403.01779](https://arxiv.org/abs/2403.01779) | page did not load in full |  |
| [CatVTON README](https://raw.githubusercontent.com/Zheng-Chong/CatVTON/main/README.md) | — | yes |
| [CatVTON LICENSE](https://raw.githubusercontent.com/Zheng-Chong/CatVTON/main/LICENSE) | — |  |
| [CatVTON HF API](https://huggingface.co/api/models/zhengchong/CatVTON) | — |  |
| [StableVITON README](https://raw.githubusercontent.com/rlawjdghek/StableVITON/master/README.md) | — | yes |
| [StableVITON HF API](https://huggingface.co/api/models/rlawjdghek/StableVITON) | — |  |
| [Leffa LICENSE](https://raw.githubusercontent.com/franciszzj/Leffa/main/LICENSE) | — | yes |
| [Leffa HF card](https://huggingface.co/franciszzj/Leffa/raw/main/README.md) | — |  |
| [Leffa HF file tree](https://huggingface.co/api/models/franciszzj/Leffa/tree/main) | — |  |
| [VITON-HD README](https://raw.githubusercontent.com/shadow2496/VITON-HD/main/README.md) | — | yes |
| [Dress Code LICENCE](https://raw.githubusercontent.com/aimagelab/dress-code/main/LICENCE) | — | yes |
| [FitDiT README](https://raw.githubusercontent.com/BoyuanJiang/FitDiT/main/README.md) | — | yes |
| [FitDiT LICENSE](https://raw.githubusercontent.com/BoyuanJiang/FitDiT/main/LICENSE) | — |  |
| [arXiv 2411.10499](https://arxiv.org/abs/2411.10499) | — |  |
| [Any2anyTryon README](https://raw.githubusercontent.com/logn-2024/Any2anyTryon/main/README.md) | page did not load in full | yes |
| [Any2anyTryon HF API](https://huggingface.co/api/models/loooooong/Any2anyTryon) | page did not load in full |  |
| [FLUX.1-dev HF API](https://huggingface.co/api/models/black-forest-labs/FLUX.1-dev) | page did not load in full |  |
| [arXiv 2508.13632](https://arxiv.org/abs/2508.13632) | — |  |
| [OmniTry LICENSE](https://raw.githubusercontent.com/Kunbyte-AI/OmniTry/main/LICENSE) | — | yes |
| [OmniTry HF card](https://huggingface.co/Kunbyte/OmniTry/raw/main/README.md) | — |  |
| [arXiv 2508.13632 search summary of the paper](https://arxiv.org/pdf/2508.13632) | search summary, secondary |  |
| [FLUX.1-Fill-dev HF API](https://huggingface.co/api/models/black-forest-labs/FLUX.1-Fill-dev) | secondary |  |
| [arXiv 2603.11734 abstract](https://arxiv.org/abs/2603.11734) | — | yes |
| [arXiv 2603.11734 HTML](https://arxiv.org/html/2603.11734v2) | — |  |
| [arXiv 2604.19748 abstract](https://arxiv.org/abs/2604.19748) | — |  |
| [arXiv 2604.19748 HTML](https://arxiv.org/html/2604.19748) | — | yes |
| [arXiv 2607.21694](https://arxiv.org/abs/2607.21694) | — |  |
| [arXiv 2607.19923](https://arxiv.org/abs/2607.19923) | — | yes |
| [arXiv 2607.19923 HTML](https://arxiv.org/html/2607.19923) | — |  |
| [arXiv 2603.14153](https://arxiv.org/abs/2603.14153) | — | yes |
| [arXiv 2607.22924](https://arxiv.org/abs/2607.22924) | — |  |
| [arXiv 2604.08526](https://arxiv.org/abs/2604.08526) | — | yes |
| [arXiv 2606.12012](https://arxiv.org/abs/2606.12012) | — |  |
| [arXiv 2603.00947](https://arxiv.org/abs/2603.00947) | — |  |
| [arXiv listing query](https://export.arxiv.org/api/query?search_query=ti:%22try-on%22&sortBy=submittedDate&sortOrder=descending&max_results=60) | — |  |
| [FASHN API pricing](https://help.fashn.ai/plans-and-pricing/api-pricing) | — | yes |
| [FASHN docs (llms-full)](https://docs.fashn.ai/llms-full.txt) | — | yes |
| [FASHN changelog](https://fashn.ai/changelog/new-resolution-tiers-and-generation-mode-controls) | — | yes |
| [fal model page](https://fal.ai/models/fal-ai/kling/v1-5/kolors-virtual-try-on) | — | yes |
| [PricingSaaS](https://pricingsaas.com/companies/klingai) | unverified |  |
| [Atlas Cloud](https://www.atlascloud.ai/blog/tips/kling-ai-api-pricing) | unverified |  |
| [CometAPI](https://www.cometapi.com/models/kling/kling-virtual-try-on/) | secondary, unverified |  |
| [Vertex VTO docs](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/generate-virtual-try-on-images) | — | yes |
| [Google Cloud Agent Platform pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing) | — | yes |
| [Google blog](https://blog.google/products-and-platforms/products/shopping/google-shopping-ai-mode-virtual-try-on-update/) | — |  |
| [TechCrunch](https://techcrunch.com/2025/12/11/googles-ai-try-on-feature-for-clothes-now-works-with-just-a-selfie/) | — | yes |
| [Google blog](https://blog.google/products-and-platforms/products/shopping/studio-quality-digital-try-on/) | — |  |
| [CO/AI](https://getcoai.com/news/googles-doppl-app-creates-virtual-try-on-videos-from-any-outfit) | secondary, unverified |  |
| [fal page](https://fal.ai/models/fal-ai/flux-pro/v1/vto) | — | yes |
| [fal blog](https://fal.ai/learn/tools/best-virtual-try-on-apis-2026) | — |  |
| [image-apps-v2 page](https://fal.ai/models/fal-ai/image-apps-v2/virtual-try-on) | — | yes |
| [Perfect Corp blog](https://www.perfectcorp.com/business/blog/ai-clothes/virtual-try-on-api-pricing) | — | yes |
| [Botika pricing](https://botika.com/pricing) | — |  |
| [AlternativeTo](https://alternativeto.net/software/revery-ai/about/) | secondary |  |
| [Similarweb](https://www.similarweb.com/technology/revery/) | — |  |
| [OpenAI pricing](https://platform.openai.com/docs/pricing) | — |  |
| [nano-banana](https://fal.ai/models/fal-ai/nano-banana/edit) | — |  |
| [nano-banana-pro](https://fal.ai/models/fal-ai/nano-banana-pro/edit) | — |  |
| [nano-banana-2](https://fal.ai/models/fal-ai/nano-banana-2/edit) | — |  |
| [v4 edit](https://fal.ai/models/fal-ai/bytedance/seedream/v4/edit) | — |  |
| [v4.5 edit](https://fal.ai/models/fal-ai/bytedance/seedream/v4.5/edit) | — | yes |
| [fal page](https://fal.ai/models/fal-ai/qwen-image-edit-2511) | — | yes |
| [fal page](https://fal.ai/models/fal-ai/flux-pro/kontext/max/multi) | — |  |
| [fal page](https://fal.ai/models/fal-ai/flux-2-pro/edit) | — | yes |
| [gpt-image-1](https://fal.ai/models/fal-ai/gpt-image-1/edit-image) | — |  |
| [gpt-image-1.5](https://fal.ai/models/fal-ai/gpt-image-1.5/edit) | — |  |
| [Qwen-Image-Edit-2511 HF API 2511](https://huggingface.co/api/models/Qwen/Qwen-Image-Edit-2511) | — |  |
| [FLUX.1-Kontext-dev HF API](https://huggingface.co/api/models/black-forest-labs/FLUX.1-Kontext-dev) | — |  |
| [FLUX.2-dev HF API](https://huggingface.co/api/models/black-forest-labs/FLUX.2-dev) | — |  |
| [FLUX.2-klein-4B HF API klein-4B](https://huggingface.co/api/models/black-forest-labs/FLUX.2-klein-4B) | — |  |
| [FLUX.2-klein-9B HF API klein-9B](https://huggingface.co/api/models/black-forest-labs/FLUX.2-klein-9B) | — | yes |
| [DreamO HF API](https://huggingface.co/api/models/ByteDance/DreamO) | — |  |
| [arXiv 2603.14153 HTML](https://arxiv.org/html/2603.14153) | — | yes |
| [ViViD LICENSE](https://raw.githubusercontent.com/alibaba-yuanjing-aigclab/ViViD/main/LICENSE) | — | yes |
| [ViViD README](https://raw.githubusercontent.com/alibaba-yuanjing-aigclab/ViViD/main/README.md) | — |  |
| [ViViD HF API](https://huggingface.co/api/models/alibaba-yuanjing-aigclab/ViViD) | — |  |
| [arXiv 2501.11325](https://arxiv.org/abs/2501.11325) | — |  |
| [CatV2TON README](https://raw.githubusercontent.com/Zheng-Chong/CatV2TON/main/README.md) | — | yes |
| [CatV2TON HF API](https://huggingface.co/api/models/zhengchong/CatV2TON) | — |  |
| [Magic-TryOn README](https://raw.githubusercontent.com/vivoCameraResearch/Magic-TryOn/main/README.md) | — | yes |
| [MagicTryOn HF API](https://huggingface.co/api/models/LuckyLiGY/MagicTryOn) | — |  |
| [Wan2.2-I2V-A14B HF API](https://huggingface.co/api/models/Wan-AI/Wan2.2-I2V-A14B) | — |  |
| [arXiv 2606.08514](https://arxiv.org/abs/2606.08514) | — |  |
| [arXiv 2608.05745](https://arxiv.org/abs/2608.05745) | — |  |
| [arXiv 2609.39335](https://arxiv.org/abs/2609.39335) | — |  |
| [arXiv 2608.26714](https://arxiv.org/abs/2608.26714) | — |  |
| [arXiv 2604.27958](https://arxiv.org/abs/2604.27958) | — |  |
| [fal page](https://fal.ai/models/fal-ai/veo3.1/reference-to-video) | — | yes |
| [fal page](https://fal.ai/models/fal-ai/kling-video/o3/standard/reference-to-video) | — | yes |
| [fal page](https://fal.ai/models/fal-ai/kling-video/o1/video-to-video/reference) | — | yes |
| [fal page](https://fal.ai/models/fal-ai/vidu/q3/reference-to-video) | — | yes |
| [fal page](https://fal.ai/models/decart/lucy2-vton/realtime) | — | yes |
| [CG Channel](https://www.cgchannel.com/2026/08/clo-virtual-fashion-releases-marvelous-designer-2026-1/) | — | yes |
| [Digital Production](https://digitalproduction.com/2026/04/15/marvelous-designer-2026-0-adds-3d-pencil-and-lacing/) | — | yes |
| [MD support](https://support.marvelousdesigner.com/hc/en-us/articles/47358297616153-What-is-the-difference-between-Personal-and-Enterprise-License) | search summary | yes |
| [CLO support](https://support.clo3d.com/hc/en-us/articles/115012815487-How-much-does-CLO-cost) | search summary, unverified, page did not load in full | yes |
| [CLO support](https://support.clo3d.com/hc/en-us/articles/360051525034-glTF-2-0-GLTF-GLB-File) | search summary | yes |
| [Introduction](https://docs.blender.org/manual/en/latest/physics/cloth/introduction.html) | — | yes |
| [Shape](https://docs.blender.org/manual/en/latest/physics/cloth/settings/shape.html) | — |  |
| [Collisions](https://docs.blender.org/manual/en/latest/physics/cloth/settings/collisions.html) | — |  |
| [Cache](https://docs.blender.org/manual/en/latest/physics/cloth/settings/cache.html) | — |  |
| [Epic docs](https://dev.epicgames.com/documentation/unreal-engine/panel-cloth-editor-overview) | — | yes |
| [arXiv 2403.18816](https://arxiv.org/abs/2403.18816) | unverified, page did not load in full |  |
| [arXiv 2401.16465](https://arxiv.org/abs/2401.16465) | — |  |
| [DressCode README](https://raw.githubusercontent.com/IHe-KaiI/DressCode/main/README.md) | — |  |
| [arXiv 2412.17811](https://arxiv.org/abs/2412.17811) | — |  |
| [ChatGarment README](https://raw.githubusercontent.com/biansy000/ChatGarment/main/README.md) | — | yes |
| [arXiv 2412.03937](https://arxiv.org/abs/2412.03937) | — |  |
| [AIpparel-Code README](https://raw.githubusercontent.com/georgeNakayama/AIpparel-Code/master/README.md) | — |  |
| [GarmentCode LICENSE](https://raw.githubusercontent.com/maria-korosteleva/GarmentCode/main/LICENSE) | — | yes |
| [arXiv 2602.16502](https://arxiv.org/abs/2602.16502) | — | yes |
| [arXiv 2602.20700](https://arxiv.org/abs/2602.20700) | — |  |
| [arXiv 2601.09658](https://arxiv.org/abs/2601.09658) | — |  |
| [arXiv 2601.16672](https://arxiv.org/abs/2601.16672) | — |  |
| [arXiv 2607.29106](https://arxiv.org/abs/2607.29106) | — |  |
| [arXiv 2509.05030](https://arxiv.org/abs/2509.05030) | — |  |
| [arXiv 2605.20460](https://arxiv.org/abs/2605.20460) | — |  |
| [arXiv 2602.08020](https://arxiv.org/abs/2602.08020) | — |  |
| [smplify-x LICENSE](https://raw.githubusercontent.com/vchoutas/smplify-x/master/LICENSE) | — |  |
| [Meshcapade Avatar Tech](https://meshcapade.com/assets/avatar-tech) | search summary, unverified, page did not load in full |  |
| [anny LICENSE](https://raw.githubusercontent.com/naver/anny/main/LICENSE) | — |  |
| [anny README](https://raw.githubusercontent.com/naver/anny/main/README.md) | — | yes |
| [MHR LICENSE](https://raw.githubusercontent.com/facebookresearch/MHR/main/LICENSE) | — |  |
| [SMPLer-X LICENSE](https://raw.githubusercontent.com/caizhongang/SMPLer-X/main/LICENSE) | — | yes |
| [SMPLest-X LICENSE](https://raw.githubusercontent.com/wqyin/SMPLest-X/main/LICENSE.txt) | — |  |
| [alphaXiv 2501.09782](https://alphaxiv.org/abs/2501.09782) | — |  |
| [multi-hmr LICENSE](https://raw.githubusercontent.com/naver/multi-hmr/master/LICENSE.txt) | — |  |
| [4D-Humans](https://raw.githubusercontent.com/shubham-goel/4D-Humans/main/LICENSE.md) | — |  |
| [TRAM](https://raw.githubusercontent.com/yufu-wang/tram/main/LICENSE) | — |  |
| [sam-3d-body README](https://raw.githubusercontent.com/facebookresearch/sam-3d-body/main/README.md) | — |  |
| [SAM License](https://raw.githubusercontent.com/facebookresearch/sam-3d-body/main/LICENSE) | — |  |
| [3DBODY.TECH 2021](https://proc.3dbody.tech/papers/2021/2133smith.pdf) | — | yes |
| [3DLOOK](https://3dlook.ai/?p=41875) | — | yes |
| [Prism Labs](https://www.prismlabs.tech/white-papers/body-composition-dxa-alternative-2026) | — |  |
| [WKU IJESAB](https://digitalcommons.wku.edu/ijesab/vol2/iss17/127) | — |  |
| [Iowa State Digital Press](https://www.iastatedigitalpress.com/itaa/article/id/21680/) | — |  |
| [Bodygram developers](https://developers.bodygram.com/estimations/guide/) | — |  |
| [GDPR Art. 4](https://gdpr-info.eu/art-4-gdpr/) | — | yes |
| [arXiv 2608.29804](https://arxiv.org/abs/2608.29804) | — | yes |
| [arXiv 2609.13259](https://arxiv.org/abs/2609.13259) | — | yes |
| [arXiv 2603.07291](https://arxiv.org/abs/2603.07291) | — | yes |
| [DOAJ / IEEE Access](https://doaj.org/article/ee32e002e7ab46df90bccce0c9b31017) | search summary |  |

### Law, platform rules and safeguards (`research_notes/Face scan to styled character/privacy_law_and_safeguards.md`, 86 sources)

| Source | Notes' qualifier | In body |
|---|---|---|
| [GDPR Recital 51, gdpr-info.eu](https://gdpr-info.eu/recitals/no-51/) | — | yes |
| [GDPR Art. 9, gdpr-info.eu](https://gdpr-info.eu/art-9-gdpr/) | — | yes |
| [EDPB Guidelines 3/2019 PDF](https://www.edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_201903_video_devices_en.pdf) | search summary, secondary |  |
| [Eurosmart summary](https://www.eurosmart.com/?id=87&na=v) | search summary, secondary |  |
| [Stibbe](https://www.stibbe.com/publications-and-insights/digital-law-uptodate-edpb-guidelines-on-facial-recognition-in-the-area-of) | search summary | yes |
| [Taylor Wessing on AEPD](https://www.taylorwessing.com/de/global-data-hub/2023/november---facial-recognition-technology-biometrics-and-monitoring/spanish-supervisory-authoritys-approach-to-biometrics) | search summary |  |
| [WilmerHale (1 Dec 2025)](https://www.wilmerhale.com/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20251201-european-court-of-justice-to-review-challenge-to-eu-us-data-privacy-framework) | search summary | yes |
| [Streamlex DPF tracker](https://streamlex.eu/resources/dpf-developments-tracker/) | search summary |  |
| [IEU Monitoring, 28 Jun 2026](https://ieu-monitoring.com/editorial/microsoft-backs-eu-commission-in-eu-court-case-on-transatlantic-data-flows-and-privacy/1244467/) | search summary | yes |
| [Cuatrecasas](https://www.cuatrecasas.com/en/spain/intellectual-property/art/digital-omnibus-ai-has-been-published) | — | yes |
| [ICO, Key data protection concepts](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/key-data-protection-concepts/) | — | yes |
| [ICO, Biometric recognition](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/biometric-recognition/) | — | yes |
| [ICO, How do we process biometric data lawfully?](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/how-do-we-process-biometric-data-lawfully/) | — | yes |
| [ICO, How do we demonstrate compliance?](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/how-do-we-demonstrate-our-compliance-with-our-data-protection-obligations/) | — | yes |
| [ICO, How do we keep biometric data secure?](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/how-do-we-keep-biometric-data-secure/) | — | yes |
| [ICO biometric guidance hub](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/) | — | yes |
| [gov.uk commencement plan](https://www.gov.uk/guidance/data-use-and-access-act-2025-plans-for-commencement) | search summary | yes |
| [legislation.gov.uk SI 2026/82](https://legislation.gov.uk/uksi/2026/82) | search summary |  |
| [Bratby Law](https://bratby.law/data-use-and-access-act-2025-commencement/) | search summary |  |
| [Kennedys 2026](https://www.kennedyslaw.com/en/thought-leadership/article/2026/the-data-use-and-access-act-2025-commencement-dates-and-planned-guidance-for-2026) | search summary, page did not load in full |  |
| [Burges Salmon](https://www.burges-salmon.com/?p=15019) | search summary | yes |
| [Kennedys](https://kennedyslaw.com/en/thought-leadership/article/2025/the-uk-dua-act-s-reform-pillars-divergence-from-the-eu-gdpr-international-data-transfers) | search summary |  |
| [ICO transfers guide](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/a-guide-to-international-transfers/how-do-we-comply-with-the-transfer-rules-if-were-initiating-the-restricted-transfer) | search summary |  |
| [MoJ letter via committees.parliament.uk](https://committees.parliament.uk/publications/51181/documents/284050/default/) | search summary |  |
| [gov.uk press release](https://gov.uk/government/news/better-protection-for-victims-thanks-to-new-law-on-sexually-explicit-deepfakes) | search summary | yes |
| [Olliers](https://www.olliers.com/news/new-law-criminalises-deepfake-creation/) | search summary |  |
| [AI Act Art. 50](https://artificialintelligenceact.eu/article/50/) | — | yes |
| [Jones Day, Jun 2026](https://www.jonesday.com/en/insights/2026/06/european-commission-publishes-final-code-of-practice-on-marking-and-labelling-aigenerated-content) | — | yes |
| [search summary of SCL / Freevacy / Commission page](https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content) | search summary, secondary |  |
| [Gibson Dunn, 27 May 2026](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/) | — | yes |
| [AI Act Art. 5](https://artificialintelligenceact.eu/article/5/) | — | yes |
| [Davis Wright Tremaine (updated 20 Apr 2026)](https://www.dwt.com/blogs/privacy--security-law-blog/2024/08/illinois-bipa-biometrics-law-amended-for-damages) | — | yes |
| [Paul Hastings](https://www.paulhastings.com/insights/ph-privacy/7th-circuit-confirms-bipa-amendment-has-retroactive-application) | — | yes |
| [Tex. Bus. & Com. Code §503.001 (texas.public.law mirror)](https://texas.public.law/statutes/tex._bus._and_com._code_section_503.001) | — | yes |
| [RCW 19.375](https://app.leg.wa.gov/RCW/default.aspx?cite=19.375&full=true) | — | yes |
| [RCW 19.373.010](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373.010) | — | yes |
| [Sidley](https://datamatters.sidley.com/?p=4971) | search summary | yes |
| [Kelley Drye](https://www.kelleydrye.com/viewpoints/blogs/ad-law-access/my-health-my-data-washingtons-health-data-privacy-revolution) | search summary |  |
| [ACLU of Colorado](https://www.aclu-co.org/legislation/hb24-1130-privacy-biometric-identifiers-data-0/) | search summary | yes |
| [Digital Policy Alert](https://digitalpolicyalert.org/event/32355-act-amending-colorado-privacy-act-for-enhanced-biometric-data-protection-entered-into-force-bill-no-hb-24-1130) | search summary |  |
| [Captain Compliance](https://captaincompliance.com/education/colorados-biometrics-privacy-rules/) | search summary, low reliability |  |
| [DLA Piper, 30 Sep 2025](https://www.dlapiper.com/insights/publications/2025/09/ccpa-2025-updated-regulations) | search summary | yes |
| [Morgan Lewis, Jul 2026](https://www.morganlewis.com/pubs/2026/07/ccpa-risk-assessment-requirements-and-best-practices) | search summary |  |
| [Wiley](https://www.wiley.law/alert-May-19-Deadline-for-TAKE-IT-DOWN-Act-Compliance-Is-Your-Company-Prepared) | search summary | yes |
| [WilmerHale, 15 Jun 2026](https://wilmerhale.com/en/insights/client-alerts/20260615-the-take-it-down-act-goes-live) | search summary | yes |
| [FTC](https://www.ftc.gov/node/332132) | search summary |  |
| [Sen. Blackburn press release](https://www.blackburn.senate.gov/2026/6/blackburn-coons-bipartisan-bill-to-protect-individuals-and-creators-from-deepfakes-passes-senate-judiciary-committee) | search summary | yes |
| [Mondaq](https://www.mondaq.com/unitedstates/patent/1805904/senate-committee-advances-bill-to-protect-name-image-likeness-and-voice-against-unauthorized-ai-use) | search summary |  |
| [CMS](https://cms.law/en/gbr/publication/the-war-on-digital-replicas-the-no-fakes-act-advances) | search summary |  |
| [Foley](https://www.foley.com/p/102jk3d/california-governor-gavin-newsom-signs-two-ai-bills-to-protect-entertainment-indu/) | search summary | yes |
| [Hollywood Reporter](https://www.hollywoodreporter.com/business/business-news/gavin-newsom-signs-ai-bills-supported-sag-aftra-1236004935/) | search summary |  |
| [DWT, Mar 2025](https://www.dwt.com/insights/2025/03/state-laws-regulating-ai-in-entertainment-industry) | search summary | yes |
| [MSK](https://www.msk.com/newsroom-alerts-3114) | search summary | yes |
| [Deccan Herald](https://www.deccanherald.com/amp/story/india%2Fcentre-notifies-dpdp-rules-implementation-planned-in-phases-spread-over-12-18-months-3798465) | search summary | yes |
| [Mondaq](https://webiis08.mondaq.com/india/data-protection/1775140/from-draft-to-reality-key-changes-in-indias-dpdp-rules-2025) | search summary |  |
| [JSA Prism Nov 2025](https://www.jsalaw.com/?p=55573) | search summary |  |
| [dpdpa.com s.9](https://www.dpdpa.com/dpdpa2023/chapter-2/section9.html) | — | yes |
| [KS&K](https://ksandk.com/data-protection-and-data-privacy/childrens-data-protection-under-indias-dpdp-rules/) | search summary | yes |
| [dpdpa.com Rule 10](https://dpdpa.com/dpdparules/rule10.html) | unofficial | yes |
| [dpdpa.com s.16](https://www.dpdpa.com/dpdpa2023/chapter-4/section16.html) | unofficial | yes |
| [Hogan Lovells](https://www.hlc.com/en/publications/india-introduces-mandatory-labelling-for-ai-and-3hour-takedown-for-illegal-content) | — | yes |
| [Mondaq](https://mondaq.com/india/new-technology/1760554/it-rules-2026-deepfake-regulation-three-hour-takedowns-and-ai-labelling-obligations) | search summary, secondary | yes |
| [iPleaders](https://blog.ipleaders.in/it-rules-2026/) | search summary, secondary |  |
| [Euronews, 8 Oct 2026](https://www.euronews.com/2026/10/08/denmark-introduces-a-bill-protecting-peoples-faces-and-voices-from-deepfakes) | — | yes |
| [PPC Land](https://ppc.land/denmarks-deepfake-bill-makes-publishers-prove-consent-from-january-2027/) | search summary, secondary |  |
| [EU IP Helpdesk](https://intellectual-property-helpdesk.ec.europa.eu/news-events/news/denmarks-proposed-copyright-rules-deepfakes-2026-06-01_en) | search summary, secondary |  |
| [Loeb & Loeb](https://www.loeb.com/en/insights/publications/2025/03/chinas-ai-labeling-measures-and-mandatory-national-standards-take-effect-september-1) | search summary | yes |
| [Technology's Legal Edge](https://www.technologyslegaledge.com/2025/03/china-released-new-measures-for-labelling-ai-generated-and-synthetic-content/) | search summary |  |
| [Seers.ai](https://seers.ai/blogs/china-data-privacy-2-0-cross-border-consent-rules/) | search summary, low reliability | yes |
| [ComplianceHub](https://compliancehub.wiki/china-pipl-cross-border-certification-route-cybersecurity-law-penalties-2026/) | search summary, low reliability |  |
| [Kling privacy policy](https://kling.ai/docs/privacy-policy) | search summary | yes |
| [ConductAtlas on Kling ToS](https://conductatlas.com/platform/kling-ai/kling-ai-terms-of-service/) | search summary | yes |
| [CometAPI](https://www.cometapi.com/are-kling-videos-private/) | search summary |  |
| [CGTN (2018)](https://news.cgtn.com/news/33557a4e33597a6333566d54/index.html) | search summary |  |
| [Gizmodo AU](https://gizmodo.com.au/?p=1073510) | search summary |  |
| [iClarified, 9 Apr 2026](https://www.iclarified.com/entry/index.php?enid=9925) | search summary |  |
| [Google Play Console Help 14094294](https://support.google.com/googleplay/android-developer/answer/14094294) | — | yes |
| [TechCrunch, 6 Jun 2024](https://techcrunch.com/2024/06/06/google-play-cracks-down-on-ai-apps-after-circulation-of-apps-for-making-deepfake-nudes) | search summary | yes |
| [OpenAI Usage Policies](https://openai.com/policies/usage-policies/) | search summary, page did not load in full | yes |
| [Google Generative AI Prohibited Use Policy](https://policies.google.com/terms/generative-ai/use-policy) | — | yes |
| [Gemini API usage policies](https://ai.google.dev/gemini-api/docs/usage-policies?hl=ca) | search summary |  |
| [Google AI developer forum](https://discuss.ai.google.dev/t/request-allowlist-access-for-veo-3-1-person-generation-project-gen-lang-client-00201875/174711) | search summary |  |
| [Vertex AI Veo responsible AI](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/responsible-ai-and-usage-guidelines) | search summary |  |
| [fal.ai AUP](https://fal.ai/legal/acceptable-use-policy) | — | yes |
| [fal.ai Terms](https://fal.ai/terms) | search summary |  |
| [C2PA](https://c2pa.org/) | — | yes |
