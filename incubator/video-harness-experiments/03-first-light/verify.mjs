const base = process.argv[2];
const { cameraAt } = await import(base + '/src/shots.js');
const { pose } = await import(base + '/src/anim.js');
const { CUTS, FPS, DURATION } = await import(base + '/src/timeline.js');
const n = DURATION * FPS, issues = [];
const d3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
let prev = null, prevP = {};
for (let f = 0; f < n; f++) {
  const t = f / FPS, c = cameraAt(t);
  const cut = CUTS.some((x) => Math.abs(x - t) < 0.5 / FPS);
  if (prev && !cut) {
    const v = d3(c.pos, prev.pos) * FPS, dir = [c.tgt[0]-c.pos[0], c.tgt[1]-c.pos[1], c.tgt[2]-c.pos[2]], pd = [prev.tgt[0]-prev.pos[0], prev.tgt[1]-prev.pos[1], prev.tgt[2]-prev.pos[2]];
    const ang = Math.acos(Math.min(1, (dir[0]*pd[0]+dir[1]*pd[1]+dir[2]*pd[2]) / (Math.hypot(...dir)*Math.hypot(...pd)))) * FPS;
    if (v > 6) issues.push(`f${f} t=${t.toFixed(2)} camera speed ${v.toFixed(1)} m/s`);
    if (ang > 2.5) issues.push(`f${f} t=${t.toFixed(2)} camera turn ${ang.toFixed(2)} rad/s`);
  }
  for (const who of ['dir', 'actor']) {
    const p = pose(who, t), q = prevP[who];
    if (q && p.visible && q.visible) {
      const v = Math.hypot(p.x - q.x, p.z - q.z) * FPS, w = Math.abs(wrap(p.yaw - q.yaw)) * FPS;
      if (v > 4) issues.push(`f${f} t=${t.toFixed(2)} ${who} moves ${v.toFixed(1)} m/s`);
      if (w > 9 && !(who === 'actor' && t > 29.5 && t < 30.7)) issues.push(`f${f} t=${t.toFixed(2)} ${who} turns ${w.toFixed(1)} rad/s`);
    }
    prevP[who] = p;
  }
  prev = c;
}
console.log(issues.length ? issues.join('\n') : 'no motion glitches found in ' + n + ' frames');
