import type { EmotionPalette } from "@/lib/emotion/palette";
import type { ToneId } from "@/lib/tones";

export type AvatarMood = EmotionPalette["mood"];
export type ToneAccessory = "suit" | "glasses" | "heart" | "wave" | null;
export type TonePose = "confident" | "bow" | "tilt" | null;

export type ToneAvatarStyle = {
  mood?: AvatarMood;
  mouth?: string;
  eyeRy?: number;
  eyeRx?: number;
  accessory: ToneAccessory;
  pose: TonePose;
};

const STYLES: Record<ToneId, ToneAvatarStyle> = {
  professional: {
    mood: "zen",
    mouth: "M44 80 Q60 86 76 80",
    accessory: "suit",
    pose: null,
  },
  formal: {
    mood: "zen",
    mouth: "M46 81 Q60 85 74 81",
    accessory: "suit",
    pose: "bow",
  },
  polite: {
    mood: "happy",
    mouth: "M42 78 Q60 90 78 78",
    accessory: null,
    pose: "bow",
  },
  friendly: {
    mood: "happy",
    mouth: "M38 76 Q60 98 82 76",
    accessory: "wave",
    pose: "tilt",
  },
  calm: {
    mood: "zen",
    mouth: "M44 80 Q60 84 76 80",
    eyeRy: 7,
    accessory: null,
    pose: null,
  },
  casual: {
    mood: "happy",
    mouth: "M40 77 Q60 94 80 77",
    accessory: null,
    pose: "tilt",
  },
  confident: {
    mood: "happy",
    mouth: "M42 79 Q68 82 78 76",
    eyeRy: 8,
    eyeRx: 7,
    accessory: null,
    pose: "confident",
  },
  empathetic: {
    mood: "worried",
    mouth: "M44 80 Q60 86 76 80",
    eyeRy: 8,
    accessory: "heart",
    pose: null,
  },
  shorter: {
    mood: "zen",
    accessory: null,
    pose: null,
  },
  longer: {
    mood: "zen",
    accessory: "glasses",
    pose: null,
  },
  clearer: {
    mood: "zen",
    accessory: "glasses",
    pose: null,
  },
};

export function getToneAvatarStyle(tone: ToneId | null | undefined): ToneAvatarStyle | null {
  if (!tone) return null;
  return STYLES[tone] ?? null;
}
