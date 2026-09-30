// @ts-nocheck: behaviour ported from design/LocationKit.dc.html; typed as each screen is wired to real actions.
// Owned code (D-LL-014): the port wrote this once and will not overwrite it.
import React from 'react';
import { DCLogic } from '../runtime/dc';
import { LocationKitView, defaults } from '../views/LocationKit.view';
import { sampleBadge } from '../runtime/badges';

const B = {
  measured: sampleBadge({ label:'MEASURED', border:'1px solid var(--line2)', bg:'transparent', color:'var(--tx2)' }),
  manual: { label:'MANUAL', border:'1px solid transparent', bg:'var(--bg3)', color:'var(--tx)' },
  ai: c => sampleBadge({ label:`AI ${c}%`, border:'1px dashed var(--tx3)', bg:'transparent', color:'var(--tx2)' }),
};
const KIT = [
  ['Lights', [['600 W bi-colour COB','×1'],['60 W LED panel','×2'],['4 ft RGB tube','×1']]],
  ['Grip & modifiers', [['4×4 frame + ½ grid','×1'],['Flags','×2'],['CTO full, ½ gels','roll'],['Haze machine','×1']]],
  ['Camera', [['Sony FX3','×1'],['Primes 24 / 35 / 50 / 85 mm','×4']]],
  ['Crew', [['DP · gaffer · 1 spark','3']]],
];
const AI_STEPS = [
  ['Key','600 W COB outside the window, 3 m back, full CTO + ½ CTS to reach ≈2000 K. Flag the ceiling spill.',78],
  ['Fill','RGB tube bounced off the ceiling at 5600 K, 10%. Aim for 8:1 on the face.',70],
  ['Lens','35 mm at T2 (closest prime to ≈40 mm). Camera 1.2 m, slight low angle.',84],
];
export class LocationKit extends DCLogic {
  state = { mode:'ai', gen:false, off:{}, manualSteps:[['Key',''],['Fill',''],['Lens','']] };
  componentWillUnmount() { clearTimeout(this._t); }
  renderVals() {
    const { mode, gen, off, manualSteps } = this.state;
    const aiOk = this.props.aiOk ?? true;
    const run = this.props.run || (() => {});
    const manual = mode === 'manual';
    let count = 0;
    const kitGroups = KIT.map(([name, items]) => ({ name, items: items.map(([n, qty]) => {
      const on = !off[n]; if (on) count++;
      return { name:n, qty, color: on ? 'var(--tx)' : 'var(--tx3)', mark: on ? '✓' : '', boxBg: on ? 'var(--acc)' : 'transparent', boxBorder: on ? 'var(--acc)' : 'var(--line2)', toggle: () => { this.setState(s => ({ off: { ...s.off, [n]: !s.off[n] } })); run('adapt.check_power', 'Power re-checked', {}, { quiet:true }); } };
    }) }));
    const steps = manual
      ? manualSteps.map(([title, text], i) => ({ n:i + 1, title, text, b:B.manual, editable:true, readonly:false, save: e => { const m = manualSteps.slice(); m[i] = [title, e.target.value]; this.setState({ manualSteps:m }); run('adapt.write_recipe', 'Recipe saved', { steps: m.map(([t, x]) => ({ title:t, text:x })) }); } }))
      : AI_STEPS.map(([title, text, c], i) => ({ n:i + 1, title, text, b:B.ai(c), editable:false, readonly:true }));
    return {
      locRows: [['Floor','3.1 × 4.2 m',B.measured],['Ceiling','2.9 m',B.measured],['Window','east, 1.2 m wide',B.measured],['Power','5 A, 15 A (2 points)',B.manual],['Shoot window','19:00–02:00',B.manual]].map(([label,val,b]) => ({ label, val, b })),
      kitGroups, kitCount: count,
      addKit: () => run('adapt.add_kit', 'Kit item added'),
      aiBlocked: !aiOk, aiMsg: this.props.aiMsg || '',
      genLabel: gen ? 'Generating…' : 'Generate recipe (AI)',
      genBg: !manual && aiOk ? 'var(--bg3)' : 'var(--bg2)', genColor: aiOk ? 'var(--tx)' : 'var(--tx3)',
      selfBg: manual ? 'var(--bg3)' : 'var(--bg2)',
      generate: () => { this.setState({ gen:true, mode:'ai' }); this._t = setTimeout(() => { this.setState({ gen:false }); run('adapt.generate_recipe', 'Recipe generated · 3 steps, 1 gap, 1 risk'); }, 1100); },
      writeSelf: () => this.setState({ mode:'manual' }),
      generating: gen, showSteps: !gen, manual, steps,
      addStep: () => this.setState(s => ({ manualSteps:[...s.manualSteps, ['Step', '']] })),
      openPlan: () => { Promise.resolve(run('adapt.open_in_plan', 'Recipe opened in Set Plan')).then(r => r && (this.props.nav || (() => {}))('plan')); },
    };
  }
}

LocationKit.view = LocationKitView;
LocationKit.defaultProps = defaults;
