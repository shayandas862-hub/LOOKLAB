"""One picture of every Test 1 clip beside the code, for the shape-by-eye check (does the shoe stay one shoe).
Shows which clip is which, so make it only after every realism rating is in.

    <python with Pillow> -I sheet.py      → out/sheet.png: the code on top, then A, B, C × 3 seeds; 6 moments each
"""
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent; OUT = HERE / 'out'; REF = HERE.parent / '07-grok-test' / 'ref'
TIMES = [0.0, 1.2, 2.4, 3.6, 4.8, 6.0]; W, H, LABEL = 256, 144, 130
rows = [('code', [Image.open(REF / f'beauty_{min(144, round(t * 24)):03d}.png') for t in TIMES])]
for w in 'ABC':
    for s in (11, 22, 33):
        clip = OUT / f'{w}_seed{s}.mp4'
        if not clip.exists(): rows.append((f'{w}_seed{s} (none)', [])); continue
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(clip), '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
        n = len(raw) // (W * H * 3)  # the clip's frames; each moment is taken at the same share of the clip's length
        frames = [Image.frombytes('RGB', (W, H), raw[i * W * H * 3:(i + 1) * W * H * 3]) for i in (min(n - 1, round(t / 6 * (n - 1))) for t in TIMES)]
        rows.append((f'{w}_seed{s}', frames))
sheet = Image.new('RGB', (LABEL + W * len(TIMES), H * len(rows)), (16, 16, 18)); d = ImageDraw.Draw(sheet)
for r, (label, frames) in enumerate(rows):
    d.text((8, r * H + H // 2 - 6), label, fill=(235, 235, 235))
    for c, f in enumerate(frames): sheet.paste(f.convert('RGB').resize((W, H), Image.LANCZOS), (LABEL + c * W, r * H))
for c, t in enumerate(TIMES): d.text((LABEL + c * W + 6, 4), f'{t:.1f} s', fill=(255, 200, 120))
sheet.save(OUT / 'sheet.png'); print(f'out/sheet.png: {len(rows)} rows × {len(TIMES)} moments')
