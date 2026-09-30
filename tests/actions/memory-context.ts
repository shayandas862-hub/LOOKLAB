// An in-memory action context for tests: no disk, no network, a fixed clock.
import { Settings, type Decision, type Via } from '../../src/contracts/index.ts';
import type { ActionContext } from '../../src/actions/context.ts';
import { MemoryStore } from '../../src/engine/store.ts';
import { EventBus } from '../../src/engine/events.ts';
import { NoAiProvider } from '../../src/engine/ai.ts';

export function memoryContext() {
  const store = new MemoryStore();
  const decisions: Decision[] = [];
  const settings = Settings.parse({ schema_version: 1, api: {} });
  const events = new EventBus();
  let clock = Date.parse('2026-09-30T12:00:00Z');
  const base = {
    store,
    events,
    ai: new NoAiProvider(),
    user: 'tester',
    workspace: 'local',
    now: () => new Date((clock += 1000)).toISOString(),
    settings: async () => settings,
    saveSettings: async (s: Settings) => Object.assign(settings, s),
    logDecision: async (d: Decision) => void decisions.push(d),
    listDecisions: async () => decisions,
    mcpCommand: () => 'claude mcp add --transport http looklab http://127.0.0.1:0/mcp',
    engineInfo: () => ({ mcp_last_seen: null, tools: 0 }),
  };
  return {
    store,
    decisions,
    settings,
    events,
    for: (via: Via): ActionContext => ({ ...base, via }),
  };
}
