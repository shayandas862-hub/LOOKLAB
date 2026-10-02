// Which actions are still stand-ins (standing rule 2, D-LL-015). Each phase that makes an action real removes its flag
// in the same change, so this list shrinks by exactly the actions made real. P3 left 18; P4 makes four real
// (settings.add_provider, breakdown.fit_mood, breakdown.ask, and breakdown.fit_framing as T0 by R2), leaving 14.
import { expect, test } from 'vitest';
import { buildRegistry } from '../../src/actions/index.ts';

const P3_STAND_INS = [
  'breakdown.fit_lens', 'breakdown.fit_framing', 'breakdown.fit_mood', 'breakdown.ask', 'settings.add_provider',
  'adapt.check_power', 'adapt.generate_recipe', 'adapt.open_in_plan', 'plan.match_light', 'shots.render_frame',
  'board.add_reference', 'board.extract_palette', 'board.export_pdf', 'setsheet.generate', 'setsheet.export_pdf',
  'setsheet.send_to_phone', 'library.apply_look', 'library.compare',
];
const MADE_REAL_IN_P4 = ['settings.add_provider', 'breakdown.fit_mood', 'breakdown.ask', 'breakdown.fit_framing'];

test('P4 removes the stand-in flag from exactly the four actions it made real: 18 → 14', () => {
  const now = buildRegistry().list().filter((a) => a.standIn).map((a) => a.name).sort();
  expect(P3_STAND_INS).toHaveLength(18);
  expect(now).toEqual(P3_STAND_INS.filter((n) => !MADE_REAL_IN_P4.includes(n)).sort());
  expect(now).toHaveLength(14);
});

test('breakdown.fit_lens stays a stand-in under D-LL-039 (no frame leaves the machine) and says so', () => {
  const a = buildRegistry().get('breakdown.fit_lens')!;
  expect(a.standIn).toBe(true);
  expect(a.description).toMatch(/D-LL-039/);
});
