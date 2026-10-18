// S3 on fal (PLAN.md §6): the approved hero still for the look + the previs turn for the motion.
//   node s3-run.mjs ltx --still out/stills-in/luna6_1.png --dry        prints the request, sends nothing (no key needed)
//   FAL_KEY="$(security find-generic-password -s fal-key -w)" node s3-run.mjs ltx --still … --yes
//   … s3-run.mjs seedance --still … --yes                              only if the LTX take fails a mark (PLAN.md Gate 2)
// Spends money only with --yes. The key is read from the environment at run time and never printed or written.
// Takes go to out/clips/S3_<model>.mp4 (out/ is ignored by git); every request is logged in out/runs.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fal } from '@fal-ai/client';

const HERE = path.dirname(fileURLToPath(import.meta.url)), OUT = path.join(HERE, 'out');
const CLIP = path.join(OUT, 'passes/s3/beauty_24fps.mp4');
const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? null : process.argv[i + 1]; };
const [model] = process.argv.slice(2), still = arg('--still'), DRY = process.argv.includes('--dry'), YES = process.argv.includes('--yes');

const LOOK = 'Real footage from a professional food commercial shot on a cinema camera, 50 mm lens, natural motion, fine film grain. No text, no logo, no hands, no people, no cuts.';
const RUNS = {
  ltx: {
    endpoint: 'fal-ai/ltx-2.3-quality/render-to-real', cost: '≈ $0.24 (720×1280×108 ≈ 99.5 MP at $0.0024075/MP, rounded up)',
    input: (u) => ({ video_url: u.clip, image_url: u.still, intensity: 'strong-v2', resolution: '720p', num_frames: 108, frames_per_second: 24, generate_audio: false, seed: 11,
      prompt: '3DREAL. Real footage from a professional food commercial: the same açaí bowl in a clear glass bowl turns once on a wooden turntable against a mustard-yellow backdrop, camera locked off. Real frozen açaí, fresh-cut fruit, crunchy granola, real glass reflections, natural motion, fine film grain.' }),
  },
  seedance: {
    endpoint: 'bytedance/seedance-2.5/us/reference-to-video', cost: '≈ $2.64 (fal\'s "roughly": (4.5 s in + 5 s out) at 720p with a video input)',
    input: (u) => ({ task: 'reference', image_urls: [u.still], video_urls: [u.clip], resolution: '720p', duration: '5', aspect_ratio: '9:16', generate_audio: false, seed: 11,
      prompt: `@Video1 is the shot: copy its camera and motion exactly. The camera stays locked off. The bowl makes one full turn on the wooden turntable, starting and ending slowly, in the same direction and at the same speed as in @Video1. Nothing else moves. @Image1 is the look: the same real açaí bowl, glass, toppings, turntable, backdrop and light. ${LOOK}` }),
  },
  wan3: {
    endpoint: 'alibaba/wan-3.0/reference-to-video', cost: '≈ $0.95 ((4.5 s in + 5 s out) × $0.10 per second at 720p; input seconds are billed too)',
    input: (u) => ({ reference_image_urls: [u.still], reference_video_urls: [u.clip], resolution: '720p', aspect_ratio: '9:16', duration: 5, audio: false, seed: 11,
      prompt: `Video 1 is the shot: copy its camera and motion exactly. The camera stays locked off. The bowl makes one full turn on the wooden turntable, starting and ending slowly, in the same direction and at the same speed as in Video 1. Nothing else moves. Image 1 is the look: the same real açaí bowl, glass, toppings, turntable, backdrop and light. ${LOOK}` }),
  },
};

const run = RUNS[model];
if (!run || !still) { console.error('usage: node s3-run.mjs ltx|seedance|wan3 --still <hero still> (--dry | --yes)'); process.exit(1); }
if (DRY === YES) { console.error('say --dry (print only) or --yes (send and pay)'); process.exit(1); }
for (const f of [still, CLIP]) if (!fs.existsSync(f)) { console.error(`missing ${f}`); process.exit(1); }
const name = `S3_${model}`, file = path.join(OUT, 'clips', `${name}.mp4`);
if (fs.existsSync(file)) { console.log(`${name}: already made (${path.relative(HERE, file)}); delete it to make another`); process.exit(0); }
if (DRY) { console.log(`${name} → ${run.endpoint}, ${run.cost}\n${JSON.stringify(run.input({ still: `<upload of ${still}>`, clip: '<upload of out/passes/s3/beauty_24fps.mp4>' }), null, 1)}`); process.exit(0); }
if (!process.env.FAL_KEY) { console.error('FAL_KEY is not set: run as FAL_KEY="$(security find-generic-password -s fal-key -w)" node s3-run.mjs …'); process.exit(1); }
fal.config({ credentials: process.env.FAL_KEY });

fs.mkdirSync(path.dirname(file), { recursive: true });
const logFile = path.join(OUT, 'runs.json'), log = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, 'utf8')) : [];
const entry = { name, endpoint: run.endpoint, still: path.relative(HERE, path.resolve(still)), started: new Date().toISOString() }, t0 = Date.now();
let queued = null;
try {
  const up = async (f, type) => fal.storage.upload(new Blob([fs.readFileSync(f)], { type }));
  const u = { still: await up(still, still.endsWith('.png') ? 'image/png' : 'image/webp'), clip: await up(CLIP, 'video/mp4') };
  entry.upload_seconds = Math.round((Date.now() - t0) / 1000); console.log(`uploaded in ${entry.upload_seconds} s; sent to ${run.endpoint}`);
  const t1 = Date.now();
  // The job number is written the moment fal queues the job, so a stopped script can still find the result (2026-10-18).
  const onEnqueue = (id) => { entry.request_id = id; fs.writeFileSync(logFile, JSON.stringify([...log, { ...entry, status: 'queued' }], null, 1)); console.log(`queued on fal as ${id}`); };
  const res = await fal.subscribe(run.endpoint, { input: run.input(u), logs: false, onEnqueue, onQueueUpdate: (q) => { if (q.status === 'IN_PROGRESS' && queued === null) queued = Date.now() - t1; } });
  entry.request_id = res.requestId; entry.output_url = res.data?.video?.url; entry.seed = res.data?.seed;
  entry.seconds_taken = Math.round((Date.now() - t1) / 1000); entry.seconds_queued = queued === null ? null : Math.round(queued / 1000);
  const buf = Buffer.from(await (await fetch(entry.output_url)).arrayBuffer()); fs.writeFileSync(file, buf); entry.bytes = buf.length;
  console.log(`${name}: done in ${entry.seconds_taken} s (in the queue ${entry.seconds_queued ?? '?'} s) → ${path.relative(HERE, file)}`);
} catch (e) {
  entry.error = String(e?.message || e).slice(0, 500); console.error(`${name}: failed: ${entry.error}`);
}
log.push(entry); fs.writeFileSync(logFile, JSON.stringify(log, null, 1));
