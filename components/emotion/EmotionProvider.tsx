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
import type { ToneId } from "@/lib/tones";
import { emotionColorsForState } from "../../../shared/emotion/color";
import {
  NEUTRAL_STATE,
  isEmotionId,
  type EmotionAnalysis,
  type EmotionState,
} from "@/lib/emotion/types";

type ToneAction = (tone: string) => void;

type EmotionContextValue = {
  state: EmotionState;
  /** Instant read from heuristics - appears before the LLM responds. */
  quickRead: ReturnType<typeof quickRead>;
  analysis: EmotionAnalysis | null;
  analyzing: boolean;
  converting: boolean;
  detectedTones: ToneId[];
  primaryTone: ToneId | null;
  setConverting: (on: boolean) => void;
  feedText: (text: string, options?: { pasted?: boolean }) => void;
  assistantHidden: boolean;
  dismissAnalysis: () => void;
  registerToneAction: (action: ToneAction | null) => void;
  applyTone: (tone: string) => boolean;
};

const EmotionContext = createContext<EmotionContextValue | null>(null);

const DEEP_ANALYSIS_MIN_CHARS = 12;
/** How long to wait after the last keystroke before mood / tones update. */
const MOOD_DEBOUNCE_MS = 650;
/** LLM refinement - runs after mood has had time to settle. */
const DEEP_DEBOUNCE_MS = 950;
const STRONG_SIGNAL_INTENSITY = 0.32;

export function EmotionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EmotionState>(NEUTRAL_STATE);
  const [analysis, setAnalysis] = useState<EmotionAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [converting, setConverting] = useState(false);
  const [detectedTones, setDetectedTones] = useState<ToneId[]>([]);
  const [primaryTone, setPrimaryTone] = useState<ToneId | null>(null);
  const [assistantHidden, setAssistantHidden] = useState(false);
  const assistantHiddenRef = useRef(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moodDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastAnalyzedRef = useRef<string>("");
  const lastFedTextRef = useRef<string>("");
  const toneActionRef = useRef<ToneAction | null>(null);

  const instantQuickRead = useMemo(() => quickRead(state), [state]);

  // Push live palette into CSS vars on every state tick (intensity-weighted).
  useEffect(() => {
    const [a, b, c] = emotionColorsForState(state);
    const root = document.documentElement;
    root.style.setProperty("--emotion-a", a);
    root.style.setProperty("--emotion-b", b);
    root.style.setProperty("--emotion-c", c);
  }, [state]);

  const applyHeuristic = useCallback((text: string) => {
    const heuristic = analyzeHeuristic(text);
    setState(heuristic);
    const toneRead = detectTones(text, heuristic);
    setDetectedTones(toneRead.tones);
    setPrimaryTone(toneRead.primary);
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
      const next: EmotionAnalysis = {
        emotion: data.emotion,
        intensity: typeof data.intensity === "number" ? data.intensity : 0.5,
        messiness: typeof data.messiness === "number" ? data.messiness : 0,
        summary: typeof data.summary === "string" ? data.summary : "",
        suggestion:
          data.suggestion && typeof data.suggestion.label === "string"
            ? data.suggestion
            : null,
        detectedTones: llmTones,
        primaryTone: isToneId(data.primaryTone) ? data.primaryTone : llmTones[0] ?? null,
      };
      setAnalysis(next);
      setDetectedTones(next.detectedTones);
      setPrimaryTone(next.primaryTone);
      setState({
        emotion: next.emotion,
        intensity: next.intensity,
        messiness: next.messiness,
      });
    } catch {
      // Heuristic + quickRead keep the experience responsive offline.
    } finally {
      if (abortRef.current === controller) setAnalyzing(false);
    }
  }, []);

  const feedText = useCallback(
    (text: string, options?: { pasted?: boolean }) => {
      const trimmed = text.trim();
      if (assistantHiddenRef.current && trimmed !== lastFedTextRef.current.trim()) {
        assistantHiddenRef.current = false;
        setAssistantHidden(false);
      }
      lastFedTextRef.current = text;

      if (moodDebounceRef.current) clearTimeout(moodDebounceRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (trimmed.length < DEEP_ANALYSIS_MIN_CHARS) {
        setState(NEUTRAL_STATE);
        setAnalysis(null);
        setAnalyzing(false);
        lastAnalyzedRef.current = "";
        setDetectedTones([]);
        setPrimaryTone(null);
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

      moodDebounceRef.current = setTimeout(() => {
        const heuristic = applyHeuristic(text);
        if (quickRead(heuristic)) setAnalyzing(true);
      }, MOOD_DEBOUNCE_MS);

      debounceRef.current = setTimeout(() => void runDeepAnalysis(text), DEEP_DEBOUNCE_MS);
    },
    [applyHeuristic, runDeepAnalysis]
  );

  const dismissAnalysis = useCallback(() => {
    setAnalysis(null);
    setAnalyzing(false);
    assistantHiddenRef.current = true;
    setAssistantHidden(true);
    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (moodDebounceRef.current) clearTimeout(moodDebounceRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (moodDebounceRef.current) clearTimeout(moodDebounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const registerToneAction = useCallback((action: ToneAction | null) => {
    toneActionRef.current = action;
  }, []);

  const applyTone = useCallback((tone: string) => {
    if (!toneActionRef.current) return false;
    toneActionRef.current(tone);
    return true;
  }, []);

  const value = useMemo(
    () => ({
      state,
      quickRead: instantQuickRead,
      analysis,
      analyzing,
      converting,
      setConverting,
      detectedTones,
      primaryTone,
      assistantHidden,
      feedText,
      dismissAnalysis,
      registerToneAction,
      applyTone,
    }),
    [
      state,
      instantQuickRead,
      analysis,
      analyzing,
      converting,
      detectedTones,
      primaryTone,
      assistantHidden,
      feedText,
      dismissAnalysis,
      registerToneAction,
      applyTone,
    ]
  );

  return <EmotionContext.Provider value={value}>{children}</EmotionContext.Provider>;
}

export function useEmotion(): EmotionContextValue {
  const ctx = useContext(EmotionContext);
  if (!ctx) throw new Error("useEmotion must be used inside <EmotionProvider>");
  return ctx;
}
