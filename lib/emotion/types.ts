import type { ToneId } from "@/lib/tones";

export const EMOTIONS = [
  "neutral",
  "angry",
  "frustrated",
  "anxious",
  "sad",
  "excited",
  "happy",
  "calm",
] as const;

export type EmotionId = (typeof EMOTIONS)[number];

export type EmotionState = {
  emotion: EmotionId;
  /** 0..1 — how strongly the emotion comes through */
  intensity: number;
  /** 0..1 — how messy / chaotic the writing is */
  messiness: number;
};

export type EmotionAnalysis = EmotionState & {
  /** Short human-readable read of the text, e.g. "This sounds pretty frustrated." */
  summary: string;
  /** Proposed action, e.g. { label: "Make it professional", tone: "professional" } */
  suggestion: { label: string; tone: string } | null;
  /** Writing tones detected in the text (professional, friendly, etc.) */
  detectedTones: ToneId[];
  /** Dominant detected tone, if any */
  primaryTone: ToneId | null;
};

export const NEUTRAL_STATE: EmotionState = {
  emotion: "neutral",
  intensity: 0,
  messiness: 0,
};

export function isEmotionId(value: unknown): value is EmotionId {
  return typeof value === "string" && (EMOTIONS as readonly string[]).includes(value);
}
