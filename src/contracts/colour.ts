// Colour records (P4.5, P-LL-001). AD-LL-018: a still from a test shoot or a grade, and a grade check of it against
// a shot's reference. The kit's colour facts (AD-LL-014), the project's colour settings (AD-LL-015), the colour plan
// (AD-LL-016) and the capture card (AD-LL-017) join this file as they are built.
import { z } from 'zod';
import { Id, Meta, NumValue, Source, valueOf } from './value.ts';
import { MediaFile } from './project.ts';

/** A default this plan supplies, until a person confirms it: reads SAMPLE (P-LL-001 §4 conventions). */
export function sampleDefault<T>(value: T, unit?: string) {
  return { value, ...(unit ? { unit } : {}), source: 'sample' as const, updated_by: 'P-LL-001 default', updated_at: '2026-10-02T00:00:00.000Z' };
}

/**
 * Where a maker's or a standard's number came from (AD-LL-014, CLAUDE.md rule 16): the document, the page or URL, the
 * day it was read, and the licence verdict on reusing it ("typed-by-founder": typed from the founder's own copy).
 */
export const Cite = z.object({
  document: z.string().min(1).max(300),
  where: z.string().min(1).max(500),
  read: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  licence: z.enum(['ok', 'unclear', 'typed-by-founder']),
});

const BoolValue = valueOf(z.boolean());
type Leaf = { source: string } | null | undefined;
/** A block whose numbers are not all sample must say where they came from. */
const needsCite = (leaves: Leaf[], cite: unknown) => cite !== null || leaves.every((l) => !l || l.source === 'sample');
const CITE_MSG = { message: 'a number typed from a document carries its citation (cite)', path: ['cite'] };

/** One light's colour range, from its maker's sheet (AD-LL-014). */
export const LightColour = z.object({
  cct_min_k: NumValue,
  cct_max_k: NumValue,
  cct_step_k: NumValue,
  /** Green–magenta control: its range in the maker's unit, and how many Duv one unit is (null: not published). */
  gm: z.object({ min: NumValue, max: NumValue, unit: z.string().max(40), duv_per_unit: NumValue.nullable() }).nullable(),
  rgb: BoolValue,
  flicker_free: BoolValue,
  cite: Cite.nullable(),
}).refine((c) => needsCite([c.cct_min_k, c.cct_max_k, c.cct_step_k, c.gm?.min, c.gm?.max, c.rgb, c.flicker_free], c.cite), CITE_MSG);
export type LightColour = z.infer<typeof LightColour>;

/** One gel in the kit's gel book (AD-LL-014). Its shift is in mired, warmer positive (P-LL-001 §4 conventions). */
export const Gel = z.object({
  id: Id,
  maker: z.string().min(1).max(60),
  number: z.string().min(1).max(20),
  name: z.string().min(1).max(80),
  mired_shift: NumValue,
  /** The published conversion it was computed from, when the maker gives one instead of a mired value. */
  converts: z.object({ from_k: z.number().positive(), to_k: z.number().positive() }).nullable(),
  duv_shift: NumValue.nullable(),
  transmission_pct: NumValue.nullable(),
  sheets: z.number().int().nonnegative(),
  cite: Cite,
});
export type Gel = z.infer<typeof Gel>;

/** What the camera records and offers, from its maker's documents (AD-LL-014). One citation for the block. */
export const CameraRecording = z.object({
  profiles: z.array(z.object({
    name: z.string(), gamuts: z.array(z.string()), base_isos: z.array(z.number().positive()),
    clip_code: z.number().nullable(), documented_range_stops: z.number().nullable(),
  })),
  codecs: z.array(z.object({ name: z.string(), bit_depth: z.number().int(), chroma: z.enum(['4:2:0', '4:2:2', '4:4:4']), intra: z.boolean() })),
  raw: z.object({ available: z.boolean(), recorder_in_kit: z.boolean() }),
  wb: z.object({ min_k: z.number().positive(), max_k: z.number().positive(), step_k: z.number().positive() }).nullable(),
  tint: z.object({ min: z.number(), max: z.number(), unit: z.string(), duv_per_unit: z.number().nullable() }).nullable(),
  shutter_angles: z.array(z.number().positive()),
  display_luts: z.array(z.string()),
  user_lut: z.boolean().nullable(),
  source: Source,
  cite: Cite.nullable(),
}).refine((c) => needsCite([c], c.cite), CITE_MSG);

export const Monitoring = z.object({
  external: z.boolean(),
  loads_cube: z.boolean(),
  cube_sizes: z.array(z.number().int().positive()).default([]),
  source: Source,
});
export const Charts = z.object({
  colorchecker: z.enum(['none', 'classic', 'passport', 'digital_sg']),
  grey_card: z.boolean(),
  source: Source,
});

/** `display`: graded, Rec.709 Gamma 2.4 codes. `log`: S-Log3 codes straight from the camera (P-LL-001 §4.6). */
export const StillKind = z.enum(['display', 'log']);

const Box = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1), w: z.number().gt(0).max(1), h: z.number().gt(0).max(1) });
const Point = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) });

export const Still = Meta.extend({
  project_id: Id,
  shot_id: Id,
  file: MediaFile,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  kind: StillKind.default('display'),
  /** A face box drawn on the still by hand, for the skin row (D-LL-007). */
  face: Box.nullable().default(null),
  /** The chart's four corners, clockwise from top-left, for the light-colour and exposure rows. */
  chart: z.array(Point).length(4).nullable().default(null),
});
export type Still = z.infer<typeof Still>;

export const CheckVerdict = z.enum(['pass', 'close', 'far', 'listed']);
const AB = z.object({ a: z.number(), b: z.number() }).nullable();

export const GradeCheckRow = z.object({
  measure: z.string(),
  ref: z.union([z.number(), AB]),
  still: z.union([z.number(), AB]),
  diff: z.number().nullable(),
  unit: z.string(),
  verdict: CheckVerdict,
  note: z.string().optional(),
  /** Both frames were measured by the same T0 instruments. */
  source: Source,
});

export const GradeCheckSwatch = z.object({
  ref_hex: z.string(),
  ref_share: z.number(),
  still_hex: z.string().nullable(),
  still_share: z.number().nullable(),
  de00: z.number().nullable(),
  share_diff: z.number().nullable(),
  verdict: CheckVerdict,
  note: z.string().optional(),
});

export const GradeCheck = Meta.extend({
  project_id: Id,
  shot_id: Id,
  still_id: Id,
  reference_id: Id,
  frame_index: z.number().int().nonnegative(),
  /** The colour plan the check was read against, when there is one (P-LL-001 §4.6). */
  plan_version: z.number().int().nonnegative().nullable().default(null),
  lut_applied: z.boolean().default(false),
  thresholds_version: z.number().int().positive(),
  rows: z.array(GradeCheckRow),
  swatches: z.array(GradeCheckSwatch),
  extra: z.array(z.object({ hex: z.string(), share: z.number(), note: z.string() })).default([]),
});
export type GradeCheck = z.infer<typeof GradeCheck>;
