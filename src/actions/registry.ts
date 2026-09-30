// The action registry: the only way state changes (AD-LL-002).
import { z } from 'zod';
import type { Decision, Tier, Via } from '../contracts/index.ts';
import type { ActionContext } from './context.ts';

export type Effect = 'read' | 'write' | 'spend' | 'upload' | 'delete';

export interface ActionDef<I extends z.ZodObject = z.ZodObject, O extends z.ZodType = z.ZodType> {
  name: string;
  title: string;
  description: string;
  tier: Tier;
  effect: Effect;
  /** A person approves before it writes. Refused over MCP until the approval queue exists (D-LL-017). */
  confirm?: boolean;
  /** Needs a T1/T2 model; refused in No AI mode. */
  ai?: boolean;
  /** Returns sample output where a real instrument or model will go (standing rule 2). */
  standIn?: boolean;
  /** Shown as a command (button / ⌘K). False for getters an agent uses to read state. */
  command?: boolean;
  /** Keyboard shortcut shown in ⌘K. */
  key?: string;
  rules?: string[];
  /** Largest request body the engine reads for this action over HTTP. Default 1 MB (DEFAULT_MAX_BYTES). */
  maxBytes?: number;
  /** False for high-volume plumbing (one call per video frame) that makes no decision; failures are still logged. */
  logged?: boolean;
  input: I;
  output: O;
  handler: (ctx: ActionContext, input: z.output<I>) => Promise<z.input<O>>;
}

export type AnyAction = ActionDef<z.ZodObject, z.ZodType>;

export const DEFAULT_MAX_BYTES = 1_000_000;

export type ErrorCode =
  | 'unknown_action'
  | 'invalid_input'
  | 'invalid_output'
  | 'needs_approval'
  | 'ai_unavailable'
  | 'not_found'
  | 'failed';

export class ActionError extends Error {
  code: ErrorCode;
  action: string;
  constructor(code: ErrorCode, action: string, message: string) {
    super(message);
    this.code = code;
    this.action = action;
  }
}

export interface Envelope<T = unknown> {
  action: string;
  result: T;
  stand_in: boolean;
}

const NAME = /^[a-z]+\.[a-z][a-z0-9_]*$/;

export function defineAction<I extends z.ZodObject, O extends z.ZodType>(def: ActionDef<I, O>): ActionDef<I, O> {
  if (!NAME.test(def.name)) throw new Error(`action name "${def.name}" must be <domain>.<verb_noun>, lowercase`);
  return { confirm: false, ai: false, standIn: false, command: true, rules: [], ...def };
}

/** MCP tool name: first dot → underscore. Domains hold no underscore, so this is one-to-one (D-LL-016). */
export function mcpName(action: string): string {
  return action.replace('.', '_');
}

function issuesText(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join('.') || '(input)'}: ${i.message}`).join('; ');
}

const SECRET_FIELD = /key|token|secret|password/i;

/** A short, log-safe summary: secret-looking fields are redacted before anything is written (standing rule 6). */
function brief(value: unknown, max = 240): string {
  const s = JSON.stringify(value, (k, v) => (k && SECRET_FIELD.test(k) && typeof v === 'string' ? '[redacted]' : v)) ?? '';
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

export class Registry {
  private byName = new Map<string, AnyAction>();
  private byMcp = new Map<string, AnyAction>();

  constructor(actions: AnyAction[]) {
    for (const a of actions) {
      if (this.byName.has(a.name)) throw new Error(`action "${a.name}" registered twice`);
      this.byName.set(a.name, a);
      this.byMcp.set(mcpName(a.name), a);
    }
  }

  list(): AnyAction[] {
    return [...this.byName.values()];
  }

  get(name: string): AnyAction | undefined {
    return this.byName.get(name);
  }

  fromMcpName(tool: string): AnyAction | undefined {
    return this.byMcp.get(tool);
  }

  async invoke(name: string, raw: unknown, ctx: ActionContext): Promise<Envelope> {
    const action = this.byName.get(name);
    if (!action) throw new ActionError('unknown_action', name, `no action named "${name}"`);
    const started = ctx.now();
    let inputSummary = brief(raw ?? {});
    try {
      const parsed = action.input.safeParse(raw ?? {});
      if (!parsed.success) throw new ActionError('invalid_input', name, `${name}: ${issuesText(parsed.error)}`);
      inputSummary = brief(parsed.data);
      if (action.confirm && ctx.via === 'mcp') {
        throw new ActionError(
          'needs_approval',
          name,
          `${name} needs a person's approval. Run it from the Look Lab window; approval over MCP is not built yet (D-LL-017).`,
        );
      }
      if (action.ai && (await ctx.settings()).no_ai) {
        throw new ActionError('ai_unavailable', name, `${name} uses AI and No AI mode is on. Enter the value by hand.`);
      }
      const out = await action.handler(ctx, parsed.data);
      const checked = action.output.safeParse(out);
      if (!checked.success) throw new ActionError('invalid_output', name, `${name} broke its output contract: ${issuesText(checked.error)}`);
      if (this.logged(action)) await this.log(ctx, action, started, inputSummary, brief(checked.data), true);
      ctx.events.emit({ type: 'action', action: name, via: ctx.via, ok: true, stand_in: !!action.standIn });
      return { action: name, result: checked.data, stand_in: !!action.standIn };
    } catch (e) {
      const err = e instanceof ActionError ? e : new ActionError('failed', name, `${name} failed: ${(e as Error).message}`);
      if (!err.action) err.action = name;
      await this.log(ctx, action, started, inputSummary, `${err.code}: ${err.message}`, false);
      ctx.events.emit({ type: 'action', action: name, via: ctx.via, ok: false, stand_in: !!action.standIn });
      throw err;
    }
  }

  /** Writes, model calls and stand-ins are decisions worth a row; plain reads are not. */
  private logged(a: AnyAction): boolean {
    if (a.logged === false) return false;
    return a.effect !== 'read' || !!a.ai || !!a.standIn || a.tier === 'T3';
  }

  private async log(ctx: ActionContext, a: AnyAction, time: string, inputs: string, result: string, ok: boolean) {
    const shot = /"shot_id":"([^"]+)"/.exec(inputs)?.[1] ?? null;
    const row: Decision = {
      schema_version: 1,
      id: `d-${Date.parse(time).toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      time,
      workspace_id: ctx.workspace,
      by: ctx.user,
      via: ctx.via,
      command: a.name,
      tier: a.tier,
      rule_id: a.rules?.[0] ?? null,
      shot_id: shot,
      inputs,
      result,
      ok,
      stand_in: !!a.standIn,
      confidence: null,
      cost_inr: 0,
      verdict: null,
    };
    await ctx.logDecision(row);
  }
}
