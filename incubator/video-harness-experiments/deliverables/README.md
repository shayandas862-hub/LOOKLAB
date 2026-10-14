# deliverables/ — finished films, ready to download

One place for every finished output of the video-harness experiments. Each film's code lives beside it in
`../NN-name/` and renders the same film again.

**Not part of Look Lab.** Nothing here is imported, built, tested or served by Look Lab (D-LL-056).

## 04 · ACTION (2026-10-14)

The 1:32 brand film, every frame and sound made by code. Plan and decisions: [`../04-action/PLAN.md`](../04-action/PLAN.md).

| File | What it is |
|---|---|
| `04-action/action_1080p.mp4` | The film: 1920×1080, 24 fps, 1:32, sound at -14 LUFS, peaks -1.5 dBFS (68 MB) |
| `04-action/action_720p.mp4` | The same film, small enough to send in a chat (26 MB) |
| `04-action/action_drop_16s.mp4` | Cut-down: 0:28–0:44, the eight worlds |
| `04-action/action_hook_8s.mp4` | Cut-down: 0:24–0:32, the hero comes alive, ACTION!, the drop |
| `04-action/action_riff_test.mp4` | The 18 s riff test sent before the picture was built |
| `04-action/action_soundtrack.wav` | The soundtrack alone, loudness-matched (48 kHz, 16-bit) |
| `04-action/contact.png` | 16 frames across the film |

**Not here:** the 1080p master at full bitrate (417 MB). GitHub refuses files over 100 MB; the code renders it
again (68 min in the cloud, measured 2026-10-14), and the 1080p file above is the same picture at a lower bitrate.

## 05 · ONE SENTENCE (2026-10-14)

The second 1:32 brand film, made entirely in code: one sentence goes through the tool's loop (plan, route, make, check,
cut) in one travelling camera, and comes out as a world. Plan and autonomous decisions:
[`../05-one-sentence/PLAN.md`](../05-one-sentence/PLAN.md); what's new and how it's made:
[`../05-one-sentence/README.md`](../05-one-sentence/README.md).

| File | What it is |
|---|---|
| `05-one-sentence/one_sentence_1080p.mp4` | The film: 1920×1080, 24 fps, 1:32, sound at -13.9 LUFS, peaks -1.4 dBFS (71 MB) |
| `05-one-sentence/one_sentence_720p.mp4` | The same film, small enough to send in a chat (25 MB) |
| `05-one-sentence/one_sentence_make_16s.mp4` | Cut-down: 0:28–0:44, the four lanes build and film the four shots |
| `05-one-sentence/one_sentence_check_12s.mp4` | Cut-down: 0:44–0:56, the checker measures the wrong orange (ΔE00 5.3 ✗) and the fix (0.1 ✓) |
| `05-one-sentence/one_sentence_hook_8s.mp4` | Cut-down: 0:24–0:32, the flight through the gates, "GO!", the drop |
| `05-one-sentence/one_sentence_soundtrack.wav` | The soundtrack alone, loudness-matched (48 kHz, 16-bit) |
| `05-one-sentence/contact.png` | 16 frames across the film |

**Not here:** the master at full bitrate (367 MB, over GitHub's 100 MB limit). The code renders it again (66 min in
the cloud, measured 2026-10-14); the 1080p file is the same picture at a lower bitrate.

## 06 · DAS PRODUCTION ident (2026-10-14)

A 14-second 3D studio ident for Das Production, made entirely in code from the company's own logo: four lacquered
petals swirl in and lock together, the D is drawn in molten gold, the name stands up letter by letter, a glint,
a hold. What it is and how close it is to the logo: [`../06-das-ident/README.md`](../06-das-ident/README.md).

| File | What it is |
|---|---|
| `06-das-ident/das_ident_1080p.mp4` | The ident: 1920×1080, 24 fps, 14 s, sound at -14.4 LUFS, peaks -1.3 dBFS (20 MB) |
| `06-das-ident/das_ident_720p.mp4` | The same, smaller (11 MB) |
| `06-das-ident/das_ident_master.mp4` | The render's own quality, for editing (49 MB) |
| `06-das-ident/das_logo_3d.png` | The 3D logo as a still (1920×1080, lossless), for posters and thumbnails |
| `06-das-ident/das_ident_sound.wav` | The sound alone, loudness-matched (48 kHz, 16-bit) |
| `06-das-ident/contact.png` | 12 frames across the ident |

**Films 01–03** (the earlier session): their MP4s were never committed and aren't in this container. Their code is in
`../01-look-lab-pitch/`, `../02-brief-to-film/` and `../03-first-light/` and renders them again.

**When posting:** call it a vision film ("what we're building"), don't name AC/DC, and check each platform's
length and file limits first (needs checking).
