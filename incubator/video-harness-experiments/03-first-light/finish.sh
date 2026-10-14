#!/usr/bin/env bash
# Mux the score, make the master and a shareable encode (under 30 MiB), a contact sheet, and check loudness.
# Audio: loudness to -15 LUFS, then a limiter so the true peak stays below 0 dBFS (delivered at -13.5 LUFS, -0.5 dBTP).
set -euo pipefail
cd "$(dirname "$0")/out"
ffmpeg -hide_banner -loglevel error -y -i score.wav -af "loudnorm=I=-15:TP=-2:LRA=11,alimiter=limit=0.79:attack=3:release=60:level=disabled" -ar 48000 score_lim.wav
ffmpeg -hide_banner -loglevel error -y -i silent.mp4 -i score_lim.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 224k -movflags +faststart -shortest first_light_master.mp4
ffmpeg -hide_banner -loglevel error -y -i silent.mp4 -c:v libx264 -preset slower -tune film -b:v 5000k -maxrate 8000k -bufsize 10000k -pix_fmt yuv420p -pass 1 -passlogfile x264 -an -f mp4 /dev/null
ffmpeg -hide_banner -loglevel error -y -i silent.mp4 -i score_lim.wav -map 0:v -map 1:a -c:v libx264 -preset slower -tune film -b:v 5000k -maxrate 8000k -bufsize 10000k -pix_fmt yuv420p -pass 2 -passlogfile x264 -c:a aac -b:a 192k -movflags +faststart -shortest first_light_40s_share.mp4
rm -f x264*.log*
SEL=$(for s in 2 6.5 9.3 11 13.5 17.5 21.6 24 26.8 28 30.5 33 36.4 38 39 39.6; do f=$(python3 -c "print(round($s*24))"); echo -n "eq(n\,$f)+"; done | sed 's/+$//')
ffmpeg -hide_banner -loglevel error -y -i first_light_40s_share.mp4 -vf "select='$SEL',scale=480:-1,tile=4x4" -frames:v 1 -vsync 0 contact.png
ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames -of compact first_light_40s_share.mp4
ffmpeg -hide_banner -nostats -i first_light_40s_share.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary | grep -E "^\s+(I|Peak):"
