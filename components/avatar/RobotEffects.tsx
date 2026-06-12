"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const HEART_CONFIGS = Array.from({ length: 3 }, (_, i) => ({
  phase: i * 1.4,
  speed: 0.55 + i * 0.12,
}));

/** Pulsing hearts that float up from the robot chest (empathetic tone). */
export function RobotHeartPulse() {
  return (
    <group position={[0, 1.1, 0.58]}>
      <HeartEmitter />
    </group>
  );
}

function HeartEmitter() {
  const heartMeshes = useRef<Array<THREE.Mesh | null>>([]);
  const heartGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.3);
    shape.bezierCurveTo(-0.52, -0.02, -0.48, 0.38, -0.18, 0.38);
    shape.bezierCurveTo(-0.06, 0.38, 0, 0.28, 0, 0.18);
    shape.bezierCurveTo(0, 0.28, 0.06, 0.38, 0.18, 0.38);
    shape.bezierCurveTo(0.48, 0.38, 0.52, -0.02, 0, -0.3);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.014,
      bevelThickness: 0.014,
      steps: 1,
    });
    geometry.center();
    return geometry;
  }, []);
  const accent = useMemo(() => new THREE.Color("#ff5c7a"), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    HEART_CONFIGS.forEach((h, i) => {
      const mesh = heartMeshes.current[i];
      if (!mesh) return;
      const cycle = ((t + h.phase) * h.speed) % 2.8;
      const progress = cycle / 2.8;
      mesh.position.set(
        Math.sin(t * 1.6 + h.phase) * 0.08,
        progress * 0.9,
        progress * 0.15
      );
      mesh.rotation.set(
        Math.sin(t * 0.75 + h.phase) * 0.15,
        Math.sin(t * 0.9 + h.phase) * 0.18,
        Math.sin(t * 1.2 + h.phase) * 0.22
      );
      mesh.quaternion.copy(state.camera.quaternion);
      const pulse = 1 + Math.sin(t * 5 + h.phase) * 0.18;
      const scale = (0.42 + progress * 0.14) * pulse * (1 - progress * 0.35);
      mesh.scale.setScalar(scale);
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.copy(accent);
      mat.emissive.copy(accent);
      mat.emissiveIntensity = 0.5 + Math.sin(t * 4 + h.phase) * 0.25;
      mat.opacity = 1 - progress * 0.85;
    });
  });

  return (
    <group>
      {HEART_CONFIGS.map((_, i) => (
        <mesh
          key={i}
          geometry={heartGeometry}
          ref={(el) => {
            heartMeshes.current[i] = el;
          }}
        >
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.7}
            transparent
            metalness={0.1}
            roughness={0.45}
            opacity={0.9}
            side={THREE.DoubleSide}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
