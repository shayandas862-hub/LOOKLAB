# Look Lab — Vision

**What this project is, why it exists, and every time that answer has changed.**

```
VISION ──> architecture ──> PRD ──> phases ──> decisions ──> progress
   ^                                                            │
   └──────────── the build changes the vision ──────────────────┘
```

§1 is always the current answer. §2 records each change, with what caused it and
what it forces, so any decision can be traced up to the vision it served.

---

## 1 · The vision as it stands

**Last verified: 2026-10-09** (V-LL-003 added the Pre-production tab, as direction; its ADs are not yet written).

### Why Look Lab exists

Film sets lose money when things are worked out on the day: the crew waits while
the lighting is found, the wrong gear arrives, the location surprises everyone,
and the result drifts from what the director approved. Look Lab moves that work
before the shoot. It is a **technical pre-production brain**: it reads a reference
and turns it into numbers a crew can use. It then adapts that look to *our*
location and kit and plans the set in 3D, so the crew arrives with a plan.

### What it does, per shot

1. **Break down** a reference frame or video: exact palette (hex and share),
   light (direction, hardness, colour temperature, key:fill, practicals), lens,
   framing, camera movement, mood.
2. **Adapt** it to our reality: the location (photos, size, windows, power, hours)
   and the kit (lights, modifiers, gels, camera, lenses, crew). A recipe with steps,
   gaps and risks.
3. **Plan in 3D**: place and move lights, camera and actors in a model of the
   location; a look-match score says how close the camera view is to the reference.
4. **Execute**: a set sheet (lighting plot, gear list, camera settings, setup
   order) for print and phone.
5. **Colour, from capture to grade** (V-LL-002): for the reference's colour, what
   has to be captured on set to get it (each light's colour and the gel or fixture
   setting from our kit, the key:fill ratio, the colours that must physically be in
   the set and wardrobe), the camera settings that needs (white balance, picture
   profile and gamut, base ISO and exposure targets, bit depth, chroma and codec,
   a chart at the head of every setup), and what is left for the grade (a starting
   grade as an ASC CDL and a monitoring LUT, with the targets to check against).
   A **grade check** measures a still from our test shoot or our grade against the
   reference, in numbers. Every number is T0 maths; a model may choose the
   strategy, never a number.
6. **Pre-production, script to shots** (V-LL-003, direction; not built): a script is
   uploaded or generated and broken down; a production bible locks style, light per
   part, characters and continuity; the film is edited in words as a shot list; each
   shot becomes a start and an end frame (about 3 s), reviewed side by side and
   measured against the colour script; the pair goes to the cheapest video model that
   takes start and end frames. Every generation and decision is logged. Plan:
   [`plans/P-LL-002-pre-production-generation.md`](../plans/P-LL-002-pre-production-generation.md).

Around it: projects, a shot-by-shot previs board, mood boards, and a library of
saved looks that becomes the team's taste data.

### Who it is for

First: the founder's own film production team (DPs, gaffers, directors,
producers). Later: the public. People who want numbers they can trust and edit.

### What it is not

- Not a generator of finished films. Since V-LL-003, Look Lab generates previs and
  animatic-grade shots for pre-production through image and video models; a
  generated frame is never a measurement. (Until 2026-10-09 this line read "Not a
  generator of films".)
- Not a claim that taste is solved. It measures light, colour, lens and framing;
  it does not say *why* a frame works.
- Not an AI that decides for the crew. Every value can be set by hand, and every
  AI guess is labelled as one.

### The principles that do not move

- Works fully by hand; better with AI; drivable end to end by Claude Code.
- Honest numbers: measured, AI-estimated, manual and sample are always told apart.
- Runs on a light machine (an 8 GB M1 with other apps open).
- Internal first, public later, without a rewrite.

---

## 2 · How the vision changed

### V-LL-003 · 2026-10-09 — Look Lab adds a Pre-production tab: script, breakdown, edit in words, start and end frames, video
- **Was:** V-LL-002 and §1 items 1–5; "Not a generator of films."
- **Now:** §1, item 6. A script (uploaded or generated) is broken down; a bible locks the style, the light per part,
  the characters and the continuity rules; the film is edited in words as a shot list; each shot becomes a start frame
  and an end frame (about 3 s), checked in a sequence strip and measured against the colour script (T0, the existing
  palette and grade-check code); the pair is sent to the cheapest video model that supports start and end frames.
  Every generation, decision and process step is recorded. Models make images and video; they still never supply a
  measured number (D-LL-003).
- **Caused by:** the founder's request of 2026-10-09, after making the opening of the short film *Dead Man's
  Telescope* (project DMT) by hand across ChatGPT, Gemini, Google Flow and Kling: the process inferred there
  (P-LL-002 §2) had no single tool that did it end to end (P-LL-002 §3, public pages only).
- **Forces:** an AD amending D-LL-039 so generation calls may send the project's own generated images and reference
  sheets (client footage still never leaves without cloud allowed); an AD for the image and video provider and the
  model router (keys in the Keychain, a stub provider in tests, prices fetched live, the monthly cap); licence checks
  per model; a Claude Design pass for the tab; a phase card placed against the unfinished P4.5 (founder's call,
  P-LL-002 §7–8). Supersedes the §1 line "Not a generator of films", reconciled in §1 on the same day.
- **Trade-off:** Look Lab stops being purely a measuring tool and takes on paid generation, API costs and model
  terms; the earlier verdict (2026-10-08) to pause building and let real work decide is answered only in part:
  the DMT film is the evidence, but the build order is still open.

### V-LL-002 · 2026-10-01 — Look Lab serves colour grading: what to capture on set, which camera settings, what is left for the grade
- **Was:** V-LL-001: the breakdown measures a reference's colour (palette, tints, saturation, contrast) and its
  light; nothing turned that colour into instructions for the camera department or the colourist.
- **Now:** §1, item 5. For any reference, Look Lab tells the crew, per shot, what has to be captured in front of the
  lens to get that colour, the camera specifications that needs, and what is left for the grade; and it checks a
  graded or test-shoot still against the reference in numbers. Every number is T0 maths from published documents
  (mireds, gel books, camera curves and gamuts, the ASC CDL); a model may only choose the strategy (put the colour in
  the light, capture neutral and grade, or both), never a number (D-LL-003). One graded frame cannot say how much of
  its colour was lit and how much was graded: the spec states its assumption and lets a person set the split.
- **Caused by:** the founder's request of 2026-10-01, at the start of the P4 session ("Look Lab must serve colour
  grading").
- **Forces:** an AD for the Kit contract (camera recording modes, each light's colour range, the gel book, monitoring
  and LUT support, written when P4.5 starts); a colour section on the Breakdown and the Set Sheet, and a grade check,
  designed through Claude Design (`prompts/08-claude-design-colour.md`); a Blender colour ground-truth set (the P3 head
  with a ColorChecker, known key kelvin and camera white balance, a known CDL) with tolerances written before it runs;
  the P4.5 card in [`phases.md`](phases.md) (D-LL-043); the plan [`plans/P-LL-001-colour-grading.md`](../plans/P-LL-001-colour-grading.md);
  the build prompt `prompts/09-phase-4-5.md`.

### V-LL-001 · 2026-09-30 — From a solo look-matching prototype to a production team's pre-production brain
- **Was:** v0.2 (`reference/v0.2/docs/01-VISION.md`): a single-file tool for one
  freelancer to reverse-engineer a reference's light and match it in a 3D scene.
- **Now:** §1 above. The user is a production team; the job widens from "match the
  light" to reference → adapted recipe → 3D set plan → set sheet; distribution
  becomes a team install, with public use later; AI comes from each person's own
  Claude Code or an API key.
- **Caused by:** the founder's brief of 2026-09-30 (grilled that day: the core job
  is the reference breakdown, extended with adapting it to the real location and
  kit and planning lights, camera and actors in 3D).
- **Forces:** AD-LL-001 (leave the artifact for a local engine), AD-LL-002 (one
  action registry for buttons and MCP), AD-LL-003 (three AI modes), D-LL-013 (the
  single-file constraint retired), the v1 phase plan in [`phases.md`](phases.md).
