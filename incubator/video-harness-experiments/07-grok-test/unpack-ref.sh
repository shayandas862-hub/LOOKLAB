#!/usr/bin/env bash
# Rebuilds ref/ (the code's own 6 s shoe shot, frame by frame, for the checker) from ref-pack/, which is in git.
#   bash unpack-ref.sh      → ref/beauty_000.png … ref/lines_144.png: 145 frames × 6 passes, 1920×1080, about 1 min
#
# ref/ itself (287 MB of PNG) stays out of git; ref-pack/ holds the same frames as videos (48 MB):
#   stripe, shoe, stage   masks of the orange accents, the shoe, and the turntable    lossless (FFV1), checked bit-exact
#   depth, lines          the control passes: depth (near white, far black), outlines  lossless (FFV1), checked bit-exact
#   beauty                the shot itself                                              near-lossless (x264 RGB, CRF 8)
# Beauty isn't lossless because lossless is 98 MB. Measured 2026-10-17: on the three clips checked so far, the packed
# beauty moved the checker's colour reading against the code by at most 0.14 ΔE00 and left the overlap unchanged.
# For the exact frames, render them again from film 05's code instead: node ref.mjs 2 145 (see RUNBOOK step 2).
set -euo pipefail
cd "$(dirname "$0")"; mkdir -p ref
for k in beauty stripe shoe stage depth lines; do
  ffmpeg -hide_banner -loglevel error -y -i "ref-pack/$k.mkv" -start_number 0 -pix_fmt rgb24 "ref/${k}_%03d.png"
  n=$(ls ref/${k}_*.png | wc -l); [ "$n" -eq 145 ] || { echo "ref/$k: $n frames, expected 145"; exit 1; }
  if [ -f "ref-pack/$k.md5" ]; then
    got=$(ffmpeg -hide_banner -loglevel error -framerate 24 -i "ref/${k}_%03d.png" -pix_fmt rgb24 -f framemd5 - | grep -v '^#' | awk -F, '{gsub(/ /,"",$NF); print $NF}')
    [ "$got" = "$(cat "ref-pack/$k.md5")" ] || { echo "ref/$k: frames differ from the originals"; exit 1; }
    echo "ref/$k: 145 frames, identical to the originals"
  else echo "ref/$k: 145 frames (near-lossless)"; fi
done
