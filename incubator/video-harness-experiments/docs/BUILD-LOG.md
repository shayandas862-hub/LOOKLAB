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

## Session 2, continued — 2026-10-14: the second brand film, ONE SENTENCE (05)

**Asked for:** push everything so it can be downloaded, document the build, then make a second 1:30 film with a more
enhanced concept, planned and made autonomously ("one step higher than before"). The concept and every decision
taken without asking are in `05-one-sentence/PLAN.md` and [`DECISIONS.md`](DECISIONS.md) (11–18).

### What was built

| Step | What | Measured |
|---|---|---|
| Plan | One sentence through the product's loop as one travelling camera; 46 bars at 120 BPM / 24 fps | — |
| Sound | A new track in A minor: clean arpeggio intro, riff, a solo over the checker (B♭ under the mistake, resolving on A at the pass), a harmonised anthem lead, "GO!" and "HEY!" shouts | Section levels -20.6 dB (brief) rising to -12.7 dB (world) before loudness normalising |
| True numbers | Frame, timecode, bar·beat, lens and camera speed on screen every frame, read from the film's own clock and camera | — |
| Colour check | `src/measure.js`: renders the shoe and a mask into a float target, averages the displayed accent colour (three.js ACES replicated) in CIELAB, and compares it by CIEDE2000 with the same shot rendered in the brand colour | Matches Sharma, Wu & Dalal (2005) on 3 pairs to 4 decimals. In the final render: shot 1 off-brand ΔE00 5.30 (fail, pass under 2.0); repainted and measured at a later frame, 0.14 (pass; near zero by construction, same paint as the reference). An earlier build, before later changes to shot 1's framing, read 5.29 / 0.67 |
| Motion check on screen | Each shot camera's top speed over its 48 frames | 0.10, 0.05, 0.19, 0.19 m/s in the final render (all under the 8 m/s mark) |
| Scenes | Brief, plan and gates, make (four lanes), check, cut, breath, world, end | 7 scene modules, every file under 300 lines (largest 181) |
| Full render | 2,208 frames at 1920×1080 | 3,953 s (66 min), 1.79 s per frame, 4 browsers on 4 CPU cores, no GPU; no page errors |
| Re-render | 3 chunks (0:56–1:02) after the contact sheet showed two near-empty seconds | 144 frames in 262 s with 3 browsers |
| Finish | Master, 1080p, 720p, three cut-downs, contact sheet | 12 min; -13.9 LUFS, peaks -1.4 dBFS; 1080p 71 MB, 720p 25 MB, master 367 MB (not committed) |
| Checker | `verify.mjs` over all 2,208 frames, after the fixes below | 139 flags, all intended: single frames at on-beat cuts, whip pans between the four sets, the rush through the gates (0:26.6–0:27.7, up to 22 m/s), and the crane over the sentence (1:23.6–1:27.5, up to 22 m/s at 70 m up, turning under 1 rad/s) |

### Problems found, and how

| Problem | Found by | Fix |
|---|---|---|
| The riff came out in C♯ major | Checking the notes' pitches | Riff notes written as fixed A-minor pentatonic steps |
| The wireframe sneaker read as a blob | Still of the shot packages | Outline edges only; figures drawn as wire |
| The shot packages sat under the cards | Same still | Raised above the cards |
| The deliberate mistake barely failed (ΔE00 2.42) | The measurement itself: ACES squeezes bright oranges together | A further-off orange for the mistake: 5.3 |
| The product shot was blown out | Still of MAKE | Lights and reflections turned down |
| Shot 1 was framed too far away; the timeline was cut off | Stills | Both reframed |
| The runner ran through the camera at 1:13, then still filled half the frame | Stills, then a contact sheet | The path moved 1.5 m further out, and the sentence in the sand with it |
| The sentence in the sand read mirrored from above | Still of the crane | Text axis flipped; the camera's up turns to the text's up as it rises |
| The end mark sat too high | Still of the end card | Camera reset |
| The pan from the shoe to the runner turned at 6 rad/s | Motion checker | It blends the viewing angle instead of two points, over 1.5 s |
| The swing to the side at the title (9.3 m/s), the push-in at the fail (12.4 m/s) | Motion checker | Longer, gentler eases |
| The crane over the sentence ran past 40 m/s | Motion checker | Starts a second earlier and eases over 5 s: 22 m/s |
| Two near-empty seconds at 0:58 | Contact sheet of the finished film | The camera now follows the shots down and travels along the timeline before the monitor rises |
| The docs carried an earlier build's ΔE (0.67) after the film changed | Reading the values the final render printed | Docs now quote the final render: 5.30 and 0.14 |

### What wasn't checked

- **The music by ear.** It was checked only as levels per section and pitch. The founder's ears decide.
- **Render speed on the 8 GB M1.** It hasn't been timed.

### Where things are

- Code: `05-one-sentence/`
- Finished files: `deliverables/05-one-sentence/`
- Decisions: [`DECISIONS.md`](DECISIONS.md) 11–18


## Session 2, continued — 2026-10-14: the Das Production studio ident (06)

**Asked for:** "Take this image and generate a 3D production level film studio, Hollywood type, for this logo and
animation", with the company's flat logo attached. Built autonomously; decisions 19–24 in [`DECISIONS.md`](DECISIONS.md).

### What was built

| Step | What | Measured |
|---|---|---|
| Measure the logo | Each shape's box and corner shape, the D's stroke, the words' x-heights and baselines, the colours (median of a patch per shape) | Red #91201A, D #E0A045, green #B8D949 → #E7F392, amber #DD8832 → #DECC46, cyan #60CFEA |
| Choose the lettering | Seven open-licence serifs compared beside the logo's words | Gelasio Bold (SIL OFL 1.1), drawn as Georgia's open match |
| 3D logo | Extruded leaf petals with bevels, clear-coat lacquer and per-vertex colour gradients; the D as two gold tubes with knobs; letters from the font's outlines, one mesh each | — |
| Light by measurement | Rendered colours checked against the logo in CIELAB, lights raised until they matched | First pass: everything at about half the logo's lightness (e.g. white letters L 62 against 100). After, on the final hero still (CIELAB ΔE76 against the logo): red 11.7, green 7.4, amber 9.4 against its gradient's middle, letters 7.9, gold D 12.6 (after the white-shine fix; before it: 7.9, 9.4, 7.0, 5.7, 11.5) |
| Sound | Drone and air, whooshes placed at each petal's closest pass to the lens (from the same motion code as the picture), swooshes and thuds at the locks, the big hit, a brass-like D major chord, a pen shimmer, a bell per letter, a glint | 14 s synthesised in about 3 s |
| Full render | 336 frames at 1920×1080, three motion-blur sub-frames each, plus god rays | 1,694 s (28 min), 5.0 s per frame across 4 browsers on 4 CPU cores, no GPU; no page errors. Rendered again after the white-shine fix: 1,674 s |
| Finish | Master, 1080p, 720p, hero still, contact sheet | 1 min 52 s; -14.4 LUFS, peaks -1.3 dBFS; master 50 MB, 1080p 20 MB, 720p 11 MB |
| Checker | `verify.mjs` | 1 flag, on frame 1: the checker reads the camera a frame late, so the first frame looks like a jump. From the motion code itself: top camera speed 2.1 m/s, top turn 0.11 rad/s |

### Problems found, and how

| Problem | Found by | Fix |
|---|---|---|
| The whole frame washed out to orange | First stills | The glow, rays and haze were each several times too strong; the visible glow and the rays' light source are now set apart |
| "o", "a", "p" and "d" broke: the counters came out solid and the letters hollow | Still of the words | TrueType outlines run clockwise; the shapes are now built with that winding |
| Haze in front of the logo greyed the brand colours | Contact sheet | Haze only behind the logo |
| The first four seconds were empty: the petals arrived from off screen too late | Contact sheet | The petals now swirl round the logo's centre from the first frame and fall out of the swirl into place |
| The light behind the logo leaked through the gap and tinted "as" orange | Hero still | The light moved behind the red petal, worked out for the hero camera's parallax |
| Everything rendered at about half the logo's lightness, and warm | Measuring the hero frame against the brand colours | Key and fill raised, the grade's warm gain removed; neutral tone mapping, which keeps brand hues |
| White letters bloomed into a halo | Hero still | Bloom only on hot things: the molten D, sparks, the hits |
| The score came out silent (NaN) | Loudness reading of -70 LUFS | A fractional power of a slightly negative sine at an envelope's edge; envelopes now clamped |
| The hit turned the frame muddy brown | Contact sheet | Less flash and ray wash at the hit; the lens streak and sparks carry it |
| A white shine as the D started (7.2–8.4 s): a pink-white lens-flare burst on the red petal, and a white glare on the cyan petal's corner | **The founder**, watching the delivered ident | Flare: its white core removed; the streak is now a thin warm line gone in half a second. Glare: found by switching each light off and measuring the corner (only the front fill changed it, 235 → 163): a mirror highlight of the fill light on the glossy bevel. The fill is now a hemisphere light, which lights the faces but makes no mirror highlights; the light behind no longer spikes at the hit, the rim light is gentler, and bloom barely rises at the hits. The gold D, which took its shine from the old fill, is less metallic so it keeps its colour |
| A gold line across the red petal and a sparkle at its centre as it locked (7.2–7.6 s) | **The founder**, with a screenshot | Both removed (the lens streak and the red petal's spark burst); the rings, the glow behind and the other petals' sparks stay. A first attempt also took out the rings and calmed the glow; the founder stopped it ("not those"), and those edits were put back before the narrower change |

### What wasn't checked

- **The sound by ear.** Checked as a spectrogram, a waveform and section levels against the picture's cues.
- **How it looks on the founder's screens and in an edit.** It's graded for a dark room and a neutral display.
