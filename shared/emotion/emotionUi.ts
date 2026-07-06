import { EMOTION_LABELS } from "./palette";
import type { EmotionState } from "./types";

/** User-facing line after a rewrite - highlights the new emotional read. */
export function describeEmotionShift(before: EmotionState, after: EmotionState): string {
  const afterLabel = EMOTION_LABELS[after.emotion];
  const softened =
    before.intensity > after.intensity + 0.12 || before.messiness > after.messiness + 0.15;

  if (after.emotion === "neutral" && after.intensity < 0.2 && after.messiness < 0.35) {
    return softened ? "Much calmer now" : "Polished and ready";
  }
  if (before.emotion !== after.emotion) {
    return `Now feels ${afterLabel}`;
  }
  if (softened) {
    return `Softer - feels ${afterLabel}`;
  }
  return `Now feels ${afterLabel}`;
}
