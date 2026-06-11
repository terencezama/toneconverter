import { TONES, type ToneId } from "@/lib/tones";
import type { EmotionState } from "./types";

const VALID = new Set<string>(TONES.map((t) => t.id));

const TONE_SIGNALS: Record<ToneId, string[]> = {
  professional: [
    "dear", "regarding", "as discussed", "per our", "please find", "best regards",
    "respectfully", "kindly advise", "i would like to", "please advise", "at your earliest",
    "following up", "as per", "moving forward",
  ],
  polite: [
    "please", "thank you", "thanks", "would you mind", "if possible", "appreciate",
    "grateful", "kindly", "sorry", "pardon", "may i", "could you",
  ],
  friendly: [
    "hey", "hi there", "hope you're", "catch up", "cheers", "great to hear",
    "lovely", "awesome", "sounds good", "talk soon", "have a great",
  ],
  calm: [
    "no rush", "take your time", "whenever", "no worries", "at your convenience",
    "steady", "peacefully", "ease", "gentle", "relaxed",
  ],
  formal: [
    "hereby", "pursuant", "notwithstanding", "henceforth", "therefore", "whereas",
    "shall", "herein", "aforementioned", "pursuant to", "in accordance",
  ],
  casual: [
    "yeah", "nah", "gonna", "wanna", "btw", "lol", "kinda", "stuff", "cool",
    "ok so", "pretty much", "hang out", "no biggie",
  ],
  confident: [
    "i will", "we will", "certainly", "absolutely", "without doubt", "i recommend",
    "guarantee", "assure you", "confident", "decisively", "clearly state",
    "i am certain", "no question",
  ],
  empathetic: [
    "i understand", "i hear you", "that must be", "i'm sorry you're", "here for you",
    "i know this is hard", "feel for you", "i can imagine", "sounds difficult",
    "you're not alone",
  ],
  shorter: [],
  longer: [],
  clearer: [],
};

export type ToneDetection = {
  tones: ToneId[];
  primary: ToneId | null;
  scores: Partial<Record<ToneId, number>>;
};

export function detectTones(text: string, state?: Pick<EmotionState, "messiness">): ToneDetection {
  const trimmed = text.trim();
  const scores: Partial<Record<ToneId, number>> = {};

  if (trimmed.length < 4) {
    return { tones: [], primary: null, scores };
  }

  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = Math.max(words.length, 1);
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);

  for (const [tone, signals] of Object.entries(TONE_SIGNALS) as [ToneId, string[]][]) {
    if (!signals.length) continue;
    let hits = 0;
    for (const phrase of signals) {
      if (lower.includes(phrase)) hits += phrase.includes(" ") ? 2 : 1;
    }
    if (hits > 0) scores[tone] = hits;
  }

  if (avgWordsPerSentence > 22 || wordCount > 180) scores.longer = (scores.longer ?? 0) + 2;
  if (avgWordsPerSentence < 9 && wordCount > 20) scores.shorter = (scores.shorter ?? 0) + 2;
  if ((state?.messiness ?? 0) < 0.35 && avgWordsPerSentence >= 10 && avgWordsPerSentence <= 20) {
    scores.clearer = (scores.clearer ?? 0) + 1;
  }
  if ((state?.messiness ?? 0) > 0.55) scores.clearer = (scores.clearer ?? 0) + 2;

  const ranked = (Object.entries(scores) as [ToneId, number][])
    .filter(([id]) => VALID.has(id))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const tones = ranked.map(([id]) => id);
  const primary = tones[0] ?? null;

  return { tones, primary, scores };
}

export function isToneId(value: unknown): value is ToneId {
  return typeof value === "string" && VALID.has(value);
}

export function parseToneList(value: unknown): ToneId[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isToneId).slice(0, 4);
}
