// Renderer and finishing chain: soft shadows, motion blur from real sub-frames (180° shutter),
// depth of field, gentle bloom, AgX tone mapping, then grain, vignette and the letterbox.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { W, H, FPS } from './timeline.js';

const QUAD_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

class AccumPass extends Pass {
  constructor(scene, camera) {
    super();
    Object.assign(this, { scene, camera, setTime: () => {}, t: 0, k: 1, shutter: 0.5 / FPS });
    this.rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
    this.quad = new FullScreenQuad(new THREE.ShaderMaterial({
      uniforms: { tex: { value: null }, w: { value: 1 } }, vertexShader: QUAD_VS,
      fragmentShader: 'uniform sampler2D tex; uniform float w; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tex, vUv) * w; }',
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquation: THREE.AddEquation,
      depthTest: false, depthWrite: false, transparent: true,
    }));
  }
  render(renderer, writeBuffer) {
    renderer.setRenderTarget(writeBuffer); renderer.setClearColor(0x000000, 0); renderer.clear();
    for (let i = 0; i < this.k; i++) {
      this.setTime(this.k > 1 ? this.t + (i / (this.k - 1) - 0.5) * this.shutter : this.t);
      renderer.setRenderTarget(this.rt); renderer.clear(); renderer.render(this.scene, this.camera);
      renderer.setRenderTarget(writeBuffer);
      this.quad.material.uniforms.tex.value = this.rt.texture; this.quad.material.uniforms.w.value = 1 / this.k;
      this.quad.render(renderer);
    }
    this.setTime(this.t); // depth of field focuses on the frame's own instant
  }
}

const Finish = {
  uniforms: { tDiffuse: { value: null }, grain: { value: 0.03 }, frame: { value: 0 }, vig: { value: 0.32 }, fade: { value: 1 }, bars: { value: 0 }, lift: { value: 0 } },
  vertexShader: QUAD_VS,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float grain, frame, vig, fade, bars, lift; varying vec2 vUv;
    float hash(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
    void main(){
      vec2 d = vUv - 0.5;
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      c = c * (1.0 - lift) + lift * vec3(0.06, 0.05, 0.08);
      c *= mix(1.0, smoothstep(1.25, 0.3, length(d * vec2(1.0, 0.82)) * 1.3), vig);
      vec2 g = gl_FragCoord.xy + vec2(frame * 37.0, frame * 91.0);
      c += (hash(g) + hash(g + 17.3) - 1.0) * grain * (1.0 - 0.5 * dot(c, vec3(0.333)));
      float bar = 0.128 * bars;
      if (vUv.y < bar || vUv.y > 1.0 - bar) c = vec3(0.0);
      gl_FragColor = vec4(clamp(c * fade, 0.0, 1.0), 1.0);
    }`,
};

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.AgXToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(30, W / H, 0.05, 200); scene.add(camera);
  const accum = new AccumPass(scene, camera);
  const composer = new EffectComposer(renderer); composer.setPixelRatio(1); composer.setSize(W, H);
  composer.addPass(accum);
  const bokeh = new BokehPass(scene, camera, { focus: 5, aperture: 0.002, maxblur: 0.012 });
  composer.addPass(bokeh);
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.45, 0.6, 0.92);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const finish = new ShaderPass(Finish); composer.addPass(finish);
  return { renderer, scene, camera, composer, accum, bokeh, bloom, finish };
}
