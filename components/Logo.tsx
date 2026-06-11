/** Transparent SVG mascot — no raster background box. */
export function Logo({ size = 36, className = "" }: { size?: number; className?: string }) {
  const id = `logo-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0.15" x2="1" y2="0.85">
          <stop offset="0" style={{ stopColor: "var(--emotion-a, #fb5e7a)" }} />
          <stop offset="0.5" style={{ stopColor: "var(--emotion-b, #8b5cf6)" }} />
          <stop offset="1" style={{ stopColor: "var(--emotion-c, #2dd4bf)" }} />
        </linearGradient>
        <linearGradient id={`${id}-w`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="28"
        fill={`url(#${id}-g)`}
        filter={`url(#${id}-glow)`}
      />
      <path
        d="M4.6 38 C 14 30, 22 46, 32 38 S 50 30, 59.4 38 C 56.5 50.5, 45.5 60, 32 60 S 7.5 50.5, 4.6 38 Z"
        fill={`url(#${id}-w)`}
      />
      <ellipse cx="24" cy="27" rx="3.6" ry="5.4" fill="#fff" />
      <ellipse cx="40" cy="27" rx="3.6" ry="5.4" fill="#fff" />
      <path
        d="M22 44 Q32 50 42 44"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
