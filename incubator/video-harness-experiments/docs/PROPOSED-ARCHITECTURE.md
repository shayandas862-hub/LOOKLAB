# The proposed system, and how a film goes through it

Written 2026-10-15. **Proposed, not proven:** the central bet (part 3, "the skin") is what Test 1
(`../08-skin-test/`) checks. This page is updated when Test 1 has a result. **Not part of Look Lab.**

## In one sentence

A production company in software. A brief goes in. It plans the film, builds the parts that must be exact in code,
has AI models paint the parts that must look real, checks every shot against the plan, fixes or retries what
fails, and assembles a finished film with sound in every size. A person approves it at the points that matter.

## The seven parts, like the departments of a production company

| # | Part | In a real production, this is… | What it does | Built with | Status |
|---|---|---|---|---|---|
| 1 | **Planner** | The director and the producer | Turns the brief into a shot list as data: each shot's length, lens, camera move, what's in it, the brand rules, where the music hits | Claude | Done by hand so far (each film's `PLAN.md` and `timeline.js`) |
| 2 | **Skeleton** | Art department, previs, the camera crew | Builds each shot in 3D code: the product, the layout, the camera's path, the timing. Renders a cheap preview, plus "control" videos: depth, outlines, masks of the product and logo, poses for people | three.js now; Blender possible | Built (films 04–06; depth, outlines and masks in 07–08) |
| 3 | **Skin** | The shoot: camera, light, actors, location | AI video models paint real-looking footage onto the skeleton. A router picks the model per shot | fal: Wan VACE (depth or pose control), text- and image-to-video | **Not yet tested** (Test 1) |
| 4 | **Checker** | The script supervisor and quality control | Measures every clip against the skeleton: is the product where it should be, is the brand colour right, does it flicker, does it start and end on the right frames. Pass marks are written before the clip exists | Python, a background-removal model | Built and calibrated (`../07-grok-test/`) |
| 5 | **Fixer** | VFX and compositing | Puts the exact things back on top of the generated footage: logo, text, packaging, the brand colour (through the masks). Retries shots that fail | Code and masks | Not built yet |
| 6 | **Post** | Editor, colourist, sound, music | Cuts to the beat, grades, makes or licenses the music, designs the sound, mixes to each platform's loudness, adds titles | ffmpeg, code-made sound | Built for code films (04–06) |
| 7 | **Delivery and records** | The post house's delivery desk, and the accounts | Makes every version (16:9, 9:16, short cuts) and keeps a record of every shot: which model, which seed, what it cost, what the checks said | git, `deliverables/` | Built, by hand |

**The person's job:** approve the plan, approve the cheap preview, look at shots the checker flags, rate how real
things look, and give the final yes.

## The process for one film

```
 1 Brief ──► 2 Plan ──► 3 Skeleton + preview ──► 4 Generate ──► 5 Check ──┬─► 7 Composite ──► 8 Edit, grade,
   (person)    (person      (cheap; person           (paid, only      (auto)  │    exact parts      music, mix
               approves)     approves)                shots that              │    back on top      │
                                                      need realism)           │                     ▼
                                                                  6 Retry or flag ◄─ fail   9 Versions + delivery
                                                                                            10 Records: costs, failures
```

Three rules make it work:
1. **Preview before paying.** Everything up to step 3 is code and nearly free. Money is spent on generation only
   for shots a person has already approved in the preview.
2. **Pass marks before results.** Each check's line is written down before the clip exists, and isn't moved after.
3. **Exact things never come from the model.** The logo, the text, the packaging and the brand colour come from
   code, so the model can't get them wrong.

## Which tool makes which part of a shot

| Use **code** when… | Use **generation on the skeleton** when… | Just **prompt** when… |
|---|---|---|
| A client would reject it because it's **wrong**: the wrong logo, product, colour, framing, length or timing | A client would reject it because it looks **fake**: surfaces, light, people, nature, cloth, water | **Nothing has to be exact**: mood, drafts, backgrounds, social experiments |

Most shots in a brand film are a mix: the code makes the frame, the model paints it, and the code puts the
logo back.

## What's proven, and what isn't (2026-10-15)

| | Evidence |
|---|---|
| **Proven** | Code makes whole films and their music, cut to the beat (04 ACTION, 05 ONE SENTENCE); a studio ident from a logo with colours matched by measurement (06); a checker that measures a clip against the code's truth (the code itself scores 0.995) |
| **Shown** | Picture-to-video (Grok) holds a moved 3D render (0.90) but can't add a real skin without losing the skeleton (0.57) |
| **Not proven** | Skin on skeleton: real and exact together (Test 1); that buyers value the exactness (Test 2: blind "which would you ship"); the cost and time per usable second (Test 3: a real multi-shot job) |

## What it needs decided (the parked PRD questions)

Who it's for first (Das Production's own films, or brands), the first kind of job (product videos are the
natural start), the quality bar, the budget per film, where it runs, and the rules for using AI models' outputs
commercially (each model's terms checked; unclear means no).
