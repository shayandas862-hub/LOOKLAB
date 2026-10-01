# Look Lab — Validation

What has been checked against a known answer, how, and what has not. Read this before believing any number
the app shows. Every number here comes from a run in the session that wrote it (standing rule 9).

**A result on the Blender set is a claim about the Blender set only.** It is synthetic: one head built in a
script, rendered by Blender. Nothing here is a claim about real footage (standing rule 3). No real frame has
been checked against a known light.

---

## 1 · The light fit, ported from v0.2 (P3)

`src/core/light-render.ts`, `light-fit.ts` and `cheek.ts` are v0.2's renderer, search and cheek statistic
(D-LL-007), ported as erasable TypeScript.

**Parity with v0.2, tolerance 0** (`tests/core/light-fit.test.ts`). v0.2's own code is run from its source
(`reference/v0.2/src/base.html` between the CORE markers, and `cheekStats` from `scene.js`). For the five cases
and three edge rigs, every pixel and the face mask are identical, at 240 × 300 with grain and at 40 × 50 without;
every step of the search (first guess, coarse sweep, each descent step, its log text) is identical; so is the
cheek statistic.

**v0.2's five synthetic cases** (the fit's own renderer, so this proves only that the fit inverts it; measured
2026-10-01 on the M1, plain Node):

| Case | Steps | Residual | Δaz | Δel | ΔK | Δfill | Δsoft | Time |
|---|---|---|---|---|---|---|---|---|
| rembrandt | 23 | 0.0037 | 3° | 0° | 150 | 0.05 | 0.12 | 132 ms |
| beauty | 20 | 0.0022 | 1° | 1° | 13 | 0.03 | 0.12 | 88 ms |
| noir | 16 | 0.0027 | 7° | 0° | 50 | 0.05 | 0.26 | 35 ms |
| extra-a | 15 | 0.0017 | 0° | 2° | 0 | 0.02 | 0.06 | 51 ms |
| extra-b | 26 | 0.0050 | 10° | 1° | 188 | 0.06 | 0.30 | 94 ms |

Asserted in `npm test` at v0.2's thresholds: az ≤ 15°, el ≤ 8°, kelvin ≤ 500 K, fill ≤ 0.6 stops, residual
≤ 0.02. Softness is reported, not asserted. The numbers are v0.2's own, to the unit.

---

## 2 · The Blender ground-truth set (P3)

**Regenerate:** `npm run blender-set` (Blender 5.1.1, headless). `scripts/blender/plan.ts` draws every rig from
a seed; `scripts/blender/render_set.py` builds and renders it. The truth is written beside each render as
`<id>.json`, and `tests/core/blender-set.test.ts` checks that the committed truth is exactly what the planner
makes, so the accuracy test runs without Blender.

| Set | Seed | Rigs | Scenes | Use |
|---|---|---|---|---|
| `dev` | 1 | 8 | 16 | may be looked at while the algorithm changes |
| `test` | 2 | 12 | 24 | held out: run once, for the acceptance number |

- **Each rig is rendered twice, light skin and dark skin, under the same light,** so the two tones are compared
  pair for pair. Light skin is ColorChecker "light skin" (sRGB 194, 150, 130); dark skin is sRGB (96, 64, 50).
- **The head is built in the script** from a sphere: nose, brow ridge, eye sockets, cheekbones, lips and chin
  are displacements; eyes, brows, ears, hair, neck and shoulders are separate meshes. No downloaded model, so no
  licence to record. Skin has a little subsurface scattering; the key casts real shadows.
- **What is true, and how it is defined** (the fit's own conventions, D-LL-033): the face points at the camera,
  the camera is level at eye height. **az** is camera-relative: 0 from the camera, positive from the right of the
  frame, ±135 at most. **el** 0–60° above the eye line. **kelvin** 2900–6800 K, the key's colour through a camera
  white-balanced at 5600 K, from Planck's law (Kim et al. 2002 locus), not from the fit's own colour curve.
  **fill** 0.5–3.5 stops of irradiance at the face, key over fill, as an incident meter reads it; the fill is a
  2 m soft disk at the mirrored azimuth, 8° up, 6500 K. **softness** is the key's angular diameter seen from the
  face over 60° (0 a bare bulb, 1 a 60° source). The held-out set has a rig in every 45° band of azimuth.
- **Varied:** focal length 35/50/85/135 mm, face 32–58% of the frame's height, face on either third or the
  centre, exposure ±0.4 stops, six backgrounds (grey, warm, teal, off-white, mottled, none), four clothes colours.
- **The face box** in the truth is the planner's projection of the hairline, the chin and both cheeks. Against
  Blender's own projection of the head's front between chin and hairline (`render-log.json`), over all 40
  scenes: left edge, top edge and width within 0.006 of the frame; bottom edge within 0.020 (up to 6 px of 288,
  the planner's chin lower). A person's drag is no more exact than that.
- **Rendered** with Cycles, 128 samples, denoised, Standard view transform, 512 × 288, 8-bit PNG, on the M1's CPU.
  **Generating both sets took 217 s** (16 scenes in 79 s, 24 in 138 s; median 5.8 s a scene). **Committed size:
  5.3 MB** (dev 2.1 MB, test 3.2 MB). Rendering the same scene again gives the same truth exactly and the same
  pixels within one code value (9 of 442,368 channel values differed by 1).

---

## 3 · The light fit on the Blender set

### 3.1 Baseline: the ported fit as v0.2 ran it (dev set, before any change), 2026-10-01

The fit runs on the truth's face box, mapped onto its own face region (`src/core/light-face.ts`), with the
assumptions of D-LL-033 (lens 85 as head scale, yaw 0, tilt 0, no practical lamp, wall 0.7). Nothing in the
fit was changed for this run.

| Skin | n | az median / worst | el median / worst | direction (angle) median / worst | kelvin median / worst | fill median / worst | softness median / worst |
|---|---|---|---|---|---|---|---|
| all | 16 | 57.4° / 123.5° | 27.1° / 79.8° | 45.0° / 103.1° | 1658 K / 2785 K | 0.82 st / 2.92 st | 0.17 / 0.75 |
| light | 8 | 62.4° / 123.5° | 17.9° / 55.0° | 53.1° / 103.1° | 1658 K / 2785 K | 1.10 st / 2.92 st | 0.18 / 0.75 |
| dark | 8 | 50.5° / 80.1° | 33.7° / 79.8° | 45.0° / 88.1° | 1658 K / 2785 K | 0.52 st / 2.39 st | 0.17 / 0.75 |

Fit time 63–196 ms a frame (median 74 ms). **It fails the P3 acceptance (median az ≤ 15°, el ≤ 10°) by a wide
margin.** The fits collapse toward az 0°, el at the top of its range (80°) and kelvin at its bounds, with
residuals of 0.06–0.19 against 0.002–0.005 on v0.2's own cases: the fit's renderer cannot draw these frames.
Why, from looking at the crops next to the fitted renders: the fit scores every pixel of the crop, so the wall,
hair, neck and clothes outweigh the face; its head is an egg with its eyes 18% of the way from hairline to chin
(this head has them at 25%); it has one skin colour, so a darker or redder face reads as warmer or weaker light;
and it draws no cast shadows, so a nose shadow can only be explained by a light from straight above.

### 3.2 The skin-pattern fit (D-LL-035), 2026-10-01

v0.2's renderer and search, scored only on the face's skin as a brightness pattern; the box placed on the
renderer by the eye line. Chosen on the dev set among four variants declared before any was run
(`node --experimental-strip-types scripts/blender/report.ts --variants`), by median direction error:

| Variant (dev set, 16 scenes) | direction | az | el | Spearman(score, −error) |
|---|---|---|---|---|
| linear pattern, box on hairline and chin | 19.4° | 8.2° | 12.8° | 0.57 |
| **linear pattern, box on the eye line (chosen)** | **16.2°** | **13.5°** | **8.7°** | 0.50 |
| log pattern, box on hairline and chin | 17.8° | 12.7° | 14.8° | 0.65 |
| log pattern, box on the eye line | 19.8° | 13.2° | 12.5° | 0.38 |

**Held-out set, run once after the fit was frozen** (24 scenes, 12 rigs × light and dark skin), truth face box:

| Skin | n | az median / worst | el median / worst | direction (angle) median / worst | kelvin median / worst | fill median / worst | softness median / worst |
|---|---|---|---|---|---|---|---|
| all | 24 | **13.9°** / 79.3° | **8.7°** / 29.2° | 16.9° / 60.7° | 445 K / 2150 K | 1.10 st / 3.14 st | 0.31 / 0.85 |
| light | 12 | 7.4° / 15.3° | 10.9° / 24.6° | 13.8° / 27.2° | 430 K / 1460 K | 1.24 st / 2.64 st | 0.32 / 0.85 |
| dark | 12 | **21.9°** / 79.3° | 6.9° / 29.2° | 24.4° / 60.7° | 475 K / 2150 K | 1.06 st / 3.14 st | 0.27 / 0.50 |

- **P3 acceptance (median az ≤ 15°, el ≤ 10° on the set): met on the whole held-out set. Not met for dark skin
  on its own** (az 21.9°), and light skin's elevation is just over (10.9°).
- **Worst case:** `test-04-dark`, a key at az 17°, el 1° (nearly from the camera, at eye level), fitted at
  az 78°, el 11°: 61° off. The dark-skin failures are near-frontal keys read as side light (`test-05-dark`
  79° off in az, `test-11-dark` 52°).
- **A less careful box costs a lot:** with each edge of the face box moved by up to ±8% of its size
  (`--jitter=0.08`), the held-out median az rises to 26.4° (light 12.2°, dark 48.0°) and el is 7.2°.
- **Kelvin** 445 K median, inside v0.2's 500 K, so it is written (D-LL-037). **Fill** (1.10 stops) and
  **softness** (0.31) are not: the Breakdown does not write them.
- **Confidence** (the gap to the next-best direction, D-LL-036): Spearman with −direction error 0.57 on the
  held-out set (0.50 on dev), over the 0.5 bar, so it is shown. A rank, not a probability.
- **Fit time** median 196 ms a frame (max 249 ms), plain Node on the M1.
- Dev set with the chosen fit, for comparison: az 13.5°, el 8.7°, direction 16.2° (light 10.1°, dark 24.4°).

---

## Not validated

| Area | Why it matters |
|---|---|
| Real footage or real photos | Nothing real has been checked against a known light. Real faces turn, wear hair, glasses and make-up, and are graded and compressed. |
| Faces not pointing at the camera, practical lamps in frame | The fit assumes neither (D-LL-033); the Blender set contains neither. |
| Any other head than the one in the Blender script | Every Blender scene uses the same head. |
| Lens from EXIF on real camera files | `src/core/exif.ts` is checked on byte fixtures built in its test (JPEG, PNG, WebP; present, absent, damaged), not on files from real cameras. |
