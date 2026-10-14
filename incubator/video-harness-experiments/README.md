# video-harness-experiments: three films made by code

Experiments for the founder's gen-video agent, made in Claude Code on the web on 2026-10-13 and 14.
**Not part of Look Lab.** Nothing here is imported, built, tested or served by Look Lab. It sits in `incubator/`,
which no config reads (D-LL-056).

**How they're made.** No model draws a frame. Claude writes code in which every frame is a function of time
(`renderFrame(t)`), and a headless Chrome plays that code one frame at a time. Each screenshot is piped to ffmpeg,
which writes the MP4. The music is also code: it's synthesised in Node from the same timeline, so cuts land on the beat.
Rendering the same code twice gives the same video.

| | Film | Length | What it proved | Cloud render (no GPU) |
|---|---|---|---|---|
| `01-look-lab-pitch/` | Look Lab pitch | 15 s, 60 fps | 2D motion graphics: type, UI, data, a palette measured from a still; music and sound design in code | about 15 min |
| `02-brief-to-film/` | Brief to film | 15 s, 60 fps | 3D in three.js: motion blur from 180° shutter subframes, bloom, reflections, a camera on a spline, a sound lane drawn from the score | about 60 min |
| `03-first-light/` | First Light | 40 s, 24 fps, 13 shots | A character film with a story: two characters, blocking, depth of field, soft shadows, a colour grade, a score with foley and wordless voices | about 2 h 15 min |

The delivered MP4s are not committed. The founder has them, and the code makes them again.

Fonts (all SIL Open Font Licence, installed from npm through `@fontsource`):
- Film 1: Geist and Instrument Serif.
- Film 2: Mona Sans and Martian Mono.
- Film 3: Fraunces and Schibsted Grotesk.

three.js is MIT, and playwright-core is Apache-2.0.

## Run it

You need Node 22 or later, ffmpeg and Google Chrome. On a Mac: `brew install node ffmpeg`, plus Chrome from google.com.

```sh
cd "incubator/video-harness-experiments/03-first-light"   # or 01-…, 02-…
npm install
node audio/score.mjs                     # → out/score.wav (film 2 also writes src/envelope.json)
node render.mjs stills 2.5 13.5 28       # → out/still_<t>.png, to check frames before a full render
node render.mjs video --workers 2        # → out/silent.mp4
```

`render.mjs` chooses its browser itself:
- **In the cloud container:** the bundled Chromium with software WebGL (SwiftShader). It's slow, but it runs anywhere.
- **On your Mac:** the installed Google Chrome, using the Mac's GPU. Point `CHROME_PATH` at a different Chrome if needed.
  It should be much faster than the cloud. That hasn't been measured on the M1 yet; time the first run.

On an 8 GB M1, use `--workers 2`. Each worker is a whole Chrome.

Film 3 renders in 2-second chunks. Each finished chunk leaves a `.done` marker, so a stopped render picks up where it
left off when you run the same command again.

### Finish

**Film 3:** `bash finish.sh`. It does five things:
- Brings the score to -15 LUFS and runs a limiter (delivered at -13.5 LUFS, true peak -0.5 dBTP).
- Muxes the master.
- Makes a two-pass 5000k share copy under 30 MiB.
- Draws a contact sheet.
- Prints the loudness.

**Films 1 and 2:** mux the score by hand:

```sh
cd out
ffmpeg -i silent.mp4 -i score.wav -c:v copy -c:a aac -b:a 192k -movflags +faststart -shortest master.mp4
```

For a smaller share copy, do a two-pass libx264 encode at about 7500k. The flags are in film 3's `finish.sh`.

### Check the motion (film 3)

```sh
node verify.mjs .      # from 03-first-light/, after npm install
```

It steps through all 960 frames and flags these:
- camera speed over 6 m/s
- camera turns over 2.5 rad/s
- a character moving over 4 m/s
- a character turning over 9 rad/s

Cuts are skipped. The verifier found the two real problems in the first cut: a head whipping round at 23 rad/s, and a
crane that was too fast at the high-five. Both were fixed. On the delivered cut it still lists 42 frames, all in moves
that are meant to be quick:
- the director's quick looks (9.4–12.6 s)
- the actor stepping out of the café (20.3 s)
- the run (35.6 s)
- the closing crane (up to 8 m/s)

The thresholds are a first guess, not a standard.

## What the next step is

[`NEXT-SESSION-PRD.md`](NEXT-SESSION-PRD.md) is the paste-ready prompt for the next session: sharpening the PRD for
the autonomous gen-video agent these films were the first proof for.
