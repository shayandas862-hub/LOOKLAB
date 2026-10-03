// @ts-nocheck: behaviour ported from design/Breakdown.dc.html; typed as each screen is wired to real actions.
// Owned code (D-LL-014). Since P2 the screen shows the engine's breakdown: every value renders with its own
// source (MEASURED, MANUAL or SAMPLE), a dropped file is decoded here and sent frame by frame through the
// registry, and a click on the frame sets the subject by hand (D-LL-028).
import React from 'react';
import { DCLogic } from '../runtime/dc';
import { BreakdownView, defaults } from '../views/Breakdown.view';
import { sampleBadgeText } from '../runtime/badges';
import { setScreenMarker } from '../components/StatusLayer';
import { FIELD, SAMPLE_DOTS, SAMPLE_TINT_HEX, aiLabel, badge, boxPos as boxPosIn, clock, markerText, minus, reviewQueue, reviewState, rowSpecs, satBand, typed, weakest } from './Breakdown.rows';
import { moodBadgeText, reviewBodyFor } from './Breakdown.review';
import { BY_HAND, STEPS, STEP_ACTIONS, STEP_NOTE, importReference, pickReference } from './Breakdown.import';

export class Breakdown extends DCLogic {
  state = { sel:null, ov:{ thirds:true, light:true, palette:true }, open:{ colour:true, light:true, lens:true, framing:true, mood:true },
    editing:null, q:'', answer:'', answerConf:null, step:0, up:0, upText:'', importName:'', err:null, sampleShot:2, moods:null,
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
    setScreenMarker('breakdown', this.measured(b) ? markerText(b) : null);
  }

  measured(b) { return !!b && b.palette.length > 0 && b.palette.every(p => p.share.source === 'measured'); }
  pick() { pickReference(this); }

  importFile(file) { return importReference(this, file); }

  /** Re-measures on another reference shot's key frame. */
  async analyseAt(index) {
    const r = await this.run('breakdown.analyse', 'Measured this shot', { frame_index:index });
    if (r) await this.load();
  }

  async setSubject(x, y) {
    const r = await this.run('breakdown.set_subject', 'Subject set by hand', { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 }, { quiet:true });
    if (r) await this.load();
  }

  /** A drag on the frame marks the face (D-LL-033); the engine checks the box and says why when it refuses it. */
  async setFace(box) {
    const r4 = v => Math.round(v * 10000) / 10000;
    const r = await this.run('breakdown.set_face', 'Face marked by hand', { x: r4(box.x), y: r4(box.y), w: r4(box.w), h: r4(box.h) }, { quiet:true });
    // The face box names the shot size by R2 (T0, D-LL-046); a size set by hand is kept by the engine.
    if (r) await this.run('breakdown.fit_framing', 'Shot size from the face box (estimate)', {}, { quiet:true });
    if (r) await this.load();
  }

  async fitLight() {
    const r = await this.run('breakdown.fit_light', 'Light fitted to the marked face (estimate)');
    if (r) await this.load();
  }
  /** The design typed "MEASURED" (palette), "AI 70%" (mood) and "AI 78%" (Ask's answer); each follows its own record. */
  typedBadge(label, paletteLabel, b) {
    if (label === 'MEASURED') return paletteLabel;
    if (label === 'AI 70%') return moodBadgeText(b);
    if (label === 'AI 78%' && this.state.answerConf !== null) return aiLabel(this.state.answerConf, '');
    return null;
  }
  /** A point on the frame (0–1) → a position in the design's 2.39:1 box, as CSS percentages. */
  boxPos(at) { return boxPosIn(this.state.frame, at); }

  rows(group) {
    const { editing, b } = this.state;
    return rowSpecs(b)[group].map(([id, label, val, leaves]) => {
      const src = weakest(leaves);
      const conf = leaves[0].confidence;
      const review = reviewState(leaves[0], FIELD[id], b.reviewed);
      const commit = ev => {
        const text = ev.target.value.trim();
        const changed = text && text !== val;
        this.setState({ editing:null });
        if (changed && FIELD[id]) this.run('breakdown.edit_value', `${label} set by hand`, { field: FIELD[id], value: typed(FIELD[id], text) }).then(r => r && this.load());
        // Enter on an unchanged low-confidence AI value is a person confirming it (R5, T3).
        else if (!changed && review === 'low' && FIELD[id]) this.run('breakdown.review', `${label} confirmed`, { field: FIELD[id] }).then(r => r && this.load());
      };
      return {
        label, val, b: badge(src, conf, review),
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
    const lightSrc = L ? weakest([L.key_az, L.key_el, L.key_kelvin]) : null;
    const lightTag = lightSrc === 'sample' ? ' · SAMPLE' : lightSrc === 'estimate' ? ' · ESTIMATE' : '';
    const secKeys = ['colour','light','lens','framing','mood'];
    const sec = {}; secKeys.forEach(k => sec[k] = { open: open[k], rot: open[k] ? 'none' : 'rotate(-90deg)', toggle: () => this.setState(s => ({ open: { ...s.open, [k]: !s.open[k] } })) });
    const askFn = text => { if (!aiOk || !real || !text) return; this.setState({ q:text }); Promise.resolve(run('breakdown.ask', 'Answered from the breakdown (AI)', { question:text })).then(r => r && this.setState({ answer: r.result.answer, answerConf: r.result.confidence })); };
    const queue = reviewQueue(b);
    const confirm = item => run('breakdown.review', `${item.label} confirmed`, { field: item.field }).then(r => r && this.load());

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
      // Typed design badges: the palette's, the mood's and Ask's answer follow their own record (D-LL-042); the rest read SAMPLE.
      badgeText: (label) => this.typedBadge(label, paletteLabel, b) ?? sampleBadgeText(label),
      refName: st.empty || !ref ? 'No reference' : `${ref.file_name} · ${shots.length} ${shots.length === 1 ? 'shot' : 'shots'}${ref.aspect ? ` · ${ref.aspect}` : ''}`,
      isReady, st, showFrame: !st.empty && !st.uploading,
      isReadyOverlay: { thirds: isReady && ov.thirds && !frame, light: isReady && ov.light, palette: isReady && ov.palette },
      slotProps: id => (id === 'ref-12c' && frame ? {
        src: frame.src, grid: isReady && ov.thirds, marker: b && b.subject,
        title: 'Click the subject to set its position. Drag a box around the face, hairline to chin and cheek to cheek, to fit the light.',
        onPoint: (x, y) => this.setSubject(x, y),
        box: b && b.face && b.face.frame_index === b.frame_index ? b.face : null,
        onBox: box => this.setFace(box),
      } : {}),
      overlays: [['thirds','Thirds','breakdown.toggle_thirds'],['light','Light','breakdown.toggle_light'],['palette','Palette','breakdown.toggle_samples']].map(([k,label,cmd]) => ({ label, cmd, bg: ov[k] ? 'var(--bg3)' : 'transparent', color: ov[k] ? 'var(--tx)' : 'var(--tx3)', toggle: () => { run(cmd, label, { on: !ov[k] }, { quiet:true }); this.setState(s => ({ ov: { ...s.ov, [k]: !s.ov[k] } })); } })),
      replace: () => { this.setB('empty'); },
      upload: () => this.pick(),
      dropHint: 'Photos: JPG, PNG, HEIC, TIFF, WebP, camera RAW. Videos: MP4, MOV, WebM (H.264). Read on this Mac; nothing is uploaded.',
      importTitle: `Importing ${this.state.importName || 'reference'}`,
      importNote: 'Reading frames in this browser: 2 per second, 512 px. The file is not copied; nothing leaves this computer.',
      upPct: up + '%', upText: this.state.upText,
      steps: STEPS.map(([label, tier], i) => {
        const manual = BY_HAND.has(STEP_ACTIONS[i]);
        const skip = manual || (!aiOk && tier !== 'T0');
        const note = skip && !manual ? 'skipped, enter by hand' : STEP_NOTE[i];
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
      askDisabled: !aiOk || !isReady || !real,
      askPlaceholder: !aiOk ? `Ask needs AI · ${this.props.aiMsg || 'unavailable'}` : !real ? 'Ask needs a measured reference: import one first' : 'Ask about this reference',
      chips: ["What's the exact colour scheme?", 'How many lights?'].map(label => ({ label, use: () => askFn(label) })),
      saveLook: () => run('breakdown.save_look', real ? 'Look saved to Library (palette measured; light and mood sample)' : 'Look saved to Library (sample)'),
      adapt: () => { run('adapt.open', 'Adapt to our location', {}, { quiet:true }); nav('location'); },
      lowConf: low || (hasData && queue.length > 0), aiBlocked: !aiOk, aiMsg: this.props.aiMsg || '',
      reviewTitle: queue.length ? `${queue.length} ${queue.length === 1 ? 'value needs' : 'values need'} review` : undefined,
      reviewBody: queue.length ? reviewBodyFor(queue, confirm) : undefined,
      // Fit light is a T0 instrument (P3): it works with no AI, so it follows the frame, not the AI state. The design's
      // aiBtnColor colours only this button.
      fitLightLabel: 'Fit light', fitLightDisabled: !isReady, aiBtnColor: isReady ? 'var(--tx)' : 'var(--tx3)',
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
      lightRows: b ? this.rows('light') : [], lensRows: b ? this.rows('lens') : [], framingRows: b ? this.rows('framing') : [],
      fitLight: () => this.fitLight(),
      editKey: () => this.setState({ editing:'key', open:{ ...open, light:true } }),
      moods: this.state.moods || (b ? b.mood.value : []),
      // A mood tag typed by hand is saved (source manual, D-LL-049); sample words are replaced, never promoted to manual.
      addMood: () => {
        const m = window.prompt('Add a mood tag');
        if (!m || !b) return;
        const words = [...(b.mood.source === 'sample' ? [] : b.mood.value), m];
        run('breakdown.edit_value', 'Mood set by hand', { field:'mood', value: words.join(', ') }).then(r => r && this.load());
      },
    };
  }
}

Breakdown.view = BreakdownView;
Breakdown.defaultProps = defaults;
