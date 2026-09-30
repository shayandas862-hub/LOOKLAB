# 04 · Prototype reference (what exists today)

Everything below is verified against `src/` at v0.2. Line counts: `base.html` 662, `scene.js` 694, `scene.css` 82, `panels.html` 166.

## Build
`src/build.py` takes `base.html` (tab 1 page + core math) and splices in: the three.js `<script>` (after the font links), `scene.css` (before `</style>`), `nav.html` (tab buttons + opening of `#tabFit`), `panels.html` (closes `#tabFit`, adds `#tabLive`, `#tabArch`), and `scene.js` (a second `<script>` at the end). Each splice asserts its anchor exists. Output: `dist/look-lab.html` (artifact fragment) and `dist/index.html` (standalone wrapper).

Screenshots: `img/reference-fit-desktop.png`, `img/live-scene-desktop.png`, `img/live-scene-after-match-and-hero.png`, `img/live-scene-mobile.png`, `img/how-it-works-desktop.png`.

## Design system (as built)
Dark-only "grading suite" look. Tokens on `:root`: `--bg #0f0e0d`, `--panel #171513`, `--panel2 #201d1a`, `--line #2d2926`, `--fg #ece6de`, `--muted #9a9187`, `--accent #f2a24a` (tungsten amber), tier colours `--t0 #7dc59a`, `--t1 #78aee0`, `--t2 #b7a2e6`, `--t3 #f2a24a`, `--rt #c9c2b8`, `--bad #e2725b`, `--fill #78aee0`. Fonts: Instrument Sans (UI), IBM Plex Mono (numbers), from Google Fonts with system fallbacks. Layout: mobile-first, 16 px side gutter, CSS grid areas that re-flow at ≥ 920 px. No horizontal scroll at 400 px (tested).

---

## Tab 1 · Reference fit (`src/base.html`)

### The CORE block (`/*CORE-START*/ … /*CORE-END*/`, DOM-free, tested in Node)
| Symbol | What it does |
|---|---|
| `renderScene(p, w, h, grain)` | Software renderer for a head-and-shoulders mannequin in a room. Returns `{rgb: Float32Array(w*h*3), head: Uint8Array(w*h)}`; `rgb` is display-referred 0–1, `head` marks skin pixels (hair and silhouette edge excluded). |
| `downsample(src, w, h, f)` | Box downsample by integer factor `f` (page uses 6: 240×300 → 40×50). |
| `errFn(a, b)` | Mean absolute difference over all channels. |
| `kelvinRGB(k)`, `keyColor(k)` | Tanner Helland blackbody approximation; `keyColor` normalises to 5600 K = white. |
| `hash2(x, y)` | Deterministic integer hash noise (film grain). |
| `fingerprint(rgb, head, w, h)` | `{zones[5] (luminance histogram fractions), ratio (skin p90/p10 in linear light, capped 99), sw[3] (lit, shade, wall as css rgb)}`. |
| `tagsFor(p)` | Numbers → words (see below). |
| `shotLabel(lens)` | Head height ≈ `0.64·lens/85` of frame → ECU ≥ 1.0, CU ≥ 0.6, MCU ≥ 0.4, MS ≥ 0.26, else WS. |
| `measureInit(ref, w, h, base)` | First guess from skin statistics (below). |
| `createFit(ref, w, h, base)` | Stepper `{step() → {done, p, err, logs[]}}`; three stages. |
| `KNOBS` | The six fitted parameters with ranges and step sizes. |

### Scene parameters `p`
| key | meaning | range (UI) |
|---|---|---|
| `az` | key azimuth, 0 = camera side, + = screen right | −170…170 ° |
| `el` | key elevation | −10…80 ° |
| `soft` | softness | 0…1 |
| `int` | key intensity | 0.2…2.2 |
| `kel` | colour temperature | 2800…7000 K |
| `fill` | fill ratio in stops; ratio = 1 : 2^fill | 0…3.5 |
| `lens` | focal length | 24…135 mm |
| `yaw` | camera orbit | −40…40 ° |
| `tilt` | headroom / tilt | −10…10 ° |
| `lamp` | practical lamp on | 0/1 |
| `wall` | wall tone | 0.2…1.2 |

### Renderer internals
- Geometry in normalised image space; `s = lens/85`; head ellipse `rx = 0.62 s`, `ry = 0.80 s`, centre `cy = −0.14 + 0.05·tilt`; torso ellipse below; features (nose, two eye sockets, brow) as Gaussian bumps perturbing the ellipsoid normal; nose/eyes shift with `yaw`. Skin albedo (0.86, 0.63, 0.52), hair (0.07, 0.055, 0.05), cloth (0.11, 0.12, 0.15).
- Key: wrapped Lambert with `wrap = 0.12 + 0.55·soft`, Blinn specular `0.26·(1−0.7·soft)`, shininess `90 − 70·soft`; light direction uses `az − yaw`.
- Fill: opposite azimuth, elevation 0.14 rad, intensity `int / 2^fill`, colour 6500 K, wrap `(n·l + 0.6)/1.6`.
- Ambient 0.025. Practical lamp (if on): wall glow at x = 0.70 − 1.3·sin(yaw), y = −0.28, plus a 0.12-strength warm side light on the subject.
- Wall: lit by key with a horizontal gradient; vignette `1 − 0.32(0.55x² + 0.35y²)`; tone map `1 − exp(−1.15·c)`; optional grain.
- Cost: ~22 ms for 240×300 in Node; 2000-pixel renders (fit resolution) are sub-millisecond scale.

### The fit (`createFit`)
Stage 0, **measure** (rule R4): skin left/right mean ratio `lr` → `az = clamp(95·lr, ±150)`; top/bottom ratio `tb` → `el = clamp(22 + 70·tb, 0, 70)`; `fill = clamp(0.55·log2(p90/p10), 0.3, 3.2)`; `int = 1`, `soft = 0.5`, `kel = 5000`.
Stage 1, **coarse sweep** (R6): 44 renders, `az ∈ {−150…150 step 30} × el ∈ {5, 25, 45, 65}`, keep best.
Stage 2, **greedy coordinate descent** (R7): every iteration tries ± step on each of the six knobs, takes the single best move; accepts if residual improves by > 3e-5, else halves all steps; ends when all steps are at their minimum or at 90 iterations.
Knob table: `az` step 20 (min 1.5), `el` 12 (1.5), `int` 0.3 (0.02), `soft` 0.25 (0.03), `kel` 700 (60), `fill` 0.5 (0.06).
Error = mean abs RGB difference at 40×50 between `renderScene(candidate)` and the downsampled reference (which carries 0.012 grain). Camera and set (`lens, yaw, tilt, lamp, wall`) are **assumed known** (logged as a sample row; a real pipeline gets them from face-size ratio and `vidstabdetect`).
Acceptance (R8/R9): residual < 0.020 accept; 0.020–0.050 accept with warning; > 0.050 escalate (T2 re-label, then T3).
"Match %" shown = `clamp(1 − residual/0.18) · 100`.

### `tagsFor(p)` (numbers → words)
`|az| < 15` frontal; `< 70` three-quarter key; `< 110` side light; else back / rim. `fill ≥ 2.5` low-key; `≤ 1` high-key. `soft > 0.65` soft; `< 0.3` hard; else medium-soft. `kel < 4200` warm; `> 6000` cool; else neutral. `el > 45` top-heavy; `< 10` low angle.

### UI (selected ids)
Reference chips `#refSeg` (3 synthetic references with hidden truth: **Warm Rembrandt** az −52 el 28 soft .35 int 1.15 3800 K fill 2 lens 85 lamp on; **Clean beauty** az 8 el 32 soft .9 5600 K fill .6 lens 100; **Noir side light** az 78 el 8 soft .12 int 1.3 4600 K fill 3 lens 50). Canvases `#cRef`, `#cRec`, `#cRes` (residual heat overlay, toggle), `#cPlan` (top view; drag the amber KEY or the camera; hit radius 32 px). Sliders generated from `CTRL`. Buttons: Auto-fit `#btnFit` (runs once automatically 700 ms after load, or instantly under reduced motion), Reset light, Thirds, Residual, Save current look `#btnSave`. Taste library `#cards`: three sample looks (Golden-hour window, Overcast north light, Hard top-down) plus saved fits; each card shows tags, zone bars, lit:shadow, swatches, key angles, and **Apply to my scene** (copies the six light keys, leaves camera/set).
Fit animation: one iteration per 75 ms.

### Decision log rows written by tab 1
R1 FFmpeg scene detect (sample) · R2 face found / shot scale / lit:shadow (measured live from the reference) and "camera + set assumed known" (sample) · R3 router sentence and T2 label with confidence (sample text, per-reference) · R5 T2 confidence < 0.90 → queue for human, else accept · R4/R6/R7 fit · R8/R9 accept/warn/escalate · a validation row comparing the result to the hidden truth (synthetic only).

---

## Tab 2 · Live scene (`src/scene.js`, `panels.html`, `scene.css`)
Everything lives in one closure: `const Live = (function(){ … })()`. Loaded lazily the first time the tab opens (`Live.onShow()`); `Live.onHide()` stops the render loop.

### World
Units metres, Y up. Room: floor 8 × 7.5 (x ∈ [−4, 4], z ∈ [−3, 4.5]), back wall at z = −3, left/right walls at x = ∓4, height 3.2, no front wall and no ceiling. Wall and floor textures are drawn procedurally on canvases: a **baked** version (photo-like: window glow, vignette) and a flat **albedo** version. `plateRelit` true → `MeshStandardMaterial` with the albedo (reacts to lights and receives shadows); false → `MeshBasicMaterial` with the baked texture plus a `ShadowMaterial` shadow catcher (opacity 0.5) on the floor.
Camera: orbit around target (0, 1.1, 0.2); defaults `az 16°, el 11°, dist 6.4 m, lens 35 mm`; limits `az ±58°, el 1–50°, dist 3–9 m, lens 24–135 mm`.
Renderer: WebGL, sRGB output, **no tone mapping** (so the match metric equals what is displayed), shadow maps on, `PCFShadowMap`.

### Lights
- **Key**: `SpotLight`, cone half-angle 52°, penumbra `0.12 + 0.85·softness`, shadow map 1024², `shadow.radius = 1 + 7·softness`, bias −0.0008, normalBias 0.02, colour from `kelvin`, aimed at the hero's head (`focus` = hero x, 1.4, hero z). Default position (−3, 3, 2.2); limits x ±3.8, y 0.5–3.1, z −2.9…4.4.
- **Fill**: `DirectionalLight`, no shadow, intensity `key / 2^fillStops × 0.9`, 6500 K, placed opposite the key in **view** space.
- **Ambient**: `HemisphereLight`, intensity `ambient`.
- **Practical**: `PointLight` (0xffc27a, 0.9, distance 9) at the first lamp prop's shade; off if `practical = 0` or no lamp exists.
- **Key gizmo**: amber sphere (billboard ring + invisible 0.38 m pick sphere) and a line to the focus.

### Elements
| kind | representation | pickable/movable |
|---|---|---|
| cast, `mode:"card"` | `PlaneGeometry(0.875, 1.75)` (256×512 px texture, bottom-anchored), `MeshStandardMaterial` with albedo map, **normal map**, `alphaTest 0.5`, plus a `customDepthMaterial` (same map + alphaTest) so shadows follow the cutout | yes |
| cast, `mode:"mesh"` | stand-in for an image-to-3D result: cylinders/spheres (legs, torso/coat/dress, arms, head, hair cap) in the outfit colours | yes |
| prop | `armchair`, `table`, `lamp` (emissive shade), `crate`: boxes/cylinders | yes |
| key light | gizmo | yes (floor/lift only) |

Transforms per element: `x ∈ [−3.7, 3.7]`, `y ∈ [0, 2.5]`, `z ∈ [−2.8, 4.3]`, `rot` degrees, `scale ∈ [0.5, 1.8]`. Cards face the camera when `cardsFaceCamera` is on (yaw = atan2 toward the camera + `rot`).
Defaults: **Mara** (hero, noir trench), **Dev** (hoodie), armchair, side table, floor lamp.

### Procedural stand-ins (where models go later)
- `drawCharacter(cv, e)`: draws a flat-colour standing figure on a 256×512 canvas with alpha; outfit types `coat`, `dress`, `hoodie`, `suit`, `jacket`; hair styles `long`, `short`, `bun`. **Replace with the SAM-class cutout of a real photo (Phase 4).**
- `makeNormal(cv)`: height field = 4× box-blur (radius 10) of the alpha × 30 + luminance × alpha × 1.6; central differences → tangent-space normals. Gives rounded-body shading from the silhouette alone. **Replace with estimated normals/depth (Phase 4).**
- `cardFromImage(img, tol)`: user-photo cutout by colour key: background colour = mean of four sampled points; alpha = smoothstep on colour distance with tolerance `keyTol` (default 0.22). Crude; plain backgrounds only.
- `delight(canvas)`: photo ÷ its own 48-px-wide blur, rescaled to the mean: flattens low-frequency light (crude intrinsic decomposition); used for a user plate photo on the back wall.
- `generateOutfit` + `parsePrompt`: 5 presets (Noir trench, Red silk dress, Street hoodie, Linen safari, Charcoal suit); prompt parser reads 25 colour words (red … silver) and garment words (trench, coat, overcoat, dress, gown, saree, hoodie, sweatshirt, suit, blazer, jacket, shirt, safari, tee); unknown text is rejected with a log row. Simulated job bar (12 steps). **Replace with an instruction-edit image model + identity gate (Phase 5).**
- `toggleMode`: card ⇄ mesh. **Replace mesh with real image-to-3D (Phase 5).**
- `heroRender`: see below. **Replace with a relight/harmonise model (Phase 6).**

### Interaction (`onDown/onMove/onUp/onKey`, wheel)
Pointer events on `#lvCanvas` (`touch-action:none`). Hit-test by raycasting all element roots and the key gizmo. Modes (`#lvMode`): **Floor** (ray–plane at the element's height, keeps the grab offset), **Lift** (vertical pixels → height, 0.012 m/px), **Turn** (horizontal pixels → rotation, 0.6°/px; not for the key). Drag empty space: orbit (0.3°/px horizontal, 0.2°/px vertical). Wheel: distance ×(1 ± 0.06). Two-pointer pinch: distance. Arrow keys nudge the selection (0.08 m; Shift 0.25 m). Every completed drag writes a T3 row.
Toggles: Thirds, Cards face camera, Relit plate. Buttons: Match light to reference, Hero render, Reset scene, Add prop (armchair/table/lamp/crate), Remove (props only).

### Rule R11 (live)
With "Cards face camera" off, a card viewed more than **35°** off its facing axis gets a `⚠ N° off-axis` badge in the element list and one log row ("upgrade to a mesh or limit the orbit").

### Reference analysis and the match metric
`analyse(i)`: renders the chosen reference (240×300, grain .012), downsamples, runs tab 1's `createFit` from pixels, and measures the reference's **cheek statistics**: pixels with `|ex| ∈ [0.25, 0.65]` and `ey ∈ [0.15, 0.55]` (head-ellipse coordinates from the known camera). Cached per reference.
`faceStats()`: a separate **measurement camera** (FOV 14°, 1.3 m from the hero's head along the direction to the main camera) renders 256×256 into an sRGB render target sharing the scene's lights; two circular windows (radius 0.022·scale m) sit on the cheeks at ±0.044·scale m, y = 1.442·scale (card) or 1.47·scale (mesh). Collected per pixel: display luminance and R/B.
Statistics: `y90`, `y10` (display luma percentiles), `ratio = y90^2.2 / max(y10^2.2, 0.002)` (lit : shadow), `rb` = mean R/B of the brightest 20%.
`lookDist = 0.5·min(1, |log2(ratio_s/ratio_r)|/2.5) + 0.35·min(1, |Δy90|/0.35) + 0.15·min(1, |ln(rb_s/rb_r)|/0.5)`; **match % = round(100·(1 − lookDist))**.
Why cheeks only: see D-007 (whole-face sampling was dominated by painted eyes/brows).

### `matchLight()` (button "Match light to reference")
1. `analyse()` → `A` (az, el, int, soft, kel, fill, lamp). Log the measurement (R4).
2. Apply: `soft = A.soft`, practical = reference's lamp, knobs `az = clamp(A.az, ±170)`, `el = clamp(A.el, 5, 70)`, `int = 1.15·A.int`, `fill = A.fill`, `kel = A.kel`, `amb = 0.04`.
3. Coordinate descent on `lookDist` over `az (step 20, min 2)`, `el (10, 2)`, `int (0.25, 0.03)`, `fill (0.5, 0.08)`, `kel (600, 80)`, `amb (0.08, 0.01)`; improvement threshold 0.002; up to 26 iterations; one iteration per 50 ms (instant under reduced motion); each candidate costs one 256×256 render + readback.
4. R13: match ≥ 85% → accepted; else escalate (hero pass or the user).
Observed in the build session (software GL): ~5–7 s; results 99 / 88 / 94%.

### Hero render (stand-in, `heroRender`)
Captures the canvas (render then `drawImage` in the same tick), then: per-channel mean/std transfer toward the reference frame (std ratio clamped 0.6–1.6; output = 0.45·source + 0.55·transfer), vignette, grain ±0.025, bloom (blurred copy, `screen` at 0.22; try/catch for Safari). Shows proxy and hero side by side; a 20-step simulated "cloud job" bar. Logged as `sample`.

### Scene graph JSON
`toJSON()` / `applyJSON(text)`; schema in `05-SCENE-GRAPH-SCHEMA.md`. The textarea (`#lvJson`) auto-updates 200 ms after changes unless focused; "Apply JSON" validates, clamps, rebuilds; errors show in `#lvJsonMsg` and leave the scene untouched.

### Pipeline log
`log(tier, text, rule, sample)` appends rows (tiers `T0 T1 T2 T3 RT`). Seed rows describe what the real ingest would do (marked `sample`).

### Test hooks: `Live.api`
`S()` state, `select(id)`, `matchLight()`, `applyJSON(text)`, `toJSON()`, `measureNow()`, `faceStats()`, `polar()`, `setPolar({az,el,dist})`, `changed()`, `camera()`, `renderer()`, `roots`, `heroRender()`, `generateOutfit(e, outfit, src)`, `toggleMode(e)`, `parsePrompt(text)`, `OUTFITS`, `ready()`.

### Key DOM ids (tab 2)
`lvCanvas vpWrap lvStatus lvRefThumb lvMode lvThirds lvFace lvPlate lvMatch lvHero lvReset lvEls lvAddSel lvAdd lvSelTitle lvSel lvLight lvCam lvPlateG lvMatchChip lvMatchBar lvStats lvRefSeg lvJobChip lvJobBar lvCmp lvProxyOut lvHeroOut lvLog lvLogCount lvJson lvJsonCopy lvJsonApply lvJsonMsg`.
Tab buttons `tabFitBtn tabLiveBtn tabArchBtn`; panels `tabFit tabLive tabArch`. `#live` / `#how` in the URL hash open tab 2 / 3 on load.

---

## Tab 3 · How it works
Static content in `panels.html`: short answer, two-loop flow diagram (4 columns → stacked on mobile), model-by-stage table (scrollable on narrow screens), rules R10–R14, risks, six phases, sources. Keep it in sync with `03-ARCHITECTURE.md`, `06-DECISION-LAYER.md` and `07-PHASES.md` (note the UI lists six phases; the docs here refine them to P0–P8).

## Known limitations of the prototype
- Only synthetic references; no video; FFmpeg and the language-model label are sample text.
- Camera and set are assumed known during the fit.
- Softness is the weakest fitted parameter; the match can reach a high score with a different azimuth than the reference's true one.
- Procedural people are cartoons; normals come from the silhouette, not geometry; colour-key cutout and plate de-lighting are crude. **Uploads are not covered by automated tests.**
- Shadows are PCF with a single 1024² map.
- Match step speed measured only on software WebGL; real M1 GPU timing is unmeasured. Safari and Firefox untested. Touch interaction untested on a real phone (pointer logic is covered by mouse events only).
- No persistence: state lives in memory; "Save current look" and the scene are lost on reload (copy the JSON).
- Google Fonts and cdnjs are required at load (degrades to system fonts; the scene needs three.js).
