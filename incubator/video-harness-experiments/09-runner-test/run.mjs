// Test 1b on fal: film 4's last 15 s (the faceless runner steps out of a screen, the camera circles them and cranes
// up over the ring of worlds), route C only: the code's exact depth video plus the words for the look.
//   node run.mjs --dry            prints every request, sends nothing
//   node run.mjs --takes N        sends N takes (1–3: seeds 11, 22, 33), downloads to out/, logs out/runs.json
// The key is read from the environment (or added by the cloud proxy) and never printed or written anywhere.
import fs from 'node:fs';
import path from 'node:path';
import { fal } from '@fal-ai/client';

const HERE = path.dirname(new URL(import.meta.url).pathname), OUT = path.join(HERE, 'out'), IN = path.join(HERE, 'inputs');
const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? null : process.argv[i + 1]; };
const DRY = process.argv.includes('--dry'), SEEDS = [11, 22, 33], TAKES = DRY ? 3 : Number(arg('--takes'));
if (!DRY && !(TAKES >= 1 && TAKES <= 3)) { console.error('say how many takes: node run.mjs --takes 1 (or 2, 3)'); process.exit(1); }
const ENDPOINT = 'fal-ai/wan-vace-14b/depth';
const LOOK = 'Real cinematic footage at night. A wall of large glowing video screens with thin orange frames floats in the dark; the middle screen shows a runner. The runner, an athlete in a smooth white ceramic-like suit with grey joints and a glossy black visor helmet that covers the whole face, steps out of the middle screen onto a round, glossy black stone plaza edged with a thin orange light. The screens fly apart and eight small worlds rise in a ring around the plaza: a neon city, a desert at dusk, an underwater reef, snowy peaks, a moon surface, an ink-drawn comic town, a chrome studio and a glowing data landscape. The runner stands and looks around while the camera circles them, then cranes high above the ring of worlds under a starry sky. Photoreal, shot on a 35 mm cinema camera. No text, no logos, no visible face.';
const SAME = { num_frames: 241, frames_per_second: 16, resolution: '720p', aspect_ratio: '16:9' };

const key = process.env.FAL_KEY, viaProxy = !key && !!process.env.HTTPS_PROXY;
if (!DRY && !key && !viaProxy) { console.error('FAL_KEY is not set (or no cloud proxy to add it).'); process.exit(1); }
if (!DRY && viaProxy && process.env.NODE_USE_ENV_PROXY !== '1') { console.error('Run as NODE_USE_ENV_PROXY=1 node run.mjs …, so fal requests go through the proxy that adds the key.'); process.exit(1); }
if (key) fal.config({ credentials: key });
const depth = path.join(IN, 'depth_16fps.mp4');
if (!fs.existsSync(depth)) { console.error('missing inputs/depth_16fps.mp4: run bash prep.sh first'); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });

const logFile = path.join(OUT, 'runs.json'), log = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, 'utf8')) : [];
let videoUrl = null, sent = 0;
for (const seed of SEEDS.slice(0, TAKES)) {
  const name = `C_seed${seed}`, file = path.join(OUT, `${name}.mp4`);
  if (fs.existsSync(file)) { console.log(`${name}: already made, skipped`); continue; }
  if (!DRY && !videoUrl) { const t = Date.now(); videoUrl = await fal.storage.upload(new Blob([fs.readFileSync(depth)], { type: 'video/mp4' })); console.log(`depth video uploaded in ${((Date.now() - t) / 1000).toFixed(1)} s`); }
  const input = { prompt: LOOK, video_url: DRY ? '<upload of inputs/depth_16fps.mp4>' : videoUrl, preprocess: false, ...SAME, seed };
  if (DRY) { console.log(`\n${name} → ${ENDPOINT}\n${JSON.stringify(input, null, 1)}`); continue; }
  sent++; const t0 = Date.now(), entry = { name, endpoint: ENDPOINT, seed, started: new Date().toISOString() };
  let queued = null;
  try {
    const res = await fal.subscribe(ENDPOINT, { input, logs: false, onQueueUpdate: (u) => { if (u.status === 'IN_PROGRESS' && queued === null) queued = Date.now() - t0; } });
    const video = res.data?.video?.url; entry.request_id = res.requestId; entry.output_url = video;
    entry.seconds_taken = Math.round((Date.now() - t0) / 1000); entry.seconds_queued = queued === null ? null : Math.round(queued / 1000);
    const buf = Buffer.from(await (await fetch(video)).arrayBuffer()); fs.writeFileSync(file, buf); entry.bytes = buf.length;
    console.log(`${name}: done in ${entry.seconds_taken} s (queued ${entry.seconds_queued ?? '?'} s) → out/${name}.mp4`);
  } catch (e) {
    entry.error = String(e?.message || e).slice(0, 500); console.error(`${name}: failed: ${entry.error}`);
  }
  log.push(entry); fs.writeFileSync(logFile, JSON.stringify(log, null, 1));
}
