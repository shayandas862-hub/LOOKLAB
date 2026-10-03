// Where each kind of record lives in the store, and typed load/save helpers for handlers.
import type { z } from 'zod';
import { Id } from '../contracts/index.ts';
import type { ActionContext } from './context.ts';
import { ActionError } from './registry.ts';
import { SAMPLE_PROJECT, SAMPLE_SHOT } from './sample.ts';

export const col = {
  projects: 'projects',
  looks: 'looks',
  system: 'system',
  references: (p: string) => `projects/${p}/references`,
  /** Sampled analysis frames of one reference, beside its record (architecture §8). */
  frames: (p: string, ref: string) => `projects/${p}/references/${ref}/frames`,
  breakdowns: (p: string) => `projects/${p}/breakdowns`,
  locations: (p: string) => `projects/${p}/locations`,
  kits: (p: string) => `projects/${p}/kits`,
  recipes: (p: string) => `projects/${p}/recipes`,
  plans: (p: string) => `projects/${p}/plans`,
  setsheets: (p: string) => `projects/${p}/setsheets`,
  boards: (p: string) => `projects/${p}/boards`,
  /** Stills for the grade check, each with its one frame beside it (AD-LL-018). */
  stills: (p: string) => `projects/${p}/stills`,
  stillFrame: (p: string, id: string) => `projects/${p}/stills/${id}`,
  gradechecks: (p: string) => `projects/${p}/gradechecks`,
};

/** The input fields most actions share. Defaults point at the sample shot until projects are real. */
export const target = {
  project_id: Id.default(SAMPLE_PROJECT),
  shot_id: Id.default(SAMPLE_SHOT),
};

export async function load<S extends z.ZodType>(ctx: ActionContext, schema: S, collection: string, id: string, what: string): Promise<z.output<S>> {
  const raw = await ctx.store.get(collection, id);
  if (raw === null) throw new ActionError('not_found', '', `${what} "${id}" not found`);
  return schema.parse(raw);
}

export async function save<S extends z.ZodType>(ctx: ActionContext, schema: S, collection: string, id: string, doc: z.input<S>): Promise<z.output<S>> {
  const checked = schema.parse(doc);
  await ctx.store.put(collection, id, checked);
  return checked;
}

export function stamp<T extends { updated_at: string }>(ctx: ActionContext, doc: T): T {
  return { ...doc, updated_at: ctx.now() };
}

export function meta(ctx: ActionContext, id: string) {
  const now = ctx.now();
  return { schema_version: 1 as const, id, workspace_id: ctx.workspace, created_by: ctx.user, created_at: now, updated_at: now };
}
