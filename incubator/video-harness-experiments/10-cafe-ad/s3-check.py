"""S3's checker (PLAN.md §7): does a picture or a clip keep the bowl where the code puts it?
Per frame: rembg (isnet-general-use) outlines the main object; the code's turntable (mask-plinth) is taken away; only
the outline regions that touch the code's bowl + toppings (mask-bowl ∪ mask-tops) are kept; overlap = intersection
over union with that code shape. Frames are 720×1280 and matched by time at 24 fps (code frame k = 7.5 s + k / 24).
A clip of another shape is a centre crop of the frame (LTX: 704×1152, checked on frame 0 against the still,
2026-10-18): it is scaled to 720 wide and compared with the same centre band of the code's masks.
Runs in the checker's own environment:
  ../07-grok-test/.venv/bin/python -I s3-check.py calibrate          the code's own 108 frames (mark: median ≥ 0.90)
  ../07-grok-test/.venv/bin/python -I s3-check.py still IMG …        each picture against frame 0 (mark ≥ 0.85)
  ../07-grok-test/.venv/bin/python -I s3-check.py clip CLIP.mp4      a take, frame by frame (median ≥ 0.85, worst tenth ≥ 0.75)
  add --model u2net (or birefnet-general-lite) to outline with another rembg model; reports then carry its name
Prints a few lines; the per-frame numbers go to out/report/<name>.json and the outlines to out/report/<name>_seg/."""
import json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
from rembg import new_session, remove

HERE = Path(__file__).resolve().parent
PASSES, REPORT = HERE / 'out' / 'passes' / 's3', HERE / 'out' / 'report'
W, H, N = 720, 1280, 108

def mask(name, k, band=(0, H)): return np.asarray(Image.open(PASSES / f'{name}_{k:03d}.png').convert('L'))[band[0]:band[0] + band[1]] > 127

def overlap(rgb, k, session, band=(0, H)):
    code = mask('mask-bowl', k, band) | mask('mask-tops', k, band)
    obj = np.asarray(remove(Image.fromarray(rgb), session=session, only_mask=True)) > 127
    obj &= ~mask('mask-plinth', k, band)
    labels, _ = ndimage.label(obj)
    keep = np.unique(labels[obj & code]); obj = np.isin(labels, keep[keep > 0])
    return float((obj & code).sum() / max(1, (obj | code).sum())), obj

def frames_of(clip):
    w, h = map(int, subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', str(clip)],
                                    capture_output=True, text=True, check=True).stdout.strip().split(','))
    hc = H if abs(w / h - W / H) < 0.005 else round(W * h / w); band = ((H - hc) // 2, hc)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(clip), '-vf', f'fps=24,scale={W}:{hc}', '-frames:v', str(N),
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, hc, W, 3), band

def picture(p): return np.asarray(Image.open(p).convert('RGB').resize((W, H), Image.LANCZOS))

def report(name, rows):
    v = np.array([r['overlap'] for r in rows]); REPORT.mkdir(parents=True, exist_ok=True)
    s = {'name': name, 'frames': len(v), 'median': round(float(np.median(v)), 3), 'worst_tenth': round(float(np.percentile(v, 10)), 3),
         'lowest': round(float(v.min()), 3), 'lowest_frame': int(rows[int(v.argmin())]['frame']), 'rows': rows}
    (REPORT / f'{name}.json').write_text(json.dumps(s, indent=1))
    print(f"{name}: median {s['median']}, worst tenth {s['worst_tenth']}, lowest {s['lowest']} (frame {s['lowest_frame']}), {len(v)} frames")
    return s

def run(name, items, session, band=(0, H)):
    seg = REPORT / f'{name}_seg'; seg.mkdir(parents=True, exist_ok=True); rows = []
    for k, rgb in items:
        o, obj = overlap(rgb, k, session, band); rows.append({'frame': k, 'overlap': round(o, 4)})
        Image.fromarray((obj * 255).astype(np.uint8)).save(seg / f'{k:03d}.png')
    return report(name, rows)

if __name__ == '__main__':
    mode, args = sys.argv[1], sys.argv[2:]
    model = args[args.index('--model') + 1] if '--model' in args else 'isnet-general-use'
    args = [a for i, a in enumerate(args) if a != '--model' and (i == 0 or args[i - 1] != '--model')]
    tag = '' if model == 'isnet-general-use' else f'_{model}'
    session = new_session(model)
    if mode == 'calibrate':
        run(f'calibration_code{tag}', ((k, picture(PASSES / f'beauty_{k:03d}.png')) for k in range(N)), session)
    elif mode == 'still':
        for p in args: run(f'still_{Path(p).stem}{tag}', [(0, picture(p))], session)
    elif mode == 'clip':
        f, band = frames_of(args[0])
        if band != (0, H): print(f'note: the clip is a centre crop; compared with code rows {band[0]}–{band[0] + band[1]}')
        if len(f) < N: print(f'note: the clip has {len(f)} frames at 24 fps, fewer than the code\'s {N}; compared over those')
        run(f'clip_{Path(args[0]).stem}{tag}', enumerate(f), session, band)
    else: sys.exit('usage: s3-check.py calibrate | still IMG … | clip CLIP.mp4')
