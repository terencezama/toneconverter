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
import { EMOTION_PALETTES } from "@/lib/emotion/palette";
import { quickRead } from "@/lib/emotion/quickRead";
import { detectTones, isToneId } from "@/lib/emotion/toneDetect";
import type { ToneId } from "@/lib/tones";
import {
  NEUTRAL_STATE,
  isEmotionId,
  type EmotionAnalysis,
  type EmotionState,
} from "@/lib/emotion/types";

type ToneAction = (tone: string) => void;

type EmotionContextValue = {
  state: EmotionState;
  /** Instant read from heuristics — appears before the LLM responds. */
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
const DEBOUNCE_MS = 380;
const STRONG_SIGNAL_INTENSITY = 0.32;

const NEUTRAL_COLORS = EMOTION_PALETTES.neutral.colors;

function mixHex(a: string, b: string, t: number): string {
  const parse = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const lerp = (x: number, y: number) => Math.round(x + (y - x) * t);
  const r = lerp(ar, br);
  const g = lerp(ag, bg);
  const bl = lerp(ab, bb);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

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
  const abortRef = useRef<AbortController | null>(null);
  const lastAnalyzedRef = useRef<string>("");
  const lastFedTextRef = useRef<string>("");
  const toneActionRef = useRef<ToneAction | null>(null);

  const instantQuickRead = useMemo(() => quickRead(state), [state]);

  // Push live palette into CSS vars on every state tick (intensity-weighted).
  useEffect(() => {
    const palette = EMOTION_PALETTES[state.emotion];
    const t = Math.min(1, state.intensity * 1.15 + state.messiness * 0.25);
    const root = document.documentElement;
    root.style.setProperty(
      "--emotion-a",
      mixHex(NEUTRAL_COLORS[0], palette.colors[0], t)
    );
    root.style.setProperty(
      "--emotion-b",
      mixHex(NEUTRAL_COLORS[1], palette.colors[1], t)
    );
    root.style.setProperty(
      "--emotion-c",
      mixHex(NEUTRAL_COLORS[2], palette.colors[2], t)
    );
  }, [state]);

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
      const data = (await res.json()) as Partial<EmotionAnalysis>;
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

      const heuristic = analyzeHeuristic(text);
      setState(heuristic);

      const toneRead = detectTones(text, heuristic);
      setDetectedTones(toneRead.tones);
      setPrimaryTone(toneRead.primary);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (trimmed.length < DEEP_ANALYSIS_MIN_CHARS) {
        setAnalysis(null);
        setAnalyzing(false);
        lastAnalyzedRef.current = "";
        setDetectedTones([]);
        setPrimaryTone(null);
        return;
      }

      const urgent =
        options?.pasted ||
        heuristic.intensity >= STRONG_SIGNAL_INTENSITY ||
        heuristic.messiness >= 0.5;

      if (urgent) {
        void runDeepAnalysis(text);
        return;
      }

      // Show we're listening immediately; LLM refines a moment later.
      if (quickRead(heuristic)) setAnalyzing(true);
      debounceRef.current = setTimeout(() => void runDeepAnalysis(text), DEBOUNCE_MS);
    },
    [runDeepAnalysis]
  );

  const dismissAnalysis = useCallback(() => {
    setAnalysis(null);
    setAnalyzing(false);
    assistantHiddenRef.current = true;
    setAssistantHidden(true);
    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
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
