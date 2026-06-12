"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { RobotPose } from "@/lib/avatar/toneRobot";
import { BoneMount, findRobotBone } from "./BoneMount";

function PeaceSign() {
  return (
    <group rotation={[0, 0, -0.3]}>
      <mesh position={[-0.03, 0.08, 0.02]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.035, 0.14, 0.025]} />
        <meshStandardMaterial color="#eef1f8" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.03, 0.08, 0.02]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.035, 0.14, 0.025]} />
        <meshStandardMaterial color="#eef1f8" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.02, 0.02]}>
        <boxGeometry args={[0.06, 0.06, 0.025]} />
        <meshStandardMaterial color="#eef1f8" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function OpenPalm() {
  return (
    <group rotation={[0.4, 0, 0]}>
      <mesh>
        <boxGeometry args={[0.08, 0.055, 0.02]} />
        <meshStandardMaterial color="#eef1f8" emissive="#ffffff" emissiveIntensity={0.15} />
      </mesh>
      {[-0.03, -0.01, 0.01, 0.03].map((x) => (
        <mesh key={x} position={[x, 0.052, 0.002]}>
          <boxGeometry args={[0.014, 0.052, 0.018]} />
          <meshStandardMaterial color="#eef1f8" emissive="#ffffff" emissiveIntensity={0.12} />
        </mesh>
      ))}
    </group>
  );
}

function ReleasingPalm({ side }: { side: "left" | "right" }) {
  const ref = useRef<THREE.Group>(null);
  const dir = side === "left" ? -1 : 1;

  useFrame((state) => {
    const palm = ref.current;
    if (!palm) return;
    const t = state.clock.elapsedTime;
    const release = 0.5 + Math.sin(t * 1.25) * 0.5;
    palm.position.x = dir * release * 0.025;
    palm.rotation.z = dir * (0.16 + release * 0.16);
  });

  return (
    <group ref={ref}>
      <OpenPalm />
    </group>
  );
}

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

function ThumbsUpSign() {
  return (
    <group rotation={[0.1, 0, -0.08]}>
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[0.1, 0.11, 0.04]} />
        <meshStandardMaterial color="#eef1f8" emissive="#ffffff" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[-0.07, 0.065, 0.002]} rotation={[0, 0, 0.55]}>
        <boxGeometry args={[0.04, 0.17, 0.04]} />
        <meshStandardMaterial color="#eef1f8" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      {[-0.03, 0, 0.03].map((x, i) => (
        <mesh key={x} position={[x + 0.02, 0.035 - i * 0.012, 0.003]}>
          <boxGeometry args={[0.026, 0.082, 0.032]} />
          <meshStandardMaterial color="#eef1f8" emissive="#ffffff" emissiveIntensity={0.14} />
        </mesh>
      ))}
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
  const rightArm = useMemo(() => {
    if (pose !== "peace") return null;
    return findRobotBone(model, "LowerArm.R") ?? findRobotBone(model, "UpperArm.R");
  }, [pose, model]);

  const body = useMemo(() => {
    if (pose !== "meditate" && pose !== "thumbsUp") return null;
    return findRobotBone(model, "Body") ?? findRobotBone(model, "Torso");
  }, [pose, model]);

  const leftArm = useMemo(() => {
    if (pose !== "bowRelease") return null;
    return findRobotBone(model, "LowerArm.L");
  }, [pose, model]);

  const rightArmPolite = useMemo(() => {
    if (pose !== "bowRelease") return null;
    return findRobotBone(model, "LowerArm.R");
  }, [pose, model]);

  if (pose === "peace" && rightArm) {
    return (
      <BoneMount bone={rightArm} position={[0, -0.12, 0.08]} rotation={[-1.2, 0, 0]} scale={1}>
        <PeaceSign />
      </BoneMount>
    );
  }

  if (pose === "meditate" && body) {
    return (
      <BoneMount bone={body} position={[0, 0.05, 0.23]} rotation={[-0.15, 0, 0]} scale={1.35}>
        <MeditationHands accent={accent} />
      </BoneMount>
    );
  }

  if (pose === "thumbsUp" && body) {
    return (
      <BoneMount bone={body} position={[0.5, 0.34, 0.25]} rotation={[-0.1, 0, -0.18]} scale={1.85}>
        <ThumbsUpSign />
      </BoneMount>
    );
  }

  if (pose === "bowRelease") {
    return (
      <>
        {leftArm && (
          <BoneMount bone={leftArm} position={[0, -0.1, 0.06]} rotation={[-0.8, 0, 0.3]} scale={1}>
            <ReleasingPalm side="left" />
          </BoneMount>
        )}
        {rightArmPolite && (
          <BoneMount bone={rightArmPolite} position={[0, -0.1, 0.06]} rotation={[-0.8, 0, -0.3]} scale={1}>
            <ReleasingPalm side="right" />
          </BoneMount>
        )}
      </>
    );
  }

  return null;
}
