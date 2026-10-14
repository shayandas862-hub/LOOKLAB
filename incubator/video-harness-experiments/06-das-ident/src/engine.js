// Renderer and finishing chain (carried from the films). One scene is drawn, with motion blur from real sub-frames,
// then bloom, tone mapping, and a grade pass: flash, punch-in, shake, colour split, an anamorphic lens streak,
// grain and vignette. The halftone, scanline and noise paths are kept from the films but unused here.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { W, H, FPS } from './timeline.js';

const QUAD_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

class ScenePass extends Pass {
  constructor() {
    super();
    Object.assign(this, { active: null, t: 0, k: 1, shutter: 0.5 / FPS });
    this.rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
    this.quad = new FullScreenQuad(new THREE.ShaderMaterial({
      uniforms: { tex: { value: null }, w: { value: 1 } }, vertexShader: QUAD_VS,
      fragmentShader: 'uniform sampler2D tex; uniform float w; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tex, vUv) * w; }',
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquation: THREE.AddEquation,
      depthTest: false, depthWrite: false, transparent: true,
    }));
  }
  render(renderer, writeBuffer) {
    const s = this.active, k = this.k;
    renderer.setRenderTarget(writeBuffer); renderer.setClearColor(0x000000, 0); renderer.clear();
    for (let i = 0; i < k; i++) {
      s.update(k > 1 ? this.t + (i / (k - 1) - 0.5) * this.shutter : this.t);
      renderer.setRenderTarget(this.rt); renderer.setClearColor(s.clear ?? 0x000000, 1); renderer.clear();
      if (s.draw) s.draw(renderer, this.rt); else renderer.render(s.scene, s.camera);
      renderer.setRenderTarget(writeBuffer);
      this.quad.material.uniforms.tex.value = this.rt.texture; this.quad.material.uniforms.w.value = 1 / k;
      this.quad.render(renderer);
    }
    if (k > 1) s.update(this.t);
  }
}

const Grade = {
  uniforms: {
    tDiffuse: { value: null }, frame: { value: 0 }, grain: { value: 0.035 }, vig: { value: 0.35 },
    flash: { value: 0 }, flashCol: { value: new THREE.Color(1, 1, 1) }, punch: { value: 0 }, shake: { value: new THREE.Vector2() },
    chroma: { value: 0 }, contrast: { value: 1.05 }, sat: { value: 1 }, gain: { value: new THREE.Color(1, 1, 1) }, lift: { value: new THREE.Color(0, 0, 0) },
    fade: { value: 1 }, halftone: { value: 0 }, scan: { value: 0 }, mono: { value: 0 }, paper: { value: new THREE.Color('#F4EFE4') },
    noise: { value: 0 }, noiseStep: { value: 0 },
    streak: { value: 0 }, streakPos: { value: new THREE.Vector2(0.5, 0.5) }, streakCol: { value: new THREE.Color(0.55, 0.75, 1.0) },
  },
  vertexShader: QUAD_VS,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float frame, grain, vig, flash, punch, chroma, contrast, sat, fade, halftone, scan, mono, noise, noiseStep, streak;
    uniform vec2 streakPos; uniform vec3 streakCol;
    uniform vec3 flashCol, gain, lift, paper; uniform vec2 shake; varying vec2 vUv;
    float hash(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
    float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
    void main(){
      vec2 uv = (vUv - 0.5) / (1.0 + punch) + 0.5 + shake;
      vec2 d = uv - 0.5;
      vec3 c;
      if (chroma > 0.0) { vec2 o = d * chroma; c = vec3(texture2D(tDiffuse, uv + o).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - o).b); }
      else c = texture2D(tDiffuse, uv).rgb;
      c = lift + c * (gain - lift);
      c = (c - 0.5) * contrast + 0.5;
      float l = lum(c); c = mix(vec3(l), c, sat);
      c = mix(c, vec3(l), mono);
      if (halftone > 0.0) {
        // Comic print: ink dots on a 45° grid, sized by darkness, on warm paper.
        vec2 p = gl_FragCoord.xy * 0.7071; p = vec2(p.x + p.y, p.y - p.x) / 9.0;
        float r = length(fract(p) - 0.5), ink = smoothstep(0.02, -0.02, r - 0.62 * sqrt(clamp(1.0 - l * 1.15, 0.0, 1.0)));
        float edge = step(l, 0.08);
        vec3 h = mix(paper, vec3(0.06, 0.05, 0.07), max(ink, edge));
        c = mix(c, h, halftone);
      }
      if (scan > 0.0) { c *= 1.0 - scan * 0.18 * step(0.5, fract(gl_FragCoord.y / 3.0)); c = mix(c, vec3(lum(c)) * vec3(0.85, 0.95, 1.05), scan * 0.6); }
      if (noise > 0.0) {
        // The AI lane: the frame resolves out of noise, coarse blocks first, finer with every step.
        float bs = mix(2.0, 40.0, noise); vec2 cell = floor(gl_FragCoord.xy / bs);
        vec3 nz = vec3(hash(cell + noiseStep * 7.1), hash(cell + noiseStep * 3.7 + 11.0), hash(cell + noiseStep * 5.3 + 23.0));
        c = mix(c, nz * 0.85 + c * 0.15, noise);
      }
      if (streak > 0.0) {
        // An anamorphic lens streak: a thin horizontal line through the light, with a soft core.
        vec2 q = (vUv - streakPos) * vec2(1.7778, 1.0);
        c += streakCol * streak * (exp(-abs(q.y) * 320.0) * exp(-abs(q.x) * 2.2) * 1.2 + exp(-abs(q.y) * 40.0) * exp(-abs(q.x) * 3.0) * 0.08);
      }
      c *= mix(1.0, smoothstep(1.25, 0.3, length(d * vec2(1.0, 0.82)) * 1.3), vig);
      vec2 g = gl_FragCoord.xy + vec2(frame * 37.0, frame * 91.0);
      c += (hash(g) + hash(g + 17.3) - 1.0) * grain * (1.0 - 0.5 * lum(c));
      c = mix(c, flashCol, clamp(flash, 0.0, 1.0));
      gl_FragColor = vec4(clamp(c * fade, 0.0, 1.0), 1.0);
    }`,
};

// A dark studio for chrome to reflect: softbox strips on black, one warm accent.
export function studioEnv(renderer, { accent = '#FF6A1A', strips = 1 } = {}) {
  const s = new THREE.Scene(); s.background = new THREE.Color(0x000000);
  const box = (w, h, x, y, z, col, ry = 0, rx = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m);
  };
  const k = strips;
  box(2.2, 8, -6, 1, 0, new THREE.Color(3 * k, 3 * k, 3 * k), Math.PI / 2);
  box(1.2, 8, 6, 1, -2, new THREE.Color(2 * k, 2 * k, 2.2 * k), -Math.PI / 2);
  box(8, 1.0, 0, 6, 0, new THREE.Color(2.5 * k, 2.5 * k, 2.5 * k), 0, Math.PI / 2);
  box(5, 0.35, 0, 1.4, -6, new THREE.Color(accent).multiplyScalar(2.2));
  box(3, 3, 0, 0.5, 6, new THREE.Color(0.25, 0.25, 0.28), Math.PI);
  const pm = new THREE.PMREMGenerator(renderer), tex = pm.fromScene(s, 0.02).texture; pm.dispose();
  return tex;
}

export function createEngine(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0; // keeps brand hues true
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const pass = new ScenePass();
  const composer = new EffectComposer(renderer); composer.setPixelRatio(1); composer.setSize(W, H);
  composer.addPass(pass);
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.5, 0.55, 1.0);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(Grade); composer.addPass(grade);
  return { renderer, composer, pass, bloom, grade: grade.uniforms };
}
