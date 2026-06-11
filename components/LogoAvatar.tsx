"use client";

import { animate } from "animejs";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/avatar/Avatar";
import { emotionStyleVars } from "@/lib/emotion/emotionVars";
import type { EmotionId } from "@/lib/emotion/types";
import type { AvatarMood } from "@/lib/avatar/toneStyle";
import type { ToneId } from "@/lib/tones";

type LogoPersona = {
  tone: ToneId | null;
  mood?: AvatarMood;
  emotion: EmotionId;
  label: string;
  intensity?: number;
};

/** Expressive tone personas mapped from use cases + signature conversions. */
const LOGO_PERSONAS: LogoPersona[] = [
  { tone: null, mood: "alarmed", emotion: "angry", label: "Angry", intensity: 0.9 },
  { tone: "professional", emotion: "neutral", label: "Professional" },
  { tone: "formal", emotion: "calm", label: "Formal" },
  { tone: "friendly", emotion: "happy", label: "Friendly", intensity: 0.75 },
  { tone: "confident", emotion: "excited", label: "Confident", intensity: 0.7 },
  { tone: "clearer", emotion: "neutral", label: "Clearer" },
  { tone: "calm", emotion: "calm", label: "Calm", intensity: 0.55 },
  { tone: "empathetic", emotion: "sad", label: "Empathetic", intensity: 0.65 },
];

const CYCLE_MS = 3800;
const HOVER_CYCLE_MS = 1300;

export function LogoAvatar({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const persona = LOGO_PERSONAS[index];

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % LOGO_PERSONAS.length);
    if (wrapRef.current) {
      animate(wrapRef.current, {
        scale: [1, 1.14, 1],
        duration: 480,
        ease: "outElastic(1, .58)",
      });
    }
    if (glowRef.current) {
      animate(glowRef.current, {
        opacity: [0.45, 0.85, 0.5],
        scale: [0.92, 1.08, 1],
        duration: 520,
        ease: "outQuad",
      });
    }
  }, []);

  useEffect(() => {
    const ms = hovering ? HOVER_CYCLE_MS : CYCLE_MS;
    const id = setInterval(advance, ms);
    return () => clearInterval(id);
  }, [hovering, advance]);

  const vars = emotionStyleVars({
    emotion: persona.emotion,
    intensity: persona.intensity ?? (hovering ? 0.8 : 0.62),
    messiness: persona.emotion === "angry" ? 0.28 : 0,
  });

  return (
    <div
      ref={wrapRef}
      className={`logo-avatar relative ${className}`}
      style={vars}
      onMouseEnter={() => {
        setHovering(true);
        advance();
      }}
      onMouseLeave={() => setHovering(false)}
      title={`${persona.label} tone`}
      aria-hidden
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-[-18%] rounded-full opacity-50 blur-md transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle at 40% 35%, var(--emotion-a), transparent 62%), radial-gradient(circle at 65% 70%, var(--emotion-c), transparent 55%)",
        }}
      />
      <Avatar
        mood={persona.mood}
        tone={persona.tone}
        size={size}
        highlighted={hovering}
        className="relative z-10"
      />
      <span
        className={`pointer-events-none absolute -bottom-1 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-white/90 transition-all duration-300 ${
          hovering ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
        style={{
          background: "color-mix(in srgb, var(--emotion-b) 55%, transparent)",
          boxShadow: "0 0 12px color-mix(in srgb, var(--emotion-b) 40%, transparent)",
        }}
      >
        {persona.label}
      </span>
    </div>
  );
}
