"""Why Test 1b's runner overlap slipped in the orbit (a diagnosis written after the result; it re-scores nothing).
    <python with rembg> -I diagnose.py      → per frame of the orbit: how much the outline adds beyond the code's runner,
    how much of that lies near the body (within 12 px) or away from it, and how much of the body it misses."""
import subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image
from rembg import new_session, remove
T = Path(__file__).resolve().parent; W, H = 1280, 720; s = new_session('isnet-general-use')
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(T / 'out/C_seed11.mp4'), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
for i in range(100, 184, 6):
    code = np.asarray(Image.open(T / f'ref/runner_{i:03d}.png').convert('L').resize((W, H))) > 127
    ys, xs = np.nonzero(code); pad = 0.5 * max(xs.max() - xs.min(), ys.max() - ys.min())
    x0, x1 = max(0, int(xs.min() - pad)), min(W, int(xs.max() + pad) + 1); y0, y1 = max(0, int(ys.min() - pad)), min(H, int(ys.max() + pad) + 1)
    seg = np.asarray(remove(Image.fromarray(np.ascontiguousarray(fr[i, y0:y1, x0:x1])), session=s, only_mask=True)) > 127; c = code[y0:y1, x0:x1]
    d = c.copy()
    for _ in range(12): d = d | np.roll(d, 1, 0) | np.roll(d, -1, 0) | np.roll(d, 1, 1) | np.roll(d, -1, 1)
    extra = seg & ~c; near, far = (extra & d).sum(), (extra & ~d).sum()
    print(f'{i}: extra = {extra.sum() / c.sum():.2f} of the runner; near the body {near / max(1, extra.sum()):.0%}, away from it {far / max(1, extra.sum()):.0%}; body missed {(c & ~seg).sum() / c.sum():.2f}')
