# ACTION: the brand film (experiment 04)

Planned with the founder on 2026-10-14. **Not part of Look Lab:** nothing here is imported, built, tested or served
by Look Lab (D-LL-056). It sits beside the three earlier films.

## The brief

A 1:30 brand film about what the gen-video agent will let anyone imagine and make. It's for filmmaking **and** brand
commercials. It's mostly pictures and music, with only about a dozen words on screen. Engaging and cut to the beat.
It's the launch piece for the build-in-public track, and its cut-downs feed the daily posts.

**The idea in one line:** one faceless hero runs through every kind of world the tool can make, while a machine
builds, checks and fixes the film around them, in time with a hard-rock track.

## Decisions (2026-10-14)

| Chose | Rejected | Why |
|---|---|---|
| Everything made by code: picture and music | Real footage; AI-generated clips | Keeps "made entirely in code" true. The **next** film mixes in generated video. |
| Hard rock with the *shape* of AC/DC's Thunderstruck: one relentless riff, a crowd shout, the drums slamming in, a drop, a bigger return | Copying its riff, melody or "Thunder!" chant | Too close a soundalike is a copyright risk, and platforms scan uploads and can mute or block matches. Our own riff, key and shout word. |
| Music synthesised in code, with a short riff test the founder hears first | A stock track; a session guitarist from the start | Code owns everything and is itself a post ("even the music is code"). If the test doesn't hit, a real guitarist plays our riff. |
| Products: a sneaker, a perfume, a jacket on fashion figures | Real brands | The film must read as commercials too. Invented products only: no real logos, no copies of famous designs. |
| Faceless, stylised 3D figures | Realistic people | No real faces, no lookalikes (the founder's rule). |

## The clock

120 beats a minute and 24 frames a second, so **one beat is exactly 12 frames** and every cut lands on a beat.
One bar is 2 seconds. The film is 46 bars: 1:32. All picture and sound read the same cue list (`src/timeline.js`).

## The film

| Bars | Time | Section | Music | Picture |
|---|---|---|---|---|
| 0–5 | 0:00–0:12 | **SPARK** | The riff alone: quiet, muted, filter opening. A metal hit every 4 s. | A cursor blinks on the beat and types *imagine anything*. The letters crack into chrome shards, which fall and light up a floor grid. A glowing pencil line draws the hero. |
| 6–13 | 0:12–0:28 | **ASSEMBLE** | Riff doubled, bass and kick in. A crowd **"HEY!"** every 4 s. A snare roll and riser, then one bar of silence for the shout **"ACTION!"** | Each HEY slams one word and builds one thing: **WORLD** (blocks rise out of the grid), **CAMERA** (a chrome film camera assembles part by part), **LIGHT** (a studio light bangs on, hard shadows). Then the line-drawn hero inflates into 3D. Split screens: blueprint beside render. The silence: **ACTION** on black. |
| 14–21 | 0:28–0:44 | **FILMS** | The drop: the full band. A crash on every downbeat. | The hero sprints, feet landing on the beat. On every downbeat the world changes around them while they hold the same pose and spot: neon city, desert dusk, under the sea, snowy peaks, space station, ink comic, chrome studio, a world of type and data. |
| 22–24 | 0:44–0:50 | **SNEAKER** | Groove, then a drum roll, then a slam. | A sneaker spins in and freezes mid-air, bursts into its layers on the roll, slams back together on the downbeat and lands on a chrome stand. Colourways change on the beat. |
| 25–27 | 0:50–0:56 | **PERFUME** | Half-time, heavy. | One slow-motion drop falls through black onto a dark glass bottle. Light sweeps across the glass. The cap clicks on the snare; the spray mist catches orange light. |
| 28–30 | 0:56–1:02 | **FASHION** | A crash, then a stomping runway groove with flashbulb pops. | A silk sheet whips away to reveal faceless chrome models walking at camera in a jacket. The jacket's colour changes every beat; the checker matches each one to a brand swatch and ticks it. |
| 31 | 1:02–1:04 | **TAG** | Tom fill. | The three products circle the hero, who now wears the jacket and the sneakers. |
| 32–35 | 1:04–1:12 | **CATCH** | Everything drops: a muffled riff and a heartbeat kick. A shout alone: "ACTION!" | Freeze. A red box on the hero's head: *too fast ✗* (the real mistake the checker caught in First Light). The shot scrubs back, rebuilds from wireframe, the mark turns ✓. The hero turns to the camera. |
| 36–43 | 1:12–1:28 | **STEP INSIDE** | Everything back, biggest: double-time drums, a lead guitar line. | The camera pulls back: the film was a screen, and the screen is a doorway. The hero steps through into a world they can walk around, every style at once in bands around the horizon. *then step inside.* A huge crane-up. |
| 44–45 | 1:28–1:32 | **END** | The final hit and its ring-out. | Black, then the end card: a chrome mark and *built in public · follow the build*. The product's name goes here once it has one. |

**Words on screen, all of them:** *imagine anything*, WORLD, CAMERA, LIGHT, ACTION, *too fast ✗*, *then step inside.*,
the end card.

## The look

- **Colour:** black, steel and chrome, with one hot colour: grinding-spark orange. White flashes on the big hits.
  Each film world may carry its own grade for two seconds.
- **3D:** chrome and matte ceramic, hard light, haze. Stylised on purpose: it's what code does best, and photoreal
  isn't proven yet.
- **2D:** glowing pencil and blueprint lines that turn into 3D; flat motion-graphic shapes on the hits.
- **Type:** big condensed capitals slammed on the snare; a small monospace for the checker's labels. Open-licence
  fonts only, checked from the package's own licence file before use.
- **Edit:** cuts on downbeats, match cuts on the hero's pose, whip pans on fills, flash frames on crashes, speed
  ramps, split screens, a punch-in on snare hits. No cheap glitch effects.

## Deliverables

- The hero film: 16:9, 1:32, 1920×1080, 24 fps, for LinkedIn, X and YouTube.
- Cut-downs from the same render: the 16 s **FILMS** drop, and an 8 s hook (the riser into the drop).
- A 9:16 version made by moving the camera inside the 3D scenes, not by cropping: only if time allows.
- Each platform's length and file limits: **needs checking** before export.

## Honesty rules

- Post it as a vision film ("what we're building"): the tool doesn't do this yet.
- Say "made entirely in code" only while it stays true.
- No real faces, no real brands, and no mention of AC/DC in the posts.
- Render times and costs are measured, not guessed: the earlier estimate (about 5 h in the cloud) is a scale-up of
  First Light, not a measurement.

## Open

- The product's name for the end card (the PRD's question 12).
- Whether the code-made music is good enough: the founder's ears decide after the riff test.
