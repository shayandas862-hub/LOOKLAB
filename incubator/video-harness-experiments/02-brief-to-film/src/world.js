// Renderer, world and finishing chain. Motion blur is real: each output frame is the
// average of several sub-frames spread across a 180° shutter, rendered at their own times.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { W, H, FPS, C } from './timeline.js';

const QUAD_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

class AccumPass extends Pass {
  constructor(scene, camera, setTime) {
    super();
    Object.assign(this, { scene, camera, setTime, t: 0, k: 1, shutter: 0.5 / FPS });
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
      renderer.setRenderTarget(this.rt); renderer.setClearColor(C.black, 1); renderer.clear();
      renderer.render(this.scene, this.camera);
      renderer.setRenderTarget(writeBuffer);
      this.quad.material.uniforms.tex.value = this.rt.texture;
      this.quad.material.uniforms.w.value = 1 / this.k;
      this.quad.render(renderer);
    }
  }
}

// Display-space finish: overlay typography, chromatic aberration, vignette, grain, flash, fade.
const FinishShader = {
  uniforms: { tDiffuse: { value: null }, tOverlay: { value: null }, res: { value: new THREE.Vector2(W, H) },
    ca: { value: 0.0012 }, grain: { value: 0.045 }, frame: { value: 0 }, vig: { value: 0.5 }, fade: { value: 1 }, flash: { value: 0 } },
  vertexShader: QUAD_VS,
  fragmentShader: `
    uniform sampler2D tDiffuse, tOverlay; uniform vec2 res; uniform float ca, grain, frame, vig, fade, flash; varying vec2 vUv;
    float hash(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
    vec3 comp(vec2 uv){ vec3 b = texture2D(tDiffuse, uv).rgb; vec4 o = texture2D(tOverlay, uv); return mix(b, o.rgb, o.a); }
    void main(){
      vec2 d = vUv - 0.5;
      vec3 c = vec3(comp(vUv + d * ca).r, comp(vUv).g, comp(vUv - d * ca).b);
      c = mix(c, vec3(1.0, 0.97, 0.93), flash);
      c *= mix(1.0, smoothstep(1.2, 0.3, length(d * vec2(1.0, 0.85)) * 1.3), vig);
      vec2 g = gl_FragCoord.xy + vec2(frame * 37.0, frame * 91.0);
      c += (hash(g) + hash(g + 17.3) - 1.0) * grain * (1.0 - 0.5 * dot(c, vec3(0.333)));
      gl_FragColor = vec4(clamp(c * fade, 0.0, 1.0), 1.0);
    }`,
};

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.black);
  scene.fog = new THREE.FogExp2(C.black, 0.038);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.28;

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.32, metalness: 0.55 }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);

  const camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 220);
  const accum = new AccumPass(scene, camera, () => {});
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(1); composer.setSize(W, H);
  composer.addPass(accum);
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.85, 0.55, 0.82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const finish = new ShaderPass(FinishShader);
  composer.addPass(finish);

  const overlay = document.createElement('canvas'); overlay.width = W; overlay.height = H;
  const overlayTex = new THREE.CanvasTexture(overlay);
  overlayTex.colorSpace = THREE.NoColorSpace; overlayTex.flipY = true;
  finish.uniforms.tOverlay.value = overlayTex;

  return { renderer, scene, camera, composer, accum, bloom, finish, overlay, overlayTex };
}
