"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { AvatarMood } from "@/lib/avatar/toneStyle";
import type { EmotionPalette } from "@/lib/emotion/palette";
import type { ToneId } from "@/lib/tones";
import { AvatarSvg } from "./AvatarSvg";

export type { AvatarMood };

const AvatarCanvas = dynamic(
  () => import("./AvatarCanvas").then((m) => m.AvatarCanvas),
  { ssr: false, loading: () => null }
);

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function detectWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

export function Avatar({
  mood = "zen",
  tone = null,
  thinking = false,
  size = 96,
  muted = false,
  highlighted = false,
  className = "",
  forceSvg = false,
  largeCanvas = false,
}: {
  mood?: EmotionPalette["mood"];
  /** Selected or detected writing tone — drives emote animations and expression blend. */
  tone?: ToneId | null;
  thinking?: boolean;
  size?: number;
  muted?: boolean;
  highlighted?: boolean;
  className?: string;
  /** Skip WebGL and render the SVG fallback. */
  forceSvg?: boolean;
  /** Bigger internal canvas scaled down — avoids cropping the 3D robot. */
  largeCanvas?: boolean;
}) {
  const [renderMode, setRenderMode] = useState<"pending" | "svg" | "webgl">("pending");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const svg =
        forceSvg ||
        size < 56 ||
        prefersReducedMotion() ||
        !detectWebGL();
      setRenderMode(svg ? "svg" : "webgl");
    });
    return () => cancelAnimationFrame(frame);
  }, [forceSvg, size]);

  const shared = {
    mood,
    tone,
    thinking,
    size,
    muted,
    highlighted,
    className,
    largeCanvas,
  };

  if (renderMode !== "webgl") {
    return <AvatarSvg {...shared} />;
  }

  return <AvatarCanvas {...shared} />;
}
