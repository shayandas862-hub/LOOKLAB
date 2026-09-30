// @ts-nocheck: behaviour ported from design/SetSheet.dc.html; typed as each screen is wired to real actions.
// Owned code (D-LL-014): the port wrote this once and will not overwrite it.
import React from 'react';
import { DCLogic } from '../runtime/dc';
import { SetSheetView, defaults } from '../views/SetSheet.view';

const GEAR = [['600 W bi-colour COB','×1'],['Combo stand 3 m (hire)','×1'],['4 ft RGB tube','×1'],['Flags','×2'],['CTO full + ½ CTS','sheet'],['Haze machine','×1'],['Sandbags','×4'],['Extension 10 m','×2'],['FX3 + 35 mm prime','×1']];
const STEPS = [
  'Stand outside the window, 3 m back from the glass, head at 2.9 m. Sandbag ×2.',
  'Mount the COB: full CTO + ½ CTS, 80%. Flag the ceiling spill.',
  'Rig the RGB tube above the table, bounce off the ceiling, 5600 K at 10%.',
  'Pendant off. Tape the switch.',
  'Cam A on marks: 35 mm, 1.2 m, +4° tilt. Rhea on mark 1.',
  'Meter the face: key 8:1 over fill (3 stops). Light haze, then roll.',
];
export class SetSheet extends DCLogic {
  state = { done:{ 0:true, 2:true, 3:true } };
  renderVals() {
    const run = this.props.run || (() => {});
    const done = this.state.done;
    const n = Object.values(done).filter(Boolean).length;
    return {
      gear: GEAR.map(([name, qty], i) => ({ name, qty, mark: done[i] ? '✓' : '', bg: done[i] ? '#141414' : 'transparent', color: done[i] ? '#777' : '#141414', toggle: () => this.setState(s => ({ done:{ ...s.done, [i]: !s.done[i] } })) })),
      gearDone: `${n} of ${GEAR.length} packed`,
      cam: [['Lens','35 mm prime'],['Aperture','T2'],['ISO','3200'],['Shutter','180°'],['White balance','3200 K'],['Height · tilt','1.2 m · +4°']].map(([label, val]) => ({ label, val })),
      safety: [['Power:','COB draws ≈2.7 A. Run it from the 5 A point.'],['Fridge:','shares the 15 A point. Unplug during takes, plug back at wrap.'],['Window:','cable over the sill on a mat. Stand sandbagged.'],['Haze:','smoke alarm in hallway. Cover it, remove the cover at wrap.']].map(([k, v]) => ({ k, v })),
      steps: STEPS.map((t, i) => ({ n: i + 1, t })),
      targets: [['Key','2000 K'],['Ratio','8:1'],['Angle','−60°/25°']].map(([k, v]) => ({ k, v })),
      regen: () => run('setsheet.generate', 'Set sheet regenerated from plan v3'),
      sendPhone: () => run('setsheet.send_to_phone', 'Link sent to DP, gaffer, spark'),
      exportPdf: () => run('setsheet.export_pdf', 'Exported Neel_12C_setsheet.pdf'),
    };
  }
}

SetSheet.view = SetSheetView;
SetSheet.defaultProps = defaults;
