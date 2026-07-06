import type { EmotionState } from "@/lib/emotion/types";

export type MoodReading = {
  key: "empty" | "heated" | "tense" | "uneasy" | "calm" | "messy" | "neutral";
  label: string;
  color: string;
};

export const MOOD_DEFAULT_COLOR = "#b9b1a2";

/** Map the emotion engine's state to the mood dot, label, and page glow. */
export function moodReading(state: EmotionState, hasText: boolean): MoodReading {
  if (!hasText) {
    return { key: "empty", label: "Start typing. I'll read the room.", color: MOOD_DEFAULT_COLOR };
  }

  switch (state.emotion) {
    case "angry":
      return state.intensity >= 0.45
        ? { key: "heated", label: "Feels heated. Worth cooling down.", color: "#b15c3b" }
        : { key: "tense", label: "A little tense", color: "#c08a3e" };
    case "frustrated":
      return { key: "tense", label: "Sounds frustrated", color: "#c08a3e" };
    case "anxious":
      return { key: "uneasy", label: "Sounds a bit unsure", color: "#6e86a8" };
    case "sad":
      return { key: "uneasy", label: "Reads a little low", color: "#6e86a8" };
    case "excited":
    case "happy":
      return { key: "calm", label: "Reads warm and upbeat", color: "#3f6b52" };
    case "calm":
      return { key: "calm", label: "Reads calm and warm", color: "#3f6b52" };
    default:
      if (state.messiness > 0.5) {
        return { key: "messy", label: "A little tangled. Clearer would help.", color: "#c08a3e" };
      }
      return { key: "neutral", label: "Reads fairly neutral", color: "#6e675b" };
  }
}
