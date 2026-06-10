"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export function OutputCard({
  original,
  result,
  tone,
  loading,
  onRegenerate,
}: {
  original: string;
  result: string;
  tone: string;
  loading: boolean;
  onRegenerate: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showBefore, setShowBefore] = useState(false);

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
    <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
          Rewritten message
        </h3>
        <button
          type="button"
          onClick={() => setShowBefore((v) => !v)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          {showBefore ? "Hide original" : "Compare with original"}
        </button>
      </div>

      {showBefore && (
        <div className="mb-3 rounded-xl border border-zinc-200 bg-white p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Before
          </p>
          <p className="whitespace-pre-wrap text-sm text-zinc-500">{original}</p>
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        {showBefore && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-400">
            After
          </p>
        )}
        <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-900">
          {result}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copy}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={loading}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Regenerating..." : "Regenerate"}
        </button>
      </div>
    </div>
  );
}
