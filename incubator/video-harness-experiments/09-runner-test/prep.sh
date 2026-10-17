#!/usr/bin/env bash
# Test 1b's inputs and calibration clip, from the code's own frames (ref/, made by node ref.mjs: 241 frames at 16 fps).
#   inputs/depth_16fps.mp4   what fal is given: the exact depth of film 4's last 15 s, 1280×720, 16 fps, 241 frames
#   out/CODE_itself.mp4      the code's own clean frames made into a clip like a fal clip, for calibrating the checker
set -euo pipefail
cd "$(dirname "$0")"
[ -f ref/runner_240.png ] || { echo "missing ref/: run node ref.mjs 241 72.9375 first"; exit 1; }
mkdir -p inputs out
ffmpeg -hide_banner -loglevel error -y -framerate 16 -i ref/depth_%03d.png -vf "scale=1280:720:flags=lanczos,format=yuv420p" -frames:v 241 -c:v libx264 -crf 12 -movflags +faststart inputs/depth_16fps.mp4
ffmpeg -hide_banner -loglevel error -y -framerate 16 -i ref/clean_%03d.png -vf "scale=1280:720:flags=lanczos,format=yuv420p" -frames:v 241 -c:v libx264 -crf 14 out/CODE_itself.mp4
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=width,height,r_frame_rate,nb_read_frames -of compact inputs/depth_16fps.mp4
