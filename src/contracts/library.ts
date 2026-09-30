import { z } from 'zod';
import { Hex, Id, Meta, Source } from './value.ts';

export const Look = Meta.extend({
  name: z.string().min(1).max(120),
  project_id: Id,
  shot_id: Id,
  source: Source,
  palette: z.array(z.object({ hex: Hex, share: z.number().min(0).max(100) })),
  key: z.object({ az: z.number(), el: z.number(), kelvin: z.number(), hardness: z.string() }),
  ratio: z.number().positive(),
  tags: z.array(z.string()).default([]),
  mood: z.array(z.string()).default([]),
});
export type Look = z.infer<typeof Look>;

export const BoardNote = z.object({ id: Id, text: z.string().min(1).max(2000), by: z.string(), at: z.string() });

export const Board = Meta.extend({
  project_id: Id,
  frames: z.array(z.object({ id: Id, cluster: z.string(), name: z.string(), reference_id: Id.nullable() })).default([]),
  notes: z.array(BoardNote).default([]),
  palette: z.array(z.object({ hex: Hex, share: z.number() })).default([]),
  palette_source: Source.default('sample'),
  sample: z.boolean().default(false),
});
export type Board = z.infer<typeof Board>;
