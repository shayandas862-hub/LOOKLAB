// @ts-nocheck: behaviour ported from design/Shots.dc.html; typed as each screen is wired to real actions.
// Owned code (D-LL-014): the port wrote this once and will not overwrite it.
import React from 'react';
import { DCLogic } from '../runtime/dc';
import { ShotsView, defaults } from '../views/Shots.view';

const SH = [
  ['12A','Wide, Rhea enters','WS','24 mm','static',6,'Set sheet ready'],
  ['12B','Arjun at the table','MS','35 mm','slow push',8,'Planned'],
  ['12C','Rhea at the counter','MCU','35 mm','static',9,'Planned'],
  ['12D','Hands, phone','ECU','85 mm','static',5,'Planned'],
  ['12E','Two-shot, window','MS','50 mm','pan right',8,'Reference'],
  ['12F','Rhea looks out','CU','50 mm','static',6,'Reference'],
];
const TOTAL = 42;
export class Shots extends DCLogic {
  state = { sel:2, t:0, playing:false };
  componentWillUnmount() { cancelAnimationFrame(this._r); }
  tick = ts => {
    if (!this._last) this._last = ts;
    const t = this.state.t + (ts - this._last) / 1000; this._last = ts;
    if (t >= TOTAL) { this.setState({ t:TOTAL, playing:false }); return; }
    this.setState({ t }); this._r = requestAnimationFrame(this.tick);
  };
  renderVals() {
    const { sel, t, playing } = this.state;
    const nav = this.props.nav || (() => {});
    let acc = 0; const starts = SH.map(s => { const a = acc; acc += s[5]; return a; });
    const curIdx = SH.findIndex((s, i) => t >= starts[i] && t < starts[i] + s[5]);
    const c = SH[sel];
    const fmt = x => '00:00:' + String(Math.floor(x)).padStart(2, '0');
    const statusStyle = st => st === 'Set sheet ready' ? ['var(--tx)','var(--acc)'] : st === 'Planned' ? ['var(--tx2)','var(--tx2)'] : ['var(--tx3)','transparent'];
    return {
      shots: SH.map(([code, desc, size, lens, move, dur, status], i) => ({ code, size, lens, move, dur, status, slot:'shot-' + code.toLowerCase(), ph:'Previs frame ' + code,
        border: i === sel ? 'var(--acc)' : 'var(--line)', playing: playing && curIdx === i,
        stColor: statusStyle(status)[0], stDot: statusStyle(status)[1], select: () => { this.setState({ sel:i }); this.props.run && this.props.run('shots.render_frame', `Frame ${code}`, { shot_id: code }, { quiet:true }); } })),
      cur: { code:c[0], desc:c[1], refSlot: c[0] === '12C' ? 'ref-12c' : 'ref-' + c[0].toLowerCase(), refText: c[0] === '12C' ? 'ref_kitchen_night.mov · shot 3 · match 87%' : c[6] === 'Reference' ? 'Reference only, not planned yet' : 'Linked reference' },
      curRows: [['Shot size',c[2]],['Lens',c[3]],['Camera move',c[4]],['Duration',c[5] + ' s'],['Status',c[6]],['Key light', c[0] === '12C' ? '−58° / 24° · 2150 K' : '—']].map(([label,val]) => ({ label, val })),
      togglePlay: () => {
        if (playing) { cancelAnimationFrame(this._r); this.setState({ playing:false }); return; }
        this._last = 0; this.setState({ playing:true, t: t >= TOTAL ? 0 : t }); this._r = requestAnimationFrame(this.tick);
        this.props.run && this.props.run('shots.play_previs', 'Playing previs');
      },
      playGlyph: playing ? '❚❚' : '▶', playLabel: playing ? 'Pause' : 'Play previs 00:00:42',
      tc: fmt(t) + ' / 42',
      blocks: SH.map((s, i) => ({ code:s[0], dur:s[5], bg: curIdx === i && (playing || t > 0) ? 'var(--bg3)' : 'var(--bg2)', border: i === sel ? 'var(--acc)' : 'var(--line)', seek: () => this.setState({ t: starts[i], sel:i }) })),
      head: `calc(${t / TOTAL * 100}% - 1px)`,
      openBreakdown: () => nav('breakdown'), openPlan: () => nav('plan'), openSheet: () => nav('sheet'),
    };
  }
}

Shots.view = ShotsView;
Shots.defaultProps = defaults;
