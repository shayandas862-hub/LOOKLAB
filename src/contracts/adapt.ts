import { z } from 'zod';
import { Id, Meta, Source } from './value.ts';

export const Location = Meta.extend({
  project_id: Id,
  name: z.string().min(1),
  floor: z.object({ w_m: z.number().positive(), d_m: z.number().positive(), ceiling_m: z.number().positive() }),
  windows: z.array(z.object({ wall: z.enum(['north', 'east', 'south', 'west']), width_m: z.number().positive() })).default([]),
  power: z.array(z.object({ id: Id, amps: z.number().positive(), shared_with: z.string().nullable().default(null) })).default([]),
  hours: z.object({ from: z.string(), to: z.string() }),
  sample: z.boolean().default(false),
});
export type Location = z.infer<typeof Location>;

export const KitItem = z.object({
  id: Id,
  name: z.string().min(1),
  qty: z.number().int().positive(),
  available: z.boolean().default(true),
  category: z.enum(['light', 'modifier', 'gel', 'grip', 'camera', 'lens', 'other']).default('other'),
  watts: z.number().nonnegative().nullable().default(null),
});
export type KitItem = z.infer<typeof KitItem>;

export const Kit = Meta.extend({
  project_id: Id,
  items: z.array(KitItem).default([]),
  camera: z.object({ body: z.string(), lenses_mm: z.array(z.number().positive()) }),
  crew: z.array(z.string()).default([]),
  sample: z.boolean().default(false),
});
export type Kit = z.infer<typeof Kit>;

export const RecipeStep = z.object({
  n: z.number().int().positive(),
  title: z.string(),
  text: z.string(),
  source: Source,
  confidence: z.number().min(0).max(100).optional(),
});

export const Recipe = Meta.extend({
  project_id: Id,
  shot_id: Id,
  source: Source,
  steps: z.array(RecipeStep),
  gaps: z.array(z.object({ text: z.string(), fix: z.string().nullable().default(null) })).default([]),
  risks: z.array(z.object({ text: z.string(), fix: z.string().nullable().default(null) })).default([]),
  approved: z.boolean().default(false),
});
export type Recipe = z.infer<typeof Recipe>;
