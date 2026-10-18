"""A still poster into a short motion piece, by code only (no generative model): the text is lifted off, the video
opens on the clean picture with a slow 2.5D camera move, and the text comes in last, ending on the poster itself.
How the clean picture is made (classical maths, no inpainting model):
  - the backdrop is smooth, so it is modelled from its own pixels (normalised convolution, coarse to fine);
  - each text colour is unmixed: a pixel p = α·text + (1 − α)·F, with F the nearest pixel outside the text; the text's
    share α is taken out and replaced by the backdrop, so letters vanish and the food edges in front of them stay;
  - the product is cut out where the clean picture differs from the backdrop model; the plate under it is the model.
Layers and depth: the backdrop wall is far, the table comes nearer row by row, the product stands on the table.
  python -I poster.py layers      → out/layers/*.png and out/layers/sheet.png (check the cut-out by eye)
  python -I poster.py video       → out/poster_motion.mp4 (1080×1350, 30 fps) and out/contact.png
The poster lives in out/in/poster.webp (out/ is ignored by git: the poster isn't ours to publish)."""
import json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd

HERE = Path(__file__).resolve().parent
OUT, LAYERS = HERE / 'out', HERE / 'out' / 'layers'
POSTER = OUT / 'in' / 'poster.webp'

# Where the poster's text sits (measured on it, 2026-10-18): the red headline in two lines, the small dark-green type, the bar.
HEAD, HEAD_SPLIT = (170, 60, 980, 512), 282          # x0, y0, x1, y1; "IT'S" above the split row, "BACK." below
SMALL = {'logo': (55, 38, 300, 130), 'badge': (860, 38, 1085, 130), 'line1': (260, 1218, 865, 1270), 'line2': (260, 1270, 865, 1314)}
BAR_TOP = 1329                                        # its thin light top edge (row 1330) belongs to it
HORIZON = 900                                        # the table meets the wall here
TABLE_PATCH = (0, 1150, 250, 1300)                   # text-free table beside the small type, 30 px clear of the bar

def lab(rgb):
    c = np.asarray(rgb, np.float32) / 255; c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    X = c @ np.array([0.4124, 0.3576, 0.1805], np.float32); Y = c @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    Z = c @ np.array([0.0193, 0.1192, 0.9505], np.float32)
    f = lambda t: np.where(t > 0.008856, np.cbrt(t), 7.787 * t + 16 / 116)
    fx, fy, fz = f(X / 0.95047), f(Y), f(Z / 1.08883)
    return np.stack([116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)], -1)

def in_box(shape, b): m = np.zeros(shape, bool); m[b[1]:b[3], b[0]:b[2]] = True; return m

def runs(img, known, edge):
    """Each unknown run of each row as a straight line between the known pixels at its two ends (the median of `edge`
    pixels each side); also how much to trust it: 1 / length², a quarter of that if one end is the picture's edge."""
    out, trust = img.copy(), np.zeros(known.shape, np.float32); H, W = known.shape
    for y in range(H):
        k = known[y]
        if not k.any(): continue
        x = 0
        while x < W:
            if k[x]: x += 1; continue
            x1 = x
            while x1 < W and not k[x1]: x1 += 1
            left = img[y, max(0, x - edge):x][k[max(0, x - edge):x]] if x > 0 else None
            right = img[y, x1:x1 + edge][k[x1:x1 + edge]] if x1 < W else None
            a = np.median(left, 0) if left is not None and len(left) else None
            b = np.median(right, 0) if right is not None and len(right) else None
            one_sided = a is None or b is None; a, b = (b if a is None else a), (a if b is None else b)
            t = ((np.arange(x, x1) - x + 0.5) / (x1 - x))[:, None]; out[y, x:x1] = a * (1 - t) + b * t
            trust[y, x:x1] = (0.25 if one_sided else 1) / (x1 - x) ** 2; x = x1
    return out, trust

def fill(img, known, edge=6):
    """The backdrop under a gap: estimated along its row and down its column, each trusted by how short its gap is
    (across a letter the row wins; across a line of small type the column wins, and keeps a shadow's fade). Rows with
    nothing known (the bar at the bottom) take the average of the known rows just above."""
    (h, th), (v, tv) = runs(img, known, edge), runs(img.transpose(1, 0, 2), known.T, edge)
    v, tv = v.transpose(1, 0, 2), tv.T; w = th + tv
    h, v = nd.gaussian_filter(h, (3, 0, 0)), nd.gaussian_filter(v, (0, 6, 0))   # neighbouring runs agree: no streaks
    out = np.where((w > 0)[..., None], (h * th[..., None] + v * tv[..., None]) / np.maximum(w, 1e-12)[..., None], img)
    filled = ~known
    empty = np.nonzero(~known.any(1))[0]
    if len(empty):                                    # rows with nothing known: the average of the 30 known rows above
        above = slice(max(0, empty[0] - 30), empty[0]); m = known[above][..., None]
        row = nd.gaussian_filter1d((out[above] * m).sum(0) / np.maximum(m.sum(0), 1), 8, axis=0); out[empty] = row
    smooth = nd.gaussian_filter(out, (4, 1, 0)); return np.where(filled[..., None], smooth, img)

def unmix(p, core, grow, bg, backdrop):
    """Take a coloured overlay out of p. Where it lies on the backdrop, its whole area (and a ring for the webp's colour
    smear) becomes backdrop. Where it touches the product, each pixel is unmixed: p = α·C + (1 − α)·F, C the overlay's
    own shade at the nearest pixel deep inside it, F the nearest pixel outside; a pixel that isn't such a mix keeps α = 0."""
    region, inside = nd.binary_dilation(core, iterations=grow), nd.binary_erosion(core, iterations=1)
    inside = inside if inside.sum() > 50 else core
    _, (cy, cx) = nd.distance_transform_edt(~inside, return_indices=True); C = p[cy, cx]
    _, (fy, fx) = nd.distance_transform_edt(region, return_indices=True); F, on_backdrop = p[fy, fx], backdrop[fy, fx]
    d = C - F; alpha = np.clip(((p - F) * d).sum(-1) / np.maximum((d * d).sum(-1), 1e-3), 0, 1)
    off = np.linalg.norm(p - (alpha[..., None] * C + (1 - alpha[..., None]) * F), axis=-1)
    near = nd.binary_dilation(core, iterations=2)                              # its own edge is 2 px; the rest is ring
    cover = np.where(inside, 1.0, np.where(on_backdrop | (off < 40), alpha, 0.0)) * near       # the overlay's own edge
    shade = (p.mean(-1) < bg.mean(-1) - 4) & (cover < 0.05)                   # darker than the backdrop, not the overlay: shadow
    paint = on_backdrop & region & ~shade
    taken = np.where(inside | paint, 1.0, cover) * region                                       # what is taken out
    out = np.where(paint[..., None], bg, p + taken[..., None] * (bg - C))
    return out, cover.astype(np.float32), np.median(p[inside], 0), (paint | inside).astype(np.float32)

def product(rgb, bg, close=6):
    """The product: unlike the backdrop in colour, or lighter than it (the paper). A shadow is darker backdrop of the
    same colour, so it stays with the table. Solid inside (holes filled), the largest piece only."""
    L, Lb = lab(rgb), lab(bg); dC = np.hypot(L[..., 1] - Lb[..., 1], L[..., 2] - Lb[..., 2]); dL = L[..., 0] - Lb[..., 0]
    m = nd.binary_fill_holes(nd.binary_closing((dC > 8) | (dL > 6), iterations=close)); lab_, n = nd.label(m)
    return lab_ == (np.argmax(nd.sum(m, lab_, range(1, n + 1))) + 1), np.hypot(dC, np.maximum(dL, 0))

def texture_like(ref, known, seed, scales=((0, 1.2, 0.6), (1.2, 5, 2.5))):
    """Noise with the backdrop's own texture, so filled parts don't look flatter than the rest: for each band (fine
    grain, and the stone's mottling) its local strength is measured on the backdrop well away from any gap (`ref` has
    the gaps already filled, so no letter edge leaks into the measure) and spread over the gaps."""
    rng, lum, out, sds = np.random.default_rng(seed), ref.mean(-1), 0, []
    known = nd.binary_erosion(known, iterations=10); w = np.maximum(nd.gaussian_filter(known.astype(np.float32), 30), 1e-3)
    for lo, hi, size in scales:
        band = (nd.gaussian_filter(lum, lo) if lo else lum) - nd.gaussian_filter(lum, hi)
        sd = np.sqrt(nd.gaussian_filter(band ** 2 * known, 30) / w); sds.append(float(np.median(sd[known])))
        n = nd.gaussian_filter(rng.normal(0, 1, lum.shape).astype(np.float32), size); out = out + n / n.std() * sd
    return out[..., None], sds

def layers():
    src = np.asarray(Image.open(POSTER).convert('RGB')).astype(np.float32); H, W = src.shape[:2]; L = lab(src)
    chroma = np.hypot(L[..., 1], L[..., 2])
    # the headline's red has green ≈ blue (184, 31, 32); a fry's brown shadow has far more green than blue
    R_, G_, B_ = src[..., 0], src[..., 1], src[..., 2]
    red = in_box((H, W), HEAD) & (R_ > 130) & (G_ < 95) & (np.abs(G_ - B_) < 25) & (R_ - G_ > 90)
    dark = np.zeros((H, W), bool)                  # the small type is olive (66, 71, 33): a shadow is beige, not green
    for b in SMALL.values(): dark |= in_box((H, W), b) & (src.mean(-1) < 130) & (G_ - B_ > 15) & (G_ - R_ > -12)   # olive, not brown
    bar = np.zeros((H, W), bool); bar[BAR_TOP:] = True
    text_any = nd.binary_dilation(red, iterations=4) | nd.binary_dilation(dark, iterations=8) | nd.binary_dilation(bar, iterations=2)
    # backdrop model, first without the product (rough: light, low-chroma pixels), then the product cut out from it
    bg0 = fill(src, ~text_any & (chroma < 22) & (L[..., 0] > 55))
    prod0, _ = product(np.where(text_any[..., None], bg0, src), bg0)
    known = ~text_any & ~nd.binary_dilation(prod0, iterations=6); bg_plate = fill(src, known)    # under the product
    bg = fill(src, ~text_any & ~nd.binary_dilation(prod0, iterations=1))     # under the text: reads right up to the product
    # the text taken out: the red headline, then the small dark type; the bar is replaced by the table
    backdrop = ~nd.binary_dilation(prod0, iterations=2)
    clean, a_red, c_red, t_red = unmix(src, red, 2, bg, backdrop)
    clean, a_dark, c_dark, t_dark = unmix(clean, dark, 6, bg, backdrop)       # 6 px: the small type has a light halo
    clean[bar] = bg[bar]
    g, gs = texture_like(np.where(known[..., None], src, bg), known, 7)
    # the table's stone texture is copied, not invented: the detail of a text-free patch beside the type, mirrored to tile
    lum = src.mean(-1); detail = (lum - nd.gaussian_filter(lum, 6))[TABLE_PATCH[1]:TABLE_PATCH[3], TABLE_PATCH[0]:TABLE_PATCH[2]]
    ys, xs = np.mgrid[0:H, 0:W]; ph, pw = detail.shape
    mirror = lambda v, n: np.where(v % (2 * n) < n, v % (2 * n), 2 * n - 1 - v % (2 * n))
    stone = detail[mirror(ys - TABLE_PATCH[1], ph), mirror(xs, pw)][..., None]
    g = np.where((ys >= TABLE_PATCH[1])[..., None], stone, g); filled = np.clip(t_red + t_dark + bar, 0, 1)[..., None]
    clean = clean + g * filled
    # the product cut out from the clean picture: solid inside, soft at its edge
    hard, diff = product(np.clip(clean, 0, 255), bg_plate, close=4)
    inner, outer = nd.binary_erosion(hard, iterations=2), nd.binary_dilation(hard, iterations=2)
    a_prod = np.where(inner, 1.0, np.where(outer, np.clip((diff - 3) / 9, 0, 1), 0.0)).astype(np.float32)
    # under the product the plate is the backdrop model, wide against the wall (the camera reveals slivers of it there),
    # tight on the table (the product moves with the table at its base, so nothing is revealed and its shadow stays)
    wide = np.arange(H)[:, None] < HORIZON + 150
    under = np.where(wide, nd.binary_dilation(hard, iterations=8), nd.binary_dilation(hard, iterations=1))
    under = np.clip(nd.gaussian_filter(under.astype(np.float32), 1.5), 0, 1)[..., None]
    plate = clean * (1 - under) + (nd.gaussian_filter(bg_plate, (12, 3, 0)) + g) * under     # only slivers of it are ever seen
    LAYERS.mkdir(parents=True, exist_ok=True)
    save = lambda name, rgb, a=None: Image.fromarray(np.dstack([np.clip(rgb, 0, 255), 255 * (np.ones((H, W)) if a is None else a)]).astype(np.uint8), 'RGBA').save(LAYERS / f'{name}.png')
    save('plate', plate); save('clean', clean); save('product', clean, a_prod); save('original', src)
    flat = lambda c: np.broadcast_to(np.asarray(c, np.float32), (H, W, 3))
    rows = np.arange(H)[:, None]
    head1, head2 = a_red * (rows < HEAD_SPLIT), a_red * (rows >= HEAD_SPLIT)
    save('text_its', flat(c_red), head1)
    cols = np.nonzero((head2 > 0.5).sum(0) > 0)[0]; gaps = np.nonzero(np.diff(cols) > 1)[0]   # the letters of "BACK."
    cuts = [0] + [int((cols[i] + cols[i + 1]) // 2) for i in gaps] + [W]                     # midway between letters
    spans = list(zip(cuts[:-1], cuts[1:]))
    for i, (x0, x1) in enumerate(spans): m = np.zeros_like(head2); m[:, x0:x1] = head2[:, x0:x1]; save(f'text_back{i}', flat(c_red), m)
    for name, b in SMALL.items(): save(f'text_{name}', flat(c_dark), a_dark * in_box((H, W), b))
    save('text_bar', src, bar.astype(np.float32))
    ys, xs = np.nonzero(hard)
    info = {'size': [W, H], 'red': c_red.round(1).tolist(), 'dark': c_dark.round(1).tolist(), 'texture_sd': [round(s, 2) for s in gs],
            'product_box': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())],
            'product_centre': [round(float(xs.mean()), 1), round(float(ys.mean()), 1)], 'back_letters': len(spans)}
    (LAYERS / 'layers.json').write_text(json.dumps(info, indent=1))
    # one sheet to check by eye: the clean picture, the cut-out on grey, the plate
    pics = [Image.fromarray(np.clip(clean, 0, 255).astype(np.uint8)),
            Image.fromarray((np.clip(clean, 0, 255) * a_prod[..., None] + 90 * (1 - a_prod[..., None])).astype(np.uint8)),
            Image.fromarray(np.clip(plate, 0, 255).astype(np.uint8))]
    sheet = Image.new('RGB', (3 * 380, 476), 'white')
    for i, p in enumerate(pics): sheet.paste(p.resize((374, 467)), (i * 380, 4))
    sheet.save(LAYERS / 'sheet.png')
    print(f"layers → out/layers/ ({len(spans)} letters in the second line; red {info['red']}, dark {info['dark']}, texture sd {gs[0]:.2f} fine, {gs[1]:.2f} mottle); "
          f"product box {info['product_box']}")

# --- the motion ---------------------------------------------------------------------------------------------------
FPS, SECONDS, OUT_W, OUT_H = 30, 10.0, 1080, 1350
Z_WALL, Z_NEAR = 1.8, 0.85                        # the wall is far, the table's bottom row near
CAM_T, K0, O0 = 5.6, 0.13, (-20.0, 28.0)          # the pull-back: 13 % closer and offset at the start, the poster at the end

def smoother(x): x = min(1.0, max(0.0, x)); return x * x * x * (x * (6 * x - 15) + 10)
def ease_out(x): x = min(1.0, max(0.0, x)); return 1 - (1 - x) ** 3
def back_out(x, s=1.6): x = min(1.0, max(0.0, x)) - 1; return 1 + x * x * ((s + 1) * x + s)
def depth(y): return np.where(y < HORIZON, Z_WALL, Z_WALL + (Z_NEAR - Z_WALL) * (y - HORIZON) / (1402 - HORIZON))

def rgba(name): a = np.asarray(Image.open(LAYERS / f'{name}.png')).astype(np.float32) / 255; return a[..., :3] * 255, a[..., 3:]

def video():
    info = json.loads((LAYERS / 'layers.json').read_text()); W, H = info['size']; cx, cy = info['product_centre']
    plate, _ = rgba('plate'); prod = Image.open(LAYERS / 'product.png'); orig, _ = rgba('original')
    zk = float(depth(np.array(info['product_box'][3]))); ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    texts = {n: Image.open(LAYERS / f'text_{n}.png') for n in ['its', *[f'back{i}' for i in range(info['back_letters'])], 'logo', 'badge', 'line1', 'line2', 'bar']}
    boxes = {n: im.getchannel('A').getbbox() for n, im in texts.items()}
    rng = np.random.default_rng(3)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{OUT_W}x{OUT_H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(OUT / 'poster_motion.mp4')],
                           stdin=subprocess.PIPE)
    def place(img, s, ox, oy, about=(cx, cy)):          # scale s about a point, then move: the layer as the camera sees it
        a, (px, py) = 1 / s, about
        return img.transform((W, H), Image.AFFINE, (a, 0, px - a * (px + ox), 0, a, py - a * (py + oy)), Image.BICUBIC)
    def over(frame, im, alpha=1.0, wipe=None):
        a = np.asarray(im).astype(np.float32) / 255; m = a[..., 3:] * alpha
        if wipe is not None: m = m * np.clip((ys - wipe)[..., None] / 10 + 0.5, 0, 1)    # shown below the rising edge only
        return frame * (1 - m) + a[..., :3] * 255 * m
    sheet, n = [], int(FPS * SECONDS)
    for f in range(n):
        t = f / FPS; k = 1 - smoother(t / CAM_T); K, ox, oy = K0 * k, O0[0] * k, O0[1] * k
        # the plate: each row at its own depth (far rows move less), sampled where that row's camera puts it
        r = zk / depth(ys); s = 1 + K * r
        sx, sy = cx + (xs - cx - ox * r) / s, cy + (ys - cy - oy * r) / s
        frame = np.stack([nd.map_coordinates(plate[..., c], [sy, sx], order=1, mode='nearest') for c in range(3)], -1)
        # the text behind the product, then the product, then the text in front: all at the product's depth
        S = 1 + K
        frame = over(frame, place(texts['its'], S, ox, oy - 50 * (1 - back_out((t - 5.5) / 0.6))), alpha=min(1, max(0, (t - 5.5) / 0.2)))
        for i in range(info['back_letters']):
            x = (t - 5.9 - 0.07 * i) / 0.32
            if x > 0: b = boxes[f'back{i}']; frame = over(frame, place(texts[f'back{i}'], S, ox, oy), wipe=b[3] - (b[3] - b[1] + 20) * ease_out(x))
        frame = over(frame, place(prod, S, ox, oy))
        def fade_up(name, t0, dur, rise):
            x = (t - t0) / dur
            return over(frame, place(texts[name], S, ox, oy + rise * (1 - ease_out(x))), alpha=min(1, max(0, x * 1.4))) if x > 0 else frame
        frame = fade_up('logo', 6.7, 0.5, 12)
        if t > 6.85:
            b = boxes['badge']; x = ease_out((t - 6.85) / 0.45); sc = (0.9 + 0.1 * back_out((t - 6.85) / 0.45)) * S
            frame = over(frame, place(texts['badge'], sc, ox, oy, about=((b[0] + b[2]) / 2, (b[1] + b[3]) / 2)), alpha=x)
        frame = fade_up('line1', 7.2, 0.55, 16); frame = fade_up('line2', 7.4, 0.55, 16)
        if t > 7.9: frame = over(frame, place(texts['bar'], S, ox, oy + 80 * (1 - ease_out((t - 7.9) / 0.5))))
        x = min(1, max(0, (t - 8.6) / 0.3)); frame = frame * (1 - x) + orig * x if x > 0 else frame    # ends on the poster itself
        im = Image.fromarray(np.clip(frame, 0, 255).astype(np.uint8))
        punch = 0.018 * np.sin(np.pi * min(1, max(0, (t - 6.45) / 0.35)))                          # a beat when the full stop lands
        if punch > 0: im = place(im.convert('RGBA'), 1 + punch, 0, 0).convert('RGB')
        blur = 5 * (1 - ease_out(t / 0.8))                                                          # the lens finds focus
        if blur > 0.05: im = im.filter(ImageFilter.GaussianBlur(blur))
        im = im.resize((OUT_W, OUT_H), Image.LANCZOS)
        g = nd.gaussian_filter(rng.normal(0, 1.6, (OUT_H, OUT_W)).astype(np.float32), 0.5) * 1.6   # fine grain, every frame new
        out = np.clip(np.asarray(im).astype(np.float32) + g[..., None], 0, 255).astype(np.uint8)
        enc.stdin.write(out.tobytes())
        if f % 30 == 0 or f == n - 1: sheet.append((t, Image.fromarray(out)))
    enc.stdin.close(); enc.wait()
    tiles = Image.new('RGB', (6 * 216, 2 * 290), 'white'); d = ImageDraw.Draw(tiles)
    for i, (t, im) in enumerate(sheet[:12]): tiles.paste(im.resize((212, 265)), ((i % 6) * 216, (i // 6) * 290)); d.text(((i % 6) * 216 + 4, (i // 6) * 290 + 268), f'{t:.1f} s', fill='black')
    tiles.save(OUT / 'contact.png')
    print(f'{n} frames → out/poster_motion.mp4 ({OUT_W}×{OUT_H}, {FPS} fps, {SECONDS:g} s) and out/contact.png')

if __name__ == '__main__':
    {'layers': layers, 'video': video}.get(sys.argv[1] if len(sys.argv) > 1 else '', lambda: sys.exit(__doc__))()
