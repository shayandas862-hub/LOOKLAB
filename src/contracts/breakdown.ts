import { z } from 'zod';
import { Hex, Id, Meta, NumValue, TextValue, valueOf } from './value.ts';

export const Swatch = z.object({ hex: Hex, share: NumValue });

export const Breakdown = Meta.extend({
  project_id: Id,
  shot_id: Id,
  reference_id: Id.nullable(),
  palette: z.array(Swatch).max(12),
  tints: z.object({ shadow: TextValue, mid: TextValue, highlight: TextValue }),
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
  }),
  lens: z.object({ focal_mm: NumValue, dof: TextValue, height_m: NumValue, angle: TextValue, movement: TextValue }),
  framing: z.object({ size: TextValue, subject_pos: TextValue, lead_room: TextValue, aspect: TextValue }),
  mood: valueOf(z.array(z.string())),
  reviewed: z.array(z.string()).default([]),
});
export type Breakdown = z.infer<typeof Breakdown>;

/** Dotted paths a person may edit by hand (`breakdown.edit_value`). */
export const EDITABLE_FIELDS = [
  'saturation', 'contrast_stops',
  'light.key_az', 'light.key_el', 'light.key_hardness', 'light.key_kelvin', 'light.key_type',
  'light.fill_kelvin', 'light.fill_kind', 'light.ratio', 'light.practicals',
  'lens.focal_mm', 'lens.dof', 'lens.height_m', 'lens.angle', 'lens.movement',
  'framing.size', 'framing.subject_pos', 'framing.lead_room', 'framing.aspect',
  'tints.shadow', 'tints.mid', 'tints.highlight',
] as const;
export const EditableField = z.enum(EDITABLE_FIELDS);
