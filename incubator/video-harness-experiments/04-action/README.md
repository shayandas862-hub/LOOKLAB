# 04 · ACTION: the brand film, made entirely in code

A 1:32 brand film for the gen-video agent: one faceless hero runs through every kind of world the tool could make,
then through three product commercials, gets caught by the checker, fixed, and steps out of the screen into a world
of worlds. The plan, the decisions and the timings are in [`PLAN.md`](PLAN.md).

**Not part of Look Lab.** Nothing here is imported, built, tested or served by Look Lab (D-LL-056).

## How it's made

- **Picture:** three.js in headless Chrome, one frame at a time (`renderFrame(f)`), piped to ffmpeg. 1920×1080, 24 fps.
- **Sound:** synthesised in Node from the same clock (`audio/score.mjs`): plucked-string guitars through an amp
  model, bass, drums, struck metal, a gang of shouting voices built from formants, and every sound effect.
- **The clock:** 120 BPM at 24 fps, so one beat is exactly 12 frames. `src/timeline.js` holds every cue;
  `src/music.js` holds the track as data, and the picture reads the same drum hits for its flashes and punch-ins.
- **Fonts:** Anton and JetBrains Mono, both SIL Open Font Licence 1.1 (read from each package's licence file).
  three.js is MIT, playwright-core is Apache-2.0.
- **Products:** invented. No real brand, logo or design.

| File | What it does |
|---|---|
| `src/scenes/genesis.js` | 0:00–0:27 typing, chrome shards, grid, the pencil-drawn hero, WORLD / CAMERA / LIGHT |
| `src/scenes/films.js`, `src/worlds1.js`, `src/worlds2.js` | 0:28–0:44 the eight worlds |
| `src/scenes/spots.js`, `src/products.js` | 0:44–0:56 the sneaker and perfume spots |
| `src/scenes/fashion.js` | 0:56–1:04 the runway and the tag |
| `src/scenes/catch.js` | 1:04–1:12 freeze, rewind, fix |
| `src/scenes/inside.js`, `src/ring.js` | 1:12–1:28 the wall of screens and the world of worlds |
| `src/scenes/end.js` | the end card |
| `src/figure.js` | the hero and the models: jointed figure, run and walk cycles, solid / chrome / ink / line styles |
| `src/engine.js`, `src/pulse.js`, `src/overlay.js` | renderer and grade, beat-driven punctuation, type over the frame |

## Run it

You need Node 22+, ffmpeg and Google Chrome (`brew install node ffmpeg` on a Mac).

```sh
cd "incubator/video-harness-experiments/04-action"
npm install
node audio/score.mjs                      # → out/score.wav (about 35 s)
node render.mjs stills 12 30.5 58         # check single frames → out/stills/
node render.mjs clip 26 32                # a short preview with sound
node render.mjs video --workers 4         # → out/silent.mp4, in 2 s chunks; rerun to resume
bash finish.sh                            # master, share copy, two cut-downs, contact sheet, loudness
node verify.mjs                           # the motion checker
```

On an 8 GB M1, use `--workers 2`. In the cloud container (software WebGL, 4 cores, no GPU) the full film rendered in
68 min with 4 workers: 2,208 frames at 1.85 s per frame (measured 2026-10-14). The Mac's GPU hasn't been timed.
