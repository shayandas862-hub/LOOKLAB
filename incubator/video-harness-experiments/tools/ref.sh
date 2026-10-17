#!/usr/bin/env bash
# Breaks a reference video into what we can study: its transcript, its cuts, and one contact sheet (a frame from
# the middle of every shot).
#   tools/ref.sh <youtube-url | video-file> [cut threshold, default 0.1: finds all 4 cuts of our previs, none false]
#   → tools/out/<id>/transcript.txt, shots.csv, sheet_1.png …, and video.mp4 when it came from a link
# yt-dlp (Unlicense) installs itself into tools/.venv on first use; ffmpeg and python3 must already be installed.
# YouTube asks cloud servers to sign in, so links work from your own computer, not from a cloud session: run it
# there, or upload the file. Never pass account cookies. For study only: nothing here is sent to fal or committed
# (out/ is ignored), and nothing is copied shot for shot.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$1"; TH="${2:-0.1}"

if [ -f "$SRC" ]; then
  ID="$(basename "${SRC%.*}")"; DIR="$HERE/out/$ID"; mkdir -p "$DIR"; VIDEO="$SRC"
else
  [ -x "$HERE/.venv/bin/yt-dlp" ] || { python3 -m venv "$HERE/.venv" && "$HERE/.venv/bin/pip" install -q yt-dlp; }
  ID="$("$HERE/.venv/bin/yt-dlp" --print id "$SRC")"; DIR="$HERE/out/$ID"; mkdir -p "$DIR"
  "$HERE/.venv/bin/yt-dlp" -q --no-warnings -f "bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[height<=720]/b" \
    --merge-output-format mp4 --write-info-json -o "$DIR/video.%(ext)s" "$SRC" > "$DIR/download.log" 2>&1
  # Captions one track per call (several at once got HTTP 429 on 2026-10-18): the speech-recognition track first,
  # then "en". A missing transcript doesn't stop the cuts and the sheet.
  for L in en-orig en; do
    if ls "$DIR"/*.vtt > /dev/null 2>&1; then break; fi
    "$HERE/.venv/bin/yt-dlp" -q --no-warnings --skip-download --write-subs --write-auto-subs --sub-langs "$L" \
      --sub-format vtt -o "$DIR/video.%(ext)s" "$SRC" >> "$DIR/download.log" 2>&1 || sleep 10
  done
  VIDEO="$DIR/video.mp4"
fi

# Transcript: the captions without timing codes or repeats, one line per new sentence with its time.
python3 -I - "$DIR" > "$DIR/transcript.txt" <<'EOF'
import glob, re, sys
files = sorted(glob.glob(sys.argv[1] + '/*.vtt'))
if not files: print('(no captions)'); sys.exit()
seen, t = set(), '00:00'
for line in open(files[0], encoding='utf-8'):
    m = re.match(r'(\d+):(\d+):(\d+)\.\d+ -->', line)
    if m: t = f'{int(m[1]) * 60 + int(m[2]):02d}:{m[3]}'; continue
    text = re.sub(r'<[^>]+>', '', line).strip()
    if not text or text.startswith(('WEBVTT', 'Kind:', 'Language:')) or text in seen: continue
    seen.add(text); print(f'[{t}] {text}')
EOF

# Cuts: frames where the picture changes by more than the threshold; shots run between them.
DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO")"
ffmpeg -hide_banner -nostats -i "$VIDEO" -vf "select='gt(scene,$TH)',showinfo" -an -f null - 2>&1 \
  | grep -o 'pts_time:[0-9.]*' | cut -d: -f2 > "$DIR/cuts.txt" || true
python3 -I - "$DIR" "$DUR" <<'EOF'
import sys
d, dur = sys.argv[1], float(sys.argv[2])
cuts = [float(x) for x in open(d + '/cuts.txt') if x.strip()]
edges = [0.0] + [c for c in cuts if 0.2 < c < dur - 0.2] + [dur]
with open(d + '/shots.csv', 'w') as f:
    f.write('shot,start,end,length\n')
    for i, (a, b) in enumerate(zip(edges, edges[1:]), 1): f.write(f'{i},{a:.2f},{b:.2f},{b - a:.2f}\n')
EOF

# One frame from the middle of each shot, 48 to a sheet. Homebrew's plain ffmpeg has no drawtext (no freetype): then
# the frames go unnumbered and the sheet reads row by row, 8 to a row.
HAS_TEXT="$(ffmpeg -hide_banner -filters 2>/dev/null | grep -c ' drawtext ' || true)"
rm -f "$DIR"/shot_*.jpg "$DIR"/sheet_*.png
tail -n +2 "$DIR/shots.csv" | while IFS=, read -r n a b len; do
  VF="scale=320:-2"
  if [ "$HAS_TEXT" -gt 0 ]; then
    VF="$VF,drawtext=text='$n':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6"
  fi
  ffmpeg -hide_banner -loglevel error -y -ss "$(python3 -c "print(($a + $b) / 2)")" -i "$VIDEO" -frames:v 1 \
    -vf "$VF" "$DIR/$(printf 'shot_%03d.jpg' "$n")" < /dev/null
done
N="$(ls "$DIR"/shot_*.jpg | wc -l | tr -d ' ')"
for ((s = 1, k = 1; s <= N; s += 48, k++)); do
  ffmpeg -hide_banner -loglevel error -y -start_number "$s" -i "$DIR/shot_%03d.jpg" -frames:v 1 \
    -vf "tile=8x6:padding=4" "$DIR/sheet_$k.png" < /dev/null
done

echo "$ID: $(printf '%.1f' "$DUR") s, $N shots (average $(python3 -c "print(round($DUR / max($N, 1), 2))") s), $(wc -w < "$DIR/transcript.txt" | tr -d ' ') words of transcript"
[ "$HAS_TEXT" -gt 0 ] || echo "(sheets unnumbered: this ffmpeg has no drawtext; shot n is row by row, 8 to a row)"
echo "→ $DIR"
