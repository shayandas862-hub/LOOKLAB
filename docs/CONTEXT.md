# Look Lab — Living Glossary (CONTEXT)

> The project's shared vocabulary. Read it before inventing a term. Definitions
> state what a term means **now**; supersede in place. Each entry cites the record
> that settled it where there is one.

## The work

**Reference** — a frame or a video the team wants to learn a look from. Known by its file's name, type, size, date and SHA-256; the file itself is not copied and its path is not known (D-LL-027). Its sampled frames are stored. Never uploaded unless the project allows cloud (standing rule 7).

**Sampled frame** (also **analysis frame**) — one frame of a reference, taken at 2 per second (fewer past 5 minutes, at most 600), scaled to at most 512 px on its long side and stored as PNG. Frame i is at i / sample_fps seconds. Every T0 instrument measures sampled frames, never the original (D-LL-027).

**Cut** — a boundary between two shots of a reference, found from colour-histogram distance with an adaptive threshold; a fade or dissolve is not a cut (D-LL-026).

**Key frame** — the middle sampled frame of a reference shot. A breakdown measures the longest shot's key frame unless another frame is chosen (D-LL-026).

**Active picture** — the part of a frame inside letterbox or pillarbox bars. Palette, tone and aspect are measured on it (D-LL-029).

**Shot** — one continuous take inside a reference, or one planned shot in a scene (`12C`). A reference's shots are detected; a scene's shots are planned.

**Breakdown** — the measured and estimated description of one shot's look: palette, tints, saturation, contrast, light, lens, framing, mood. Every leaf is a Value.

**Value** — `{ value, unit?, source, confidence?, updated_by, updated_at }`. `source` is one of, strongest first (AD-LL-010):
- **measured** — computed by a T0 instrument from the actual pixels;
- **manual** — typed or set by a person;
- **metadata** — read from the original file's own tags (the EXIF focal length), not from pixels and not typed by a person;
- **estimate** — a T0 fit of a model to the actual pixels (the light fit): true only as far as the model's assumptions. Reads ESTIMATE, never MEASURED, even after a synthetic set passes;
- **ai** — a model's answer (mood words since P4), always with the model's own confidence 0–100, shown as "AI · n" and never as a percentage, because nothing checks it (D-LL-042); below 60 goes to review (R5). It names the decision row that wrote it (`decision_id`, AD-LL-013);
- **sample** — placeholder data from the design or a stand-in. Never shown as anything else (D-LL-015).

**Face box** — a box a person drags around a face on a sampled frame, hairline to chin and cheek to cheek, stored with the frame it was drawn on. The light fit runs on it; a new file drops it (D-LL-033).

**Light fit** — `breakdown.fit_light`: v0.2's renderer and search, scored on the face's skin as a brightness pattern (D-LL-035). Writes key direction and key colour as estimates; fill ratio and hardness only if they meet their tolerance on the held-out set (D-LL-037).

**Confidence score (of a fit)** — 0–100, how much better the fitted direction explains the skin than the best direction 45° or more away. A rank, not a probability; shown only because it ranked with error on the held-out set (D-LL-036).

**Shot size (R2)** — named from the face box: the face's height over the active picture's height, ECU ≥ 0.70 … EWS < 0.07 (D-LL-046). A T0 definition, written as an estimate; not a measurement of the scene.

**Review queue** — the AI values under 60 that no person has confirmed (R5). A person's click on "Confirm …" is the approval (`breakdown.review`, T3); it records "agreed" on the decision that wrote the value (D-LL-049). A new AI value is queued afresh.

**Blender set** (also **ground-truth set**) — renders of one head built in a Blender script, under lights whose truth is written beside each render (`tests/fixtures/blender/`). The **dev set** may be looked at while the fit changes; the **held-out set** is run once, for the number that is reported. A result on it is a claim about the Blender set only (docs/validation.md).

**Look** — a saved breakdown fingerprint in the Library (palette, key direction, ratio, colour temperature, tags, mood) that can be applied to another shot's targets.

**Location** — the real place: photos, floor size, ceiling, windows, power points, shoot hours.

**Kit** — what the team has: lights, modifiers, gels, camera, lenses, crew.

**Recipe** — steps to get the reference's look at this location with this kit, plus **gaps** (what the kit lacks) and **risks** (what could go wrong: power, space, time).

**Set Plan** — the 3D scene graph for a shot: lights, camera, actors and set pieces with positions and properties, in versions (`v3`). Source of truth for the Set Plan screen (D-LL-009).

**Look match** — a 0–100 score comparing the plan's camera view with the reference, with the numbers behind it (contrast ratio, warmth, brightness, direction). Uses cheek windows only (D-LL-007).

**Set Sheet** — the crew document for one shot: lighting plot, gear checklist, camera settings, setup order, power and safety notes. A4 and phone.

## The system

**Action** — a named, typed function in the registry (`breakdown.fit_light`). The only way state changes (AD-LL-002). Name format `<domain>.<verb_noun>`.

**Registry** — the list of all actions. Buttons, ⌘K, MCP and the CLI are built from it.

**Effect** — what an action does to the world: `read`, `write`, `spend` (costs money), `upload` (sends data off the machine), `delete`.

**Confirm** — an action flag meaning a person approves before it writes. Refused over MCP for now (D-LL-017).

**Engine** — the local Node process that hosts the registry, store, MCP endpoint and UI (AD-LL-001).

**Tier** — who does the work: **T0** instrument (deterministic), **T1** fast learned model, **T2** language/vision/generative model, **T3** a person (D-LL-002).

**Rule** — a numbered routing rule, `R1`…`R14` from v0.2, new ones from `R15`. Listed in `src/actions/rules.ts`.

**Decision row** — one logged routing decision: time, action, tier, rule, inputs summary, result, confidence, cost, verdict.

**Stand-in** — code that returns sample output where a real instrument or model will go. Always tagged `sample`.

**Fast loop / hero loop** — the real-time three.js view you drag around, and the slow cloud image-model pass for final stills (D-LL-001).

**No AI mode** — a setting that disables every T1/T2 action; every screen stays usable by hand. Since P4 the same holds with no API key or with the month's cap reached: each AI control is off and names which of the three it is (`settings.ai_status`).

**API key** — the founder's own Anthropic key for the in-app AI buttons (AD-LL-003). It lives only in the macOS Keychain, is added only in Settings in the Look Lab window, and is read for each call (D-LL-048).

**Spend cap** — the month's limit in rupees for in-app AI (`Settings.api.cap_inr`), counted per UTC month (AD-LL-011). Each call is priced at its **worst case** before it is sent (every input byte as a token, plus an allowance, plus all of `max_tokens`) and refused if that would cross the cap; its real cost from the API's usage goes to its decision row and to `used_inr` (D-LL-040).

**What leaves the machine** — for a model call: the breakdown's numbers and words that are not sample, with their sources, and the question; never pixels, file names or paths (D-LL-039). The exact text is kept in the call's decision row (AD-LL-012).

**Capture card** (P4.5, planned) — per shot, what the crew must capture on set to get a reference's colour: each light's colour and the gel or setting from our kit, the key:fill ratio, the colours that must exist in set and wardrobe, the camera's white balance, profile, ISO, exposure targets and recording format, the chart, the monitoring LUT and the grade start. Spec: `plans/P-LL-001-colour-grading.md` (V-LL-002).

**Grade start** (P4.5, planned) — a starting grade as an ASC CDL (slope, offset, power per channel, saturation) and a 33-point `.cube` LUT from the camera's log to the delivery target. T0 maths only (D-LL-003).

**Grade check** (P4.5, planned) — a still from a test shoot or a grade, measured against the reference with the existing instruments: per-swatch ΔE00, contrast in stops, saturation, tints, the cheek-only skin match (D-LL-007).

**Mired** — 1,000,000 ÷ colour temperature in kelvin; light colour shifts and gels add and subtract in mireds, not kelvin (P4.5).

**View / logic (UI)** — a screen's generated template (`src/ui/views/*.view.tsx`, from `design/`) and its owned behaviour (`src/ui/logic/*.logic.ts`) (D-LL-014).
