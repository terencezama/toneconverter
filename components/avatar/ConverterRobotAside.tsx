"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { emotionStyleVars } from "@/lib/emotion/emotionVars";
import { EMOTION_PALETTES } from "@/lib/emotion/palette";
import type { EmotionState } from "@/lib/emotion/types";
import { TONES, type ToneId } from "@/lib/tones";
import { Avatar } from "./Avatar";

const TONE_LABELS = Object.fromEntries(TONES.map((t) => [t.id, t.label])) as Record<
  ToneId,
  string
>;

/** 3D robot overlay — always visible beside the converter card. */
export function ConverterRobotAside({
  emotion,
  tone,
  loading,
}: {
  emotion: EmotionState;
  tone: ToneId;
  loading: boolean;
}) {
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!asideRef.current) return;
    animate(asideRef.current, {
      opacity: [0, 1],
      y: [8, 0],
      duration: 480,
      ease: "outQuad",
    });
  }, []);

  const mood = loading ? "zen" : EMOTION_PALETTES[emotion.emotion].mood;
  const label = loading ? "Converting…" : TONE_LABELS[tone];

  return (
    <aside
      ref={asideRef}
      className="pointer-events-none absolute z-20 flex flex-col items-center justify-center overflow-visible bottom-[5.5rem] left-1/2 -translate-x-1/2 sm:bottom-auto sm:left-auto sm:right-0 sm:top-[48%] sm:-translate-y-1/2 sm:translate-x-[calc(100%+0.625rem)]"
      aria-label={loading ? "Converting tone" : `${TONE_LABELS[tone]} tone preview`}
    >
      <div
        className="flex flex-col items-center gap-1.5 overflow-visible"
        style={emotionStyleVars(emotion)}
      >
        <Avatar
          mood={mood}
          tone={tone}
          thinking={loading}
          highlighted={!loading}
          largeCanvas
          size={166}
        />
        <span
          className="max-w-[110px] truncate text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400"
          style={
            !loading
              ? { color: "color-mix(in srgb, var(--emotion-c) 75%, white)" }
              : undefined
          }
        >
          {label}
        </span>
      </div>
    </aside>
  );
}

/** Compact SVG avatar for output panels. */
export function PanelAvatar({
  emotion,
  tone = null,
  thinking = false,
  muted = false,
}: {
  emotion: EmotionState;
  tone?: ToneId | null;
  thinking?: boolean;
  muted?: boolean;
}) {
  const mood = EMOTION_PALETTES[emotion.emotion].mood;

  return (
    <div style={emotionStyleVars(emotion)} className="shrink-0 self-end">
      <Avatar
        mood={mood}
        tone={tone}
        thinking={thinking}
        muted={muted}
        forceSvg
        size={52}
      />
    </div>
  );
}
