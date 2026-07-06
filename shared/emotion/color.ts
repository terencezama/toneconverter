import { EMOTION_PALETTES } from "./palette";
import type { EmotionState } from "./types";

export function mixHex(a: string, b: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const lerp = (x: number, y: number) => Math.round(x + (y - x) * t);
  const r = lerp(ar, br);
  const g = lerp(ag, bg);
  const bl = lerp(ab, bb);
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

const NEUTRAL_COLORS = EMOTION_PALETTES.neutral.colors;

export function emotionColorsForState(state: EmotionState): [string, string, string] {
  const palette = EMOTION_PALETTES[state.emotion].colors;
  const t = Math.min(1, state.intensity * 1.15 + state.messiness * 0.25);
  return [
    mixHex(NEUTRAL_COLORS[0], palette[0], t),
    mixHex(NEUTRAL_COLORS[1], palette[1], t),
    mixHex(NEUTRAL_COLORS[2], palette[2], t),
  ];
}
