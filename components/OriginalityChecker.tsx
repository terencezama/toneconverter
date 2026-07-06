"use client";

import { useEffect, useState } from "react";
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
    className: "border-raw bg-raw-tint text-ink",
  },
  boilerplate: {
    label: "Boilerplate",
    className: "border-line bg-paper text-ink",
  },
  original: {
    label: "Original",
    className: "border-accent bg-accent-tint text-ink",
  },
};

/** Ease a number from 0 to `target` over `duration` ms via rAF. */
function useAnimatedValue(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

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
  const ARC_LENGTH = Math.PI * 54;
  const animated = useAnimatedValue(value);

  const good = invert ? value <= 40 : value >= 60;
  const bad = invert ? value >= 70 : value <= 30;
  const color = bad ? "#b15c3b" : good ? "#3f6b52" : "#c08a3e";

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[84px] w-[140px]">
        <svg width="140" height="84" viewBox="0 0 140 84">
          <path
            d="M 16 76 A 54 54 0 0 1 124 76"
            fill="none"
            stroke="var(--line)"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M 16 76 A 54 54 0 0 1 124 76"
            fill="none"
            stroke={color}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={ARC_LENGTH}
            strokeDashoffset={ARC_LENGTH * (1 - animated / 100)}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <span className="font-serif text-3xl text-ink">{Math.round(animated)}</span>
          <span className="text-base font-medium text-ink-soft">%</span>
        </div>
      </div>
      <p className="mb-0 mt-2 text-sm font-medium text-ink-soft">{label}</p>
    </div>
  );
}

export function OriginalityChecker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { feedText } = useEmotion();

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
    setText(next);
    feedText(next);
  }

  const tooShort = text.trim().length > 0 && text.trim().length < 80;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div
        className="surface rounded-[22px] p-6 sm:p-7"
        style={{
          boxShadow:
            "0 1px 0 rgba(33,29,23,.04), 0 24px 60px -40px rgba(33,29,23,.4)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="eyebrow-sm text-accent" style={{ letterSpacing: "0.14em" }}>
            Text to analyze
          </span>
          <span className="font-mono text-[13px] leading-none text-ink-soft">
            {text.length} / {MAX_CHARS}
          </span>
        </div>
        <label htmlFor="originality-input" className="sr-only">
          Text to analyze
        </label>
        <textarea
          id="originality-input"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Paste the text you want to analyze (at least 80 characters)…"
          rows={8}
          className="w-full resize-y border-none bg-transparent text-[17px] leading-relaxed text-ink placeholder:text-[#b9b1a2]"
        />
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="m-0 text-sm text-ink-soft">
            {tooShort ? "Keep going, 80+ characters needed." : " "}
          </p>
          <button
            type="button"
            onClick={check}
            disabled={text.trim().length < 80 || loading}
            className="btn-accent flex items-center gap-2 px-7 py-3.5 text-base leading-none"
          >
            {loading ? "Analyzing" : "Check originality"}
            <span className="text-lg leading-none">→</span>
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-0 mt-4 text-[15px] text-raw">
            {error}
          </p>
        )}
      </div>

      {result && (
        <div className="surface animate-panel-in mt-6 rounded-[22px] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-center gap-10">
            <Gauge value={result.aiLikelihood} label="AI likelihood" invert />
            <Gauge value={result.originality} label="Originality" />
          </div>

          <div className="mt-6 text-center">
            <p className="m-0 font-serif text-[24px] leading-tight text-ink">
              {result.verdict}
            </p>
            {result.summary && (
              <p className="mx-auto mb-0 mt-2 max-w-xl text-[15px] leading-relaxed text-ink-soft">
                {result.summary}
              </p>
            )}
          </div>

          {result.passages.length > 0 && (
            <div className="mt-8">
              <h3 className="eyebrow-sm m-0 text-ink-soft">Flagged passages</h3>
              <ul className="mt-3 list-none space-y-3 p-0">
                {result.passages.map((p) => {
                  const style = PASSAGE_STYLES[p.type];
                  return (
                    <li key={p.text} className={`rounded-2xl border p-4 ${style.className}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-soft">
                          {style.label}
                        </span>
                        <span className="text-xs text-ink-soft">{p.reason}</span>
                      </div>
                      <p className="mb-0 mt-2 font-serif text-[17px] leading-relaxed">
                        “{p.text}”
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <p className="mb-0 mt-6 text-center text-xs text-ink-soft">
            Stylistic analysis by a language model. This is not a web-crawl
            plagiarism database comparison.
          </p>
        </div>
      )}
    </div>
  );
}
