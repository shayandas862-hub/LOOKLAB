# Test 1 runbook: for the Claude Code session that runs it

Written 2026-10-17 and rehearsed from a fresh clone (steps 0–4 for real; steps 7–9's scripts on stand-in clips). **This is the only file a session
needs to read to run Test 1.** The why, the pass marks and what each outcome means are in [`README.md`](README.md);
read it once, at step 6. Not part of Look Lab (D-LL-056). A test, not for commercial use.

## What the test does, and where it sits in the system

The proposed system has seven parts ([`../docs/PROPOSED-ARCHITECTURE.md`](../docs/PROPOSED-ARCHITECTURE.md)).
Test 1 is the first time the **Skin** part runs for real, inside a loop with the parts that already exist:

| Part | In Test 1 | Where |
|---|---|---|
| 1 Planner | Done by hand: one shot, its prompt, its pass marks | `README.md` |
| 2 Skeleton | The code's 6 s shoe shot: its depth video (the control), its first and last frames, and its masks (the truth) | `inputs/`, `../07-grok-test/ref-pack/` |
| 3 **Skin** | **fal**: three ways to make the same shot (A words, B pictures, C the code's depth video), 3 seeds each | `run.mjs` |
| 4 Checker | Measures every clip against the skeleton: shoe overlap, orange colour, flicker | `check-all.sh` → `../07-grok-test/check.py`, `segment.py` |
| 5 Fixer | Not in this test | — |
| 6 Post | Not in this test | — |
| 7 Records | Every request, its seed, time and result; the ratings; the verdict | `out/runs.json`, `out/verdict.json`, `RESULTS.md` |
| Person | Says yes to the spend; rates realism blind; reads the verdict | the chat |

The question: does a skeleton from code (C) give **real and exact together**, where words (A) and pictures (B) don't?

## Rules for this session (the founder's, plus context budget)

- **Keys:** `FAL_KEY` is read from the environment. Never print it, echo it, write it to a file or log, or ask for it
  in the chat. To check it's there: `[ -n "$FAL_KEY" ] && echo set || echo missing`.
- **Money:** nothing is sent to fal before step 4's price check and the founder's yes to the total. Hard cap: the
  amount the founder gave (default **$10**). `run.mjs` stops at 9 requests per run.
- **Prices and model abilities** are read from fal's pages at the time, with the date; never from memory.
- **Pass marks don't move.** They were fixed on 2026-10-15 before any clip. A failure is reported as a failure.
- **Licences:** the clips stay out of git (`out/` is ignored) until fal's and Wan's terms are checked.
- **Context:** this session should stay small. So:
  - Read only this file and, at step 6, `README.md`. Don't open `check.py`, `segment.py` or the docs unless a step
    fails and the error points there.
  - Every script prints a few lines; the full output goes to `out/logs/`. Read logs with `tail`, not whole.
  - Don't look at frames or videos. The one picture to look at is `out/sheet.png`, once, at step 8.
  - Run anything slow in the background and wait for it to finish; don't poll in a loop.
  - **State lives in files, not in the chat:** `out/runs.json`, `../07-grok-test/report/*.json`, `out/ratings.json`,
    `out/verdict.json`, `RESULTS.md`. Every step can be re-run safely (`run.mjs` skips clips it has; `blind.py`
    refuses to reshuffle), so a new chat can pick up from the files alone.

## The steps

All commands run from this folder: `cd "incubator/video-harness-experiments/08-skin-test"` (branch
`shayan/kind-hamilton-nvl2fl`).

### 0 · Check the start (1 min)
```sh
git branch --show-current                    # shayan/kind-hamilton-nvl2fl
[ -n "$FAL_KEY" ] && echo set || echo missing
ls inputs                                    # depth_16fps.mp4  first.png  last.png
node -e "fetch('https://queue.fal.run/').then(r => console.log('fal reachable, status', r.status)).catch(e => console.log('fal NOT reachable:', e.cause?.code || e.message))"
```
"fal reachable, status 404" is right: fal answered (checked 2026-10-17). If it's not reachable, see
`/root/.ccr/README.md` (Node's fetch may need `NODE_USE_ENV_PROXY=1`), or the environment's network settings may
block fal: tell the founder.

If the key is missing: stop. The founder adds `FAL_KEY` in the environment's settings (the cloud environment menu
in the session's title bar, then Edit: Network secrets, or an environment variable) and starts a new session.

### 1 · Install (about 1 min; about 760 MB on disk with the model)
```sh
mkdir -p out/logs && npm ci > out/logs/npm.log 2>&1            # @fal-ai/client 1.10.1 (MIT)
python3 -m venv "$HOME/t1env" && "$HOME/t1env/bin/pip" install -q rembg==2.0.85 onnxruntime==1.31.0
export PY="$HOME/t1env/bin/python"            # used by every step below; set it again in each new shell
```
The checker also needs `ffmpeg` and `ffprobe` (present in the cloud image; `apt-get install -y ffmpeg` if not). The
background-removal model (`isnet-general-use`, 171 MB, from rembg's GitHub releases) downloads on first use, at step 3.
The Python packages take 585 MB.
Versions used on 2026-10-15: rembg 2.0.85, onnxruntime 1.31.0, numpy 2.5.4, Pillow 12.3.0, Python 3.13.

### 2 · Unpack the code's reference frames (about 30 s)
```sh
bash ../07-grok-test/unpack-ref.sh           # → ../07-grok-test/ref/: 145 frames × 6 passes
```
It prints "identical to the originals" for the five mask and control passes. The beauty pass is near-lossless
(see the script's header). **Only if** a C take's colour reading later lands within 0.2 ΔE00 of the 5.0 mark, render
the exact beauty frames from film 05's code and check that clip again:
`(cd ../05-one-sentence && npm ci) && (cd ../07-grok-test && ONLY=beauty node ref.mjs 2 145)` (not timed in the cloud).

### 3 · Calibrate the checker (about 3 min, in the background)
```sh
bash check-all.sh calibrate
```
This makes the code's own shot into a clip exactly like a fal clip (720p, 16 fps, 97 frames) and checks it. Expected
(rehearsed 2026-10-17 from a fresh clone, 3 min 8 s): **overlap 0.995 / worst tenth 0.988**, colour ΔE00 median 0.68
on 97/97 frames, flicker worst 6.32 %. The code's own sweep light reads as 6.3 % flicker, so flicker in step 6 is
compared with that, not judged on its own (it isn't one of Test 1's marks). If the overlap is below 0.99, stop: the checker isn't set up the same way, and nothing after this
would be comparable. Report what you see.

### 4 · Prices, the dry run, and the founder's yes (5 min)
```sh
node run.mjs --dry > out/logs/dry.log; grep '→' out/logs/dry.log        # nine lines: clip → endpoint
```
Nine requests: A ×3 `fal-ai/wan/v2.2-a14b/text-to-video`, B ×3 `fal-ai/wan/v2.2-a14b/image-to-video`, C ×3
`fal-ai/wan-vace-14b/depth`; each 720p, 16:9, 16 fps, 97 frames (about 6 s), seeds 11, 22, 33.
Read each endpoint's price on fal's model page today (for example `https://fal.ai/models/fal-ai/wan-vace-14b/depth`),
write the price and the date into `RESULTS.md`, and work out the total for 9 clips. (On 2026-10-15 fal listed VACE at
$0.08 per video second at 720p; the other two weren't checked.) **Tell the founder the total and wait for a yes.**
If it's over the cap, say so and stop.

### 5 · Generate (time not known yet; run in the background)
```sh
node run.mjs > out/logs/run.log 2>&1         # → out/A_seed11.mp4 … out/C_seed33.mp4, out/runs.json
tail -n 12 out/logs/run.log
```
Each finished clip prints one line with its time. If a request fails, the error is in `out/runs.json` and the clip is
missing; run the same command once more to retry only the missing ones, as long as the total stays under the cap.
If fal rejects an input field (a 422 error), fix only that field's name to match the endpoint's current schema,
and write the change into `RESULTS.md` under "Deviations". Never change the prompt, the seeds, the settings or the
marks.

### 6 · Check every clip (about 1–2 min a clip, in the background)
Read `README.md` now, once.
```sh
bash check-all.sh                            # one line per clip; details in out/logs/<clip>.log
```
Each line gives the overlap (median / worst tenth), the colour ΔE00 median and on how many frames it could be
measured, flicker, and the file's size and length.

### 7 · Blind realism ratings (the founder)
```sh
python3 -I blind.py                          # → out/blind/clip_1.mp4 … clip_9.mp4, out/blind/key.json
```
Send the founder the nine `out/blind/clip_N.mp4` files (in random order, no names, no metadata) and ask: "Rate each
1–5 for *looks like real footage*." **Don't reveal or hint which is which** until every rating is in. Write the
answers into `out/ratings.json` as `{"founder": {"clip_1": 4, …}}` (add other raters as more keys if the founder
brings them).

### 8 · Shape by eye (after the ratings)
```sh
"$PY" -I sheet.py                            # → out/sheet.png: the code on top, then the 9 clips, 6 moments each
```
Look at `out/sheet.png` once. For each clip, note whether the shoe stays one shoe (holds / small drift / changes)
and anything that shouldn't be there (text, logos, people). This isn't a pass mark; it goes in the results.

### 9 · The verdict
```sh
python3 -I verdict.py                        # the table, the marks, the verdict; writes out/verdict.json
```
It applies README's marks to the numbers. The session doesn't judge pass or fail itself.

### 10 · Write it down and push
1. **`RESULTS.md`** (new, in this folder):
   - the date;
   - the prices read, with their dates;
   - each request's time and its result, from `out/runs.json`;
   - the verdict table, copied from step 9;
   - the shape-by-eye notes;
   - any deviations;
   - what fal charged (the founder reads it on fal's billing page);
   - what the outcome means (README's last section) and the next step.
2. **Update** the "What's proven" table in `../docs/PROPOSED-ARCHITECTURE.md` and the status board in
   `../docs/REPO-STATUS.md`.
3. **Send the founder** `out/sheet.png` and the best C take.
4. **Commit by name.** Never `git add -A`; never stage `out/` or `.claude/`. Then push:
   `git push -u origin shayan/kind-hamilton-nvl2fl`. Commit messages end with the attribution lines the session's
   system prompt gives.

## The files

| File | What it does |
|---|---|
| `README.md` | The hypothesis, the three ways, the pass marks (fixed), what each outcome means, the budget |
| `RUNBOOK.md` | This page |
| `inputs/` | What fal is given: the code's depth video (`depth_16fps.mp4`, 97 frames), first and last frames |
| `prep.sh` | How `inputs/` was made from the reference (not needed again) |
| `run.mjs` | Sends the 9 requests to fal (`--dry` sends nothing), downloads to `out/`, logs `out/runs.json` |
| `check-all.sh` | Runs `segment.py` and `check.py` on each clip (or `calibrate`: on the code itself); one line each |
| `blind.py` | The shuffled, unlabelled set for the ratings, and the hidden key |
| `sheet.py` | The code and every clip at 6 moments in one picture |
| `verdict.py` | Applies the pass marks to the readings and ratings; states the verdict |
| `../07-grok-test/ref-pack/`, `unpack-ref.sh` | The code's reference frames (the truth), packed for git |
| `../07-grok-test/check.py`, `segment.py` | The checker (calibrated 2026-10-15) and the shoe outline (rembg, MIT) |

## Known risks, written before the run

- C's model on fal is Wan 2.1-based VACE; A and B are Wan 2.2. A model-generation gap, not only a control gap.
- The code's shot has a light that sweeps across the shoe every 2 s (`RESULTS.md` in 07). Where it crosses, the
  code's orange is brighter than a generated clip's is likely to be, so the colour reading can rise on those frames.
  The mark uses the median, so a few frames shouldn't decide it. It's noted here so it isn't explained away later.
- If fal's endpoints or fields have changed since 2026-10-15, step 5's rule applies.
