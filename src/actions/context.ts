import type { Decision, DecisionAi, Settings, Via } from '../contracts/index.ts';
import type { Store } from '../engine/store.ts';
import type { EventBus } from '../engine/events.ts';
import type { AiProvider } from '../engine/ai.ts';
import type { SecretStore } from '../engine/keychain.ts';

/**
 * What one call through the registry spent and decided, filled in by the handler (through callModel) and written to
 * its decision row by the registry, whether the call succeeds or fails (AD-LL-012).
 */
export interface CallMeter {
  /** The id the decision row will have, known before the handler runs so a value can cite it (AD-LL-013). */
  decision_id: string;
  cost_inr: number;
  confidence: number | null;
  /** A rule that decided this call's routing, when it is not the action's first rule (R5: sent to review). */
  rule_id: string | null;
  ai: DecisionAi | null;
}

/** Everything an action handler may touch. Handlers never reach the disk, network or clock any other way. */
export interface ActionContext {
  store: Store;
  events: EventBus;
  ai: AiProvider;
  /** The macOS Keychain (an empty one in tests and wherever none is given): the only place a key lives. */
  keychain: SecretStore;
  via: Via;
  /** Set by the registry for each call (absent when a handler is called directly). */
  call?: CallMeter;
  user: string;
  workspace: string;
  now(): string;
  settings(): Promise<Settings>;
  saveSettings(s: Settings): Promise<unknown>;
  logDecision(d: Decision): Promise<void>;
  listDecisions(): Promise<Decision[]>;
  /** The `claude mcp add` command for this engine, without the token value. */
  mcpCommand(): string;
  /** Facts only the engine knows: when an MCP client last called, how many tools it offers. */
  engineInfo(): { mcp_last_seen: string | null; tools: number };
}
