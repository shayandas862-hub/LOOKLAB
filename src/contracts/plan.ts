import { z } from 'zod';
import { Id, Meta, Source } from './value.ts';

export const PlanObjectKind = z.enum(['light', 'camera', 'actor', 'set']);

/** Plan coordinates in metres: origin at the room's north-west corner, x east, y south, z up (design HANDOFF §6). */
export const PlanObject = z.object({
  id: Id,
  kind: PlanObjectKind,
  label: z.string().min(1),
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite(),
  props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
});
export type PlanObject = z.infer<typeof PlanObject>;

export const MatchMetric = z.object({ label: z.string(), plan: z.string(), ref: z.string(), ok: z.boolean() });

export const SetPlan = Meta.extend({
  project_id: Id,
  shot_id: Id,
  version: z.number().int().nonnegative(),
  objects: z.array(PlanObject),
  match: z.object({ score: z.number().min(0).max(100), source: Source, metrics: z.array(MatchMetric) }).nullable(),
  saved_at: z.string().nullable(),
  history: z.array(z.array(PlanObject)).max(50).default([]),
  sample: z.boolean().default(false),
});
export type SetPlan = z.infer<typeof SetPlan>;

export const SetSheet = Meta.extend({
  project_id: Id,
  shot_id: Id,
  plan_version: z.number().int().nonnegative(),
  gear: z.array(z.object({ name: z.string(), qty: z.number().int().positive(), packed: z.boolean() })),
  camera: z.record(z.string(), z.string()),
  steps: z.array(z.string()),
  safety: z.array(z.string()),
  sample: z.boolean().default(false),
});
export type SetSheet = z.infer<typeof SetSheet>;
