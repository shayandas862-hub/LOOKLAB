# Prompt for a new Claude Code session: the açaí café, a real product, keyframes first

Written 2026-10-17, at the end of the session that ran Test 1 (`08-skin-test/`) and Test 1b (`09-runner-test/`).
Everything the session needs is in the repo; the prompt points at it and stays short so the session has room to work.

## Before you paste it (the founder)

1. **Start a new session in the same cloud environment** as Test 1 (the one with the `fal` network secret), on the
   repo `shayandas862-hub/LOOKLAB`, branch `shayan/kind-hamilton-nvl2fl`. The session never sees the key.
2. **Have ready:** the café's Instagram link; whether the café has agreed to its photos being used as references and
   sent to fal; any people in them who agreed to appear; the café's brand colours or logo file if you have them.
3. **Check fal's balance** on its billing page (about $4.43 was left on 2026-10-17) and set the budget line below.
4. Paste everything below the line.

---

I'm the founder. This session takes my gen-video agent onto **a real product**: a café that sells açaí bowls. It's a
test, not for commercial use, until the café agrees and the model terms are checked.

**Ignore the repo root's `CLAUDE.md`** (Look Lab's colour phase, a different product). Work only in
`incubator/video-harness-experiments/` on branch `shayan/kind-hamilton-nvl2fl`; never touch `main`. Its standing
rules are `incubator/video-harness-experiments/CLAUDE.md`: read that first.

**What we learned (read only these two, once):** `08-skin-test/RESULTS.md` and `09-runner-test/RESULTS.md`. In short:
the code's depth video holds shape and camera (shoe 0.97; the runner's body held too), but the cheap video model
(Wan VACE 14B on fal) can't make it look real (founder: 1 out of 5) or keep the brand colour (8–12 ΔE00 against 5).
So this session moves the realism to **still images**, where it's cheaper to try, check and fix.

**The process to build, one step at a time, asking me at each step:**
1. **Brief and research.** I give you the café's Instagram. You study it (what they sell, colours, light, style) and
   propose 2–3 ad ideas in plain words. I pick one.
2. **Plan.** The shot list (each shot: length, camera move, lens, what's in frame), the brand colours, and the pass
   marks, all written down **before anything is made**.
3. **Code skeleton.** The shots in code (three.js, like films 04–05): layout, camera, timing, plus a depth pass and
   masks (bowl, cup, logo) per shot. Free.
4. **Keyframes.** An image model paints the first and last frame of each shot on top of the code's depth. Check each
   still: shape against the masks, brand colour (ΔE00), logo. Fix and retry here, where it's cheap.
5. **Animate.** The video model gets the first frame, the last frame and the depth video (fal's `wan-vace-14b/depth`
   takes `first_frame_url`, `last_frame_url` and `ref_image_urls`, read 2026-10-17), and fills in between. Check again.
6. **Finish.** Logo and type from code, the edit, music.
Not every frame as a separate image: each one is made on its own, so they won't match and will likely flicker.

**Start small:** one 5 s bowl shot through steps 3–5 (under about $1) before planning the whole ad.

**Known gaps to fix before the next run, written down first:** the checker's outline took in a glowing floor patch
in Test 1b (count only the outline touching the code's object); brand colour comes back through the Fixer (the
code's masks), not from the model.

**Prices and model abilities:** read from the provider's page on the day, with the date; never from memory. Candidate
models checked 2026-10-17: Happy Horse 1.0 video edit and Kling O3 Pro edit (both restyle a video); the image model
for keyframes is not chosen yet.

**Money:** nothing is sent before you tell me the total and I say yes. **Budget: $[FILL IN]** (fal balance about
$4.43 on 2026-10-17).

**The café's material:** use its photos as references or send them to fal only once I confirm the café agreed. Faces
only of people who agreed; no lookalikes of real people.

**Talk to me in very short answers, in small numbered parts.** Keep this session's context small: scripts print a few
lines, full output goes to `out/logs/`, state lives in files, look at one contact sheet rather than every frame.

**At the end:** commit by name (never `git add -A`, never `.claude/` or `out/`), push to the branch, and tell me
what worked, what it cost, how long each step took, and the next step.

**Still open from Test 1 (low priority):** the 1–5 realism scores for the nine shoe clips (`08-skin-test/out/` is not in
git; the blind set would have to be made again from the clips, which only exist in the old session).
