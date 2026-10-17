"""Applies Test 1's pass marks (README.md, fixed 2026-10-15 before any clip) to the checker's readings and the
ratings, and states the verdict. No judgement here: it reads numbers and compares them with the marks.

    python3 -I verdict.py        → prints the table and the verdict, writes out/verdict.json

Reads ../07-grok-test/report/<clip>.json (check.py), out/blind/key.json and out/ratings.json (blind.py and the raters),
and out/runs.json (run.mjs: time taken per clip). A clip that is missing, unchecked or unrated can't pass.
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent; OUT = HERE / 'out'; REPORT = HERE.parent / '07-grok-test' / 'report'
NAMES = [f'{w}_seed{s}' for w in 'ABC' for s in (11, 22, 33)]
MARKS = {'overlap_median': 0.85, 'overlap_worst_tenth': 0.75, 'colour_median_de00': 5.0, 'colour_frames_share': 0.80, 'realism': 3.5}

def read(p, default):
    return json.loads(p.read_text()) if p.exists() else default
key = read(OUT / 'blind' / 'key.json', {}); blind_of = {v: k for k, v in key.items()}
ratings = read(OUT / 'ratings.json', {}); runs = {r['name']: r for r in read(OUT / 'runs.json', []) if 'output_url' in r}

rows, problems = [], []
for n in NAMES:
    row = {'clip': n, 'way': n[0], 'blind_id': blind_of.get(n), 'seconds_taken': runs.get(n, {}).get('seconds_taken')}
    rep = REPORT / f'{n}.json'
    if not (OUT / f'{n}.mp4').exists(): row['status'] = 'no clip'
    elif not rep.exists(): row['status'] = 'not checked'
    else:
        j = json.loads(rep.read_text()); o = j['shoe_overlap_iou']
        if not o['method'].startswith('segmentation'): problems.append(f'{n}: overlap was read without segment.py; run it, then check.py again')
        frames = j['file']['frames']; measured = [f['de_code_same_frame'] for f in j['frames'] if 'de_code_same_frame' in f]
        row.update(overlap_median=o['median'], overlap_worst_tenth=o['worst_tenth'], colour_median_de00=j['2b_stripe_colour_de00_vs_code_same_frame']['median'] if measured else None,
                   colour_frames_share=round(len(measured) / max(1, frames), 3), flicker_worst_pct=j['4_flicker_percent']['worst'], file=j['file'])
    scores = [r[row['blind_id']] for r in ratings.values() if row['blind_id'] and isinstance(r.get(row['blind_id']), (int, float))]
    row['realism'] = round(sum(scores) / len(scores), 2) if scores else None; row['raters'] = len(scores)
    if 'overlap_median' in row:
        row['holds_skeleton'] = row['overlap_median'] >= MARKS['overlap_median'] and row['overlap_worst_tenth'] >= MARKS['overlap_worst_tenth']
        row['on_brand'] = row['colour_median_de00'] is not None and row['colour_median_de00'] <= MARKS['colour_median_de00'] and row['colour_frames_share'] >= MARKS['colour_frames_share']
        row['looks_real'] = None if row['realism'] is None else row['realism'] >= MARKS['realism']
        row['real_and_exact'] = bool(row['holds_skeleton'] and row['on_brand'] and row['looks_real'])
        row['status'] = 'checked' if row['realism'] is not None else 'checked, not rated'
    else: row['real_and_exact'] = False
    rows.append(row)

c_pass = sum(r['real_and_exact'] for r in rows if r['way'] == 'C'); ab_pass = [r['clip'] for r in rows if r['way'] in 'AB' and r['real_and_exact']]
complete = all(r['status'] == 'checked' for r in rows)
if ab_pass: verdict = f'Fails on this shot: {", ".join(ab_pass)} also got real and exact, so code isn\'t needed for a shot like this.'
elif not complete: verdict = 'Not decided yet: some clips are missing, unchecked or unrated (see the table).'
elif c_pass >= 2: verdict = f'Survives this shot: {c_pass} of 3 C takes are real and exact, and no A or B take is. Next: Test 2.'
else:
    c = [r for r in rows if r['way'] == 'C' and 'overlap_median' in r]
    exact = sum(bool(r['holds_skeleton'] and r['on_brand']) for r in c); real = sum(bool(r['looks_real']) for r in c)
    verdict = ('Fails on this shot: C is exact but not real enough (the skeleton works; try a better skin model).' if exact >= 2 else
               'Fails on this shot: C isn\'t exact (try one stronger control model once, then stop adding code for generation).' if real >= 2 else
               'Fails on this shot: C is neither exact nor real enough.')

fmt = lambda v, d=2: '—' if v is None else (('yes' if v else 'no') if isinstance(v, bool) else f'{v:.{d}f}' if isinstance(v, float) else str(v))
print('| Clip | Blind | Overlap median / worst tenth | Colour ΔE00 median (frames measured) | Realism (raters) | Real and exact | Status |')
print('|---|---|---|---|---|---|---|')
for r in rows:
    share = '—' if r.get('colour_frames_share') is None else format(r['colour_frames_share'], '.0%')
    ov = f"{fmt(r.get('overlap_median'), 3)} / {fmt(r.get('overlap_worst_tenth'), 3)}"; co = f"{fmt(r.get('colour_median_de00'))} ({share})"
    print(f"| {r['clip']} | {r['blind_id'] or '—'} | {ov} | {co} | {fmt(r['realism'])} ({r['raters']}) | {fmt(r['real_and_exact'])} | {r['status']} |")
print(f'\nMarks: overlap median ≥ {MARKS["overlap_median"]} and worst tenth ≥ {MARKS["overlap_worst_tenth"]}; colour median ≤ {MARKS["colour_median_de00"]} ΔE00 on ≥ {MARKS["colour_frames_share"]:.0%} of frames; realism ≥ {MARKS["realism"]}.')
for p in problems: print('PROBLEM:', p)
print('\nVERDICT:', verdict)
(OUT / 'verdict.json').write_text(json.dumps({'marks': MARKS, 'rows': rows, 'problems': problems, 'verdict': verdict, 'complete': complete}, indent=1))
