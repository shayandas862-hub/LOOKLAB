#!/usr/bin/env python3
"""LinkedIn post 2: a "how it's progressing" opener (films 1-3 as one real frame each, film 4 moving), then film 05
ONE SENTENCE untouched, then the last 3 s of the Das Production ident. Every picture is a real frame or the
real film; the opener's labels are facts from the harness README."""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

S = os.path.dirname(os.path.abspath(__file__))
W, H, FPS, BEAT = 1920, 1080, 24, 12          # film 05: 24 fps, 120 BPM, one beat = 12 frames
INK, DIM, ORANGE, BG = (240, 240, 236), (150, 150, 146), (240, 106, 40), (0, 0, 0)
FD = f"{S}/fonts/node_modules/@fontsource"
ANTON = ImageFont.truetype(f"{FD}/anton/files/anton-latin-400-normal.woff", 230)
MONO = ImageFont.truetype(f"{FD}/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff", 30)
MONO_B = ImageFont.truetype(f"{FD}/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff", 30)
MONO_L = ImageFont.truetype(f"{FD}/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff", 40)

FILMS = [  # (still, label) - lengths and kinds from incubator/video-harness-experiments/README.md
    (f"{S}/films/01-look-lab-pitch/out/still_7.6.png", "FILM 1", "15 s · motion graphics"),
    (f"{S}/films/02-brief-to-film/out/still_12.4.png", "FILM 2", "15 s · 3D"),
    (f"{S}/films/03-first-light/out/still_31.0.png", "FILM 3", "40 s · 13 shots · two characters"),
    (None, "FILM 4", "1:32 · one continuous camera"),  # shown moving: MOVE
]
FILM05 = f"{S}/src/05-one-sentence_one_sentence_1080p.mp4"
IDENT = f"{S}/src/06_das_ident_1080p.mp4"
OUT = f"{S}/out"


def ff(args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error"] + args, check=True)


def chrome(d, xy, text, font):
    """Anton title with a top-light chrome gradient, like film 05's titles."""
    x0, y0, x1, y1 = d.textbbox(xy, text, font=font, anchor="mm")
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).text(xy, text, font=font, fill=255, anchor="mm")
    grad = Image.new("RGB", (W, H), INK)
    gd = ImageDraw.Draw(grad)
    for y in range(y0, y1 + 1):
        t = (y - y0) / max(1, y1 - y0)
        v = int(250 - 120 * t) if t < 0.55 else int(150 + 90 * (t - 0.55) / 0.45)
        gd.line((x0, y, x1, y), fill=(v, v, v - 4))
    return grad, mask


def hud(d, n):
    d.text((72, 64), "BUILT IN PUBLIC", font=MONO_B, fill=ORANGE)
    d.text((W - 72, 64), "EVERY FRAME MADE IN CODE", font=MONO, fill=INK, anchor="ra")
    for i in range(5):  # five pips, one per film; the current one is orange
        x = 72 + i * 58
        d.rectangle((x, H - 64, x + 44, H - 58), fill=ORANGE if i == n else (INK if i < n else (70, 70, 68)))


def still_frame(path, name, sub, n, k, frames):
    src = Image.open(path).convert("RGB").resize((W, H), Image.LANCZOS)
    z = 1.0 + 0.035 * k / frames                                     # slow push-in over its two beats
    cw, ch = int(W / z), int(H / z)
    img = src.crop(((W - cw) // 2, (H - ch) // 2, (W - cw) // 2 + cw, (H - ch) // 2 + ch)).resize((W, H), Image.LANCZOS)
    img = Image.blend(Image.new("RGB", (W, H), BG), img, 0.82)
    shade = Image.new("L", (W, H), 0)
    sd = ImageDraw.Draw(shade)
    for y in range(H - 320, H):
        sd.line((0, y, W, y), fill=int(200 * (y - (H - 320)) / 320))
    for y in range(0, 150):                                          # covers each film's own top HUD line
        sd.line((0, y, W, y), fill=int(235 * (1 - y / 150)))
    img = Image.composite(Image.new("RGB", (W, H), BG), img, shade)
    d = ImageDraw.Draw(img)
    hud(d, n)
    d.text((72, H - 150), name, font=MONO_L, fill=ORANGE)
    d.text((72 + d.textlength(name + "  ", font=MONO_L), H - 150), sub, font=MONO_L, fill=INK)
    return img


def card_frame(k):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    hud(d, 4)
    if k >= 2:                                                       # "FILM 5" lands two frames after the beat
        grad, mask = chrome(d, (W // 2, H // 2 - 40), "FILM 5", ANTON)
        a = min(1.0, (k - 2) / 4)
        img.paste(grad, (0, 0), mask.point(lambda p: int(p * a)))
        d = ImageDraw.Draw(img)
    if k >= BEAT:
        d.text((W // 2, H // 2 + 130), "how it takes a brief", font=MONO_L, fill=INK, anchor="mm")
    return img


ANTON_M = ImageFont.truetype(f"{FD}/anton/files/anton-latin-400-normal.woff", 150)


def next_card(k):
    """After film 05: the films are the control layer; realism goes on top next."""
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.text((W // 2, 300), "STILL IN PROGRESS", font=MONO_B, fill=ORANGE, anchor="mm")
    for line, y, at in (("CONTROL FIRST.", 470, 2), ("REALISM ON TOP.", 650, 2 * BEAT)):
        if k >= at:
            grad, mask = chrome(d, (W // 2, y), line, ANTON_M)
            a = min(1.0, (k - at) / 4)
            img.paste(grad, (0, 0), mask.point(lambda p: int(p * a)))
            d = ImageDraw.Draw(img)
    if k >= 3 * BEAT:
        d.text((W // 2, 800), "next: footage that looks real, layered on these films", font=MONO, fill=DIM, anchor="mm")
    return img


# From docs/BUILD-LOG.md ("Problems found, and how" tables; film 3 from the README) and the harness README.
# None = not recorded. Film 3's two are the motion checker's catches in its first cut.
BUILD = [("FILM 1", "0:15", 900, None, None), ("FILM 2", "0:15", 900, None, None),
         ("FILM 3", "0:40", 960, 2, None), ("FILM 4", "1:32", 2208, 11, 0),
         ("FILM 5", "1:32", 2208, 14, 0), ("IDENT", "0:14", 336, 9, 3)]
# From 07-grok-test/RESULTS.md, the calibrated overlap table: median shape overlap with the planned shot.
REALISM = [("THE PLAN ITSELF", 0.995, "the measuring ceiling"),
           ("TAKE 1", 0.902, "shape held · no real surface"),
           ("TAKE 2", 0.570, "real surface · shape lost")]
MONO_S = ImageFont.truetype(f"{FD}/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff", 26)
MONO_BL = ImageFont.truetype(f"{FD}/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff", 40)


def numbers_card(k):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.text((160, 150), "THE BUILD SO FAR · MEASURED", font=MONO_B, fill=ORANGE)
    cols = [(160, "l", ""), (520, "r", "LENGTH"), (820, "r", "FRAMES"), (1120, "l", "FOUND BY ITS OWN CHECKS"),
            (1760, "r", "FOUND BY ME")]
    for x, al, head in cols:
        d.text((x, 240), head, font=MONO_S, fill=DIM, anchor="la" if al == "l" else "ra")
    d.line((160, 285, 1760, 285), fill=(60, 60, 58), width=2)
    rows = BUILD + [("TOTAL", "", sum(r[2] for r in BUILD), sum(r[3] or 0 for r in BUILD), sum(r[4] or 0 for r in BUILD))]
    for i, (name, length, frames, checks, me) in enumerate(rows):
        if k < (1 + i) * BEAT // 2:                                  # one row every half beat
            break
        y = 320 + i * 82 + (14 if name == "TOTAL" else 0)
        if name == "TOTAL":
            d.line((160, y - 22, 1760, y - 22), fill=(60, 60, 58), width=2)
        f = MONO_BL if name == "TOTAL" else MONO_L
        d.text((160, y), name, font=f, fill=ORANGE if name == "FILM 5" else INK)
        d.text((520, y), length, font=f, fill=INK, anchor="ra")
        d.text((820, y), f"{frames:,}", font=f, fill=INK, anchor="ra")
        if checks is None:
            d.text((1120, y), "—", font=f, fill=DIM)
        else:
            if name != "TOTAL":
                d.rectangle((1120, y + 12, 1120 + int(32 * checks), y + 34), fill=ORANGE)
            d.text((1120 + (int(32 * checks) + 20 if name != "TOTAL" else 0), y), str(checks), font=f, fill=INK)
        d.text((1760, y), "—" if me is None else str(me), font=f, fill=DIM if me is None else INK, anchor="ra")
    d.text((160, 960), "— = not recorded", font=MONO_S, fill=DIM)
    return img


def realism_card(k):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.text((160, 190), "FIRST REALISM TEST · IN PROGRESS", font=MONO_B, fill=ORANGE)
    d.text((160, 250), "How closely each generated take keeps the shoe's planned shape. 1.0 = exact.", font=MONO_S, fill=DIM)
    x0, x1 = 640, 1600
    for i, (name, v, note) in enumerate(REALISM):
        start = (1 + i) * BEAT
        if k < start:
            break
        grow = min(1.0, (k - start) / 8)
        y = 380 + i * 170
        d.text((160, y + 6), name, font=MONO_L, fill=INK if i else DIM)
        d.rectangle((x0, y, x0 + int((x1 - x0) * v * grow), y + 56), fill=(110, 110, 106) if i == 0 else ORANGE)
        d.text((x0 + int((x1 - x0) * v * grow) + 24, y + 6), f"{v * grow:.3f}", font=MONO_L, fill=INK)
        d.text((x0, y + 76), note, font=MONO_S, fill=DIM)
    d.text((160, 930), "median over every frame of each 6 s take · not solved yet", font=MONO_S, fill=DIM)
    return img


def endcards():
    """Numbers (6 s), the realism test (5 s), then CONTROL FIRST (3 s), over one quiet drone."""
    os.makedirs(f"{OUT}/end", exist_ok=True)
    plan = [(numbers_card, 12 * BEAT), (realism_card, 10 * BEAT), (next_card, 6 * BEAT)]
    i, ticks, t0 = 0, [], 0
    for fn, n in plan:
        for k in range(n):
            fn(k).save(f"{OUT}/end/{i:05d}.png"); i += 1
        beats = range(1, 8) if fn is numbers_card else (range(1, 4) if fn is realism_card else (0, 2))
        ticks += [(t0 + b * BEAT / (2 if fn is numbers_card else 1)) / FPS for b in beats]
        t0 += n
    secs = i / FPS
    tick = "+".join(f"0.16*sin(2*PI*1500*t)*exp(-70*(t-{c:.4f}))*gte(t,{c:.4f})" for c in ticks)
    drone = f"0.05*(sin(2*PI*55*t)+0.6*sin(2*PI*82.5*t))*min(1,t/1.5)*min(1,({secs}-t)/0.5)"
    ff(["-f", "lavfi", "-t", f"{secs}", "-i", f"aevalsrc='{tick}+{drone}':s=48000:c=stereo", f"{OUT}/end.wav"])
    ff(["-framerate", str(FPS), "-i", f"{OUT}/end/%05d.png", "-i", f"{OUT}/end.wav",
        "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-shortest", f"{OUT}/nextcard.mp4"])
    # the two number cards as one still for the first comment
    a, b = numbers_card(10 ** 6), realism_card(10 ** 6)
    sheet = Image.new("RGB", (W, 2 * H), BG)
    sheet.paste(a, (0, 0)); sheet.paste(b, (0, H))
    sheet.save(f"{OUT}/post2_numbers.png")


SEA = (32.0, 34.0)   # film 04 0:32-0:34: the under-the-sea world, bar 16 (48 frames, starts on the downbeat)
MOVE = (76.0, 12.0)  # film 04 1:16-1:28: one continuous camera, out of the screen, round the hero, crane up


def hud_overlay(name, sub, n):
    """The opener's labels and shades as a transparent layer, for laying over moving footage."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shade = Image.new("L", (W, H), 0)
    sd = ImageDraw.Draw(shade)
    for y in range(H - 320, H):
        sd.line((0, y, W, y), fill=int(200 * (y - (H - 320)) / 320))
    for y in range(0, 150):
        sd.line((0, y, W, y), fill=int(235 * (1 - y / 150)))
    img.paste(Image.new("RGBA", (W, H), BG + (255,)), (0, 0), shade)
    d = ImageDraw.Draw(img)
    hud(d, n)
    d.text((72, H - 150), name, font=MONO_L, fill=ORANGE)
    d.text((72 + d.textlength(name + "  ", font=MONO_L), H - 150), sub, font=MONO_L, fill=INK)
    return img


def encode_frames(folder, wav, out):
    ff(["-framerate", str(FPS), "-i", f"{folder}/%04d.png", "-i", wav,
        "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-shortest", out])


def opener():
    """Films 1-3 as stills (one second each), film 4 moving (under the sea, then its continuous camera), then the FILM 5 card."""
    os.makedirs(f"{OUT}/stills3", exist_ok=True)
    i = 0
    for n, (path, name, sub) in enumerate(FILMS[:3]):
        for k in range(2 * BEAT):
            still_frame(path, name, sub, n, k, 2 * BEAT).save(f"{OUT}/stills3/{i:04d}.png"); i += 1
    ticks = "+".join(f"0.22*sin(2*PI*1500*t)*exp(-70*(t-{c / FPS:.4f}))*gte(t,{c / FPS:.4f})" for c in (0, 24, 48))
    ff(["-f", "lavfi", "-t", f"{i / FPS}", "-i", f"aevalsrc='{ticks}':s=48000:c=stereo", f"{OUT}/stills3.wav"])
    encode_frames(f"{OUT}/stills3", f"{OUT}/stills3.wav", f"{OUT}/op_stills.mp4")

    hud_overlay("FILM 4", "1:32 · eight worlds", 3).save(f"{OUT}/hud4_sea.png")
    a, b = SEA
    ff(["-i", f"{S}/src/04_action_1080p.mp4", "-i", f"{OUT}/hud4_sea.png", "-filter_complex",
        f"[0:v]trim=start={a}:end={b},setpts=PTS-STARTPTS[c];[c][1:v]overlay=0:0,setsar=1[v];"
        f"[0:a]atrim=start={a}:end={b},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={b - a - 0.06}:d=0.06[a]",
        "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", f"{OUT}/op_sea.mp4"])
    hud_overlay("FILM 4", "1:32 · one continuous camera", 3).save(f"{OUT}/hud4.png")
    t0, dur = MOVE
    ff(["-ss", str(t0), "-t", str(dur), "-i", f"{S}/src/04_action_1080p.mp4", "-i", f"{OUT}/hud4.png",
        "-filter_complex", f"[0:v][1:v]overlay=0:0,setsar=1[v];[0:a]afade=t=in:d=0.08,afade=t=out:st={dur - 0.45}:d=0.45[a]",
        "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", f"{OUT}/op_move.mp4"])

    os.makedirs(f"{OUT}/card5", exist_ok=True)
    for k in range(4 * BEAT):
        card_frame(k).save(f"{OUT}/card5/{k:04d}.png")
    hit = "0.5*sin(2*PI*52*t)*exp(-5*(t-0.0833))*gte(t,0.0833)+0.18*sin(2*PI*1100*t)*exp(-40*(t-0.0833))*gte(t,0.0833)"
    ff(["-f", "lavfi", "-t", f"{4 * BEAT / FPS}", "-i", f"aevalsrc='{hit}':s=48000:c=stereo", f"{OUT}/card5.wav"])
    encode_frames(f"{OUT}/card5", f"{OUT}/card5.wav", f"{OUT}/op_card.mp4")


def main():
    opener()
    if not os.path.exists(f"{OUT}/nextcard.mp4"):
        endcards()
    parts = [f"{OUT}/op_stills.mp4", f"{OUT}/op_sea.mp4", f"{OUT}/op_move.mp4", f"{OUT}/op_card.mp4", FILM05, f"{OUT}/nextcard.mp4"]
    args = sum((["-i", p] for p in parts), []) + ["-ss", "11.2", "-t", "2.8", "-i", IDENT]
    n = len(parts)
    chain = "".join(f"[{j}:v]fps=24,setsar=1[v{j}];" for j in range(n))
    chain += f"[{n}:v]fps=24,setsar=1,fade=t=in:st=0:d=0.25[v{n}];[{n}:a]afade=t=in:st=0:d=0.25[a{n}];"
    chain += "".join(f"[v{j}][{j}:a]" for j in range(n)) + f"[v{n}][a{n}]concat=n={n + 1}:v=1:a=1[v][a]"
    # one encode for the whole cut; film 05 itself is untouched
    ff(args + ["-filter_complex", chain, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "slow",
               "-crf", "19", "-pix_fmt", "yuv420p", "-profile:v", "high", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
               "-movflags", "+faststart", f"{OUT}/post2_one_sentence_linkedin.mp4"])
    ff(["-i", f"{OUT}/post2_one_sentence_linkedin.mp4", "-c:v", "libx264", "-preset", "slow", "-crf", "24",
        "-maxrate", "5M", "-bufsize", "10M", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
        "-movflags", "+faststart", f"{OUT}/post2_one_sentence_linkedin_light.mp4"])


if __name__ == "__main__":
    main()
