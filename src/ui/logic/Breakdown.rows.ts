// @ts-nocheck: moved from Breakdown.logic.tsx unchanged when that file was split (P3); typed as the screen is.
// Owned code (D-LL-014). The Breakdown's rows, badges and formatting: pure functions of the breakdown record.
import { sampleBadge } from '../runtime/badges';

// Where the design drew its sample palette's dots (the sample swatches carry no position).
export const SAMPLE_DOTS = [['22%','24%'],['82%','30%'],['27%','52%'],['44%','80%'],['36%','38%'],['92%','86%']];
export const SAMPLE_TINT_HEX = { shadow:'#1B2230', mid:'#3E4A52', highlight:'#E9C9A0' };
/** The design's frame box is 2.39:1; a frame of another shape sits inside it, letterboxed. */
export const BOX_ASPECT = 2.39;

// Row id → the breakdown field it edits (breakdown.edit_value). Numeric fields take the first number typed.
export const FIELD = { az:'light.key_az', el:'light.key_el', kelvin:'light.key_kelvin', key:'light.key_type', fill:'light.fill_kind', ratio:'light.ratio', hard:'light.key_hardness', prac:'light.practicals',
  focal:'lens.focal_mm', dof:'lens.dof', height:'lens.height_m', angle:'lens.angle', move:'lens.movement',
  size:'framing.size', pos:'framing.subject_pos', room:'framing.lead_room', aspect:'framing.aspect' };
const NUMERIC = new Set(['light.key_az', 'light.key_el', 'light.key_kelvin', 'light.ratio', 'lens.focal_mm', 'lens.height_m']);
export function typed(field, text) {
  if (!NUMERIC.has(field)) return text;
  const m = /-?\d+(\.\d+)?/.exec(text);
  return m ? parseFloat(m[0]) : text;
}

// Strongest first, as the engine ranks them (AD-LL-010).
const RANK = { measured:0, manual:1, metadata:2, estimate:3, ai:4, sample:5 };
export const weakest = vals => vals.reduce((w, v) => (RANK[v.source] > RANK[w] ? v.source : w), 'measured');
export const minus = n => (n < 0 ? `−${Math.abs(n)}` : `${n}`);

/** The value's own badge. Sample values always read SAMPLE (D-LL-015); a fitted value reads ESTIMATE and an EXIF
 * value METADATA, never MEASURED (AD-LL-010); a model's value reads "AI · n", its own rating (D-LL-042). `review`:
 * 'low' when an AI value under 60 waits for a person (R5), 'confirmed' once a person agreed. */
export function badge(src, conf, review) {
  return src === 'sample' ? sampleBadge(designBadge(src, conf, review)) : designBadge(src, conf, review);
}

/** The text of an AI value's badge: "AI · 72", "AI · 41 · LOW", "AI · 41 · CONFIRMED". Never a percentage. */
export function aiLabel(conf, review) {
  return `AI · ${conf}${review === 'low' ? ' · LOW' : review === 'confirmed' ? ' · CONFIRMED' : ''}`;
}

/** Where a value stands in R5's review: 'low' (under 60, not confirmed), 'confirmed', or '' (nothing to review). */
export function reviewState(leaf, field, reviewed) {
  if (!leaf || leaf.source !== 'ai') return '';
  if ((reviewed || []).includes(field)) return 'confirmed';
  return leaf.confidence < 60 ? 'low' : '';
}

/** AI values under 60 that no person has confirmed: the Breakdown's review banner (R5). */
export function reviewQueue(b) {
  if (!b) return [];
  const specs = rowSpecs(b);
  const labelOf = Object.fromEntries(['light', 'lens', 'framing'].flatMap((g) => specs[g].map(([id, label]) => [id, label])));
  const leaves = [['mood', 'Mood', b.mood], ...Object.entries(FIELD).map(([id, f]) => {
    const [g, l] = f.split('.');
    return [f, labelOf[id] || id, b[g] && b[g][l]];
  })];
  return leaves.filter(([f, , leaf]) => reviewState(leaf, f, b.reviewed) === 'low').map(([field, label, leaf]) => ({ field, label, confidence: leaf.confidence }));
}

function designBadge(src, conf, review) {
  if (src === 'manual') return { label:'MANUAL', border:'1px solid transparent', bg:'var(--bg3)', color:'var(--tx)' };
  if (src === 'measured') return { label:'MEASURED', border:'1px solid var(--line2)', bg:'transparent', color:'var(--tx2)' };
  if (src === 'sample') return { label:'SAMPLE', border:'1px dotted var(--tx3)', bg:'transparent', color:'var(--tx3)' };
  // A fit's confidence is a rank, not a probability (D-LL-036): shown as a score, never as a percentage.
  if (src === 'estimate') return { label: conf === undefined ? 'ESTIMATE' : `ESTIMATE · ${conf}`, border:'1px solid var(--tx3)', bg:'transparent', color:'var(--tx2)' };
  if (src === 'metadata') return { label:'METADATA', border:'1px solid var(--line)', bg:'transparent', color:'var(--tx2)' };
  const low = review === 'low';
  return { label: aiLabel(conf, review), border: low ? '1px dashed var(--warn)' : '1px dashed var(--tx3)', bg: low ? 'var(--warn-soft)' : 'transparent', color: low ? 'var(--warn)' : 'var(--tx2)' };
}

export const satBand = v => (v < 25 ? 'low' : v <= 50 ? 'medium' : 'high');
export const clock = s => { const m = Math.floor(s / 60); return `${String(m).padStart(2,'0')}:${(s - m * 60).toFixed(1).padStart(4,'0')}`; };
export const mb = n => (n / 1e6).toFixed(n < 1e7 ? 1 : 0);

/** "75 mm (EXIF, 35 mm equiv.)" for a focal length read from the file; the design's "≈40 mm" otherwise. */
function focalText(f) {
  if (f.source !== 'metadata') return `≈${f.value} mm`;
  return `${f.value} mm (EXIF, ${String(f.unit || '').replace(/^mm \(|\)$/g, '')})`;
}

/** Rows of the light, lens and framing sections, from the breakdown record: [id, label, text, leaves]. */
export function rowSpecs(b) {
  const L = b.light, N = b.lens, F = b.framing;
  const ratio = Number(L.ratio.value);
  return {
    // One row per value the fit may write (P3), so each shows its own source.
    light: [
      ['az', 'Key azimuth', `${minus(L.key_az.value)}°`, [L.key_az]],
      ['el', 'Key elevation', `${L.key_el.value}°`, [L.key_el]],
      ['kelvin', 'Key colour', `${L.key_kelvin.value} K`, [L.key_kelvin]],
      ['key', 'Key type', String(L.key_type.value), [L.key_type]],
      ['fill', 'Fill', `${L.fill_kelvin.value} K ${L.fill_kind.value}`, [L.fill_kelvin, L.fill_kind]],
      ['ratio', 'Key:fill', ratio > 0 ? `${ratio}:1 (${Math.round(Math.log2(ratio) * 10) / 10} stops)` : String(L.ratio.value), [L.ratio]],
      ['hard', 'Hardness', String(L.key_hardness.value), [L.key_hardness]],
      ['prac', 'Practicals', String(L.practicals.value), [L.practicals]],
    ],
    lens: [
      ['focal', 'Focal length', focalText(N.focal_mm), [N.focal_mm]],
      ['dof', 'Depth of field', String(N.dof.value), [N.dof]],
      ['height', 'Camera height', `${N.height_m.value} m`, [N.height_m]],
      ['angle', 'Angle', String(N.angle.value), [N.angle]],
      ['move', 'Movement', String(N.movement.value), [N.movement]],
    ],
    framing: [
      ['size', 'Shot size', String(F.size.value), [F.size]],
      ['pos', 'Subject', String(F.subject_pos.value), [F.subject_pos]],
      ['room', 'Lead room', String(F.lead_room.value), [F.lead_room]],
      ['aspect', 'Aspect', String(F.aspect.value), [F.aspect]],
    ],
  };
}

/** A point on the frame (0–1) → a position in the design's 2.39:1 box, as CSS percentages. */
export function boxPos(f, at) {
  if (!f) return { x:`${at.x * 100}%`, y:`${at.y * 100}%` };
  const a = f.width / f.height;
  const fw = a < BOX_ASPECT ? a / BOX_ASPECT : 1, fh = a < BOX_ASPECT ? 1 : BOX_ASPECT / a;
  return { x:`${((1 - fw) / 2 + at.x * fw) * 100}%`, y:`${((1 - fh) / 2 + at.y * fh) * 100}%` };
}

/** Every value the marker accounts for, by the name a DP would use. */
function markerLeaves(b) {
  const L = b.light, N = b.lens, F = b.framing;
  return [
    ['key direction', [L.key_az, L.key_el]], ['key colour', [L.key_kelvin]], ['key type', [L.key_type]], ['hardness', [L.key_hardness]],
    ['fill', [L.fill_kelvin, L.fill_kind]], ['key:fill', [L.ratio]], ['practicals', [L.practicals]],
    ['focal length', [N.focal_mm]], ['depth of field', [N.dof]], ['camera height', [N.height_m]], ['angle', [N.angle]], ['movement', [N.movement]],
    ['shot size', [F.size]], ['lead room', [F.lead_room]], ['mood', [b.mood]],
  ];
}

/**
 * The Breakdown's marker, built from the record (D-LL-032, D-LL-038): what is still sample, what is an estimate,
 * what came from the file's metadata, and that colour, tone and aspect are measured. Never an accuracy claim.
 */
export function markerText(b) {
  const leaves = markerLeaves(b);
  const named = src => leaves.filter(([, v]) => weakest(v) === src).map(([n]) => n).join(', ');
  const parts = [];
  if (named('sample')) parts.push(`SAMPLE: ${named('sample')}`);
  if (named('estimate')) parts.push(`ESTIMATE: ${named('estimate')} (from the face marked by hand; not verified on real footage)`);
  if (named('metadata')) parts.push(`METADATA: ${named('metadata')} (EXIF)`);
  if (named('ai')) parts.push(`AI: ${named('ai')} (the model's own rating, not checked)`);
  if (b.palette.length && b.palette.every(p => p.share.source === 'measured')) parts.push('colour, tone and aspect measured');
  return parts.join(' · ');
}
