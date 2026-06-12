"use client";

import { animate } from "animejs";
import { useEffect, useId, useRef } from "react";
import {
  getToneAvatarStyle,
  type AvatarMood,
  type ToneAccessory,
} from "@/lib/avatar/toneStyle";
import type { EmotionPalette } from "@/lib/emotion/palette";
import type { ToneId } from "@/lib/tones";

type FaceParams = {
  mouth: string;
  eyeRy: number;
  eyeRx: number;
  browOpacity: number;
  browLeft: string;
  browRight: string;
};

const FACES: Record<AvatarMood, FaceParams> = {
  zen: {
    mouth: "M42 78 Q60 88 78 78",
    eyeRy: 9,
    eyeRx: 6.5,
    browOpacity: 0,
    browLeft: "M36 36 Q44 32 52 36",
    browRight: "M68 36 Q76 32 84 36",
  },
  happy: {
    mouth: "M40 76 Q60 96 80 76",
    eyeRy: 10,
    eyeRx: 6.5,
    browOpacity: 0,
    browLeft: "M36 34 Q44 30 52 34",
    browRight: "M68 34 Q76 30 84 34",
  },
  excited: {
    mouth: "M38 74 Q60 102 82 74",
    eyeRy: 11.5,
    eyeRx: 7,
    browOpacity: 0,
    browLeft: "M36 31 Q44 27 52 31",
    browRight: "M68 31 Q76 27 84 31",
  },
  worried: {
    mouth: "M44 83 Q60 77 76 83",
    eyeRy: 9,
    eyeRx: 6,
    browOpacity: 1,
    browLeft: "M36 36 Q44 31 52 35",
    browRight: "M68 35 Q76 31 84 36",
  },
  sad: {
    mouth: "M44 87 Q60 76 76 87",
    eyeRy: 7.5,
    eyeRx: 6,
    browOpacity: 1,
    browLeft: "M36 38 Q44 33 52 37",
    browRight: "M68 37 Q76 33 84 38",
  },
  alarmed: {
    mouth: "M46 84 Q60 84 74 84",
    eyeRy: 12,
    eyeRx: 7.5,
    browOpacity: 1,
    browLeft: "M36 33 Q44 36 52 39",
    browRight: "M68 39 Q76 36 84 33",
  },
};

function ToneAccessorySvg({ type }: { type: ToneAccessory }) {
  if (!type) return null;

  if (type === "suit") {
    return (
      <g opacity="0.92">
        <path
          d="M38 104 Q60 96 82 104 L78 114 Q60 108 42 114 Z"
          fill="rgba(255,255,255,0.18)"
          stroke="#fff"
          strokeWidth="1.5"
        />
        <path d="M52 104 L60 114 L68 104" stroke="#fff" strokeWidth="2" fill="none" />
        <path d="M60 114 L57 122 L60 125 L63 122 Z" fill="#fff" opacity="0.85" />
      </g>
    );
  }

  if (type === "glasses") {
    return (
      <g stroke="#fff" fill="none" strokeWidth="2" opacity="0.9">
        <rect x="33" y="45" width="24" height="15" rx="4" />
        <rect x="63" y="45" width="24" height="15" rx="4" />
        <line x1="57" y1="52" x2="63" y2="52" />
      </g>
    );
  }

  if (type === "heart") {
    return (
      <path
        d="M88 72 C84 66, 76 66, 76 74 C76 66, 68 66, 64 72 C64 80, 76 88, 76 88 C76 88, 88 80, 88 72 Z"
        fill="#fff"
        opacity="0.75"
      />
    );
  }

  if (type === "wave") {
    return (
      <g fill="#fff" opacity="0.85">
        <circle cx="94" cy="96" r="7" />
        <path
          d="M88 88 Q94 78 100 88"
          stroke="#fff"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    );
  }

  return null;
}

export function AvatarSvg({
  mood = "zen",
  tone = null,
  thinking = false,
  size = 96,
  muted = false,
  highlighted = false,
  className = "",
}: {
  mood?: EmotionPalette["mood"];
  tone?: ToneId | null;
  thinking?: boolean;
  size?: number;
  muted?: boolean;
  highlighted?: boolean;
  className?: string;
}) {
  const toneStyle = getToneAvatarStyle(tone);
  const effectiveMood = toneStyle?.mood ?? mood;

  const gradientId = useId();
  const waveId = useId();
  const groupRef = useRef<SVGGElement>(null);
  const mouthRef = useRef<SVGPathElement>(null);
  const eyeLeftRef = useRef<SVGEllipseElement>(null);
  const eyeRightRef = useRef<SVGEllipseElement>(null);
  const browLeftRef = useRef<SVGPathElement>(null);
  const browRightRef = useRef<SVGPathElement>(null);
  const dotsRef = useRef<SVGGElement>(null);
  const baseEyeRy = useRef(FACES.zen.eyeRy);
  const blinkingRef = useRef(false);

  useEffect(() => {
    const face = FACES[effectiveMood];
    const mouth = toneStyle?.mouth ?? face.mouth;
    const eyeRy = toneStyle?.eyeRy ?? face.eyeRy;
    const eyeRx = toneStyle?.eyeRx ?? face.eyeRx;

    baseEyeRy.current = eyeRy;
    if (mouthRef.current) {
      animate(mouthRef.current, { d: mouth, duration: 280, ease: "outQuad" });
    }
    for (const eye of [eyeLeftRef.current, eyeRightRef.current]) {
      if (eye && !blinkingRef.current) {
        animate(eye, { ry: eyeRy, rx: eyeRx, duration: 280, ease: "outQuad" });
      }
    }
    if (browLeftRef.current && browRightRef.current) {
      animate(browLeftRef.current, {
        d: face.browLeft,
        opacity: face.browOpacity,
        duration: 280,
        ease: "outQuad",
      });
      animate(browRightRef.current, {
        d: face.browRight,
        opacity: face.browOpacity,
        duration: 280,
        ease: "outQuad",
      });
    }

    if (groupRef.current) {
      if (effectiveMood === "alarmed") {
        animate(groupRef.current, {
          translateX: [0, -3, 3, -2.5, 2.5, -1.5, 1.5, 0],
          duration: 550,
          ease: "linear",
        });
      } else if (effectiveMood === "excited") {
        animate(groupRef.current, {
          translateY: [0, -8, 0, -4, 0],
          duration: 650,
          ease: "outQuad",
        });
      } else if (toneStyle?.pose === "confident") {
        animate(groupRef.current, {
          scale: [1, 1.08, 1.04],
          rotate: [0, 3, 0],
          duration: 520,
          ease: "outElastic(1, .55)",
        });
      } else if (toneStyle?.pose === "bow") {
        animate(groupRef.current, {
          translateY: [0, 5, 0],
          duration: 480,
          ease: "outQuad",
        });
      } else if (toneStyle?.pose === "tilt") {
        animate(groupRef.current, {
          rotate: [0, -6, -4],
          duration: 400,
          ease: "outQuad",
        });
      } else {
        animate(groupRef.current, { scale: 1, rotate: 0, translateY: 0, duration: 280 });
      }
    }
  }, [effectiveMood, toneStyle, tone]);

  useEffect(() => {
    let alive = true;
    let timeout: ReturnType<typeof setTimeout>;
    const blink = () => {
      if (!alive) return;
      const eyes = [eyeLeftRef.current, eyeRightRef.current].filter(
        (e): e is SVGEllipseElement => Boolean(e)
      );
      if (eyes.length) {
        blinkingRef.current = true;
        animate(eyes, {
          ry: [
            { to: 1, duration: 90, ease: "inQuad" },
            { to: baseEyeRy.current, duration: 140, ease: "outQuad" },
          ],
          onComplete: () => {
            blinkingRef.current = false;
          },
        });
      }
      timeout = setTimeout(blink, 1800 + Math.random() * 3500);
    };
    timeout = setTimeout(blink, 1200);
    return () => {
      alive = false;
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!dotsRef.current) return;
    const dots = Array.from(dotsRef.current.children) as SVGElement[];
    if (!thinking) {
      for (const d of dots) d.setAttribute("opacity", "0");
      return;
    }
    const animation = animate(dots, {
      opacity: [
        { to: 1, duration: 260 },
        { to: 0.15, duration: 260 },
      ],
      delay: (_: unknown, i: number) => i * 180,
      loop: true,
      ease: "inOutSine",
    });
    return () => {
      animation.cancel();
    };
  }, [thinking]);

  const motionClass = muted ? "" : "animate-float-soft";
  const toneLabel = tone ? `, ${tone} tone` : "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={`${motionClass} ${muted ? "opacity-55 saturate-[0.65]" : ""} ${
        highlighted ? "drop-shadow-[0_0_14px_var(--emotion-b)]" : ""
      } transition-all duration-700 ${className}`}
      role="img"
      aria-label={`Assistant avatar feeling ${effectiveMood}${toneLabel}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0.15" x2="1" y2="0.85">
          <stop offset="0" style={{ stopColor: "var(--emotion-a)" }}>
            <animate attributeName="offset" values="0;0.08;0" dur="6s" repeatCount="indefinite" />
          </stop>
          <stop offset="0.5" style={{ stopColor: "var(--emotion-b)" }} />
          <stop offset="1" style={{ stopColor: "var(--emotion-c)" }} />
        </linearGradient>
        <linearGradient id={waveId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <g ref={groupRef}>
        <circle cx="60" cy="62" r="50" fill={`url(#${gradientId})`} opacity="0.35" />
        <circle cx="60" cy="62" r="46" fill={`url(#${gradientId})`} />
        <path
          d="M15.5 72 C 30 60, 45 84, 60 72 S 90 60, 104.5 72 C 100 92, 82 108, 60 108 S 20 92, 15.5 72 Z"
          fill={`url(#${waveId})`}
        />
        <path
          ref={browLeftRef}
          d={FACES.zen.browLeft}
          stroke="#fff"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0"
        />
        <path
          ref={browRightRef}
          d={FACES.zen.browRight}
          stroke="#fff"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0"
        />
        <ellipse ref={eyeLeftRef} cx="44" cy="52" rx="6.5" ry="9" fill="#fff" />
        <ellipse ref={eyeRightRef} cx="76" cy="52" rx="6.5" ry="9" fill="#fff" />
        <path
          ref={mouthRef}
          d={FACES.zen.mouth}
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <ToneAccessorySvg type={toneStyle?.accessory ?? null} />
      </g>

      <g ref={dotsRef}>
        <circle cx="92" cy="22" r="3.4" fill="#fff" opacity="0" />
        <circle cx="103" cy="14" r="4.4" fill="#fff" opacity="0" />
        <circle cx="114" cy="6" r="5.2" fill="#fff" opacity="0" />
      </g>
    </svg>
  );
}
