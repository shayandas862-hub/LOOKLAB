// @ts-nocheck: behaviour ported from design/Breakdown.dc.html; typed as each screen is wired to real actions.
// Owned code (D-LL-014). Since P2 the screen shows the engine's breakdown: every value renders with its own
// source (MEASURED, MANUAL or SAMPLE), a dropped file is decoded here and sent frame by frame through the
// registry, and a click on the frame sets the subject by hand (D-LL-028).
import React from 'react';
import { DCLogic } from '../runtime/dc';
import { BreakdownView, defaults } from '../views/Breakdown.view';
import { sampleBadge, sampleBadgeText } from '../runtime/badges';
import { setScreenMarker } from '../components/StatusLayer';
import { hashFile, mediaOf, openImage, openVideo, toBase64 } from '../runtime/media';

// Where the design drew its sample palette's dots (the sample swatches carry no position).
const SAMPLE_DOTS = [['22%','24%'],['82%','30%'],['27%','52%'],['44%','80%'],['36%','38%'],['92%','86%']];
const SAMPLE_TINT_HEX = { shadow:'#1B2230', mid:'#3E4A52', highlight:'#E9C9A0' };
/** The design's frame box is 2.39:1; a frame of another shape sits inside it, letterboxed. */
const BOX_ASPECT = 2.39;

const STEPS = [['Shots detected','T0'],['Colour','T0'],['Light','T0'],['Lens','T2'],['Framing','T1'],['Mood','T2']];
const STEP_ACTIONS = ['breakdown.detect_shots','breakdown.sample_palette','breakdown.fit_light','breakdown.fit_lens','breakdown.fit_framing','breakdown.fit_mood'];
const STEP_NOTE = ['', '', 'sample until P3', 'sample until P3/P4', 'aspect measured, subject by hand', 'sample until P4'];

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

const RANK = { measured:0, manual:1, ai:2, sample:3 };
const weakest = vals => vals.reduce((w, v) => (RANK[v.source] > RANK[w] ? v.source : w), 'measured');
const minus = n => (n < 0 ? `−${Math.abs(n)}` : `${n}`);

/** The value's own badge. Sample values always read SAMPLE (D-LL-015); nothing here is AI until P4. */
function badge(src, conf, lowMode) {
  return src === 'sample' ? sampleBadge(designBadge(src, conf, lowMode)) : designBadge(src, conf, lowMode);
}

function designBadge(src, conf, lowMode) {
  if (src === 'manual') return { label:'MANUAL', border:'1px solid transparent', bg:'var(--bg3)', color:'var(--tx)' };
  if (src === 'measured') return { label:'MEASURED', border:'1px solid var(--line2)', bg:'transparent', color:'var(--tx2)' };
  if (src === 'sample') return { label:'SAMPLE', border:'1px dotted var(--tx3)', bg:'transparent', color:'var(--tx3)' };
  const low = lowMode && conf < 60;
  return { label:`AI ${conf}%`, border: low ? '1px dashed var(--warn)' : '1px dashed var(--tx3)', bg: low ? 'var(--warn-soft)' : 'transparent', color: low ? 'var(--warn)' : 'var(--tx2)' };
}

const satBand = v => (v < 25 ? 'low' : v <= 50 ? 'medium' : 'high');
const clock = s => { const m = Math.floor(s / 60); return `${String(m).padStart(2,'0')}:${(s - m * 60).toFixed(1).padStart(4,'0')}`; };
const mb = n => (n / 1e6).toFixed(n < 1e7 ? 1 : 0);

/** Rows of the light, lens and framing sections, from the breakdown record: [id, label, text, leaves]. */
function rowSpecs(b) {
  const L = b.light, N = b.lens, F = b.framing;
  const ratio = Number(L.ratio.value);
  return {
    light: [
      ['key', 'Key', `${L.key_hardness.value} · ${L.key_kelvin.value} K ${L.key_type.value}`, [L.key_hardness, L.key_kelvin, L.key_type]],
      ['fill', 'Fill', `${L.fill_kelvin.value} K ${L.fill_kind.value}`, [L.fill_kelvin, L.fill_kind]],
      ['ratio', 'Key:fill', ratio > 0 ? `${ratio}:1 (${Math.round(Math.log2(ratio) * 10) / 10} stops)` : String(L.ratio.value), [L.ratio]],
      ['hard', 'Hardness', String(L.key_hardness.value), [L.key_hardness]],
      ['prac', 'Practicals', String(L.practicals.value), [L.practicals]],
    ],
    lens: [
      ['focal', 'Focal length', `≈${N.focal_mm.value} mm`, [N.focal_mm]],
      ['dof', 'Depth of field', String(N.dof.value), [N.dof]],
      ['height', 'Camera height', `${N.height_m.value} m`, [N.height_m]],
      ['angle', 'Angle', String(N.angle.value), [N.angle]],
      ['move', 'Movement', String(N.movement.value), [N.movement]],
    ],
    framing: [
      ['size', 'Shot size', String(F.size.value), [F.size]],
      ['pos', 'Subject', String(F.subject_pos.value), [F.subject_pos]],
      ['room', 'Lead room', String(F.lead_room.value), [F.lead_room]],
      ['aspect', 'Aspect', String(F.aspect.value), [F.aspect]],
    ],
  };
}

export class Breakdown extends DCLogic {
  state = { sel:null, ov:{ thirds:true, light:true, palette:true }, open:{ colour:true, light:true, lens:true, framing:true, mood:true },
    editing:null, q:'', answer:'', step:0, up:0, upText:'', importName:'', err:null, sampleShot:2, moods:null,
    b:null, ref:null, frame:null };

  componentDidMount() {
    this._over = e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); };
    this._drop = e => {
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f) return;
      e.preventDefault();
      this.importFile(f);
    };
    document.addEventListener('dragover', this._over);
    document.addEventListener('drop', this._drop);
    this.load();
  }
  componentWillUnmount() {
    this._gone = true;
    document.removeEventListener('dragover', this._over);
    document.removeEventListener('drop', this._drop);
  }
  setB(b) { this.props.setBstate ? this.props.setBstate(b) : null; }
  run(cmd, text, input, opts) { return this.props.run ? this.props.run(cmd, text, input, opts) : Promise.resolve(null); }

  /** The breakdown, its reference and the measured frame, as the engine has them. */
  async load() {
    const r = await this.run('breakdown.get', '', {}, { quiet:true });
    if (!r || this._gone) return;
    const b = r.result;
    let ref = null, frame = null;
    if (b.reference_id) {
      const rr = await this.run('breakdown.get_reference', '', { reference_id: b.reference_id }, { quiet:true });
      ref = rr && rr.result;
    }
    if (ref && !ref.sample && b.frame_index !== null) {
      const f = await this.run('breakdown.get_frame', '', { reference_id: ref.id, index: b.frame_index }, { quiet:true });
      if (f) frame = { src: 'data:image/png;base64,' + f.result.png_base64, width: f.result.width, height: f.result.height, index: f.result.index };
    }
    if (this._gone) return;
    this.setState({ b, ref, frame, moods:null });
    setScreenMarker('breakdown', this.measured(b) ? 'SAMPLE: light, lens and mood (until P3/P4) · colour, tone and aspect measured' : null);
  }

  measured(b) { return !!b && b.palette.length > 0 && b.palette.every(p => p.share.source === 'measured'); }

  pick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = () => input.files && input.files[0] && this.importFile(input.files[0]);
    input.click();
  }

  /** Hash → open → import_reference → add_frame × n → detect shots → analyse → the other steps. */
  async importFile(file) {
    if (this._busy) return;
    this._busy = true;
    this._last = file;
    let stage = 'Reading';
    const fail = (title, body) => { this.setState({ err:{ title, body, meta:`${file.name} · ${new Date().toLocaleTimeString()}` } }); this.setB('error'); };
    try {
      const media = mediaOf(file);
      if (!media) return fail('Not an image or a video', `${file.name} is not something Chrome can open as an image or a video. Nothing was imported.`);
      this.setState({ importName:file.name, up:0, upText:'Hashing the file', err:null });
      this.setB('uploading');
      const sha = await hashFile(file, (d, t) => this.setState({ up: Math.round(30 * d / t), upText:`Hashing ${mb(d)} of ${mb(t)} MB` }));
      stage = 'Decoding';
      const src = media === 'image' ? await openImage(file) : await openVideo(file);
      try {
        stage = 'Import';
        const imp = await this.run('breakdown.import_reference', 'Reference imported', {
          file_name: file.name, media, mime: file.type || (media === 'image' ? 'image/png' : 'video/mp4'), size_bytes: file.size, sha256: sha,
          last_modified: file.lastModified ? new Date(file.lastModified).toISOString() : null,
          width: src.width, height: src.height, duration_s: src.duration_s, sample_fps: src.fps, frame_count: src.count,
        }, { quiet:true });
        if (!imp) throw new Error('The engine refused the import (see the message above).');
        stage = 'Frames';
        for (let i = 0; i < src.count; i++) {
          const ok = await this.run('breakdown.add_frame', '', { reference_id: imp.result.reference_id, index: i, png_base64: await toBase64(await src.frame(i)) }, { quiet:true });
          if (!ok) throw new Error(`Frame ${i + 1} of ${src.count} was refused.`);
          this.setState({ up: 30 + Math.round(70 * (i + 1) / src.count), upText:`Frame ${i + 1} of ${src.count}${src.fps ? ` · ${clock(i / src.fps)}` : ''}` });
        }
      } finally {
        src.close();
      }
      stage = 'Shots';
      this.setState({ step:0 });
      this.setB('analysing');
      await this.runSteps(file.name);
      await this.load();
      this.setB('ready');
    } catch (e) {
      fail(`Import stopped at “${stage}”`, `${e.message} Frames already sent stay with the reference; importing the file again replaces them.`);
    } finally {
      this._busy = false;
    }
  }

  /** The design's steps in order, then breakdown.analyse measures tone and aspect and saves the breakdown. */
  async runSteps(name) {
    const aiOk = this.props.aiOk ?? true;
    for (let k = 0; k < STEPS.length; k++) {
      const skip = !aiOk && STEPS[k][1] !== 'T0';
      if (!skip) {
        const r = await this.run(STEP_ACTIONS[k], STEPS[k][0], {}, { quiet:true });
        if (!r && k < 2) throw new Error(`${STEP_ACTIONS[k]} failed.`);
      }
      this.setState({ step:k + 1 });
    }
    if (!(await this.run('breakdown.analyse', `Measured ${name}`))) throw new Error('breakdown.analyse failed.');
  }

  /** Re-measures on another reference shot's key frame. */
  async analyseAt(index) {
    const r = await this.run('breakdown.analyse', 'Measured this shot', { frame_index:index });
    if (r) await this.load();
  }

  async setSubject(x, y) {
    const r = await this.run('breakdown.set_subject', 'Subject set by hand', { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 }, { quiet:true });
    if (r) await this.load();
  }

  /** A point on the frame (0–1) → a position in the design's 2.39:1 box, as CSS percentages. */
  boxPos(at) {
    const f = this.state.frame;
    if (!f) return { x:`${at.x * 100}%`, y:`${at.y * 100}%` };
    const a = f.width / f.height;
    const fw = a < BOX_ASPECT ? a / BOX_ASPECT : 1, fh = a < BOX_ASPECT ? 1 : BOX_ASPECT / a;
    return { x:`${((1 - fw) / 2 + at.x * fw) * 100}%`, y:`${((1 - fh) / 2 + at.y * fh) * 100}%` };
  }

  rows(group, low) {
    const { editing, b } = this.state;
    return rowSpecs(b)[group].map(([id, label, val, leaves]) => {
      const src = weakest(leaves);
      const conf = leaves[0].confidence;
      const commit = ev => {
        const text = ev.target.value.trim();
        const changed = text && text !== val;
        this.setState({ editing:null });
        if (changed && FIELD[id]) this.run('breakdown.edit_value', `${label} set by hand`, { field: FIELD[id], value: typed(FIELD[id], text) }).then(r => r && this.load());
        // Enter on an unchanged low-confidence AI value is a person confirming it (R5, T3).
        else if (!changed && src === 'ai' && conf < 60 && FIELD[id]) this.run('breakdown.review', `${label} confirmed`, { field: FIELD[id] });
      };
      return {
        label, val, b: badge(src, conf, low),
        vc: src === 'ai' ? 'var(--tx2)' : 'var(--tx)',
        editing: editing === id, idle: editing !== id,
        edit: () => this.setState({ editing:id }),
        commit, key: ev => { if (ev.key === 'Enter') ev.target.blur(); if (ev.key === 'Escape') this.setState({ editing:null }); },
      };
    });
  }

  renderVals() {
    const { sel, ov, open, q, answer, step, up, b, ref, frame, err } = this.state;
    const bs = this.props.bstate || 'ready';
    const aiOk = this.props.aiOk ?? true;
    const run = (cmd, text, input, opts) => this.run(cmd, text, input, opts);
    const nav = this.props.nav || (() => {});
    const st = { empty:bs==='empty', uploading:bs==='uploading', analysing:bs==='analysing', error:bs==='error' };
    const hasData = (bs === 'ready' || bs === 'low' || bs === 'error') && !!b;
    const isReady = (bs === 'ready' || bs === 'low') && !!b;
    const low = bs === 'low';
    const real = this.measured(b);
    const palette = b ? b.palette : [];
    const dots = palette.map((p, i) => {
      const pos = p.at ? this.boxPos(p.at) : { x:(SAMPLE_DOTS[i] || SAMPLE_DOTS[0])[0], y:(SAMPLE_DOTS[i] || SAMPLE_DOTS[0])[1] };
      return { hex:p.hex, share:p.share.value, x:pos.x, y:pos.y, ring: sel === i ? 'var(--acc)' : 'rgba(255,255,255,.9)', select: () => this.setState({ sel: sel === i ? null : i }) };
    });
    const L = b ? b.light : null;
    const az = L ? Number(L.key_az.value) * Math.PI / 180 : 0;
    const dial = { lx: 70 + 50 * Math.sin(az), ly: 70 + 50 * Math.cos(az), ax: 70 + 12 * Math.sin(az), ay: 70 + 12 * Math.cos(az) };
    const lightTag = L && weakest([L.key_az, L.key_el, L.key_kelvin]) === 'sample' ? ' · SAMPLE' : '';
    const secKeys = ['colour','light','lens','framing','mood'];
    const sec = {}; secKeys.forEach(k => sec[k] = { open: open[k], rot: open[k] ? 'none' : 'rotate(-90deg)', toggle: () => this.setState(s => ({ open: { ...s.open, [k]: !s.open[k] } })) });
    const askFn = text => { if (!aiOk || !text) return; this.setState({ q:text }); Promise.resolve(run('breakdown.ask', 'Answered from the breakdown', { question:text })).then(r => r && this.setState({ answer: r.result.answer })); };

    // Reference shots: detected ones for an imported reference, the design's seven for the sample.
    const shots = ref ? ref.shots : [];
    const cur = ref && !ref.sample && b && b.frame_index !== null
      ? Math.max(0, shots.findIndex(s => s.first !== undefined && b.frame_index >= s.first && b.frame_index <= s.last))
      : this.state.sampleShot;
    const goShot = i => {
      const s = shots[i];
      if (!s) return;
      if (ref && !ref.sample && s.key_frame !== undefined) this.analyseAt(s.key_frame);
      else this.setState({ sampleShot:i });
    };
    const shotAt = shots[cur];
    const T = b ? b.tints : null;
    const tintHex = (b && b.tint_hex) || SAMPLE_TINT_HEX;
    const sat = b ? b.saturation : null;
    const con = b ? b.contrast_stops : null;
    const paletteLabel = real ? 'MEASURED' : 'SAMPLE';

    return {
      badgeText: (label) => label === 'MEASURED' ? paletteLabel : sampleBadgeText(label),
      refName: st.empty || !ref ? 'No reference' : `${ref.file_name} · ${shots.length} ${shots.length === 1 ? 'shot' : 'shots'}${ref.aspect ? ` · ${ref.aspect}` : ''}`,
      isReady, st, showFrame: !st.empty && !st.uploading,
      isReadyOverlay: { thirds: isReady && ov.thirds && !frame, light: isReady && ov.light, palette: isReady && ov.palette },
      slotProps: id => (id === 'ref-12c' && frame ? {
        src: frame.src, grid: isReady && ov.thirds, marker: b && b.subject, title: 'Click the subject to set its position (breakdown.set_subject)',
        onPoint: (x, y) => this.setSubject(x, y),
      } : {}),
      overlays: [['thirds','Thirds','breakdown.toggle_thirds'],['light','Light','breakdown.toggle_light'],['palette','Palette','breakdown.toggle_samples']].map(([k,label,cmd]) => ({ label, cmd, bg: ov[k] ? 'var(--bg3)' : 'transparent', color: ov[k] ? 'var(--tx)' : 'var(--tx3)', toggle: () => { run(cmd, label, { on: !ov[k] }, { quiet:true }); this.setState(s => ({ ov: { ...s.ov, [k]: !s.ov[k] } })); } })),
      replace: () => { this.setB('empty'); },
      upload: () => this.pick(),
      dropHint: 'MP4, WebM, MOV (H.264), JPG, PNG, WebP. Chrome decodes it here; the file is not copied or uploaded.',
      importTitle: `Importing ${this.state.importName || 'reference'}`,
      importNote: 'Reading frames in this browser: 2 per second, 512 px. The file is not copied; nothing leaves this computer.',
      upPct: up + '%', upText: this.state.upText,
      steps: STEPS.map(([label, tier], i) => {
        const skip = !aiOk && tier !== 'T0';
        const note = skip ? 'skipped, enter by hand' : STEP_NOTE[i];
        return { label: note ? `${label} (${note})` : label, tier, mark: i < step ? (skip ? '–' : '✓') : i === step ? '…' : '·', color: i <= step ? 'var(--tx)' : 'var(--tx3)' };
      }),
      errTitle: err ? err.title : undefined, errBody: err ? err.body : undefined, errMeta: err ? err.meta : undefined,
      errManual: err ? 'Enter values by hand' : undefined,
      retry: () => { if (this._last) this.importFile(this._last); else this.setB('empty'); },
      skipToManual: () => { this.setB('ready'); this.setState({ editing:'key' }); },
      dots, hasSel: sel !== null && !!dots[sel], selDot: (sel !== null && dots[sel]) || dots[0] || { x:'0', y:'0', hex:'', share:'' },
      shotLabel: shotAt ? `Shot ${cur + 1} of ${shots.length} · ${clock(shotAt.in_s)}` : 'No shots',
      thumbs: shots.map((s, i) => ({ n: s.code, dur: `${Math.max(0, s.out_s - s.in_s).toFixed(1)}s`, go: () => goShot(i), bg: i === cur ? 'var(--bg3)' : 'var(--bg1)', border: i === cur ? 'var(--acc)' : 'var(--line)', color: i === cur ? 'var(--tx)' : 'var(--tx3)' })),
      scrub: `calc(${((cur % 7) + 0.5) / 7 * 100}% - 1px)`,
      prev: () => goShot(Math.max(0, cur - 1)), next: () => goShot(Math.min(shots.length - 1, cur + 1)),
      hasAnswer: !!answer && isReady, answer, closeAnswer: () => this.setState({ answer:'' }),
      q, onQ: e => this.setState({ q:e.target.value }), ask: e => { e.preventDefault(); askFn(q); },
      askDisabled: !aiOk || !isReady,
      askPlaceholder: aiOk ? 'Ask about this reference' : `Ask needs AI · ${this.props.aiMsg || 'unavailable'}`,
      chips: ["What's the exact colour scheme?", 'How many lights?'].map(label => ({ label, use: () => askFn(label) })),
      saveLook: () => run('breakdown.save_look', real ? 'Look saved to Library (palette measured; light and mood sample)' : 'Look saved to Library (sample)'),
      adapt: () => { run('adapt.open', 'Adapt to our location', {}, { quiet:true }); nav('location'); },
      lowConf: low, aiBlocked: !aiOk, aiMsg: this.props.aiMsg || '', aiBtnColor: aiOk ? 'var(--tx)' : 'var(--tx3)',
      panelEmpty: !hasData, panelShow: hasData,
      sec,
      paletteCount: `${palette.length} ${palette.length === 1 ? 'colour' : 'colours'}`,
      swatches: palette.map((p, i) => ({ hex:p.hex, share:p.share.value, rowBg: sel === i ? 'var(--bg3)' : 'transparent', select: () => this.setState({ sel: sel === i ? null : i, ov: { ...ov, palette:true } }) })),
      tints: T ? [['Shadow','shadow'],['Mid','mid'],['Highlight','highlight']].map(([label, k]) => ({ label, hex: tintHex[k] || 'transparent', val: T[k].value })) : [],
      colourRows: b ? [
        { label:'Saturation', val:`${sat.value}% (${satBand(sat.value)})`, b: badge(sat.source), vc:'var(--tx)' },
        { label:'Contrast', val:`${con.value} stops`, b: badge(con.source), vc:'var(--tx)' },
      ] : [],
      dial, azLabel: L ? `${minus(L.key_az.value)}° az` : '', elLabel: L ? `${L.key_el.value}° el` : '',
      keyOverlay: L ? `Key ${minus(L.key_az.value)}° az · ${L.key_el.value}° el · ${L.key_kelvin.value} K${lightTag}` : undefined,
      lightRows: b ? this.rows('light', low) : [], lensRows: b ? this.rows('lens', low) : [], framingRows: b ? this.rows('framing', low) : [],
      fitLight: () => { run('breakdown.fit_light', 'Light re-fitted to reference'); },
      editKey: () => this.setState({ editing:'key', open:{ ...open, light:true } }),
      moods: this.state.moods || (b ? b.mood.value : []),
      addMood: () => { const m = window.prompt('Add a mood tag'); if (m) this.setState(s => ({ moods:[...(s.moods || (b ? b.mood.value : [])), m] })); },
    };
  }
}

Breakdown.view = BreakdownView;
Breakdown.defaultProps = defaults;
