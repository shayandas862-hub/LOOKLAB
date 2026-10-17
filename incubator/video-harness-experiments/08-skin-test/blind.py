"""Makes the blind set for the realism ratings: the 9 clips of Test 1, shuffled, renamed clip_1 … clip_9, with
their metadata stripped so nothing in the file says which way made it.

    python3 -I blind.py          → out/blind/clip_1.mp4 … clip_9.mp4, out/blind/key.json, out/ratings.json (empty)

The key (which clip is which) stays in out/blind/key.json and is not shown to the raters until every rating is in.
Ratings are 1–5 for "looks like real footage", one entry per rater, written into out/ratings.json:
    {"founder": {"clip_1": 4, "clip_2": 2, …}, "<another rater>": {…}}
"""
import json, random, subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent; OUT = HERE / 'out'; BLIND = OUT / 'blind'
NAMES = [f'{w}_seed{s}' for w in 'ABC' for s in (11, 22, 33)]
have = [n for n in NAMES if (OUT / f'{n}.mp4').exists()]
missing = [n for n in NAMES if n not in have]
if missing: print(f'note: no clip for {", ".join(missing)}; the blind set has {len(have)} clips')
if (BLIND / 'key.json').exists(): raise SystemExit('out/blind/key.json exists already: the set was made once. Delete out/blind/ only if no rating was given yet.')
order = have[:]; random.SystemRandom().shuffle(order)
BLIND.mkdir(parents=True, exist_ok=True)
key = {}
for i, n in enumerate(order, 1):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(OUT / f'{n}.mp4'), '-map', '0:v:0', '-map_metadata', '-1',
                    '-c', 'copy', '-movflags', '+faststart', str(BLIND / f'clip_{i}.mp4')], check=True)
    key[f'clip_{i}'] = n
(BLIND / 'key.json').write_text(json.dumps(key, indent=1))
ratings = OUT / 'ratings.json'
if not ratings.exists(): ratings.write_text(json.dumps({'founder': {k: None for k in key}}, indent=1))
print(f'{len(key)} clips → out/blind/clip_1.mp4 … clip_{len(key)}.mp4; key in out/blind/key.json (keep it hidden until rated)')
