"use client";

import { animate } from "animejs";
import { useEffect, useRef, useState } from "react";
import { useEmotion } from "./emotion/EmotionProvider";

type Passage = {
  text: string;
  type: "ai-pattern" | "boilerplate" | "original";
  reason: string;
};

type Result = {
  aiLikelihood: number;
  originality: number;
  verdict: string;
  summary: string;
  passages: Passage[];
};

const MAX_CHARS = 6000;

const PASSAGE_STYLES: Record<Passage["type"], { label: string; className: string }> = {
  "ai-pattern": {
    label: "AI pattern",
    className: "border-rose-400/30 bg-rose-500/10 text-rose-200",
  },
  boilerplate: {
    label: "Boilerplate",
    className: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  },
  original: {
    label: "Original",
    className: "border-teal-400/30 bg-teal-500/10 text-teal-200",
  },
};

function Gauge({
  value,
  label,
  invert = false,
}: {
  value: number;
  label: string;
  /** invert=true: high value is bad (AI likelihood) */
  invert?: boolean;
}) {
  const arcRef = useRef<SVGPathElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  // Semi-circle arc, r=54 -> length = PI * r
  const ARC_LENGTH = Math.PI * 54;

  const good = invert ? value <= 40 : value >= 60;
  const bad = invert ? value >= 70 : value <= 30;
  const color = bad ? "#fb7185" : good ? "#2dd4bf" : "#fbbf24";

  useEffect(() => {
    if (arcRef.current) {
      animate(arcRef.current, {
        strokeDashoffset: [ARC_LENGTH, ARC_LENGTH * (1 - value / 100)],
        duration: 1400,
        ease: "outExpo",
      });
    }
    if (numberRef.current) {
      const counter = { n: 0 };
      animate(counter, {
        n: value,
        duration: 1400,
        ease: "outExpo",
        onUpdate: () => {
          if (numberRef.current) {
            numberRef.current.textContent = String(Math.round(counter.n));
          }
        },
      });
    }
  }, [value, ARC_LENGTH]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[84px] w-[140px]">
        <svg width="140" height="84" viewBox="0 0 140 84">
          <path
            d="M 16 76 A 54 54 0 0 1 124 76"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            ref={arcRef}
            d="M 16 76 A 54 54 0 0 1 124 76"
            fill="none"
            stroke={color}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={ARC_LENGTH}
            strokeDashoffset={ARC_LENGTH}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <span ref={numberRef} className="text-3xl font-extrabold text-white">
            0
          </span>
          <span className="text-base font-semibold text-zinc-400">%</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-zinc-300">{label}</p>
    </div>
  );
}

export function OriginalityChecker({
  embedded = false,
  text: controlledText,
  onTextChange,
}: {
  /** Render inside ToneConverter tab — no duplicate card wrapper. */
  embedded?: boolean;
  text?: string;
  onTextChange?: (value: string) => void;
} = {}) {
  const [internalText, setInternalText] = useState("");
  const text = controlledText ?? internalText;
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { feedText } = useEmotion();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      animate(resultRef.current, {
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 600,
        ease: "outQuad",
      });
    }
  }, [result]);

  async function check() {
    if (loading || text.trim().length < 80) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/check-originality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as Result & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Analysis failed. Please try again.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(value: string) {
    const next = value.slice(0, MAX_CHARS);
    if (onTextChange) onTextChange(next);
    else setInternalText(next);
    feedText(next);
  }

  const tooShort = text.trim().length > 0 && text.trim().length < 80;

  const inputBlock = (
    <>
      <label htmlFor="originality-input" className="sr-only">
        Text to analyze
      </label>
      {!embedded && (
        <textarea
          id="originality-input"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Paste the text you want to analyze (at least 80 characters)..."
          rows={8}
          className="glass-input w-full resize-y rounded-2xl p-4 text-base text-zinc-100 placeholder:text-zinc-500"
        />
      )}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          {tooShort ? "Keep going — 80+ characters needed." : embedded ? "Uses the text above." : "\u00A0"}
        </p>
        <p className="text-xs text-zinc-500">
          {text.length} / {MAX_CHARS}
        </p>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={check}
          disabled={text.trim().length < 80 || loading}
          className="btn-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold"
        >
          {loading && (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden
            />
          )}
          {loading ? "Analyzing..." : "Check Originality"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}
    </>
  );

  return (
    <div className={embedded ? "w-full" : "mx-auto w-full max-w-3xl"}>
      {embedded ? (
        inputBlock
      ) : (
        <div className="glass rounded-3xl p-4 shadow-2xl shadow-black/30 sm:p-6">
          {inputBlock}
        </div>
      )}

      {result && (
        <div
          ref={resultRef}
          className={`glass rounded-3xl p-5 sm:p-7 ${embedded ? "mt-4" : "mt-6"}`}
        >
          <div className="flex flex-wrap items-center justify-center gap-10">
            <Gauge value={result.aiLikelihood} label="AI likelihood" invert />
            <Gauge value={result.originality} label="Originality" />
          </div>

          <div className="mt-6 text-center">
            <p className="text-gradient-live text-lg font-bold">{result.verdict}</p>
            {result.summary && (
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-zinc-300">
                {result.summary}
              </p>
            )}
          </div>

          {result.passages.length > 0 && (
            <div className="mt-7">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Flagged passages
              </h3>
              <ul className="mt-3 space-y-3">
                {result.passages.map((p) => {
                  const style = PASSAGE_STYLES[p.type];
                  return (
                    <li
                      key={p.text}
                      className={`rounded-2xl border p-4 ${style.className}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                          {style.label}
                        </span>
                        <span className="text-xs opacity-75">{p.reason}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-100">
                        “{p.text}”
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-zinc-500">
            Stylistic AI analysis by our language model — not a web-crawl
            plagiarism database comparison.
          </p>
        </div>
      )}
    </div>
  );
}
