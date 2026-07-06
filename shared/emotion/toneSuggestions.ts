import { labelForTone, type ToneId } from "../tones";
import type { EmotionId, EmotionState } from "./types";

/** Tones that pair well when an emotion is detected - angry maps to professional, etc. */
export const EMOTION_TONE_LINKS: Record<EmotionId, ToneId[]> = {
  neutral: ["clearer", "polite"],
  angry: ["professional", "calm", "polite"],
  frustrated: ["professional", "clearer", "polite"],
  anxious: ["confident", "calm", "empathetic"],
  sad: ["empathetic", "polite", "friendly"],
  excited: ["friendly", "casual", "shorter"],
  happy: ["friendly", "casual"],
  calm: ["calm", "professional", "polite"],
};

export function suggestionForEmotion(
  state: EmotionState
): { label: string; tone: ToneId } | null {
  if (state.emotion === "angry" || state.emotion === "frustrated") {
    return { label: "Make it professional", tone: "professional" };
  }
  if (state.messiness > 0.5) return { label: "Make it clearer", tone: "clearer" };
  if (state.emotion === "anxious") return { label: "Make it confident", tone: "confident" };
  if (state.emotion === "sad") return { label: "Sound warmer", tone: "empathetic" };
  if (state.emotion === "excited" || state.emotion === "happy") {
    return { label: "Keep it friendly", tone: "friendly" };
  }
  if (state.intensity > 0.45) return { label: "Polish it", tone: "polite" };
  return null;
}

export function linkedToneLabels(emotion: EmotionId): string[] {
  return EMOTION_TONE_LINKS[emotion].map(labelForTone);
}

export function alternateTonesForEmotion(
  state: EmotionState,
  primaryTone?: string | null,
  limit = 2
): ToneId[] {
  return EMOTION_TONE_LINKS[state.emotion]
    .filter((tone) => tone !== primaryTone)
    .slice(0, limit);
}
