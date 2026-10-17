# Where everything is, and its status (the whole repo, every branch)

Read from GitHub and the clone on **2026-10-15**, after `git fetch --all`; updated 2026-10-17 for Test 1's handover and its interim result. Kept on branch
`shayan/kind-hamilton-nvl2fl`; update it when a branch moves.

## The repo

- **GitHub:** <https://github.com/shayandas862-hub/LOOKLAB>
- **Pull requests:** none, open or closed. Nothing has been merged into `main` through a PR.
- **Branches:** three. Nothing is behind `main`, so any of them could merge cleanly today.

| Branch | Last commit | What it holds | Ahead / behind `main` | Status |
|---|---|---|---|---|
| `main` | `9a650d8`, 2026-10-09: "Park visual-dashboard in incubator/; plan the end-to-end suite" | **Look Lab**, the product: engine, UI, records, tests. Also `incubator/visual-dashboard/` (parked) and the end-to-end suite plan `plans/P-LL-002-end-to-end-suite.md` | — | P0–P4 done. **P4.5 (colour) in progress**: part 1 done 2026-10-03, the rest not started. Not touched by any of the video work |
| `docs/p-ll-002-pre-production` | `936a3a3`, 2026-10-09: "Prompt 11: build session for the Pre-production tab" | A plan for a **Pre-production tab in Look Lab** (script → shots → frames → video), learned from the *Dead Man's Telescope* anime short: `docs/VISION.md` (V-LL-003), `plans/P-LL-003-pre-production-generation.md`, `prompts/11-pre-production.md` | 3 ahead, 0 behind | Plan only, no code. **Waiting on the founder's yes** to merge it into `main` |
| `shayan/kind-hamilton-nvl2fl` | the latest commit (`009a110` on 2026-10-15, then the Test 1 handover on 2026-10-17) | **The gen-video agent experiments**: films 01–06, the Grok test (07), Test 1 on fal (08), the docs, the face-scan research. All under `incubator/video-harness-experiments/` | 22 ahead, 0 behind | Active. Pushed. Changes nothing outside `incubator/` (only one line in `incubator/README.md`) |

The local clone in the cloud session also has a `main` that is one commit behind GitHub's. It's never used, so it
doesn't matter.

**Rule kept throughout:** Look Lab stays a separate product. Its `main` branch was not touched. Nothing under
`incubator/` is imported, built, tested or served by Look Lab (D-LL-056).

## Branch `shayan/kind-hamilton-nvl2fl`, folder by folder

All paths are under `incubator/video-harness-experiments/`. The index is [`../README.md`](../README.md).

### The films (made entirely in code)

| Folder | What | Length | Status | Finished files |
|---|---|---|---|---|
| `01-look-lab-pitch/` | Look Lab pitch: 2D motion graphics | 15 s | Done. Code only, no MP4 in git | Re-render from code (about 15 min) |
| `02-brief-to-film/` | Brief to film: first 3D in three.js | 15 s | Done. Code only, no MP4 in git | Re-render (about 60 min) |
| `03-first-light/` | First Light: a character film with a story | 40 s | Done. Code only, no MP4 in git | Re-render (about 2 h 15 min) |
| `04-action/` | ACTION: a brand film, eight worlds, a hard-rock score | 1:32 | **Done** | `deliverables/04-action/` |
| `05-one-sentence/` | ONE SENTENCE: the tool at work, one travelling camera | 1:32 | **Done** | `deliverables/05-one-sentence/` |
| `06-das-ident/` | Das Production 3D studio ident, from the company logo | 14 s | **Done** (the founder's three notes applied) | `deliverables/06-das-ident/` |

### The tests (can AI video add realism without losing exactness?)

| Folder | What | Status |
|---|---|---|
| `07-grok-test/` | Film 05's shots as starting frames for Grok Imagine; a checker that measures each clip against the code | **Done for S3, takes 1 and 2.** Take 1 held the shape (0.90) but added no real surface; take 2 added a real surface and lost the shape (0.57). Results in `RESULTS.md` |
| `08-skin-test/` | Test 1 on fal: words only (A) vs pictures (B) vs the code's depth video (C), 3 takes each, pass marks written first | **Run 2026-10-17; interim result in `RESULTS.md`.** 9 clips, $4.36. C holds the shape (0.96–0.97, 3/3) where A and B don't; no clip keeps the brand orange (C 8.3–11.8 ΔE00, mark 5), so none can be real and exact. Waiting on: the blind realism ratings, then the contact sheet and `verdict.py`. Clips not in git |
| `09-runner-test/` | Test 1b on fal: film 4's last 15 s (the faceless runner), route C only, pass marks written first | **Run 2026-10-17, 1 take, $1.21; result in `RESULTS.md`.** Not real and exact: the runner reads 0.833 against a mark of 0.85 (holds in the walk, slips in the orbit); the founder rates the look 1 out of 5. Clip not in git |

### Documents

| Path | What |
|---|---|
| `docs/PROPOSED-ARCHITECTURE.md` | The proposed system: seven parts, the process for one film, what's proven and what isn't |
| `docs/MEDIA-PRIMER.md` | The crafts of media (video, CGI, VFX, sound, music) and how productions flow, in plain words |
| `docs/NEXT-GEN-VIDEO.md` | The original plan for the gen-video loop (render → generate → measure → retry) |
| `docs/BUILD-LOG.md` | What was built, film by film, with measured times |
| `docs/DECISIONS.md` | The decisions made while building (1–24) and the fixes from the founder's notes |
| `docs/NEXT-CHAT-DEEP-RESEARCH-PROMPT.md` | **New:** a paste-ready prompt for a new chat: does this product exist already, in pieces, and are the big players building it? |
| `docs/NEXT-CHAT-FAL-PROMPT.md` | **New:** the paste-ready prompt for the session that runs Test 1 on fal, how the architecture plays in it, and how its context is kept small |
| `08-skin-test/RUNBOOK.md` | **New:** Test 1 step by step, for that session: commands, expected numbers, rules |
| `CLAUDE.md` (this folder) | **New:** the standing rules for any Claude session working in this folder (not Look Lab's) |
| `docs/REPO-STATUS.md` | This page |
| `NEXT-SESSION-PRD.md` | A paste-ready prompt for the PRD session (brain-dump → grill-me → to-prd). **Its 12 questions are still open** |
| `reports/Face scan to styled character.md` | Research (2026-10-14, from another session): a user's face to a styled character in images, 3D and video. Its notes are in `research_notes/Face scan to styled character/` |
| `deliverables/README.md` | What each finished file is |

### The finished files in git (`deliverables/`, about 380 MB)

| Folder | Files |
|---|---|
| `04-action/` | `action_1080p.mp4` and `action_720p.mp4` (1:32), `action_drop_16s.mp4`, `action_hook_8s.mp4`, `action_riff_test.mp4`, `action_soundtrack.wav`, `contact.png` |
| `05-one-sentence/` | `one_sentence_1080p.mp4` and `one_sentence_720p.mp4` (1:32), `one_sentence_make_16s.mp4`, `one_sentence_check_12s.mp4`, `one_sentence_hook_8s.mp4`, `one_sentence_soundtrack.wav`, `contact.png` |
| `06-das-ident/` | `das_ident_master.mp4`, `das_ident_1080p.mp4` and `das_ident_720p.mp4` (14 s), `das_ident_sound.wav`, `das_logo_3d.png`, `contact.png` |

To download: on GitHub, switch to branch `shayan/kind-hamilton-nvl2fl`, open the file, then "Download raw file".

## What is not in git, and why

These live only in the cloud session's disk. **That disk is wiped when the session ends.**

| What | Where | Size | If it's lost |
|---|---|---|---|
| Each film's render frames and pieces | `04-action/out/`, `05-one-sentence/out/`, `06-das-ident/out/` | about 3.5 GB in total | Re-render from the code. The finished files are already in `deliverables/` |
| The founder's Grok clips | `07-grok-test/clips/S3_take1.mp4`, `S3_take2.mp4` | 1.6 MB | **The originals are in the founder's Grok account.** Kept out of git because Grok's terms aren't confirmed |
| The code's reference frames for the checker, unpacked | `07-grok-test/ref/` | about 290 MB | Rebuilt in about 30 s by `07-grok-test/unpack-ref.sh` from `ref-pack/`, which **is** in git (48 MB) |
| The checker's readings and comparison videos | `07-grok-test/report/`, `07-grok-test/clips/CODE_itself.mp4` | about 25 MB | Re-made by `check.py` (`08-skin-test/check-all.sh calibrate` remakes the code's own clip) |
| Test 1's clips, logs, ratings and verdict | `08-skin-test/out/` | about 17 MB of clips (plus the blind copies) | Kept out until fal's and Wan's terms are checked; the numbers are in `08-skin-test/RESULTS.md`, which is committed |
| Installed packages | `node_modules/` in each folder | — | `npm install` |

The ignore rules are in `.gitignore` files (`out/`, `node_modules/`; and `clips/`, `ref/`, `report/` in 07).

## The status board

| | Item |
|---|---|
| **Done** | Films 01–06; the Das Production ident; the Grok test for S3 (takes 1 and 2); the checker, calibrated (the code itself scores 0.995); the architecture and media primer docs; the face-scan research |
| **Ready, waiting on the founder** | Test 1 on fal: run 2026-10-17 (interim: shape held, colour missed); the blind realism ratings are the one thing left. Test 1b (the runner, 15 s, route C): run 2026-10-17, not real and exact (`09-runner-test/RESULTS.md`). Next, proposed: the same depth video on one stronger control model, priced first. The deep-research prompt: paste it into a new chat. The Pre-production tab plan: yes or no to merging |
| **Open questions** | The PRD's 12 questions (`NEXT-SESSION-PRD.md`); where the gen-video agent lives for good (`NEXT-SESSION-PRD.md` suggests its own new repo) |
| **Not started** | Test 2 (blind "which would you ship" with brand and production people); Test 3 (cost and time per usable second on a real multi-shot job); the Fixer (logo and brand colour put back through the masks); 9:16 versions; MP4s of films 01–03; a verdict on the music |
| **Look Lab (separate product)** | P4.5 colour in progress on `main`; untouched here |
