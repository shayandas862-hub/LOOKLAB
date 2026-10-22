# S6 · a person with the bowl (a test, not in the ad yet) · the 3D and what the models must add

Written 2026-10-22 in the cloud session. **A test, not for commercial use.** The person is the founder, with their
consent for their own face; nobody else's face, no lookalikes. Nothing has been sent to fal for S6.

## The 3D (code, $0)
`person.html`, `src/person.js`, `src/figure.js` (film 05's jointed figure, matte clay, no face). 5 s, 9:16, 24 fps:
a clay stand-in behind the café counter holds the full açaí bowl at chest height in both hands, lifts it slightly
towards the lens; the camera arcs from 24° left to 24° right and pushes in a little; the head follows the camera.

    PAGE=person.html node render.mjs passes 0 5 121 --name s6 --fps 24 --passes beauty      → out/passes/s6/beauty_24fps.mp4
    PAGE=person.html node render.mjs passes 0 4.96 3 --name s6-sheet --passes beauty,depth,mask:person,mask:bowl,mask:head

Render time here (cloud software renderer): 266 s for the 121-frame clip; 18 s for the 3 × 5 passes.

## Where each thing comes from
| | Who decides it | Exact? |
|---|---|---|
| Camera path, lens (50 mm), framing, timing, the pose, where the hands and bowl are, counter, wall, light direction | the code | yes, and the masks say where each part is in every frame |
| The bowl's layout (stripes, layers) | the code, then the photo of the real look | layout yes; look from the still |
| Your face, hair, skin tone, build, clothes | your photo | only as well as the model copies it |
| **First frame:** your face at the camera's start angle (about 24° to the side; a front photo doesn't show it), fingers gripping the bowl (the stand-in has none), fabric and folds, skin texture under our light, real food and glass | the image model | no: checked by eye (face) and by the masks (person, bowl) |
| **Between frames:** your face from every angle of the arc (cheek, ear, hair side), blinks, smile, eye contact, breathing, hair and cloth moving, fingers settling, the bowl staying in the hands, light moving over skin, reflections in the glass, **you staying you for all 120 frames** | the video model | no: shape by the masks; identity only by your eye |

The biggest risk is identity across the arc: one photo shows one angle, and the model invents the rest. A second
photo from the side (about 30°) would give it more to go on.

## Not measured yet
- Identity: no face-match measure is wired in (an open-source face-similarity check is possible; licence to read
  first).
- Shape: the checker reads the person and bowl masks; it was built for the bowl (`s3-check.py`) and would need the
  person's mask added.
