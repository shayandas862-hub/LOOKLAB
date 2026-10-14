// WebGL finishing pass: bloom (two radii), motion and zoom blur, chromatic
// aberration, slight barrel, vignette, flash, fade and per-frame film grain.
const VS = `attribute vec2 p; varying vec2 uv; void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
const BRIGHT = `precision highp float; varying vec2 uv; uniform sampler2D src; uniform float thr;
void main(){ vec3 c = texture2D(src, uv).rgb; float l = max(c.r, max(c.g, c.b));
  gl_FragColor = vec4(c * smoothstep(thr, thr + 0.3, l), 1.0); }`;
const BLUR = `precision highp float; varying vec2 uv; uniform sampler2D src; uniform vec2 dir;
void main(){ vec3 s = texture2D(src, uv).rgb * 0.2270270270;
  s += (texture2D(src, uv + dir * 1.3846153846).rgb + texture2D(src, uv - dir * 1.3846153846).rgb) * 0.3162162162;
  s += (texture2D(src, uv + dir * 3.2307692308).rgb + texture2D(src, uv - dir * 3.2307692308).rgb) * 0.0702702703;
  gl_FragColor = vec4(s, 1.0); }`;
const FINAL = `precision highp float; varying vec2 uv;
uniform sampler2D src, bA, bB; uniform vec2 res, mdir, zc;
uniform float zoom, ca, flash, fade, bloom, grain, frame, vig, n;
float hash(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
vec3 samp(vec2 u){ vec2 d = u - 0.5;
  return vec3(texture2D(src, 0.5 + d * (1.0 + ca)).r, texture2D(src, u).g, texture2D(src, 0.5 + d * (1.0 - ca)).b); }
void main(){
  vec2 d = uv - 0.5, a = d * vec2(res.x / res.y, 1.0);
  vec2 u = 0.5 + d * (1.0 - 0.012 * dot(a, a));
  vec3 acc = vec3(0.0); float cnt = 0.0;
  for (int i = 0; i < 32; i++) {
    if (float(i) >= n) break;
    float k = n > 1.0 ? float(i) / (n - 1.0) - 0.5 : 0.0;
    vec2 uu = u + mdir / res * k;
    uu = zc + (uu - zc) * (1.0 - zoom * (k + 0.5));
    acc += samp(uu); cnt += 1.0;
  }
  vec3 c = acc / cnt;
  c += (texture2D(bA, u).rgb * 0.55 + texture2D(bB, u).rgb * 0.9) * bloom;
  c = mix(c, vec3(1.0, 0.985, 0.96), flash);
  float v = smoothstep(1.25, 0.35, length(d * vec2(1.0, 0.8)) * 1.35);
  c *= mix(1.0, v, vig);
  vec2 g = gl_FragCoord.xy + vec2(frame * 37.0, frame * 91.0);
  float gr = (hash(g) + hash(g + 17.3) - 1.0);
  c += gr * grain * (1.0 - 0.55 * dot(c, vec3(0.3333)));
  gl_FragColor = vec4(clamp(c * fade, 0.0, 1.0), 1.0);
}`;

export function createPost(canvas, W, H) {
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false });
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = (fs) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; };
  const P = { bright: prog(BRIGHT), blur: prog(BLUR), final: prog(FINAL) };
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const tex = (w, h) => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    if (w) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); return t; };
  const target = (w, h) => { const t = tex(w, h), f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return { t, f, w, h }; };
  const src = tex(0, 0);
  const q = [target(W / 4, H / 4), target(W / 4, H / 4)], e = [target(W / 8, H / 8), target(W / 8, H / 8)];

  function pass(p, out, inputs, uni) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, out ? out.f : null);
    gl.viewport(0, 0, out ? out.w : W, out ? out.h : H);
    gl.useProgram(p);
    inputs.forEach(([name, t], i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(gl.getUniformLocation(p, name), i); });
    for (const [k, v] of Object.entries(uni)) {
      const loc = gl.getUniformLocation(p, k);
      if (Array.isArray(v)) gl.uniform2f(loc, v[0], v[1]); else gl.uniform1f(loc, v);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function blur(a, b, scale) {
    pass(P.blur, b, [['src', a.t]], { dir: [scale / a.w, 0] });
    pass(P.blur, a, [['src', b.t]], { dir: [0, scale / a.h] });
  }

  return function render(source, u) {
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    pass(P.bright, q[0], [['src', src]], { thr: 0.62 });
    blur(q[0], q[1], 1.2); blur(q[0], q[1], 2.2);
    pass(P.blur, e[0], [['src', q[0].t]], { dir: [0, 0] });
    blur(e[0], e[1], 1.6); blur(e[0], e[1], 3.0);
    pass(P.final, null, [['src', src], ['bA', q[0].t], ['bB', e[0].t]], { res: [W, H], ...u });
  };
}
