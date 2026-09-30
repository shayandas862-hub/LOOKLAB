// @ts-nocheck: behaviour ported from design/Breakdown.dc.html; typed as each screen is wired to real actions.
// Owned code (D-LL-014): the port wrote this once and will not overwrite it.
import React from 'react';
import { DCLogic } from '../runtime/dc';
import { BreakdownView, defaults } from '../views/Breakdown.view';
import { sampleBadge, sampleBadgeText } from '../runtime/badges';

const PAL = [
  ['#1B2230',38,'22%','24%'],['#3E4A52',22,'82%','30%'],['#C7803A',14,'27%','52%'],
  ['#6E5B4A',11,'44%','80%'],['#E9C9A0',9,'36%','38%'],['#0D0F12',6,'92%','86%'],
];
const ROWS = {
  light: [
    ['key','Key','hard · 2000 K sodium','ai',81],
    ['fill','Fill','5600 K ambient','ai',57],
    ['ratio','Key:fill','8:1 (3 stops)','measured'],
    ['hard','Hardness','hard, sharp shadow edge','measured'],
    ['prac','Practicals','none','ai',52],
  ],
  lens: [
    ['focal','Focal length','≈40 mm','ai',72],
    ['dof','Depth of field','shallow','ai',74],
    ['height','Camera height','1.2 m','ai',55],
    ['angle','Angle','slight low, 4°','ai',66],
    ['move','Movement','static','measured'],
  ],
  framing: [
    ['size','Shot size','MCU','ai',88],
    ['pos','Subject','left third','measured'],
    ['room','Lead room','right','measured'],
    ['aspect','Aspect','2.39:1','measured'],
  ],
};
const STEPS = [['Shots detected','T0'],['Colour','T0'],['Light','T2'],['Lens','T2'],['Framing','T1'],['Mood','T2']];
const STEP_ACTIONS = ['breakdown.detect_shots','breakdown.sample_palette','breakdown.fit_light','breakdown.fit_lens','breakdown.fit_framing','breakdown.fit_mood'];
const DURS = ['2.4s','3.1s','4.6s','2.0s','5.2s','1.8s','3.3s'];

// While this screen shows sample data every non-manual badge reads SAMPLE (D-LL-015).
function badge(src, conf, lowMode) { return sampleBadge(designBadge(src, conf, lowMode)); }

// Row id → the breakdown field it edits (breakdown.edit_value). Numeric fields take the first number typed.
const FIELD = { key:'light.key_type', fill:'light.fill_kind', ratio:'light.ratio', hard:'light.key_hardness', prac:'light.practicals',
  focal:'lens.focal_mm', dof:'lens.dof', height:'lens.height_m', angle:'lens.angle', move:'lens.movement',
  size:'framing.size', pos:'framing.subject_pos', room:'framing.lead_room', aspect:'framing.aspect' };
const NUMERIC = new Set(['light.ratio', 'lens.focal_mm', 'lens.height_m']);
function typed(field, text) {
  if (!NUMERIC.has(field)) return text;
  const m = /-?\d+(\.\d+)?/.exec(text);
  return m ? parseFloat(m[0]) : text;
}

function designBadge(src, conf, lowMode) {
  if (src === 'manual') return { label:'MANUAL', border:'1px solid transparent', bg:'var(--bg3)', color:'var(--tx)' };
  if (src === 'measured') return { label:'MEASURED', border:'1px solid var(--line2)', bg:'transparent', color:'var(--tx2)' };
  if (src === 'sample') return { label:'SAMPLE', border:'1px dotted var(--tx3)', bg:'transparent', color:'var(--tx3)' };
  const low = lowMode && conf < 60;
  return { label:`AI ${conf}%`, border: low ? '1px dashed var(--warn)' : '1px dashed var(--tx3)', bg: low ? 'var(--warn-soft)' : 'transparent', color: low ? 'var(--warn)' : 'var(--tx2)' };
}

export class Breakdown extends DCLogic {
  state = { shot:2, sel:null, ov:{ thirds:true, light:true, palette:true }, open:{ colour:true, light:true, lens:true, framing:true, mood:true }, edits:{}, editing:null, q:'', answer:'', step:0, up:0, moods:['lonely','warm–cold tension','neo-noir'] };

  componentDidMount() { this.drive(); }
  componentDidUpdate(pp) { if (pp.bstate !== this.props.bstate) this.drive(); }
  componentWillUnmount() { clearInterval(this._i); }
  setB(b) { this.props.setBstate ? this.props.setBstate(b) : null; }
  drive() {
    clearInterval(this._i);
    const b = this.props.bstate;
    if (b === 'uploading') {
      this.setState({ up:0 });
      this._i = setInterval(() => {
        const up = Math.min(this.state.up + 12, 100);
        this.setState({ up });
        if (up >= 100) { clearInterval(this._i); this.setB('analysing'); }
      }, 180);
    } else if (b === 'analysing') {
      this.setState({ step:0 });
      this._i = setInterval(() => {
        const step = this.state.step + 1;
        const skip = !(this.props.aiOk ?? true) && STEPS[step - 1][1] !== 'T0';
        if (!skip && this.props.run) this.props.run(STEP_ACTIONS[step - 1], STEPS[step - 1][0], {}, { quiet:true });
        this.setState({ step });
        if (step >= STEPS.length) { clearInterval(this._i); this.setB('ready'); this.props.run && this.props.run('breakdown.analyse', 'Breakdown ready for Shot 12C'); }
      }, 750);
    }
  }

  rows(group, low) {
    const { edits, editing } = this.state;
    return ROWS[group].map(([id, label, val, src, conf]) => {
      const e = edits[id];
      const s = e !== undefined ? 'manual' : src;
      const v = e !== undefined ? e : val;
      const commit = ev => {
        const text = ev.target.value.trim();
        const changed = text && text !== val;
        this.setState(st => ({ editing:null, edits: changed ? { ...st.edits, [id]: text } : st.edits }));
        if (changed && FIELD[id] && this.props.run) this.props.run('breakdown.edit_value', `${label} set by hand`, { field: FIELD[id], value: typed(FIELD[id], text) });
        // Enter on an unchanged low-confidence value is a person confirming it (R5, T3).
        else if (!changed && low && conf < 60 && FIELD[id] && this.props.run) this.props.run('breakdown.review', `${label} confirmed`, { field: FIELD[id] });
      };
      return {
        label, val:v, b: badge(s, conf, low),
        vc: s === 'ai' ? 'var(--tx2)' : 'var(--tx)',
        editing: editing === id, idle: editing !== id,
        edit: () => this.setState({ editing:id }),
        commit, key: ev => { if (ev.key === 'Enter') ev.target.blur(); if (ev.key === 'Escape') this.setState({ editing:null }); },
      };
    });
  }

  renderVals() {
    const { shot, sel, ov, open, q, answer, step, up } = this.state;
    const b = this.props.bstate || 'ready';
    const aiOk = this.props.aiOk ?? true;
    const run = this.props.run || (() => {});
    const nav = this.props.nav || (() => {});
    const st = { empty:b==='empty', uploading:b==='uploading', analysing:b==='analysing', error:b==='error' };
    const hasData = b === 'ready' || b === 'low' || b === 'error';
    const isReady = b === 'ready' || b === 'low';
    const low = b === 'low';
    const dots = PAL.map(([hex, share, x, y], i) => ({ hex, share, x, y, ring: sel === i ? 'var(--acc)' : 'rgba(255,255,255,.9)', select: () => this.setState({ sel: sel === i ? null : i }) }));
    const az = -60 * Math.PI / 180, r = 54;
    const lx = 70 + r * Math.sin(az), ly = 70 + r * Math.cos(az) * -1 * -1;
    const dial = { lx: 70 + 50 * Math.sin(az), ly: 70 + 50 * Math.cos(az), ax: 70 + 12 * Math.sin(az), ay: 70 + 12 * Math.cos(az) };
    const secKeys = ['colour','light','lens','framing','mood'];
    const sec = {}; secKeys.forEach(k => sec[k] = { open: open[k], rot: open[k] ? 'none' : 'rotate(-90deg)', toggle: () => this.setState(s => ({ open: { ...s.open, [k]: !s.open[k] } })) });
    const ANSWERS = {
      "What's the exact colour scheme?": 'Six measured shades: #1B2230 38% and #3E4A52 22% carry the cold ambient; #C7803A 14% is the sodium key on the wall and skin; #6E5B4A 11% counter wood; #E9C9A0 9% skin highlight; #0D0F12 6% crushed shadow. Warm–cold split roughly 34:66.',
      'How many lights?': 'Two sources. A hard sodium key through the window, screen-left (≈2000 K, −60° az). A soft blue ambient fill (≈5600 K), about 3 stops under. No practicals in frame.',
    };
    const askFn = text => { if (!aiOk || !text) return; this.setState({ q:text }); Promise.resolve(run('breakdown.ask', 'Answered from the breakdown', { question:text })).then(r => r && this.setState({ answer: r.result.answer })); };
    return {
      badgeText: sampleBadgeText,
      refName: st.empty ? 'No reference' : 'ref_kitchen_night.mov · 7 shots · 2.39:1',
      isReady, st, showFrame: !st.empty && !st.uploading,
      isReadyOverlay: { thirds: isReady && ov.thirds, light: isReady && ov.light, palette: isReady && ov.palette },
      overlays: [['thirds','Thirds','breakdown.toggle_thirds'],['light','Light','breakdown.toggle_light'],['palette','Palette','breakdown.toggle_samples']].map(([k,label,cmd]) => ({ label, cmd, bg: ov[k] ? 'var(--bg3)' : 'transparent', color: ov[k] ? 'var(--tx)' : 'var(--tx3)', toggle: () => { run(cmd, label, { on: !ov[k] }, { quiet:true }); this.setState(s => ({ ov: { ...s.ov, [k]: !s.ov[k] } })); } })),
      replace: () => { this.setB('empty'); },
      upload: () => { run('breakdown.import_reference', 'Importing reference'); this.setB('uploading'); },
      upPct: up + '%', upText: `${Math.round(640 * up / 100)} MB of 640 MB · ${up}%`,
      steps: STEPS.map(([label, tier], i) => {
        const skip = !aiOk && tier === 'T2';
        return { label: skip ? label + ' (skipped, enter by hand)' : label, tier, mark: i < step ? (skip ? '–' : '✓') : i === step ? '…' : '·', color: i <= step ? 'var(--tx)' : 'var(--tx3)' };
      }),
      retry: () => { run('breakdown.fit_light', 'Retrying light analysis'); this.setB('analysing'); },
      skipToManual: () => { this.setB('ready'); this.setState({ editing:'key' }); },
      dots, hasSel: sel !== null, selDot: sel !== null ? dots[sel] : dots[0],
      shotLabel: `Shot ${shot + 1} of 7 · 00:01:${String(4 + shot * 4).padStart(2,'0')}:08`,
      thumbs: DURS.map((dur, i) => ({ n: '12' + 'ABCDEFG'[i], dur, go: () => this.setState({ shot:i }), bg: i === shot ? 'var(--bg3)' : 'var(--bg1)', border: i === shot ? 'var(--acc)' : 'var(--line)', color: i === shot ? 'var(--tx)' : 'var(--tx3)' })),
      scrub: `calc(${(shot + 0.5) / 7 * 100}% - 1px)`,
      prev: () => this.setState({ shot: Math.max(0, shot - 1) }), next: () => this.setState({ shot: Math.min(6, shot + 1) }),
      hasAnswer: !!answer && isReady, answer, closeAnswer: () => this.setState({ answer:'' }),
      q, onQ: e => this.setState({ q:e.target.value }), ask: e => { e.preventDefault(); askFn(q); },
      askDisabled: !aiOk || !isReady,
      askPlaceholder: aiOk ? 'Ask about this reference' : `Ask needs AI · ${this.props.aiMsg || 'unavailable'}`,
      chips: ["What's the exact colour scheme?", 'How many lights?'].map(label => ({ label, use: () => askFn(label) })),
      saveLook: () => run('breakdown.save_look', 'Look saved to Library'),
      adapt: () => { run('adapt.open', 'Adapt to our location', {}, { quiet:true }); nav('location'); },
      lowConf: low, aiBlocked: !aiOk, aiMsg: this.props.aiMsg || '', aiBtnColor: aiOk ? 'var(--tx)' : 'var(--tx3)',
      panelEmpty: !hasData, panelShow: hasData,
      sec,
      swatches: PAL.map(([hex, share], i) => ({ hex, share, rowBg: sel === i ? 'var(--bg3)' : 'transparent', select: () => this.setState({ sel: sel === i ? null : i, ov: { ...ov, palette:true } }) })),
      tints: [['Shadow','#1B2230','blue −6'],['Mid','#3E4A52','neutral'],['Highlight','#E9C9A0','warm +9']].map(([label,hex,val]) => ({ label, hex, val })),
      colourRows: [{ label:'Saturation', val:'38% (low)', b: badge('measured'), vc:'var(--tx)' }, { label:'Contrast', val:'9.2 stops', b: badge('measured'), vc:'var(--tx)' }],
      dial, azLabel:'−60° az', elLabel:'25° el',
      lightRows: this.rows('light', low), lensRows: this.rows('lens', low), framingRows: this.rows('framing', low),
      fitLight: () => { run('breakdown.fit_light', 'Light re-fitted to reference'); this.setState(s => { const e = { ...s.edits }; ['key','fill','prac'].forEach(k => delete e[k]); return { edits:e }; }); },
      editKey: () => this.setState({ editing:'key', open:{ ...open, light:true } }),
      moods: this.state.moods,
      addMood: () => { const m = window.prompt('Add a mood tag'); if (m) this.setState(s => ({ moods:[...s.moods, m] })); },
    };
  }
}

Breakdown.view = BreakdownView;
Breakdown.defaultProps = defaults;
