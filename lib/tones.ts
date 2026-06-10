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

export const MAX_CHARS = 2000;
