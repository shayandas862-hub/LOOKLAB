#!/usr/bin/env bash
# The inputs for Test 1, from the code's own reference of the 6 s shoe shot (../07-grok-test/ref, 24 fps, 145 frames):
#   out/inputs/depth_16fps.mp4   the exact depth (near white, far black), resampled to 16 fps: 97 frames, 6 s
#   out/inputs/first.png, last.png   the shot's first and last frames, for way B
set -euo pipefail
cd "$(dirname "$0")"; REF=../07-grok-test/ref; KIT=../07-grok-test/kit
mkdir -p out/inputs
[ -f "$REF/depth_144.png" ] || { echo "missing $REF/depth_*.png: run STRUCTURE=1 node ref.mjs 2 145 in ../07-grok-test"; exit 1; }
ffmpeg -hide_banner -loglevel error -y -framerate 24 -i "$REF/depth_%03d.png" -vf "fps=16,scale=1280:720:flags=lanczos,format=yuv420p" -frames:v 97 -c:v libx264 -crf 12 -movflags +faststart out/inputs/depth_16fps.mp4
cp "$KIT/S3_shoe.png" out/inputs/first.png; cp "$KIT/S3_shoe_end.png" out/inputs/last.png
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=width,height,r_frame_rate,nb_read_frames -of compact out/inputs/depth_16fps.mp4
