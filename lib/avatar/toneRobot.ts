import type { ToneId } from "@/lib/tones";

export type RobotAccessory = "suit" | "streetwear" | "glasses" | null;
export type RobotPose = "nod" | "meditate" | null;
export type RobotStretch = "longer" | "shorter" | null;

export type ToneRobotConfig = {
  /** Looping animation while this tone is active. */
  idle: string;
  /** One-shot played when tone is first applied. */
  emote?: string;
  /** Keep the emote on its last frame instead of returning to idle. */
  holdEmote?: boolean;
  accessory?: RobotAccessory;
  pose?: RobotPose;
  stretch?: RobotStretch;
  /** Special scene effect (e.g. empathetic heart). */
  effect?: "heartPulse" | null;
  /** Disable idle body bobbing for static symbolic poses. */
  stationary?: boolean;
  /** Per-tone animation speed multiplier. */
  animationSpeed?: number;
};

/** 3D robot behaviour per conversion tone. */
export const TONE_ROBOT: Record<ToneId, ToneRobotConfig> = {
  professional: { idle: "Standing", accessory: "suit", stationary: true, animationSpeed: 0.45 },
  formal: { idle: "Standing", accessory: "suit", pose: "nod", stationary: true, animationSpeed: 0.6 },
  polite: { idle: "Standing", emote: "Wave", pose: "nod" },
  friendly: { idle: "WaveLoop" },
  calm: { idle: "Meditate", emote: "SitToMeditate", pose: "meditate", stationary: true },
  casual: { idle: "Walking", accessory: "streetwear", animationSpeed: 0.85 },
  confident: { idle: "ThumbsUpLoop" },
  empathetic: { idle: "Idle", pose: "nod", effect: "heartPulse" },
  shorter: { idle: "Standing", stretch: "shorter" },
  longer: { idle: "Standing", stretch: "longer" },
  clearer: { idle: "Idle", accessory: "glasses" },
};

export function getToneRobotConfig(tone: ToneId | null | undefined): ToneRobotConfig | null {
  if (!tone) return null;
  return TONE_ROBOT[tone] ?? null;
}
