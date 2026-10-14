#!/usr/bin/env bash
# Mux the score under the picture, then make the deliverables:
#   one_sentence_master.mp4     16:9, 1:32, the full film (high bitrate, kept out of git)
#   one_sentence_1080p.mp4      the same, small enough to post or download
#   one_sentence_720p.mp4       under 30 MB, to send in chat
#   one_sentence_make_16s.mp4   0:28–0:44, the four lanes make the four shots (cut-down)
#   one_sentence_check_12s.mp4  0:44–0:56, the checker catches the wrong orange and fixes it (cut-down)
#   one_sentence_hook_8s.mp4    0:24–0:32, the flight through the gates, GO!, the drop (cut-down)
#   contact.png                 16 frames across the film
# Audio: loudness normalised then limited, landing near -14 LUFS with peaks under -1 dBFS. Platform specs need checking before upload.
set -euo pipefail
cd "$(dirname "$0")/out"
ffmpeg -hide_banner -loglevel error -y -i score.wav -af "loudnorm=I=-15.3:TP=-1.5:LRA=9,alimiter=limit=0.84:attack=3:release=60:level=disabled" -ar 48000 score_lim.wav
ffmpeg -hide_banner -loglevel error -y -i silent.mp4 -i score_lim.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -movflags +faststart -shortest one_sentence_master.mp4
ENC="-c:v libx264 -preset slower -tune film -pix_fmt yuv420p -movflags +faststart"
ffmpeg -hide_banner -loglevel error -y -i silent.mp4 $ENC -b:v 6000k -maxrate 9000k -bufsize 12000k -pass 1 -passlogfile x264 -an -f mp4 /dev/null
ffmpeg -hide_banner -loglevel error -y -i silent.mp4 -i score_lim.wav -map 0:v -map 1:a $ENC -b:v 6000k -maxrate 9000k -bufsize 12000k -pass 2 -passlogfile x264 -c:a aac -b:a 192k -shortest one_sentence_1080p.mp4
ffmpeg -hide_banner -loglevel error -y -i silent.mp4 -vf scale=1280:720:flags=lanczos $ENC -b:v 2000k -maxrate 3000k -bufsize 4000k -pass 1 -passlogfile x264 -an -f mp4 /dev/null
ffmpeg -hide_banner -loglevel error -y -i silent.mp4 -i score_lim.wav -map 0:v -map 1:a -vf scale=1280:720:flags=lanczos $ENC -b:v 2000k -maxrate 3000k -bufsize 4000k -pass 2 -passlogfile x264 -c:a aac -b:a 160k -shortest one_sentence_720p.mp4
rm -f x264*.log*
cut() { # start, length, name
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i one_sentence_master.mp4 -af "afade=t=in:d=0.04,afade=t=out:st=$(python3 -c "print($2-0.35)"):d=0.35" $ENC -b:v 9000k -maxrate 12000k -bufsize 18000k -c:a aac -b:a 192k "$3"
}
cut 28 16 one_sentence_make_16s.mp4
cut 44 12 one_sentence_check_12s.mp4
cut 24 8 one_sentence_hook_8s.mp4
SEL=$(for s in 4 10.5 14.5 18.5 21 25.5 29.5 33.5 37.5 41.5 47 51.5 58 66 80.5 87.5; do f=$(python3 -c "print(round($s*24))"); echo -n "eq(n\,$f)+"; done | sed 's/+$//')
ffmpeg -hide_banner -loglevel error -y -i one_sentence_master.mp4 -vf "select='$SEL',scale=480:-1,tile=4x4:padding=4" -frames:v 1 -vsync 0 contact.png
for f in one_sentence_master.mp4 one_sentence_1080p.mp4 one_sentence_720p.mp4 one_sentence_make_16s.mp4 one_sentence_check_12s.mp4 one_sentence_hook_8s.mp4; do
  ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height -of compact "$f" | tr '\n' ' '; echo
done
ffmpeg -hide_banner -nostats -i one_sentence_1080p.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary | grep -E "^\s+(I|Peak):"
