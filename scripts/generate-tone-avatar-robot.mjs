import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "../public/models/ToneAvatarRobot.glb");

// THREE.GLTFExporter still expects browser FileReader APIs for GLB output.
if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class NodeFileReader {
    result = null;
    onloadend = null;

    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buffer) => {
        this.result = buffer;
        this.onloadend?.({ target: this });
      });
    }

    readAsDataURL(blob) {
      blob.arrayBuffer().then((buffer) => {
        const type = blob.type || "application/octet-stream";
        const base64 = Buffer.from(buffer).toString("base64");
        this.result = `data:${type};base64,${base64}`;
        this.onloadend?.({ target: this });
      });
    }
  };
}

const AVATAR_PINK = new THREE.Color("#fb5e7a");
const AVATAR_VIOLET = new THREE.Color("#8b5cf6");
const AVATAR_CYAN = new THREE.Color("#2dd4bf");
const WHITE = new THREE.Color("#ffffff");

function material(name, params) {
  const mat = new THREE.MeshStandardMaterial(params);
  mat.name = name;
  return mat;
}

const materials = {
  shell: material("Avatar gradient shell", {
    color: "#ffffff",
    vertexColors: true,
    roughness: 0.28,
    metalness: 0.08,
    emissive: "#25124f",
    emissiveIntensity: 0.15,
  }),
  waveFill: material("Translucent smile wave", {
    color: "#ffffff",
    transparent: true,
    opacity: 0.28,
    roughness: 0.35,
    metalness: 0.02,
    emissive: "#9df7ff",
    emissiveIntensity: 0.22,
    side: THREE.DoubleSide,
  }),
  waveRim: material("Glowing smile ribbon", {
    color: "#f8fbff",
    transparent: true,
    opacity: 0.72,
    roughness: 0.22,
    metalness: 0.05,
    emissive: "#a7f3ff",
    emissiveIntensity: 0.55,
  }),
  eye: material("Soft white avatar eyes", {
    color: "#ffffff",
    roughness: 0.2,
    metalness: 0.02,
    emissive: "#ffffff",
    emissiveIntensity: 0.75,
  }),
  body: material("Graphite robot body", {
    color: "#202331",
    roughness: 0.64,
    metalness: 0.22,
    emissive: "#111827",
    emissiveIntensity: 0.07,
  }),
  limb: material("Warm white robot limbs", {
    color: "#e9eef7",
    roughness: 0.45,
    metalness: 0.28,
    emissive: "#dbeafe",
    emissiveIntensity: 0.08,
  }),
  accent: material("Avatar cyan robot accent", {
    color: "#2dd4bf",
    roughness: 0.28,
    metalness: 0.28,
    emissive: "#2dd4bf",
    emissiveIntensity: 0.5,
  }),
  highlight: material("Gloss highlight", {
    color: "#ffffff",
    transparent: true,
    opacity: 0.34,
    roughness: 0.12,
    metalness: 0.02,
    emissive: "#ffffff",
    emissiveIntensity: 0.18,
  }),
  invisible: material("Invisible rig marker", {
    color: "#000000",
    transparent: true,
    opacity: 0,
    depthWrite: false,
  }),
};

function avatarColor(x, y) {
  const t = THREE.MathUtils.clamp((x + 1) / 2, 0, 1);
  const base = t < 0.5
    ? AVATAR_PINK.clone().lerp(AVATAR_VIOLET, t / 0.5)
    : AVATAR_VIOLET.clone().lerp(AVATAR_CYAN, (t - 0.5) / 0.5);
  const light = THREE.MathUtils.clamp((y + 0.35) * 0.28 + (0.4 - x) * 0.08, 0, 0.16);
  return base.lerp(WHITE, light);
}

function createHeadGeometry() {
  const geometry = new THREE.SphereGeometry(1, 64, 36);
  const positions = geometry.attributes.position;
  const colors = [];
  const angry = [];
  const surprised = [];
  const sad = [];

  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const front = THREE.MathUtils.clamp((z + 1) / 2, 0, 1);
    const cheek = Math.exp(-Math.pow(y + 0.18, 2) * 5) * front;
    const brow = Math.exp(-Math.pow(y - 0.2, 2) * 16) * front;
    const color = avatarColor(x, y);
    colors.push(color.r, color.g, color.b);

    angry.push(
      -x * brow * 0.025,
      -brow * 0.055,
      front * (Math.abs(x) > 0.18 ? 0.012 : -0.018)
    );
    surprised.push(
      x * front * 0.035,
      y * front * 0.05,
      front * 0.06
    );
    sad.push(
      -x * cheek * 0.015,
      -cheek * 0.055,
      -front * cheek * 0.018
    );
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.morphTargetsRelative = true;
  geometry.morphAttributes.position = [
    new THREE.Float32BufferAttribute(angry, 3),
    new THREE.Float32BufferAttribute(surprised, 3),
    new THREE.Float32BufferAttribute(sad, 3),
  ];
  return geometry;
}

function addRoundedBox(parent, name, size, position, mat, radius = 0.08) {
  const mesh = new THREE.Mesh(
    new RoundedBoxGeometry(size[0], size[1], size[2], 6, radius),
    mat
  );
  mesh.name = name;
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function addCapsule(parent, name, radius, length, position, mat) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, 18), mat);
  mesh.name = name;
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function addEye(parent, name, x) {
  const eye = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 14), materials.eye);
  eye.name = name;
  eye.position.set(x, 0.16, 0.405);
  eye.scale.set(0.052, 0.118, 0.018);
  parent.add(eye);
  return eye;
}

function addHighlight(parent, name, position, scale, rotation = [0, 0, 0]) {
  const blob = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), materials.highlight);
  blob.name = name;
  blob.position.set(...position);
  blob.rotation.set(...rotation);
  blob.scale.set(...scale);
  parent.add(blob);
  return blob;
}

function addFaceWave(parent) {
  const shape = new THREE.Shape();
  shape.moveTo(-0.57, -0.03);
  shape.bezierCurveTo(-0.38, 0.12, -0.2, -0.2, 0, -0.06);
  shape.bezierCurveTo(0.23, 0.1, 0.38, -0.1, 0.57, -0.03);
  shape.bezierCurveTo(0.52, -0.34, 0.31, -0.49, 0, -0.5);
  shape.bezierCurveTo(-0.31, -0.49, -0.52, -0.34, -0.57, -0.03);

  const fill = new THREE.Mesh(new THREE.ShapeGeometry(shape, 48), materials.waveFill);
  fill.name = "AvatarWaveFill";
  fill.position.set(0, -0.02, 0.392);
  fill.scale.set(0.96, 0.96, 1);
  parent.add(fill);

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.52, -0.035, 0.422),
    new THREE.Vector3(-0.34, 0.105, 0.435),
    new THREE.Vector3(-0.16, -0.14, 0.45),
    new THREE.Vector3(0, -0.19, 0.455),
    new THREE.Vector3(0.17, -0.13, 0.45),
    new THREE.Vector3(0.35, 0.055, 0.435),
    new THREE.Vector3(0.52, -0.035, 0.422),
  ]);
  const ribbon = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.026, 14, false), materials.waveRim);
  ribbon.name = "AvatarSmileRibbon";
  parent.add(ribbon);
}

function createRig() {
  const root = new THREE.Bone();
  root.name = "Root";

  const body = new THREE.Bone();
  body.name = "Body";
  body.position.set(0, 0.88, 0);
  root.add(body);

  const head = new THREE.Bone();
  head.name = "Head";
  head.position.set(0, 0.74, 0.02);
  body.add(head);

  const upperArmL = new THREE.Bone();
  upperArmL.name = "UpperArmL";
  upperArmL.position.set(-0.42, 0.22, 0);
  body.add(upperArmL);

  const lowerArmL = new THREE.Bone();
  lowerArmL.name = "LowerArmL";
  lowerArmL.position.set(-0.04, -0.38, 0.01);
  upperArmL.add(lowerArmL);

  const upperArmR = new THREE.Bone();
  upperArmR.name = "UpperArmR";
  upperArmR.position.set(0.42, 0.22, 0);
  body.add(upperArmR);

  const lowerArmR = new THREE.Bone();
  lowerArmR.name = "LowerArmR";
  lowerArmR.position.set(0.04, -0.38, 0.01);
  upperArmR.add(lowerArmR);

  const upperLegL = new THREE.Bone();
  upperLegL.name = "UpperLegL";
  upperLegL.position.set(-0.18, -0.43, 0);
  body.add(upperLegL);

  const lowerLegL = new THREE.Bone();
  lowerLegL.name = "LowerLegL";
  lowerLegL.position.set(0, -0.42, 0);
  upperLegL.add(lowerLegL);

  const upperLegR = new THREE.Bone();
  upperLegR.name = "UpperLegR";
  upperLegR.position.set(0.18, -0.43, 0);
  body.add(upperLegR);

  const lowerLegR = new THREE.Bone();
  lowerLegR.name = "LowerLegR";
  lowerLegR.position.set(0, -0.42, 0);
  upperLegR.add(lowerLegR);

  return {
    root,
    bones: [
      root,
      body,
      head,
      upperArmL,
      lowerArmL,
      upperArmR,
      lowerArmR,
      upperLegL,
      lowerLegL,
      upperLegR,
      lowerLegR,
    ],
    refs: { body, head, upperArmL, lowerArmL, upperArmR, lowerArmR, upperLegL, lowerLegL, upperLegR, lowerLegR },
  };
}

function buildModel() {
  const model = new THREE.Group();
  model.name = "ToneAvatarRobot";
  model.userData = {
    source2D: "frontend/public/logo.png and frontend/components/avatar/AvatarSvg.tsx",
    animationContract: "Named bones plus clips: Standing, Idle, Walking, Running, Sitting, Meditate, SitToMeditate, Wave, Yes, No, Jump, Punch, ThumbsUp, Dance, WalkJump, Death.",
    regenerateWith: "node scripts/generate-tone-avatar-robot.mjs",
  };

  const { root, bones, refs } = createRig();
  model.add(root);

  const markerGeometry = new THREE.BoxGeometry(0.012, 0.012, 0.012);
  const skinIndices = [];
  const skinWeights = [];
  for (let i = 0; i < markerGeometry.attributes.position.count; i += 1) {
    skinIndices.push(0, 0, 0, 0);
    skinWeights.push(1, 0, 0, 0);
  }
  markerGeometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndices, 4));
  markerGeometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeights, 4));

  const marker = new THREE.SkinnedMesh(markerGeometry, materials.invisible);
  marker.name = "RigMarker";
  marker.bind(new THREE.Skeleton(bones));
  model.add(marker);

  addRoundedBox(refs.body, "BodyShell", [0.58, 0.68, 0.34], [0, -0.02, 0], materials.body, 0.13);
  addRoundedBox(refs.body, "ChestGlowPlate", [0.36, 0.2, 0.035], [0, 0.12, 0.19], materials.accent, 0.05);
  addCapsule(refs.body, "NeckJoint", 0.08, 0.14, [0, 0.42, 0.01], materials.limb);

  const chestRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 10, 36), materials.waveRim);
  chestRing.name = "ChestAvatarRing";
  chestRing.position.set(0, 0.12, 0.215);
  refs.body.add(chestRing);

  const headSurface = new THREE.Mesh(createHeadGeometry(), materials.shell);
  headSurface.name = "AvatarFace.HeadMorphs";
  headSurface.scale.set(0.62, 0.56, 0.38);
  headSurface.morphTargetDictionary = { Angry: 0, Surprised: 1, Sad: 2 };
  headSurface.morphTargetInfluences = [0, 0, 0];
  refs.head.add(headSurface);

  addFaceWave(refs.head);
  addEye(refs.head, "EyeL", -0.18);
  addEye(refs.head, "EyeR", 0.18);
  addHighlight(refs.head, "LargeGloss.Highlight", [-0.21, 0.36, 0.36], [0.16, 0.058, 0.012], [0, 0, -0.45]);
  addHighlight(refs.head, "SmallGloss.LeftA", [-0.43, 0.05, 0.375], [0.036, 0.036, 0.012]);
  addHighlight(refs.head, "SmallGloss.LeftB", [-0.48, -0.06, 0.365], [0.026, 0.026, 0.01]);
  addHighlight(refs.head, "SmallGloss.RightA", [0.43, -0.22, 0.365], [0.042, 0.042, 0.012]);

  addRoundedBox(refs.head, "LeftAudioPod", [0.11, 0.22, 0.16], [-0.58, -0.02, -0.02], materials.accent, 0.04);
  addRoundedBox(refs.head, "RightAudioPod", [0.11, 0.22, 0.16], [0.58, -0.02, -0.02], materials.accent, 0.04);

  addCapsule(refs.upperArmL, "UpperArmShellL", 0.06, 0.32, [0, -0.18, 0], materials.limb);
  addCapsule(refs.lowerArmL, "LowerArmShellL", 0.055, 0.32, [0, -0.17, 0], materials.limb);
  addCapsule(refs.upperArmR, "UpperArmShellR", 0.06, 0.32, [0, -0.18, 0], materials.limb);
  addCapsule(refs.lowerArmR, "LowerArmShellR", 0.055, 0.32, [0, -0.17, 0], materials.limb);
  addRoundedBox(refs.lowerArmL, "PalmL", [0.13, 0.09, 0.08], [0, -0.36, 0.02], materials.limb, 0.04);
  addRoundedBox(refs.lowerArmR, "PalmR", [0.13, 0.09, 0.08], [0, -0.36, 0.02], materials.limb, 0.04);

  addCapsule(refs.upperLegL, "UpperLegShellL", 0.075, 0.34, [0, -0.18, 0], materials.limb);
  addCapsule(refs.lowerLegL, "LowerLegShellL", 0.065, 0.33, [0, -0.17, 0], materials.limb);
  addCapsule(refs.upperLegR, "UpperLegShellR", 0.075, 0.34, [0, -0.18, 0], materials.limb);
  addCapsule(refs.lowerLegR, "LowerLegShellR", 0.065, 0.33, [0, -0.17, 0], materials.limb);
  addRoundedBox(refs.lowerLegL, "FootL", [0.18, 0.09, 0.28], [0, -0.36, 0.08], materials.body, 0.04);
  addRoundedBox(refs.lowerLegR, "FootR", [0.18, 0.09, 0.28], [0, -0.36, 0.08], materials.body, 0.04);

  return { model, refs };
}

function q(x = 0, y = 0, z = 0) {
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
}

function quatTrack(name, times, eulers) {
  return new THREE.QuaternionKeyframeTrack(
    `${name}.quaternion`,
    times,
    eulers.flatMap((euler) => q(...euler).toArray())
  );
}

function vecTrack(name, times, values) {
  return new THREE.VectorKeyframeTrack(
    `${name}.position`,
    times,
    values.flatMap((value) => value)
  );
}

function makeClips() {
  const loop = (name, tracks, duration = -1) => new THREE.AnimationClip(name, duration, tracks);

  return [
    loop("Standing", [
      vecTrack("Root", [0, 1.2, 2.4], [[0, 0, 0], [0, 0.025, 0], [0, 0, 0]]),
      quatTrack("Body", [0, 1.2, 2.4], [[0, 0, 0], [0.025, 0.02, 0], [0, 0, 0]]),
      quatTrack("Head", [0, 1.2, 2.4], [[0, 0.02, 0], [-0.025, -0.02, 0], [0, 0.02, 0]]),
    ], 2.4),

    loop("Idle", [
      vecTrack("Root", [0, 0.8, 1.6, 2.4], [[0, 0, 0], [0, 0.035, 0], [0, 0.01, 0], [0, 0, 0]]),
      quatTrack("Body", [0, 1.2, 2.4], [[0, -0.04, -0.015], [0.015, 0.04, 0.015], [0, -0.04, -0.015]]),
      quatTrack("Head", [0, 1.2, 2.4], [[0.02, 0.06, 0.015], [-0.02, -0.04, -0.01], [0.02, 0.06, 0.015]]),
      quatTrack("UpperArmL", [0, 1.2, 2.4], [[0.05, 0, 0.08], [0, 0, 0.02], [0.05, 0, 0.08]]),
      quatTrack("UpperArmR", [0, 1.2, 2.4], [[0.05, 0, -0.08], [0, 0, -0.02], [0.05, 0, -0.08]]),
    ], 2.4),

    loop("Walking", [
      vecTrack("Root", [0, 0.35, 0.7, 1.05, 1.4], [[0, 0, 0], [0, 0.035, 0], [0, 0, 0], [0, 0.035, 0], [0, 0, 0]]),
      quatTrack("Body", [0, 0.7, 1.4], [[0.04, 0, -0.025], [0.04, 0, 0.025], [0.04, 0, -0.025]]),
      quatTrack("UpperArmL", [0, 0.7, 1.4], [[0.46, 0, 0.05], [-0.42, 0, 0.06], [0.46, 0, 0.05]]),
      quatTrack("UpperArmR", [0, 0.7, 1.4], [[-0.42, 0, -0.05], [0.46, 0, -0.06], [-0.42, 0, -0.05]]),
      quatTrack("UpperLegL", [0, 0.7, 1.4], [[-0.46, 0, 0.02], [0.45, 0, 0.02], [-0.46, 0, 0.02]]),
      quatTrack("UpperLegR", [0, 0.7, 1.4], [[0.45, 0, -0.02], [-0.46, 0, -0.02], [0.45, 0, -0.02]]),
      quatTrack("LowerLegL", [0, 0.7, 1.4], [[0.5, 0, 0], [0.04, 0, 0], [0.5, 0, 0]]),
      quatTrack("LowerLegR", [0, 0.7, 1.4], [[0.04, 0, 0], [0.5, 0, 0], [0.04, 0, 0]]),
    ], 1.4),

    loop("Running", [
      vecTrack("Root", [0, 0.22, 0.44, 0.66, 0.88], [[0, 0, 0], [0, 0.065, 0], [0, 0, 0], [0, 0.065, 0], [0, 0, 0]]),
      quatTrack("Body", [0, 0.44, 0.88], [[0.16, 0, -0.04], [0.16, 0, 0.04], [0.16, 0, -0.04]]),
      quatTrack("UpperArmL", [0, 0.44, 0.88], [[0.75, 0, 0.06], [-0.7, 0, 0.06], [0.75, 0, 0.06]]),
      quatTrack("UpperArmR", [0, 0.44, 0.88], [[-0.7, 0, -0.06], [0.75, 0, -0.06], [-0.7, 0, -0.06]]),
      quatTrack("UpperLegL", [0, 0.44, 0.88], [[-0.75, 0, 0.02], [0.68, 0, 0.02], [-0.75, 0, 0.02]]),
      quatTrack("UpperLegR", [0, 0.44, 0.88], [[0.68, 0, -0.02], [-0.75, 0, -0.02], [0.68, 0, -0.02]]),
      quatTrack("LowerLegL", [0, 0.44, 0.88], [[0.8, 0, 0], [0.08, 0, 0], [0.8, 0, 0]]),
      quatTrack("LowerLegR", [0, 0.44, 0.88], [[0.08, 0, 0], [0.8, 0, 0], [0.08, 0, 0]]),
    ], 0.88),

    loop("Sitting", [
      vecTrack("Body", [0, 1.5, 3], [[0, 0.64, 0], [0, 0.66, 0], [0, 0.64, 0]]),
      quatTrack("Body", [0, 1.5, 3], [[-0.05, 0, 0], [-0.08, 0.02, 0], [-0.05, 0, 0]]),
      quatTrack("Head", [0, 1.5, 3], [[-0.05, 0.03, 0], [-0.02, -0.03, 0], [-0.05, 0.03, 0]]),
      quatTrack("UpperArmL", [0, 1.5, 3], [[-0.75, -0.15, 0.3], [-0.78, -0.1, 0.28], [-0.75, -0.15, 0.3]]),
      quatTrack("UpperArmR", [0, 1.5, 3], [[-0.75, 0.15, -0.3], [-0.78, 0.1, -0.28], [-0.75, 0.15, -0.3]]),
      quatTrack("UpperLegL", [0, 1.5, 3], [[-1.45, 0.18, 0.42], [-1.43, 0.18, 0.42], [-1.45, 0.18, 0.42]]),
      quatTrack("UpperLegR", [0, 1.5, 3], [[-1.45, -0.18, -0.42], [-1.43, -0.18, -0.42], [-1.45, -0.18, -0.42]]),
      quatTrack("LowerLegL", [0, 1.5, 3], [[1.15, 0, 0], [1.12, 0, 0], [1.15, 0, 0]]),
      quatTrack("LowerLegR", [0, 1.5, 3], [[1.15, 0, 0], [1.12, 0, 0], [1.15, 0, 0]]),
    ], 3),

    loop("Meditate", [
      vecTrack("Body", [0, 1.6, 3.2], [[0, 0.56, 0], [0, 0.585, 0], [0, 0.56, 0]]),
      quatTrack("Body", [0, 1.6, 3.2], [[-0.14, 0, 0], [-0.17, 0.025, 0], [-0.14, 0, 0]]),
      quatTrack("Head", [0, 1.6, 3.2], [[-0.1, 0.025, 0], [-0.06, -0.025, 0], [-0.1, 0.025, 0]]),
      quatTrack("UpperArmL", [0, 1.6, 3.2], [[-1.05, -0.32, 0.48], [-1.08, -0.28, 0.5], [-1.05, -0.32, 0.48]]),
      quatTrack("LowerArmL", [0, 1.6, 3.2], [[-0.7, 0.18, -0.28], [-0.74, 0.15, -0.24], [-0.7, 0.18, -0.28]]),
      quatTrack("UpperArmR", [0, 1.6, 3.2], [[-1.05, 0.32, -0.48], [-1.08, 0.28, -0.5], [-1.05, 0.32, -0.48]]),
      quatTrack("LowerArmR", [0, 1.6, 3.2], [[-0.7, -0.18, 0.28], [-0.74, -0.15, 0.24], [-0.7, -0.18, 0.28]]),
      quatTrack("UpperLegL", [0, 1.6, 3.2], [[-1.55, 0.42, 0.72], [-1.52, 0.42, 0.7], [-1.55, 0.42, 0.72]]),
      quatTrack("LowerLegL", [0, 1.6, 3.2], [[1.32, -0.08, -0.34], [1.28, -0.08, -0.32], [1.32, -0.08, -0.34]]),
      quatTrack("UpperLegR", [0, 1.6, 3.2], [[-1.55, -0.42, -0.72], [-1.52, -0.42, -0.7], [-1.55, -0.42, -0.72]]),
      quatTrack("LowerLegR", [0, 1.6, 3.2], [[1.32, 0.08, 0.34], [1.28, 0.08, 0.32], [1.32, 0.08, 0.34]]),
    ], 3.2),

    loop("SitToMeditate", [
      vecTrack("Root", [0, 0.28, 0.72, 1.25, 1.8], [[0, 0, 0], [0, -0.05, 0], [0, -0.16, 0], [0, -0.2, 0], [0, -0.2, 0]]),
      vecTrack("Body", [0, 0.72, 1.25, 1.8], [[0, 0.88, 0], [0, 0.72, 0], [0, 0.58, 0], [0, 0.56, 0]]),
      quatTrack("Body", [0, 0.72, 1.25, 1.8], [[0, 0, 0], [-0.16, 0, 0], [-0.24, 0.02, 0], [-0.14, 0, 0]]),
      quatTrack("Head", [0, 0.72, 1.25, 1.8], [[0, 0, 0], [-0.08, 0, 0], [-0.16, 0.02, 0], [-0.1, 0.025, 0]]),
      quatTrack("UpperArmL", [0, 0.72, 1.25, 1.8], [[0.02, 0, 0.08], [-0.55, -0.2, 0.32], [-1.0, -0.32, 0.48], [-1.05, -0.32, 0.48]]),
      quatTrack("LowerArmL", [0, 0.72, 1.25, 1.8], [[0, 0, 0], [-0.35, 0.08, -0.12], [-0.68, 0.18, -0.28], [-0.7, 0.18, -0.28]]),
      quatTrack("UpperArmR", [0, 0.72, 1.25, 1.8], [[0.02, 0, -0.08], [-0.55, 0.2, -0.32], [-1.0, 0.32, -0.48], [-1.05, 0.32, -0.48]]),
      quatTrack("LowerArmR", [0, 0.72, 1.25, 1.8], [[0, 0, 0], [-0.35, -0.08, 0.12], [-0.68, -0.18, 0.28], [-0.7, -0.18, 0.28]]),
      quatTrack("UpperLegL", [0, 0.72, 1.25, 1.8], [[0.04, 0, 0.04], [-0.85, 0.18, 0.38], [-1.45, 0.34, 0.64], [-1.55, 0.42, 0.72]]),
      quatTrack("LowerLegL", [0, 0.72, 1.25, 1.8], [[0, 0, 0], [0.7, -0.02, -0.12], [1.18, -0.06, -0.3], [1.32, -0.08, -0.34]]),
      quatTrack("UpperLegR", [0, 0.72, 1.25, 1.8], [[0.04, 0, -0.04], [-0.85, -0.18, -0.38], [-1.45, -0.34, -0.64], [-1.55, -0.42, -0.72]]),
      quatTrack("LowerLegR", [0, 0.72, 1.25, 1.8], [[0, 0, 0], [0.7, 0.02, 0.12], [1.18, 0.06, 0.3], [1.32, 0.08, 0.34]]),
    ], 1.8),

    loop("Wave", [
      quatTrack("UpperArmR", [0, 0.25, 0.55, 0.85, 1.15], [[0, 0, -0.1], [-1.25, 0.15, -1.05], [-1.18, 0.2, -1.18], [-1.25, 0.15, -0.92], [-1.25, 0.15, -1.05]]),
      quatTrack("LowerArmR", [0, 0.25, 0.55, 0.85, 1.15], [[0, 0, 0], [-0.55, 0, -0.15], [-0.3, 0, 0.42], [-0.55, 0, -0.42], [-0.45, 0, 0.12]]),
      quatTrack("Head", [0, 0.55, 1.15], [[0, 0, 0], [0.05, -0.18, 0.04], [0, 0, 0]]),
    ], 1.15),

    loop("Yes", [
      quatTrack("Head", [0, 0.18, 0.36, 0.54, 0.72], [[0, 0, 0], [0.28, 0, 0], [-0.18, 0, 0], [0.22, 0, 0], [0, 0, 0]]),
    ], 0.72),

    loop("No", [
      quatTrack("Head", [0, 0.18, 0.36, 0.54, 0.72], [[0, 0, 0], [0, 0.32, 0], [0, -0.32, 0], [0, 0.22, 0], [0, 0, 0]]),
    ], 0.72),

    loop("Jump", [
      vecTrack("Root", [0, 0.22, 0.48, 0.72, 1], [[0, 0, 0], [0, -0.05, 0], [0, 0.42, 0], [0, 0.06, 0], [0, 0, 0]]),
      quatTrack("UpperArmL", [0, 0.48, 1], [[0, 0, 0], [-0.95, 0, 0.52], [0, 0, 0]]),
      quatTrack("UpperArmR", [0, 0.48, 1], [[0, 0, 0], [-0.95, 0, -0.52], [0, 0, 0]]),
    ], 1),

    loop("Punch", [
      quatTrack("UpperArmR", [0, 0.2, 0.42, 0.72], [[0, 0, -0.1], [-1.15, 0.05, -0.52], [-1.35, -0.05, -0.18], [0, 0, -0.1]]),
      quatTrack("LowerArmR", [0, 0.2, 0.42, 0.72], [[0, 0, 0], [-0.35, 0, 0.05], [-1.25, 0, 0.02], [0, 0, 0]]),
      quatTrack("Body", [0, 0.42, 0.72], [[0, 0, 0], [0.12, -0.18, -0.05], [0, 0, 0]]),
    ], 0.72),

    loop("ThumbsUp", [
      quatTrack("UpperArmR", [0, 0.35, 0.9], [[0, 0, -0.08], [-1.1, 0.12, -0.92], [-1.1, 0.12, -0.92]]),
      quatTrack("LowerArmR", [0, 0.35, 0.9], [[0, 0, 0], [-0.35, 0, 0.18], [-0.35, 0, 0.18]]),
      quatTrack("Head", [0, 0.9], [[0, 0, 0], [0.02, -0.08, 0.03]]),
    ], 0.9),

    loop("Dance", [
      vecTrack("Root", [0, 0.3, 0.6, 0.9, 1.2], [[-0.05, 0, 0], [0.05, 0.06, 0], [-0.05, 0, 0], [0.05, 0.06, 0], [-0.05, 0, 0]]),
      quatTrack("Body", [0, 0.3, 0.6, 0.9, 1.2], [[0, 0, -0.15], [0.05, 0.1, 0.15], [0, 0, -0.15], [0.05, -0.1, 0.15], [0, 0, -0.15]]),
      quatTrack("UpperArmL", [0, 0.6, 1.2], [[-0.8, 0, 0.65], [-0.35, 0, 0.1], [-0.8, 0, 0.65]]),
      quatTrack("UpperArmR", [0, 0.6, 1.2], [[-0.35, 0, -0.1], [-0.8, 0, -0.65], [-0.35, 0, -0.1]]),
    ], 1.2),

    loop("WalkJump", [
      vecTrack("Root", [0, 0.3, 0.58, 0.9, 1.2], [[0, 0, 0], [0, 0.05, 0], [0, 0.34, 0], [0, 0.04, 0], [0, 0, 0]]),
      quatTrack("UpperLegL", [0, 0.58, 1.2], [[-0.5, 0, 0], [-0.9, 0, 0.08], [-0.5, 0, 0]]),
      quatTrack("UpperLegR", [0, 0.58, 1.2], [[0.5, 0, 0], [0.1, 0, -0.08], [0.5, 0, 0]]),
      quatTrack("UpperArmL", [0, 0.58, 1.2], [[0.5, 0, 0], [-0.9, 0, 0.4], [0.5, 0, 0]]),
      quatTrack("UpperArmR", [0, 0.58, 1.2], [[-0.5, 0, 0], [-0.9, 0, -0.4], [-0.5, 0, 0]]),
    ], 1.2),

    loop("Death", [
      vecTrack("Root", [0, 0.45, 1.1], [[0, 0, 0], [0, -0.18, 0], [0, -0.52, 0]]),
      quatTrack("Body", [0, 0.45, 1.1], [[0, 0, 0], [0.4, 0, 0.55], [1.2, 0, 1.2]]),
      quatTrack("Head", [0, 1.1], [[0, 0, 0], [-0.45, 0.2, -0.35]]),
    ], 1.1),
  ];
}

async function exportGlb(model, animations) {
  const scene = new THREE.Scene();
  scene.name = "ToneConverterRobotScene";
  scene.add(model);

  const exporter = new GLTFExporter();
  return exporter.parseAsync(scene, {
    binary: true,
    trs: true,
    onlyVisible: true,
    animations,
    includeCustomExtensions: false,
  });
}

const { model } = buildModel();
const animations = makeClips();
const glb = await exportGlb(model, animations);
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, Buffer.from(glb));

console.log(`Wrote ${outputPath}`);
console.log(`Clips: ${animations.map((clip) => clip.name).join(", ")}`);
