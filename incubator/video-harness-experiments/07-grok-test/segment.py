"""Outlines the main object in every frame of a clip with a background-removal model (rembg, isnet-general-use),
for the checker's overlap reading.   <venv with rembg>/bin/python -I segment.py clips/NAME.mp4  → report/NAME_seg/000.png …
Runs in its own environment (rembg and onnxruntime aren't needed by anything else)."""
import subprocess, sys, json
from pathlib import Path
import numpy as np
from PIL import Image
from rembg import new_session, remove

clip = Path(sys.argv[1]); out = Path(__file__).resolve().parent / 'report' / f'{clip.stem}_seg'; out.mkdir(parents=True, exist_ok=True)
info = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', str(clip)], capture_output=True, text=True, check=True).stdout)['streams'][0]
W, H = info['width'], info['height']
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(clip), '-map', '0:v:0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
session = new_session('isnet-general-use')
for n, f in enumerate(frames):
    remove(Image.fromarray(f), session=session, only_mask=True).save(out / f'{n:03d}.png')
print(f'{len(frames)} masks → {out}')
