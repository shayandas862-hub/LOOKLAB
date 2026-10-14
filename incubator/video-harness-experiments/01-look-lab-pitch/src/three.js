// A tiny pinhole camera: enough 3D for a set plan, no library.
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a) => mul(a, 1 / Math.hypot(...a));

export function camera(eye, target, fovDeg, cx, cy, H) {
  const f = norm(sub(target, eye)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
  const focal = (H / 2) / Math.tan((fovDeg * Math.PI) / 360);
  const project = (p) => {
    const d = sub(p, eye), z = dot(d, f);
    if (z < 0.1) return null;
    return [cx + (dot(d, r) * focal) / z, cy - (dot(d, u) * focal) / z, z];
  };
  return { eye, project, focal };
}

export function polyline(ctx, cam, pts, close = false) {
  let started = false;
  ctx.beginPath();
  for (const p of pts) {
    const q = cam.project(p);
    if (!q) { started = false; continue; }
    if (!started) { ctx.moveTo(q[0], q[1]); started = true; } else ctx.lineTo(q[0], q[1]);
  }
  if (close) ctx.closePath();
}

// A segment drawn to fraction k of its length.
export function seg(ctx, cam, a, b, k = 1) {
  if (k <= 0) return;
  const pa = cam.project(a), pb = cam.project(add(a, mul(sub(b, a), k)));
  if (!pa || !pb) return;
  ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
}

export function ring(y, r, cx = 0, cz = 0, n = 32) {
  return Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]; });
}

// The four corners of a w×h panel at p, facing target.
export function panel(p, target, w, h) {
  const f = norm(sub(target, p)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
  const R = mul(r, w / 2), U = mul(u, h / 2);
  return [add(add(p, R), U), add(sub(p, R), U), sub(sub(p, R), U), sub(add(p, R), U)];
}
