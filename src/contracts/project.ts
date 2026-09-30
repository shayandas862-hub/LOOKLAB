import { z } from 'zod';
import { Id, Meta } from './value.ts';

export const ShotStatus = z.enum(['reference', 'planned', 'sheet_ready']);

export const Shot = z.object({
  id: Id,
  code: z.string().min(1).max(8),
  scene_id: Id,
  desc: z.string().default(''),
  size: z.string().default(''),
  lens: z.string().default(''),
  move: z.string().default(''),
  duration_s: z.number().nonnegative().default(0),
  status: ShotStatus.default('reference'),
  reference_id: Id.nullable().default(null),
  plan_version: z.number().int().nonnegative().default(0),
});
export type Shot = z.infer<typeof Shot>;

export const Scene = z.object({ id: Id, number: z.string(), title: z.string() });

export const Project = Meta.extend({
  name: z.string().min(1).max(120),
  type: z.string().default('short film'),
  shoot_from: z.string().nullable().default(null),
  shoot_to: z.string().nullable().default(null),
  cloud_allowed: z.boolean().default(false),
  sample: z.boolean().default(false),
  scenes: z.array(Scene).default([]),
  shots: z.array(Shot).default([]),
});
export type Project = z.infer<typeof Project>;

export const ReferenceShot = z.object({ code: z.string(), in_s: z.number(), out_s: z.number() });

export const Reference = Meta.extend({
  project_id: Id,
  file_name: z.string().min(1).max(255),
  media: z.enum(['image', 'video']),
  local_only: z.boolean().default(true),
  duration_s: z.number().nonnegative().default(0),
  aspect: z.string().default(''),
  shots: z.array(ReferenceShot).default([]),
  sample: z.boolean().default(false),
});
export type Reference = z.infer<typeof Reference>;
