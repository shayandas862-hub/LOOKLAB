# 05 · ONE SENTENCE: the tool at work, made entirely in code

A 1:32 brand film for the gen-video agent. One sentence is typed (*a launch film for a running shoe. warm.
premium.*), and one travelling camera follows it through the product's loop: the shots are planned, routed to four
engines, built, checked, cut, and then the camera steps through the finished frame into the world the sentence asked
for. ACTION (04) showed what the tool could imagine; this one shows it working. The plan and the decisions taken
autonomously are in [`PLAN.md`](PLAN.md).

**Not part of Look Lab.** Nothing here is imported, built, tested or served by Look Lab (D-LL-056).

## What's new since ACTION

- **One camera journey.** Every change of scene is a hidden cut: into the full stop, through a gate's light, through
  a monitor. Inside MAKE the camera whips from set to set on the beat.
- **Every number on screen is true.**
  - The bottom line shows the frame, the timecode, the bar and beat, the lens and the camera's speed. They are read
    from the film's own clock and camera each frame.
  - The lens on each storyboard card is the lens its shot is filmed with (`fovOf(mm)` in `src/timeline.js`).
  - The ΔE00 on the checker is measured from rendered pixels when the film starts (`src/measure.js`). It compares
    the shoe's displayed accent colour with the same shot rendered in the brand colour, using CIEDE2000 (checked
    against Sharma's 2005 test pairs). The reference is that brand-colour render, not the bare hex value.
  - The camera speeds in the CHECK gallery are each shot camera's real top speed.
  - The waveform on the timeline is the film's own score, decoded from `out/score.wav`.
- **A real brief, made.** The four cards become four sets (dune at dawn, stride, the shoe, city at night). Each is
  built on the beat and filmed with its card's lens.
- **A deliberate mistake, caught.** Shot 1 is first made with an off-brand orange. The checker measures it at
  ΔE00 5.3 (fail, the pass mark is under 2.0). It's repainted and measured again, at a later frame of the shot:
  0.1 (pass). The pass is near zero by construction: it's the same paint as the reference, seen a moment later.
- **A new track:** hard rock in A minor. It opens on a clean arpeggio, has a guitar solo over the checker (a B♭ under
  the mistake that resolves on the pass), a harmonised lead over the world, and a gang shout of "GO!".

## How it's made

The same engine as ACTION.
- **Picture:** three.js in headless Chrome, one frame at a time, piped to ffmpeg. 1920×1080 at 24 fps, 120 BPM:
  one beat is 12 frames.
- **Sound:** synthesised in Node from the same timeline (`audio/score.mjs`).

| File | What it does |
|---|---|
| `src/timeline.js` | Sections, cues, shouts, the brief, the four shots and their lenses |
| `src/music.js` | The track as data: riff, chords, solo, anthem lead and harmony, drums, bass |
| `src/scenes/brief.js` | 0:00–0:12 the sentence typed in 3D; the push into the full stop |
| `src/scenes/plan.js`, `src/sketches.js` | 0:12–0:28 cards drawn by a live pencil, unfolding into shot packages; the four gates |
| `src/scenes/make.js`, `src/sets.js` | 0:28–0:44 the four sets built by their lanes (3D, AI, CODE, CAMERA) and filmed |
| `src/scenes/edit.js`, `src/measure.js` | 0:44–1:12 the checker (measured ΔE00), the timeline, the three frame shapes |
| `src/scenes/world.js` | 1:12–1:28 through the monitor into the dune; the runner; ONE SENTENCE; the crane over the sentence |
| `src/scenes/end.js` | the end card |
| `src/overlay.js` | the true-numbers line, lane labels, viewfinder, ΔE panel, titles |
| `src/engine.js`, `src/pulse.js`, `src/figure.js`, `src/products.js`, `src/worlds1.js` | carried from ACTION: renderer and grade, beat punctuation, the hero, the sneaker, the neon city |

**Licences:**
- Fonts: Anton and JetBrains Mono, both under the SIL Open Font Licence 1.1.
- three.js is MIT; playwright-core is Apache-2.0.
- The product and the hero are invented: no real brand, logo, design or face.

## Run it

You need Node 22+, ffmpeg and Google Chrome (`brew install node ffmpeg` on a Mac).

```sh
cd "incubator/video-harness-experiments/05-one-sentence"
npm install
node audio/score.mjs                      # → out/score.wav (the picture reads it for the waveform)
node render.mjs stills 10 47 74           # check single frames → out/stills/
node render.mjs video --workers 4         # → out/silent.mp4, in 2 s chunks; rerun to resume
bash finish.sh                            # master, 1080p, 720p, three cut-downs, contact sheet, loudness
node verify.mjs                           # the motion checker
```

On an 8 GB M1, use `--workers 2`.

In the cloud container (software WebGL, 4 cores, no GPU) the full film rendered in 66 min with 4 workers: 2,208
frames at 1.79 s per frame, and `finish.sh` took 12 min (measured 2026-10-14). The Mac's GPU hasn't been timed.
The finished files are in [`../deliverables/05-one-sentence/`](../deliverables/05-one-sentence/).
