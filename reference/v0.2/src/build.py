#!/usr/bin/env python3
"""Assemble the single-file prototype.

Inputs  (src/): base.html (Reference-fit tab + core math), scene.css, nav.html, panels.html, scene.js
Outputs (dist/):
  look-lab.html  the fragment published as a Claude artifact (host supplies doctype/head/body)
  index.html     the same content wrapped in a minimal standalone document, open it directly in a browser
"""
import os
here = os.path.dirname(os.path.abspath(__file__))
dist = os.path.join(here, '..', 'dist')
os.makedirs(dist, exist_ok=True)
rd = lambda n: open(os.path.join(here, n), encoding='utf-8').read()

base, css, nav, panels, js = rd('base.html'), rd('scene.css'), rd('nav.html'), rd('panels.html'), rd('scene.js')

def sub(text, old, new):
    assert old in text, 'anchor not found: ' + old[:60]
    return text.replace(old, new, 1)

base = sub(base, 'rel="stylesheet">\n<style>',
           'rel="stylesheet">\n<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n<style>')
end_css = '@media (prefers-reduced-motion:reduce){.bar i,#cRes{transition:none}}\n</style>'
base = sub(base, end_css, end_css.replace('</style>', '') + css + '</style>')
base = sub(base, '  <div class="stage" id="stage">', nav + '  <div class="stage" id="stage">')
base = sub(base, '</p>\n</div>\n\n<script>\n/*CORE-START*/', '</p>\n  </div>\n' + panels + '</div>\n\n<script>\n/*CORE-START*/')
assert base.rstrip().endswith('</script>')
out = base.rstrip() + '\n\n<script>\n' + js + '</script>\n'

open(os.path.join(dist, 'look-lab.html'), 'w', encoding='utf-8').write(out)

standalone = ('<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
              '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
              '<style>:root{color-scheme:light}body{margin:0}[hidden]{display:none!important}</style></head><body>\n'
              + out + '</body></html>\n')
open(os.path.join(dist, 'index.html'), 'w', encoding='utf-8').write(standalone)
print('built dist/look-lab.html (%d bytes) and dist/index.html' % len(out.encode('utf-8')))
