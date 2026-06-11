"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const EmotionField = dynamic(() => import("./EmotionField"), { ssr: false });

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Mounts the three.js emotion field when WebGL is available,
 * otherwise falls back to the pure-CSS aurora gradient.
 */
export function EmotionFieldLoader() {
  const [mode, setMode] = useState<"pending" | "webgl" | "css">("pending");

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      setMode(!reducedMotion && supportsWebGL() ? "webgl" : "css");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (mode === "webgl") return <EmotionField />;
  return <div className="aurora-fallback fixed inset-0 -z-10" aria-hidden />;
}
