import { z } from 'zod';
import { Hex, Id, Meta, NumValue, TextValue, valueOf } from './value.ts';

/** A point on the frame as a fraction of its width and height (0 = left / top). */
export const FramePoint = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) });

/** `at`: where on the analysis frame the swatch was sampled (P2; absent on the design's sample palette). */
export const Swatch = z.object({ hex: Hex, share: NumValue, at: FramePoint.optional() });

/**
 * A face box drawn by hand on one sampled frame (P3, D-LL-033): hairline to chin, cheek to cheek, as fractions of
 * the frame, and the frame it was drawn on. breakdown.fit_light fits the light on it.
 */
export const FaceBoxRecord = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().gt(0).max(1),
  h: z.number().gt(0).max(1),
  frame_index: z.number().int().nonnegative(),
});

const GM_DEFAULT = { value: 0, unit: 'Duv', source: 'sample' as const, updated_by: 'P-LL-001 default', updated_at: '2026-10-02T00:00:00.000Z' };

export const Breakdown = Meta.extend({
  project_id: Id,
  shot_id: Id,
  reference_id: Id.nullable(),
  /** The sampled frame of the reference that was measured (P2). */
  frame_index: z.number().int().nonnegative().nullable().default(null),
  /** Where a person clicked the subject (D-LL-028). */
  subject: FramePoint.nullable().default(null),
  /** The face box a person drew (D-LL-033). */
  face: FaceBoxRecord.nullable().default(null),
  palette: z.array(Swatch).max(12),
  tints: z.object({ shadow: TextValue, mid: TextValue, highlight: TextValue }),
  /** Mean colour of each tint zone, when measured. */
  tint_hex: z.object({ shadow: Hex.nullable(), mid: Hex.nullable(), highlight: Hex.nullable() }).nullable().default(null),
  saturation: NumValue,
  contrast_stops: NumValue,
  light: z.object({
    key_az: NumValue,
    key_el: NumValue,
    key_hardness: TextValue,
    key_kelvin: NumValue,
    key_type: TextValue,
    fill_kelvin: NumValue,
    fill_kind: TextValue,
    ratio: NumValue,
    practicals: TextValue,
    /** Green–magenta of each source, as Duv (positive green); nothing in a frame measures it (AD-LL-016). */
    key_gm: NumValue.default(GM_DEFAULT),
    fill_gm: NumValue.default(GM_DEFAULT),
  }),
  lens: z.object({ focal_mm: NumValue, dof: TextValue, height_m: NumValue, angle: TextValue, movement: TextValue }),
  framing: z.object({ size: TextValue, subject_pos: TextValue, lead_room: TextValue, aspect: TextValue }),
  mood: valueOf(z.array(z.string())),
  reviewed: z.array(z.string()).default([]),
});
export type Breakdown = z.infer<typeof Breakdown>;

/** Dotted paths a person may edit by hand (`breakdown.edit_value`). `mood` takes words separated by commas (P4). */
export const EDITABLE_FIELDS = [
  'mood',
  'saturation', 'contrast_stops',
  'light.key_az', 'light.key_el', 'light.key_hardness', 'light.key_kelvin', 'light.key_type',
  'light.fill_kelvin', 'light.fill_kind', 'light.ratio', 'light.practicals', 'light.key_gm', 'light.fill_gm',
  'lens.focal_mm', 'lens.dof', 'lens.height_m', 'lens.angle', 'lens.movement',
  'framing.size', 'framing.subject_pos', 'framing.lead_room', 'framing.aspect',
  'tints.shadow', 'tints.mid', 'tints.highlight',
] as const;
export const EditableField = z.enum(EDITABLE_FIELDS);
