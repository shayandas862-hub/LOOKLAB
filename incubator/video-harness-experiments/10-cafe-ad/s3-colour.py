"""S3's colour check (PLAN.md §11, 2026-10-18): does each ingredient keep its colour, where the code puts it?
Per frame and per ingredient (src/passes.js FOODS: the two açaí layers, the granola band, the five topping rows):
  colour in the take = median CIELAB inside the code's mask of that ingredient at that moment, shrunk by 4 px;
  colour in the look = the same inside frame 0's masks on the hero still, after the still is lined up with the previs;
  drift = CIEDE2000 between the two. An ingredient in the wrong place reads as drift too: exact = right colour, right place.
Backdrop inside the food: per frame, the share of pixels inside the food masks (never the glass) that are within ΔE00 12
of the backdrop's colour in the look and nearer to it than to that ingredient's own colour.
Frames are matched by the turn, not the clock: a take's start a and speed b (take time = a + b × previs time) are fitted
to the previs first (chroma layout of the bowl), and the clock's own match is reported beside it.
numpy and Pillow only (ffmpeg reads the clips), in the checker's environment:
  python -I s3-colour.py prove                                     self-tests on the previs; no still or clip needed
  python -I s3-colour.py still IMG                                 line the still up; writes a sheet to check by eye
  python -I s3-colour.py clip CLIP.mp4 --still IMG [--shift P] [--recolour FOOD]
Prints a few lines; the numbers go to out/report/colour_<name>.json."""
import json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
PASSES, REPORT = HERE / 'out' / 'passes' / 's3', HERE / 'out' / 'report'
W, H, N, FPS = 720, 1280, 108, 24
FOODS = ['acai-low', 'granola-band', 'acai-high', 'banana', 'strawberry', 'granola-top', 'blueberry', 'kiwi']
SHRINK, MIN_PX, LEAK_DE = 4, 200, 12

# --- colour science: sRGB -> CIELAB (D65) and CIEDE2000 (Sharma, Wu & Dalal 2005), as in ../07-grok-test/check.py ---
def lab(rgb):
    c = np.asarray(rgb, np.float32) / 255; c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    X = c @ np.array([0.4124, 0.3576, 0.1805], np.float32); Y = c @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    Z = c @ np.array([0.0193, 0.1192, 0.9505], np.float32)
    f = lambda t: np.where(t > 0.008856, np.cbrt(t), 7.787 * t + 16 / 116)
    fx, fy, fz = f(X / 0.95047), f(Y), f(Z / 1.08883)
    return np.stack([116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)], -1)

def de00(l1, l2):
    L1, a1, b1 = np.moveaxis(np.asarray(l1, np.float64), -1, 0); L2, a2, b2 = np.moveaxis(np.asarray(l2, np.float64), -1, 0)
    C7 = ((np.hypot(a1, b1) + np.hypot(a2, b2)) / 2) ** 7; G = 0.5 * (1 - np.sqrt(C7 / (C7 + 25 ** 7)))
    a1p, a2p = a1 * (1 + G), a2 * (1 + G); C1p, C2p = np.hypot(a1p, b1), np.hypot(a2p, b2); zero = C1p * C2p == 0
    h1p = np.where(C1p == 0, 0, np.degrees(np.arctan2(b1, a1p)) % 360); h2p = np.where(C2p == 0, 0, np.degrees(np.arctan2(b2, a2p)) % 360)
    dh = h2p - h1p; dh = np.where(zero, 0, np.where(dh > 180, dh - 360, np.where(dh < -180, dh + 360, dh)))
    dLp, dCp, dHp = L2 - L1, C2p - C1p, 2 * np.sqrt(C1p * C2p) * np.sin(np.radians(dh / 2))
    Lpm, Cpm, hs = (L1 + L2) / 2, (C1p + C2p) / 2, h1p + h2p
    hpm = np.where(zero, hs, np.where(np.abs(h1p - h2p) <= 180, hs / 2, np.where(hs < 360, (hs + 360) / 2, (hs - 360) / 2)))
    T = 1 - 0.17 * np.cos(np.radians(hpm - 30)) + 0.24 * np.cos(np.radians(2 * hpm)) + 0.32 * np.cos(np.radians(3 * hpm + 6)) - 0.20 * np.cos(np.radians(4 * hpm - 63))
    RC = 2 * np.sqrt(Cpm ** 7 / (Cpm ** 7 + 25 ** 7)); RT = -np.sin(np.radians(60 * np.exp(-((hpm - 275) / 25) ** 2))) * RC
    SL = 1 + 0.015 * (Lpm - 50) ** 2 / np.sqrt(20 + (Lpm - 50) ** 2); SC = 1 + 0.045 * Cpm; SH = 1 + 0.015 * Cpm * T
    return np.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH))

for p1, p2, want in [((50, 2.6772, -79.7751), (50, 0, -82.7485), 2.0425), ((50, 3.1571, -77.2803), (50, 0, -82.7485), 2.8615), ((50, 2.8361, -74.02), (50, 0, -82.7485), 3.4412)]:
    assert abs(float(de00(p1, p2)) - want) < 1e-4, 'CIEDE2000 does not match Sharma et al.'

# --- the code's truth: masks, shrunk so a colour is read away from edges and the glass's bend ---
def shrink(m, e=SHRINK):
    s = np.pad(np.pad(m, e).astype(np.int32).cumsum(0).cumsum(1), ((1, 0), (1, 0))); w = 2 * e + 1
    return (s[w:, w:] - s[:-w, w:] - s[w:, :-w] + s[:-w, :-w]) == w * w

def mask(name, k): return np.asarray(Image.open(PASSES / f'{name}_{k:03d}.png').convert('L')) > 127
def food_masks(k, band=(0, H)): return {f: shrink(mask(f'mask-{f}', k))[band[0]:band[0] + band[1]] for f in FOODS}
def previs(k): return np.asarray(Image.open(PASSES / f'beauty_{k:03d}.png').convert('RGB'))

# --- frames: a clip of another shape is a centre crop (LTX 704×1152): scaled to 720 wide, compared with that band ---
def probe(clip):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate',
                          '-of', 'csv=p=0', str(clip)], capture_output=True, text=True, check=True).stdout.strip().split(',')
    w, h, (n, d) = int(out[0]), int(out[1]), map(int, out[2].split('/'))
    hc = H if abs(w / h - W / H) < 0.005 else round(W * h / w); return ((H - hc) // 2, hc), n / d

def frames(clip, band, w=W):
    h = round(band[1] * w / W); p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', str(clip), '-vf', f'scale={w}:{h}:flags=area',
                                                      '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    while (b := p.stdout.read(w * h * 3)) and len(b) == w * h * 3: yield np.frombuffer(b, np.uint8).reshape(h, w, 3)
    p.wait()

# --- the turn: chroma layout of the bowl, take frame j against previs frame k; then the best line j = (a + b·k/24)·fps ---
SMALL = 8
def small(rgb): return np.asarray(Image.fromarray(rgb).resize((W // SMALL, rgb.shape[0] // SMALL), Image.BOX))
def layout(rgb, region):
    ab = lab(rgb)[..., 1:][region]; ab = (ab - ab.mean(0)) / (ab.std(0) + 1e-6); return ab.ravel() / np.sqrt(ab.size)

def fit_turn(take_small, fps, band=(0, H)):
    rows = slice(band[0] // SMALL, (band[0] + band[1]) // SMALL)
    region = [np.asarray(Image.fromarray(((mask('mask-bowl', k) | mask('mask-tops', k)) * 255).astype(np.uint8))
                         .resize((W // SMALL, H // SMALL), Image.BOX))[rows][:len(take_small[0])] > 127 for k in range(N)]
    P = [layout(small(previs(k))[rows][:len(take_small[0])], region[k]) for k in range(N)]
    C = np.array([[layout(f[:len(region[k])], region[k]) @ P[k] for k in range(N)] for f in take_small])
    def score(a, b):
        j = np.round((a + b * np.arange(N) / FPS) * fps).astype(int); ok = (j >= 0) & (j < len(C))
        return (C[j[ok], np.arange(N)[ok]].mean(), j) if ok.mean() >= 0.9 else (-1, j)
    best = max(((score(a, b)[0], a, b) for a in np.arange(-0.5, 0.501, 0.01) for b in np.arange(0.8, 1.2501, 0.005)))
    s, a, b = best; return {'a': round(float(a), 3), 'b': round(float(b), 3), 'score': round(float(s), 3),
                            'clock_score': round(float(score(0, 1)[0]), 3), 'fps': fps}, np.clip(score(a, b)[1], 0, len(C) - 1)

# --- the still: scale about the centre, then shift, found by phase correlation of edges; checked on a moved previs ---
def edges(rgb):
    L = lab(rgb)[..., 0]; gy, gx = np.gradient(L); g = np.hypot(gx, gy); return (g - g.mean()) * np.outer(np.hanning(g.shape[0]), np.hanning(g.shape[1]))
def scaled(img, s):
    big = img.resize((round(W * s), round(H * s)), Image.LANCZOS); x0, y0 = (big.width - W) // 2, (big.height - H) // 2
    return big.crop((x0, y0, x0 + W, y0 + H))
def phase(a, b):
    R = np.fft.fft2(a) * np.conj(np.fft.fft2(b)); r = np.real(np.fft.ifft2(R / (np.abs(R) + 1e-9)))
    y, x = np.unravel_index(r.argmax(), r.shape); h, w = r.shape
    return float(r.max()), (y - h if y > h // 2 else y), (x - w if x > w // 2 else x)

def align(img, ref):
    img = img.convert('RGB').resize((W, H), Image.LANCZOS); E = edges(ref)
    best = max((phase(E, edges(np.asarray(scaled(img, s))))[0], s) for s in np.arange(0.90, 1.1001, 0.01))
    peak, dy, dx = phase(E, edges(np.asarray(scaled(img, best[1]))))
    out = Image.new('RGB', (W, H)); out.paste(scaled(img, best[1]), (dx, dy))
    return np.asarray(out), {'scale': round(float(best[1]), 3), 'dx': int(dx), 'dy': int(dy), 'peak': round(peak, 4)}

def look(rgb):
    L, m = lab(rgb), food_masks(0)
    out = {f: np.median(L[m[f]], 0).round(2).tolist() for f in FOODS if m[f].sum() >= MIN_PX}
    near = np.zeros((H, W), bool)
    for part in ('mask-bowl', 'mask-tops', 'mask-plinth'): near |= ~shrink(~mask(part, 0), 24)
    out['backdrop'] = np.median(L[:H // 2][~near[:H // 2]], 0).round(2).tolist(); return out

# --- one measurement: every previs moment k, against the look ---
def measure(name, get, mapping, ref, band=(0, H), shift=0, recolour=None, extra=None):
    REPORT.mkdir(parents=True, exist_ok=True); rows = []
    for k in range(N):
        rgb = get(int(mapping[k])); m = food_masks(k, band)
        if shift:
            dx, dy = round(W * shift / 100), round(rgb.shape[0] * shift / 100)
            rgb = np.pad(rgb, ((dy, 0), (dx, 0), (0, 0)), mode='edge')[:rgb.shape[0], :rgb.shape[1]]
        L = lab(rgb)
        if recolour: L[mask(f'mask-{recolour}', k)[band[0]:band[0] + band[1]], 1:] = ref['banana'][1:]
        row, inside, leak = {'k': k, 'j': int(mapping[k])}, 0, 0
        for f in FOODS:
            if m[f].sum() < MIN_PX or f not in ref: continue
            px = L[m[f]]; row[f] = round(float(de00(np.median(px, 0), ref[f])), 2)
            d_bg = de00(px, ref['backdrop']); leak += int(((d_bg < LEAK_DE) & (d_bg < de00(px, ref[f]))).sum()); inside += len(px)
        row['leak'] = round(100 * leak / max(1, inside), 2); rows.append(row)
    per = {f: [r[f] for r in rows if f in r] for f in FOODS}
    foods = {f: {'median': round(float(np.median(v)), 2), 'worst_tenth': round(float(np.percentile(v, 90)), 2), 'frames': len(v)} for f, v in per.items() if v}
    leaks = np.array([r['leak'] for r in rows]); worst = max(foods, key=lambda f: foods[f]['worst_tenth'])
    s = {'name': name, 'drift_median': round(float(np.median([v['median'] for v in foods.values()])), 2), 'worst_food': worst,
         'worst_food_tenth': foods[worst]['worst_tenth'], 'leak_median': round(float(np.median(leaks)), 2), 'leak_max': round(float(leaks.max()), 2),
         'shift_percent': shift, 'recolour': recolour, 'foods': foods, **(extra or {}), 'look': ref, 'rows': rows}
    (REPORT / f'colour_{name}.json').write_text(json.dumps(s, indent=1))
    print(f"{name}: drift ΔE00 median {s['drift_median']}, worst {worst} {s['worst_food_tenth']} (worst tenth); "
          f"backdrop in the food median {s['leak_median']} %, max {s['leak_max']} %")
    return s

def arg(args, flag, default=None): return args[args.index(flag) + 1] if flag in args else default

if __name__ == '__main__':
    mode, args = (sys.argv[1], sys.argv[2:]) if len(sys.argv) > 1 else ('', [])
    if mode == 'prove':
        ident = np.arange(N); ref = look(previs(0)); proof = {}
        cases = [('previs', 0, None), ('previs_shift2', 2, None), ('previs_shift5', 5, None), ('previs_kiwi_as_banana', 0, 'kiwi')]
        for name, sh, rc in cases: proof[name] = measure(f'prove_{name}', previs, ident, ref, shift=sh, recolour=rc)
        smalls = [small(previs(k)) for k in range(N)]
        same, _ = fit_turn(smalls, FPS); slow, _ = fit_turn([smalls[min(N - 1, round(j * 0.9))] for j in range(120)], FPS)
        moved = Image.fromarray(previs(0)); moved = scaled(moved, 1.04); shifted = Image.new('RGB', (W, H)); shifted.paste(moved, (12, -30))
        _, found = align(shifted, previs(0))
        checks = {'shift raises drift (0 < 2 < 5 %)': proof['previs']['drift_median'] < proof['previs_shift2']['drift_median'] < proof['previs_shift5']['drift_median'],
                  'shift raises backdrop share (0 < 2 < 5 %)': proof['previs']['leak_median'] < proof['previs_shift2']['leak_median'] < proof['previs_shift5']['leak_median'],
                  'kiwi recoloured: kiwi rises ≥ 10, others unchanged': proof['previs_kiwi_as_banana']['foods']['kiwi']['median'] - proof['previs']['foods']['kiwi']['median'] >= 10
                  and all(abs(proof['previs_kiwi_as_banana']['foods'][f]['median'] - proof['previs']['foods'][f]['median']) < 0.01 for f in FOODS if f != 'kiwi'),
                  'turn: the previs fits itself (a = 0, b = 1)': abs(same['a']) <= 0.02 and abs(same['b'] - 1) <= 0.01,
                  'turn: a 5.0 s copy is found (b ≈ 1.111)': abs(slow['b'] - 1 / 0.9) <= 0.02 and abs(slow['a']) <= 0.05,
                  'still: a moved previs is put back (scale 1/1.04, shift undone ±3 px)': abs(found['scale'] - round(1 / 1.04, 2)) <= 0.011
                  and abs(found['dx'] + 12) <= 3 and abs(found['dy'] - 30) <= 3}
        (REPORT / 'colour_prove.json').write_text(json.dumps({'checks': checks, 'turn_same': same, 'turn_slow': slow, 'align': found}, indent=1))
        for c, ok in checks.items(): print(f"{'pass' if ok else 'FAIL'} · {c}")
        print(f"turn: same {same}, 5.0 s copy {slow}; still: {found}")
        if not all(checks.values()): sys.exit('the check is blind to at least one of these: it must not judge any take')
    elif mode == 'still':
        img, found = align(Image.open(args[0]), previs(0)); sheet = Image.fromarray(img.copy()); d = ImageDraw.Draw(sheet)
        for f in FOODS:
            m = mask(f'mask-{f}', 0); edge = m & ~shrink(m, 1); ys, xs = np.nonzero(edge); d.point(list(zip(xs.tolist(), ys.tolist())), fill=(0, 255, 255))
        REPORT.mkdir(parents=True, exist_ok=True); sheet.save(REPORT / f'colour_still_{Path(args[0]).stem}.png')
        print(f"{Path(args[0]).name}: lined up with scale {found['scale']}, shift {found['dx']}, {found['dy']} px (peak {found['peak']}) "
              f"→ out/report/colour_still_{Path(args[0]).stem}.png (check the outlines by eye)")
    elif mode == 'clip':
        clip, still = Path(args[0]), arg(args, '--still'); shift, rc = float(arg(args, '--shift', 0)), arg(args, '--recolour')
        if not still: sys.exit('clip needs --still IMG (the look)')
        img, found = align(Image.open(still), previs(0)); ref = look(img)
        band, fps = probe(clip); turn, mapping = fit_turn([small(f) for f in frames(clip, band, W)], fps, band)
        want = {int(j) for j in mapping}; kept = {j: f for j, f in enumerate(frames(clip, band)) if j in want}
        name = clip.stem + (f'_shift{shift:g}' if shift else '') + (f'_{rc}_as_banana' if rc else '')
        print(f"{clip.name}: turn fitted a {turn['a']:+} s, b {turn['b']} (match {turn['score']}; by the clock {turn['clock_score']}); still {found}")
        measure(name, kept.__getitem__, mapping, ref, band, shift, rc, {'turn': turn, 'still_alignment': found, 'still': Path(still).name})
    else: sys.exit(__doc__)
