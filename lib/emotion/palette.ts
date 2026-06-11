import type { EmotionId, EmotionState } from "./types";

export type EmotionPalette = {
  /** Three gradient stops, hex */
  colors: [string, string, string];
  /** Base flow speed of the emotion field */
  speed: number;
  /** Base turbulence of the emotion field */
  turbulence: number;
  /** What the avatar should feel */
  mood: "zen" | "happy" | "excited" | "worried" | "sad" | "alarmed";
};

export const EMOTION_PALETTES: Record<EmotionId, EmotionPalette> = {
  neutral: {
    colors: ["#6366f1", "#8b5cf6", "#2dd4bf"],
    speed: 0.1,
    turbulence: 0.22,
    mood: "zen",
  },
  calm: {
    colors: ["#2dd4bf", "#38bdf8", "#818cf8"],
    speed: 0.1,
    turbulence: 0.2,
    mood: "zen",
  },
  happy: {
    colors: ["#fbbf24", "#fb7185", "#a78bfa"],
    speed: 0.28,
    turbulence: 0.4,
    mood: "happy",
  },
  excited: {
    colors: ["#f472b6", "#fb923c", "#facc15"],
    speed: 0.5,
    turbulence: 0.6,
    mood: "excited",
  },
  anxious: {
    colors: ["#a78bfa", "#64748b", "#7dd3fc"],
    speed: 0.42,
    turbulence: 0.75,
    mood: "worried",
  },
  sad: {
    colors: ["#475569", "#6366f1", "#0ea5e9"],
    speed: 0.08,
    turbulence: 0.25,
    mood: "sad",
  },
  frustrated: {
    colors: ["#f97316", "#ef4444", "#a855f7"],
    speed: 0.45,
    turbulence: 0.8,
    mood: "worried",
  },
  angry: {
    colors: ["#e85d6a", "#9b4fd4", "#f59e5e"],
    speed: 0.38,
    turbulence: 0.55,
    mood: "alarmed",
  },
};

export type VisualTarget = {
  colors: [string, string, string];
  speed: number;
  turbulence: number;
  glitch: number;
  mood: EmotionPalette["mood"];
};

/** Blend the emotion palette with intensity + messiness into shader-ready targets. */
export function visualTargetFor(state: EmotionState): VisualTarget {
  const palette = EMOTION_PALETTES[state.emotion];
  const boost = state.emotion === "neutral" ? 0 : state.intensity;
  // Glitch only when text is very messy — avoids a constantly jittering background.
  const glitch =
    state.messiness > 0.72 ? Math.min(1, (state.messiness - 0.72) * 2.5) : 0;

  return {
    colors: palette.colors,
    speed: palette.speed * (0.7 + boost * 0.6) + state.messiness * 0.06,
    turbulence: palette.turbulence * (0.55 + boost * 0.7) + state.messiness * 0.18,
    glitch,
    mood: palette.mood,
  };
}
