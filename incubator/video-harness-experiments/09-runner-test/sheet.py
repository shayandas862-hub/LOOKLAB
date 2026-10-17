"""One picture of the code's shot and every Test 1b take, for the by-eye check (does the runner stay one runner).
    <python with Pillow> -I sheet.py      → out/sheet.png: the code on top, then each take; 6 moments each
"""
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent; OUT = HERE / 'out'; REF = HERE / 'ref'
TIMES = [0.0, 3.0, 5.0, 8.0, 11.0, 14.5]; W, H, LABEL = 256, 144, 110

def grab(clip, t):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t}', '-i', str(clip), '-frames:v', '1', '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    return Image.frombytes('RGB', (W, H), raw) if len(raw) == W * H * 3 else Image.new('RGB', (W, H))

rows = [('code', [Image.open(REF / f'clean_{min(240, round(t * 16)):03d}.png').convert('RGB').resize((W, H)) for t in TIMES])]
rows += [(c.stem, [grab(c, t) for t in TIMES]) for c in sorted(OUT.glob('C_seed*.mp4'))]
sheet = Image.new('RGB', (LABEL + W * len(TIMES), 20 + H * len(rows)), 'black'); d = ImageDraw.Draw(sheet)
for j, t in enumerate(TIMES): d.text((LABEL + j * W + 4, 4), f'{t:.1f} s', fill='white')
for i, (name, ims) in enumerate(rows):
    d.text((6, 20 + i * H + H // 2), name, fill='white')
    for j, im in enumerate(ims): sheet.paste(im, (LABEL + j * W, 20 + i * H))
sheet.save(OUT / 'sheet.png'); print(f'{len(rows)} rows → out/sheet.png')
