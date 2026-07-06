import { NEUTRAL_STATE, type EmotionId, type EmotionState } from "./types";

/**
 * Zero-latency lexical emotion + messiness estimate.
 * Shared by the website and extension so the same text feels the same everywhere.
 */

const ANGER_WORDS = [
  "angry", "furious", "hate", "stupid", "idiot", "ridiculous", "unacceptable",
  "terrible", "awful", "worst", "pissed", "fed up", "sick of", "outrageous",
  "disgusting", "incompetent", "useless", "pathetic", "garbage", "trash",
  "damn", "hell", "wtf", "screw", "shut up", "never again", "demand",
  "immediately", "last time", "how dare",
];

const FRUSTRATION_WORDS = [
  "again", "still", "yet again", "every time", "always", "never works",
  "why is", "why does", "can't believe", "cannot believe", "seriously",
  "honestly", "frustrating", "frustrated", "annoying", "annoyed", "tired of",
  "waiting", "no response", "ignored", "third time", "second time",
];

const ANXIETY_WORDS = [
  "worried", "anxious", "nervous", "scared", "afraid", "urgent", "asap",
  "deadline", "running out", "not sure", "unsure", "what if", "concerned",
  "stress", "stressed", "panic", "hope this is ok", "sorry to bother",
  "apologies in advance", "i hope", "please please",
];

const SADNESS_WORDS = [
  "sad", "unhappy", "disappointed", "disappointing", "unfortunately", "regret",
  "sorry", "miss you", "heartbroken", "depressed", "let down", "hurt",
  "lonely", "give up", "hopeless", "crying",
];

const JOY_WORDS = [
  "thanks", "thank you", "great", "awesome", "amazing", "love", "wonderful",
  "fantastic", "excellent", "perfect", "brilliant", "happy", "glad",
  "excited", "can't wait", "congrats", "congratulations", "appreciate",
  "delighted", "yay", "woohoo",
];

const CALM_WORDS = [
  "no rush", "whenever", "take your time", "best regards", "kind regards",
  "sincerely", "looking forward", "please let me know", "at your convenience",
  "warm regards", "all the best",
];

function countHits(lower: string, words: string[]): number {
  let hits = 0;
  for (const w of words) {
    let idx = lower.indexOf(w);
    while (idx !== -1) {
      hits += 1;
      idx = lower.indexOf(w, idx + w.length);
    }
  }
  return hits;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function analyzeHeuristic(text: string): EmotionState {
  const trimmed = text.trim();
  if (trimmed.length < 2) return NEUTRAL_STATE;

  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = Math.max(words.length, 1);

  const letters = trimmed.replace(/[^a-zA-Z]/g, "");
  const upper = trimmed.replace(/[^A-Z]/g, "");
  const capsRatio = letters.length >= 12 ? upper.length / letters.length : 0;

  const exclamations = (trimmed.match(/!/g) ?? []).length;
  const exclamationDensity = exclamations / wordCount;
  const questionMarks = (trimmed.match(/\?{2,}/g) ?? []).length;
  const stretchedWords = (lower.match(/([a-z])\1{2,}/g) ?? []).length;
  const ellipses = (trimmed.match(/\.{3,}|…/g) ?? []).length;

  const angerScore =
    countHits(lower, ANGER_WORDS) * 1.6 +
    capsRatio * 6 +
    exclamationDensity * 8 +
    questionMarks * 0.8;
  const frustrationScore =
    countHits(lower, FRUSTRATION_WORDS) * 1.3 + questionMarks * 0.6 + ellipses * 0.4;
  const anxietyScore = countHits(lower, ANXIETY_WORDS) * 1.4 + ellipses * 0.3;
  const sadnessScore = countHits(lower, SADNESS_WORDS) * 1.5;
  const joyScore =
    countHits(lower, JOY_WORDS) * 1.4 +
    (capsRatio < 0.3 ? exclamationDensity * 3 : 0) +
    stretchedWords * 0.5;
  const calmScore = countHits(lower, CALM_WORDS) * 1.6;

  const scores: Array<[EmotionId, number]> = [
    ["angry", angerScore],
    ["frustrated", frustrationScore],
    ["anxious", anxietyScore],
    ["sad", sadnessScore],
    ["excited", joyScore > 2.5 ? joyScore : 0],
    ["happy", joyScore],
    ["calm", calmScore],
  ];

  if (angerScore > 2 && joyScore > 0) {
    scores[4][1] *= 0.3;
    scores[5][1] *= 0.3;
  }

  let best: [EmotionId, number] = ["neutral", 0.45];
  for (const entry of scores) {
    if (entry[1] > best[1]) best = entry;
  }

  const per100 = (best[1] / wordCount) * 100;
  const intensity =
    best[0] === "neutral" ? 0 : clamp01(0.2 + per100 / 10 + best[1] / 12);

  const sentences = trimmed.split(/[.!?\n]+/).filter((s) => s.trim().length > 0);
  const longestSentenceWords = sentences.reduce(
    (max, s) => Math.max(max, s.trim().split(/\s+/).length),
    0
  );
  const runOn = clamp01((longestSentenceWords - 28) / 40);
  const noTerminalPunctuation =
    wordCount > 25 && !/[.!?]/.test(trimmed) ? 0.5 : 0;
  const lowercaseStarts =
    sentences.length > 1
      ? sentences.filter((s) => /^[a-z]/.test(s.trim())).length / sentences.length
      : 0;
  const doubleSpaces = (trimmed.match(/ {2,}/g) ?? []).length;
  const messiness = clamp01(
    runOn +
      noTerminalPunctuation +
      lowercaseStarts * 0.45 +
      stretchedWords * 0.12 +
      doubleSpaces * 0.08 +
      capsRatio * 0.5
  );

  return { emotion: best[0], intensity, messiness };
}
