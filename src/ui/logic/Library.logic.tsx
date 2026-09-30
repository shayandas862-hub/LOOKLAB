// @ts-nocheck: behaviour ported from design/Library.dc.html; typed as each screen is wired to real actions.
// Owned code (D-LL-014): the port wrote this once and will not overwrite it.
import React from 'react';
import { DCLogic } from '../runtime/dc';
import { LibraryView, defaults } from '../views/Library.view';

const L = [
  ['Kitchen sodium','Neel','Sc 12 · 12C',-60,'8:1',2000,'hard',['neo-noir','sodium','hard key'],['#1B2230','#3E4A52','#C7803A','#6E5B4A','#E9C9A0'],['lonely','warm']],
  ['Tram stop, rain','Neel','Sc 7',-30,'4:1',4300,'soft',['rain','teal','wet street'],['#10222A','#2C4E58','#6E8A94','#C9D3D6','#0A1216'],['lonely','cold']],
  ['Terrace dawn','Neel','Sc 4',20,'2:1',5200,'soft',['dawn','haze'],['#6B7A8C','#B7A9A0','#E4CFB8','#F2E6D8','#3A4450'],['dreamy']],
  ['Monsoon window','Monsoon Letters','Spot 1',-45,'3:1',5600,'soft',['window','overcast'],['#2B3440','#6B7F99','#B7C4D1','#E6E1D8','#161B20'],['cold','dreamy']],
  ['Neon bar','Tram 36','Verse 2',70,'6:1',3200,'hard',['neon','magenta'],['#1A0F1E','#5A1E4E','#C23A7A','#F08FB8','#0C070E'],['neo-noir']],
  ['Stairwell practical','Neel','Sc 15',0,'10:1',2700,'hard',['practical','bare bulb'],['#0E0C0A','#3A2E24','#8A6A48','#E0B07A','#050403'],['lonely','warm']],
  ['Corridor fluorescent','Salt','Sc 3',0,'2:1',4000,'soft',['fluorescent','green cast'],['#2E3A34','#6B7F72','#B9C6B8','#E3EBE0','#171D1A'],['cold']],
  ['Night car','Tram 36','Bridge',-90,'12:1',3000,'hard',['dashboard','streetlight'],['#0B0E14','#1F2A3A','#C98A4B','#F2C48D','#050608'],['neo-noir','lonely']],
];
const MOODS = ['neo-noir','lonely','warm','cold','dreamy'];
export class Library extends DCLogic {
  state = { sel:0, moods:[], hard:'any', kMax:6000, project:'all' };
  renderVals() {
    const { sel, moods, hard, kMax, project } = this.state;
    const run = this.props.run || (() => {});
    const vis = L.map((l, i) => ({ l, i })).filter(({ l }) => (hard === 'any' || l[6] === hard) && l[5] <= kMax && (project === 'all' || l[1] === project) && moods.every(m => l[9].includes(m)));
    const c = L[sel];
    const dial = az => ({ dx: 17 + 12 * Math.sin(az * Math.PI / 180), dy: 17 + 12 * Math.cos(az * Math.PI / 180) });
    return {
      moods: MOODS.map(m => { const on = moods.includes(m); return { label:m, border: on ? 'var(--acc)' : 'var(--line)', bg: on ? 'var(--acc-soft, rgba(34,211,238,.12))' : 'transparent', color: on ? 'var(--tx)' : 'var(--tx2)', toggle: () => this.setState({ moods: on ? moods.filter(x => x !== m) : [...moods, m] }) }; }),
      hards: [['any','Any'],['hard','Hard'],['soft','Soft']].map(([id, label]) => ({ label, bg: hard === id ? 'var(--bg3)' : 'transparent', color: hard === id ? 'var(--tx)' : 'var(--tx3)', go: () => this.setState({ hard:id }) })),
      kMax, onK: e => this.setState({ kMax:+e.target.value }),
      project, onProject: e => this.setState({ project:e.target.value }),
      reset: () => this.setState({ moods:[], hard:'any', kMax:6000, project:'all' }),
      countLabel: `${vis.length} of ${L.length} saved looks`, none: vis.length === 0,
      looks: vis.map(({ l, i }) => ({ name:l[0], project:`${l[1]} · ${l[2]}`, az:(l[3] > 0 ? '+' : '') + l[3], ratio:l[4], k:l[5], hard:l[6], tags:l[7], pal:l[8], slot:'look-' + i, ...dial(l[3]),
        border: i === sel ? 'var(--acc)' : 'var(--line)', select: () => this.setState({ sel:i }) })),
      cur: { name:c[0], project:`${c[1]} · ${c[2]}`, pal:c[8], slot:'look-' + sel, saved: sel === 0 ? 'today 19:48' : '12 Sep' },
      curRows: [['Key direction',(c[3] > 0 ? '+' : '') + c[3] + '° az'],['Key:fill',c[4]],['Key temp',c[5] + ' K'],['Hardness',c[6]],['Tags',c[7].join(', ')],['Mood',c[9].join(', ')]].map(([label,val]) => ({ label, val })),
      compare: () => run('library.compare', `Comparing “${c[0]}” with Shot 12C`),
      apply: () => run('library.apply_look', `“${c[0]}” applied to Shot 12C as a target`),
    };
  }
}

Library.view = LibraryView;
Library.defaultProps = defaults;
