// The in-app AI's prompts, versioned (P4). Each call writes its prompt id, version and the exact text sent to its
// decision row (AD-LL-012). A change to a prompt's wording is a new version. What leaves the machine is built here
// and only here: numbers and words from the breakdown that are not sample, never pixels, file names or paths (D-LL-039).
import { z } from 'zod';
import type { Breakdown } from '../contracts/index.ts';

type B = z.infer<typeof Breakdown>;
type Leaf = { value: unknown; unit?: string; source: string; confidence?: number };

/** A value as it is sent: its value, unit and source; a sample value is not sent at all. */
function fact(v: Leaf) {
  if (v.source === 'sample') return undefined;
  return { value: v.value, ...(v.unit ? { unit: v.unit } : {}), source: v.source, ...(v.source === 'ai' ? { confidence: v.confidence } : {}) };
}

/** Drops empty groups, so a group with nothing real in it is not sent. */
function pruned(o: Record<string, unknown>): Record<string, unknown> | undefined {
  const kept = Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
  return Object.keys(kept).length ? kept : undefined;
}

/** Everything about a shot a model may see. `mood` is left out when the model is choosing the mood. */
export function breakdownFacts(b: B, opts: { mood: boolean }): Record<string, unknown> {
  const L = b.light, N = b.lens, F = b.framing;
  return pruned({
    palette: b.palette.filter((p) => p.share.source !== 'sample').map((p) => ({ hex: p.hex, share_pct: p.share.value, source: p.share.source })),
    tints: pruned({ shadow: fact(b.tints.shadow), mid: fact(b.tints.mid), highlight: fact(b.tints.highlight) }),
    saturation_pct: fact(b.saturation),
    contrast_stops: fact(b.contrast_stops),
    light: pruned({
      key_azimuth_deg: fact(L.key_az), key_elevation_deg: fact(L.key_el), key_colour_kelvin: fact(L.key_kelvin), key_hardness: fact(L.key_hardness),
      key_type: fact(L.key_type), fill_kelvin: fact(L.fill_kelvin), fill_kind: fact(L.fill_kind), key_fill_ratio: fact(L.ratio), practicals: fact(L.practicals),
    }),
    lens: pruned({ focal_mm: fact(N.focal_mm), depth_of_field: fact(N.dof), camera_height_m: fact(N.height_m), angle: fact(N.angle), movement: fact(N.movement) }),
    framing: pruned({ shot_size: fact(F.size), subject_position: fact(F.subject_pos), lead_room: fact(F.lead_room), aspect: fact(F.aspect) }),
    mood: opts.mood ? fact(b.mood) : undefined,
  }) ?? {};
}

const SOURCES =
  'Each value has a source: "measured" (computed from the pixels), "estimate" (a model fitted to the pixels; it can be wrong), ' +
  '"metadata" (read from the file\'s own tags), "manual" (a person set it), "ai" (an earlier model answer). You do not see the image.';

export const MOOD_PROMPT = {
  prompt_id: 'breakdown.fit_mood',
  prompt_version: 1,
  maxTokens: 1024,
  effort: 'low' as const,
  system: [
    'Look Lab prompt: breakdown.fit_mood v1',
    'You help a film crew name the mood of one reference shot. You are given numbers and words Look Lab measured or a person set: ' +
      'the palette (hex colour and its share of the frame), the shadow, mid and highlight tints, saturation, contrast in stops, and, when ' +
      'known, the key light, the lens and the framing. ' + SOURCES,
    'Return one to five mood words or short phrases a director or DP would use (for example "lonely", "warm–cold tension", "neo-noir"). ' +
      'Words only: no numbers, colour codes or camera settings. Then a confidence from 0 to 100: how sure you are that these words fit, ' +
      'given only these values. Then one sentence on why, naming the values you relied on.',
  ].join('\n'),
  schema: {
    type: 'object',
    properties: { words: { type: 'array', items: { type: 'string' } }, confidence: { type: 'integer' }, why: { type: 'string' } },
    required: ['words', 'confidence', 'why'],
    additionalProperties: false,
  },
  parse: z.object({
    words: z.array(z.string().trim().min(1).max(40).regex(/^\p{L}[\p{L}\s'’–—-]*$/u, 'mood words are words: no digits or symbols')).min(1).max(5),
    confidence: z.number().int().min(0).max(100),
    why: z.string().max(400),
  }),
};

export const ASK_PROMPT = {
  prompt_id: 'breakdown.ask',
  prompt_version: 1,
  maxTokens: 2048,
  effort: 'low' as const,
  system: [
    'Look Lab prompt: breakdown.ask v1',
    'You answer a film crew\'s question about one reference shot from the breakdown Look Lab measured, which comes with the question. ' + SOURCES,
    'Rules: answer in plain words for a DP, gaffer or director, in at most 120 words. Quote a number or a colour code only if it appears ' +
      'in the breakdown or in the question; never compute, convert or estimate a new number, and write counts in words. You may describe ' +
      'a colour strategy in words (put the colour in the light, or capture neutral and grade, or both), but every capture number (white ' +
      'balance, gel, ISO, exposure, ASC CDL, LUT) is computed by Look Lab\'s own maths in its colour phase, P4.5: say so instead of giving ' +
      'one. Say when a value is an estimate or set by hand, and when the breakdown does not hold what the question needs.',
    'Return the answer, then a confidence from 0 to 100: how sure you are that the answer is right, given only this breakdown.',
  ].join('\n'),
  schema: {
    type: 'object',
    properties: { answer: { type: 'string' }, confidence: { type: 'integer' } },
    required: ['answer', 'confidence'],
    additionalProperties: false,
  },
  parse: z.object({ answer: z.string().trim().min(1).max(1500), confidence: z.number().int().min(0).max(100) }),
};
