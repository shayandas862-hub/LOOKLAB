// @ts-nocheck: behaviour ported from design/Projects.dc.html; typed as each screen is wired to real actions.
// Owned code (D-LL-014): the port wrote this once and will not overwrite it.
import React from 'react';
import { DCLogic } from '../runtime/dc';
import { ProjectsView, defaults } from '../views/Projects.view';

const P = [
  { id:'neel', name:'Neel', type:'Short film', dates:'Shoot 14–18 Oct 2026', st:[[100,'7/7'],[57,'4/7'],[14,'1/7']] },
  { id:'monsoon', name:'Monsoon Letters', type:'Commercial', dates:'Shoot 2–3 Nov 2026', st:[[100,'5/5'],[20,'1/5'],[0,'0/5']] },
  { id:'tram', name:'Tram 36', type:'Music video', dates:'Shoot 21 Nov 2026', st:[[40,'4/10'],[0,'0/10'],[0,'0/10']] },
  { id:'salt', name:'Salt', type:'Feature pitch', dates:'Dates not set', st:[[12,'3/24'],[0,'0/24'],[0,'0/24']] },
];
const SCENES = [
  ['4','Terrace, dawn','3 shots · 3 planned'],
  ['7','Tram stop, rain','5 shots · 1 planned'],
  ['12','Kitchen, night','6 shots · 4 planned'],
  ['15','Stairwell','2 shots · 0 planned'],
];
export class Projects extends DCLogic {
  state = { cur:'neel' };
  renderVals() {
    const nav = this.props.nav || (() => {});
    const run = this.props.run || (() => {});
    const cur = P.find(p => p.id === this.state.cur);
    return {
      projects: P.map(p => ({ ...p, slot:'poster-' + p.id, border: p.id === this.state.cur ? 'var(--acc)' : 'var(--line)', open: () => this.setState({ cur:p.id }),
        stages: p.st.map(([w, v], i) => ({ w: w + '%', v, label: ['Breakdown','Plan','Set sheet'][i] })) })),
      cur,
      scenes: SCENES.map(([n, name, meta]) => ({ n, name: `“${name}”`, meta, bg: n === '12' ? 'var(--bg2)' : 'transparent', open: () => nav('breakdown') })),
      recent: [
        { t:'19:42', text:'Look match for 12C rose to 87% after moving the key 0.4 m back.' },
        { t:'18:10', text:'Recipe for 12C generated. 1 gap: window stand at 2.5 m.' },
        { t:'Mon', text:'Director added 4 frames to “Sodium & teal”.' },
      ],
      openActivity: () => nav('activity'),
      importRef: () => { this.props.setBstate && this.props.setBstate('empty'); nav('breakdown'); },
      newProject: () => run('project.create', 'New project created'),
    };
  }
}

Projects.view = ProjectsView;
Projects.defaultProps = defaults;
