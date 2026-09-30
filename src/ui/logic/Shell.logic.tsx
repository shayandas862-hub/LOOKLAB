// @ts-nocheck: behaviour ported from design/Look Lab.dc.html; typed as each screen is wired to real actions.
// Owned code (D-LL-014). The shell is the single gateway from the UI to the engine: every screen's
// run(cmd, text, input) comes through here and calls the action registry (AD-LL-002).
import React from 'react';
import { DCLogic } from '../runtime/dc';
import { ShellView, defaults } from '../views/Shell.view';
import { invoke, listActions, subscribe } from '../runtime/engine';
import { StatusLayer, REAL_SCREENS } from '../components/StatusLayer';

const NAV = [
  { id:'projects', label:'Projects', short:'Projects', d:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' },
  { id:'breakdown', label:'Breakdown', short:'Breakdown', d:'M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M9 12h6M12 9v6' },
  { id:'location', label:'Location & Kit', short:'Adapt', d:'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
  { id:'plan', label:'Set Plan', short:'Set Plan', d:'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5' },
  { id:'shots', label:'Shots', short:'Shots', d:'M3 6h18v12H3zM3 10h18M3 14h18M8 6v12M16 6v12' },
  { id:'board', label:'Mood Board', short:'Board', d:'M3 4h8v10H3zM13 4h8v6h-8zM13 12h8v8h-8zM3 16h8v4H3z' },
  { id:'sheet', label:'Set Sheet', short:'Set Sheet', d:'M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h7M9 8h3' },
  { id:'library', label:'Library', short:'Library', d:'M5 4h4v16H5zM10 4h4v16h-4zM15.5 4.5l3.8-1 3.7 15.4-3.8 1z' },
  { id:'activity', label:'Activity', short:'Activity', d:'M3 12h4l3-8 4 16 3-8h4' },
];
const NAV_B = [{ id:'settings', label:'Settings', short:'Settings', d:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z' }];
const TITLES = { projects:'Projects', breakdown:'Breakdown', location:'Location & Kit', plan:'Set Plan', shots:'Shots', board:'Mood Board', sheet:'Set Sheet', library:'Library', activity:'Activity', settings:'Settings' };

// Which screen a command belongs to, by its domain.
const SCREEN_OF = { breakdown:'breakdown', adapt:'location', plan:'plan', shots:'shots', board:'board', setsheet:'sheet', library:'library', settings:'settings', log:'activity', project:'projects' };
const VIA_LABEL = { mcp:'Claude Code', cli:'The CLI' };

function preview() {
  try {
    const q = new URLSearchParams(location.search);
    return { ai: q.get('ai'), b: q.get('b') };
  } catch (e) { return { ai:null, b:null }; }
}

function savedTheme() {
  try { return localStorage.getItem('looklab.theme'); } catch (e) { return null; }
}

export class Shell extends DCLogic {
  state = { screen:'breakdown', palette:false, pq:'', psel:0, toast:null, theme:savedTheme(), bstate:null,
    actions:[], settings:null, engineUp:true, preview:preview() };
  pRef = React.createRef();

  componentDidMount() {
    this._k = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); this.state.palette ? this.closeP() : this.openP(); return; }
      if (!this.state.palette) return;
      const res = this.results();
      if (e.key === 'Escape') this.closeP();
      else if (e.key === 'ArrowDown') { e.preventDefault(); this.setState(s => ({ psel: Math.min(s.psel + 1, res.length - 1) })); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); this.setState(s => ({ psel: Math.max(s.psel - 1, 0) })); }
      else if (e.key === 'Enter' && res[this.state.psel]) this.exec(res[this.state.psel]);
    };
    window.addEventListener('keydown', this._k);
    listActions().then(actions => this.setState({ actions })).catch(() => this.setState({ engineUp:false }));
    this.loadSettings();
    this._unsub = subscribe(e => {
      if (e.type === 'settings') this.loadSettings();
      if (e.type === 'action' && e.via !== 'ui') this.toast(`${VIA_LABEL[e.via] || e.via} ran ${e.action}${e.ok ? '' : ' (refused)'}`, e.action);
    }, up => this.setState({ engineUp:up }));
  }
  componentWillUnmount() { window.removeEventListener('keydown', this._k); clearTimeout(this._tt); this._unsub && this._unsub(); }

  loadSettings() { invoke('settings.get').then(r => this.setState({ settings:r.result, engineUp:true })).catch(() => this.setState({ engineUp:false })); }
  toast(text, cmd, tone) {
    clearTimeout(this._tt);
    this.setState({ toast:{ text, cmd } });
    this._tt = setTimeout(() => this.setState({ toast:null }), tone === 'error' ? 6000 : 2600);
  }

  openP() { this.setState({ palette:true, pq:'', psel:0 }, () => setTimeout(() => this.pRef.current && this.pRef.current.focus(), 30)); }
  closeP() { this.setState({ palette:false }); }
  nav = id => this.setState({ screen:id, palette:false });

  /**
   * The one gateway to the engine. Screens call run(cmd, text, input, { quiet }); the toast reports what
   * really happened. A stand-in never gets the design's success text: nothing real was produced (D-LL-015).
   * `quiet` hides success toasts for background calls (drags, view switches); errors always show.
   */
  run = (cmd, text, input, opts) => invoke(cmd, input || {}).then(
    r => {
      if (!(opts && opts.quiet)) {
        const a = this.state.actions.find(x => x.name === cmd);
        this.toast(r.stand_in ? `${a ? a.title : cmd}: stand-in, nothing real produced yet` : (text || 'Done'), cmd);
      }
      return r;
    },
    err => { this.toast(err.message, cmd, 'error'); return null; },
  );

  commands() { return this.state.actions.filter(a => a.command); }
  results() {
    const q = this.state.pq.trim().toLowerCase();
    return this.commands().filter(c => !q || c.title.toLowerCase().includes(q) || c.name.includes(q));
  }
  exec(c) {
    const open = /^app\.open_(.+)$/.exec(c.name);
    const screen = open ? open[1] : SCREEN_OF[c.name.split('.')[0]];
    this.setState({ palette:false, ...(screen ? { screen } : {}) });
    if (c.name === 'app.command_palette') return this.openP();
    // Importing needs a file: ⌘K opens the Breakdown's drop zone, and the file drop runs the action (P2).
    if (c.name === 'breakdown.import_reference') return this.setState({ bstate:'empty' });
    const needs = (c.input && c.input.required) || [];
    if (needs.length) return this.toast(`Set ${needs.join(', ')} on the ${TITLES[screen] || 'screen'} to run this`, c.name);
    this.run(c.name, c.title);
  }

  aiState() {
    const { preview, settings, engineUp } = this.state;
    if (preview.ai) return preview.ai;
    if (!engineUp) return 'offline';
    if (!settings || settings.api.provider === 'none') return 'not-connected';
    if (settings.api.used_inr >= settings.api.cap_inr) return 'cap';
    return 'connected';
  }

  render() {
    const view = super.render();
    const { screen, preview, engineUp } = this.state;
    return React.createElement(React.Fragment, null, view,
      React.createElement(StatusLayer, { sample: !REAL_SCREENS.has(screen), screen, engineUp, preview: !!(preview.ai || preview.b) }));
  }

  renderVals() {
    const { screen, palette, pq, psel, toast, settings } = this.state;
    const theme = this.state.theme || this.props.theme || 'dark';
    const aiState = this.aiState();
    const noAi = !!(settings && settings.no_ai);
    const bstate = this.state.bstate || this.state.preview.b || 'ready';
    const aiOk = !noAi && aiState === 'connected';
    const aiMsg = noAi ? 'No AI mode is on' : aiState === 'not-connected' ? 'AI not connected' : aiState === 'cap' ? 'Monthly spend cap reached' : aiState === 'offline' ? 'Offline' : '';
    const cap = settings ? settings.api : { cap_inr:0, used_inr:0 };
    const pill = noAi ? { label:'No AI mode', dot:'var(--tx3)', tip:'Everything works by hand' }
      : aiState === 'connected' ? { label:'AI ready · API key', dot:'var(--acc)', tip:`₹${cap.used_inr} of ₹${cap.cap_inr} used` }
      : aiState === 'not-connected' ? { label:'AI not connected', dot:'var(--tx3)', tip:'Manual tools work. Connect Claude Code in Settings, or add an API key (phase P4).' }
      : aiState === 'cap' ? { label:'Spend cap reached', dot:'var(--warn)', tip:`₹${cap.used_inr} of ₹${cap.cap_inr} used this month` }
      : { label:'Engine offline', dot:'var(--warn)', tip:'Start Look Lab with npm start' };
    const mk = n => ({ ...n, go: () => this.nav(n.id), bg: screen === n.id ? 'var(--bg3)' : 'transparent', color: screen === n.id ? 'var(--tx)' : 'var(--tx3)', bar: screen === n.id ? 'var(--acc)' : 'transparent' });
    const res = this.results();
    const is = {}; Object.keys(TITLES).forEach(k => is[k] = screen === k);
    return {
      theme, is, screenTitle: TITLES[screen], aiPill: pill, aiOk, aiMsg, aiState, noAi, bstate,
      offline: aiState === 'offline' && !!this.state.preview.ai,
      navTop: NAV.map(mk), navBottom: NAV_B.map(mk),
      nav: this.nav, run: this.run,
      setBstate: b => this.setState({ bstate:b }),
      setNoAi: v => this.setState(s => ({ settings: s.settings ? { ...s.settings, no_ai:v } : s.settings })),
      setTheme: t => { try { localStorage.setItem('looklab.theme', t); } catch (e) {} this.setState({ theme:t }); },
      goProjects: () => this.nav('projects'), goSettings: () => this.nav('settings'),
      openPalette: () => this.openP(), closePalette: () => this.closeP(), stop: e => e.stopPropagation(),
      palette, pq, pRef: this.pRef,
      onPq: e => this.setState({ pq:e.target.value, psel:0 }),
      results: res.map((c, i) => ({ label:c.title, name:c.name, key:c.key, bg: i === psel ? 'var(--bg3)' : 'transparent', go: () => this.exec(c), hover: () => this.setState({ psel:i }) })),
      noResults: res.length === 0,
      hasToast: !!toast, toast: toast || { text:'', cmd:'' },
    };
  }
}

Shell.view = ShellView;
Shell.defaultProps = defaults;
