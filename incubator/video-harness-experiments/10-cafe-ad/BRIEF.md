# Test 2 · a café ad (Blend, Stirling) · step 1: brief and research

Written 2026-10-17. **A test, not for commercial use** until the café agrees and the models' terms are checked.
Source: the founder's three screenshots of Instagram `blend.stirling` (not opened directly; the screenshots are not
copied into git and nothing from them is sent to fal until the café agrees).

## What they sell
Açaí bowls (the hero: purple base, strawberry, banana, blueberry, granola, Biscoff, peanut butter), yogurt bowls,
frozen yogurt, smoothies, matcha, iced lattes (Biscoff, Oreo, S'mores, pistachio, Bueno), "combo cups" (açaí on top
of matcha in one cup), bagels and toasties. Business bundle £7.50. 67A King Street, Stirling. 44 posts, 786 followers.

## How they look
- **The wall is the brand:** a bold psychedelic mural (red, blue, green, yellow lines) behind most product shots, plus
  yellow door frames, chalkboard menus in coloured chalk, light wood counter, terracotta floor tiles.
- **Logo:** a mustard-yellow "B" shaped like a blender jug, "Blend" in script, on white. Yellow sampled from the
  screenshot: about `#CAAC3A` (a phone screenshot: the café's own logo file decides the real value).
- **Light:** phone footage, daylight from the shop front mixed with warm room light; no styled lighting.
- **Style:** a hand holds the product up to camera in front of the mural; short Reels; jokey student voice in the
  captions ("god forbid a girl has a hobbie", "açaí bowl after uni?", "so I get another açaí just to know I'm alive").

## Ideas (step 1: the founder picks one)
1. **Built in one take:** an açaí bowl assembles on the wood counter, topping by topping, then the logo.
2. **Up against the wall:** the products in front of the mural, slow camera moves, their own caption jokes as type.
3. **After uni:** three times of day, three products (matcha morning, açaí after uni, frozen yogurt Saturday night).

**The founder's pick (2026-10-17): their own version of 1, "a thousand-dollar commercial":** the ingredients float,
fall into the bowl layer by layer, the bowl turns 360° to show the layers, and a hand drizzles honey from a bottle.

## Previs in code (free; `node render.mjs video` → `out/previs.mp4`)
9:16 (Reels), 24 fps, 17.5 s. A clear glass bowl so the layers show (our choice: the café uses clear tubs and kraft
bowls). Placeholder type, not their logo.

| Shot | Time | Lens | What |
|---|---|---|---|
| S1 FLOAT | 0–3 s | 50 mm | strawberries, blueberries, banana, kiwi, granola, oats and an açaí scoop float in slow motion, then drop |
| S2 FALL IN | 3–7.5 s | 40 mm | açaí scoops, a granola band, more açaí, then the toppings land in stripes |
| S3 360 | 7.5–12 s | 50 mm | the bowl turns all the way round on a wooden turntable; the layers through the glass |
| S4 HONEY | 12–15 s | 65 mm | a hand (clay stand-in) squeezes a honey bottle in a zigzag over the top |
| S5 END | 15–17.5 s | 45 mm | the hero bowl, then "Blend" and the address |

**Risk by shot for the AI steps (judgement, not measured):** S3 is the safest (a still object turning, like the
shoe at 0.97), so it is the first 5 s test shot. S1 and S2 have many small falling pieces, the video model's weak
spot. S4 has a hand (no face) and a fluid.

**Found 2026-10-17, before any spend:** a full 360° starts and ends on the same view, so its first and last keyframes
would be the same picture and the video model would invent the far side of the bowl. Fix to decide in the plan: paint
three keyframes (0°, 180°, 360°) and make the turn as two halves.
