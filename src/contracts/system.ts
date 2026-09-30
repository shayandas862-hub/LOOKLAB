import { z } from 'zod';
import { Id } from './value.ts';

export const Tier = z.enum(['T0', 'T1', 'T2', 'T3']);
export type Tier = z.infer<typeof Tier>;
export const Via = z.enum(['ui', 'mcp', 'cli', 'test']);
export type Via = z.infer<typeof Via>;
export const Verdict = z.enum(['agreed', 'overridden']);

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
  }),
  cloud_allowed_projects: z.array(Id).default([]),
});
export type Settings = z.infer<typeof Settings>;
