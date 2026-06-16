"use client";

import { createPortal } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import type { RobotAccessory } from "@/lib/avatar/toneRobot";
import { findRobotBone } from "./BoneMount";

function SuitAndTie({ accent }: { accent: string }) {
  const tieColor = new THREE.Color(accent);
  const jacketColor = new THREE.Color("#171821");
  const lapelColor = new THREE.Color("#2a2a35");
  const shirtColor = new THREE.Color("#f3f6fb");

  return (
    <group>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.6, 0.5, 0.032]} />
        <meshStandardMaterial color={jacketColor} metalness={0.12} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.04, 0.035]}>
        <boxGeometry args={[0.22, 0.34, 0.018]} />
        <meshStandardMaterial color={shirtColor} metalness={0.05} roughness={0.85} />
      </mesh>
      <mesh position={[-0.15, 0.005, 0.062]} rotation={[0, 0, 0.28]}>
        <boxGeometry args={[0.13, 0.36, 0.022]} />
        <meshStandardMaterial color={lapelColor} metalness={0.15} roughness={0.65} />
      </mesh>
      <mesh position={[0.15, 0.005, 0.062]} rotation={[0, 0, -0.28]}>
        <boxGeometry args={[0.13, 0.36, 0.022]} />
        <meshStandardMaterial color={lapelColor} metalness={0.15} roughness={0.65} />
      </mesh>
      <mesh position={[-0.08, 0.165, 0.083]} rotation={[0, 0, -0.26]}>
        <boxGeometry args={[0.17, 0.065, 0.022]} />
        <meshStandardMaterial color={shirtColor} metalness={0.05} roughness={0.85} />
      </mesh>
      <mesh position={[0.08, 0.165, 0.083]} rotation={[0, 0, 0.26]}>
        <boxGeometry args={[0.17, 0.065, 0.022]} />
        <meshStandardMaterial color={shirtColor} metalness={0.05} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.11, 0.105]}>
        <boxGeometry args={[0.095, 0.085, 0.032]} />
        <meshStandardMaterial
          color={tieColor}
          emissive={tieColor}
          emissiveIntensity={0.35}
          metalness={0.2}
          roughness={0.45}
        />
      </mesh>
      <mesh position={[0, -0.065, 0.098]}>
        <boxGeometry args={[0.085, 0.34, 0.026]} />
        <meshStandardMaterial
          color={tieColor}
          emissive={tieColor}
          emissiveIntensity={0.25}
          metalness={0.25}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

function Streetwear() {
  const hoodie = new THREE.Color("#4a5568");
  const hoodieAccent = new THREE.Color("#ef476f");
  const cap = new THREE.Color("#1a1a2e");
  const chain = new THREE.Color("#d4af37");

  return (
    <group>
      <mesh position={[0, 0.28, -0.06]}>
        <boxGeometry args={[0.52, 0.22, 0.28]} />
        <meshStandardMaterial color={hoodie} metalness={0.08} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.42, -0.1]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.36, 0.2, 0.12]} />
        <meshStandardMaterial color={hoodie} metalness={0.08} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.22, 0.1]}>
        <boxGeometry args={[0.18, 0.04, 0.03]} />
        <meshStandardMaterial
          color={hoodieAccent}
          emissive={hoodieAccent}
          emissiveIntensity={0.18}
          metalness={0.05}
          roughness={0.82}
        />
      </mesh>
      <mesh position={[-0.12, 0.3, 0.09]} rotation={[0.18, 0, -0.2]}>
        <boxGeometry args={[0.025, 0.28, 0.02]} />
        <meshStandardMaterial color="#eef1f8" metalness={0.05} roughness={0.72} />
      </mesh>
      <mesh position={[0.12, 0.3, 0.09]} rotation={[0.18, 0, 0.2]}>
        <boxGeometry args={[0.025, 0.28, 0.02]} />
        <meshStandardMaterial color="#eef1f8" metalness={0.05} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.52, 0.12]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.34, 0.1, 0.28]} />
        <meshStandardMaterial color={cap} metalness={0.12} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.48, 0.24]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.22, 0.04, 0.14]} />
        <meshStandardMaterial color={cap} metalness={0.12} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.34, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.012, 8, 24, Math.PI]} />
        <meshStandardMaterial color={chain} metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
}

function IntellectualGlasses({ accent }: { accent: string }) {
  const frame = new THREE.Color("#172033");
  const lens = new THREE.Color("#dcecff");
  const glow = new THREE.Color(accent);

  return (
    <group>
      <mesh position={[-0.14, 0, 0.008]} scale={[1.22, 0.78, 1]}>
        <torusGeometry args={[0.105, 0.01, 8, 30]} />
        <meshStandardMaterial color={frame} metalness={0.55} roughness={0.32} />
      </mesh>
      <mesh position={[0.14, 0, 0.008]} scale={[1.22, 0.78, 1]}>
        <torusGeometry args={[0.105, 0.01, 8, 30]} />
        <meshStandardMaterial color={frame} metalness={0.55} roughness={0.32} />
      </mesh>
      <mesh position={[-0.14, 0, 0.002]} scale={[1.18, 0.76, 1]}>
        <circleGeometry args={[0.098, 28]} />
        <meshStandardMaterial
          color={lens}
          emissive={glow}
          emissiveIntensity={0.08}
          transparent
          opacity={0.34}
          roughness={0.08}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0.14, 0, 0.002]} scale={[1.18, 0.76, 1]}>
        <circleGeometry args={[0.098, 28]} />
        <meshStandardMaterial
          color={lens}
          emissive={glow}
          emissiveIntensity={0.08}
          transparent
          opacity={0.34}
          roughness={0.08}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.004, 0.01]}>
        <boxGeometry args={[0.085, 0.018, 0.018]} />
        <meshStandardMaterial color={frame} metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[-0.31, 0.012, -0.018]} rotation={[0, -0.38, 0]}>
        <boxGeometry args={[0.16, 0.014, 0.014]} />
        <meshStandardMaterial color={frame} metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0.31, 0.012, -0.018]} rotation={[0, 0.38, 0]}>
        <boxGeometry args={[0.16, 0.014, 0.014]} />
        <meshStandardMaterial color={frame} metalness={0.5} roughness={0.35} />
      </mesh>
    </group>
  );
}

function ModelBoneMount({
  bone,
  position,
  rotation,
  scale,
  children,
}: {
  bone: THREE.Object3D | null;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  children: React.ReactNode;
}) {
  if (!bone) return null;

  return createPortal(
    <group name="ToneRobotAccessory" position={position} rotation={rotation} scale={scale}>
      {children}
    </group>,
    bone
  );
}

const BONE_LAYOUT: Record<
  Exclude<RobotAccessory, null>,
  {
    bone: "Body" | "Torso_1" | "Head";
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
  }
> = {
  suit: {
    bone: "Torso_1",
    position: [0, 0.003, 0.0094],
    rotation: [-0.06, 0, 0],
    scale: 0.0112,
  },
  streetwear: {
    bone: "Body",
    position: [0, 0.1, 0.16],
    rotation: [0.1, 0, 0],
    scale: 1.55,
  },
  glasses: {
    bone: "Head",
    position: [0, 0, 0.024],
    rotation: [0, 0, 0],
    scale: 0.06,
  },
};

export function RobotAccessories({
  accessory,
  model,
  accent = "#8b5cf6",
}: {
  accessory: RobotAccessory;
  model: THREE.Object3D;
  accent?: string;
}) {
  const attachBone = useMemo(() => {
    if (!accessory) return null;
    const layout = BONE_LAYOUT[accessory];
    return findRobotBone(model, layout.bone);
  }, [accessory, model]);

  if (!accessory || !attachBone) return null;

  const layout = BONE_LAYOUT[accessory];

  return (
    <ModelBoneMount
      bone={attachBone}
      position={layout.position}
      rotation={layout.rotation}
      scale={layout.scale}
    >
      {accessory === "suit" && <SuitAndTie accent={accent} />}
      {accessory === "streetwear" && <Streetwear />}
      {accessory === "glasses" && <IntellectualGlasses accent={accent} />}
    </ModelBoneMount>
  );
}
