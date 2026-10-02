// An in-memory action context for tests: no disk, no network, a fixed clock.
import { Settings, type Decision, type Via } from '../../src/contracts/index.ts';
import type { ActionContext } from '../../src/actions/context.ts';
import { MemoryStore } from '../../src/engine/store.ts';
import { EventBus } from '../../src/engine/events.ts';
import { NoAiProvider, type AiProvider } from '../../src/engine/ai.ts';
import { EmptyKeychain, type SecretStore } from '../../src/engine/keychain.ts';

export function memoryContext(opts: { ai?: AiProvider; keychain?: SecretStore; start?: string } = {}) {
  const store = new MemoryStore();
  const decisions: Decision[] = [];
  const settings = Settings.parse({ schema_version: 1, api: {} });
  const events = new EventBus();
  let clock = Date.parse(opts.start ?? '2026-09-30T12:00:00Z');
  const base = {
    store,
    events,
    ai: opts.ai ?? new NoAiProvider(),
    keychain: opts.keychain ?? new EmptyKeychain(),
    user: 'tester',
    workspace: 'local',
    now: () => new Date((clock += 1000)).toISOString(),
    settings: async () => settings,
    saveSettings: async (s: Settings) => Object.assign(settings, s),
    logDecision: async (d: Decision) => void decisions.push(d),
    listDecisions: async () => {
      const verdicts = new Map((await store.readStream<{ decision_id: string; verdict: 'agreed' | 'overridden' }>('verdicts')).map((v) => [v.decision_id, v.verdict]));
      return decisions.map((d) => ({ ...d, verdict: verdicts.get(d.id) ?? d.verdict }));
    },
    mcpCommand: () => 'claude mcp add --transport http looklab http://127.0.0.1:0/mcp',
    engineInfo: () => ({ mcp_last_seen: null, tools: 0 }),
  };
  return {
    store,
    decisions,
    settings,
    events,
    /** Moves the test clock (an ISO time). */
    setClock: (iso: string) => void (clock = Date.parse(iso)),
    for: (via: Via): ActionContext => ({ ...base, via }),
  };
}
