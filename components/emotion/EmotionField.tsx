"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { visualTargetFor } from "@/lib/emotion/palette";
import { useEmotion } from "./EmotionProvider";

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uTurbulence;
  uniform float uGlitch;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec2 uResolution;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i++) {
      value += amplitude * snoise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = vec2(uv.x * aspect, uv.y);
    float t = uTime * uSpeed;

    // Subtle glitch - only at high messiness, heavily damped.
    if (uGlitch > 0.08) {
      float band = floor(uv.y * mix(28.0, 10.0, uGlitch));
      float jitter = sin(band * 1.7 + t * 2.0) * uGlitch * 0.04;
      p.x += jitter;
    }

    float warp = uTurbulence * 1.1;
    vec2 q = vec2(
      fbm(p * 1.1 + vec2(0.0, t * 0.45)),
      fbm(p * 1.1 + vec2(4.1, t * 0.38))
    );
    vec2 r = vec2(
      fbm(p * 1.3 + q * warp + vec2(1.2, 7.4) + t * 0.22),
      fbm(p * 1.3 + q * warp + vec2(6.8, 2.1) + t * 0.2)
    );
    float f = fbm(p * 1.2 + r * 1.2);

    float mixA = smoothstep(-0.55, 0.55, f + q.x * 0.45);
    float mixB = smoothstep(-0.35, 0.75, r.y + f * 0.4);

    vec3 color = mix(uColorA, uColorB, mixA);
    color = mix(color, uColorC, mixB * 0.65);

    // Brighter base so the field reads clearly through glass UI.
    float glow = 0.28 + 0.42 * smoothstep(-0.6, 0.9, f + r.x * 0.35);
    color *= glow;

    float d = distance(uv, vec2(0.5, 0.45));
    color *= 1.0 - d * 0.45;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function FieldPlane() {
  const { state } = useEmotion();
  const material = useRef<THREE.ShaderMaterial>(null);
  const target = useRef(visualTargetFor(state));
  useEffect(() => {
    target.current = visualTargetFor(state);
  }, [state]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: 0.1 },
      uTurbulence: { value: 0.22 },
      uGlitch: { value: 0 },
      uColorA: { value: new THREE.Color("#6366f1") },
      uColorB: { value: new THREE.Color("#8b5cf6") },
      uColorC: { value: new THREE.Color("#2dd4bf") },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  const scratch = useMemo(() => new THREE.Color(), []);

  useFrame((rootState, delta) => {
    const mat = material.current;
    if (!mat) return;
    const u = mat.uniforms;
    const t = target.current;
    const ease = Math.min(delta * 6, 0.28);

    u.uTime.value += delta;
    u.uSpeed.value += (t.speed - u.uSpeed.value) * ease;
    u.uTurbulence.value += (t.turbulence - u.uTurbulence.value) * ease;
    u.uGlitch.value += (t.glitch - u.uGlitch.value) * ease;
    (u.uColorA.value as THREE.Color).lerp(scratch.set(t.colors[0]), ease);
    (u.uColorB.value as THREE.Color).lerp(scratch.set(t.colors[1]), ease);
    (u.uColorC.value as THREE.Color).lerp(scratch.set(t.colors[2]), ease);
    (u.uResolution.value as THREE.Vector2).set(
      rootState.size.width,
      rootState.size.height
    );
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function EmotionField() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <Canvas
        gl={{ antialias: true, alpha: false, powerPreference: "default" }}
        dpr={[1, 1.25]}
        frameloop="always"
        style={{ width: "100%", height: "100%" }}
      >
        <FieldPlane />
      </Canvas>
    </div>
  );
}
