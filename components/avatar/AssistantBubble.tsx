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

export function AssistantBubble({
  anchored = false,
  /** When set (e.g. after convert), in-box SVG reflects original draft emotion. */
  emotionOverride = null,
}: {
  anchored?: boolean;
  emotionOverride?: EmotionState | null;
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

  const displayState = emotionOverride ?? state;
  const currentMood = EMOTION_PALETTES[displayState.emotion].mood;
  const llmReady = Boolean(analysis && (analysis.summary || analysis.suggestion));
  const showBubble =
    !assistantHidden && (Boolean(quickRead) || analyzing || llmReady);

  const summary =
    analysis?.summary || quickRead?.summary || (analyzing ? "Reading the room…" : "");
  const suggestion = analysis?.suggestion ?? quickRead?.suggestion ?? null;

  const detectedLabel = detectedTones
    .slice(0, 2)
    .map((t) => TONE_LABELS[t])
    .join(", ");

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

      <div
        className="pointer-events-auto"
        style={emotionStyleVars(displayState)}
      >
        <Avatar
          mood={currentMood}
          forceSvg
          thinking={(analyzing && !llmReady) || converting}
          size={avatarSize}
        />
      </div>
    </div>
  );
}
