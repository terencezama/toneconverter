import type { CSSProperties } from "react";
import { emotionColorsForState } from "../../../shared/emotion/color";
import type { EmotionState } from "./types";

/** Scoped CSS variables so multiple avatars can show different emotions at once. */
export function emotionStyleVars(state: EmotionState): CSSProperties {
  const [a, b, c] = emotionColorsForState(state);
  return {
    "--emotion-a": a,
    "--emotion-b": b,
    "--emotion-c": c,
  } as CSSProperties;
}
