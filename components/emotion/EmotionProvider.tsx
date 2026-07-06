"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { analyzeHeuristic } from "@/lib/emotion/heuristic";
import { quickRead } from "@/lib/emotion/quickRead";
import { readJsonResponse } from "@/lib/fetchJson";
import { detectTones, isToneId } from "@/lib/emotion/toneDetect";
import {
  NEUTRAL_STATE,
  isEmotionId,
  type EmotionAnalysis,
  type EmotionState,
} from "@/lib/emotion/types";

type EmotionContextValue = {
  state: EmotionState;
  /** LLM refinement; state holds the instant heuristic until it lands. */
  analysis: EmotionAnalysis | null;
  analyzing: boolean;
  converting: boolean;
  setConverting: (on: boolean) => void;
  feedText: (text: string, options?: { pasted?: boolean }) => void;
};

const EmotionContext = createContext<EmotionContextValue | null>(null);

const DEEP_ANALYSIS_MIN_CHARS = 12;
/** How long to wait after the last keystroke before the mood updates. */
const MOOD_DEBOUNCE_MS = 650;
/** LLM refinement runs after the mood has had time to settle. */
const DEEP_DEBOUNCE_MS = 950;
const STRONG_SIGNAL_INTENSITY = 0.32;

export function EmotionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EmotionState>(NEUTRAL_STATE);
  const [analysis, setAnalysis] = useState<EmotionAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [converting, setConverting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moodDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastAnalyzedRef = useRef<string>("");

  const applyHeuristic = useCallback((text: string) => {
    const heuristic = analyzeHeuristic(text);
    setState(heuristic);
    return heuristic;
  }, []);

  const runDeepAnalysis = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < DEEP_ANALYSIS_MIN_CHARS) return;
    if (trimmed === lastAnalyzedRef.current) return;
    lastAnalyzedRef.current = trimmed;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
        signal: controller.signal,
      });
      if (!res.ok) return;
      const data = await readJsonResponse<Partial<EmotionAnalysis>>(res);
      if (controller.signal.aborted) return;
      if (!isEmotionId(data.emotion)) return;
      const llmTones = Array.isArray(data.detectedTones)
        ? data.detectedTones.filter(isToneId)
        : [];
      const heuristicTones = detectTones(trimmed, analyzeHeuristic(trimmed));
      const next: EmotionAnalysis = {
        emotion: data.emotion,
        intensity: typeof data.intensity === "number" ? data.intensity : 0.5,
        messiness: typeof data.messiness === "number" ? data.messiness : 0,
        summary: typeof data.summary === "string" ? data.summary : "",
        suggestion:
          data.suggestion && typeof data.suggestion.label === "string"
            ? data.suggestion
            : null,
        detectedTones: llmTones.length ? llmTones : heuristicTones.tones,
        primaryTone: isToneId(data.primaryTone)
          ? data.primaryTone
          : llmTones[0] ?? heuristicTones.primary,
      };
      setAnalysis(next);
      setState({
        emotion: next.emotion,
        intensity: next.intensity,
        messiness: next.messiness,
      });
    } catch {
      // The heuristic keeps the experience responsive offline.
    } finally {
      if (abortRef.current === controller) setAnalyzing(false);
    }
  }, []);

  const feedText = useCallback(
    (text: string, options?: { pasted?: boolean }) => {
      const trimmed = text.trim();

      if (moodDebounceRef.current) clearTimeout(moodDebounceRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (trimmed.length < DEEP_ANALYSIS_MIN_CHARS) {
        setState(NEUTRAL_STATE);
        setAnalysis(null);
        setAnalyzing(false);
        lastAnalyzedRef.current = "";
        return;
      }

      const preview = analyzeHeuristic(text);
      const urgent =
        options?.pasted ||
        preview.intensity >= STRONG_SIGNAL_INTENSITY ||
        preview.messiness >= 0.5;

      if (urgent) {
        const heuristic = applyHeuristic(text);
        if (quickRead(heuristic)) setAnalyzing(true);
        void runDeepAnalysis(text);
        return;
      }

      setAnalysis(null);
      moodDebounceRef.current = setTimeout(() => {
        const heuristic = applyHeuristic(text);
        if (quickRead(heuristic)) setAnalyzing(true);
      }, MOOD_DEBOUNCE_MS);

      debounceRef.current = setTimeout(() => void runDeepAnalysis(text), DEEP_DEBOUNCE_MS);
    },
    [applyHeuristic, runDeepAnalysis]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (moodDebounceRef.current) clearTimeout(moodDebounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const value = useMemo(
    () => ({
      state,
      analysis,
      analyzing,
      converting,
      setConverting,
      feedText,
    }),
    [state, analysis, analyzing, converting, feedText]
  );

  return <EmotionContext.Provider value={value}>{children}</EmotionContext.Provider>;
}

export function useEmotion(): EmotionContextValue {
  const ctx = useContext(EmotionContext);
  if (!ctx) throw new Error("useEmotion must be used inside <EmotionProvider>");
  return ctx;
}
