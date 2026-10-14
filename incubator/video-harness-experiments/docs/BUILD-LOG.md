# Build log — the gen-video agent's experiments

What was built, in order, with the numbers measured at the time. Newest session at the bottom. Every number here
was measured in the session it sits under; anything not measured says so. **Not part of Look Lab** (D-LL-056).

## Session 1 — 2026-10-13/14: three films made by code

Films 01–03 (pitch, brief-to-film, First Light): see [`../README.md`](../README.md). The motion checker caught
two real mistakes in First Light (a head turning at 23 rad/s, a crane too fast at the high-five).

## Session 2 — 2026-10-14: PRD session, then the brand film ACTION (04)

**Started as** the PRD session for the agent (brain-dump done, summary confirmed). The founder then asked for a
1:30 brand film made in code, with Thunderstruck-like hard rock, products, 3D and 2D, cut to the beat. The PRD
questions are parked, not dropped.

### What was built

| Step | What | Measured |
|---|---|---|
| Plan | `04-action/PLAN.md`: 46 bars at 120 BPM / 24 fps, so one beat is exactly 12 frames | — |
| Sound | Plucked-string guitars (Karplus–Strong with a tuning correction) through an amp and cabinet model, bass, drums, struck metal, a 10-voice formant "HEY!" / "ACTION!" gang, ~40 sound effects | 92 s of soundtrack synthesised in 32–35 s; string pitch within 0.6 cent of the note from MIDI 28 to 88 |
| Riff test | 18 s, sent to the founder before any picture existed | Not yet heard back |
| Engine | three.js scenes picked by time, motion blur from sub-frames, bloom, a grade pass driven by the same drum hits as the score (flash on crashes, punch on snares, shake on kicks), DOM type over the frame | — |
| Hero | A faceless jointed figure, sculpted limbs, dark visor; run and runway-walk cycles; solid, chrome, ink-comic and glowing-line styles | Feet land on the beat |
| Scenes | Typing → chrome shards → grid → pencil hero; WORLD / CAMERA / LIGHT; eight worlds; sneaker, perfume, runway, tag; the catch; a wall of screens and a ring of worlds; end card | 10 scene modules, all under 300 lines |
| Preview | 0:26–0:32 with sound | 144 frames in 330 s with 4 browsers: 2.3 s per frame |
| Full render | 2,208 frames at 1920×1080 | 4,085 s (68 min), 1.85 s per frame, 4 browsers on 4 CPU cores, no GPU |
| Re-render | 11 chunks after two bugs | 528 frames in 995 s |
| Finish | Master, share copy, two cut-downs, contact sheet | -14.0 LUFS, peaks -1.5 dBFS; 1080p share copy 68 MB, 720p 26 MB |
| Checker | `verify.mjs` steps all frames and flags fast camera moves | 72 flags: single frames at cuts its rule doesn't recognise, plus two intended fast moves (pull-back at 1:12, crane at 1:24–1:27, up to 38 m/s at world scale) |

### Problems found, and how

Each one was caught by looking at rendered stills or contact sheets, not by the code running without errors.

| Problem | Found by | Fix |
|---|---|---|
| A syntax error left the page blank with no message | A still failed to render | The renderer now stops loudly if the page doesn't start |
| Limb ends were pointed | Still of the figure | Rounded caps on every limb |
| The visor faced sideways | Still of the hero from the front | The visor geometry now centres on the way the figure faces |
| Split screens showed only one half | Contact sheet | three.js takes scissor boxes from the render target itself, not the renderer |
| The inflated hero glowed white | Still at 0:24 | Key light from 260 to 30, greyer ceramic |
| Shatter was a blur; shards looked like dust | Contact sheet 6–8 s | Bigger shards, lights for them to catch, motion blur, less glow |
| Rings of colour (banding) behind the products | Contact sheet 44–71 s | Glows drawn in a dithered shader instead of an 8-bit gradient |
| The perfume glass rendered black | Same sheet | Glass refracts only solid objects; the backdrop is now solid |
| The runway was blown out | Same sheet | Lights cut to a fifth, a matte runway, a higher bloom threshold |
| Block outlines showed on the floor before WORLD | Contact sheet of the finished film | Blocks don't exist until their beat |
| A lamp post could cover the hero in the neon city | Same | Every lamp now stands behind the hero |

### What wasn't checked

- **The music by ear.** It was checked only as spectrograms, waveforms and levels. The founder's ears decide.
- **Render speed on the 8 GB M1.** It hasn't been timed.

### Where things are

- Code: `04-action/`
- Finished files: `deliverables/04-action/`
- Decisions: [`DECISIONS.md`](DECISIONS.md)
- The next experiment, gen video on top of code video: [`NEXT-GEN-VIDEO.md`](NEXT-GEN-VIDEO.md)
