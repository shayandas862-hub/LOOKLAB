// Renderer and finishing chain: physical lights and glass, soft bloom on the highlights, ACES tone mapping, then a
// light grade (vignette and grain) so the previs reads as a food commercial rather than a raw render.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { W, H } from './timeline.js';

const Grade = {
  uniforms: { tDiffuse: { value: null }, frame: { value: 0 }, vig: { value: 0.45 }, grain: { value: 0.025 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float frame, vig, grain; varying vec2 vUv;
    float hash(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      vec2 d = (vUv - 0.5) * vec2(0.5625, 1.0);
      c *= 1.0 - vig * smoothstep(0.18, 0.75, length(d) * 1.35);
      c += (hash(vUv * vec2(${W}.0, ${H}.0) + frame) - 0.5) * grain;
      gl_FragColor = vec4(c, 1.0);
    }`,
};

export function createEngine(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  const pass = new RenderPass(null, null);
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.35, 0.5, 0.92);
  const grade = new ShaderPass(Grade);
  composer.addPass(pass); composer.addPass(bloom); composer.addPass(new OutputPass()); composer.addPass(grade);
  return { renderer, env, composer, pass, bloom, grade: grade.uniforms };
}

// A vertical studio gradient for the background, centre-weighted (the "sweep" behind a product).
export function gradientTexture(top, mid, bottom) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 512;
  const g = c.getContext('2d'), lin = g.createLinearGradient(0, 0, 0, 512);
  lin.addColorStop(0, top); lin.addColorStop(0.55, mid); lin.addColorStop(1, bottom);
  g.fillStyle = lin; g.fillRect(0, 0, 64, 512);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
