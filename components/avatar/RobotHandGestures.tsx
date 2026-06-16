"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { RobotPose } from "@/lib/avatar/toneRobot";
import { BoneMount, findRobotBone } from "./BoneMount";

function MeditationHands({ accent }: { accent: string }) {
  const glow = new THREE.Color(accent);

  return (
    <group>
      <mesh position={[-0.06, 0, 0]} rotation={[0.35, 0, -0.28]}>
        <boxGeometry args={[0.12, 0.045, 0.022]} />
        <meshStandardMaterial
          color="#eef1f8"
          emissive={glow}
          emissiveIntensity={0.18}
          metalness={0.05}
          roughness={0.65}
        />
      </mesh>
      <mesh position={[0.06, 0, 0]} rotation={[0.35, 0, 0.28]}>
        <boxGeometry args={[0.12, 0.045, 0.022]} />
        <meshStandardMaterial
          color="#eef1f8"
          emissive={glow}
          emissiveIntensity={0.18}
          metalness={0.05}
          roughness={0.65}
        />
      </mesh>
      <mesh position={[0, 0.035, -0.004]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.09, 0.008, 8, 28]} />
        <meshStandardMaterial
          color={glow}
          emissive={glow}
          emissiveIntensity={0.4}
          transparent
          opacity={0.72}
        />
      </mesh>
    </group>
  );
}

export function RobotHandGestures({
  pose,
  model,
  accent = "#7dd3fc",
}: {
  pose: RobotPose;
  model: THREE.Object3D;
  accent?: string;
}) {
  const body = useMemo(() => {
    if (pose !== "meditate") return null;
    return findRobotBone(model, "Body") ?? findRobotBone(model, "Torso");
  }, [pose, model]);

  if (pose === "meditate" && body) {
    return (
      <BoneMount bone={body} position={[0, 0.05, 0.23]} rotation={[-0.15, 0, 0]} scale={1.35}>
        <MeditationHands accent={accent} />
      </BoneMount>
    );
  }

  return null;
}
