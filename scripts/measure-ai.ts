// One live mood call and one live Ask on a committed Blender render, with the founder's key (P4). Not in the suite.
//   node --experimental-strip-types scripts/measure-ai.ts            prints what would be sent and its worst case; sends nothing
//   node --experimental-strip-types scripts/measure-ai.ts --yes      sends the two calls
// Talks to a running Look Lab (npm start; LOOKLAB_HOME and LOOKLAB_PORT as usual), whose key is in the Keychain (added in
// Settings). Imports tests/fixtures/blender/test/test-03-light into the sample project's shot 12D, marks its face from the
// truth file and fits the light, then calls breakdown.fit_mood and breakdown.ask once each through the API. Reports the
// time, tokens in and out, cost in rupees and whether used_inr counted it, and the engine's RSS and footprint.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { ASK_PROMPT, MOOD_PROMPT, breakdownFacts } from '../src/actions/prompts.ts';
import { worstCaseInr } from '../src/engine/pricing.ts';

const ROOT = join(import.meta.dirname, '..');
const HOME = process.env.LOOKLAB_HOME ?? join(homedir(), 'LookLab');
const PORT = Number(process.env.LOOKLAB_PORT ?? 4317);
const URL = `http://127.0.0.1:${PORT}`;
const SCENE = join(ROOT, 'tests', 'fixtures', 'blender', 'test', 'test-03-light');
const SHOT = '12D';
const QUESTION = 'What is the colour scheme of this shot, and should the warmth come from the light or from the grade?';
const send = process.argv.includes('--yes');
const token = readFileSync(join(HOME, 'token'), 'utf8').trim();

async function api<T = any>(action: string, input: object = {}): Promise<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const r = await fetch(`${URL}/api/actions/${action}`, { method: 'POST', headers: { 'x-looklab-token': token, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  const body = await r.json();
  if (!r.ok) throw new Error(`${action}: ${body.message}`);
  return body.result as T;
}

const pid = execFileSync('lsof', ['-ti', `tcp:${PORT}`, '-sTCP:LISTEN']).toString().trim().split('\n')[0];
const rssMb = () => Number(execFileSync('ps', ['-o', 'rss=', '-p', pid]).toString().trim()) / 1024;
function footprintMb(): number {
  const m = /Footprint: ([\d.]+) (KB|MB|GB)/.exec(execFileSync('footprint', [pid]).toString());
  return m ? Number(m[1]) * { KB: 1 / 1024, MB: 1, GB: 1024 }[m[2] as 'KB' | 'MB' | 'GB'] : NaN;
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function idle() {
  await sleep(8000);
  const xs: number[] = [];
  for (let i = 0; i < 16; i++) { xs.push(rssMb()); await sleep(250); }
  return { rss_mb: Math.round(xs.sort((a, b) => a - b)[8]), footprint_mb: Math.round(footprintMb()) };
}

const status = await api('settings.ai_status');
if (send && !status.ready) throw new Error(`AI is not ready: ${status.reason}`);

// The render, on shot 12D of the sample project, measured, its face marked from the truth and the light fitted.
const png = readFileSync(`${SCENE}.png`), truth = JSON.parse(readFileSync(`${SCENE}.json`, 'utf8'));
const { reference_id } = await api('breakdown.import_reference', {
  shot_id: SHOT, file_name: 'test-03-light.png', media: 'image', mime: 'image/png', size_bytes: png.length,
  sha256: createHash('sha256').update(png).digest('hex'), last_modified: null, width: 512, height: 288, frame_count: 1,
});
await api('breakdown.add_frame', { reference_id, index: 0, png_base64: png.toString('base64') });
await api('breakdown.analyse', { shot_id: SHOT });
await api('breakdown.set_face', { shot_id: SHOT, ...truth.face_box });
await api('breakdown.fit_light', { shot_id: SHOT });
await api('breakdown.fit_framing', { shot_id: SHOT });
const b = await api('breakdown.get', { shot_id: SHOT });

const moodUser = JSON.stringify(breakdownFacts(b, { mood: false }));
const askUser = JSON.stringify({ breakdown: breakdownFacts(b, { mood: true }), question: QUESTION });
const worst = {
  mood: worstCaseInr(status.model, [MOOD_PROMPT.system, moodUser, JSON.stringify(MOOD_PROMPT.schema)], MOOD_PROMPT.maxTokens),
  ask: worstCaseInr(status.model, [ASK_PROMPT.system, askUser, JSON.stringify(ASK_PROMPT.schema)], ASK_PROMPT.maxTokens),
};
console.log(JSON.stringify({ model: status.model, cap_inr: status.cap_inr, used_inr: status.used_inr, worst_inr: worst, mood_user_bytes: moodUser.length, ask_user_bytes: askUser.length }, null, 2));
if (!send) {
  console.log('Nothing was sent. Run again with --yes to make the two calls.');
  process.exit(0);
}

const before = await idle();
const used0 = (await api('settings.ai_status')).used_inr;
const calls: Record<string, unknown> = {};
for (const [name, input] of [['breakdown.fit_mood', { shot_id: SHOT }], ['breakdown.ask', { shot_id: SHOT, question: QUESTION }]] as const) {
  const t = performance.now();
  let result: unknown;
  try {
    result = await api(name, input);
  } catch (e) {
    result = { refused: (e as Error).message };
  }
  const wall = Math.round(performance.now() - t);
  const row = (await api('log.list', { limit: 5 })).decisions.find((d: { command: string }) => d.command === name);
  calls[name] = {
    wall_ms: wall, api_ms: row.ai?.ms, tokens_in: row.ai?.tokens_in, tokens_out: row.ai?.tokens_out, stop: row.ai?.stop_reason,
    cost_inr: row.cost_inr, worst_inr: row.ai?.worst_inr, confidence: row.confidence, rule: row.rule_id, ok: row.ok, result,
  };
}
const used1 = (await api('settings.ai_status')).used_inr;
const after = await idle();
const costs = Object.values(calls).reduce((s: number, c) => s + ((c as { cost_inr: number }).cost_inr ?? 0), 0);
console.log(JSON.stringify({
  calls, used_inr: { before: used0, after: used1, delta: +(used1 - used0).toFixed(4), sum_of_rows: +costs.toFixed(4), counted: Math.abs(used1 - used0 - costs) < 1e-3 },
  engine: { idle_before_calls: before, idle_after_calls: after },
}, null, 2));
