import { z } from 'zod';
import { Id } from './value.ts';

export const Tier = z.enum(['T0', 'T1', 'T2', 'T3']);
export type Tier = z.infer<typeof Tier>;
export const Via = z.enum(['ui', 'mcp', 'cli', 'test']);
export type Via = z.infer<typeof Via>;
export const Verdict = z.enum(['agreed', 'overridden']);

/**
 * What a model call sent and cost (AD-LL-012): the prompt and its version, exactly what left the machine, the tokens
 * billed, the worst case it was priced at before it was sent, and the dated prices used.
 */
export const DecisionAi = z.object({
  provider: z.string(),
  model: z.string(),
  prompt_id: z.string(),
  prompt_version: z.number().int().positive(),
  sent: z.object({ system: z.string(), user: z.string() }),
  tokens_in: z.number().int().nonnegative(),
  tokens_out: z.number().int().nonnegative(),
  ms: z.number().nonnegative(),
  stop_reason: z.string(),
  worst_inr: z.number().nonnegative(),
  price: z.object({
    usd_in_per_mtok: z.number(), usd_out_per_mtok: z.number(), price_read: z.string(), inr_per_usd: z.number(), rate_date: z.string(),
  }),
});
export type DecisionAi = z.infer<typeof DecisionAi>;

/** One logged call through the registry (the Activity screen and, later, router training data). */
export const Decision = z.object({
  schema_version: z.literal(1),
  id: Id,
  time: z.string(),
  workspace_id: Id,
  by: z.string(),
  via: Via,
  command: z.string(),
  tier: Tier,
  rule_id: z.string().nullable(),
  shot_id: z.string().nullable(),
  inputs: z.string(),
  result: z.string(),
  ok: z.boolean(),
  stand_in: z.boolean(),
  confidence: z.number().min(0).max(100).nullable(),
  cost_inr: z.number().nonnegative(),
  verdict: Verdict.nullable(),
  /** Set when the action called a model (AD-LL-012); rows from before P4 read null. */
  ai: DecisionAi.nullable().default(null),
});
export type Decision = z.infer<typeof Decision>;

export const Settings = z.object({
  schema_version: z.literal(1),
  no_ai: z.boolean().default(false),
  theme: z.enum(['dark', 'light']).default('dark'),
  api: z.object({
    provider: z.enum(['none', 'anthropic']).default('none'),
    cap_inr: z.number().nonnegative().default(2000),
    used_inr: z.number().nonnegative().default(0),
    /** The UTC month used_inr belongs to, "2026-10" (AD-LL-011); a new month starts at zero. null before P4. */
    month: z.string().regex(/^\d{4}-\d{2}$/).nullable().default(null),
  }),
  cloud_allowed_projects: z.array(Id).default([]),
});
export type Settings = z.infer<typeof Settings>;
