import type { ToneId } from "@/lib/tones";

export type RobotAccessory = "suit" | "streetwear" | "glasses" | null;
export type RobotPose = "bow" | "bowRelease" | "meditate" | "peace" | "thumbsUp" | null;
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
};

/** 3D robot behaviour per conversion tone. */
export const TONE_ROBOT: Record<ToneId, ToneRobotConfig> = {
  professional: { idle: "Standing", accessory: "suit" },
  formal: { idle: "Walking", accessory: "suit" },
  polite: { idle: "Standing", pose: "bowRelease" },
  friendly: { idle: "Idle", pose: "peace" },
  calm: { idle: "Meditate", emote: "SitToMeditate", pose: "meditate", stationary: true },
  casual: { idle: "Walking", accessory: "streetwear" },
  confident: { idle: "Standing", pose: "thumbsUp", stationary: true },
  empathetic: { idle: "Idle", effect: "heartPulse" },
  shorter: { idle: "Standing", stretch: "shorter" },
  longer: { idle: "Standing", stretch: "longer" },
  clearer: { idle: "Idle", accessory: "glasses" },
};

export function getToneRobotConfig(tone: ToneId | null | undefined): ToneRobotConfig | null {
  if (!tone) return null;
  return TONE_ROBOT[tone] ?? null;
}
