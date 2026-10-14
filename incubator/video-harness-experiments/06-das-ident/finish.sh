#!/usr/bin/env bash
# Mux the sound under the picture, then make the deliverables:
#   das_ident_master.mp4   16:9, 14 s, the full ident at the render's quality
#   das_ident_1080p.mp4    the same at a bitrate made for posting and chat
#   das_ident_720p.mp4     a smaller copy
#   das_logo_3d.png        the hero frame (12.5 s), lossless, for posters and thumbnails
#   contact.png            12 frames across the ident
# Audio: loudness normalised then limited, aiming near -14 LUFS with peaks under -1 dBFS. Platform specs need checking.
set -euo pipefail
cd "$(dirname "$0")/out"
ffmpeg -hide_banner -loglevel error -y -i score.wav -af "loudnorm=I=-15.3:TP=-1.5:LRA=9,alimiter=limit=0.84:attack=3:release=60:level=disabled" -ar 48000 score_lim.wav
ffmpeg -hide_banner -loglevel error -y -i silent.mp4 -i score_lim.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -movflags +faststart -shortest das_ident_master.mp4
ENC="-c:v libx264 -preset slower -tune film -pix_fmt yuv420p -movflags +faststart"
two() { # scale, bitrate, name
  ffmpeg -hide_banner -loglevel error -y -i silent.mp4 -vf "$1" $ENC -b:v "$2" -maxrate "$2" -bufsize "$2" -pass 1 -passlogfile x264 -an -f mp4 /dev/null
  ffmpeg -hide_banner -loglevel error -y -i silent.mp4 -i score_lim.wav -map 0:v -map 1:a -vf "$1" $ENC -b:v "$2" -maxrate "$2" -bufsize "$2" -pass 2 -passlogfile x264 -c:a aac -b:a 256k -shortest "$3"
}
two "scale=1920:1080" 12000k das_ident_1080p.mp4
two "scale=1280:720:flags=lanczos" 6000k das_ident_720p.mp4
rm -f x264*.log*
cp stills/still_12.500.png das_logo_3d.png
SEL=$(for s in 0.6 1.6 2.8 4.0 5.0 5.7 6.6 7.3 8.2 9.2 10.9 12.5; do f=$(python3 -c "print(round($s*24))"); echo -n "eq(n\,$f)+"; done | sed 's/+$//')
ffmpeg -hide_banner -loglevel error -y -i das_ident_master.mp4 -vf "select='$SEL',scale=480:-1,tile=4x3:padding=4" -frames:v 1 -vsync 0 contact.png
for f in das_ident_master.mp4 das_ident_1080p.mp4 das_ident_720p.mp4; do
  ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height -of compact "$f" | tr '\n' ' '; echo
done
ffmpeg -hide_banner -nostats -i das_ident_1080p.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary | grep -E "^\s+(I|Peak):"
