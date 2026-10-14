# Capturing a user's own face (phone front camera, laptop webcam) and proving it is a live person who is the account holder: state as of October 2026

All sources were read on 2026-10-14 unless a citation says otherwise. "Unverified" means I could not confirm the claim from a primary source. Prices are list prices in USD as published on the date read.

## 1. Apple ARKit face tracking with the TrueDepth camera, and Apple's rules on face data

### Takeaway
ARKit gives a live, fixed-topology face mask (front of the face only), 52 expression coefficients, eye poses and, on TrueDepth phones only, a synchronized depth map. It works well for expressions and face shape but is not a full static head scan, because it has no hair, ears or back of the head. Apple's Developer Program License Agreement (DPLA, updated 13 Oct 2026) defines "Face Data" broadly, to include uploaded photos and Camera API data. It allows that data off the device only with "clear and conspicuous consent" and for a specific function. It forbids using Face Data "for authentication", which matters for any "is this the account holder" step built on ARKit or camera face data.

### Cited Findings
**What ARFaceAnchor / ARFaceGeometry give**
- `ARFaceTrackingConfiguration` "tracks facial movement and expressions using the front camera" and "detects faces within 3 meters of the device's front camera"; each detected face yields an `ARFaceAnchor` with "facial position, orientation, topology, and expressions". — [Apple ARFaceTrackingConfiguration, read 2026-10-14](https://developer.apple.com/documentation/arkit/arfacetrackingconfiguration)
- Device support: "Face tracking supports devices with Apple Neural Engine in iOS 14 and iPadOS 14 and requires a device with a TrueDepth camera on iOS 13 and iPadOS 13 and earlier." Apps must call `isSupported`. — [Apple ARFaceTrackingConfiguration, read 2026-10-14](https://developer.apple.com/documentation/arkit/arfacetrackingconfiguration)
- With light estimation on, face tracking "estimates directional and environmental lighting … by referring to the detected face as a light probe". This is useful metadata for relighting the captured face. — [Apple ARFaceTrackingConfiguration, read 2026-10-14](https://developer.apple.com/documentation/arkit/arfacetrackingconfiguration)
- ARFaceAnchor gives: a face transform in metres, with "the origin centered behind the face"; a `geometry` (ARFaceGeometry) that "conforms a generic face model to match the dimensions, shape, and current expression of the detected face"; `blendShapes`; `leftEyeTransform`, `rightEyeTransform`; and `lookAtPoint` (gaze). — [Apple ARFaceAnchor, read 2026-10-14](https://developer.apple.com/documentation/arkit/arfaceanchor)
- ARFaceGeometry is "a 3D mesh … appropriate for use with various rendering technologies or for exporting 3D assets". "Face mesh topology is constant across ARFaceGeometry instances": `vertexCount`, `textureCoordinateCount`, `triangleCount`, triangle indices and UVs never change; "Only the vertices buffer changes". A mesh can also be rebuilt from blend-shape coefficients with `init(blendShapes:)`. — [Apple ARFaceGeometry, read 2026-10-14](https://developer.apple.com/documentation/arkit/arfacegeometry)
- Blend shapes: each value runs "from 0.0 (neutral) to 1.0 (maximum movement)"; "the serialized form of a blend shapes dictionary is more portable than that of the face mesh". — [Apple ARFaceAnchor.blendShapes, read 2026-10-14](https://developer.apple.com/documentation/arkit/arfaceanchor/blendshapes)
- I counted 52 `BlendShapeLocation` constants (for example jawOpen, eyeBlinkLeft, cheekPuff, tongueOut) on Apple's BlendShapeLocation reference page. — [Apple ARFaceAnchor.BlendShapeLocation, read 2026-10-14](https://developer.apple.com/documentation/arkit/arfaceanchor/blendshapelocation)
- Depth in ARKit: `ARFrame.capturedDepthData` (an `AVDepthData`) is "available only in face-based experiences … using the device's front TrueDepth camera". It "can be nil", because the depth camera runs "at a different frame rate than the color camera". — [Apple ARFrame.capturedDepthData, read 2026-10-14](https://developer.apple.com/documentation/arkit/arframe/captureddepthdata)
- Depth through AVFoundation: `builtInTrueDepthCamera` is "two cameras, one Infrared and one YUV". The IR camera gives "high-quality depth information that's synchronized and perspective corrected" to the colour frame. Resolutions may differ, but "field of view and aspect ratio always match". — [Apple builtInTrueDepthCamera, read 2026-10-14](https://developer.apple.com/documentation/avfoundation/avcapturedevice/devicetype-swift.struct/builtintruedepthcamera)
- `AVDepthData` holds a depth map (metres) or a disparity map (1/m), with `cameraCalibrationData`. The maps are "nonrectilinear", so to "correlate points in 3D space" you must rectify them with the calibration data. Depth can be streamed (`AVCaptureDepthDataOutput`) or attached to a photo (`AVCapturePhotoOutput`). — [Apple AVDepthData, read 2026-10-14](https://developer.apple.com/documentation/avfoundation/avdepthdata)

**Which devices have TrueDepth (Face ID)**
- Apple's Face ID list (published 13 Oct 2026) names: iPhone X, XS, XS Max, XR; the 11, 12, 13, 14, 15 and 16 families (including 12/13 mini and the 16e); iPhone 17, 17 Pro, 17 Pro Max, iPhone Air, 17e; iPhone 18 Pro and 18 Pro Max. On iPad it names the iPad Pro 11-inch (1st–4th gen), 12.9-inch (3rd–6th gen), and the 11-inch and 13-inch M4 and M5 models. iPhone SE models are absent. — [Apple Support 102854, read 2026-10-14](https://support.apple.com/en-us/102854)

**Can it build a static 3D head?**
- Apple says the mesh is suitable "for exporting 3D assets" and describes it as "the detailed topology of a face". — [Apple ARFaceGeometry, read 2026-10-14](https://developer.apple.com/documentation/arkit/arfacegeometry)
- Apple's photogrammetry (Object Capture, iOS 17+/macOS 12+) says to "Choose objects that are static and won't bend or deform". A "soft, articulated, or bendable object … may cause Object Capture to fail or produce low-quality results". It also says to avoid "highly reflective, transparent, or translucent" or very smooth single-colour surfaces, to keep ≥70% overlap between adjacent shots (<50% "may fail"), and to avoid hard shadows and strong highlights. Images with depth data give real-world scale. — [Apple, Capturing photographs for RealityKit Object Capture, read 2026-10-14](https://developer.apple.com/documentation/realitykit/capturing-photographs-for-realitykit-object-capture)

**Apple's rules (exact wording)**
- App Store Review Guideline 5.1.2(vi): "Data gathered from the HomeKit API, HealthKit, Clinical Health Records API, MovementDisorder APIs, ClassKit or from depth and/or facial mapping tools (e.g. ARKit, Camera APIs, or Photo APIs) may not be used for marketing, advertising or use-based data mining, including by third parties." — [App Store Review Guidelines, read 2026-10-14](https://developer.apple.com/app-store/review/guidelines/)
- Guideline 5.1.2(i) (excerpt): "You must clearly disclose where personal data will be shared with third parties, including with third-party AI, and obtain explicit permission before doing so." 5.1.2(ii): "Data collected for one purpose may not be repurposed without further consent unless otherwise explicitly permitted by law." — [App Store Review Guidelines, read 2026-10-14](https://developer.apple.com/app-store/review/guidelines/)
- Guideline 2.5.13 (as summarized by the fetch tool): apps using facial recognition for account authentication "must use LocalAuthentication (and not ARKit or other facial recognition technology) where possible, and must use an alternate authentication method for users under 13 years old." — [App Store Review Guidelines, read 2026-10-14](https://developer.apple.com/app-store/review/guidelines/)
- DPLA §1.2 definition: "'Face Data' means information related to human faces (e.g., face mesh data, facial map data, face modeling data, facial coordinates or facial landmark data, including data from an uploaded photo) that is obtained from a user's device and/or through the use of the Apple Software (e.g., through ARKit, the Camera APIs, or the Photo APIs), or that is provided by a user in or through an Application (e.g., uploads for a facial analysis service)." — [Apple Developer Program License Agreement (Schedule 1 last updated October 13, 2026), read 2026-10-14](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)
- DPLA §3.3.3(K) "Face Data" (verbatim): "If Your Application accesses Face Data, then You must do so only to provide a service or function that is directly relevant to the use of the Application, and You agree to inform users of Your intended uses and disclosures of Face Data by Your Application and to obtain clear and conspicuous consent from such users before any collection or use of Face Data. Notwithstanding anything to the contrary in Section 3.3.3(B), neither You nor Your Application (nor any third party with whom You have contracted to serve advertising) may use Face Data for serving advertising or for any other unrelated purposes. In addition: You may not use Face Data in a manner that will violate the legal rights of Your users (or any third parties) or to provide an unlawful, unfair, misleading, fraudulent, improper, exploitative, or objectionable user experience and then only in accordance with the Documentation; You may not use Face Data for authentication, advertising, or marketing purposes, or to otherwise target an end user in a similar manner; You may not use Face Data to build a user profile, or otherwise attempt, facilitate, or encourage third parties to identify anonymous users or reconstruct user profiles based on Face Data; You agree not to transfer, share, sell, or otherwise provide Face Data to advertising platforms, analytics providers, data brokers, information resellers or other such parties; and Face Data may not be shared or transferred off the user's device unless You have obtained clear and conspicuous consent for the transfer and the Face Data is used only in fulfilling a specific service or function for Your Application (e.g., a face mesh is used to display an image of the user within the Application) and only in accordance with these terms and the Documentation. You agree to require that Your service providers use Face Data only to the limited extent consented to by the user and only in accordance with these terms." — [Apple DPLA, read 2026-10-14](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)
- ARKit docs: "Because face tracking provides your app with personal facial information, your app must include a privacy policy describing to users how you intend to use face tracking and face data." The app also needs an `NSCameraUsageDescription` string. — [Apple ARFaceTrackingConfiguration](https://developer.apple.com/documentation/arkit/arfacetrackingconfiguration); [Apple, Verifying Device Support and User Permission, read 2026-10-14](https://developer.apple.com/documentation/arkit/verifying-device-support-and-user-permission)

### Inferences
- ARKit is best used in this pipeline as a capture aid: live guidance (pose, distance, expression checks), a metric face-shape prior, 52 coefficients that drive an avatar, and colour frames plus TrueDepth depth for texturing and scale. Building a full head with hair still needs multi-view images or a learned head model (sections 4–5).
- The DPLA's "Face Data" covers any face-related data from the Camera or Photo APIs and any photos users upload, not only ARKit. Uploading a selfie or face scan to a cloud generator therefore needs explicit consent, naming the third-party AI (5.1.2(i)), and use limited to the stated feature.
- "You may not use Face Data for authentication" is a direct risk for an "is this the account holder" check built on ARKit or camera face data in an iOS app. Whether a third-party identity-verification or liveness SDK counts as "authentication" under the DPLA is a legal question; I found no Apple text that settles it. Get counsel's view, and design the check as one-time identity and consent verification for the likeness, not as login.
- Since iOS 14, A12+ devices without TrueDepth (for example iPhone SE) can run face tracking, but `capturedDepthData` is nil on them. Depth-dependent features must fall back gracefully.

### Gaps
- The ARFaceGeometry vertex count (widely quoted as 1,220) is not stated in Apple's docs, which expose it only as `vertexCount`. Unverified.
- Exact TrueDepth depth-map resolutions and frame rates (often quoted as 640×480 depth at lower fps than colour) were not confirmed from an Apple page. Unverified.
- No Apple statement specifically about building or exporting a persistent 3D likeness of a user for generative AI use, beyond the general Face Data terms.

## 2. Android equivalents: ARCore Augmented Faces and front-camera depth

### Takeaway
ARCore Augmented Faces gives a 468-point face mesh with a centre pose and three region poses from the front camera, on Android (Java/Kotlin, NDK), Unity, iOS and Unreal. I found no Google documentation of front-camera depth on Android. Treat Android selfie capture as RGB only plus a mesh inferred by ML.

### Cited Findings
- Augmented Faces provides a "468-point dense 3D face mesh", "region poses" at the left forehead, right forehead and tip of the nose, and a "center pose" behind the nose at the middle of the head. Platforms: Android (Kotlin/Java), Android NDK (C), Unity (AR Foundation), iOS, Unreal. Page last updated 2026-09-04. — [ARCore Augmented Faces overview, read 2026-10-14](https://developers.google.com/ar/develop/augmented-faces)
- Setup: "select the front camera and enable AugmentedFaceMode" (`MESH3D`). "Note that selecting the front camera will cause a number of changes in ARCore behavior." Each frame gives mesh vertices, normals, centre and region poses; UVs and indices "do not change during the session". "ARCore's face detection works best on upright faces, relative to gravity." Page last updated 2024-10-31. — [ARCore Augmented Faces developer guide (Android), read 2026-10-14](https://developers.google.com/ar/develop/java/augmented-faces/developer-guide)
- The ARCore Depth API does not require a time-of-flight sensor ("depth is largely computed from motion") and must be checked at runtime with `isDepthModeSupported`. — [ARCore Depth developer guide, read 2026-10-14](https://developers.google.com/ar/develop/java/depth/developer-guide)
- A 2022 community thread reports that depth works on the back camera but not the selfie camera. This is unofficial. — [r/Arcore thread (2022), read 2026-10-14](https://redlib.ssps.io/r/Arcore/comments/rznkzf/how_to_depth_api_with_selfie_camera)

### Inferences
- ARCore's mesh is the same 468-vertex MediaPipe-style topology as MediaPipe's older Face Mesh (MediaPipe's current model outputs 478 landmarks, adding iris points). A cross-platform pipeline could standardize on MediaPipe's topology everywhere and use ARKit only as an iOS extra.
- Because Android front-camera depth is not documented, "3D from a single selfie" on Android must come from ML (a monocular mesh or a learned head prior), not a sensor.

### Gaps
- I found no official Google statement that the Depth API is unsupported on front cameras, and no list of Android phones with front ToF or structured light in 2026. Unverified.
- ARCore Augmented Faces gives no blendshape coefficients in the pages read. Use MediaPipe Face Landmarker for those.

## 3. Google MediaPipe Face Landmarker (browser via WebAssembly with getUserMedia)

### Takeaway
MediaPipe Face Landmarker runs on Web/JS, Android, iOS and Python. It outputs 478 3D landmarks, 52 ARKit-named blendshape scores and an optional 4×4 facial transformation matrix. It is Apache-2.0 licensed (code and model cards). Its z depth is relative and learned from synthetic data, not metric. The model cards say it is for AR entertainment and "do[es] not provide facial recognition or identification", so it is a capture and guidance tool, not a liveness or identity tool.

### Cited Findings
- Output: "478 3D face landmarks", "52 blendshape scores" and an optional `output_facial_transformation_matrixes` that maps landmarks from a canonical face model to the detected face. Bundle: `face_landmarker.task` (float16) containing BlazeFace short-range (192×192 input), Face Mesh V2 (256×256) and a blendshape predictor (1×146×2). Running modes: IMAGE, VIDEO, LIVE_STREAM. Options: `num_faces`, detection, presence and tracking confidences (default 0.5), `output_face_blendshapes`. "Smoothing is only applied when num_faces is set to 1." "Left/Right" blendshapes refer to the subject, so mirrored input inverts them. Guides for Android, Python, Web/JS and iOS. Page last updated 2026-10-09. — [MediaPipe Face Landmarker guide, read 2026-10-14](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker)
- Licence: the MediaPipe repo is "Apache License, Version 2.0, January 2004". §2 grants "a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form." — [google-ai-edge/mediapipe LICENSE, read 2026-10-14](https://raw.githubusercontent.com/google-ai-edge/mediapipe/master/LICENSE)
- The Face Mesh V2 model card (model date 15 Sep 2022, "LICENSED UNDER Apache License, Version 2.0") says:
  - It predicts "478 3D landmarks". "x- and y-coordinates follow the image pixel coordinates; z-coordinates are relative to the face center of mass and are scaled proportionally to the face width"; "the z-coordinate is obtained from synthetic data".
  - Intended use is "AR entertainment". Out of scope: "human life-critical decisions"; "Predicted face landmarks do not provide facial recognition or identification and do not store any unique face representation."
  - It is not suitable for faces "looking away from the camera (more than 80°)", "inclined from the vertical orientation (more than 8°)", "only partially visible (less than 50% of the face)", or too far away. Input is the face crop "with 25% margin on each side".
  - Fairness: IOD-normalized MAE ranged from 2.06% to 3.27% across 17 geographic subregions in tracking mode, and from 2.49% to 2.90% across Fitzpatrick skin tones 1–6.
  — [MediaPipe Face Mesh V2 model card (PDF), read 2026-10-14](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Face%20Mesh%20V2.pdf)
- The Blendshape V2 model card (model date 11 Nov 2022, Apache 2.0) describes an MLP-Mixer that takes "146 landmarks, a subset of the 478" and outputs "52 facial blendshape coefficients as float values in [0, 1] range". It was trained on lab multi-view captures with GHUM meshes. Its out-of-scope statement matches the Face Mesh card ("do not provide facial recognition or identification"). — [MediaPipe Blendshape V2 model card (PDF), read 2026-10-14](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Blendshape%20V2.pdf)
- Browser camera: `getUserMedia()` "can only be used in secure contexts" (HTTPS, `file:///` or localhost). "user permission is always required". Cross-origin iframes need the Permissions Policy to allow camera access. — [MDN getUserMedia (mdn/content source), read 2026-10-14](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/mediadevices/getusermedia/index.md)

### Inferences
- In the browser, MediaPipe is the practical choice for live capture guidance: centring, distance, head yaw, pitch and roll from the transformation matrix, "neutral expression" checks from blendshapes (for example jawOpen, eyeBlink), and picking sharp frames. It runs on any laptop webcam or phone with a modern browser.
- Its 478 points can seed a 3DMM or head-avatar fit, but the z values are not metric depth and the model is explicitly not an identity model. Do not use it for liveness or "same person" decisions.
- The 52 MediaPipe blendshape names match ARKit's, so one rigging target (an ARKit-52-compatible character) can be driven from both iOS and the web.

### Gaps
- No published latency or size figures for the current bundle on the guide page. WebGPU versus WebGL delegate behaviour in 2026 was not verified.
- The BlazeFace short-range model card was not read in detail.

## 4. Photogrammetry, multi-view and Gaussian-splatting head capture from a phone, and what a "good capture" protocol looks like

### Takeaway
Classic photogrammetry (Apple Object Capture, KIRI, Polycam) assumes a static, rigid subject, and people, hair and blinking break that assumption. 2024–2025 research shows avatar quality from a phone scan or video when a learned head prior does the heavy lifting: Meta's URAvatar gives relightable, animatable Gaussian heads from a phone scan, and LightHeadEd uses a phone with polarizers. The best published capture protocols share the same rules: even frontal light, hair off the face, glasses off, slow head turns, a short set of expressions, and high frame overlap.

### Cited Findings
- Apple Object Capture constraints: static, non-deforming subjects; ≥70% overlap; avoid hard shadows and highlights; depth data gives scale (details in section 1). — [Apple, Capturing photographs for RealityKit Object Capture, read 2026-10-14](https://developer.apple.com/documentation/realitykit/capturing-photographs-for-realitykit-object-capture)
- Apple's own face-capture protocol, for Vision Pro Personas (published 13 Apr 2026): "Front-facing, even lighting is best" with "no strong shadows"; keep bright windows and lamps out of the space behind and beside you; keep hair from covering the face; hold the device at eye level and "Align your entire face within the frame"; "Slowly turn your head to the right", then left, up and down, avoiding "rapid movement of your head"; expressions are a closed-mouth smile, a big smile with teeth, raised eyebrows and closed eyes. Eyewear is chosen afterwards from styles rather than captured. — [Apple Support 118496, Set up your Persona, read 2026-10-14](https://support.apple.com/en-us/118496)
- Secondary reports on Persona capture say capture will not start until all eyewear is removed, and that hats and earrings should come off because they may not be captured fully. — [MacRumors Persona tips](https://macrumors.com/guide/vision-pro-persona-tips); [iMore, read 2026-10-14](https://www.imore.com/vision-pro/how-to-create-a-persona-on-apple-vision-pro)
- URAvatar (Meta Reality Labs authors, SIGGRAPH Asia 2024, arXiv 31 Oct 2024): "create photorealistic and relightable head avatars from a phone scan with unknown illumination". It was trained on "hundreds of high-quality multi-view human scans with controllable point lights", then fine-tuned to the phone scan. "The reconstructed avatars can be animated and relit in real time." — [arXiv 2410.24223, read 2026-10-14](https://arxiv.org/abs/2410.24223)
- LightHeadEd (arXiv 2504.09671, Apr 2025): a phone with polarizing film captures cross- and parallel-polarized video in a dark room under one point light, giving relightable 2D-Gaussian heads in a parametric head's UV space (albedo, normal and specular). — [arXiv 2504.09671 (via search summary), read 2026-10-14](https://arxiv.org/abs/2504.09671v1)
- HRAvatar (CVPR 2025): relightable 3DGS head avatars from monocular video. — [CVF Open Access, read 2026-10-14](https://openaccess.thecvf.com/content/CVPR2025/html/Zhang_HRAvatar_High-Quality_and_Relightable_Gaussian_Head_Avatar_CVPR_2025_paper.html)
- KIRI Engine: 3DGS is a Pro-only mode that can export a mesh alongside the splat, with up to 300 photos per upload. A third-party head-scan guide advises capturing "the top, sides, and under the chin" and keeping lighting and expression consistent. — [KIRI Engine Basic vs Pro](https://www.kiriengine.app/blog/kiri-engine-basic-vs-pro); [3dprintingservices.com head-scan guide, read 2026-10-14](https://3dprintingservices.com/blog/how-to-scan-and-3d-print-your-head-for-free-using-just-your-phone/)
- MediaPipe's tracker degrades beyond 80° yaw, 8° roll, under 50% of the face visible, and in poor light, noise and motion. These are useful thresholds for a guided capture's "too far / tilted / turn back" prompts. — [MediaPipe Face Mesh V2 model card, read 2026-10-14](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Face%20Mesh%20V2.pdf)

### Inferences
Proposed "good capture" protocol, synthesized from the Apple Persona and Object Capture guidance and the MediaPipe limits above. This is my synthesis, not a published standard:
- Even frontal soft light, no window or lamp behind the user, no hard shadows.
- Glasses, hat and large earrings off. Hair tied back or off the forehead and ears for the shape pass. If hair styling matters, do a separate hair pass with the hair down.
- Neutral expression with lips closed, eyes open, checked live with blendshapes.
- Phone at eye level, about arm's length, whole face plus margin in frame.
- A slow yaw sweep of about ±60–80°, plus pitch up and down, at roughly 2–3 s per direction, keeping heavy overlap between frames (Object Capture asks for ≥70% between adjacent shots).
- Then 3–5 short expressions (closed smile, teeth smile, brows up, eyes closed) for rigging.
- Record the video plus metadata: ARKit blendshapes, transforms and depth on iOS; MediaPipe output on the web.
- Turntable photogrammetry of a person is unreliable because the subject moves and deforms. Learned priors (URAvatar-style, FLAME-based) tolerate small motion, so a 10–30 s guided selfie video is the more robust input than dozens of stills.
- A self-held front camera cannot capture the back of the head. Back-of-head and hair need a second person and the rear camera, or must be hallucinated by a learned prior.

### Gaps
- No current (2026) primary documentation from Polycam or Luma on capturing live human heads was found. Whether Luma's consumer capture app still exists in 2026 was not verified.
- URAvatar is a research result. I found no public code or commercial licence for it.
- I found no published minimum frame-count or view-count benchmark for phone-video head avatars that compares methods head to head.

## 5. Single photo vs multi-photo vs video: what each enables downstream

### Takeaway
One photo is enough for zero-shot identity conditioning in 2D image generators (InstantID-style) and for one-shot animatable Gaussian heads (LAM). Several to dozens of photos let you fine-tune identity (Higgsfield's Soul ID asks for 5 to 20+). A guided video (with depth on iOS) is what phone-scan relightable 3D heads (URAvatar-class) use. Licences are the trap: many open face and head components are non-commercial.

### Cited Findings
- InstantID needs a "single image" and uses "only the maximum face". Licence: "The code of InstantID is released under Apache License for both academic and commercial usage. However, both manual-downloading and auto-downloading face models from insightface are for non-commercial research purposes only … Our released checkpoints are also for research purposes only." — [InstantID GitHub, read 2026-10-14](https://github.com/instantX-research/InstantID)
- LAM, Large Avatar Model for one-shot animatable Gaussian heads (Tongyi Lab, Alibaba, SIGGRAPH 2025): "Build 3D Interactive Chatting Avatar with One Image in Seconds". Reported speeds: 1.4 s reconstruction, rendering at 562.9 FPS on an A100 and 110+ FPS on a Xiaomi 14, with a WebGL renderer. The code is Apache-2.0, but the repo's `LICENSE_WEIGHT` is "Attribution-NonCommercial 4.0 International" (CC BY-NC 4.0). — [aigc3d/LAM README](https://github.com/aigc3d/LAM); [LAM LICENSE_WEIGHT, read 2026-10-14](https://raw.githubusercontent.com/aigc3d/LAM/master/LICENSE_WEIGHT)
- FLAME (the head model many avatar methods use). FLAME 2017/2019/2020/2023 are licensed "for the sole purpose of performing non-commercial scientific research, non-commercial education, or non-commercial artistic projects; Any other use, in particular any use for commercial, pornographic, military, or surveillance, purposes is prohibited". "For commercial uses … please send email to ps-license@tue.mpg.de". A separate "Open Model License" applies "ONLY to the FLAME 2023 Open model" under a "Creative Commons Attribution license". — [FLAME model licence page, read 2026-10-14](https://flame.is.tue.mpg.de/modellicense.html)
- Higgsfield Soul ID (photo-trained identity): one Higgsfield blog recommends 20+ reference photos (up to 80); another Higgsfield page says 5+ is enough; training takes minutes. A Soul 2.0 character does not carry over to Soul Cinema. These figures come from search summaries of Higgsfield-hosted pages. — [Higgsfield blog: Soul ID character consistency](https://higgsfield.ai/blog/sould-id-best-character-consistency); [geo.higgsfield.ai Soul ID page, read 2026-10-14](https://geo.higgsfield.ai/blog/higgsfield-soul-id-character-consistency-ai-videos)
- URAvatar personalizes from a phone scan to a relightable, animatable 3D Gaussian head (see section 4). — [arXiv 2410.24223, read 2026-10-14](https://arxiv.org/abs/2410.24223)
- ARKit's 52 coefficients and mesh come from live video. A blendshape dictionary can regenerate the mesh for a given expression. — [Apple ARFaceAnchor.blendShapes, read 2026-10-14](https://developer.apple.com/documentation/arkit/arfaceanchor/blendshapes)

### Inferences
- Single photo: fastest onboarding, enough for 2D identity adapters and one-shot 3D heads. Weak on profile views, hair volume and teeth, and the easiest input to spoof with someone else's photo, so it needs a liveness and face-match gate (section 7).
- Multi-photo (5–30): best for LoRA or "Soul ID"-style identity training for image and video generation across angles and lighting. It still needs per-photo face matching against a live reference.
- Guided video (10–30 s, with depth on iOS): gives every angle for 3D (Gaussian or mesh), expression samples for rigging, and, from the same session, the liveness and face-match reference. This makes it the strongest single input for "image + 3D + video" use.
- For a commercial product, check every face model's licence. InsightFace-based identity encoders, FLAME (except FLAME 2023 Open) and LAM's weights are non-commercial as published. MediaPipe and Apple's frameworks are usable commercially under their terms.

### Gaps
- PuLID, PhotoMaker and current (2026) commercial identity-adapter licences were not checked.
- No quantitative comparison of identity fidelity (single photo vs multi-photo vs video) from a primary source was found.

## 6. Liveness / presentation-attack detection and "is this the account holder": standards, vendors, prices, and how Sora and Higgsfield did it

### Takeaway
The market standard is an ISO/IEC 30107-3 presentation-attack-detection (PAD) test by iBeta (Levels 1–3). AWS, Azure, Veriff, Persona, Onfido/Entrust, Jumio, iProov, FaceTec, Incode and Paravision all hold iBeta letters. Cloud liveness costs about $0.015 per check at AWS and Azure list price, face matching about $0.001 per image (AWS), and full document-plus-selfie identity verification $0.80–$1.89 per check (Veriff self-serve). Sora's cameo used a one-time in-app video and audio recording with spoken-number and head-turn challenges, but the Sora app shut down on 26 Apr 2026. I found no documented liveness step in Higgsfield's Soul ID.

### Cited Findings
**Standard and certification**
- iBeta's PAD levels (ISO/IEC 30107-3), as summarized by the fetch tool from iBeta's page:
  - Level 1: 8 h per subject or species, no expertise, home or office artefacts capped at $30, "0% penetration".
  - Level 2: 2–4 days, moderate expertise, artefacts up to $300 (for example 3D-printed, resin or latex masks), "1% penetration or match rate allowed".
  - Level 3: hyper-realistic masks, "5% penetration", BPCER/FNMR ≤10%.
  - Six attack species per test. Level 1 and 2 letters generally carry a 15% BPCER limit. iBeta states that passing "does not certify the vendor product".
  — [iBeta ISO 30107-3 PAD confirmation letters, read 2026-10-14](https://www.ibeta.com/iso-30107-3-presentation-attack-detection-confirmation-letters/)
- iBeta letters listed on that page (letter dates):
  - FaceTec ZoOm L2 (02/07/19)
  - iProov L2 (2020)
  - Incode Deepsight L3 (02/16/26) and Incode Omni L2 (01/30/23)
  - Onfido Liveness L2 iOS (01/24/22) and Android (06/08/22)
  - Entrust "Facial Similarity Report: Motion" L1 (07/27/26)
  - Veriff Biometric Liveness L2 (08/29/24)
  - Persona Selfie Liveness L2 (11/16/23)
  - Jumio Liveness SDK L2 (09/11/25)
  - AWS Rekognition Face Liveness L1 (09/11/23) and L2 (10/19/23)
  - Azure Face Liveness L1 (05/19/23), L2 (06/22/23), and a partial L1 and L2 retest (04/14/25)
  - Paravision L2 (12/28/23)
  - ID R&D IDLive Face L2 (09/30/20)
  The newest letter on the page is dated 09/29/26. — [iBeta letters page, read 2026-10-14](https://www.ibeta.com/iso-30107-3-presentation-attack-detection-confirmation-letters/)

**AWS Rekognition Face Liveness (works in the browser)**
- Users take "a short video selfie where they follow a series of prompts". `FaceMovementAndLightChallenge` has the user move into an oval while the SDK "displays a sequence of colored lights on the screen". `FaceMovementChallenge` drops the lights, trading accuracy for speed. AWS calls `FaceMovementAndLightChallenge` "the best setting to maximize accuracy".
- Results include a confidence score (0–100), "a high-quality image called reference image that can be used for face match or face search", up to four audit images, and feedback codes. It is used "along with face matching (with CompareFaces and SearchFacesByImage) for identity verification".
- Clients are Amplify FaceLivenessDetector for React (web), Swift (iOS) and Android. AWS warns it "cannot guarantee perfect results".
— [AWS Face Liveness docs, read 2026-10-14](https://docs.aws.amazon.com/rekognition/latest/dg/face-liveness.html)
- Pricing (US East): $0.015 per check for the first 500,000 checks, then $0.0125 for the next 2.5M, then $0.010. CompareFaces and face search cost $0.0010 per image for the first 1M. Free tier: 1,000 images per month per group for 12 months. These come from AWS's worked examples, because the price table did not render. — [AWS Rekognition pricing, read 2026-10-14](https://aws.amazon.com/rekognition/pricing/)

**Azure AI Face liveness**
- Modes: Passive ("requires no extra actions", needs non-bright light and high screen brightness, about 12 s) and Passive-Active (the active step triggers only in bright light, up to about 20 s; "preferable on Web browser solutions"). Optional "Liveness detection with face verification" against a reference image. Output is a Real or Spoof decision plus a "session-image".
- "We don't store any images or videos from the Face Liveness Check."
- Security: "the Mobile solution includes additional Runtime Application Self-Protections (RASP) provided by GuardSquare, which are not available in the Web solution … the Web solution … may be more vulnerable to certain types of attacks. So we recommend using the Mobile solution whenever possible." Azure claims "a 0% penetration rate in iBeta Level 1 and Level 2". A Microsoft-hosted "Liveness Quick Link" browser flow also exists. Page dated 2026-01-30, updated 2026-06-15.
— [Microsoft Learn: Face liveness detection, read 2026-10-14](https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/concept-face-liveness-detection)
- Azure retail prices (East US, USD): "Liveness Transactions" $15.00 per 1,000 ($0.015 per check); "Liveness and Verification Transactions" $15.50 per 1,000; both effective 2024-02-01. Standard face transactions $1.00 per 1,000 for the first 1M, falling to $0.40 per 1,000 above 100M. The marketing page shows placeholders and a free tier of 30,000 transactions per month. — [Azure Retail Prices API query, productName contains 'Face', eastus, read 2026-10-14](https://prices.azure.com/api/retail/prices); [Azure Face pricing page, read 2026-10-14](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/face-api/)

**Identity-verification (IDV) vendors**
- Veriff self-serve, per verification:

  | Plan | Price | Monthly minimum | Decisions | Video recording and FaceBlock | Retention |
  |---|---|---|---|---|---|
  | Essential | $0.80 | $49 | automated | no | 3 months |
  | Plus | $1.39 | $99 | hybrid | yes | 6 months |
  | Premium | $1.89 | $209 | hybrid | yes | 6 months |

  All plans include biometric matching (document to selfie) and liveness ("iBeta-conformant"). Add-ons: 2-year retention +$0.30, PEP and sanctions +$0.64. Enterprise "5000+ verifications/month". No biometric-only price is listed. — [Veriff pricing, read 2026-10-14](https://www.veriff.com/pricing)
- FaceTec: no public per-check price. Software runs on the customer's servers and is billed monthly per 3D Liveness check or per user, with a minimum monthly commitment ("Get A Pricing Quote"). — [FaceTec pricing (via search summary), read 2026-10-14](https://www.facetec.com/pricing)

**Sora cameo (OpenAI) and Higgsfield**
- Sora 2 System Card (30 Sep 2025), on launch safeguards: "not supporting text-to-video generation of public figures, and blocking generations that include real people (other than users who consent through Sora's likeness-control cameo feature); and mechanisms requiring explicit opt-in consent and controls for the use of likeness through cameos". Provenance: "C2PA metadata on all assets", a "Visible moving watermark" on downloads, and internal detection tools. Uploads in which a potential minor is detected (including cameos) get tighter thresholds. — [Sora 2 System Card PDF, read 2026-10-14](https://cdn.openai.com/pdf/50d5973c-c4ff-4c2d-986f-c72b5d0ff069/sora_2_system_card.pdf)
- Secondary sources describe the cameo verification:
  - A one-time video and audio recording, validated "with audio challenges to ensure authenticity and prevent impersonation".
  - A live front-camera session reading random number pairs aloud and turning the head in prompted directions (for example left and up).
  - A 3–10 s window is reported.
  - Owners choose who may use a cameo (only me, approved people, mutuals, everyone) and can revoke access.
  - One hands-on account and one LinkedIn post claim the check was bypassed with generated video soon after launch. Unverified.
  None of these sources is OpenAI documentation, and they were read only as search summaries, not fetched in full. The help-center pages could not be fetched (openai.com returned 403). — [VentureBeat](https://venturebeat.com/ai/openai-debuts-sora-2-ai-video-generator-app-with-sound-and-self-insertion); [TechRadar](https://www.techradar.com/ai-platforms-assistants/i-tried-sora-2-i-love-it-and-its-about-to-ruin-everything); [The Neuron](https://www.theneuron.ai/explainer-articles/your-complete-guide-to-ai-video-memes-and-mayhem-with-openais-sora-2); [lilys.ai guide, read 2026-10-14](https://lilys.ai/en/notes/how-to-use-sora-20251021/use-cameo-in-sora-two-guide)
- OpenAI later renamed "cameos" to "Characters" (secondary). Developers reported characters were not available through the API (forum). — [OpenAI community forum, read 2026-10-14](https://community.openai.com/t/sora-2-api-are-the-cameo-features-coming-to-the-api/1361267)
- Sora shutdown: The Decoder (28 Mar 2026), citing OpenAI's help page "What to know about the Sora discontinuation", reports that the Sora web and app went offline on 26 Apr 2026 and the API on 24 Sep 2026, with user data then permanently deleted. — [The Decoder, read 2026-10-14](https://the-decoder.com/openai-sets-two-stage-sora-shutdown-with-app-closing-april-2026-and-api-following-in-september/)
- Higgsfield: no selfie-video or liveness verification for Soul ID was found. Soul ID is trained from uploaded photos. Higgsfield-hosted FAQ pages (SEO subdomain, low reliability) describe a consent checkbox gate ("confirm they have permission for all visible faces"). An archived, superseded Higgsfield privacy policy says: "We do not store your biometric information", that it is "extracted and used only transiently", and that "Providing biometric information is voluntary". — [geo.higgsfield.ai face-data FAQ](https://geo.higgsfield.ai/is-higgsfield-ai-safe-for-face-data-faq); [Higgsfield privacy policy (archived version dated 7 Aug 2026), read 2026-10-14](https://higgsfield.ai/privacy-policy-23-07-2026)

### Inferences
- For "is this a live person": a certified cloud liveness SDK (AWS or Azure at about $0.015 per check) is the lowest-cost credible option and works on web, iOS and Android. Prefer the mobile SDK. Azure explicitly warns that web liveness is weaker (no RASP), which matters for the laptop-webcam path.
- For "is this the account holder": liveness alone only proves a live person is present. The account-holder link comes from (a) doing liveness at signup and storing the reference image or template, then face-matching every later capture and upload to it; and optionally (b) document-plus-selfie IDV (Veriff from $0.80) when legal identity matters, for example for paid likeness rights or disputes.
- A Sora-style random spoken challenge (numbers) plus head turns adds a consent record ("I am X and I consent") and an anti-replay step. Reports of bypass by generated video suggest it should sit on top of a certified PAD vendor, not replace one.
- Biometric-privacy duties (consent, retention, deletion) apply whatever vendor is chosen. This was out of scope here except for Apple's rules.

### Gaps
- No public per-check pricing was found for iProov, Incode, Onfido/Entrust, Jumio, Paravision, or (because of a 403) Persona.
- The Azure Limited Access eligibility for liveness was not confirmed (the Microsoft limited-access page returned 404).
- Exact OpenAI help-center wording on cameo verification and on deletion of characters after the shutdown was not retrieved.
- iBeta Level 2's "1% penetration allowed" comes from the fetched page summary. Vendors such as Azure claim 0% at Level 2, so check the exact iBeta wording before quoting it.

## 7. How to stop users uploading someone else's photo (celebrity and face-matching blocks, verification recordings)

### Takeaway
No single control prevents it. The documented building blocks are:
- a liveness check that yields a trusted reference image;
- face-matching every uploaded photo or video to that reference (about $0.001 per image on AWS);
- a celebrity or public-figure detector (AWS RecognizeCelebrities covers "tens of thousands");
- a recorded consent and challenge clip;
- policy blocks on generating real people outside the verified-likeness system, the Sora model;
- provenance (C2PA, watermarking) on outputs.

### Cited Findings
- AWS Face Liveness returns a "reference image that can be used for face match or face search". AWS positions it "along with face matching (with CompareFaces and SearchFacesByImage) for identity verification". — [AWS Face Liveness docs, read 2026-10-14](https://docs.aws.amazon.com/rekognition/latest/dg/face-liveness.html)
- CompareFaces and face search cost $0.0010 per image for the first 1M (AWS). — [AWS Rekognition pricing, read 2026-10-14](https://aws.amazon.com/rekognition/pricing/)
- Azure's "Liveness detection with face verification" will "verify the identity of the person based on a reference image you provided", at $15.50 per 1,000. — [Microsoft Learn, read 2026-10-14](https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/concept-face-liveness-detection); [Azure Retail Prices API, read 2026-10-14](https://prices.azure.com/api/retail/prices)
- AWS celebrity recognition can "recognize tens of thousands of well-known personalities in images and videos". It "is designed to be used exclusively in cases where you expect there may be a known celebrity in an image or a video", and celebrities can opt out by emailing rekognition-celebrity-opt-out@amazon.com. — [AWS Recognizing celebrities, read 2026-10-14](https://docs.aws.amazon.com/rekognition/latest/dg/celebrities.html)
- Sora blocked text-to-video of public figures and generations that include real people other than consenting cameo users. It required "explicit opt-in consent", and shipped C2PA plus a visible moving watermark. — [Sora 2 System Card, read 2026-10-14](https://cdn.openai.com/pdf/50d5973c-c4ff-4c2d-986f-c72b5d0ff069/sora_2_system_card.pdf)
- Veriff Plus and Premium include "FaceBlock" and video recording. FaceBlock was not defined on the pricing page; a search summary of the help centre's plans description lists it alongside video recording (page not fetched directly). — [Veriff pricing](https://www.veriff.com/pricing); [Veriff plans description (via search summary), read 2026-10-14](https://help.veriff.com/en/articles/10853865-veriff-plans-description)
- Apple's DPLA forbids using Face Data to "identify anonymous users". Its definition covers uploaded photos. Comparing a user's uploads with that same user's own consented reference is a different act, but it should be disclosed and consented under §3.3.3(K) and 5.1.2. — [Apple DPLA, read 2026-10-14](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)

### Inferences
A practical gate for the "scan your face" step, from cheapest to strongest:
1. Require a live capture in-app (no gallery upload) for the master likeness. Run certified liveness on it (AWS or Azure, about $0.015).
2. Store the reference image or embedding. Face-match every extra upload and every final character render against it (about $0.001 each). Reject uploads below the threshold, and flag group photos (more than one face).
3. Screen the reference against a celebrity detector, and block or queue matches for manual review.
4. Record a short consent and challenge clip: say the displayed random digits, turn the head as prompted. Keep it as evidence with audit images.
5. In generation, refuse prompts or images with other real faces unless they belong to another verified, consenting user (Sora's permission model: only me, approved people, everyone).
6. Embed C2PA and a watermark in outputs.

Celebrity detection only covers famous people. The main defence for private individuals is the liveness plus face-match chain.

### Gaps
- No published false-accept or false-reject rates for using CompareFaces as an "uploaded photo belongs to the same person" filter at a given threshold were read.
- No public documentation from Higgsfield on blocking uploads of other people's faces was found beyond the consent-checkbox claims on SEO pages.
- Whether Microsoft or Google currently offer celebrity recognition to new customers in 2026 was not checked.
