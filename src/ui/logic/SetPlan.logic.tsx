// @ts-nocheck: behaviour ported from design/SetPlan.dc.html; typed as each screen is wired to real actions.
// Owned code (D-LL-014): the port wrote this once and will not overwrite it.
import React from 'react';
import { DCLogic } from '../runtime/dc';
import { SetPlanView, defaults } from '../views/SetPlan.view';
import { sampleBadge } from '../runtime/badges';

const S0 = { x:1.5, y:2.9, face:1.45 };
const INIT = {
  key:{ x:4.5, y:1.5, z:2.9, power:80, kelvin:2150 },
  fill:{ x:1.6, y:2.2, z:2.8, power:10, kelvin:5600 },
  prac:{ x:2.65, y:2.55, z:2.2, power:0, kelvin:2700 },
  cam:{ x:1.72, y:1.11, z:1.2 },
  rhea:{ x:1.5, y:2.9 }, arjun:{ x:0.6, y:2.3 },
};
const META = {
  key:{ label:'Key · window COB', group:'LIGHTS', glyph:'K', type:'light' },
  fill:{ label:'Fill · tube bounce', group:'LIGHTS', glyph:'F', type:'light' },
  prac:{ label:'Practical · pendant', group:'LIGHTS', glyph:'P', type:'light' },
  cam:{ label:'Cam A · 35 mm', group:'CAMERA', glyph:'A', type:'cam' },
  rhea:{ label:'Rhea · mark 1', group:'ACTORS', glyph:'R', type:'actor' },
  arjun:{ label:'Arjun · mark 2', group:'ACTORS', glyph:'J', type:'actor' },
};
const PX = v => (v + 0.3) * 100;
const deg = r => r * 180 / Math.PI, rad = d => d * Math.PI / 180;
const MEAS = sampleBadge({ label:'MEASURED', border:'1px solid var(--line2)', bg:'transparent', color:'var(--tx2)' });
const MAN = { label:'MANUAL', border:'1px solid transparent', bg:'var(--bg3)', color:'var(--tx)' };
const AIB = sampleBadge({ label:'AI 80%', border:'1px dashed var(--tx3)', bg:'transparent', color:'var(--tx2)' });

function solve(o) {
  const S = { x:o.rhea.x, y:o.rhea.y };
  const L = o.key, C = o.cam;
  const cx = C.x - S.x, cy = C.y - S.y, lx = L.x - S.x, ly = L.y - S.y;
  const az = -deg(Math.atan2(cx * ly - cy * lx, cx * lx + cy * ly));
  const horiz = Math.hypot(lx, ly);
  const el = deg(Math.atan2(L.z - S0.face, horiz));
  const dist = Math.hypot(horiz, L.z - S0.face);
  const f = (L.power / 80) * Math.pow(3.614 / dist, 2);
  const ratio = 7.4 * f;
  const expo = Math.log2(f) - 0.3;
  const score = Math.max(0, Math.min(100, Math.round(100 - 0.8 * Math.abs(az + 60) - 0.8 * Math.abs(el - 25) - 25 * Math.abs(Math.log2(ratio / 8)) - Math.abs(L.kelvin - 2000) / 40 - 13 * Math.abs(expo))));
  return { az, el, dist, ratio, expo, score, S, cAng: Math.atan2(cy, cx) };
}
function wedge(ox, oy, ang, spread, len) {
  const a1 = ang - rad(spread / 2), a2 = ang + rad(spread / 2);
  const p = (a) => `${PX(ox + len * Math.cos(a))} ${PX(oy + len * Math.sin(a))}`;
  return `M${PX(ox)} ${PX(oy)} L${p(a1)} A${len * 100} ${len * 100} 0 0 1 ${p(a2)} Z`;
}

export class SetPlan extends DCLogic {
  state = { o: JSON.parse(JSON.stringify(INIT)), sel:'key', view:'3d', hist:[], manual:{}, drag:null, extra:0 };
  worldRef = React.createRef();
  push() { this.setState(s => ({ hist:[...s.hist.slice(-20), JSON.parse(JSON.stringify(s.o))] })); }
  setVal(id, k, v) {
    this.setState(s => ({ o:{ ...s.o, [id]:{ ...s.o[id], [k]:v } }, manual:{ ...s.manual, [id + '.' + k]:true } }));
    const run = this.props.run; if (!run) return;
    const p = { ...this.state.o[id], [k]:v };
    if (k === 'x' || k === 'y' || k === 'z') run('plan.move_object', 'Moved', { id, x:p.x, y:p.y, ...(p.z === undefined ? {} : { z:p.z }) }, { quiet:true });
    else run('plan.set_property', 'Set', { id, field:k, value:v }, { quiet:true });
  }

  renderVals() {
    const { o, sel, view, hist, manual, drag } = this.state;
    const run = this.props.run || (() => {});
    const nav = this.props.nav || (() => {});
    const r = solve(o);
    const base = solve(INIT).score;
    const is3d = view === '3d', isTop = view === 'top';
    const bill = h => is3d ? `translateZ(${h}px) rotateZ(35deg) rotateX(-60deg)` : 'none';
    const objs = Object.keys(META).map(id => {
      const m = META[id], p = o[id], selected = sel === id;
      const isLight = m.type === 'light';
      const off = id === 'prac' && p.power === 0;
      return {
        label: m.label, glyph: m.glyph, left: PX(p.x) + 'px', top: PX(p.y) + 'px',
        tf: bill(isLight ? p.z * 60 : m.type === 'cam' ? p.z * 60 : 0),
        r: m.type === 'actor' ? '11px' : m.type === 'cam' ? '4px' : '6px',
        fill: off ? 'var(--bg3)' : isLight ? '#EDEDED' : m.type === 'cam' ? 'var(--tx2)' : 'var(--bg3)',
        ring: selected ? 'var(--acc)' : 'var(--line2)',
        labelColor: selected ? 'var(--tx)' : 'var(--tx2)',
        cursor: isTop ? 'grab' : 'pointer',
        down: e => { e.stopPropagation(); this.setState({ sel:id }); if (isTop) { this.push(); this.setState({ drag:id }); } },
      };
    });
    const onMove = e => {
      if (!drag || !this.worldRef.current) return;
      const b = this.worldRef.current.getBoundingClientRect();
      const x = Math.round(((e.clientX - b.left) / 100 - 0.3) * 100) / 100;
      const y = Math.round(((e.clientY - b.top) / 100 - 0.3) * 100) / 100;
      this.setState(s => ({ o:{ ...s.o, [drag]:{ ...s.o[drag], x: Math.max(-0.2, Math.min(5.2, x)), y: Math.max(-0.2, Math.min(4.4, y)) } }, manual:{ ...s.manual, [drag + '.x']:true, [drag + '.y']:true } }));
    };
    const lAng = Math.atan2(r.S.y - o.key.y, r.S.x - o.key.x);
    const cAng = Math.atan2(r.S.y - o.cam.y, r.S.x - o.cam.x);
    const tree = ['LIGHTS','CAMERA','ACTORS'].map(g => ({ name:g, items: Object.keys(META).filter(id => META[id].group === g).map(id => ({
      label: META[id].label, meta: META[id].type === 'light' ? (o[id].power === 0 ? 'off' : o[id].power + '%') : '',
      bg: sel === id ? 'var(--bg3)' : 'transparent', color: sel === id ? 'var(--tx)' : 'var(--tx2)',
      dot: META[id].type === 'light' ? (o[id].power === 0 ? 'var(--line2)' : '#EDEDED') : 'var(--tx3)', dotR: META[id].type === 'actor' ? '4px' : '2px',
      select: () => this.setState({ sel:id }),
    })) })).concat([{ name:'SET', items:['Counter','Table','Window','Fridge'].map(l => ({ label:l, meta:'', bg:'transparent', color:'var(--tx3)', dot:'var(--line2)', dotR:'1px', select: () => {} })) }]);

    const num = (id, k, label, unit, step) => ({ label, num:true, text:false, val: o[id][k], unit, step, b: manual[id + '.' + k] ? MAN : MEAS, set: e => this.setVal(id, k, parseFloat(e.target.value) || 0) });
    const txt = (label, val, b) => ({ label, num:false, text:true, val, b: b || MEAS });
    const m = META[sel];
    let props;
    if (m.type === 'light') {
      const lr = sel === 'key' ? r : null;
      props = [
        txt('Type', sel === 'key' ? '600 W bi-colour COB' : sel === 'fill' ? '4 ft RGB tube' : 'Pendant, 60 W', MAN),
        num(sel, 'power', 'Power', '%', 5), num(sel, 'kelvin', 'Colour temp', 'K', 50),
        txt('Gel', sel === 'key' ? 'full CTO + ½ CTS' : 'none', MAN), txt('Modifier', sel === 'fill' ? 'ceiling bounce' : 'none', MAN),
        num(sel, 'x', 'Position x', 'm', 0.05), num(sel, 'y', 'Position y', 'm', 0.05), num(sel, 'z', 'Height z', 'm', 0.05),
      ];
      if (lr) props.push(txt('To subject', lr.dist.toFixed(1) + ' m'), txt('Azimuth', Math.round(lr.az) + '° (rel. cam)'), txt('Elevation', Math.round(lr.el) + '°'), txt('Beam', '55°', MAN));
    } else if (m.type === 'cam') {
      props = [txt('Body', 'Sony FX3', MAN), txt('Lens', '35 mm', MAN), txt('Aperture', 'T2', MAN), num('cam','x','Position x','m',0.05), num('cam','y','Position y','m',0.05), num('cam','z','Height','m',0.05), txt('Tilt', '+4° (low)', AIB), txt('Move', 'static', MAN)];
    } else {
      props = [txt('Mark', sel === 'rhea' ? 'mark 1' : 'mark 2', MAN), num(sel,'x','Position x','m',0.05), num(sel,'y','Position y','m',0.05), txt('Eye line', sel === 'rhea' ? '1.45 m' : '1.62 m', MEAS), txt('Facing', 'counter, south', MAN)];
    }
    const dd = (v, good) => ({ d: v, dc: good ? 'var(--tx2)' : 'var(--warn)' });
    const K = o.key.kelvin;
    const metrics = [
      { label:'Contrast', plan: r.ratio.toFixed(1) + ':1', ref:'8:1', ...dd((r.ratio - 8 >= 0 ? '+' : '') + (r.ratio - 8).toFixed(1), Math.abs(r.ratio - 8) < 0.5) },
      { label:'Warmth', plan: K + ' K', ref:'2000 K', ...dd((K - 2000 >= 0 ? '+' : '') + (K - 2000), Math.abs(K - 2000) < 100) },
      { label:'Brightness', plan: (r.expo >= 0 ? '+' : '') + r.expo.toFixed(1) + ' st', ref:'0.0 st', ...dd(r.expo.toFixed(1), Math.abs(r.expo) < 0.25) },
      { label:'Direction', plan: `${Math.round(r.az)}° / ${Math.round(r.el)}°`, ref:'−60° / 25°', ...dd(`${Math.round(r.az + 60)}°`, Math.abs(r.az + 60) < 3) },
    ];
    return {
      tree,
      views: [['3d','3D'],['top','Top-down plot'],['cam','Camera view']].map(([id,label]) => ({ label, go: () => { run('plan.set_view', label, { view: id === 'cam' ? 'camera' : id }, { quiet:true }); this.setState({ view:id }); }, bg: view === id ? 'var(--bg3)' : 'transparent', color: view === id ? 'var(--tx)' : 'var(--tx3)' })),
      viewHint: isTop ? 'Drag lights, camera and actors · 1 grid = 0.5 m' : is3d ? 'Select to edit · switch to Top-down to drag' : 'Cam A · 35 mm · T2',
      is3d, isCam: view === 'cam', isSpatial: view !== 'cam',
      worldTf: is3d ? 'perspective(1600px) rotateX(60deg) rotateZ(-35deg) scale(.82)' : 'none',
      worldRef: this.worldRef, objs, onMove, onUp: () => { if (!drag) return; const p = o[drag]; run('plan.move_object', 'Moved', { id:drag, x:p.x, y:p.y }, { quiet:true }); this.setState({ drag:null }); },
      marks: [{ left: PX(INIT.rhea.x) + 'px', top: PX(INIT.rhea.y) + 'px' }, { left: PX(INIT.arjun.x) + 'px', top: PX(INIT.arjun.y) + 'px' }],
      keyCone: wedge(o.key.x, o.key.y, lAng, 55, 3.8),
      camCone: wedge(o.cam.x, o.cam.y, cAng, 54, 2.6),
      distLine: { x1: PX(o.key.x), y1: PX(o.key.y), x2: PX(r.S.x), y2: PX(r.S.y), tx: (PX(o.key.x) + PX(r.S.x)) / 2 + 6, ty: (PX(o.key.y) + PX(r.S.y)) / 2 - 8, label: r.dist.toFixed(1) + ' m' },
      showGizmo: META[sel].type !== 'actor' && isTop, gizmo: { left: PX(o[sel].x) + 'px', top: PX(o[sel].y) + 'px' },
      selTitle: META[sel].label, props,
      score: r.score, scoreDelta: r.score === base ? 'plan v2 · last saved 19:42' : (r.score > base ? '+' : '') + (r.score - base) + ' since plan v2',
      metrics,
      addLight: () => run('plan.add_light', 'Light added (60 W LED panel)'),
      match: () => {
        this.push();
        const ang = r.cAng + rad(60), h = 1.45 / Math.tan(rad(25));
        const nx = +(r.S.x + h * Math.cos(ang)).toFixed(2), ny = +(r.S.y + h * Math.sin(ang)).toFixed(2);
        const dist = Math.hypot(h, 1.45);
        const power = Math.round(80 * (8 / 7.4) * Math.pow(dist / 3.614, 2));
        this.setState(s => ({ o:{ ...s.o, key:{ ...s.o.key, x:nx, y:ny, power } }, sel:'key' }));
        run('plan.match_light', 'Key moved to −60° / 25°, power set for 8:1');
      },
      undo: () => { if (!hist.length) return; run('plan.undo', 'Undone', {}, { quiet:true }); this.setState({ o: hist[hist.length - 1], hist: hist.slice(0, -1) }); },
      noUndo: hist.length === 0, undoColor: hist.length ? 'var(--tx)' : 'var(--tx3)',
      save: () => run('plan.save_plan', `Saved plan v3 · match ${r.score}%`),
      toSheet: () => nav('sheet'),
    };
  }
}

SetPlan.view = SetPlanView;
SetPlan.defaultProps = defaults;
