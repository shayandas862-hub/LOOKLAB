// @ts-nocheck: behaviour ported from design/Activity.dc.html; typed as each screen is wired to real actions.
// Owned code (D-LL-014). Wired to the real decision log (log.list): this screen shows no sample data.
import React from 'react';
import { DCLogic } from '../runtime/dc';
import { ActivityView, defaults } from '../views/Activity.view';
import { invoke } from '../runtime/engine';

const TIERS = { T0:'T0 Instrument', T1:'T1 Fast model', T2:'T2 AI', T3:'T3 Human' };
const VIA = { ui:'You, in Look Lab', mcp:'Claude Code (MCP)', cli:'The CLI', test:'A test' };
const REFRESH_MS = 3000;

function hhmm(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export class Activity extends DCLogic {
  state = { tier:'all', shot:'all', open:null, rows:[], loaded:false, error:'' };

  componentDidMount() {
    this.load();
    this._i = setInterval(() => this.load(), REFRESH_MS);
  }
  componentWillUnmount() { clearInterval(this._i); }
  load() {
    invoke('log.list', { limit:200 }).then(
      r => this.setState({ rows:r.result.decisions, loaded:true, error:'' }),
      e => this.setState({ error:e.message, loaded:true }),
    );
  }

  renderVals() {
    const { tier, shot, open, rows } = this.state;
    const run = this.props.run || (() => {});
    const chip = (on, label, go) => ({ label, go, border: on ? 'var(--acc)' : 'var(--line)', bg: on ? 'var(--acc-soft)' : 'transparent', color: on ? 'var(--tx)' : 'var(--tx2)' });
    const shots = ['all', ...new Set(rows.map(d => d.shot_id).filter(Boolean))];
    const vis = rows.filter(d => (tier === 'all' || d.tier === tier) && (shot === 'all' || d.shot_id === shot));
    const cost = vis.reduce((a, d) => a + d.cost_inr, 0);
    const setVerdict = (d, verdict, text) => Promise.resolve(run('log.set_verdict', text, { decision_id:d.id, verdict })).then(r => r && this.load());
    return {
      tierChips: [['all','All']].concat(Object.entries(TIERS)).map(([id, label]) => chip(tier === id, label, () => this.setState({ tier:id }))),
      shotChips: shots.map(id => chip(shot === id, id === 'all' ? 'All' : id, () => this.setState({ shot:id }))),
      summary: this.state.error ? this.state.error : `${vis.length} decisions · ₹${cost} spent`,
      rows: vis.map(d => {
        const v = d.verdict === 'agreed' ? 'Agreed' : d.verdict === 'overridden' ? 'Overridden' : 'No verdict';
        const conf = d.confidence == null ? '—' : `${d.confidence}%`;
        const isOpen = open === d.id;
        return {
          t: hhmm(d.time), action: d.command, cmd: d.command, shot: d.shot_id || '—', tier: TIERS[d.tier], rule: d.rule_id || '—',
          result: d.ok ? d.result : `Refused · ${d.result}`, conf, cost: `₹${d.cost_inr}`, verdict: v,
          inputs: [d.inputs], why: `${VIA[d.via] || d.via}${d.stand_in ? ' · stand-in, sample data' : ''}${d.ok ? '' : ' · did not run'}`,
          tierBorder: d.tier === 'T2' ? '1px dashed var(--tx3)' : d.tier === 'T3' ? '1px solid var(--tx2)' : '1px solid var(--line2)',
          confColor: d.confidence != null && d.confidence < 60 ? 'var(--warn)' : 'var(--tx2)',
          vColor: v === 'Overridden' ? 'var(--tx)' : 'var(--tx2)', vDot: v === 'Overridden' ? 'var(--warn)' : 'var(--tx3)',
          open: isOpen, bg: isOpen ? 'var(--bg2)' : 'transparent',
          toggle: () => this.setState({ open: isOpen ? null : d.id }),
          agree: () => setVerdict(d, 'agreed', 'Marked as agreed'),
          override: () => setVerdict(d, 'overridden', 'Marked as overridden'),
        };
      }),
    };
  }
}

Activity.view = ActivityView;
Activity.defaultProps = defaults;
