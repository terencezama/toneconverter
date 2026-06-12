import type { AvatarMood } from "@/lib/avatar/toneStyle";
import type { ToneId } from "@/lib/tones";
import { getToneRobotConfig } from "./toneRobot";

/** RobotExpressive.glb morph targets on the avatar face mesh. */
export type MorphExpression = {
  Angry: number;
  Surprised: number;
  Sad: number;
};

export const NEUTRAL_EXPRESSION: MorphExpression = {
  Angry: 0,
  Surprised: 0,
  Sad: 0,
};

/** Base facial expression per avatar mood. */
export const MOOD_EXPRESSIONS: Record<AvatarMood, MorphExpression> = {
  zen: NEUTRAL_EXPRESSION,
  happy: { Angry: 0, Surprised: 0.42, Sad: 0 },
  excited: { Angry: 0, Surprised: 0.88, Sad: 0 },
  worried: { Angry: 0.12, Surprised: 0.28, Sad: 0.58 },
  sad: { Angry: 0, Surprised: 0, Sad: 0.82 },
  alarmed: { Angry: 0.92, Surprised: 0.48, Sad: 0.05 },
};

/** Looping body animation per mood (matches three.js skinning example). */
export const MOOD_ANIMATIONS: Record<AvatarMood, string> = {
  zen: "Idle",
  happy: "Walking",
  excited: "Running",
  worried: "Idle",
  sad: "Sitting",
  alarmed: "Idle",
};

export function resolveExpression(
  mood: AvatarMood,
  toneMood?: AvatarMood
): MorphExpression {
  const base = MOOD_EXPRESSIONS[mood];
  if (!toneMood || toneMood === mood) return base;

  const toneExpr = MOOD_EXPRESSIONS[toneMood];
  return {
    Angry: Math.max(base.Angry, toneExpr.Angry * 0.45),
    Surprised: Math.max(base.Surprised, toneExpr.Surprised * 0.45),
    Sad: Math.max(base.Sad, toneExpr.Sad * 0.45),
  };
}

export function resolveBaseAnimation(
  mood: AvatarMood,
  thinking: boolean,
  tone: ToneId | null = null
): string {
  const robot = getToneRobotConfig(tone);
  if (robot) return robot.idle;
  if (thinking) return "Idle";
  return MOOD_ANIMATIONS[mood];
}
