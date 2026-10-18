# 11 · A still poster into motion, by code only

Made 2026-10-18 in the cloud from a restaurant's poster the founder supplied (a food photo with a headline, logo, badge,
product lines and an address bar). **No generative model and no fal.** The poster and the video stay in `out/` (ignored
by git): the poster isn't ours to publish. A test, not for commercial use until the restaurant agrees.

**What it does.** The video opens on the clean picture (no text) with a slow 2.5D camera pull-back and a focus pull; the
headline comes in last ("IT'S" drops, "BACK." rises letter by letter from behind the fries, a small punch on the full
stop), then the logo, badge, product lines and the bar, and it ends exactly on the poster. 10 s, 1080×1350, 30 fps.

**How (all classical maths, `poster.py`):**
1. The text is lifted off. Where it lies on the backdrop, it and a ring for the webp's colour smear become backdrop;
   where a letter touches the food, each pixel is unmixed (p = α·text + (1 − α)·what's behind), so the fries in front of
   the letters keep their edges.
2. The backdrop under the text is filled along each row and down each column, each trusted by how short its gap is; the
   table's stone texture is copied from a text-free patch beside it, the wall gets matching fine grain.
3. The product is cut out where the clean picture differs from the backdrop in colour or is lighter (the paper); a
   shadow is darker backdrop of the same colour, so it stays with the table.
4. Depth: the wall is far, the table comes nearer row by row, the product stands at the table's depth at its base, so
   it never slides off its own shadow. The camera scales and moves each layer by its depth.

```sh
# in the checker's environment (numpy, Pillow, scipy); ffmpeg on the path; the poster at out/in/poster.webp
../07-grok-test/.venv/bin/python -I poster.py layers   # 10–25 s → out/layers/ (clean, plate, product, text layers, sheet.png)
../07-grok-test/.venv/bin/python -I poster.py video    # 367 s in the cloud, peak 948 MB → out/poster_motion.mp4, out/contact.png
```

**Measured:** the last frame against the poster, mean |difference| 2.3 levels (the grain is 1.6); before the closing
0.3 s cross-fade the composited frame differs from the poster only at the fry edges in front of the letters.

**Limits, said plainly.** Nothing in the photo moves by itself: no steam, no drip, no hand (that needs generative video
or a camera). The camera move is small (13 %): a bigger one would reveal more invented backdrop beside the product.
It works here because the backdrop is plain; a busy background would need real inpainting. The text test is tuned to
this poster's colours (the red headline, olive type, the bar's row).
