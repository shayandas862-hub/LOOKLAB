# Prompt 8 · Claude Design: the colour UI (capture plan, capture card, grade check)

For phase P4.5 (`plans/P-LL-001-colour-grading.md`). Run it **before** the P4.5 build: the build ports the new export,
and its parity test needs every new command in the catalogue.

Attach these files from the project's `design/` folder, as they are (read-only copies; nothing in the project is
edited by hand): `HANDOFF.md`, `Design System.dc.html`, `Breakdown.dc.html`, `SetSheet.dc.html`,
`LocationKit.dc.html`, `Look Lab.dc.html`. Then paste the block below. Export when done and put the changed files
back in `design/` (same names; the converter regenerates the views from them).

---

```
Extend the attached LOOK LAB prototype with its colour features. Keep everything that exists exactly as it is:
same screens, same layout, same design system. Change only what this brief names.

WHAT IT ADDS
For a reference shot, Look Lab now tells the crew what to put in front of the lens to get the reference's colour
(each light's colour, and the fixture setting or gel from our kit that gets it; the key:fill ratio; which colours
must physically exist in the set and wardrobe), how to set the camera (white balance, picture profile and gamut,
base ISO, exposure targets, recording format, frame rate and shutter, charts), and what is left for the grade (a
starting grade as ASC CDL numbers, exported as a .cdl file and a .cube LUT). A grade check then measures a still
from our test shoot or our grade against the reference and says, in numbers, how far each part is.
Every number is deterministic maths from the breakdown, the kit and the makers' published documents. A model may
only suggest the strategy: put the colour in the light, capture neutral and grade, or both. Never a number.

READ FIRST (attached)
HANDOFF.md: tokens (§7), components (§3), the action catalogue (§4), data (§5). Design System.dc.html. Use the
same tokens (--bg0..3, --line, --line2, --tx, --tx2, --tx3, --sur, --acc, --acc-ink, --acc-soft, --warn,
--warn-soft, --err, --err-soft, --sh), Geist for UI and Geist Mono for every number, 13 px base text, 8 px grid,
radii 4/6/8/10. Chrome stays neutral grey with zero hue: people judge colour here. One accent for selection and
primary actions; amber for gaps and warnings; red only for errors. Dark and light themes as token swaps.

PRODUCT RULES THESE PARTS MUST SHOW
1. Every number shows its own source badge, from this set only: MEASURED, ESTIMATE, METADATA, MANUAL, AI · n,
   SAMPLE. A model's rating reads "AI · 72", never "72%" or "AI 72%" (it is the model's own rating, not checked).
   Under 60 the badge turns amber and the value is marked for review. A number typed from a maker's document is
   MANUAL with its document in the tooltip (document, page, date read). Sample data reads SAMPLE, and a "Sample
   data" marker stays on any block that still holds it.
2. Every button carries its command name as its title attribute (tooltip), exactly: title="colour.plan_capture".
   One button per command; the same name is in ⌘K. The one exception is the viewer's "Reference | Grade check"
   toggle (section 2): it is view state, not a command, so it has no title and no catalogue row.
3. Only "Choose strategy (AI)" calls a model. It disables, with the reason shown beside it, when AI is not
   connected, No AI mode is on, or the spend cap is reached. Every other new button is deterministic and is NEVER
   disabled for AI reasons (do not bind aiBlocked to it). A deterministic button may disable for a data reason,
   shown in words ("Draw the face box first", "No plan yet: press Plan capture").
4. No accuracy claims anywhere. The grade check shows distance from the reference measured by the same instruments,
   not accuracy. Verdict words: PASS, CLOSE, FAR (grade check) and LIGHT, GRADE, SET (set colours). No percentages
   of "match" on these parts.
5. Assumptions are shown, not hidden: the lit/graded split is an assumption until a person chooses it. Show
   "Split: S0 assumed (not chosen)" in muted italic text (--tx3) with the assumption's one-line meaning; once
   chosen it becomes a value with a badge (MANUAL or AI · n).
6. Gaps are amber boxes (the existing GapBox): "½ CTS is named in the plan but is not in the kit's gel book".
   A number not yet read from its document shows "needs <document>" in --tx3, never a guessed number.

1. BREAKDOWN: A NEW SECTION "CAPTURE & GRADE" IN THE RIGHT PANEL
Place it after LIGHT, collapsible like the others (the existing COLOUR section is the palette; keep its name).
Top of the section: two buttons, "Plan capture" (title colour.plan_capture, primary) and "Fit grade"
(title colour.fit_cdl). Then, in this order:
a. STRATEGY AND SPLIT. A three-way segmented control Light / Grade / Both (title colour.set_split), and beside it
   "Choose strategy (AI)" (title colour.choose_strategy) with its disabled reason. Under it: the split controls,
   compact: "Lit share" slider 0–100% (a number field too), "Balance camera to" Key | Fill, "Green–magenta in the
   light" toggle, "Saturation in grade" number (1.00), "Contrast in grade" number in stops (0.0). Each with its
   badge. The S0 assumption line (rule 5) when nothing was chosen. When the model chose, show its one-line reason
   under the control with AI · n.
b. LIGHTS. One row per source (Key, Fill): target kelvin and mired, "mired from the camera's balance" (e.g.
   +321.4), green–magenta (G/M +0), the fixture and its setting, the gel stack as small chips (full CTO, ½ CTO),
   the residual ("+9 mired, +37 K"), and an amber gap line when the kit cannot reach it. A one-line note when the
   key kelvin came from the fit at its limit: "Fit at its 2800 K limit: enter the key colour by hand".
c. CAMERA. Rows: Profile and gamut; Base ISO; White balance (K and tint, "by number, never auto"); Exposure targets
   (grey card in IRE and S-Log3 code; skin, key side, or "Draw the face box first"); Recording (bit depth, chroma,
   codec); Frame rate and shutter (24 fps · 172.8°, with the 50 Hz flicker note). Each with its badge and, on
   hover, the rule that chose it.
d. SET & WARDROBE COLOURS. One row per palette swatch: the swatch, its share, a verdict chip LIGHT / GRADE / SET,
   and for SET a second chip with the physical colour to source (hex and a small "under daylight" label) or "cannot
   be told under this light". A small control to pin the swatch to Key, Fill or Mix. SET with high chroma adds an
   amber "saturated: source it".
e. CHARTS. "ColorChecker + grey card at the head of every setup", and an amber gap when the kit has none, with what
   is lost: "no white-balance or exposure reference; the grade check compares regions only".
f. GRADE START. A compact CDL table: rows Slope, Offset, Power; columns R, G, B; then Saturation; 4 decimals, Geist
   Mono; the space it applies in, small: "S-Log3 / S-Gamut3.Cine codes, before the display transform"; the residual
   ("mean ΔE00 2.1 after the fit"). Buttons "Export .cdl" (title colour.export_cdl) and "Export .cube" (title
   colour.export_lut) with a choice of Look (with the CDL) or Base (display transform only). Disabled with "No plan
   yet: press Plan capture" until a plan exists.
States to draw: no breakdown yet; no plan yet; plan from sample inputs (every badge SAMPLE, the Sample data marker);
plan with the key at the fit's limit; gel book missing (residuals read "needs the gel book (Location & Kit)");
strategy chosen by AI · 54 (amber, "needs review"); AI not connected (only the strategy button disabled).

2. BREAKDOWN: GRADE CHECK MODE
A toggle in the viewer's header: "Reference | Grade check". Grade check mode shows the reference on the left and the
still on the right, same size, never cropped, on the neutral surround, with an optional wipe. Empty state: a drop
zone "Drop a still from the test shoot or the grade" (title colour.import_still; files stay on this computer).
Above the still: "This still is: Display (graded) | Log (S-Log3 from the camera: the shot's look LUT is applied
first)". On the still a person can drag a face box (as on the reference) and click the chart's four corners
(helpers, no buttons). Button "Check grade" (title colour.check_grade, primary).
Results panel (right side, replacing the value panel in this mode):
- a summary line: "Palette 2.3 ΔE00 (PASS) · 6% of the reference's colours missing · contrast −0.6 stop (CLOSE)";
- a swatch table: reference swatch, matched still swatch (or "missing in still" / "extra in still"), ΔE00, shares,
  verdict chip PASS / CLOSE / FAR;
- rows: Contrast (stops), Saturation (points), Tints (shadow, mid, highlight), Skin cheeks (ratio in stops, warmth),
  Light colour on set (mired and Duv against the plan; a log still with a chart), Exposure (grey patch as an S-Log3
  code against 420), each with reference value, still value, difference, verdict; a row that cannot run says why
  in --tx3 ("No face box on the still", "No chart in the still", "Display still: no light-colour or exposure row");
- a footnote: "Distances measured by the same instruments on both frames. Thresholds are proposals until validated
  (P-LL-001 §4.6)".
States: empty; still dropped and analysing; results; log still with the LUT applied (a small "LUT applied" chip);
no face box; no chart; still from a different aspect ratio (amber note: compared on the active picture).

3. SET SHEET: THE CAPTURE CARD
A4: a second page, "CAPTURE CARD", in the sheet's style, with blocks CAMERA, LIGHTS, SET & WARDROBE COLOURS,
CHARTS, MONITOR, GRADE (layout and wording in the sample below). Every number with its badge, printed small and in
words for print (SAMPLE, ESTIMATE, MANUAL, MEASURED). Gaps as amber boxes. The split line at the top. Must fit one A4
page for the sample shot.
Phone (390 px): the same blocks in the same order, one card each, collapsible, numbers large enough to read at arm's
length on set.
The existing buttons stay (setsheet.generate, setsheet.export_pdf, setsheet.send_to_phone).

4. LOCATION & KIT: A COMPACT "KIT COLOUR" EDITOR
Under the kit checklist, collapsible. Per light: CCT min, max and step (K); green–magenta range and the maker's unit;
RGB yes/no; flicker-free yes/no; source document (name, page, date read, licence: ok / unclear / typed by founder).
A gel book table: maker, number, name, mired shift, green–magenta shift, transmission %, sheets, document. Camera
recording: profiles (gamuts, base ISOs, clip level), codecs (bit depth, chroma, intra), white-balance range and step,
tint range, shutter angles, user LUT yes/no. Monitoring (external monitor, loads .cube). Charts owned. Every field
editable, MANUAL once typed, "needs <document>" when empty. One save button (title adapt.set_kit_colour).

SAMPLE DATA (shot 12C; every value SAMPLE; layout placeholders, not real gel or camera data)
Split: S0 assumed (not chosen): the light carries the key/fill colour difference; the grade carries the rest.
Camera: Sony FX3 · S-Log3 / S-Gamut3.Cine · ISO 800 · WB 5600 K, tint 0 · grey card 40.6 IRE (code 420) · skin: draw
the face box first · 10-bit 4:2:2 All-Intra (XAVC S-I) · 24 fps · 172.8° (1/50 s, 50 Hz mains).
Lights: Key 2000 K (500.0 mired), +321.4 mired from the camera's balance, G/M +0; 600 W COB at 3200 K + full CTO +
½ CTO; residual "needs the gel book" (also draw the filled state: "+9 mired, +37 K"); gap: "½ CTS is named in the
plan but is not in the kit's gel book". Fill 5600 K, +0 mired, 60 W LED panel at 5600 K, no gel. Key:fill 8:1
(3 stops), incident meter at the face.
Set colours: #C7803A 14% LIGHT · #6E5B4A 11% LIGHT · #0D0F12 6% LIGHT · #1B2230 38% GRADE · #3E4A52 22% GRADE ·
#E9C9A0 9% SET, physical colour #D9CDB4 under daylight (a placeholder: the real one is computed at P4.5).
Charts: none owned (gap). Monitor: FX3 screen, built-in display LUT; 12C_look.cube for the colourist.
Grade start (placeholder numbers): Slope 1.0000 0.9850 0.9400 · Offset −0.0100 −0.0040 0.0120 · Power 1.0000
1.0000 1.0300 · Saturation 1.0000 · mean ΔE00 2.1 after the fit. Files: neel_12C_v1.cdl, 12C_look.cube, 12C_base.cube.
Grade check (still "test_12C_still.png", Display): #1B2230 → #1E2534 ΔE00 1.1 PASS · #3E4A52 → #444F50 4.4 CLOSE ·
#C7803A → #C27E3F 1.6 PASS · #6E5B4A → #6A5D50 2.9 PASS · #E9C9A0 → #F0D2A8 2.2 PASS · #0D0F12 → missing in
still, FAR · palette 2.3 ΔE00 PASS, 6% missing · contrast 9.2 → 8.6 stops (−0.6, CLOSE) · saturation 38 → 35%
(−3, PASS) · tints: shadow blue −6 → blue −4 (2.0, PASS), mid neutral → warm +3 (3.1, CLOSE), highlight warm +9 →
warm +8 (1.0, PASS) · skin: no face box on the still · light colour and exposure: no chart in the still.

DELIVER
1. The changed files: Breakdown.dc.html (section and mode), SetSheet.dc.html (capture card, A4 and phone),
   LocationKit.dc.html (kit colour editor). Every new button with its title attribute. The other screens unchanged.
2. Design System.dc.html gains: VerdictChip (LIGHT | GRADE | SET; PASS | CLOSE | FAR), MiredRow (target, mired from
   balance, fixture, gel chips, residual, gap), GelChip, SplitControl, CdlTable, CaptureCardBlock, StillDropzone,
   GradeCheckRow, AssumptionLine, and the source badge with ESTIMATE, METADATA and "AI · n".
3. HANDOFF.md updated: §2 the new section, mode and card with their states; §3 the new components with props and
   states; §5 the data the new parts read and write (ColourPlan, Still, GradeCheck, the kit's colour fields); and
   these rows added to the §4 action catalogue, exactly:
| `colour.plan_capture` | Breakdown | breakdown, kit, split | colour plan (lights, camera, set colours, charts, grade) | Det | no |
| `colour.fit_cdl` | Breakdown | colour plan, split | CDL (slope, offset, power, saturation) + residual | Det | no |
| `colour.set_split` | Breakdown | strategy, lit share, balance source, G/M lit, saturation and contrast in grade | split (manual) | Det | no |
| `colour.choose_strategy` | Breakdown | breakdown numbers and words, kit names | strategy + reason + confidence | AI (T2) | no |
| `colour.export_cdl` | Breakdown | colour plan | .cdl file | Det | no |
| `colour.export_lut` | Breakdown | colour plan, look or base | .cube file (33-point) | Det | no |
| `colour.import_still` | Breakdown (grade check) | file, shot, display or log | still | Det | no |
| `colour.check_grade` | Breakdown (grade check) | still, reference, colour plan | grade check rows with verdicts | Det | no |
| `adapt.set_kit_colour` | Location & Kit | light colour ranges, gel book, camera recording, monitoring, charts | kit (manual, cited) | Det | no |
```
