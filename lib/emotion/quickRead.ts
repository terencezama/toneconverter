import { linkedToneLabels, suggestionForEmotion } from "./toneSuggestions";
import type { EmotionId, EmotionState } from "./types";

const EMOTION_PHRASES: Record<EmotionId, string[]> = {
  neutral: [],
  angry: ["This reads angry — your reader will feel the heat.", "Strong frustration coming through."],
  frustrated: ["Sounds frustrated — might land harder than you mean.", "I can feel the irritation in this."],
  anxious: ["This sounds anxious — a calmer version might help.", "There's worry under these words."],
  sad: ["This feels heavy — want a gentler tone?", "Sadness is coming through clearly."],
  excited: ["Lots of energy here!", "This sounds excited and upbeat."],
  happy: ["Warm and positive — nice tone.", "This reads friendly and upbeat."],
  calm: ["Steady and calm — reads well.", "Measured tone, easy to receive."],
};

/** Zero-latency "reading the room" from the heuristic — no API wait. */
export function quickRead(state: EmotionState): {
  summary: string;
  suggestion: { label: string; tone: string } | null;
} | null {
  if (state.emotion === "neutral" && state.messiness < 0.45) return null;
  if (state.intensity < 0.18 && state.messiness < 0.45) return null;

  const phrases = EMOTION_PHRASES[state.emotion];
  let summary =
    state.messiness > 0.55 && state.emotion === "neutral"
      ? "This reads a bit messy — structure could help."
      : phrases[Math.min(phrases.length - 1, Math.floor(state.intensity * phrases.length))] ||
        `Feels ${state.emotion}.`;

  if (state.emotion === "angry" || state.emotion === "frustrated") {
    const links = linkedToneLabels(state.emotion).slice(0, 2).join(" or ");
    summary = `${summary} Try ${links}.`;
  }

  return { summary, suggestion: suggestionForEmotion(state) };
}
