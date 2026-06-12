"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getToneRobotConfig } from "@/lib/avatar/toneRobot";
import { getToneAvatarStyle } from "@/lib/avatar/toneStyle";
import type { EmotionPalette } from "@/lib/emotion/palette";
import type { ToneId } from "@/lib/tones";
import { RobotModel } from "./RobotModel";

export type EmotionColors = readonly [string, string, string];

const DEFAULT_EMOTION_COLORS: EmotionColors = ["#6366f1", "#8b5cf6", "#2dd4bf"];

type CameraProfile = {
  fov: number;
  position: [number, number, number];
  lookAt: [number, number, number];
  modelScale: number;
  modelY?: number;
};

function readScopedEmotionColors(scope: HTMLElement | null): EmotionColors {
  if (typeof window === "undefined" || !scope) return DEFAULT_EMOTION_COLORS;
  const style = getComputedStyle(scope);
  return [
    style.getPropertyValue("--emotion-a").trim() || DEFAULT_EMOTION_COLORS[0],
    style.getPropertyValue("--emotion-b").trim() || DEFAULT_EMOTION_COLORS[1],
    style.getPropertyValue("--emotion-c").trim() || DEFAULT_EMOTION_COLORS[2],
  ];
}

function sameColors(a: EmotionColors, b: EmotionColors): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

function useScopedEmotionColors(scopeRef: React.RefObject<HTMLElement | null>): EmotionColors {
  const [colors, setColors] = useState<EmotionColors>(DEFAULT_EMOTION_COLORS);

  const readColors = useCallback(() => {
    const next = readScopedEmotionColors(scopeRef.current);
    setColors((previous) => (sameColors(previous, next) ? previous : next));
  }, [scopeRef]);

  useEffect(readColors);

  useEffect(() => {
    let frame = 0;
    const scheduleRead = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(readColors);
    };

    scheduleRead();
    const observers: MutationObserver[] = [];
    let node: HTMLElement | null = scopeRef.current;
    while (node) {
      const observer = new MutationObserver(scheduleRead);
      observer.observe(node, { attributes: true, attributeFilter: ["class", "style"] });
      observers.push(observer);
      node = node.parentElement;
    }

    return () => {
      cancelAnimationFrame(frame);
      for (const observer of observers) observer.disconnect();
    };
  }, [readColors, scopeRef]);

  return colors;
}

function SceneLights({
  highlighted,
  muted,
  emotionColors,
}: {
  highlighted: boolean;
  muted: boolean;
  emotionColors: EmotionColors;
}) {
  const accent = emotionColors[1];

  const keyIntensity = highlighted ? 2.4 : muted ? 1.2 : 1.8;
  const rimIntensity = highlighted ? 1.6 : muted ? 0.35 : 0.85;

  return (
    <>
      <ambientLight intensity={0.45} />
      <hemisphereLight args={["#ffffff", "#1e1b4b", 1.6]} position={[0, 4, 0]} />
      <directionalLight position={[2, 4, 3]} intensity={keyIntensity} color="#ffffff" />
      <directionalLight position={[-2, 2, -1]} intensity={rimIntensity} color={accent} />
      <pointLight position={[0, 1.5, 2]} intensity={highlighted ? 0.8 : 0.35} color={accent} />
    </>
  );
}

function ThinkingDots({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute -right-0.5 -top-0.5 flex gap-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block rounded-full bg-white/90 shadow-sm"
          style={{
            width: 4 + i * 1.2,
            height: 4 + i * 1.2,
            animation: `avatar-dot 0.9s ease-in-out ${i * 0.18}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

/** Camera profiles — pixel size does not change 3D framing. */
function cameraProfile(mode: "compact" | "default" | "hero"): CameraProfile {
  if (mode === "compact") {
    return {
      fov: 36,
      position: [0, 0.72, 4.4],
      lookAt: [0, 0.62, 0],
      modelScale: 0.88,
    };
  }
  if (mode === "default") {
    return {
      fov: 34,
      position: [0, 0.78, 3.85],
      lookAt: [0, 0.68, 0],
      modelScale: 0.94,
    };
  }
  // Hero / aside — portrait frame, head-to-toe with top padding.
  return {
    fov: 38,
    position: [0, 1.05, 6.4],
    lookAt: [0, 0.98, 0],
    modelScale: 0.68,
    modelY: -0.22,
  };
}

function CanvasStage({
  canvasW,
  canvasH,
  cam,
  mood,
  tone,
  thinking,
  highlighted,
  muted,
  hostRef,
  emotionColors,
}: {
  canvasW: number;
  canvasH: number;
  cam: CameraProfile;
  mood: EmotionPalette["mood"];
  tone: ToneId | null;
  thinking: boolean;
  highlighted: boolean;
  muted: boolean;
  hostRef: React.RefObject<HTMLDivElement | null>;
  emotionColors: EmotionColors;
}) {
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    for (const node of host.querySelectorAll("div")) {
      if (node.style.overflow === "hidden") {
        node.style.overflow = "visible";
      }
    }
  }, [hostRef]);

  return (
    <div ref={hostRef} style={{ width: canvasW, height: canvasH }}>
      <Canvas
        style={{ width: canvasW, height: canvasH, display: "block" }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: cam.fov, near: 0.1, far: 100, position: cam.position }}
        onCreated={({ camera }) => {
          camera.lookAt(...cam.lookAt);
        }}
      >
        <Suspense fallback={null}>
          <SceneLights highlighted={highlighted} muted={muted} emotionColors={emotionColors} />
          <RobotModel
            key={tone ?? "default"}
            mood={mood}
            tone={tone}
            thinking={thinking}
            highlighted={highlighted}
            muted={muted}
            emotionColors={emotionColors}
            scale={cam.modelScale}
            modelY={cam.modelY}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export function AvatarCanvas({
  mood = "zen",
  tone = null,
  thinking = false,
  size = 96,
  muted = false,
  highlighted = false,
  className = "",
  largeCanvas = false,
}: {
  mood?: EmotionPalette["mood"];
  tone?: ToneId | null;
  thinking?: boolean;
  size?: number;
  muted?: boolean;
  highlighted?: boolean;
  className?: string;
  /** Hero aside: full-body robot + large glow backdrop (canvas stays display-sized). */
  largeCanvas?: boolean;
}) {
  const toneStyle = getToneAvatarStyle(tone);
  const robotConfig = getToneRobotConfig(tone);
  const effectiveMood = toneStyle?.mood ?? mood;
  const toneLabel = tone ? `, ${tone} tone` : "";
  const motionClass = muted || robotConfig?.stationary ? "" : "animate-float-soft";
  const scopeRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const emotionColors = useScopedEmotionColors(scopeRef);

  const isCompact = !largeCanvas && size < 88;
  const canvasW = size;
  const canvasH = largeCanvas
    ? Math.round(size * 1.42)
    : isCompact
      ? Math.round(size * 1.72)
      : size;
  const displayW = size;
  const displayH = largeCanvas
    ? Math.round(size * 1.42)
    : isCompact
      ? Math.round(size * 0.38)
      : size;
  const glowPx = largeCanvas ? Math.round(size * 1.85) : canvasH;

  const cam = useMemo(
    () => cameraProfile(largeCanvas ? "hero" : isCompact ? "compact" : "default"),
    [largeCanvas, isCompact]
  );

  return (
    <div
      ref={scopeRef}
      className={`relative overflow-visible ${motionClass} ${muted ? "opacity-55 saturate-[0.65]" : ""} ${
        highlighted ? "drop-shadow-[0_0_14px_var(--emotion-b)]" : ""
      } transition-all duration-700 ${className}`}
      style={{ width: displayW, height: displayH }}
      role="img"
      aria-label={`Assistant avatar feeling ${effectiveMood}${toneLabel}`}
    >
      {/* Large emotion glow sits behind the robot (not scaled with canvas). */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 z-0 -translate-x-1/2 overflow-visible"
        style={{ width: glowPx, height: glowPx }}
        aria-hidden
      >
        <div
          className="absolute inset-[5%] rounded-full opacity-70 blur-2xl"
          style={{
            background:
              "radial-gradient(circle at 40% 35%, var(--emotion-a), transparent 62%), radial-gradient(circle at 65% 70%, var(--emotion-c), transparent 55%)",
          }}
        />
      </div>

      {/* WebGL canvas — display-sized, robot framed to fill it. */}
      <div
        className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 overflow-visible"
        style={{ width: canvasW, height: canvasH }}
      >
        <CanvasStage
          canvasW={canvasW}
          canvasH={canvasH}
          cam={cam}
          mood={mood}
          tone={tone}
          thinking={thinking}
          highlighted={highlighted}
          muted={muted}
          hostRef={canvasHostRef}
          emotionColors={emotionColors}
        />
        <ThinkingDots active={thinking} />
      </div>
    </div>
  );
}
