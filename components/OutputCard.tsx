"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { describeEmotionShift } from "@/lib/emotion/emotionUi";
import type { EmotionState } from "@/lib/emotion/types";
import type { LengthId, OutcomeId, ToneId } from "@/lib/tones";
import { describeRewriteChanges } from "../../shared/rewriteChanges";
import { PanelAvatar } from "./avatar/ConverterRobotAside";

export function OutputCard({
  original,
  result,
  tone,
  length,
  outcome,
  loading,
  beforeEmotion,
  afterEmotion,
  onRegenerate,
}: {
  original: string;
  result: string;
  tone: ToneId;
  length: LengthId;
  outcome: OutcomeId | null;
  loading: boolean;
  beforeEmotion: EmotionState;
  afterEmotion: EmotionState | null;
  onRegenerate: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const afterState = afterEmotion ?? beforeEmotion;
  const shiftLabel = describeEmotionShift(beforeEmotion, afterState);
  const changeLabels = describeRewriteChanges({
    original,
    result,
    tone,
    length,
    outcome,
    beforeEmotion,
    afterEmotion: afterState,
  });

  useEffect(() => {
    if (!cardRef.current) return;
    cardRef.current.animate(
      [
        { opacity: 0, transform: "translateY(12px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 480, easing: "ease-out", fill: "forwards" }
    );
  }, [result]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      trackEvent("copy", { tone });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context); ignore.
    }
  }

  return (
    <div
      ref={cardRef}
      className="glass mt-6 rounded-3xl p-4 shadow-2xl shadow-black/30 transition-shadow duration-700 sm:p-6"
      style={{
        boxShadow: `0 25px 50px -12px rgba(0,0,0,0.35), 0 0 40px -10px var(--emotion-b)`,
      }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-gradient-live text-sm font-semibold uppercase tracking-wide">
            Rewritten message
          </h3>
          <span
            className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300 transition-colors duration-700"
            style={{
              borderColor: "color-mix(in srgb, var(--emotion-c) 40%, transparent)",
              color: "color-mix(in srgb, var(--emotion-c) 85%, white)",
            }}
          >
            {shiftLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowBefore((v) => !v)}
          className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
        >
          {showBefore ? "Hide original" : "Compare with original"}
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {changeLabels.map((label) => (
          <span
            key={label}
            className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-zinc-300"
          >
            {label}
          </span>
        ))}
      </div>

      {showBefore && (
        <div className="mb-3 flex gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Before
            </p>
            <p className="whitespace-pre-wrap text-sm text-zinc-400">{original}</p>
          </div>
          <PanelAvatar emotion={beforeEmotion} muted />
        </div>
      )}

      <div className="flex gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="min-w-0 flex-1">
          {showBefore && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              After
            </p>
          )}
          <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-50">
            {result}
          </p>
        </div>
        <PanelAvatar
          emotion={afterState}
          tone={tone}
          thinking={loading}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copy}
          className="btn-gradient rounded-xl px-4 py-2 text-sm font-semibold"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={loading}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Regenerating..." : "Regenerate"}
        </button>
      </div>
    </div>
  );
}
