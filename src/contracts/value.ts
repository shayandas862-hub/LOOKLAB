import { z } from 'zod';

/**
 * Where a value came from, strongest first (AD-LL-010). `measured`: a T0 instrument on the actual pixels.
 * `manual`: a person set it. `metadata`: read from the original file's tags (EXIF), not from pixels.
 * `estimate`: a T0 fit of a model to the pixels, true only as far as the model's assumptions (D-LL-033).
 * `ai`: a model's answer, with a confidence. `sample`: placeholder data, never shown as anything else (D-LL-015).
 */
export const Source = z.enum(['measured', 'manual', 'metadata', 'estimate', 'ai', 'sample']);
export type Source = z.infer<typeof Source>;

/** A record id: letters, digits, `_` and `-`, starting with a letter or digit. Safe as a file name. */
export const Id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/, 'ids use letters, digits, _ and -');

export const Hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'a colour is #RRGGBB');

/** A measured or estimated leaf. AI values always carry a confidence 0–100. */
export function valueOf<T extends z.ZodType>(inner: T) {
  return z
    .object({
      value: inner,
      unit: z.string().optional(),
      source: Source,
      confidence: z.number().min(0).max(100).optional(),
      updated_by: z.string(),
      updated_at: z.string(),
    })
    .refine((v) => v.source !== 'ai' || v.confidence !== undefined, {
      message: 'an AI value carries a confidence',
      path: ['confidence'],
    });
}

export const NumValue = valueOf(z.number());
export const TextValue = valueOf(z.string());
export type NumValue = z.infer<typeof NumValue>;
export type TextValue = z.infer<typeof TextValue>;

/** Fields every stored record carries, so a hosted multi-user store needs no migration (architecture §8). */
export const Meta = z.object({
  schema_version: z.literal(1),
  id: Id,
  workspace_id: Id,
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Meta = z.infer<typeof Meta>;
