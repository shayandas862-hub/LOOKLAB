"""Test 1b's checker: how closely a clip's runner sits where the code puts it, frame by frame.
    <venv with rembg>/bin/python -I check.py out/C_seed11.mp4      → out/report/C_seed11.json, and one line printed
For each clip frame, the code's runner mask at the same moment (ref/runner_NNN.png, 16 fps) gives a box. The clip
frame is cropped to that box widened by half its longer side each way; a background-removal model (rembg,
isnet-general-use, the one Test 1 used) outlines the main figure in the crop; the reading is its overlap
(intersection over union) with the code's mask in the same crop. Frames where the code's runner covers under 0.3 % of
the picture (before it steps out of the screen, and high in the crane) are not measured, and are counted as such.
Written 2026-10-17, before any Test 1b clip."""
import json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image
from rembg import new_session, remove

HERE = Path(__file__).resolve().parent; REF = HERE / 'ref'; MIN_AREA = 0.003
clip = Path(sys.argv[1]); name = clip.stem
info = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'json', str(clip)], capture_output=True, text=True, check=True).stdout)['streams'][0]
W, H = info['width'], info['height']; num, den = map(int, info['r_frame_rate'].split('/')); fps = num / den
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(clip), '-map', '0:v:0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
n_ref = len(list(REF.glob('runner_*.png')))
session = new_session('isnet-general-use')
rows = []
for i, f in enumerate(frames):
    r = min(n_ref - 1, round(i / fps * 16))
    code = np.asarray(Image.open(REF / f'runner_{r:03d}.png').convert('L').resize((W, H), Image.BILINEAR)) > 127
    row = {'frame': i, 'ref': r, 'code_area': round(float(code.mean()), 5)}
    if code.mean() >= MIN_AREA:
        ys, xs = np.nonzero(code); pad = 0.5 * max(xs.max() - xs.min(), ys.max() - ys.min())
        x0, x1 = max(0, int(xs.min() - pad)), min(W, int(xs.max() + pad) + 1); y0, y1 = max(0, int(ys.min() - pad)), min(H, int(ys.max() + pad) + 1)
        seg = np.asarray(remove(Image.fromarray(np.ascontiguousarray(f[y0:y1, x0:x1])), session=session, only_mask=True)) > 127
        c = code[y0:y1, x0:x1]
        row['iou'] = round(float((seg & c).sum() / max(1, (seg | c).sum())), 3)
    rows.append(row)
iou = np.array([r['iou'] for r in rows if 'iou' in r])
out = HERE / 'out' / 'report'; out.mkdir(parents=True, exist_ok=True)
summary = {'clip': name, 'file': {'width': W, 'height': H, 'fps': fps, 'frames': len(frames), 'seconds': round(len(frames) / fps, 3)},
           'runner_overlap_iou': {'median': round(float(np.median(iou)), 3) if len(iou) else None, 'worst_tenth': round(float(np.percentile(iou, 10)), 3) if len(iou) else None,
                                  'lowest': round(float(iou.min()), 3) if len(iou) else None, 'frames_measured': int(len(iou)), 'min_code_area': MIN_AREA,
                                  'method': 'rembg isnet-general-use on a crop round the code runner; IoU with the code mask'},
           'frames': rows}
(out / f'{name}.json').write_text(json.dumps(summary, indent=1))
o = summary['runner_overlap_iou']
print(f"{name}: overlap {o['median']} / worst tenth {o['worst_tenth']} on {o['frames_measured']}/{len(frames)} frames | {W}x{H} {fps:g} fps {summary['file']['seconds']} s")
