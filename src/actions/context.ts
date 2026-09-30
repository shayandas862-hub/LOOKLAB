import type { Decision, Settings, Via } from '../contracts/index.ts';
import type { Store } from '../engine/store.ts';
import type { EventBus } from '../engine/events.ts';
import type { AiProvider } from '../engine/ai.ts';

/** Everything an action handler may touch. Handlers never reach the disk, network or clock any other way. */
export interface ActionContext {
  store: Store;
  events: EventBus;
  ai: AiProvider;
  via: Via;
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
