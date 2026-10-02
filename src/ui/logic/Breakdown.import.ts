// @ts-nocheck: moved from Breakdown.logic.tsx unchanged when that file was split (P3); typed as the screen is.
// Owned code (D-LL-014). Importing a reference on the Breakdown: a dropped or picked file is hashed and decoded
// here and sent frame by frame through the registry (D-LL-027); `c` is the Breakdown screen.
import { hashFile, mediaOf, openImage, openVideo, readLens, toBase64 } from '../runtime/media';
import { clock, mb } from './Breakdown.rows';

export const STEPS = [['Shots detected','T0'],['Colour','T0'],['Light','T0'],['Lens','T0'],['Framing','T0'],['Mood','T2']];
export const STEP_ACTIONS = ['breakdown.detect_shots','breakdown.sample_palette','breakdown.fit_light','breakdown.fit_lens','breakdown.fit_framing','breakdown.fit_mood'];
export const STEP_NOTE = ['', '', 'mark the face on the frame, then Fit light', 'focal length from EXIF when the file has it; the rest by hand (D-LL-039)', 'aspect measured; shot size follows the face box (R2); subject and lead room by hand', ''];
/**
 * Steps a person finishes by hand after the import: the light and the shot size need the face box first (D-LL-033,
 * D-LL-046), and the lens labels stay by hand because no frame leaves the machine (D-LL-039). Mood asks the model
 * when AI is ready.
 */
export const BY_HAND = new Set(['breakdown.fit_light', 'breakdown.fit_lens', 'breakdown.fit_framing']);

export function pickReference(c) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.onchange = () => input.files && input.files[0] && importReference(c, input.files[0]);
  input.click();
}

/** Hash → lens from EXIF → open → import_reference → add_frame × n → detect shots → analyse → the other steps. */
export async function importReference(c, file) {
  if (c._busy) return;
  c._busy = true;
  c._last = file;
  let stage = 'Reading';
  const fail = (title, body) => { c.setState({ err:{ title, body, meta:`${file.name} · ${new Date().toLocaleTimeString()}` } }); c.setB('error'); };
  try {
    const media = mediaOf(file);
    if (!media) return fail('Not an image or a video', `${file.name} is not something Chrome can open as an image or a video. Nothing was imported.`);
    c.setState({ importName:file.name, up:0, upText:'Hashing the file', err:null });
    c.setB('uploading');
    const sha = await hashFile(file, (d, t) => c.setState({ up: Math.round(30 * d / t), upText:`Hashing ${mb(d)} of ${mb(t)} MB` }));
    stage = 'Decoding';
    const exif = media === 'image' ? await readLens(file) : null;
    const src = media === 'image' ? await openImage(file) : await openVideo(file);
    try {
      stage = 'Import';
      const imp = await c.run('breakdown.import_reference', 'Reference imported', {
        file_name: file.name, media, mime: file.type || (media === 'image' ? 'image/png' : 'video/mp4'), size_bytes: file.size, sha256: sha,
        last_modified: file.lastModified ? new Date(file.lastModified).toISOString() : null,
        width: src.width, height: src.height, duration_s: src.duration_s, sample_fps: src.fps, frame_count: src.count, exif,
      }, { quiet:true });
      if (!imp) throw new Error('The engine refused the import (see the message above).');
      stage = 'Frames';
      for (let i = 0; i < src.count; i++) {
        const ok = await c.run('breakdown.add_frame', '', { reference_id: imp.result.reference_id, index: i, png_base64: await toBase64(await src.frame(i)) }, { quiet:true });
        if (!ok) throw new Error(`Frame ${i + 1} of ${src.count} was refused.`);
        c.setState({ up: 30 + Math.round(70 * (i + 1) / src.count), upText:`Frame ${i + 1} of ${src.count}${src.fps ? ` · ${clock(i / src.fps)}` : ''}` });
      }
    } finally {
      src.close();
    }
    stage = 'Shots';
    c.setState({ step:0 });
    c.setB('analysing');
    await runSteps(c, file.name);
    await c.load();
    c.setB('ready');
  } catch (e) {
    fail(`Import stopped at “${stage}”`, `${e.message} Frames already sent stay with the reference; importing the file again replaces them.`);
  } finally {
    c._busy = false;
  }
}

/** The design's steps in order, then breakdown.analyse measures tone and aspect and saves the breakdown. */
async function runSteps(c, name) {
  const aiOk = c.props.aiOk ?? true;
  for (let k = 0; k < STEPS.length; k++) {
    const skip = (!aiOk && STEPS[k][1] !== 'T0') || BY_HAND.has(STEP_ACTIONS[k]);
    if (!skip) {
      const r = await c.run(STEP_ACTIONS[k], STEPS[k][0], {}, { quiet:true });
      if (!r && k < 2) throw new Error(`${STEP_ACTIONS[k]} failed.`);
    }
    c.setState({ step:k + 1 });
  }
  if (!(await c.run('breakdown.analyse', `Measured ${name}`))) throw new Error('breakdown.analyse failed.');
}
