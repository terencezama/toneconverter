export const TONES = [
  { id: "professional", label: "Professional" },
  { id: "polite", label: "Polite" },
  { id: "friendly", label: "Friendly" },
  { id: "calm", label: "Calm" },
  { id: "formal", label: "Formal" },
  { id: "casual", label: "Casual" },
  { id: "confident", label: "Confident" },
  { id: "empathetic", label: "Empathetic" },
  { id: "shorter", label: "Shorter" },
  { id: "longer", label: "Longer" },
  { id: "clearer", label: "Clearer" },
] as const;

export type ToneId = (typeof TONES)[number]["id"];

export const LENGTHS = [
  { id: "normal", label: "Normal" },
  { id: "shorter", label: "Shorter" },
  { id: "longer", label: "Longer" },
] as const;

export type LengthId = (typeof LENGTHS)[number]["id"];

export const OUTCOMES = [
  {
    id: "de_escalate",
    label: "De-escalate",
    instruction:
      "Aim to de-escalate tension: lower the emotional heat while preserving the user's point and any needed urgency.",
  },
  {
    id: "get_reply",
    label: "Get a reply",
    instruction:
      "Aim to get a reply: make the request, question, or next step unmistakably clear and easy to answer.",
  },
  {
    id: "push_back",
    label: "Push back",
    instruction:
      "Aim to push back respectfully: disagree, correct, or set boundaries without sounding hostile or dismissive.",
  },
  {
    id: "say_no",
    label: "Say no",
    instruction:
      "Aim to decline clearly: say no without over-explaining, blaming, or sounding harsh.",
  },
  {
    id: "apologize",
    label: "Apologize",
    instruction:
      "Aim to apologize: take appropriate responsibility, acknowledge impact, and keep the message concise.",
  },
] as const;

export type OutcomeId = (typeof OUTCOMES)[number]["id"];

export const MAX_CHARS = 2000;

export function isToneId(value: unknown): value is ToneId {
  return typeof value === "string" && TONES.some((tone) => tone.id === value);
}

export function isLengthId(value: unknown): value is LengthId {
  return typeof value === "string" && LENGTHS.some((length) => length.id === value);
}

export function isOutcomeId(value: unknown): value is OutcomeId {
  return typeof value === "string" && OUTCOMES.some((outcome) => outcome.id === value);
}

export function labelForTone(tone: ToneId): string {
  return TONES.find((item) => item.id === tone)?.label ?? tone;
}

export function labelForOutcome(outcome: OutcomeId): string {
  return OUTCOMES.find((item) => item.id === outcome)?.label ?? outcome;
}

export function instructionForOutcome(outcome: OutcomeId | null | undefined): string {
  if (!outcome) return "";
  return OUTCOMES.find((item) => item.id === outcome)?.instruction ?? "";
}
