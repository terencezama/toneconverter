import type { EmotionState } from "./types";

const LABELS: Record<EmotionState["emotion"], string> = {
  neutral: "neutral",
  angry: "angry",
  frustrated: "frustrated",
  anxious: "anxious",
  sad: "sad",
  excited: "excited",
  happy: "happy",
  calm: "calm",
};

export function describeEmotionShift(before: EmotionState, after: EmotionState): string {
  const afterLabel = LABELS[after.emotion];
  const softened =
    before.intensity > after.intensity + 0.12 || before.messiness > after.messiness + 0.15;

  if (after.emotion === "neutral" && after.intensity < 0.2 && after.messiness < 0.35) {
    return softened ? "Much calmer now" : "Polished and ready";
  }
  if (before.emotion !== after.emotion) {
    return `Now feels ${afterLabel.toLowerCase()}`;
  }
  if (softened) {
    return `Softer — feels ${afterLabel.toLowerCase()}`;
  }
  return `Now feels ${afterLabel.toLowerCase()}`;
}
