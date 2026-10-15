"""Checks a generated clip against the code shot it was made from, by the pass marks in README.md.

    python3 -I check.py clips/S3_take1.mp4 [kit/S3_shoe.png kit/S3_shoe_end.png ref/]

Reads the clip with ffmpeg, finds where its frame sits inside our 1920x1080 frame (generators may crop or change the
aspect), then measures: likeness of its first and last frames to ours, the orange stripe's colour (CIEDE2000) inside
the code's own stripe mask for every frame, flicker, and the shoe's overlap with where the code puts it.
Writes report/<clip>.json, report/<clip>_compare.mp4 (code | clip) and report/<clip>_stripe.png (ΔE00 by frame).
"""
import json, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
clip = Path(sys.argv[1])
start, end = Path(sys.argv[2] if len(sys.argv) > 2 else HERE / 'kit/S3_shoe.png'), Path(sys.argv[3] if len(sys.argv) > 3 else HERE / 'kit/S3_shoe_end.png')
ref = Path(sys.argv[4] if len(sys.argv) > 4 else HERE / 'ref')
name = clip.stem
SEG = HERE / 'report' / f'{name}_seg'
(HERE / 'report').mkdir(exist_ok=True)

def probe(p):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,nb_frames', '-show_entries', 'format=duration', '-of', 'json', str(p)], capture_output=True, text=True, check=True)
    j = json.loads(out.stdout); s = j['streams'][0]; num, den = map(int, s['r_frame_rate'].split('/'))
    return s['width'], s['height'], num / den, float(j['format']['duration'])

W, H, FPS, DUR = probe(clip)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(clip), '-map', '0:v:0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.float32) / 255
N = len(frames)

# --- colour science: sRGB -> CIELAB (D65), CIEDE2000 (Sharma, Wu & Dalal 2005), checked on their pairs below ---
def lab(rgb):
    c = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
    X = c @ np.array([0.4124, 0.3576, 0.1805]); Y = c @ np.array([0.2126, 0.7152, 0.0722]); Z = c @ np.array([0.0193, 0.1192, 0.9505])
    f = lambda t: np.where(t > 0.008856, np.cbrt(t), 7.787 * t + 16 / 116)
    fx, fy, fz = f(X / 0.95047), f(Y), f(Z / 1.08883)
    return np.stack([116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)], -1)

def de00(l1, l2):
    L1, a1, b1 = l1; L2, a2, b2 = l2
    C1, C2 = math.hypot(a1, b1), math.hypot(a2, b2); Cm = (C1 + C2) / 2
    G = 0.5 * (1 - math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)))
    a1p, a2p = a1 * (1 + G), a2 * (1 + G); C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h1p = math.degrees(math.atan2(b1, a1p)) % 360 if C1p else 0; h2p = math.degrees(math.atan2(b2, a2p)) % 360 if C2p else 0
    dLp, dCp = L2 - L1, C2p - C1p
    dhp = 0 if C1p * C2p == 0 else (h2p - h1p if abs(h2p - h1p) <= 180 else h2p - h1p - 360 if h2p - h1p > 180 else h2p - h1p + 360)
    dHp = 2 * math.sqrt(C1p * C2p) * math.sin(math.radians(dhp / 2))
    Lpm, Cpm = (L1 + L2) / 2, (C1p + C2p) / 2
    hpm = h1p + h2p if C1p * C2p == 0 else ((h1p + h2p) / 2 if abs(h1p - h2p) <= 180 else ((h1p + h2p + 360) / 2 if h1p + h2p < 360 else (h1p + h2p - 360) / 2))
    T = 1 - 0.17 * math.cos(math.radians(hpm - 30)) + 0.24 * math.cos(math.radians(2 * hpm)) + 0.32 * math.cos(math.radians(3 * hpm + 6)) - 0.20 * math.cos(math.radians(4 * hpm - 63))
    dth = 30 * math.exp(-((hpm - 275) / 25) ** 2); RC = 2 * math.sqrt(Cpm ** 7 / (Cpm ** 7 + 25 ** 7))
    SL = 1 + 0.015 * (Lpm - 50) ** 2 / math.sqrt(20 + (Lpm - 50) ** 2); SC = 1 + 0.045 * Cpm; SH = 1 + 0.015 * Cpm * T
    RT = -math.sin(math.radians(2 * dth)) * RC
    return math.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH))

for p1, p2, want in [((50, 2.6772, -79.7751), (50, 0, -82.7485), 2.0425), ((50, 3.1571, -77.2803), (50, 0, -82.7485), 2.8615), ((50, 2.8361, -74.02), (50, 0, -82.7485), 3.4412)]:
    assert abs(de00(p1, p2) - want) < 1e-4, 'CIEDE2000 does not match Sharma et al.'

def load(p, mode='RGB'): return np.asarray(Image.open(p).convert(mode), np.float32) / 255
luma = lambda a: a @ np.array([0.2126, 0.7152, 0.0722])

# --- where the clip's frame sits in ours: scale s and offset (x0, y0), clip px = (our px - offset) * s ---
S0 = load(start); Sy = luma(S0); F0y = luma(frames[0])
def crop(img, s, x0, y0, mode=Image.BILINEAR):
    """Our 1920x1080 image -> the clip's frame size, given the mapping."""
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
    return np.asarray(im.transform((W, H), Image.AFFINE, (1 / s, 0, x0, 0, 1 / s, y0), resample=mode), np.float32) / 255
def corr(a, b): a, b = a - a.mean(), b - b.mean(); return float((a * b).sum() / math.sqrt((a * a).sum() * (b * b).sum() + 1e-12))
import os
best = (-2, None)
if os.environ.get('MAP') == 'full': best = (corr(crop(Sy, W / 1920, 0, 0), F0y), (W / 1920, 0.0, 0.0))
# Coarse search on quarter-size images (our 480x270 against the clip at a quarter), then refine at full size.
Sq = np.asarray(Image.fromarray((Sy * 255).astype(np.uint8)).resize((480, 270), Image.BILINEAR), np.float32) / 255
Fq = np.asarray(Image.fromarray((F0y * 255).astype(np.uint8)).resize((W // 4, H // 4), Image.BILINEAR), np.float32) / 255
def crop_q(img, s, x0, y0):
    im = Image.fromarray((img * 255).astype(np.uint8))
    return np.asarray(im.transform((W // 4, H // 4), Image.AFFINE, (1 / s, 0, x0 / 4, 0, 1 / s, y0 / 4), resample=Image.BILINEAR), np.float32) / 255
base = max(W / 1920, H / 1080)
for s in (np.arange(base, base * 1.35, 0.01) if os.environ.get('MAP') != 'full' else []):
    for y0 in np.arange(0, 1080 - H / s + 1, 8):
        for x0 in np.arange(0, 1920 - W / s + 1, 8):
            c = corr(crop_q(Sq, s, x0, y0), Fq)
            if c > best[0]: best = (c, (s, x0, y0))
s, x0, y0 = best[1]
for step in ((4, 1) if os.environ.get('MAP') != 'full' else ()):
    for ds in (-0.006, -0.003, 0, 0.003, 0.006) if step == 4 else (-0.0015, 0, 0.0015):
        for dy in range(-step * 2, step * 2 + 1, step):
            for dx in range(-step * 2, step * 2 + 1, step):
                if not (0 <= y0 + dy and y0 + dy + H / (s + ds) <= 1080 + 1 and 0 <= x0 + dx and x0 + dx + W / (s + ds) <= 1920 + 1): continue
                c = corr(crop(Sy, s + ds, x0 + dx, y0 + dy), F0y)
                if c > best[0]: best = (c, (s + ds, x0 + dx, y0 + dy))
    s, x0, y0 = best[1]
mapping = {'scale': round(s, 4), 'x0': round(x0, 1), 'y0': round(y0, 1), 'covers': [round(x0), round(y0), round(x0 + W / s), round(y0 + H / s)]}

# --- 1: likeness of the first and last frames (brightness, at a quarter of 1920x1080's pixel count) ---
like_first = corr(crop(Sy, s, x0, y0), F0y)
E0 = load(end); like_last = corr(crop(luma(E0), s, x0, y0), luma(frames[-1]))

# --- 2: the stripe's colour inside the code's stripe mask, every frame ---
def stripe_like(rgb):
    mx, mn = rgb.max(-1), rgb.min(-1); sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    hue = (np.degrees(np.arctan2(math.sqrt(3) * (g - b), 2 * r - g - b)) % 360)
    return ((hue < 40) | (hue > 345)) & (sat > 0.35) & (mx > 0.3)
def erode(m):
    e = m.copy(); e[1:] &= m[:-1]; e[:-1] &= m[1:]; e[:, 1:] &= m[:, :-1]; e[:, :-1] &= m[:, 1:]; return e
ref_mask0 = erode(load(ref / 'stripe_000.png', 'L') > 0.5)
ref_col = np.median(lab(S0[ref_mask0 & stripe_like(S0)]), 0)
REF_FPS = 24  # the code's reference frames; clip frame n is matched to the code at the same moment, n / FPS seconds
refn = lambda n: int(round(n / FPS * REF_FPS))
rows = []
for n in range(N):
    r = refn(n); m_file, b_file, sh_file = ref / f'stripe_{r:03d}.png', ref / f'beauty_{r:03d}.png', ref / f'shoe_{r:03d}.png'
    if not m_file.exists(): break
    m = erode(crop(load(m_file, 'L'), s, x0, y0, Image.NEAREST) > 0.5)
    sel = m & stripe_like(frames[n]); cover = float(sel.sum() / max(1, m.sum()))
    row = {'frame': n, 'mask_px': int(m.sum()), 'stripe_px': int(sel.sum()), 'cover': round(cover, 3)}
    if sel.sum() >= 15:
        col = np.median(lab(frames[n][sel]), 0); row['de_start'] = round(de00(ref_col, col), 2)
        B = crop(load(b_file), s, x0, y0); bs = m & stripe_like(B)
        if bs.sum() >= 15: row['de_code_same_frame'] = round(de00(np.median(lab(B[bs]), 0), col), 2)
    # Shoe overlap. With report/<clip>_seg (segment.py: a background-removal model's outline of the main object), the
    # outline minus the code's turntable, against the code's shoe mask. Without it: a rough colour-based reading.
    shoe = crop(load(sh_file, 'L'), s, x0, y0, Image.NEAREST) > 0.5
    seg_file, stage_file = SEG / f'{n:03d}.png', ref / f'stage_{r:03d}.png'
    if seg_file.exists() and stage_file.exists():
        seg = load(seg_file, 'L') > 0.5; stage = crop(load(stage_file, 'L'), s, x0, y0, Image.NEAREST) > 0.5
        for _ in range(4): stage = stage | np.roll(stage, 1, 0) | np.roll(stage, -1, 0) | np.roll(stage, 1, 1) | np.roll(stage, -1, 1)
        obj = seg & ~(stage & ~shoe)
        row['shoe_iou'] = round(float((obj & shoe).sum() / max(1, (obj | shoe).sum())), 3); row['iou_method'] = 'segmentation'
        ys = []  # skip the rough reading
    else: ys, xs = np.nonzero(shoe)
    if len(ys):
        pad = 20; box = np.zeros_like(shoe); box[max(0, ys.min() - pad):ys.max() + pad, max(0, xs.min() - pad):xs.max() + pad] = True
        L = lab(frames[n]); whiteish = (L[..., 0] > 55) & (np.hypot(L[..., 1], L[..., 2]) < 30)
        g = (whiteish | stripe_like(frames[n])) & box
        row['shoe_iou'] = round(float((g & shoe).sum() / max(1, (g | shoe).sum())), 3)
    rows.append(row)

de = np.array([r['de_start'] for r in rows if 'de_start' in r]); dec = np.array([r['de_code_same_frame'] for r in rows if 'de_code_same_frame' in r])
iou = np.array([r['shoe_iou'] for r in rows if 'shoe_iou' in r])

# --- 4: flicker: frame-to-frame brightness, after taking out the slow change a camera move makes ---
mean_l = luma(frames).mean((1, 2)); smooth = np.convolve(np.pad(mean_l, 4, mode='edge'), np.ones(9) / 9, mode='valid')
flick = np.abs(mean_l - smooth) / np.maximum(smooth, 1e-6) * 100

def grade(v, good, ok, higher_is_better=False):
    if higher_is_better: return 'pass' if v >= good else 'usable with work' if v >= ok else 'fail'
    return 'pass' if v <= good else 'usable with work' if v <= ok else 'fail'
result = {
    'clip': str(clip.name), 'file': {'width': W, 'height': H, 'fps': FPS, 'seconds': round(DUR, 3), 'frames': N},
    'mapping_into_our_frame': mapping,
    '1_first_frame_likeness': {'value': round(like_first, 3), 'mark': grade(like_first, 0.90, 0.75, True)},
    '1b_last_frame_likeness': {'value': round(like_last, 3), 'mark': grade(like_last, 0.90, 0.75, True), 'note': 'extra: the last frame was given too'},
    '2_stripe_colour_de00_vs_start': {'median': round(float(np.median(de)), 2), 'worst_tenth': round(float(np.percentile(de, 90)), 2), 'frames_measured': int(len(de)),
                                      'mark': grade(float(np.percentile(de, 90)), 5, 10), 'start_colour_lab': [round(float(v), 1) for v in ref_col]},
    '2b_stripe_colour_de00_vs_code_same_frame': {'median': round(float(np.median(dec)), 2), 'worst_tenth': round(float(np.percentile(dec, 90)), 2), 'note': 'extra: against the code\'s own frame at the same moment'},
    '4_flicker_percent': {'worst': round(float(flick.max()), 2), 'p95': round(float(np.percentile(flick, 95)), 2), 'mark': grade(float(flick.max()), 3, 6)},
    'shoe_overlap_iou': {'median': round(float(np.median(iou)), 3), 'worst_tenth': round(float(np.percentile(iou, 10)), 3), 'lowest': round(float(iou.min()), 3), 'method': 'segmentation (rembg isnet-general-use) minus the code\'s turntable' if SEG.exists() else 'rough: shoe found by colour near where the code puts it'},
    'frames': rows,
}
(HERE / 'report' / f'{name}.json').write_text(json.dumps(result, indent=1))

# --- pictures: the stripe's ΔE00 by frame, and the code beside the clip ---
pw, ph = 900, 300; img = Image.new('RGB', (pw, ph), (18, 18, 20)); d = ImageDraw.Draw(img)
for v, col in ((5, (90, 160, 90)), (10, (170, 140, 60))):
    y = ph - 30 - v / 20 * (ph - 50); d.line((40, y, pw - 10, y), fill=col); d.text((5, y - 6), f'{v}', fill=col)
pts = [(40 + r['frame'] / max(1, N - 1) * (pw - 50), ph - 30 - min(20, r['de_start']) / 20 * (ph - 50)) for r in rows if 'de_start' in r]
if len(pts) > 1: d.line(pts, fill=(255, 140, 60), width=2)
pts = [(40 + r['frame'] / max(1, N - 1) * (pw - 50), ph - 30 - min(20, r['de_code_same_frame']) / 20 * (ph - 50)) for r in rows if 'de_code_same_frame' in r]
if len(pts) > 1: d.line(pts, fill=(120, 180, 255), width=1)
d.text((45, 8), f'{name}: stripe colour ΔE00 by frame (orange: vs the start frame; blue: vs the code at the same moment). Lines at 5 and 10.', fill=(230, 230, 230))
img.save(HERE / 'report' / f'{name}_stripe.png')

enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W * 2 + 8}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', str(HERE / 'report' / f'{name}_compare.mp4')], stdin=subprocess.PIPE)
for n in range(min(N, len(rows))):
    B = crop(load(ref / f'beauty_{refn(n):03d}.png'), s, x0, y0); pair = np.zeros((H, W * 2 + 8, 3), np.float32); pair[:, :W] = B; pair[:, W + 8:] = frames[n]
    enc.stdin.write((np.clip(pair, 0, 1) * 255).astype(np.uint8).tobytes())
enc.stdin.close(); enc.wait()
print(json.dumps({k: v for k, v in result.items() if k != 'frames'}, indent=1))
