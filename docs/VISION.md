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

**Last verified: 2026-09-30.**

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

Around it: projects, a shot-by-shot previs board, mood boards, and a library of
saved looks that becomes the team's taste data.

### Who it is for

First: the founder's own film production team (DPs, gaffers, directors,
producers). Later: the public. People who want numbers they can trust and edit.

### What it is not

- Not a generator of films. Image models make assets and final stills; the
  interactive view is a real-time 3D proxy.
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
