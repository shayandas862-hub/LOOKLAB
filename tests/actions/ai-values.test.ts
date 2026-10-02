// AI values (P4 tasks 3 and 4): mood and Ask come from a model as `ai` values with a confidence, never measured or
// estimate; a model never overwrites a measured, estimated, EXIF or hand-set value; only numbers and words leave the
// machine (D-LL-039); a value under 60 goes to review (R5) and a person's confirmation is recorded on the decision
// that wrote it; bad output is refused with a reason and its cost logged; Ask may quote only numbers in the record.
import { beforeEach, describe, expect, test } from 'vitest';
import { buildRegistry, type Registry } from '../../src/actions/index.ts';
import { seedSampleIfEmpty } from '../../src/actions/seed.ts';
import { encodePng } from '../../src/engine/png.ts';
import { stripes } from '../core/synth.ts';
import { memoryContext } from './memory-context.ts';
import { memoryKeychain, stubAi, type Reply } from './stub-ai.ts';

const FRAME = Buffer.from(encodePng(stripes(64, 36, [['#2A3F66', 60], ['#D9A441', 40]]).px)).toString('base64');
let reply: Reply;
let ai: ReturnType<typeof stubAi>;
let ctx: ReturnType<typeof memoryContext>;
let registry: Registry;
const run = (name: string, input: object = {}, via: 'ui' | 'mcp' = 'ui') => registry.invoke(name, input, ctx.for(via));
const fail = (name: string, input: object = {}) => run(name, input).then(() => null, (e) => e);
const get = async () => (await run('breakdown.get')).result as any; // eslint-disable-line @typescript-eslint/no-explicit-any
const mood = (words: string[], confidence: number) => ({ text: JSON.stringify({ words, confidence, why: 'cool shadows, one warm key' }) });

async function measureShot() {
  const { reference_id } = (await run('breakdown.import_reference', {
    file_name: 'client_secret_project_v3.png', media: 'image', mime: 'image/png', size_bytes: 10, sha256: 'a'.repeat(64),
    last_modified: null, width: 64, height: 36, duration_s: 0, sample_fps: 0, frame_count: 1,
  })).result as { reference_id: string };
  await run('breakdown.add_frame', { reference_id, index: 0, png_base64: FRAME });
  await run('breakdown.analyse');
}

beforeEach(async () => {
  reply = mood(['lonely', 'cool night'], 72);
  const kc = memoryKeychain();
  ai = stubAi(() => reply, kc);
  ctx = memoryContext({ ai: ai.provider, keychain: kc, start: '2026-10-01T10:00:00Z' });
  ctx.settings.api.cap_inr = 500;
  registry = buildRegistry();
  await seedSampleIfEmpty(ctx.store, '2026-10-01T09:00:00Z', 'tester', 'local');
});

describe('breakdown.fit_mood (T2)', () => {
  test('writes mood as an AI value with the model\'s confidence and the decision that wrote it', async () => {
    await measureShot();
    const r = await run('breakdown.fit_mood');
    expect(r.stand_in).toBe(false);
    const b = await get();
    expect(b.mood).toMatchObject({ value: ['lonely', 'cool night'], source: 'ai', confidence: 72, updated_by: 'claude-opus-5' });
    const row = ctx.decisions.at(-1)!;
    expect(b.mood.decision_id).toBe(row.id);
    expect(row).toMatchObject({ command: 'breakdown.fit_mood', tier: 'T2', ok: true, confidence: 72, rule_id: 'R3', stand_in: false });
    expect(row.ai).toMatchObject({ prompt_id: 'breakdown.fit_mood', prompt_version: 1 });
    expect(row.cost_inr).toBeGreaterThan(0);
  });

  test('only measured numbers and words leave the machine: no sample value, no file name, no pixels (D-LL-039)', async () => {
    await measureShot();
    await run('breakdown.fit_mood');
    const sent = JSON.parse(ai.sent[0].body);
    const user: string = sent.messages[0].content;
    expect(ctx.decisions.at(-1)!.ai!.sent.user).toBe(user);
    expect(user).not.toMatch(/client_secret|\.png|png_base64|sample/i);
    expect(user).toMatch(/#[0-9A-F]{6}/i);
    expect(JSON.stringify(sent)).not.toMatch(/"type":"image"/);
    const facts = JSON.parse(user);
    expect(facts.palette.length).toBeGreaterThan(0);
    expect(facts).not.toHaveProperty('mood'); // the old mood is not sent back to choose the new one
    expect(facts.light ?? {}).not.toHaveProperty('key_type'); // still sample: not sent
  });

  test('measured, estimated, EXIF and hand-set values survive an AI call', async () => {
    await measureShot();
    await run('breakdown.set_face', { x: 0.2, y: 0.05, w: 0.45, h: 0.9 });
    await run('breakdown.fit_light');
    await run('breakdown.edit_value', { field: 'lens.focal_mm', value: 35 });
    const before = await get();
    await run('breakdown.fit_mood');
    await run('breakdown.ask', { question: 'Is it warm or cool?' }).catch(() => null);
    const after = await get();
    const { mood: _m, updated_at: _u, reviewed: _r, ...restBefore } = before;
    const { mood: _m2, updated_at: _u2, reviewed: _r2, ...restAfter } = after;
    expect(restAfter).toEqual(restBefore);
    expect(after.lens.focal_mm.source).toBe('manual');
    expect(after.light.key_az.source).toBe('estimate');
    expect(after.palette[0].share.source).toBe('measured');
  });

  test('a mood set by hand is kept: the model is not called', async () => {
    await measureShot();
    await run('breakdown.edit_value', { field: 'mood', value: 'tense, quiet' });
    const err = await fail('breakdown.fit_mood');
    expect(err.message).toMatch(/set by hand/);
    expect(ai.sent).toHaveLength(0);
    expect((await get()).mood).toMatchObject({ value: ['tense', 'quiet'], source: 'manual' });
  });

  test('on the design\'s sample data it refuses before spending: there is nothing measured to describe', async () => {
    const err = await fail('breakdown.fit_mood');
    expect(err.message).toMatch(/import a reference/i);
    expect(ai.sent).toHaveLength(0);
  });

  test('bad output is refused with the reason and its cost is logged; the mood does not change', async () => {
    await measureShot();
    const cases: [Reply, RegExp][] = [
      [{ text: 'Lonely, I think.' }, /not valid JSON/],
      [{ text: JSON.stringify({ words: ['lonely'] }) }, /confidence/],
      [{ text: JSON.stringify({ words: ['lonely'], confidence: 150, why: 'x' }) }, /confidence/],
      [{ text: JSON.stringify({ words: ['2000 K'], confidence: 70, why: 'x' }) }, /words/],
    ];
    for (const [r, why] of cases) {
      reply = r;
      const err = await fail('breakdown.fit_mood');
      expect(err.code).toBe('model_output');
      expect(err.message).toMatch(why);
      expect(ctx.decisions.at(-1)!.cost_inr).toBeGreaterThan(0);
    }
    expect((await get()).mood.source).toBe('sample');
    expect(ctx.settings.api.used_inr).toBeCloseTo(ctx.decisions.reduce((s, d) => s + d.cost_inr, 0), 4);
  });
});

describe('R5: an AI value under 60 goes to review (T3)', () => {
  test('59 is queued for a person; 60 is not', async () => {
    await measureShot();
    reply = mood(['uneasy'], 59);
    const low = await run('breakdown.fit_mood');
    expect(low.result).toMatchObject({ needs_review: true });
    expect(ctx.decisions.at(-1)!.rule_id).toBe('R5');
    expect((await run('breakdown.review_queue')).result).toMatchObject({ queue: [{ field: 'mood', confidence: 59 }] });
    reply = mood(['calm'], 60);
    const ok = await run('breakdown.fit_mood');
    expect(ok.result).toMatchObject({ needs_review: false });
    expect(ctx.decisions.at(-1)!.rule_id).toBe('R3');
    expect((await run('breakdown.review_queue')).result).toEqual({ queue: [] });
  });

  test('breakdown.review records "agreed" on the decision that wrote the value, and the queue empties', async () => {
    await measureShot();
    reply = mood(['uneasy'], 41);
    await run('breakdown.fit_mood');
    const wrote = (await get()).mood.decision_id;
    const r = await run('breakdown.review', { field: 'mood' });
    expect(r.result).toMatchObject({ decision_id: wrote, verdict: 'agreed' });
    expect((await ctx.for('ui').listDecisions()).find((d) => d.id === wrote)!.verdict).toBe('agreed');
    expect((await run('breakdown.review_queue')).result).toEqual({ queue: [] });
  });

  test('over MCP the review is refused: in the window the click is the approval (D-LL-023, D-LL-017)', async () => {
    await measureShot();
    reply = mood(['uneasy'], 41);
    await run('breakdown.fit_mood');
    const err = await run('breakdown.review', { field: 'mood' }, 'mcp').then(() => null, (e) => e);
    expect(err.code).toBe('needs_approval');
  });

  test('a new AI value clears its old review', async () => {
    await measureShot();
    reply = mood(['uneasy'], 41);
    await run('breakdown.fit_mood');
    await run('breakdown.review', { field: 'mood' });
    reply = mood(['bleak'], 45);
    await run('breakdown.fit_mood');
    expect((await get()).reviewed).not.toContain('mood');
    expect((await run('breakdown.review_queue')).result).toMatchObject({ queue: [{ field: 'mood', confidence: 45 }] });
  });

  test('only an AI value can be reviewed', async () => {
    const err = await fail('breakdown.review', { field: 'lens.focal_mm' });
    expect(err.message).toMatch(/not an AI value/);
  });
});

describe('breakdown.ask (T2)', () => {
  const answer = (text: string, confidence = 70) => ({ text: JSON.stringify({ answer: text, confidence }) });

  test('answers in words from the measured breakdown, as AI with a confidence', async () => {
    await measureShot();
    reply = answer('A cool blue base with a warm yellow accent; keep the warm colour in the set.');
    const r = await run('breakdown.ask', { question: 'What is the colour scheme?' });
    expect(r.result).toMatchObject({ source: 'ai', confidence: 70, low: false });
    expect(r.stand_in).toBe(false);
    expect(JSON.parse(ai.sent[0].body).messages[0].content).toContain('What is the colour scheme?');
  });

  test('an answer quoting a number that is not in the record is refused, and its cost is logged', async () => {
    await measureShot();
    reply = answer('Set the white balance to 3200 K and add a full CTO.');
    const err = await fail('breakdown.ask', { question: 'How do I get this colour on set?' });
    expect(err.code).toBe('model_output');
    expect(err.message).toMatch(/3200/);
    expect(err.message).toMatch(/not in the breakdown/);
    expect(ctx.decisions.at(-1)!.cost_inr).toBeGreaterThan(0);
  });

  test('numbers from the record, from the question, and standard names pass', async () => {
    await measureShot();
    const b = await get();
    const hex = b.palette[0].hex;
    const share = Math.round(b.palette[0].share.value);
    reply = answer(`The biggest colour is ${hex}, about ${share}% of the frame. For delivery in Rec.709 the capture numbers come in P4.5; you asked about 5600 K.`);
    const r = await run('breakdown.ask', { question: 'Would 5600 K work?' });
    expect((r.result as { answer: string }).answer).toContain(hex);
  });

  test('a colour code that is not in the palette is refused too', async () => {
    await measureShot();
    reply = answer('Use #FF00AA for the accent.');
    const err = await fail('breakdown.ask', { question: 'Accent?' });
    expect(err.message).toMatch(/#FF00AA/);
  });

  test('the instructions say capture numbers wait for P4.5\'s maths', async () => {
    await measureShot();
    reply = answer('Cool and dark.');
    await run('breakdown.ask', { question: 'Mood?' });
    expect(JSON.parse(ai.sent[0].body).system).toMatch(/P4\.5/);
  });
});

describe('breakdown.fit_framing (T0 by R2)', () => {
  test('is T0 now: no AI flag, no stand-in; it writes shot size from the face box as an estimate', async () => {
    const a = registry.get('breakdown.fit_framing')!;
    expect(a).toMatchObject({ tier: 'T0', ai: false, standIn: false });
    await measureShot();
    await run('breakdown.set_face', { x: 0.2, y: 0.05, w: 0.45, h: 0.9 });
    ctx.settings.no_ai = true;
    const r = await run('breakdown.fit_framing');
    const b = await get();
    expect(b.framing.size).toMatchObject({ value: 'ECU', source: 'estimate' });
    expect(b.framing.size.decision_id).toBe(ctx.decisions.at(-1)!.id);
    expect(b.framing.lead_room.source).toBe('sample');
    expect((r.result as { basis: string }).basis).toMatch(/90% of the picture height/);
  });

  test('without a face box it says how to mark one; a size set by hand is kept', async () => {
    await measureShot();
    expect((await fail('breakdown.fit_framing')).message).toMatch(/drag a box around the face/i);
    await run('breakdown.set_face', { x: 0.2, y: 0.05, w: 0.45, h: 0.9 });
    await run('breakdown.edit_value', { field: 'framing.size', value: 'OTS' });
    await run('breakdown.fit_framing');
    expect((await get()).framing.size).toMatchObject({ value: 'OTS', source: 'manual' });
  });
});
