"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { LENGTHS, MAX_CHARS, TONES, type LengthId, type ToneId } from "@/lib/tones";
import { OutputCard } from "./OutputCard";

type ProviderInfo = { id: string; label: string };

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

  useEffect(() => {
    fetch("/api/providers")
      .then((res) => res.json())
      .then((data: { providers: ProviderInfo[] }) => {
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

  async function convert(isRegenerate = false) {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    trackEvent(isRegenerate ? "regenerate" : "convert", { tone, length, provider });

    try {
      const res = await fetch("/api/convert-tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, tone, length, provider }),
      });
      const data = (await res.json()) as { result?: string; error?: string };
      if (!res.ok || !data.result) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      setResult(data.result);
      setOriginal(text);
      trackEvent("convert_success", { tone, length, provider });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      trackEvent("convert_error", { tone, length, provider });
    } finally {
      setLoading(false);
    }
  }

  const charsLeft = MAX_CHARS - text.length;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
        <label htmlFor="tone-input" className="sr-only">
          Your message
        </label>
        <textarea
          id="tone-input"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Paste your message here..."
          rows={6}
          className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <div
          className={`mt-1 text-right text-xs ${
            charsLeft < 100 ? "text-amber-600" : "text-zinc-400"
          }`}
        >
          {text.length} / {MAX_CHARS}
        </div>

        <div className="mt-3">
          <p className="mb-2 text-sm font-medium text-zinc-700">Choose a tone</p>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  tone === t.id
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
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
              <label htmlFor="length-select" className="text-sm text-zinc-600">
                Length
              </label>
              <select
                id="length-select"
                value={length}
                onChange={(e) => setLength(e.target.value as LengthId)}
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-700 focus:border-indigo-400 focus:outline-none"
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
                <label htmlFor="provider-select" className="text-sm text-zinc-600">
                  Engine
                </label>
                <select
                  id="provider-select"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-700 focus:border-indigo-400 focus:outline-none"
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
            onClick={() => convert(false)}
            disabled={!text.trim() || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
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
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}
      </div>

      {result && (
        <OutputCard
          original={original}
          result={result}
          tone={tone}
          loading={loading}
          onRegenerate={() => convert(true)}
        />
      )}
    </div>
  );
}
