# Media in plain words: the crafts, and how the work flows

Written 2026-10-15 as background for the founder. General knowledge of how the industry works; tool names are
examples, not recommendations. Where generative AI is mentioned, what it can do changes fast and is checked at the
time, not taken from this page.

## Every production has three phases

| Phase | What happens | Who |
|---|---|---|
| **Pre-production** (planning) | Idea, script, storyboard (drawn shots), shot list, casting, locations, set and costume design, **previs** (rough 3D versions of tricky shots), budget, schedule | Writer, director, producer, designers, previs artists |
| **Production** (the shoot) | Cameras, lighting and sound recorded on set or location; actors perform; the art department dresses the set | Director, director of photography (camera and light), gaffer (lights), grips (camera support), sound recordist, art department |
| **Post-production** (finishing) | Editing, VFX and CGI, colour grading, sound design, music, mixing, titles, versions, delivery | Editor, VFX artists, colourist, sound designer, composer, mixer |

The rule of thumb in the industry: problems are cheapest to fix in pre-production and most expensive in post. That
is also the logic of our "preview before paying".

## The crafts: what each word means

**Live-action video.** Real cameras filming real things. The basics: **frame rate** (pictures per second; 24 is
the film look), **resolution** (pixels: 1080p, 4K), **aspect ratio** (shape: 16:9 wide, 9:16 phone, 1:1 square),
**lens** (in mm: low numbers are wide, high numbers are close-ups), **exposure** (how bright), and the **codec**
(how the file is compressed).

**Editing.** Choosing and ordering shots so they tell the story, with rhythm. A **cut** is a change of shot. The
first rough version is the **assembly**, then the **rough cut**, then **picture lock**: no more changes to timing,
so sound, colour and VFX can finish against it. Tools: Premiere Pro, DaVinci Resolve, Avid.

**Colour grading.** Making every shot match, then giving the film its look (warm, cold, high contrast). A **LUT**
is a stored colour transform; a **CDL** is a simple standard set of colour corrections. Tools: DaVinci Resolve.
Look Lab lives here and in the planning before the shoot.

**CGI (computer-generated imagery).** Making things that were never filmed, in 3D. The steps, in order:
1. **Modelling:** the shape.
2. **Texturing and materials (shaders):** what it's made of (leather, metal, glass) and how light behaves on it.
3. **Rigging:** an invisible skeleton, so it can move.
4. **Animation:** moving it over time.
5. **Lighting:** virtual lights.
6. **Rendering:** the computer calculating the final pictures, frame by frame (slow for realism).
7. **Compositing:** layering the result into the final image.

Tools: Blender, Maya, Houdini, Cinema 4D, Unreal Engine. **Our films 04–06 are CGI made in code.**

**VFX (visual effects).** Changing or adding to filmed footage. The main jobs:
- **Compositing:** layering images together.
- **Keying:** removing a green or blue screen.
- **Rotoscoping:** cutting things out frame by frame.
- **Tracking:** following the camera's move, so added things stick to the scene.
- **Cleanup:** removing wires, logos, rigs.
- **Simulation:** fire, water, smoke, destruction.
- **Matte painting:** painted or generated backgrounds.

Tools: Nuke, After Effects, Houdini. **Our "fixer" (putting the logo back on generated footage through masks) is
compositing.**

**Motion graphics.** Animated design: type, logos, shapes, infographics, title sequences. **Our Das Production
ident is motion graphics with CGI.** Tools: After Effects, Cinema 4D.

**Previs, techvis, postvis.** Previs is rough 3D versions of shots, made before the shoot to plan them. Techvis
works out the technical side (lens, camera height, crane length). Postvis is a rough VFX version placed in the edit
before the final VFX is done. **Our code "skeleton" is previs that also produces the controls for the AI.**

**Virtual production.** Filming actors in front of huge LED walls showing a 3D world that moves with the camera, so
the background is captured in camera instead of added in post.

**Sound.** Several separate crafts:
- **Production sound:** dialogue recorded on set.
- **Dialogue editing:** cleaning and choosing it.
- **ADR:** actors re-recording lines in a studio.
- **Sound design:** effects and atmospheres, built up in layers.
- **Foley:** everyday sounds (footsteps, cloth) performed to picture.
- **Mixing:** balancing everything.
- **Loudness:** delivering at each platform's target, measured in LUFS.

Our films' sound design and mix are code.

**Music.** Either **score** (composed for the film) or **licensed** (an existing track, needing a sync licence from
whoever owns the song and the recording). The composer's flow:
1. **Spotting:** deciding with the director where music goes.
2. **Writing to picture:** the tempo and the hits land on cuts.
3. **Recording or producing:** live players or virtual instruments.
4. **Stems:** separate drums, bass and so on, so the mixer can balance them.

**Our music is a synthesised score, written to the same clock as the picture.**

**Delivery and versioning.** The final files: masters, the same film in other shapes and lengths (30 s, 15 s, 6 s;
16:9, 9:16, 1:1), captions, loudness to spec, the right formats for each platform or broadcaster.

**Generative AI, today.** Models that make images, video, voices and music from text, pictures or other video. In
productions it's used for storyboards and mood, previs, backgrounds and B-roll, VFX cleanup, voice and music
drafts, and fast variations of social ads. Its known weak points: exact control (products, logos, text, continuity
between shots), consistency, and unclear rights. That gap is what this project is testing.

## Typical workflows

**A TV commercial or brand film.** The brand briefs its **agency**; the agency writes the idea and script and
hires a **production company** (director, crew, shoot); a **post house** does edit, VFX, colour, sound; music comes
from a composer or a licensed track. Rough timeline: weeks of planning, one to a few shoot days, weeks of post.
Approvals happen at the treatment, the storyboard, the offline edit and the final.

**A product or e-commerce video.** Packshots and turntables of the product, often in a studio or fully in CGI,
because the product must be exactly right and many versions are needed. **Our S3 shoe shot is this kind of video.**

**Social content.** Small team, days not weeks, lots of variations, phone formats first; speed matters more than
perfection.

**A music video.** The track is fixed first; everything is cut to it; often a strong visual idea on a small budget.

**A film or series.** The same three phases at a bigger scale; VFX-heavy work runs through many vendors with strict
pipelines and reviews.

**AI-native, today.** Prompt → generate stills to lock the look → animate them → edit → sound. Fast and cheap, with
the control problems above.

## Where our system sits on this map

| Craft | Our part | Made by |
|---|---|---|
| Script, storyboard, shot list | Planner | Claude, person approves |
| Previs, layout, camera | Skeleton | Code |
| The shoot (light, surfaces, actors, places) | Skin | AI model, on the skeleton |
| Script supervisor, quality control | Checker | Code, with measured pass marks |
| VFX compositing (logos, packaging, brand colour) | Fixer | Code |
| Edit, colour, sound, music, mix | Post | Code (music can also be licensed or composed) |
| Delivery, versions, records | Delivery | Code |

In short, it aims to be previs, shoot and post in one loop, with the shoot replaced by generation wherever things
only need to look real, and code keeping hold of everything that must be exact.
