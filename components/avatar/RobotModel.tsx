"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { resolveBaseAnimation, resolveExpression, type MorphExpression } from "@/lib/avatar/expressions";
import { getToneAvatarStyle, type AvatarMood } from "@/lib/avatar/toneStyle";
import { getToneRobotConfig, type RobotPose, type RobotStretch } from "@/lib/avatar/toneRobot";
import type { ToneId } from "@/lib/tones";
import type { EmotionColors } from "./AvatarCanvas";
import { RobotAccessories } from "./RobotAccessories";
import { RobotHeartPulse } from "./RobotEffects";
import { RobotHandGestures } from "./RobotHandGestures";

const MODEL_URL = "/models/RobotExpressive.glb";

const ONE_SHOT_ANIMATIONS = new Set([
  "Jump",
  "Yes",
  "No",
  "Wave",
  "Punch",
  "ThumbsUp",
  "SitToMeditate",
  "Death",
  "Dance",
  "WalkJump",
]);

const STRETCH_TARGET: Record<Exclude<RobotStretch, null>, number> = {
  longer: 1.34,
  shorter: 0.72,
};

type RobotModelProps = {
  mood: AvatarMood;
  tone: ToneId | null;
  thinking: boolean;
  highlighted: boolean;
  muted: boolean;
  emotionColors: EmotionColors;
  scale?: number;
  modelY?: number;
};

type MaterialRole = "face" | "accent" | "body" | "limb" | "eye" | "highlight" | "other";

type MaterialBinding = {
  mat: THREE.MeshStandardMaterial;
  role: MaterialRole;
};

type FaceColorBinding = {
  position: THREE.BufferAttribute;
  color: THREE.BufferAttribute;
};

const WHITE = new THREE.Color("#ffffff");
const BODY_DARK = new THREE.Color("#171821");
const ROBOT_GREY = new THREE.Color("#5f6058");

type KeyframeTrackConstructor = {
  new (name: string, times: ArrayLike<number>, values: ArrayLike<number>): THREE.KeyframeTrack;
};

function copyClip(name: string, source: THREE.AnimationClip): THREE.AnimationClip {
  return new THREE.AnimationClip(
    name,
    source.duration,
    source.tracks.map((track) => track.clone())
  );
}

function holdTrack(track: THREE.KeyframeTrack, duration: number): THREE.KeyframeTrack {
  const valueSize = track.getValueSize();
  const values = Array.from(track.values.slice(track.values.length - valueSize));
  const mid = [...values];

  if (track.name === "Body.position" && valueSize >= 3) {
    mid[1] += 0.0012;
  }

  const TrackCtor = track.constructor as KeyframeTrackConstructor;
  return new TrackCtor(track.name, [0, duration / 2, duration], [...values, ...mid, ...values]);
}

function meditationClips(animations: THREE.AnimationClip[]): THREE.AnimationClip[] {
  const sitting = animations.find((clip) => clip.name === "Sitting");
  if (!sitting) return animations;

  const existing = new Set(animations.map((clip) => clip.name));
  const extras: THREE.AnimationClip[] = [];

  if (!existing.has("SitToMeditate")) {
    extras.push(copyClip("SitToMeditate", sitting));
  }

  if (!existing.has("Meditate")) {
    extras.push(
      new THREE.AnimationClip(
        "Meditate",
        3.2,
        sitting.tracks.map((track) => holdTrack(track, 3.2))
      )
    );
  }

  return [...animations, ...extras];
}

function findHeadMesh(root: THREE.Object3D): THREE.SkinnedMesh | null {
  let head: THREE.SkinnedMesh | null = null;
  root.traverse((obj) => {
    if (head) return;
    const mesh = obj as THREE.SkinnedMesh;
    if (mesh.isMesh && mesh.morphTargetDictionary && "Angry" in mesh.morphTargetDictionary) {
      head = mesh;
    }
  });
  return head;
}

function applyPose(
  pose: RobotPose,
  poseRef: THREE.Group,
  delta: number,
  bowRef: React.MutableRefObject<number>,
  bowPulseRef: React.MutableRefObject<number>,
  bowReleaseRef: React.MutableRefObject<number>,
  t: number
) {
  const lerp = (current: number, target: number, speed: number) =>
    THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));

  let rotX = 0;
  let rotZ = 0;
  let rotY = 0.15;
  let scale = 1;
  let yOff = 0;

  if (pose === "bow" || pose === "bowRelease") {
    bowPulseRef.current = lerp(bowPulseRef.current, 0.62, 2.4);
    bowRef.current = lerp(bowRef.current, 1, 3.5);
    const release = pose === "bowRelease" ? bowReleaseRef.current : 0;
    const bowAmt = bowRef.current * bowPulseRef.current * (1 - release * 0.55);
    rotX = -0.48 * bowAmt;
    yOff = -0.28 * bowAmt;
    rotY = 0.08;
    if (pose === "bowRelease") {
      bowReleaseRef.current = lerp(bowReleaseRef.current, 1, 0.55);
    }
  } else {
    bowRef.current = lerp(bowRef.current, 0, 5);
    bowPulseRef.current = lerp(bowPulseRef.current, 0, 5);
    bowReleaseRef.current = lerp(bowReleaseRef.current, 0, 5);
  }

  if (pose === "meditate") {
    const breath = Math.sin(t * 0.75);
    rotX = -0.16 + breath * 0.012;
    yOff = -0.2 + Math.sin(t * 0.75) * 0.025;
    rotY = 0.05;
    scale = 0.94 + breath * 0.012;
  }

  if (pose === "peace") {
    rotZ = 0.06;
    rotY = 0.2;
    yOff += Math.sin(t * 2.2) * 0.01;
  }

  if (pose === "thumbsUp") {
    rotY = 0.18;
    rotZ = -0.025;
  }

  poseRef.rotation.x = rotX;
  poseRef.rotation.y = rotY;
  poseRef.rotation.z = rotZ;
  poseRef.scale.setScalar(scale);
  poseRef.position.y = yOff;
}

function materialRole(material: THREE.Material, objectName: string): MaterialRole {
  const key = `${material.name} ${objectName}`.toLowerCase();
  if (material.name === "Main") return "accent";
  if (material.name === "Grey") return "body";
  if (material.name === "Black") return "eye";
  if (key.includes("avatar gradient shell") || key.includes("headmorphs")) return "face";
  if (key.includes("eye")) return "eye";
  if (key.includes("highlight") || key.includes("gloss")) return "highlight";
  if (
    key.includes("accent") ||
    key.includes("ribbon") ||
    key.includes("ring") ||
    key.includes("wave") ||
    key.includes("pod") ||
    key.includes("glow")
  ) {
    return "accent";
  }
  if (key.includes("body") || key.includes("graphite") || key.includes("foot")) return "body";
  if (key.includes("limb") || key.includes("joint") || key.includes("palm")) return "limb";
  return "other";
}

function targetVertexColor(
  x: number,
  y: number,
  colorA: THREE.Color,
  colorB: THREE.Color,
  colorC: THREE.Color,
  out: THREE.Color
) {
  const t = THREE.MathUtils.clamp((x + 1) / 2, 0, 1);
  if (t < 0.5) {
    out.copy(colorA).lerp(colorB, t / 0.5);
  } else {
    out.copy(colorB).lerp(colorC, (t - 0.5) / 0.5);
  }
  const light = THREE.MathUtils.clamp((y + 0.35) * 0.26 + (0.4 - x) * 0.07, 0, 0.18);
  out.lerp(WHITE, light);
}

function applyToneMaterial(
  binding: MaterialBinding,
  colorA: THREE.Color,
  colorB: THREE.Color,
  colorC: THREE.Color,
  alpha: number,
  glow: number,
  scratch: THREE.Color
) {
  const { mat, role } = binding;

  if (role === "face") {
    mat.color.lerp(WHITE, alpha);
    mat.emissive.lerp(scratch.copy(colorB).lerp(colorC, 0.35), alpha);
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, glow * 0.55, alpha);
    return;
  }

  if (role === "accent") {
    const accent = scratch.copy(colorB).lerp(colorC, 0.35);
    mat.color.lerp(accent, alpha);
    mat.emissive.lerp(accent, alpha);
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.42 + glow, alpha);
    return;
  }

  if (role === "body") {
    const body = scratch.copy(ROBOT_GREY).lerp(colorA, 0.34).lerp(BODY_DARK, 0.26);
    mat.color.lerp(body, alpha);
    mat.emissive.lerp(scratch.copy(colorA).lerp(BODY_DARK, 0.68), alpha);
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.08 + glow * 0.3, alpha);
    return;
  }

  if (role === "limb") {
    const limb = scratch.copy(WHITE).lerp(colorC, 0.2);
    mat.color.lerp(limb, alpha);
    mat.emissive.lerp(scratch.copy(colorC).lerp(WHITE, 0.35), alpha);
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.08 + glow * 0.18, alpha);
    return;
  }

  if (role === "eye" || role === "highlight") {
    mat.emissive.lerp(WHITE, alpha);
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity,
      role === "eye" ? 0.62 + glow * 0.35 : 0.16 + glow * 0.22,
      alpha
    );
    return;
  }

  mat.emissive.lerp(colorB, alpha);
  mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, glow * 0.25, alpha);
}

function applyFaceVertexColors(
  bindings: FaceColorBinding[],
  colorA: THREE.Color,
  colorB: THREE.Color,
  colorC: THREE.Color,
  alpha: number,
  scratch: { current: THREE.Color; target: THREE.Color }
) {
  for (const binding of bindings) {
    const { color, position } = binding;
    for (let i = 0; i < color.count; i += 1) {
      targetVertexColor(
        position.getX(i),
        position.getY(i),
        colorA,
        colorB,
        colorC,
        scratch.target
      );
      scratch.current.setRGB(color.getX(i), color.getY(i), color.getZ(i));
      scratch.current.lerp(scratch.target, alpha);
      color.setXYZ(i, scratch.current.r, scratch.current.g, scratch.current.b);
    }
    color.needsUpdate = true;
  }
}

export function RobotModel({
  mood,
  tone,
  thinking,
  highlighted,
  muted,
  emotionColors,
  scale = 1,
  modelY = -0.05,
}: RobotModelProps) {
  const { scene, animations } = useGLTF(MODEL_URL);
  const modelAnimations = useMemo(() => meditationClips(animations), [animations]);
  const model = useMemo(() => cloneSkinned(scene), [scene]);
  const groupRef = useRef<THREE.Group>(null);
  const poseRef = useRef<THREE.Group>(null);
  const stretchRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.SkinnedMesh | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);
  const expressionRef = useRef<MorphExpression>(resolveExpression(mood));
  const shakeRef = useRef(0);
  const excitedBobRef = useRef(0);
  const bowRef = useRef(0);
  const bowPulseRef = useRef(0);
  const bowReleaseRef = useRef(0);
  const stretchYRef = useRef(1);
  const lastToneRef = useRef<ToneId | null>(null);
  const materialBindingsRef = useRef<MaterialBinding[]>([]);
  const faceColorBindingsRef = useRef<FaceColorBinding[]>([]);
  const colorScratchRef = useRef({
    a: new THREE.Color(),
    b: new THREE.Color(),
    c: new THREE.Color(),
    target: new THREE.Color(),
    current: new THREE.Color(),
    material: new THREE.Color(),
  });

  const toneStyle = getToneAvatarStyle(tone);
  const robotConfig = getToneRobotConfig(tone);
  const effectiveMood = toneStyle?.mood ?? mood;
  const targetExpression = resolveExpression(effectiveMood, toneStyle?.mood);
  const robotPose = robotConfig?.pose ?? null;
  const animationSpeed = robotConfig?.animationSpeed ?? 1;

  useEffect(() => {
    const materialBindings: MaterialBinding[] = [];
    const faceColorBindings: FaceColorBinding[] = [];

    headRef.current = findHeadMesh(model);
    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const sourceMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const materials = sourceMaterials.map((mat) =>
        mat instanceof THREE.MeshStandardMaterial ? mat.clone() : mat
      );
      mesh.material = Array.isArray(mesh.material) ? materials : materials[0];

      for (const mat of materials) {
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.metalness = Math.min(mat.metalness, 0.35);
          mat.envMapIntensity = muted ? 0.35 : 0.65;
          materialBindings.push({ mat, role: materialRole(mat, mesh.name) });
        }
      }

      const color = mesh.geometry?.attributes.color;
      const position = mesh.geometry?.attributes.position;
      if (
        mesh.name.toLowerCase().includes("headmorphs") &&
        color instanceof THREE.BufferAttribute &&
        position instanceof THREE.BufferAttribute
      ) {
        faceColorBindings.push({ color, position });
      }
    });
    materialBindingsRef.current = materialBindings;
    faceColorBindingsRef.current = faceColorBindings;

    const mixer = new THREE.AnimationMixer(model);
    mixerRef.current = mixer;
    const actions: Record<string, THREE.AnimationAction> = {};
    for (const clip of modelAnimations) {
      const action = mixer.clipAction(clip);
      actions[clip.name] = action;
      if (ONE_SHOT_ANIMATIONS.has(clip.name)) {
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
      }
    }
    actionsRef.current = actions;

    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
      materialBindingsRef.current = [];
      faceColorBindingsRef.current = [];
    };
  }, [model, modelAnimations, muted]);

  const fadeToAction = useCallback((name: string, duration = 0.45, force = false) => {
    const actions = actionsRef.current;
    const next = actions[name];
    if (!next) return;

    const previous = activeActionRef.current;
    if (!force && previous === next) return;

    if (previous) previous.fadeOut(duration);

    next.reset().setEffectiveTimeScale(animationSpeed).setEffectiveWeight(1).fadeIn(duration).play();
    activeActionRef.current = next;
  }, [animationSpeed]);

  const restoreAnimation = useCallback(() => {
    if (robotConfig?.holdEmote) return;
    fadeToAction(resolveBaseAnimation(effectiveMood, thinking, tone), 0.35);
  }, [effectiveMood, fadeToAction, robotConfig?.holdEmote, thinking, tone]);

  useEffect(() => {
    expressionRef.current = targetExpression;
  }, [targetExpression]);

  useEffect(() => {
    fadeToAction(resolveBaseAnimation(effectiveMood, thinking, tone), 0.5);
  }, [effectiveMood, fadeToAction, thinking, tone]);

  useEffect(() => {
    if (tone && tone !== lastToneRef.current) {
      stretchYRef.current = 1;
      if (robotPose === "bow" || robotPose === "bowRelease") {
        bowRef.current = 0;
        bowPulseRef.current = 1.15;
        bowReleaseRef.current = 0;
      }
      // Force animation swap when tone pill changes.
      const anim = resolveBaseAnimation(effectiveMood, thinking, tone);
      requestAnimationFrame(() => fadeToAction(anim, 0.25, true));
    }
    lastToneRef.current = tone;
  }, [tone, robotPose, effectiveMood, fadeToAction, thinking]);

  useEffect(() => {
    if (!tone || !robotConfig?.emote) return;
    const emote = robotConfig.emote;
    const mixer = mixerRef.current;
    const emoteAction = actionsRef.current[emote];
    if (!mixer || !emoteAction) return;

    fadeToAction(emote, 0.25);

    if (robotConfig.holdEmote || !ONE_SHOT_ANIMATIONS.has(emote)) return;

    const restore = () => {
      mixer.removeEventListener("finished", restore);
      restoreAnimation();
    };
    mixer.addEventListener("finished", restore);
    return () => mixer.removeEventListener("finished", restore);
  }, [
    tone,
    effectiveMood,
    fadeToAction,
    thinking,
    restoreAnimation,
    robotConfig?.emote,
    robotConfig?.holdEmote,
  ]);

  useEffect(() => {
    if (effectiveMood === "alarmed") shakeRef.current = 1;
    if (effectiveMood === "excited") excitedBobRef.current = 1;
  }, [effectiveMood]);

  useFrame((state, delta) => {
    mixerRef.current?.update(delta);

    const head = headRef.current;
    if (head?.morphTargetInfluences && head.morphTargetDictionary) {
      const target = expressionRef.current;
      for (const [name, value] of Object.entries(target) as [keyof MorphExpression, number][]) {
        const index = head.morphTargetDictionary[name];
        if (index === undefined) continue;
        head.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          head.morphTargetInfluences[index],
          value,
          1 - Math.exp(-8 * delta)
        );
      }
    }

    const group = groupRef.current;
    const pose = poseRef.current;
    const stretch = stretchRef.current;
    if (!group || !pose || !stretch) return;

    const t = state.clock.elapsedTime;
    const stationary = robotConfig?.stationary ?? false;
    let offsetX = 0;
    let offsetY = stationary ? 0 : Math.sin(t * 1.4) * 0.03;

    if (shakeRef.current > 0.01) {
      offsetX = Math.sin(t * 42) * 0.06 * shakeRef.current;
      shakeRef.current = THREE.MathUtils.lerp(shakeRef.current, 0, 1 - Math.exp(-4 * delta));
    }

    if (!stationary && excitedBobRef.current > 0.01) {
      offsetY += Math.sin(t * 6) * 0.08 * excitedBobRef.current;
      excitedBobRef.current = THREE.MathUtils.lerp(excitedBobRef.current, 0.35, 1 - Math.exp(-2 * delta));
    }

    if (!stationary && thinking) offsetY += Math.sin(t * 2.2) * 0.015;

    group.position.x = offsetX;
    group.position.y = offsetY;

    applyPose(robotPose, pose, delta, bowRef, bowPulseRef, bowReleaseRef, t);

    const stretchTarget = robotConfig?.stretch ? STRETCH_TARGET[robotConfig.stretch] : 1;
    stretchYRef.current = THREE.MathUtils.lerp(
      stretchYRef.current,
      stretchTarget,
      1 - Math.exp((robotConfig?.stretch ? -3.3 : -4.8) * delta)
    );
    const stretchY = stretchYRef.current;
    const stretchXZ = robotConfig?.stretch
      ? THREE.MathUtils.clamp(1 - (stretchY - 1) * 0.18, 0.93, 1.09)
      : 1;
    stretch.scale.set(stretchXZ, stretchY, stretchXZ);
    stretch.position.y = robotConfig?.stretch ? (stretchY - 1) * 0.18 : 0;

    const scratch = colorScratchRef.current;
    const colorA = scratch.a.set(emotionColors[0]);
    const colorB = scratch.b.set(emotionColors[1]);
    const colorC = scratch.c.set(emotionColors[2]);
    const glow = highlighted ? 0.55 : muted ? 0.12 : 0.28;
    const toneAlpha = 1 - Math.exp(-3.8 * delta);

    for (const binding of materialBindingsRef.current) {
      applyToneMaterial(binding, colorA, colorB, colorC, toneAlpha, glow, scratch.material);
    }

    applyFaceVertexColors(faceColorBindingsRef.current, colorA, colorB, colorC, 1 - Math.exp(-4.5 * delta), scratch);
  });

  return (
    <group ref={groupRef} position={[0, modelY, 0]} scale={scale}>
      <group ref={poseRef}>
        <group ref={stretchRef}>
          <primitive object={model} />
          <RobotAccessories
            accessory={robotConfig?.accessory ?? null}
            model={model}
            accent={emotionColors[1]}
          />
          <RobotHandGestures pose={robotPose} model={model} accent={emotionColors[2]} />
          {robotConfig?.effect === "heartPulse" && <RobotHeartPulse />}
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
