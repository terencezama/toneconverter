"use client";

import { animate } from "animejs";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { emotionStyleVars } from "@/lib/emotion/emotionVars";
import { EMOTION_PALETTES } from "@/lib/emotion/palette";
import type { EmotionState } from "@/lib/emotion/types";
import { TONES, type ToneId } from "@/lib/tones";
import { useEmotion } from "../emotion/EmotionProvider";
import { Avatar } from "./Avatar";

const TONE_LABELS = Object.fromEntries(TONES.map((t) => [t.id, t.label])) as Record<
  ToneId,
  string
>;

const EMOTION_LABELS: Record<EmotionState["emotion"], string> = {
  neutral: "neutral",
  angry: "angry",
  frustrated: "frustrated",
  anxious: "anxious",
  sad: "sad",
  excited: "excited",
  happy: "happy",
  calm: "calm",
};

export function AssistantBubble({
  anchored = false,
  beforeEmotion = null,
  afterEmotion = null,
  showCompare = false,
  selectedTone = null,
}: {
  anchored?: boolean;
  /** Emotion read before the last conversion */
  beforeEmotion?: EmotionState | null;
  /** Emotion read of the rewritten result */
  afterEmotion?: EmotionState | null;
  /** Show side-by-side before → after avatars */
  showCompare?: boolean;
  /** User-selected conversion tone — drives avatar costume/pose */
  selectedTone?: ToneId | null;
}) {
  const {
    state,
    quickRead,
    analysis,
    analyzing,
    converting,
    detectedTones,
    assistantHidden,
    applyTone,
    dismissAnalysis,
  } = useEmotion();
  const bubbleRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);

  const currentMood = EMOTION_PALETTES[state.emotion].mood;
  const llmReady = Boolean(analysis && (analysis.summary || analysis.suggestion));
  const showBubble =
    !assistantHidden && (Boolean(quickRead) || analyzing || llmReady);

  const summary =
    analysis?.summary || quickRead?.summary || (analyzing ? "Reading the room…" : "");
  const suggestion = analysis?.suggestion ?? quickRead?.suggestion ?? null;

  const compareActive = showCompare && Boolean(beforeEmotion);
  const beforeMood = beforeEmotion
    ? EMOTION_PALETTES[beforeEmotion.emotion].mood
    : currentMood;
  const afterMood = afterEmotion
    ? EMOTION_PALETTES[afterEmotion.emotion].mood
    : currentMood;

  useEffect(() => {
    if (showBubble && bubbleRef.current) {
      animate(bubbleRef.current, {
        opacity: [0, 1],
        translateY: [10, 0],
        scale: [0.95, 1],
        duration: 220,
        ease: "outQuad",
      });
    }
  }, [showBubble, summary, analyzing]);

  useEffect(() => {
    if (compareActive && compareRef.current) {
      animate(compareRef.current, {
        opacity: [0, 1],
        scale: [0.92, 1],
        duration: 480,
        ease: "outQuad",
      });
    }
  }, [compareActive, beforeEmotion?.emotion, afterEmotion?.emotion]);

  function handleSuggestion(tone: string) {
    const applied = applyTone(tone);
    dismissAnalysis();
    if (applied) {
      document
        .getElementById("converter")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const positionClass = anchored
    ? "absolute bottom-2.5 right-2.5 z-10"
    : "fixed bottom-5 right-5 z-50 sm:bottom-7 sm:right-7";

  const avatarSize = anchored ? 68 : 84;
  const beforeSize = anchored ? 46 : 56;
  const showToneStyle = showCompare && (Boolean(afterEmotion) || converting);
  const avatarTone = showToneStyle ? selectedTone : null;
  const detectedLabel = detectedTones
    .slice(0, 2)
    .map((t) => TONE_LABELS[t])
    .join(", ");

  return (
    <div
      className={`pointer-events-none flex flex-col items-end gap-2 ${positionClass}`}
      aria-label="Writing assistant"
    >
      {showBubble && (
        <div
          ref={bubbleRef}
          className="glass-strong pointer-events-auto relative max-w-[270px] rounded-2xl rounded-br-md p-4 shadow-2xl shadow-black/40"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dismissAnalysis();
            }}
            aria-label="Dismiss assistant suggestion"
            className="absolute right-1.5 top-1.5 z-10 rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
          </button>

          {summary && (
            <p className="pr-4 text-sm leading-snug text-zinc-100">
              {summary}
              {analyzing && !llmReady && (
                <span className="ml-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 align-middle" />
              )}
            </p>
          )}

          {detectedLabel && !analyzing && (
            <p className="mt-1.5 text-[11px] text-zinc-400">
              Reads as: <span className="text-zinc-300">{detectedLabel}</span>
            </p>
          )}

          {suggestion && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSuggestion(suggestion.tone)}
                className="btn-gradient rounded-lg px-3 py-1.5 text-xs font-semibold"
              >
                {suggestion.label}
              </button>
              <Link
                href="/originality-checker"
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:bg-white/10"
              >
                Check originality
              </Link>
            </div>
          )}
        </div>
      )}

      <div ref={compareRef} className="pointer-events-auto">
        {compareActive && beforeEmotion ? (
          <div className="flex items-end gap-1.5 sm:gap-2">
            <div
              className="flex flex-col items-center gap-0.5"
              style={emotionStyleVars(beforeEmotion)}
            >
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                Was
              </span>
              <Avatar mood={beforeMood} tone={null} size={beforeSize} muted />
              <span className="max-w-[52px] truncate text-center text-[9px] text-zinc-500">
                {EMOTION_LABELS[beforeEmotion.emotion]}
              </span>
            </div>

            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-6 shrink-0 text-zinc-500"
              aria-hidden
            >
              <path
                d="M5 12h12M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div
              className="flex flex-col items-center gap-0.5"
              style={emotionStyleVars(afterEmotion ?? state)}
            >
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">
                Now
              </span>
              <Avatar
                mood={converting && !afterEmotion ? "zen" : afterMood}
                tone={avatarTone}
                size={avatarSize}
                highlighted
                thinking={converting && !afterEmotion}
              />
              <span
                className="max-w-[68px] truncate text-center text-[9px] font-medium"
                style={{ color: "color-mix(in srgb, var(--emotion-c) 80%, white)" }}
              >
                {converting && !afterEmotion
                  ? "…"
                  : avatarTone
                    ? TONE_LABELS[avatarTone]
                    : EMOTION_LABELS[(afterEmotion ?? state).emotion]}
              </span>
            </div>
          </div>
        ) : (
          <Avatar
            mood={currentMood}
            tone={avatarTone}
            thinking={(analyzing && !llmReady) || converting}
            size={avatarSize}
          />
        )}
      </div>
    </div>
  );
}
