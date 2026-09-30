// Writes the sample project into an empty store, so every screen and action has data to work on.
import type { Store } from '../engine/store.ts';
import { col } from './records.ts';
import { SAMPLE_PROJECT as P, SAMPLE_SHOT as S, sampleSeed } from './sample.ts';

export async function seedSampleIfEmpty(store: Store, now: string, user: string, workspace: string): Promise<boolean> {
  if ((await store.list(col.projects)).length > 0) return false;
  const d = sampleSeed(now, user, workspace);
  await store.put(col.projects, P, d.project);
  await store.put(col.references(P), d.reference.id, d.reference);
  await store.put(col.breakdowns(P), S, d.breakdown);
  await store.put(col.locations(P), d.location.id, d.location);
  await store.put(col.kits(P), d.kit.id, d.kit);
  await store.put(col.recipes(P), S, d.recipe);
  await store.put(col.plans(P), S, d.plan);
  await store.put(col.setsheets(P), S, d.setsheet);
  await store.put(col.boards(P), 'board', d.board);
  await store.put(col.looks, d.look.id, d.look);
  return true;
}
