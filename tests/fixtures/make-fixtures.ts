// Writes the committed test fixtures. Run once, then commit the output:
//   node --experimental-strip-types tests/fixtures/make-fixtures.ts
// patches-239.png: a 2.39:1 frame of five flat colour stripes whose colours and shares are
// listed in patches-239.json. tests/engine/fixtures.test.ts checks the PNG still matches.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { encodePng } from '../../src/engine/png.ts';

const HERE = import.meta.dirname;
const spec = {
  about: 'Five flat vertical stripes, left to right, each as wide as its share of the frame (P2 palette fixture).',
  width: 1195,
  height: 500,
  patches: [['#1B2230', 36], ['#C7803A', 24], ['#3E4A52', 18], ['#E9C9A0', 12], ['#6E5B4A', 10]] as [string, number][],
};

const data = new Uint8ClampedArray(spec.width * spec.height * 4);
let x0 = 0;
let acc = 0;
for (const [hex, share] of spec.patches) {
  acc += share;
  const x1 = Math.round((acc / 100) * spec.width);
  const n = parseInt(hex.slice(1), 16);
  for (let y = 0; y < spec.height; y++)
    for (let x = x0; x < x1; x++) {
      const i = (y * spec.width + x) * 4;
      data[i] = (n >> 16) & 255;
      data[i + 1] = (n >> 8) & 255;
      data[i + 2] = n & 255;
      data[i + 3] = 255;
    }
  x0 = x1;
}

writeFileSync(join(HERE, 'patches-239.png'), encodePng({ width: spec.width, height: spec.height, data }));
writeFileSync(join(HERE, 'patches-239.json'), JSON.stringify(spec, null, 2) + '\n');
console.log('wrote tests/fixtures/patches-239.png and .json');
