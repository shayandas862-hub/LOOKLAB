// Shot cuts from frame-to-frame colour-histogram distance with an adaptive threshold (D-LL-026).
// Acceptance (docs/phases.md P2): every known cut found within ± 1 sampled frame; no cut on a slow fade.
import { describe, expect, test } from 'vitest';
import { detectCuts, frameSignature, shotsFromCuts } from '../../src/core/cuts.ts';
import type { Pixels } from '../../src/core/image.ts';
import { addNoise, blank, clone, mix, rng, set, type RGB } from './synth.ts';

const W = 96;
const H = 54;

/** A "scene": a two-colour gradient with a moving block, so frames inside a shot are not identical. */
function scene(seed: number) {
  const r = rng(seed);
  const c = (): RGB => [Math.floor(r() * 256), Math.floor(r() * 256), Math.floor(r() * 256)];
  const a = c();
  const b = c();
  const block = c();
  return (t: number): Pixels => {
    const px = blank(W, H);
    for (let x = 0; x < W; x++) {
      const k = x / (W - 1);
      for (let y = 0; y < H; y++) set(px, x, y, [0, 1, 2].map((i) => Math.round(a[i] * (1 - k) + b[i] * k)) as RGB);
    }
    const bx = (10 + t * 2) % (W - 16);
    for (let x = bx; x < bx + 16; x++) for (let y = 18; y < 36; y++) set(px, x, y, block);
    return px;
  };
}

function signatures(frames: Pixels[]) {
  return frames.map((f, i) => frameSignature(addNoise(clone(f), 6, 1000 + i)));
}

function expectCuts(found: number[], expected: number[]) {
  expect(found.length, `found ${found} expected ${expected}`).toBe(expected.length);
  for (const e of expected) expect(found.some((f) => Math.abs(f - e) <= 1), `cut at ${e} (found ${found})`).toBe(true);
}

describe('cuts: hard cuts are found within ± 1 sampled frame', () => {
  test('four shots, cuts at frames 10, 18 and 31, with noise and motion', () => {
    const shots = [scene(1), scene(2), scene(3), scene(4)];
    const bounds = [0, 10, 18, 31, 44];
    const frames: Pixels[] = [];
    for (let s = 0; s < 4; s++) for (let i = bounds[s]; i < bounds[s + 1]; i++) frames.push(shots[s](i - bounds[s]));
    expectCuts(detectCuts(signatures(frames)), [10, 18, 31]);
  });

  test('two cuts one frame apart (a one-frame shot) are both found', () => {
    const [a, b, c] = [scene(5), scene(6), scene(7)];
    const frames = [...Array.from({ length: 8 }, (_, i) => a(i)), b(0), ...Array.from({ length: 8 }, (_, i) => c(i))];
    expectCuts(detectCuts(signatures(frames)), [8, 9]);
  });

  test('a cut between two shots of similar colour is still found', () => {
    const a = scene(8);
    const shifted = (t: number) => {
      const px = a(t + 20);
      for (let i = 0; i < px.data.length; i += 4) px.data[i] = Math.min(255, px.data[i] + 60);
      return px;
    };
    const frames = [...Array.from({ length: 10 }, (_, i) => a(i)), ...Array.from({ length: 10 }, (_, i) => shifted(i))];
    expectCuts(detectCuts(signatures(frames)), [10]);
  });
});

describe('cuts: gradual change is not a cut', () => {
  test('a slow cross-dissolve over 8 sampled frames (4 s at 2 fps) gives no cut', () => {
    const [a, b] = [scene(11), scene(12)];
    const frames: Pixels[] = [];
    for (let i = 0; i < 10; i++) frames.push(a(i));
    for (let k = 1; k <= 8; k++) frames.push(mix(a(10 + k), b(k), k / 9));
    for (let i = 0; i < 10; i++) frames.push(b(9 + i));
    expect(detectCuts(signatures(frames))).toEqual([]);
  });

  test('a slow fade to black over 6 frames, a black hold, then a hard cut: only the cut is found', () => {
    const [a, b] = [scene(13), scene(14)];
    const black = blank(W, H);
    const frames: Pixels[] = [];
    for (let i = 0; i < 10; i++) frames.push(a(i));
    for (let k = 1; k <= 6; k++) frames.push(mix(a(10 + k), black, k / 6));
    for (let i = 0; i < 3; i++) frames.push(clone(black));
    for (let i = 0; i < 10; i++) frames.push(b(i));
    expectCuts(detectCuts(signatures(frames)), [19]);
  });

  test('one long shot with motion and heavy noise has no cut', () => {
    const a = scene(15);
    const frames = Array.from({ length: 40 }, (_, i) => a(i));
    expect(detectCuts(frames.map((f, i) => frameSignature(addNoise(clone(f), 14, i))))).toEqual([]);
  });
});

describe('cuts → shots', () => {
  test('cuts at 4 and 9 in 12 frames at 2 fps give three shots with in/out times and a middle key frame', () => {
    expect(shotsFromCuts(12, [4, 9], 2)).toEqual([
      { first: 0, last: 3, in_s: 0, out_s: 2, key_frame: 2 },
      { first: 4, last: 8, in_s: 2, out_s: 4.5, key_frame: 6 },
      { first: 9, last: 11, in_s: 4.5, out_s: 6, key_frame: 10 },
    ]);
  });

  test('one frame (an image) is one shot', () => {
    expect(shotsFromCuts(1, [], 0)).toEqual([{ first: 0, last: 0, in_s: 0, out_s: 0, key_frame: 0 }]);
  });
});
