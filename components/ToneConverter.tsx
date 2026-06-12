"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { analyzeHeuristic } from "@/lib/emotion/heuristic";
import type { EmotionState } from "@/lib/emotion/types";
import { readJsonResponse } from "@/lib/fetchJson";
import { LENGTHS, MAX_CHARS, TONES, type LengthId, type ToneId } from "@/lib/tones";
import { AssistantBubble } from "./avatar/AssistantBubble";
import { ConverterRobotAside } from "./avatar/ConverterRobotAside";
import { useEmotion } from "./emotion/EmotionProvider";
import { OriginalityChecker } from "./OriginalityChecker";
import { OutputCard } from "./OutputCard";

type ProviderInfo = { id: string; label: string };

const EMOTION_LABELS: Record<string, string> = {
  neutral: "Neutral",
  angry: "Angry",
  frustrated: "Frustrated",
  anxious: "Anxious",
  sad: "Sad",
  excited: "Excited",
  happy: "Happy",
  calm: "Calm",
};

export function ToneConverter({
  defaultTone = "professional",
}: {
  defaultTone?: ToneId;
}) {
  const [text, setText] = useState("");
  const [tone, setTone] = useState<ToneId>(defaultTone);
  const [length, setLength] = useState<LengthId>("normal");
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [provider, setProvider] = useState<string>("openai");
  const [result, setResult] = useState<string | null>(null);
  const [original, setOriginal] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"convert" | "originality">("convert");

  const { state, feedText, registerToneAction, setConverting, detectedTones, primaryTone } =
    useEmotion();
  const [beforeConvertState, setBeforeConvertState] = useState(state);
  const [afterConvertState, setAfterConvertState] = useState<EmotionState | null>(null);

  const textRef = useRef(text);
  const loadingRef = useRef(loading);
  useEffect(() => {
    textRef.current = text;
  }, [text]);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

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
    async (overrides?: { tone?: ToneId; isRegenerate?: boolean }) => {
      const currentText = textRef.current;
      const useTone = overrides?.tone ?? tone;
      if (!currentText.trim() || loadingRef.current) return;
      setBeforeConvertState(state);
      setAfterConvertState(null);
      setLoading(true);
      setConverting(true);
      setError(null);
      trackEvent(overrides?.isRegenerate ? "regenerate" : "convert", {
        tone: useTone,
        length,
        provider,
      });

      try {
        const res = await fetch("/api/convert-tone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: currentText, tone: useTone, length, provider }),
        });
        const data = await readJsonResponse<{ result?: string; error?: string }>(res);
        if (!res.ok || !data.result) {
          throw new Error(data.error ?? "Something went wrong. Please try again.");
        }
        setResult(data.result);
        setOriginal(currentText);
        setAfterConvertState(analyzeHeuristic(data.result));
        trackEvent("convert_success", { tone: useTone, length, provider });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        trackEvent("convert_error", { tone: useTone, length, provider });
      } finally {
        setLoading(false);
        setConverting(false);
      }
    },
    [tone, length, provider, state, setConverting]
  );

  // Let the assistant avatar trigger conversions ("Make it professional").
  useEffect(() => {
    registerToneAction((suggestedTone: string) => {
      const valid = TONES.find((t) => t.id === suggestedTone);
      if (!valid) return;
      setTone(valid.id);
      void convert({ tone: valid.id });
    });
    return () => registerToneAction(null);
  }, [registerToneAction, convert]);

  function handleChange(value: string) {
    const next = value.slice(0, MAX_CHARS);
    setText(next);
    feedText(next);
    if (result) {
      setResult(null);
      setAfterConvertState(null);
    }
  }

  function handlePaste() {
    // Read the textarea after the paste has been applied.
    setTimeout(() => feedText(textRef.current, { pasted: true }), 0);
  }

  const charsLeft = MAX_CHARS - text.length;
  const pinOriginalEmotion = loading || result ? beforeConvertState : null;
  const robotEmotion = afterConvertState ?? state;
  const showEmotion =
    text.trim().length > 0 &&
    (state.emotion !== "neutral" || state.messiness > 0.35);

  return (
    <div className="relative mx-auto w-full max-w-3xl overflow-visible">
      <div className="glass overflow-visible rounded-3xl p-4 shadow-2xl shadow-black/30 sm:p-6">
        <div className="mb-4 flex gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
          {(
            [
              { id: "convert" as const, label: "Convert Tone" },
              { id: "originality" as const, label: "AI Checker" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                tab === item.id
                  ? "btn-gradient"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label htmlFor="tone-input" className="sr-only">
          Your message
        </label>
        <div className="relative">
          <textarea
            id="tone-input"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onPaste={handlePaste}
            placeholder="Paste your message here — I'll feel it as you type..."
            rows={6}
            className={`glass-input w-full resize-y rounded-2xl p-4 pb-16 pr-16 text-base text-zinc-100 placeholder:text-zinc-500 transition-all duration-500 sm:pb-[4.25rem] sm:pr-[4.5rem] ${
              loading
                ? "animate-convert-pulse ring-2 ring-[color-mix(in_srgb,var(--emotion-c)_45%,transparent)]"
                : ""
            }`}
          />
          <AssistantBubble anchored emotionOverride={pinOriginalEmotion} />
          {loading && (
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
              style={{ animation: "shimmer 1.6s ease-in-out infinite" }}
              aria-hidden
            />
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          {/* Live emotion meter */}
          <div
            className={`flex items-center gap-2 text-xs transition-opacity duration-150 ${
              showEmotion ? "opacity-100" : "opacity-0"
            }`}
            aria-live="polite"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                background:
                  "linear-gradient(120deg, var(--emotion-a), var(--emotion-c))",
                boxShadow: "0 0 10px var(--emotion-b)",
                animation: "pulse-glow 2s ease-in-out infinite",
              }}
            />
            <span className="font-medium text-zinc-300">
              {state.emotion !== "neutral"
                ? `Feels ${EMOTION_LABELS[state.emotion]?.toLowerCase()}`
                : "Feels a bit messy"}
            </span>
            {state.messiness > 0.5 && (
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                a bit messy
              </span>
            )}
            {detectedTones.length > 0 && (
              <span className="text-zinc-500">·</span>
            )}
            {detectedTones.slice(0, 2).map((t) => (
              <span
                key={t}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                  tone === t || primaryTone === t
                    ? "btn-gradient"
                    : "border border-white/15 bg-white/5 text-zinc-400"
                }`}
              >
                {TONES.find((x) => x.id === t)?.label ?? t}
              </span>
            ))}
          </div>

          <div
            className={`text-right text-xs ${
              charsLeft < 100 ? "text-amber-400" : "text-zinc-500"
            }`}
          >
            {text.length} / {MAX_CHARS}
          </div>
        </div>

        {tab === "convert" ? (
          <>
            <div className="mt-3">
              <p className="mb-2 text-sm font-medium text-zinc-300">Choose a tone</p>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                      tone === t.id
                        ? "btn-gradient"
                        : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label htmlFor="length-select" className="text-sm text-zinc-400">
                    Length
                  </label>
                  <select
                    id="length-select"
                    value={length}
                    onChange={(e) => setLength(e.target.value as LengthId)}
                    className="glass-input rounded-lg px-2.5 py-1.5 text-sm text-zinc-200 [&>option]:bg-zinc-900"
                  >
                    {LENGTHS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                {providers.length > 1 && (
                  <div className="flex items-center gap-2">
                    <label htmlFor="provider-select" className="text-sm text-zinc-400">
                      Engine
                    </label>
                    <select
                      id="provider-select"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="glass-input rounded-lg px-2.5 py-1.5 text-sm text-zinc-200 [&>option]:bg-zinc-900"
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

              <button
                type="button"
                onClick={() => convert()}
                disabled={!text.trim() || loading}
                className="btn-gradient inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold"
              >
                {loading && (
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden
                  />
                )}
                {loading ? "Converting..." : "Convert Tone"}
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
        ) : (
          <OriginalityChecker embedded text={text} onTextChange={handleChange} />
        )}
      </div>

      <ConverterRobotAside
        emotion={robotEmotion}
        tone={tone}
        loading={loading}
      />

      {tab === "convert" && result && (
        <OutputCard
          original={original}
          result={result}
          tone={tone}
          loading={loading}
          beforeEmotion={beforeConvertState}
          afterEmotion={afterConvertState}
          onRegenerate={() => convert({ isRegenerate: true })}
        />
      )}
    </div>
  );
}
