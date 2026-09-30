// @ts-nocheck: behaviour ported from design/Settings.dc.html; typed as each screen is wired to real actions.
// Owned code (D-LL-014). Wired to the engine: every number and status on this screen is real.
import React from 'react';
import { DCLogic } from '../runtime/dc';
import { SettingsView, defaults } from '../views/Settings.view';
import { invoke } from '../runtime/engine';

const REFRESH_MS = 5000;
const MCP_FRESH_MS = 10 * 60 * 1000;

function ago(iso) {
  const s = Math.round((Date.now() - Date.parse(iso)) / 1000);
  return s < 60 ? `${s} s ago` : s < 3600 ? `${Math.round(s / 60)} min ago` : `${Math.round(s / 3600)} h ago`;
}

export class Settings extends DCLogic {
  state = { tab:'ai', copied:false, cap:null, settings:null, status:null, command:'' };

  componentDidMount() {
    this.load();
    invoke('settings.copy_mcp_command').then(r => this.setState({ command:r.result.command }), () => {});
    this._i = setInterval(() => this.load(), REFRESH_MS);
  }
  componentWillUnmount() { clearInterval(this._i); clearTimeout(this._capT); }
  load() {
    invoke('settings.get').then(r => this.setState({ settings:r.result }), () => {});
    invoke('app.status').then(r => this.setState({ status:r.result }), () => {});
  }

  renderVals() {
    const { tab, copied, settings, status, command } = this.state;
    const run = this.props.run || (() => {});
    const noAi = settings ? settings.no_ai : !!this.props.noAi;
    const theme = this.props.theme || 'dark';
    const api = settings ? settings.api : { provider:'none', cap_inr:0, used_inr:0 };
    const cap = this.state.cap ?? api.cap_inr.toLocaleString('en-IN');
    const capN = parseInt(String(cap).replace(/\D/g, '')) || 0;
    const pct = capN ? Math.min(100, api.used_inr / capN * 100) : 0;
    const atCap = capN > 0 && pct >= 100;
    const hasKey = api.provider !== 'none';
    const cloud = settings ? settings.cloud_allowed_projects.includes('neel') : false;
    const sw = on => ({ bg: on ? 'var(--acc)' : 'var(--line2)', knob: on ? '17px' : '3px' });
    const mcpSeen = status && status.mcp_last_seen;
    const mcpLive = mcpSeen && Date.now() - Date.parse(mcpSeen) < MCP_FRESH_MS;
    // Engine RSS plus this page's JS heap (Chrome only). The browser's own processes are not counted.
    const heapMb = (performance && performance.memory) ? performance.memory.usedJSHeapSize / 1048576 : 0;
    const memMb = (status ? status.rss_mb : 0) + heapMb;
    return {
      tabs: [['general','General'],['ai','AI & connections'],['units','Units & formats'],['storage','Storage'],['shortcuts','Shortcuts']].map(([id,label]) => ({ label, bg: tab === id ? 'var(--bg3)' : 'transparent', color: tab === id ? 'var(--tx)' : 'var(--tx2)', go: () => this.setState({ tab:id }) })),
      cc: mcpLive ? { dot:'var(--acc)', label:`Connected · ${ago(mcpSeen)}` } : mcpSeen ? { dot:'var(--tx3)', label:`Last seen ${ago(mcpSeen)}` } : { dot:'var(--tx3)', label:'Not connected yet' },
      mcpBlurb: `Claude Code runs Look Lab through its MCP connection, on your own Claude subscription. ${status ? status.mcp_tools : '…'} Look Lab tools available. Run this once in a terminal:`,
      // The full command is long; show its start and copy the whole thing (the box is sized for one line).
      mcpCommandText: command ? (command.length > 58 ? command.slice(0, 57) + '…' : command) : 'Loading the setup command…',
      apiKeyText: hasKey ? 'Key stored in the macOS Keychain' : 'No key yet. In-app AI buttons arrive in phase P4.',
      copyLabel: copied ? 'Copied' : 'Copy setup command',
      copyCmd: () => { Promise.resolve(run('settings.copy_mcp_command', 'Setup command copied')).then(r => { if (!r) return; try { navigator.clipboard.writeText(r.result.command); } catch (e) {} this.setState({ copied:true }); setTimeout(() => this.setState({ copied:false }), 1800); }); },
      // The design has no save button for the cap: save when typing pauses.
      cap, onCap: e => {
        const value = e.target.value;
        this.setState({ cap:value });
        clearTimeout(this._capT);
        this._capT = setTimeout(() => run('settings.set_cap', 'Monthly cap saved', { amount_inr: parseInt(String(value).replace(/\D/g, '')) || 0 }), 800);
      },
      used: api.used_inr.toLocaleString('en-IN'), usedPct: pct + '%',
      barColor: atCap ? 'var(--warn)' : 'var(--acc)', capBorder: atCap ? 'var(--warn)' : 'var(--line)',
      capState: !hasKey ? 'No key' : atCap ? 'Cap reached · AI buttons paused' : 'Active', capColor: atCap ? 'var(--warn)' : 'var(--tx2)',
      providers: [{ label:'Image model', add: () => run('settings.add_provider', 'Provider setup opened') }, { label:'3D reconstruction', add: () => run('settings.add_provider', 'Provider setup opened') }],
      locals: [['Segmentation','not installed · phase P4'],['Depth','not installed · phase P4']].map(([label, meta]) => ({ label, meta, tbg: sw(false).bg, knob: sw(false).knob, toggle: () => {} })),
      memPct: Math.min(100, memMb / 8192 * 100) + '%', memLabel: status ? `${(memMb / 1024).toFixed(2)} GB` : '…',
      privBg: sw(!cloud).bg, privKnob: sw(!cloud).knob,
      togglePrivacy: () => { Promise.resolve(run('settings.toggle_cloud', cloud ? 'Footage stays local' : 'Cloud allowed for this project', { on: !cloud })).then(r => r && this.load()); },
      noAiBg: sw(noAi).bg, noAiKnob: sw(noAi).knob,
      toggleNoAi: () => { Promise.resolve(run('settings.toggle_no_ai', noAi ? 'AI turned back on' : 'No AI mode on', { on: !noAi })).then(r => { if (!r) return; this.props.setNoAi && this.props.setNoAi(!noAi); this.load(); }); },
      themes: [['dark','Dark'],['light','Light']].map(([id,label]) => ({ label, bg: theme === id ? 'var(--bg3)' : 'transparent', color: theme === id ? 'var(--tx)' : 'var(--tx3)', go: () => this.props.setTheme && this.props.setTheme(id) })),
    };
  }
}

Settings.view = SettingsView;
Settings.defaultProps = defaults;
