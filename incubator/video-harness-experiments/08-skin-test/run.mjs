// Test 1 on fal: the same 6 s shoe shot made three ways (A words, B pictures, C skin on skeleton), three seeds each.
//   node run.mjs --dry     prints every request, sends nothing
//   node run.mjs           sends them (needs FAL_KEY in the environment), downloads to out/, logs out/runs.json
// The key is read from the environment and never printed or written anywhere.
import fs from 'node:fs';
import path from 'node:path';
import { fal } from '@fal-ai/client';

const HERE = path.dirname(new URL(import.meta.url).pathname), OUT = path.join(HERE, 'out'), IN = path.join(HERE, 'inputs');
const DRY = process.argv.includes('--dry'), MAX_REQUESTS = 9, SEEDS = [11, 22, 33];
const LOOK = 'Real product footage of a premium white running shoe on a slowly turning black turntable in a dark studio. White engineered knit mesh upper, white leather overlays with fine stitching, glossy orange rubber zig-zag overlays on the side, a white foam midsole with a thin orange stripe, dark rubber outsole, white laces. A thin orange LED ring glows around the turntable\'s edge; warm orange light on the back wall; soft reflections on the glossy black floor. Photoreal, sharp, shot on a 50 mm lens. No text, no logos, no people.';
const MOVE = 'The camera starts at the shoe\'s side, toe to the left, and glides gently round while the turntable turns, ending on a three-quarter front view, toe to the right.';
const SAME = { num_frames: 97, frames_per_second: 16, resolution: '720p', aspect_ratio: '16:9' };

const WAYS = [
  { id: 'A', endpoint: 'fal-ai/wan/v2.2-a14b/text-to-video', input: () => ({ prompt: `${LOOK} ${MOVE}`, ...SAME }) },
  { id: 'B', endpoint: 'fal-ai/wan/v2.2-a14b/image-to-video', files: { image_url: 'first.png', end_image_url: 'last.png' }, input: (u) => ({ prompt: LOOK, image_url: u.image_url, end_image_url: u.end_image_url, ...SAME }) },
  { id: 'C', endpoint: 'fal-ai/wan-vace-14b/depth', files: { video_url: 'depth_16fps.mp4' }, input: (u) => ({ prompt: LOOK, video_url: u.video_url, preprocess: false, ...SAME }) },
];

const key = process.env.FAL_KEY;
if (!DRY && !key) { console.error('FAL_KEY is not set. Add it in the environment settings (Network secrets or an environment variable), then start a new session.'); process.exit(1); }
if (key) fal.config({ credentials: key });
for (const f of ['first.png', 'last.png', 'depth_16fps.mp4']) if (!fs.existsSync(path.join(IN, f))) { console.error(`missing inputs/${f}: run bash prep.sh first`); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });

const TYPES = { '.png': 'image/png', '.mp4': 'video/mp4' };
const uploaded = {};
async function url(file) {
  if (DRY) return `<upload of inputs/${file}>`;
  if (!uploaded[file]) uploaded[file] = await fal.storage.upload(new Blob([fs.readFileSync(path.join(IN, file))], { type: TYPES[path.extname(file)] }));
  return uploaded[file];
}

const logFile = path.join(OUT, 'runs.json'), log = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, 'utf8')) : [];
let sent = 0;
for (const way of WAYS) for (const seed of SEEDS) {
  const name = `${way.id}_seed${seed}`, file = path.join(OUT, `${name}.mp4`);
  if (fs.existsSync(file)) { console.log(`${name}: already made, skipped`); continue; }
  if (sent >= MAX_REQUESTS) { console.log(`stopping: the cap of ${MAX_REQUESTS} requests is reached`); break; }
  const urls = {}; for (const [k, f] of Object.entries(way.files || {})) urls[k] = await url(f);
  const input = { ...way.input(urls), seed };
  if (DRY) { console.log(`\n${name} → ${way.endpoint}\n${JSON.stringify(input, null, 1)}`); continue; }
  sent++; const t0 = Date.now(); const entry = { name, endpoint: way.endpoint, seed, started: new Date().toISOString() };
  try {
    const res = await fal.subscribe(way.endpoint, { input, logs: false });
    const video = res.data?.video?.url; entry.request_id = res.requestId; entry.output_url = video; entry.seconds_taken = Math.round((Date.now() - t0) / 1000);
    const buf = Buffer.from(await (await fetch(video)).arrayBuffer()); fs.writeFileSync(file, buf); entry.bytes = buf.length;
    console.log(`${name}: done in ${entry.seconds_taken} s → out/${name}.mp4`);
  } catch (e) {
    entry.error = String(e?.message || e).slice(0, 500); console.error(`${name}: failed: ${entry.error}`);
  }
  log.push(entry); fs.writeFileSync(logFile, JSON.stringify(log, null, 1));
}
