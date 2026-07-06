import { type LengthId, type OutcomeId, type ToneId } from "./tones";
import type { EmotionState } from "./emotion/types";

export type RewriteChangeParams = {
  original: string;
  result: string;
  tone: ToneId;
  length: LengthId;
  outcome?: OutcomeId | null;
  beforeEmotion: EmotionState;
  afterEmotion: EmotionState;
};

const OUTCOME_LABELS: Record<OutcomeId, string> = {
  de_escalate: "Softened the heat",
  get_reply: "Clarified the ask",
  push_back: "Set a respectful boundary",
  say_no: "Made the no clear",
  apologize: "Added accountable warmth",
};

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasUrgency(text: string): boolean {
  return /\b(urgent|asap|today|immediately|deadline|time-sensitive|soon)\b/i.test(text);
}

export function describeRewriteChanges({
  original,
  result,
  tone,
  length,
  outcome,
  beforeEmotion,
  afterEmotion,
}: RewriteChangeParams): string[] {
  const labels: string[] = [];
  const beforeWords = wordCount(original);
  const afterWords = wordCount(result);
  const intensityDropped = beforeEmotion.intensity > afterEmotion.intensity + 0.12;
  const messinessDropped = beforeEmotion.messiness > afterEmotion.messiness + 0.15;

  if (outcome) labels.push(OUTCOME_LABELS[outcome]);
  if (!outcome && (beforeEmotion.emotion === "angry" || beforeEmotion.emotion === "frustrated") && intensityDropped) {
    labels.push("Softened the heat");
  }
  if (messinessDropped || tone === "clearer") labels.push("Clarified the structure");
  if (length === "shorter" || tone === "shorter" || afterWords < beforeWords * 0.82) {
    labels.push("Made it more concise");
  }
  if (length === "longer" || tone === "longer" || afterWords > beforeWords * 1.25) {
    labels.push("Added useful context");
  }
  if (hasUrgency(original) && hasUrgency(result)) labels.push("Kept urgency");
  if (tone === "professional" || tone === "formal") labels.push("Made it business-ready");
  if (tone === "friendly" || tone === "empathetic") labels.push("Added warmth");
  if (tone === "confident") labels.push("Made the ask more confident");
  if (tone === "polite" || tone === "calm") labels.push("Made it easier to receive");

  const unique = Array.from(new Set(labels));
  return unique.length ? unique.slice(0, 4) : ["Preserved your meaning"];
}
