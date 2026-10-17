#!/usr/bin/env bash
# Checks every Test 1 clip in out/ against the code, the same way for each, and prints one line per clip.
#   PY=<python with rembg> bash check-all.sh            all clips in out/ (A_seed11.mp4 … C_seed33.mp4)
#   PY=<python with rembg> bash check-all.sh calibrate  first, the code's own shot as a clip: should read 0.995 / 0.988
# For each clip: segment.py outlines the shoe in every frame, then check.py (MAP=full: the clip is the whole 16:9
# frame) measures it. Full output goes to out/logs/<clip>.log; the readings to ../07-grok-test/report/<clip>.json.
set -euo pipefail
cd "$(dirname "$0")"; G=../07-grok-test; PY=${PY:?set PY to the python that has rembg (see RUNBOOK.md step 1)}
[ -f "$G/ref/stage_144.png" ] || { echo "missing $G/ref: run bash $G/unpack-ref.sh first"; exit 1; }
mkdir -p out/logs
if [ "${1:-}" = calibrate ]; then
  # The code's own beauty frames, made into a clip exactly as on 2026-10-15 (720p, 16 fps, 97 frames, like a fal clip).
  ffmpeg -hide_banner -loglevel error -y -framerate 24 -i "$G/ref/beauty_%03d.png" -vf "fps=16,scale=1280:720:flags=lanczos,format=yuv420p" -frames:v 97 -c:v libx264 -crf 14 out/CODE_itself.mp4
  set -- out/CODE_itself.mp4
else
  set -- $(ls out/[ABC]_seed*.mp4 2>/dev/null || true)
  [ $# -gt 0 ] || { echo "no clips in out/ yet"; exit 1; }
fi
for clip in "$@"; do
  name=$(basename "$clip" .mp4)
  if "$PY" -I "$G/segment.py" "$clip" > "out/logs/$name.log" 2>&1 && MAP=full "$PY" -I "$G/check.py" "$clip" >> "out/logs/$name.log" 2>&1; then
    "$PY" -I -c "
import json, sys
j = json.load(open(sys.argv[1])); o = j['shoe_overlap_iou']; c = j['2b_stripe_colour_de00_vs_code_same_frame']
n = sum('de_code_same_frame' in f for f in j['frames'])
print(f\"{sys.argv[2]}: overlap {o['median']:.3f} / worst tenth {o['worst_tenth']:.3f} | colour ΔE00 median {c['median']} on {n}/{j['file']['frames']} frames | flicker worst {j['4_flicker_percent']['worst']} % | {j['file']['width']}x{j['file']['height']} {j['file']['fps']:g} fps {j['file']['seconds']} s\")
" "$G/report/$name.json" "$name"
  else
    echo "$name: FAILED, see out/logs/$name.log (last lines below)"; tail -n 5 "out/logs/$name.log"
  fi
done
