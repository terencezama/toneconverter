"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { readJsonResponse } from "@/lib/fetchJson";
import { moodReading, MOOD_DEFAULT_COLOR } from "@/lib/mood";
import {
  LENGTHS,
  MAX_CHARS,
  OUTCOMES,
  TONES,
  type LengthId,
  type OutcomeId,
  type ToneId,
} from "@/lib/tones";
import { useEmotion } from "./emotion/EmotionProvider";

type ProviderInfo = { id: string; label: string };

/** Tones shown as chips; the rest stay reachable through length options. */
const CHIP_TONES: ToneId[] = [
  "professional",
  "polite",
  "friendly",
  "calm",
  "formal",
  "confident",
  "empathetic",
  "clearer",
];

const LENGTH_ORDER: LengthId[] = ["shorter", "normal", "longer"];

const EXAMPLE_TEXT =
  "are you serious?? this is the THIRD time the report is late and NOBODY bothered to tell me. i'm honestly done covering for this team, figure it out.";

export function ToneConverter({
  defaultTone = "professional",
}: {
  defaultTone?: ToneId;
}) {
  const [text, setText] = useState("");
  const [tone, setTone] = useState<ToneId>(defaultTone);
  const [length, setLength] = useState<LengthId>("normal");
  const [outcome, setOutcome] = useState<OutcomeId | null>(null);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [provider, setProvider] = useState<string>("openai");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { state, analysis, feedText, setConverting } = useEmotion();

  const textRef = useRef(text);
  const loadingRef = useRef(loading);
  useEffect(() => {
    textRef.current = text;
  }, [text]);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const hasText = text.trim().length > 0;
  const mood = moodReading(state, hasText);
  const moodLabel =
    hasText && analysis?.summary ? analysis.summary : mood.label;

  // Tint the page glow with the current mood.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--mood", mood.color);
    return () => {
      root.style.setProperty("--mood", MOOD_DEFAULT_COLOR);
    };
  }, [mood.color]);

  useEffect(() => {
    fetch("/api/providers")
      .then((res) => readJsonResponse<{ providers: ProviderInfo[] }>(res))
      .then((data) => {
        if (data.providers?.length) {
          setProviders(data.providers);
          setProvider((current) =>
            data.providers.some((p) => p.id === current)
              ? current
              : data.providers[0].id
          );
        }
      })
      .catch(() => {});
  }, []);

  const convert = useCallback(
    async (overrides?: { isRegenerate?: boolean }) => {
      const currentText = textRef.current;
      if (!currentText.trim() || loadingRef.current) return;
      setLoading(true);
      setConverting(true);
      setError(null);
      setCopied(false);
      trackEvent(overrides?.isRegenerate ? "regenerate" : "convert", {
        tone,
        length,
        outcome,
        provider,
      });

      try {
        const res = await fetch("/api/convert-tone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: currentText, tone, length, outcome, provider }),
        });
        const data = await readJsonResponse<{ result?: string; error?: string }>(res);
        if (!res.ok || !data.result) {
          throw new Error(data.error ?? "Something went wrong. Please try again.");
        }
        setResult(data.result);
        trackEvent("convert_success", { tone, length, outcome, provider });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        trackEvent("convert_error", { tone, length, outcome, provider });
      } finally {
        setLoading(false);
        setConverting(false);
      }
    },
    [tone, length, outcome, provider, setConverting]
  );

  function handleChange(value: string) {
    const next = value.slice(0, MAX_CHARS);
    setText(next);
    feedText(next);
    if (result) setResult(null);
    if (error) setError(null);
  }

  function handlePaste() {
    setTimeout(() => feedText(textRef.current, { pasted: true }), 0);
  }

  function loadExample() {
    setResult(null);
    setError(null);
    setCopied(false);
    setText(EXAMPLE_TEXT);
    feedText(EXAMPLE_TEXT, { pasted: true });
  }

  async function copyResult() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      trackEvent("copy", { tone });
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (e.g. insecure context); ignore.
    }
  }

  const toneLabel = TONES.find((t) => t.id === tone)?.label ?? "Professional";
  const showEmpty = !result && !loading && !error;

  return (
    <div className="w-full">
      <div
        className="surface overflow-hidden rounded-[22px]"
        style={{
          boxShadow:
            "0 1px 0 rgba(33,29,23,.04), 0 24px 60px -40px rgba(33,29,23,.4)",
        }}
      >
        <div className="grid md:grid-cols-2">
          <div className="border-b border-line p-6 sm:p-7 md:border-b-0 md:border-r">
            <div className="mb-4 flex items-center justify-between">
              <span className="eyebrow-sm text-raw" style={{ letterSpacing: "0.14em" }}>
                Your message
              </span>
              <span className="font-mono text-[13px] leading-none text-ink-soft">
                {text.length} / {MAX_CHARS}
              </span>
            </div>

            <div className="mb-4 flex min-h-4 items-center gap-2" aria-live="polite">
              <span
                className="h-[9px] w-[9px] shrink-0 rounded-full transition-colors duration-500"
                style={{
                  background: mood.color,
                  boxShadow: `0 0 0 4px ${mood.color}22`,
                }}
              />
              <span
                className="text-[13px] font-medium leading-none transition-colors duration-500"
                style={{ color: mood.color }}
              >
                {moodLabel}
              </span>
            </div>

            <label htmlFor="tone-input" className="sr-only">
              Your message
            </label>
            <textarea
              id="tone-input"
              value={text}
              onChange={(e) => handleChange(e.target.value)}
              onPaste={handlePaste}
              maxLength={MAX_CHARS}
              placeholder="Paste the message you're about to send, however it comes out. e.g. “are you kidding me, this is the THIRD time you've missed the deadline and nobody said a word…”"
              className="min-h-[210px] w-full resize-y border-none bg-transparent text-[17px] leading-relaxed text-ink placeholder:text-[#b9b1a2]"
            />
          </div>

          <div className="bg-paper p-6 sm:p-7">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="eyebrow-sm text-accent" style={{ letterSpacing: "0.14em" }}>
                Composed · {toneLabel}
              </span>
              {result && !loading && (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={copyResult} className="chip-action">
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={() => convert({ isRegenerate: true })}
                    className="chip-action"
                  >
                    Again
                  </button>
                </div>
              )}
            </div>

            {showEmpty && (
              <p className="m-0 max-w-[40ch] text-[17px] leading-relaxed text-[#b9b1a2]">
                Your rewritten message appears here. Same meaning, composed
                tone, ready to send.
              </p>
            )}
            {loading && (
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 rounded-full bg-accent"
                  style={{ animation: "pulseDot 1s infinite" }}
                />
                <span className="text-base leading-none text-ink-soft">
                  Composing a calmer version…
                </span>
              </div>
            )}
            {result && !loading && (
              <p className="animate-panel-in m-0 whitespace-pre-wrap text-[17px] leading-relaxed text-ink">
                {result}
              </p>
            )}
            {error && !loading && (
              <p role="alert" className="m-0 text-[15px] leading-normal text-raw">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6 border-t border-line p-5 sm:px-7">
          <div className="flex flex-wrap gap-6">
            <div>
              <div className="eyebrow-sm mb-2.5 text-ink-soft">Tone</div>
              <div className="flex max-w-[520px] flex-wrap gap-2">
                {CHIP_TONES.map((id) => {
                  const t = TONES.find((item) => item.id === id);
                  if (!t) return null;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id)}
                      className={`chip ${tone === t.id ? "chip-active-accent" : ""}`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="eyebrow-sm mb-2.5 text-ink-soft">Length</div>
              <div className="flex gap-2">
                {LENGTH_ORDER.map((id) => {
                  const l = LENGTHS.find((item) => item.id === id);
                  if (!l) return null;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLength(l.id)}
                      className={`chip ${length === l.id ? "chip-active-ink" : ""}`}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="eyebrow-sm mb-2.5 text-ink-soft">Goal</div>
              <select
                value={outcome ?? ""}
                onChange={(e) =>
                  setOutcome(e.target.value ? (e.target.value as OutcomeId) : null)
                }
                aria-label="Goal"
                className="chip appearance-none pr-6"
              >
                <option value="">None</option>
                {OUTCOMES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {providers.length > 1 && (
              <div>
                <div className="eyebrow-sm mb-2.5 text-ink-soft">Engine</div>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  aria-label="Engine"
                  className="chip appearance-none pr-6"
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadExample}
              className="btn-outline px-5 py-[13px] text-[15px] leading-none"
            >
              Try an example
            </button>
            <button
              type="button"
              onClick={() => convert()}
              disabled={!hasText || loading}
              className="btn-accent flex items-center gap-2 px-7 py-3.5 text-base leading-none"
            >
              {loading ? "Composing" : "Convert"}
              <span className="text-lg leading-none">→</span>
            </button>
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-sm text-ink-soft">
        Free to try · No account · Your text is never stored
      </p>
    </div>
  );
}
