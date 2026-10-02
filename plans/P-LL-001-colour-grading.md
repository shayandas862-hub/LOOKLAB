# P-LL-001 · Colour: what to capture on set, which camera settings, what is left for the grade

**Status: plan, not yet a decision.** Written 2026-10-02 for phase P4.5 (D-LL-043); serves V-LL-002. When P4.5 starts,
each contract change in §7 becomes its own AD and each real choice a D record, numbered then from
`docs/id-registry.json`. This file stays as the record of the thinking.

**Every number in this plan is one of four kinds, and says which:**
- **Maths**: a published formula, named with its source, or arithmetic on stated inputs. Where a result is given, it
  was computed on 2026-10-02 from the formulas written here (standing rule 9).
- **Document**: a maker's or a standard's number. **None is given here.** Each is "read from the named document and
  cited, its licence checked, at P4.5". Sony's site could not be reached on 2026-10-01: no FX3 fact here is verified.
- **Proposal**: a threshold or default chosen by this plan, with its reason, to be checked in §9 or replaced by a
  D record.
- **Sample**: the design's data for shot 12C (`src/actions/sample.ts`). Typed by a person, never measured (D-LL-015).

---

## 1 · Purpose and scope

For one reference shot, Look Lab hands the crew: what to put **in front of the lens** (each light's colour and the kit
setting or gel that gets it, the key:fill ratio, the colours that must exist in the set and wardrobe); how to set
**the camera**; what is left **for the grade** (a starting ASC CDL, a look LUT, the targets); and, after a test shoot
or a grade, a **grade check** that says in numbers how far a still is from the reference.

**P4.5 builds:** the colour maths in `src/core/` (T0, DOM-free and Node-free, AD-LL-009); the contract changes of §7;
the actions of §8; the Breakdown's CAPTURE & GRADE section, the Set Sheet's capture card and the grade check, from a
new design export (`prompts/08-claude-design-colour.md`); the Blender colour set of §9 with its tolerances.

**P4.5 does not:** let a model produce any number (D-LL-003; a model may choose the strategy only, §5); plan HDR
(no HDR delivery; HLG is never chosen); read RAW or camera files (a test-shoot still comes in through the browser like
a reference, D-LL-027); do photometry (fixture output against distance, T-stop, whether ISO 12,800 is needed: the
Set Plan, P6, knows distances); change the light fit, its kelvin range or its tolerances (P3); claim accuracy on real
footage (standing rule 3). A pass on the Blender set is a claim about the Blender set only.

---

## 2 · Inputs

### 2.1 The founder's answers (2026-10-01: "the sample kit, with your defaults")

| Item | Answer | Status |
|---|---|---|
| Camera | Sony FX3; primes 24, 35, 50, 85 mm | founder |
| What it records (expected) | S-Log3 with S-Gamut3 or S-Gamut3.Cine; S-Cinetone; HLG; base ISO 800 and 12,800 in S-Log3; internal 10-bit 4:2:2 (XAVC S-I, XAVC HS; some modes 4:2:0); 16-bit RAW over HDMI to an external recorder | founder, **not verified**: every item read from Sony's FX3 documents and cited before it enters code |
| External recorder | none in the kit, so no RAW | founder |
| Lights | 600 W bi-colour COB ×1; 60 W LED panel ×2; 4 ft RGB tube ×1; 4×4 frame with ½ grid; flags | founder |
| Their colour ranges | unknown: each light's CCT range, whether the panels are bi-colour, any green–magenta control | read from the makers' sheets, or typed by the founder, at P4.5 |
| Gels | full CTO and ½ CTO; maker unknown (Lee or Rosco) | maker to confirm; values from that maker's gel book |
| Monitoring | no external monitor; the FX3's own screen and its built-in display LUT; no .cube loader assumed | **default, to confirm** |
| Grading | DaVinci Resolve, DaVinci YRGB Color Managed; input S-Log3 / S-Gamut3.Cine; timeline and output Rec.709 Gamma 2.4 | **default, to confirm** |
| Delivery | Rec.709 Gamma 2.4 SDR master; sRGB for web made from it; no HDR | **default, to confirm** |
| Charts | none owned. Recommended: a 24-patch ColorChecker Classic and an 18% grey card | **default, to confirm** |

A gap is already visible: the sample recipe and set plan ask for ½ CTS, which is not in the kit (§4.1, §10).

### 2.2 From the breakdown: what each value can and cannot tell

| Value | Source today | Used for | What it cannot tell |
|---|---|---|---|
| palette: hex, share, `at` | measured (D-LL-024) | set colours (§4.3), CDL fit (§4.5), grade check (§4.6) | which light lit it; surface, light and grade are mixed |
| tints, shadow / mid / highlight | measured (D-LL-025) | grade check | the same mix |
| saturation | measured | grade check | set saturation and grade saturation apart |
| contrast_stops | measured: 2nd to 98th percentile, at most 10 stops | profile rule (§4.4) | the scene's range (§3) |
| light.key_kelvin | estimate from the fit (held-out median error 445 K, D-LL-037), or manual, or sample | key colour (§4.1) | the fit searches **2800–7000 K only** (`src/core/light-skin.ts`), against a 5600 K white balance, with Tanner Helland's blackbody approximation (`light-render.ts`): a sodium key near 2000 K sits on the 2800 K bound; it assumes the renderer's skin colour (dark skin 475 K median) |
| light.fill_kelvin | manual or sample (the fit does not write it) | fill colour | — |
| light.ratio | manual or sample (the fitted fill is not written, D-LL-037) | key:fill when no face box | — |
| face box | manual (D-LL-033) | cheek statistic: key:fill, skin exposure, skin check | — |
| **new** light.key_gm, light.fill_gm | manual or sample; default 0 | each source's green–magenta (§4.1) | nothing in the frame measures it (§3) |

### 2.3 From the kit (new fields, the Kit colour AD in §7)

Each light's colour range, the gel book we carry, the camera's recording modes, monitoring and charts, field by field
in §7.1. Every number is a `Value` (manual, typed from a cited document, or sample) with its citation.

### 2.4 From the person

| Input | Default | Where |
|---|---|---|
| The lit/graded split (§6) | S0 assumed until a person or the strategy sets it | Breakdown, CAPTURE & GRADE |
| Delivery target | Rec.709 Gamma 2.4 | project |
| Camera body | the kit's (FX3) | kit |
| Frame rate | 24 fps (proposal; to confirm) | project |
| Mains frequency | 50 Hz (India) | location |
| Which light a swatch sits under | the rule in §4.3 | Breakdown, per swatch |
| Face box | none until drawn | Breakdown (exists, D-LL-033) |

---

## 3 · What an 8-bit display-referred reference cannot tell

| It cannot tell | Why | What Look Lab does |
|---|---|---|
| The scene's range | highlights clip at code 255 and shadows sink under the noise floor (2^-10); contrast is capped at 10 stops (D-LL-025) and is the display's, not the scene's | the profile rule treats a clipped or crushed reference as "range unknown" and chooses log (§4.4) |
| The original camera's white balance, profile and gamut | none is recorded in a frame; a still's EXIF is not read for them (D-LL-034 keeps lens tags only) | colours are read as shifts against an assumed 5600 K balance, the light fit's convention (A1) |
| How much colour was lit and how much graded | light colour, surface colour, camera white balance and the grade all land in the same pixels | an assumption the person sees and can change (§6) |
| Colours outside Rec.709 | an sRGB frame holds only Rec.709 colours; whoever made it clipped or compressed the rest | none: such colours are reported as they are in the frame |
| The tone curve | display contrast mixes the scene's lighting ratio with the grade's curve | targets are what our pipeline needs to reproduce the frame (A3, §4.5) |
| Fine colour | H.264 and JPEG halve colour resolution (4:2:0) and quantise; frames are at most 512 px; the palette folds colours under 1% | none; the grade check measures both frames the same way, which cancels much of it |
| The browser's decode | untagged video's range and matrix, and colour management, can move codes; not measured | the same decode for reference and still |
| The display encoding | the instruments decode sRGB (D-LL-025); a Rec.709 master may or may not have been converted for the web | codes are taken as Rec.709 Gamma 2.4 codes (A5) |
| Frame rate, shutter, flicker, motion blur | invisible in one still | from the project and location (§4.4) |

**Named assumptions** (each is shown on the screen where it applies):
- **A1** White balance acts as a mired shift: a source at M_s seen by a camera balanced at M_wb looks like a source at
  M(5600) + (M_s − M_wb) seen by a 5600 K camera; the reference's camera is treated as balanced at 5600 K, the light
  fit's convention (`keyColor` in `light-render.ts`; the Blender truth uses the same, `scripts/blender/plan.ts`).
- **A2** Lights sit on the Planckian locus unless a green–magenta is set. A gel shifts by its published mired value and
  stacked gels add, the makers' own convention; a gel on an LED's spectrum is not modelled.
- **A3** The reference was made by a pipeline like ours: Look Lab finds the scene that our pipeline (camera log → CDL
  → base transform B, §4.5) turns into the reference.
- **A4** A palette swatch is a surface under a mix of the planned key and fill (§4.3).
- **A5** The reference's 8-bit codes / 255 are Rec.709 Gamma 2.4 display codes.
- **A6** For key:fill, the lit cheek receives key plus fill and the shadow cheek fill only, at the same reflectance.

---

## 4 · The outputs and their maths (all T0)

**Conventions.** Mired M(K) = 1,000,000 / K; a positive shift is warmer. A source's **apparent shift** in the
reference is Δ = M(K_seen) − M(5600) (A1). **Green–magenta** is Duv, the signed distance from the Planckian locus in
CIE 1960 (u, v), positive toward green (the sign ANSI C78.377 and Ohno 2014 use; cited at P4.5), shown × 1000 as
"G/M +6". **CCT and Duv** of a chromaticity: the nearest point on the locus in (u, v), the locus from Kim et al.
(2002), the approximation the Blender truth already uses; its licence and any patent are checked before runtime use
(standing rule 8; fallback: Planck's law with the CIE 1931 colour-matching functions, their licence checked).
**S-Log3 code** is the 10-bit code / 1023 in [0, 1], the units of Sony's formula; **IRE %** = (code − 64) / 876 × 100.
**Display code** is a Rec.709 Gamma 2.4 code in [0, 1]. **Each output `Value` takes the weakest source of its inputs**
(the AD-LL-010 order): a plan made from sample inputs is SAMPLE throughout; a key gel chosen from a fitted kelvin is an
ESTIMATE. A number made only from published formulas and document values (the grey card's 40.6 IRE) is MANUAL, its
citation in the tooltip; a default this plan supplies (24 fps, 50 Hz) is SAMPLE until a person confirms it.

### 4.1 Light colour, and the kit setting or gel that gets it

1. **Apparent shifts.** Δ_key from `light.key_kelvin`, Δ_fill from `light.fill_kelvin`. A fitted kelvin on the fit's
   bound (2800 or 7000 K) reads "at or beyond the fit's limit" and is not used until a person sets it.
2. **White-balance source** w: the source with the smaller |Δ| (ties: the fill). The person may pick the other.
3. **Target against the camera's balance.** R_i = λ × (Δ_i − Δ_w), where λ is the lit share (§6). Target mired
   M_i = M_wb + R_i; target kelvin K_i = 1,000,000 / M_i. Green–magenta: Duv_i = the source's `*_gm` if green–magenta
   is lit (§6), else 0, against the camera's tint.
4. **Camera white balance.** Try every white-balance setting the FX3 offers (range and step from Sony's document).
   For each, solve every source (step 5). Choose, in order: the smallest largest |residual|; the fewest gel layers in
   total; the least light lost by gels on the key (from published transmission, when known); the setting nearest
   5600 K. Deterministic.
5. **One source.** Fixtures: available lights, the key on the most powerful by default, the fill on the next; a
   person may reassign. If M_i lies in the fixture's range [M(K_max), M(K_min)], set K_i rounded to the fixture's
   step; the residual is the rounding. Otherwise try every combination of the kit's gels up to three layers (sheets
   permitting): with total shift S, the fixture is set to M_f = M_i − S clamped into its range, and the residual is
   r = M_i − (M_f + S). Choose the smallest |r|, then fewest layers, then most transmission, then gel id order.
   Shown in mired and kelvin: "residual +r mired (K_got − K_i K)", K_got = 1,000,000 / (M_i − r).
6. **Gaps.** A source is a gap when |r| is more than half the smallest |shift| in the kit's gel book (proposal: the
   kit cannot do better than half its finest gel), or no fixture is free; the card says how many mired are missing
   and names the kind of gel that would close it ("a ¼-strength CTO"), never a product. Any gel named in the shot's
   set plan or recipe that is not in the gel book is a gap too (the sample's "½ CTS").
7. **Green–magenta.** When Duv_i ≠ 0: a fixture with green–magenta control whose unit its sheet converts to Duv; else
   plus- or minus-green gels by their published shift; else "set by eye against the grey card". Residual in Duv.
8. **Gel values** come from the confirmed maker's gel book, one citation per gel. If reusing the table's numbers is
   not clearly allowed (standing rule 8): compute the shift from the gel's published conversion (a gel published as
   converting K_a to K_b shifts by M(K_b) − M(K_a), maths), or the founder types each value from the swatch book
   (`manual`, cited "swatch book, typed").

**Worked arithmetic, sample inputs** (key 2000 K, fill 5600 K, λ = 1, w = fill): M(2000) = 500.0, M(5600) = 178.6,
so the key must be **321.4 mired warmer than the camera's balance**. Balanced at 5600 K, the key is 2000 K: +321.4 mired
over a fixture at 5600 K, +187.5 over 3200 K, +129.6 over 2700 K. Balanced at 3200 K (the sample set sheet's
setting), the key must be 1577 K (633.9 mired): +321.4 over 3200 K. Balancing at 5600 K saves 133.9 mired of gel on the
key (the whole tungsten-to-daylight interval), if the fill reaches 5600 K without a gel. Which fixture settings and
gels close the rest is computed from the makers' sheets and the gel book at P4.5.

### 4.2 Key:fill, as a meter reading

From the face box: the cheek statistic (`src/core/cheek.ts`, D-LL-007) on the crop the light fit uses (D-LL-035's
eye-line window) gives y90 and y10, Rec.709 luma of display values. Each goes through B⁻¹ (§4.5) to scene-linear
Y_lit and Y_sh. Then key:fill = (Y_lit − Y_sh) / Y_sh (A6), in stops log2, less any contrast the person gives the grade
(§6). It is the Blender truth's convention: an incident meter at the face, pointed at each light in turn
(`docs/validation.md` §2). Written as an `estimate` only if it meets its tolerance on the held-out set (§9); otherwise,
as D-LL-037 does for the fitted fill, it is not written and the breakdown's ratio (manual or sample) is used.

### 4.3 Set and wardrobe colours: which must physically exist

For each palette swatch j:
1. **Target** t_j: the S-Log3 code of B⁻¹(swatch) (§4.5).
2. **Light mix.** A neutral surface at the swatch's scene luminance, under α × key + (1 − α) × fill as planned (each
   source's colour as linear S-Gamut3.Cine RGB against the white-balance white, normalised to luminance 1). α runs
   0 to 1 in steps of 0.01; keep the α with the smallest ΔE00 between the swatch and what the pipeline makes of that
   surface. A person may pin a swatch to the key, the fill or a mix.
3. **Verdict.**
   - **LIGHT**: within T_light with the CDL at identity: the colour comes from the light on a neutral surface.
   - **GRADE**: within T_light only with the fitted CDL, and the CDL's move at that colour is cheap:
     ΔE00(B(c), B(CDL(c))) ≤ T_move and chroma gain ≤ T_chroma.
   - **SET**: neither. It must be in front of the lens. Its physical colour is the swatch divided by the mix's
     colour, channel by channel in linear light (von Kries), rescaled to the swatch's luminance, shown as hex
     (sRGB, under daylight-balanced light) with L*, C*, h. When any channel of the mix is under 5% of its largest, the
     physical colour reads "cannot be told under this light" (a 2000 K key through a 5600 K balance carries blue at
     about 1% of its red: linear RGB 0.654 : 0.195 : 0.007 for a grey of luminance 0.279, maths).
   - A SET colour with physical C* ≥ 20 is flagged "saturated: source it" (proposal: under C* 20 a surface reads as
     a tinted neutral). Swatches under 3% share are listed, never flagged (proposal: details the frame can lose).
4. **Thresholds (proposals, checked in §9.4).** T_light = 5 ΔE00: the palette's own merge distance, under which two
   colours are one colour at palette scale (D-LL-024). T_move = 10 ΔE00 and T_chroma = +10 C*: where a 10-bit 4:2:0
   capture is expected to stay free of visible noise and banding; §9.4 confirms or replaces both.

**Why the grade cannot stand in for a set colour.** A CDL is global: the same function of R, G and B everywhere in the
frame. It can make dark things bluer and bright things warmer; it cannot make one object a different hue from its
neighbours of the same brightness. That takes the colour in front of the lens, or a secondary in Resolve (a qualifier
or a window), which costs time, noise and banding. Look Lab plans no secondaries.

**Illustration on the sample palette** (computed 2026-10-02; key 2000 K and fill 5600 K, sample; white balance
5600 K; CDL at identity; plain sRGB decode standing in for B, so the real numbers from `colour.plan_capture` differ):

| Swatch | Share | L* | C* | hue | Best key share α | ΔE00 to a neutral under that mix | Reading |
|---|---|---|---|---|---|---|---|
| #1B2230 | 38% | 13.2 | 10.3 | 277° | 0.00 | 8.4 | not the light; the shadows' blue (sample tint "blue −6") is a GRADE candidate |
| #3E4A52 | 22% | 30.7 | 6.9 | 247° | 0.00 | 6.5 | as above |
| #C7803A | 14% | 59.8 | 52.5 | 66° | 0.88 | 2.2 | **LIGHT**: the key on a neutral surface (a grey under the key alone reads hue 66°, C* 69). No orange paint needed |
| #6E5B4A | 11% | 40.1 | 13.6 | 69° | 0.32 | 3.7 | LIGHT |
| #E9C9A0 | 9% | 82.7 | 25.3 | 78° | 0.35 | 9.0 | not yet explained; B's highlight shoulder will move it; re-run with B |
| #0D0F12 | 6% | 4.3 | 1.8 | 268° | 0.00 | 1.7 | LIGHT |

### 4.4 The camera

- **White balance** K and tint from §4.1, set by number, never auto.
- **Profile and gamut** (rule, proposal). **S-Log3 / S-Gamut3.Cine** when any of: a grade is planned (the founder's
  default, so this is the usual answer); the reference's scene range (B⁻¹ of the display codes at its 2nd and 98th
  percentiles of luminance, in stops) plus 1 stop each end, exceeds the documented range of the other profile; the reference is clipped (≥ 0.5% of the
  active picture at code 255 in a channel) or crushed (contrast at the 10-stop cap, or the 2nd percentile on the noise
  floor), so its range is unknown. **S-Cinetone** only when no grade is planned, the CDL is within 3 ΔE00 of identity
  on every swatch, and the range fits. **HLG** never (no HDR). A profile whose range Sony does not document is never
  chosen on range grounds. **S-Gamut3.Cine** over S-Gamut3: the founder's Resolve input, and every colour of an sRGB
  reference lies inside Rec.709 (that S-Gamut3.Cine contains Rec.709 is checked from Sony's primaries at P4.5).
- **Base ISO**: 800 by default; 12,800 when a person says the light cannot reach the exposure. The check needs
  fixture output and distance (P6). Both base ISOs from Sony's document.
- **Exposure targets in S-Log3.** 18% grey: code 420 of 1023, **40.6 IRE** (maths from Sony's formula, compared with
  Sony's own stated figure at P4.5). Skin, key side: the S-Log3 code of the lit cheek's scene value from §4.2 (needs
  the face box). Above the toe one stop is 261.5 × log10 2 = **78.7 ten-bit codes** (maths). Read on the zebra or
  waveform, whichever the FX3 has (Sony's document).
- **Recording** (rule, proposal). S-Log3 is recorded 10-bit, always. **4:2:2** when the grade carries any colour
  difference between the sources (λ < 1), or the CDL moves any LIGHT or GRADE swatch by more than T_move, or a SET
  colour is flagged saturated; otherwise 10-bit 4:2:0 is acceptable. **All-Intra** (XAVC S-I) when the CDL move exceeds
  T_move. Codec names and which modes give which chroma: Sony's document. §9.4 tests the reasons.
- **Frame rate and shutter.** Frame rate from the project (default 24 fps, to confirm). 180°: t = 1 / (2 × fps).
  Flicker: when mains is 50 Hz and any source on set is not marked flicker-free (practicals included), lamps on mains
  pulse 100 times a second, so the exposure time is the whole multiple of 1/100 s nearest 1/(2 × fps): at 24 fps
  **1/50 s = 172.8°**; at 25 fps 1/50 s is 180° (maths). Whether the FX3 offers 172.8°: Sony's document.
- **RAW**: not available (no recorder).
- **Charts, at the head of every setup**: the ColorChecker and the grey card at the subject's mark, under the key (a
  second take under the fill when the two differ in colour), at the shot's white balance, exposure and lens, about a
  third of the frame, two seconds. Without them (today): no white-balance or exposure reference in any shot; the grade
  check can compare only region statistics (palette, tints, contrast, cheeks), no patch by patch.

### 4.5 The grade start: the CDL and the LUTs

**The pipeline P, in this order** (the .cube encodes exactly this):

| Step | Operation | Space | Source |
|---|---|---|---|
| 0 | input | S-Log3 code, S-Gamut3.Cine RGB, [0, 1] = 10-bit code / 1023 | — |
| 1 | CDL SOP per channel: out = clamp((in × slope + offset) ^ power) | S-Log3 code | ASC CDL v1.2 (clamp points as the document states) |
| 2 | CDL saturation: luma = 0.2126 R + 0.7152 G + 0.0722 B; out = luma + sat × (in − luma); clamp to [0, 1] | S-Log3 code | ASC CDL v1.2 (these Rec.709 weights whatever the space, as the ASC defines) |
| 3 | S-Log3 decode: for in ≥ 171.2102946929 / 1023, x = 10^((in × 1023 − 420) / 261.5) × 0.19 − 0.01; else x = (in × 1023 − 95) × 0.01125 / (171.2102946929 − 95) | scene-linear S-Gamut3.Cine; 18% grey = 0.18 | Sony, "Technical Summary for S-Gamut3.Cine/S-Log3 and S-Gamut3/S-Log3" |
| 4 | 3 × 3 matrix S-Gamut3.Cine → Rec.709, both D65, built from the published primaries (RGB → XYZ → RGB) | linear | Sony (primaries); ITU-R BT.709 |
| 5 | negatives to 0; times exposure e; per channel T(x) = x (1 + x / W²) / (1 + x) | display-linear [0, 1] | Reinhard et al. 2002, "Photographic Tone Reproduction", eq. 4 |
| 6 | V = L^(1/2.4), clamp to [0, 1] | Rec.709 Gamma 2.4 display code | ITU-R BT.1886, black level 0 |

**B**, the base transform, is steps 3 to 6: Look Lab's own, no maker's look. Its parameters (proposal) solve two
equations: 18% grey lands on display code 0.409, where the ITU-R BT.709 camera curve puts it, so T(0.18 e) = 0.409^2.4
= 0.117; and the camera's clip lands on white, T(e × L_clip) = 1, so W = e × L_clip. L_clip is the FX3's S-Log3 clip
in scene-linear, from Sony's document; until it is read, 38.42, the formula's value at code 1023 (7.74 stops over grey,
maths). **B⁻¹** is closed form: the quadratic inverse of T, the matrix inverse, S-Log3 encode. A reference channel at
code 1.0 maps to L_clip and is flagged "clipped: true value unknown". **Alternative B**: Sony's published S-Log3 to
Rec.709 LUT, if its licence allows a derived .cube; it matches the camera's own display look but must be inverted
numerically. Chosen at P4.5 (open question 7).

**The CDL fit.**
- Unknowns: slope, offset, power (three each) and saturation; start at identity.
- Data: the LIGHT and GRADE swatches of §4.3. SET swatches are left out: their colour is made on set. Source c_j: the
  S-Log3 code of the neutral surface under the planned mix (§4.3, step 2, with λ). Target t_j (§4.3, step 1).
- Objective: Σ share_j × ‖CDL(c_j) − t_j‖² in S-Log3 code units (the CDL's own encoding, where equal steps are near
  equal in stops), plus ρ × ‖parameters − identity‖², ρ = 10⁻³ (proposal), so whatever the data does not constrain
  stays at identity. Saturation is held at 1 unless the person puts saturation in the grade (§6).
- Solver: Levenberg–Marquardt, central-difference Jacobian (h = 10⁻⁶), at most 100 iterations, stop when the objective
  improves by less than 10⁻¹² relative; bounds (proposal) slope and power 0.25–4, offset −0.5 to 0.5, saturation 0–2.
  Two passes: classify (§4.3) at identity, fit, classify again with the fit, fit again. Same inputs, same numbers.
- Reported: the ten numbers to 4 decimals, the residual per swatch in ΔE00 after the whole pipeline, and its
  share-weighted mean.

**Exports.**
- `<shot>.cdl`: ASC CDL XML, one ColorDecision with one ColorCorrection, id `<project>_<shot>_v<plan version>`,
  SOPNode (Slope, Offset, Power) and SatNode (Saturation), element names and namespace exactly as the ASC CDL v1.2
  document gives them, and a Description: "Apply to S-Log3 / S-Gamut3.Cine code values, before any display transform
  (Look Lab P-LL-001, pipeline steps 1–2)". A CDL's numbers mean nothing without the space they are applied in.
- `<shot>_look.cube`: 33-point 3D LUT of P with the CDL (steps 1–6). `<shot>_base.cube`: B alone (steps 3–6), so a
  colourist can put the .cdl in a node before it and change it. Format: Adobe "Cube LUT Specification 1.0" (TITLE,
  LUT_3D_SIZE 33, DOMAIN_MIN 0 0 0, DOMAIN_MAX 1 1 1, 35,937 rows "R G B", red index fastest, 6 decimals; details
  read from the document). The input is the full range 0–1 = S-Log3 code / 1023.
- **In Resolve.** Under DaVinci YRGB Color Managed (the default) nodes work in the timeline's space, where a CDL
  fitted in S-Log3 codes means something else. Safe route: a DaVinci YRGB (not managed) timeline, node 1 the .cdl and
  node 2 `_base.cube`, or `_look.cube` alone. Whether a colour-managed project can run one node in the camera's log
  space is confirmed for the founder's Resolve version (open question 4).
- **On set** the FX3 shows its built-in display LUT, not ours (founder's default). If Sony's documents show the FX3 can
  load a user .cube for monitoring, `_look.cube` goes on the camera (open question 6).

### 4.6 The grade check

**Input**: a still from our test shoot or from the grade, imported through the browser like a reference (D-LL-027),
with its kind stated by the person: **display** (graded, Rec.709 Gamma 2.4 codes) or **log** (S-Log3 codes straight
from the camera), which is first put through `_look.cube` in `src/core` (trilinear) so like is compared with like.
Optional: a face box on the still; the chart's four corners (patch centres by bilinear interpolation of a 4 × 6 grid,
the median of each patch's middle half).

**Measured on both** with the existing instruments, active picture only (D-LL-029). Verdicts are proposals until §9
has measured each instrument's own noise; a D record then fixes them.

| Measure | How | Pass | Close | Reason |
|---|---|---|---|---|
| Each reference swatch | the still's palette, matched one-to-one by the Hungarian method on ΔE00 (least total); unmatched swatches read "missing in still" or "extra in still" | ΔE00 ≤ 3 | ≤ 6 | the palette returns known colours within ΔE00 2 (P2), so 3 is its error plus a margin |
| Palette, overall | share-weighted mean ΔE00 of the matched swatches; share missing | ≤ 3 | ≤ 6 | as above |
| Share of each swatch | difference in points | ≤ 3 | ≤ 6 | the palette's share is good to ±2 points (P2) |
| Contrast | difference in stops (D-LL-025) | ≤ ⅓ | ≤ ⅔ | a third of a stop is the step a crew sets |
| Saturation | difference in points | ≤ 3 | ≤ 6 | replaced by twice the instrument's noise measured in §9 |
| Tints, each zone | distance between mean (a*, b*) | ≤ 2 | ≤ 4 | D-LL-025 calls a zone under chroma 2 neutral |
| Skin, cheeks only (D-LL-007) | lit:shadow ratio in stops; warmth (red over blue of the lit fifth); needs both face boxes | ≤ ⅓ st; ≤ 0.05 | ≤ ⅔ st; ≤ 0.10 | as contrast; warmth a proposal |
| Light colour on set (log still with chart) | grey patch decoded, the plan's camera balance undone (times its white in S-Gamut3.Cine linear), CCT and Duv taken: the light's real colour, against the plan's target for the light the chart stands under | ≤ 10 mired, Duv ≤ 0.002 | ≤ 20 mired | 10 mired is 7.5% of the tungsten-to-daylight interval (133.9 mired) |
| Exposure (log still with chart) | grey patch's luminance as an S-Log3 code, against 420 | ± 26 codes (⅓ stop) | ± 52 | §4.4: 78.7 codes a stop |

Anything beyond Close reads **far**. A reference swatch missing from the still reads far when its share is 3% or more,
and is listed only below that (§4.3's floor). **Nearest-swatch matching was rejected**: two reference swatches can match one
still swatch and hide a colour the still has lost. Without a chart, or on a display still, there is no light-colour or exposure row.

---

## 5 · Where a model may help

Only to **choose the strategy**: put the colour in the light, capture neutral and grade, or both. `colour.choose_strategy`
is T2 and returns one of the three with one sentence of reason and the model's own rating, shown "AI · n" (D-LL-042);
under 60 it goes to review (R5). It sends numbers and words only (D-LL-039): palette hex and share, tints,
saturation, contrast, key and fill kelvin with their sources, the kit's fixture and gel names. Never pixels. The model
sets **no number**: each strategy maps to the presets in §6, and λ is edited by a person. Ask (P4) may explain the plan
in words, quoting only numbers in the record. With No AI on, or no key, the strategy is set by hand and S0 is assumed
until it is. **Proposed rule R15**: a colour strategy comes from a person, else from T2 (R5 applies), else S0 is assumed
and says so; no colour number is ever routed to a model.

---

## 6 · The lit/graded split

One graded frame cannot say how much of its colour was lit and how much was graded. The plan therefore states its
assumption, shows it, and lets a person move it.

**S0, the default: the light carries the white-balance difference between the sources; the grade carries the rest.**
The rest is: the white-balance source's own shift (Δ_w), the zone tints the lights do not explain, any saturation or
contrast the person gives the grade.

| Control | Meaning | S0 | Light | Grade | Both |
|---|---|---|---|---|---|
| λ, lit share | share of the colour difference between sources made with light | 100% | 100% | 0% | 50%, editable |
| White-balance source | the source the camera is balanced to | the more neutral | same | same | same |
| Green–magenta in light | whether a source's `*_gm` is lit | no | yes, where set | no | yes, where set |
| Saturation in grade | the CDL's saturation | 1.00 | 1.00 | fitted | 1.00 |
| Contrast in grade | stops the grade adds above the lighting | 0 | 0 | 0, editable | 0 |

With contrast k in the grade, the capture's luminances are compressed about 18% grey: Y_cap = 0.18 × (Y / 0.18)^((s − k)
/ s), where s is the scene range in stops (§4.4), and key:fill drops by k × (its stops / s); the CDL fit then has to
add the contrast back. With saturation σ in the grade, SET colours are computed through the inverse saturation, so the
set is less saturated and the grade adds it.

Until a person or the strategy sets it, the plan records no strategy `Value`; it runs on S0 and every screen and the
card say "Split: S0 assumed (not chosen)". `colour.set_split` records a person's choice (`manual`); the plan
recomputes.

---

## 7 · Contract changes (each its own AD at P4.5, numbered then; all additive)

Every new field is optional or defaulted, so stored records still parse and `schema_version` stays 1. Every number
stays a `Value` (architecture §5). The founder says yes to each AD before code (architecture §12).

1. **The Kit colour AD.** Each `light` item gains `colour`: `cct_min_k`, `cct_max_k`, `cct_step_k`, `gm` (min, max,
   the unit as the maker writes it, Duv per unit or null), `rgb`, `flicker_free`, each a `Value`, with a `cite`.
   `Kit` gains `gels[]` (id, maker, number, name, `mired_shift`, `converts` [from K, to K] or null, `duv_shift`,
   `transmission_pct`, sheets, `cite`); `camera.recording` (profiles with gamuts, base ISOs, clip level and documented
   range; codecs with bit depth, chroma and intra; RAW and whether a recorder is in the kit; white-balance range and
   step; tint range, unit and Duv per unit; shutter angles; display LUTs; `user_lut`); `monitoring` (external
   monitor, loads .cube, cube sizes); `charts` (ColorChecker kind or none, grey card). `Cite` is {document, page or
   URL, date read, licence: ok | unclear | typed-by-founder}. Whether a document's number should get its own
   `Value.source` instead of `manual` is open question 9.
2. **The Project and Location colour AD.** `Project.colour`: delivery (`rec709_g24`), web (same codes or converted),
   grading app, colour management (`rcm` or `yrgb`), frame rate (a `Value`). `Location.mains_hz` (a `Value`, 50).
3. **The Breakdown and colour-plan AD.** `Breakdown.light` gains `key_gm` and `fill_gm` (Duv, editable). A new record
   **ColourPlan**, one per shot, version number rising with each run, at `projects/<id>/colour/<shot_id>.json`: the
   inputs' fingerprint; the split (strategy `Value` or null, λ, white-balance source, green–magenta lit, saturation and
   contrast in grade, per-swatch light pins) and the assumption ids in force; camera (profile, gamut, base ISO, white
   balance and tint, exposure targets, recording, frame rate, shutter, and why); lights (target K and Duv, mired from
   the balance, fixture and setting, gels, residual, gap); key:fill; set colours (verdict, ΔE00s, physical colour or
   "cannot be told"); charts; monitoring; grade (the ten CDL numbers as `Value`s, the space they apply in, residuals,
   the base transform's id and parameters); gaps. Rejected: putting it inside `Breakdown` (the breakdown holds what
   was read from the reference; the plan is derived from it, the kit and the split, and changes when they change).
4. **The Set Sheet capture-card AD.** `SetSheet` gains `capture` (the crew-facing fields of the ColourPlan, copied when
   the sheet is generated, so the sheet does not change under the crew) and `colour_plan_version`.
5. **The still and grade-check AD.** **Still**: project, shot, file facts (`MediaFile`), its one frame, kind (display
   or log), face box, chart corners. **GradeCheck**: still, reference and frame, plan version, whether the LUT was
   applied, a row per measure (reference and still `Value`s, difference, unit, verdict, threshold version) and a row
   per swatch.

---

## 8 · Actions

All in the registry (AD-LL-002), with input and output schemas and a decision row each. New commands must also appear
in the design export's catalogue (the parity test), so they come from `prompts/08`; getters and on-frame helpers are
`command: false`.

| Action | Tier | Effect | Confirm | Writes | Screen |
|---|---|---|---|---|---|
| `colour.plan_capture` | T0 | write | no | ColourPlan (§4.1–4.4, and the CDL fit) | Breakdown, CAPTURE & GRADE: "Plan capture" |
| `colour.fit_cdl` | T0 | write | no | the plan's grade only (after a split change) | Breakdown: "Fit grade" |
| `colour.set_split` | T0 (a person's edit, as `breakdown.edit_value` is) | write | no | the split, `manual` | Breakdown: the split controls |
| `colour.choose_strategy` | T2 | spend | no | the strategy, `ai` with confidence, routed by R5 | Breakdown: "Choose strategy (AI)" |
| `colour.export_cdl` | T0 | read | no | nothing; returns the .cdl text | Breakdown: "Export .cdl" |
| `colour.export_lut` | T0 | read | no | nothing; returns `_look.cube` or `_base.cube` (about 1 MB of text: measure it, or build the file in the browser from the same core function) | Breakdown: "Export .cube" |
| `colour.import_still` | T0 | write | no | Still and its frame | Grade check: drop a still |
| `colour.check_grade` | T0 | write | no | GradeCheck | Grade check: "Check grade" |
| `colour.set_still_face`, `colour.set_chart` | T0 helpers (as `breakdown.set_face`) | write | no | the still's face box, chart corners (`manual`) | `command: false` |
| `colour.get`, `colour.get_check` | T0 | read | no | — | `command: false` |
| `adapt.set_kit_colour` | T0 (as `adapt.add_kit`) | write | no | the Kit colour fields, `manual` with `cite` | Location & Kit: kit colour editor |
| `setsheet.generate` (exists) | T0 | write | no | now also copies the capture card | Set Sheet |

The domain `colour` has no underscore, so its MCP names map one-to-one (`colour_plan_capture`, D-LL-016). No colour
action is a stand-in: each ships real or not at all.

---

## 9 · Validation plan (tolerances written now, before anything runs)

**A pass is a claim about the Blender set only.** The set's references are made by our own pipeline from Blender's
light transport, so what it shows is that our maths is consistent and can recover a known balance, gel and grade; not
that our pipeline equals Sony's processing, a real gel on a real LED, or Resolve.

### 9.1 Maths tests (unit; no Blender)

| Test | Tolerance |
|---|---|
| Mired arithmetic, gel search (exhaustive up to 3 layers, tie order) | exact (10⁻⁹); hand-worked cases incl. §4.1's |
| S-Log3 encode then decode, 0–1023 | ≤ 10⁻⁹ |
| S-Log3 against Sony's published table (if its use is allowed) | every row within 0.5 of a 10-bit code (the table's rounding) |
| S-Gamut3.Cine ↔ Rec.709 matrices | white to white and each primary round trip within 10⁻⁶ |
| CCT and Duv: points built on the Kim locus, and ±0.005 off it | CCT within 1 K, Duv within 10⁻⁵ |
| CDL forward against the ASC's published examples (if allowed; else hand-worked cases) | at the document's precision |
| CDL fit on exact correspondences from a known CDL (24 chart patches) | each parameter within 10⁻³ |
| .cube and .cdl: write, parse, compare | identical at the printed precision |
| Identity LUT (CDL identity, B replaced by identity), trilinear | within 10⁻⁵ |
| `_look.cube` (trilinear) against the exact pipeline, 10,000 seeded log codes | ΔE00 99th percentile ≤ 1.0, worst ≤ 3.0 (under a just-noticeable difference side by side) |
| B then B⁻¹ over 0–1 display codes | within 10⁻⁶ below the clip |

### 9.2 The Blender colour set

- **Scenes.** The P3 head (same script) beside a chart and a grey card, a neutral wall (one of P3's backgrounds) and
  one painted prop of known colour (C* 30–60). The chart is ColorChecker-valued if X-Rite's published values may be
  used; otherwise a 24-patch chart whose values are defined in the generator (6 greys, 18 colours on a CIELAB grid),
  which needs no licence and is not called a ColorChecker.
- **Varied, from a seed.** Key kelvin 2900–6800 K (the fit's tested range) and, on separate rigs, 1900–2700 K (sodium
  to tungsten-warm); key Duv 0 on two rigs in three, ±0.006 on the rest; fill kelvin 3200–7500 K; key:fill 0.5–3.5
  stops; camera white balance 3200, 4300, 5600 or 6500 K, tint Duv 0 or ±0.004; exposure ±1 stop; a known CDL drawn
  within slope and power 0.8–1.25, offset ±0.05, saturation 0.7–1.4 (identity on a quarter of rigs); light and dark
  skin, as in P3.
- **Made.** Blender renders scene-linear Rec.709 (float). A Node script, using `src/core`, applies the camera:
  Rec.709 → S-Gamut3.Cine linear, white balance as a diagonal in S-Gamut3.Cine linear, exposure, seeded noise, S-Log3,
  10-bit (and 8-bit for §9.4) — the **camera file**; then the known CDL and B, written as an 8-bit PNG — the
  **reference**, like any imported frame. Truth beside each: every varied number, the chart's patch truth, the face
  box, the chart's corners, the prop's colour.
- **Split.** `dev` seed 3, 8 rigs × 2 skins = 16 scenes; `test` seed 4, 12 rigs × 2 = 24, run once for the number.
  The generator is deterministic and its truth is tested without Blender, as in P3. Committed size at most 15 MB
  (proposal: 384 × 216, the float renders kept as half floats, compressed; camera files and references regenerated
  by the test from them).

### 9.3 Tolerances on the held-out set (written 2026-10-02)

| What | Pass | Reason |
|---|---|---|
| White balance from the grey patch: (light − camera) in mired | median ≤ 5 mired, worst ≤ 10; Duv median ≤ 0.001 | the camera model is inverted exactly, so only noise is left; 5 mired is under 4% of the tungsten-to-daylight interval |
| CDL fit recovers the known grade, on rigs whose truth follows the plan's assumptions (λ = 1; the true key and fill colours given by hand, so the fit's kelvin error stays out) | share-weighted ΔE00 between the fitted and true grades' outputs: median ≤ 1.0, worst ≤ 2.0; parameters reported, not asserted (slope and power trade off) | output is what the crew sees |
| Grade check measures a known CDL (reference with the CDL against the same reference without) | per swatch \|reported − true ΔE00\| median ≤ 1.0, worst ≤ 2.0; contrast within 0.1 stop; saturation within 1 point; tints within 1 | the check must see a grade it is shown |
| Grade check of a scene against itself | every row 0 (exact); against a second noise draw: reported as the instruments' noise, which replaces the saturation and swatch thresholds' reasons | the floor of every verdict |
| Set colours: the painted prop and the light-coloured wall | prop read SET and wall LIGHT on ≥ 90% of scenes; prop's physical colour within ΔE00 5 median | the rule of §4.3 on a known answer |
| Key:fill from the cheeks | median error ≤ 0.5 stop, light and dark skin each; else not written (as D-LL-037) | a meter is set in thirds |
| Skin exposure target against the camera file's lit cheek | median within 26 ten-bit codes (⅓ stop) | as above |
| Key colour through the plan (fit's kelvin → mired from the balance), 2900–6800 K rigs | median ≤ 35 mired, dark skin reported apart | the fit's 445 K median (D-LL-037) is 25–31 mired at 4000 K, by its sign; the plan must not add error |
| Keys at 1900–2700 K | asserted: the plan says "at or beyond the fit's limit" and asks for the value; error reported, not asserted | the fit cannot reach them |

### 9.4 Noise and banding: the thresholds' test (synthetic, `src/core` only)

A flat patch and a slow gradient, captured as S-Log3 at 10-bit and 8-bit with seeded noise, chroma subsampled 4:2:2
and 4:2:0 in Rec.709 Y′CbCr, graded by CDLs of rising strength. Measured: noise (standard deviation of the flat patch
in ΔE00), banding (largest step between neighbouring output levels along the gradient, in ΔE00), and error at a
saturated colour edge. **Declared now:** a grade move is "cheap" while noise grows by less than 25% and the largest
gradient step stays under 1 ΔE00. The run reports the ΔE00 and chroma moves at which 10-bit 4:2:0, 10-bit 4:2:2 and
8-bit cross that line; T_move, T_chroma and the recording rule (§4.4) are then kept or replaced by a D record.

---

## 10 · The capture card for shot 12C, as the crew reads it

Inputs are the design's **sample** values for 12C; nothing on this card was measured. Each line ends with the badge the
screen shows (§4 conventions) and, before it, why the number is what it is. [Brackets] are read from a document at P4.5.

```
NEEL · SC 12 KITCHEN, NIGHT · SHOT 12C · CAPTURE CARD           plan v1 · inputs SAMPLE (design data, not measured)
Split: S0 assumed (not chosen): light carries the key/fill colour difference; grade carries the rest

CAMERA · Sony FX3
  Profile     S-Log3 / S-Gamut3.Cine      a grade is planned (Resolve) · rule §4.4 · [Sony]        SAMPLE
  Base ISO    800                         12,800 only if the key cannot reach exposure (P6) · [Sony] SAMPLE
  White bal.  5600 K, tint 0, by number, never auto · balanced to the fill                         SAMPLE
  Exposure    grey card 40.6 IRE (S-Log3 code 420) · Sony's S-Log3 formula                         MANUAL
              skin, key side: needs the face box (none drawn on 12C)
  Record      10-bit; 4:2:2 and All-Intra (XAVC S-I) if the grade moves a colour > 10 ΔE00 · [Sony] SAMPLE
  Shutter     24 fps · 172.8° (1/50 s): 50 Hz mains; the kitchen pendant may flicker              SAMPLE

LIGHTS · the key must be 321.4 mired warmer than the camera's 5600 K
  Key    2000 K target (500.0 mired)                                                                SAMPLE
         600 W COB at its warmest [maker's sheet] + full CTO [gel book] + ½ CTO [gel book]
         needs +187.5 mired over a 3200 K setting, +129.6 over 2700 K                               SAMPLE
         residual: from the gel book at P4.5
         GAP  the set plan and recipe name "½ CTS": not in the kit's gel book
  Fill   5600 K = the camera's balance: 60 W panel at 5600 K, no gel, if its range reaches [sheet]  SAMPLE
  G/M    none lit: no green–magenta set on either source · S0
  Ratio  key:fill 8:1 (3 stops): incident meter at the face, pointed at each light in turn          SAMPLE

SET & WARDROBE COLOURS · re-run with B (P-LL-001 §4.3)
  #C7803A  14%  orange  LIGHT: the key on a neutral surface; no orange paint needed                 SAMPLE
  #6E5B4A  11%  brown   LIGHT                                                                       SAMPLE
  #1B2230  38%  blue    GRADE candidate: shadow blue; else blue-grey walls must exist               SAMPLE
  #3E4A52  22%  slate   GRADE candidate                                                             SAMPLE
  #E9C9A0   9%  beige   SET unless the fitted grade explains it; physical colour at P4.5            SAMPLE
  #0D0F12   6%  black   LIGHT                                                                       SAMPLE

CHARTS   ColorChecker Classic + 18% grey card at the head of every setup · GAP: none owned
MONITOR  FX3 screen, its built-in display LUT [Sony] · 12C_look.cube is for the colourist
GRADE    start: CDL fitted at P4.5, in S-Log3 codes, before any display transform
         files: neel_12C_v1.cdl · 12C_look.cube · 12C_base.cube (33-point, to Rec.709 Gamma 2.4)
         check against: each swatch ΔE00 ≤ 3 · contrast within ⅓ stop · tints within 2 · cheeks
```

The phone view keeps the same order, one block per screen. On paper every [bracket] is filled, or the line reads
"needs <document>", never a guessed number.

---

## 11 · Risks and open questions

**Risks.**
1. **The default split is wrong for a heavily graded reference** (teal-and-orange): S0 gels the set for a look made in
   the grade. Mitigation: the split, the strategy and the CDL residual are on the screen; the person moves λ.
2. **Warm keys sit on the fit's 2800 K bound.** Sodium looks, the sample's own, get no fitted kelvin; the person types
   it. Extending the fit's range is a P3 change with its own validation, not P4.5's.
3. **Skin biases the fitted kelvin** (the fit assumes one skin colour; dark skin 475 K median): every gel choice from
   it is an ESTIMATE.
4. **Gels on LEDs** do not shift exactly as published (A2): the card says "check on the chart".
5. **Resolve's managed pipeline is not ours**: the CDL means what it says only in S-Log3 codes (§4.5).
6. **Licences** may forbid Sony's tables, the gel books, the ASC examples or X-Rite's values: each has the fallback
   given where it is used; unclear means no (standing rule 8).
7. **The Blender set is circular in part** (§9): it proves consistency and recovery, not real cameras.
8. **No charts owned**: until bought, the grade check has no light-colour or exposure row.
9. **Memory**: building a 33-point LUT is 35,937 pipeline runs; measured at P4.5 against the engine's 150 MB.

**Open questions for the founder** (each with this plan's default):
1. Frame rate: 23.976, 24 or 25 fps? Default 24, with 172.8° under 50 Hz mains.
2. Gel maker: Lee or Rosco? And may we type the values from your swatch book if the gel book's licence is unclear?
3. Makes and models of the COB, the panels and the tube, so their sheets can be read: bi-colour? green–magenta?
   flicker-free?
4. Will the colourist apply our .cdl in S-Log3 (a YRGB node before `_base.cube`), or stay colour-managed? Which
   Resolve version?
5. Buy a ColorChecker Classic and an 18% grey card? Default: recommended, not assumed.
6. FX3 firmware version: if it loads a user .cube for monitoring, the shot's LUT goes on the camera.
7. Base transform: Look Lab's own curve (default; no licence needed) or Sony's S-Log3 to 709 LUT if its licence allows?
8. The sRGB web file: the master's codes unchanged (default), or converted?
9. A number typed from a maker's document: `manual` with a citation (default), or a new `Value.source` (an AD)?
10. S-Log3 exposure: Sony's nominal grey (default), or does the DP rate the camera over (exposing brighter)?
