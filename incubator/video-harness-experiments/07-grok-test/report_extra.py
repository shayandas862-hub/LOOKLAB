"""Extra readings for a checked clip: how far the code's own stripe colour drifts from its start frame (lighting
changes as the shoe turns), and the clip against the code at the same moment on frames where the stripe sits where
the code puts it (cover >= 0.9).   python3 -I report_extra.py S3_take1"""
import json, math, sys
import numpy as np
from PIL import Image
name = sys.argv[1]
r = json.load(open(f'report/{name}.json'))
src = open('check.py').read(); ns = {'math': math, 'np': np}
exec(src[src.index('def lab(rgb)'):src.index('def load(p')], ns)
lab, de00 = ns['lab'], ns['de00']
def load(p, mode='RGB'): return np.asarray(Image.open(p).convert(mode), np.float32) / 255
def stripe_like(rgb):
    mx, mn = rgb.max(-1), rgb.min(-1); sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    rr, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]; hue = (np.degrees(np.arctan2(math.sqrt(3) * (g - b), 2 * rr - g - b)) % 360)
    return ((hue < 40) | (hue > 345)) & (sat > 0.35) & (mx > 0.3)
def erode(m):
    e = m.copy(); e[1:] &= m[:-1]; e[:-1] &= m[1:]; e[:, 1:] &= m[:, :-1]; e[:, :-1] &= m[:, 1:]; return e
start, drift = None, []
for n in range(len(r['frames'])):
    B = load(f'ref/beauty_{n:03d}.png'); m = erode(load(f'ref/stripe_{n:03d}.png', 'L') > 0.5); col = np.median(lab(B[m & stripe_like(B)]), 0)
    start = col if start is None else start; drift.append(de00(start, col))
sd = np.array(drift); aligned = [f for f in r['frames'] if f['cover'] >= 0.9 and 'de_code_same_frame' in f]; dc = np.array([f['de_code_same_frame'] for f in aligned])
out = {'code_self_drift_median': round(float(np.median(sd)), 2), 'code_self_drift_worst_tenth': round(float(np.percentile(sd, 90)), 2),
       'aligned_frames': len(aligned), 'aligned_frame_list': [f['frame'] for f in aligned],
       'clip_vs_code_aligned_median': round(float(np.median(dc)), 2), 'clip_vs_code_aligned_worst_tenth': round(float(np.percentile(dc, 90)), 2)}
json.dump(out, open(f'report/{name}_extra.json', 'w'), indent=1)
print({k: v for k, v in out.items() if k != 'aligned_frame_list'})
fl = out['aligned_frame_list']; runs = []; a = fl[0]
for p, q in zip(fl, fl[1:] + [None]):
    if q != p + 1: runs.append((a, p)); a = q
print('aligned runs (frames):', runs)
