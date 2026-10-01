// Breakdown: the light (P3). A person marks the face by hand (D-LL-033); breakdown.fit_light fits the key to it
// with the skin-pattern fit (D-LL-035) and writes only what met its tolerance on the held-out Blender set
// (D-LL-037), as `estimate`, never `measured` (AD-LL-010). Accuracy is known on synthetic renders only.
import { z } from 'zod';
import { Breakdown, FaceBoxRecord } from '../../contracts/index.ts';
import { defineAction, ActionError, type AnyAction } from '../registry.ts';
import { col, save, stamp, target } from '../records.ts';
import { checkFaceBox } from '../../core/light-face.ts';
import { fitSkin } from '../../core/light-skin.ts';
import { CONFIDENCE_SHOWN, WRITE } from '../../core/light-validation.ts';
import { getBreakdown, keep, loadFrame, readyReference, type BreakdownT, type Ctx } from './breakdown-shared.ts';

type Light = BreakdownT['light'];
const ASSUMED_TEXT = 'the face faces the camera from eye level (yaw 0, tilt 0), no practical lamp is in frame, the wall is of middling ' +
  'brightness (D-LL-033); key colour assumes an average skin colour';
const r4 = (v: number) => Math.round(v * 10_000) / 10_000;

/** The measured frame of a shot, or a refusal that says what to do first. */
async function measuredFrame(ctx: Ctx, p: string, b: BreakdownT, index: number | null) {
  if (index === null || !b.reference_id) {
    throw new ActionError('invalid_input', '', 'this shot has no measured frame yet: import a reference and measure it (breakdown.analyse) first');
  }
  return loadFrame(ctx, p, await readyReference(ctx, p, b.reference_id), index);
}

function hardnessOf(soft: number): string {
  return soft > 0.65 ? 'soft' : soft < 0.3 ? 'hard' : 'medium-soft';
}

export const lightActions: AnyAction[] = [
  defineAction({
    name: 'breakdown.set_face',
    title: 'Mark the face',
    description:
      'Records a box drawn by hand around the face on the measured frame, hairline to chin and cheek to cheek, as fractions of the ' +
      'frame (0 = left / top). breakdown.fit_light fits the light on it. Source "manual"; a face detector (T1) comes later (D-LL-033).',
    tier: 'T0', effect: 'write', command: false,
    input: z.object({ ...target, x: FaceBoxRecord.shape.x, y: FaceBoxRecord.shape.y, w: FaceBoxRecord.shape.w, h: FaceBoxRecord.shape.h }),
    output: z.object({ face: FaceBoxRecord, frame_index: z.number().int(), source: z.literal('manual') }),
    handler: async (ctx, i) => {
      const b = await getBreakdown(ctx, i.project_id, i.shot_id);
      const px = await measuredFrame(ctx, i.project_id, b, b.frame_index);
      const box = { x: r4(i.x), y: r4(i.y), w: r4(i.w), h: r4(i.h) };
      try {
        checkFaceBox(px, box);
      } catch (e) {
        throw new ActionError('invalid_input', '', e instanceof RangeError ? e.message : 'the face box could not be checked');
      }
      const face = { ...box, frame_index: b.frame_index! };
      await save(ctx, Breakdown, col.breakdowns(i.project_id), i.shot_id, stamp(ctx, { ...b, face }));
      return { face, frame_index: face.frame_index, source: 'manual' as const };
    },
  }),
  defineAction({
    name: 'breakdown.fit_light',
    title: 'Fit light to reference',
    description:
      'Fits the key light to the face marked on the frame (breakdown.set_face): azimuth and elevation relative to the camera, and colour ' +
      'temperature, written as estimates (source "estimate", never "measured"); direction carries a confidence score (a rank, not a ' +
      'probability). Fill ratio and hardness are not written: they missed their tolerance on the held-out Blender set. Values set by hand ' +
      'are kept. Assumes the face points at the camera from eye level. Checked on synthetic Blender renders only; nothing is claimed for ' +
      'real footage (docs/validation.md).',
    tier: 'T0', effect: 'write', rules: ['R4', 'R6', 'R7', 'R8'], key: '⌘⇧L',
    input: z.object(target),
    output: z.object({
      light: Breakdown.shape.light,
      fit: z.object({
        frame_index: z.number().int(), face: FaceBoxRecord, residual: z.number(), confidence: z.number().nullable(), steps: z.number().int(),
        written: z.array(z.string()), not_written: z.array(z.string()), assumed: z.string(),
      }),
    }),
    handler: async (ctx, i) => {
      const b = await getBreakdown(ctx, i.project_id, i.shot_id);
      if (!b.face) {
        throw new ActionError('invalid_input', '', 'this shot has no face box: drag a box around the face on the frame (hairline to chin, ' +
          'cheek to cheek), or call breakdown.set_face, then fit the light');
      }
      const px = await measuredFrame(ctx, i.project_id, b, b.face.frame_index);
      const r = fitSkin(px, b.face);
      const now = ctx.now(), by = 'breakdown.fit_light';
      const est = <T>(value: T, unit: string, confidence?: number) =>
        ({ value, unit, source: 'estimate' as const, ...(confidence === undefined ? {} : { confidence }), updated_by: by, updated_at: now });
      const conf = CONFIDENCE_SHOWN ? r.score : undefined;
      const fresh: Partial<Light> = {
        key_az: est(Math.round(r.light.az), '°', conf),
        key_el: est(Math.round(r.light.el), '°', conf),
        ...(WRITE.kelvin ? { key_kelvin: est(Math.round(r.light.kel / 50) * 50, 'K') } : {}),
        ...(WRITE.fill ? { ratio: est(Math.round(Math.pow(2, r.light.fill) * 10) / 10, ':1') } : {}),
        ...(WRITE.hardness ? { key_hardness: est(hardnessOf(r.light.soft), '') } : {}),
      };
      const light = { ...b.light } as Light;
      const written: string[] = [];
      for (const [k, v] of Object.entries(fresh) as [keyof Light, Light[keyof Light]][]) {
        const kept = keep(b.light[k], v);
        (light as Record<string, unknown>)[k] = kept;
        if (kept === v) written.push(`light.${k}`);
      }
      const not_written = (Object.keys(b.light) as (keyof Light)[]).map((k) => `light.${k}`).filter((k) => !written.includes(k));
      await save(ctx, Breakdown, col.breakdowns(i.project_id), i.shot_id, stamp(ctx, { ...b, light }));
      return {
        light,
        fit: {
          frame_index: b.face.frame_index, face: b.face, residual: r4(r.err), confidence: conf ?? null, steps: r.steps,
          written, not_written, assumed: ASSUMED_TEXT,
        },
      };
    },
  }),
];
