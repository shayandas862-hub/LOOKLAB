# Next session · Test 2, S3: measure the takes properly

Written 2026-10-18 at the end of the session that made the first S3 takes. Run it **on the founder's Mac** (the photos,
clips and passes live only there: `STATE.md`, "Only on the founder's Mac"). Copy everything below the line into the first
message of a new Claude Code session opened on the LOOKLAB repo.

---

You're continuing my gen-video experiments (Test 2, the café ad), locally on my Mac (M1, 8 GB).

IGNORE the repo root's CLAUDE.md: it is Look Lab's colour phase, a different product. Work only in
incubator/video-harness-experiments/ on branch shayan/kind-hamilton-nvl2fl; never touch main.
The repo folder name ends with a space ("LOOK LAB "): quote every path.

Set up (tell me what's missing; install nothing that costs money):
1. git fetch origin shayan/kind-hamilton-nvl2fl; switch to it; git pull.
2. Check: node -v (22+), ffmpeg, Python 3.13 at /Library/Frameworks/Python.framework/Versions/3.13/bin/python3.13,
   Google Chrome, the checker environment ../07-grok-test/.venv (rebuild command in STATE.md if missing).
3. cd incubator/video-harness-experiments/10-cafe-ad && npm install.
4. Check the local-only files listed in STATE.md exist (out/stills-in/luna6_1.png, out/clips/S3_*.mp4,
   out/passes/s3/). Rebuild the passes if missing (free); tell me if photos or clips are missing (don't re-buy).

Read in this order, only these, once (in incubator/video-harness-experiments/):
- CLAUDE.md (my standing rules: follow them)
- 10-cafe-ad/STATE.md (where we are, what's local-only, what's waiting on me, what's next)
- 10-cafe-ad/RESULTS.md (what the takes showed, with the true numbers)
- 10-cafe-ad/PLAN.md: §6–§7 (inputs, prompts, marks) and §11 (the log); the rest only if a step needs it
Then summarise in very short numbered parts: what's proved, what isn't, what's waiting on me.

Rules for this session, on top of CLAUDE.md:
- This Mac has 8 GB. Every local job runs ONE frame first under /usr/bin/time -l; above 1.5 GB it doesn't run here.
  No heavy models locally (BiRefNet reached about 12 GB last time).
- The fal key is in the macOS Keychain (service fal-key); runs read it at run time with
  FAL_KEY="$(security find-generic-password -s fal-key -w)". Never print it, never write it to a file.
- No money without my yes to a total. Pass marks are written in PLAN.md before any result and never moved.
- Generated clips and photos stay in out/ (ignored); commit by name, never git add -A, never .claude/ or out/.

First task (free, no fal): a light per-ingredient colour check, so drift and morphing are caught by numbers.
1. Add per-ingredient masks to src/passes.js (banana, strawberry, granola, blueberry and kiwi rows; the two açaí layers;
   the granola band), render them for S3's 108 frames (render.mjs passes, same times as STATE.md).
2. Write s3-colour.py (numpy + Pillow only, in the existing checker environment): for every frame, each region's colour in
   the take against that ingredient's colour in the hero still (luna6_1); plus how much backdrop colour falls inside the
   bowl's region. Match frames by time (the Wan take is 30 fps). Few lines printed; numbers to out/report/.
3. Prove it before it judges anything: on the previs itself, and on copies of the Seedance take shifted by 2 % and 5 % of
   the frame. The numbers must rise with the shift; if they don't, say the check is blind and stop.
4. Propose its pass marks from that proof, write them into PLAN.md §11 with my yes, then measure S3_seedance and S3_wan3
   (and S3_ltx for reference) and add the results to RESULTS.md.
Then: fix the previs's far side (the strawberry row is sliced on the camera side but drawn whole on the far side, and the
video models copied that) and give the S3 framing some headroom; re-render, free.

Waiting on me (ask once, briefly): my fal balance after the Wan 3.0 take; realism numbers (1–5) for the Seedance and Wan
takes; Seedance 2.5 or Wan 3.0 as the default; a budget for the fall-in (S1, S2) and the honey (S4).

Report in very short numbered parts and wait for my answer. At the end: commit by name, push to the branch, and tell me
what worked, what it cost, how long each step took, and the next step.
