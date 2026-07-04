"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/** Mount children on a skeleton bone - works reliably without createPortal. */
export function BoneMount({
  bone,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  children,
}: {
  bone: THREE.Object3D | null;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const offset = useMemo(() => new THREE.Matrix4(), []);
  const world = useMemo(() => new THREE.Matrix4(), []);

  useLayoutEffect(() => {
    offset.compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
      new THREE.Vector3(scale, scale, scale)
    );
  }, [offset, position, rotation, scale]);

  useFrame(() => {
    const group = ref.current;
    if (!group || !bone) return;
    bone.updateWorldMatrix(true, false);
    world.copy(bone.matrixWorld).multiply(offset);
    group.matrix.copy(world);
    group.matrixAutoUpdate = false;
  });

  if (!bone) return null;

  return <group ref={ref}>{children}</group>;
}

function normalizeBoneName(name: string): string {
  return name.replace(/[\s.[\]:/\\_-]/g, "").toLowerCase();
}

export function findRobotBone(root: THREE.Object3D, name: string): THREE.Object3D | null {
  let found: THREE.Object3D | null = null;
  const normalized = normalizeBoneName(name);
  root.traverse((obj) => {
    if (found) return;
    const bone = obj as THREE.Bone;
    if (bone.isBone && (bone.name === name || normalizeBoneName(bone.name) === normalized)) {
      found = bone;
    }
  });
  return found;
}
