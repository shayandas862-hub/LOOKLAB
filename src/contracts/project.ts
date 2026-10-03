import { z } from 'zod';
import { Id, Meta, NumValue } from './value.ts';

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

/** How the production delivers and grades (AD-LL-015); P-LL-001's defaults (D-LL-051) read as sample until confirmed. */
export const ProjectColour = z.object({
  delivery: z.enum(['rec709_g24']),
  web: z.enum(['same_codes', 'converted']),
  grading_app: z.string().max(60),
  management: z.enum(['yrgb', 'rcm']),
  frame_rate: NumValue,
});
export const PROJECT_COLOUR_DEFAULT = {
  delivery: 'rec709_g24' as const, web: 'same_codes' as const, grading_app: 'DaVinci Resolve', management: 'yrgb' as const,
  frame_rate: { value: 24, unit: 'fps', source: 'sample' as const, updated_by: 'P-LL-001 default', updated_at: '2026-10-02T00:00:00.000Z' },
};

export const Project = Meta.extend({
  name: z.string().min(1).max(120),
  type: z.string().default('short film'),
  shoot_from: z.string().nullable().default(null),
  shoot_to: z.string().nullable().default(null),
  cloud_allowed: z.boolean().default(false),
  sample: z.boolean().default(false),
  scenes: z.array(Scene).default([]),
  shots: z.array(Shot).default([]),
  colour: ProjectColour.default(PROJECT_COLOUR_DEFAULT),
});
export type Project = z.infer<typeof Project>;

export const ReferenceShot = z.object({
  code: z.string(),
  in_s: z.number(),
  out_s: z.number(),
  /** Sampled frames this shot covers, and the one a breakdown measures by default (P2). */
  first: z.number().int().nonnegative().optional(),
  last: z.number().int().nonnegative().optional(),
  key_frame: z.number().int().nonnegative().optional(),
});

/** Most sampled frames one reference keeps: 5 minutes at 2 per second (D-LL-027). */
export const MAX_FRAMES = 600;
/** Longest side of an analysis frame, in pixels (D-LL-027). */
export const ANALYSIS_MAX_SIDE = 512;

/**
 * The imported file, identified by what the browser can see: name, type, size, date and content hash.
 * A web page is never told a file's path, so none is stored (D-LL-027). The file itself is not copied.
 */
export const MediaFile = z.object({
  name: z.string().min(1).max(255),
  mime: z.string().max(100),
  size_bytes: z.number().int().nonnegative(),
  last_modified: z.string().nullable(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/, 'sha256 is 64 lowercase hex characters'),
});

/**
 * The lens tags of the original file's EXIF, read in the browser at import (P3). Nothing else from EXIF is
 * kept: not the camera, the date or the location. null: the file had none, or it is a video.
 */
export const LensExif = z.object({
  focal_mm: z.number().gt(0).max(2000).nullable(),
  focal_35mm: z.number().gt(0).max(5000).nullable(),
});

export const Reference = Meta.extend({
  project_id: Id,
  file_name: z.string().min(1).max(255),
  media: z.enum(['image', 'video']),
  local_only: z.boolean().default(true),
  duration_s: z.number().nonnegative().default(0),
  aspect: z.string().default(''),
  shots: z.array(ReferenceShot).default([]),
  /** `sample` for the design's reference; null until cuts are detected; then `measured`. */
  shots_source: z.enum(['measured', 'sample']).nullable().default('sample'),
  file: MediaFile.nullable().default(null),
  /** The original's pixel size, as the browser decoded it. */
  width: z.number().int().nonnegative().default(0),
  height: z.number().int().nonnegative().default(0),
  /** Frames sampled per second (0 for an image) and how many the import planned; frame i is at i / sample_fps. */
  sample_fps: z.number().nonnegative().max(30).default(0),
  frame_count: z.number().int().nonnegative().max(MAX_FRAMES).default(0),
  exif: LensExif.nullable().default(null),
  sample: z.boolean().default(false),
});
export type Reference = z.infer<typeof Reference>;
