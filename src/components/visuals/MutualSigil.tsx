import { useReducedMotionPref } from "@/hooks/useReducedMotion";

/**
 * MUTUAL-Sigil: zwei organische Konturen, deren Überschneidung eine Linse
 * bildet – die Marke ist die Metapher. Subtile Atembewegung per CSS,
 * statisch unter Reduced Motion. Kein Herz, kein Kitsch.
 */
export function MutualSigil({ size = 40, className = "" }: { size?: number; className?: string }) {
  const reduced = useReducedMotionPref();
  const anim = reduced ? "" : "sigil-breathe";
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Mutual"
      className={className}
    >
      <defs>
        <linearGradient id="sigA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgb(var(--c-iris))" />
          <stop offset="1" stopColor="rgb(var(--c-lavender))" />
        </linearGradient>
        <linearGradient id="sigB" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgb(var(--c-aqua))" />
          <stop offset="1" stopColor="rgb(var(--c-iris))" />
        </linearGradient>
        <radialGradient id="sigLens" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="rgb(var(--c-pearl))" stopOpacity="0.9" />
          <stop offset="1" stopColor="rgb(var(--c-coral))" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className={anim} style={{ transformOrigin: "24px 24px" }}>
        <path
          d="M19 8c8 0 14 7.2 14 16S27 40 19 40 6.5 32.8 6.5 24 11 8 19 8z"
          stroke="url(#sigA)"
          strokeWidth="1.8"
          opacity="0.9"
        />
        <path
          d="M29 8c8 0 12.5 7.2 12.5 16S37 40 29 40 15 32.8 15 24 21 8 29 8z"
          stroke="url(#sigB)"
          strokeWidth="1.8"
          opacity="0.9"
        />
        {/* Linse: nur die Überschneidung leuchtet. */}
        <path
          d="M24 10.5c3.4 3.1 5.5 8 5.5 13.5S27.4 34.4 24 37.5c-3.4-3.1-5.5-8-5.5-13.5S20.6 13.6 24 10.5z"
          fill="url(#sigLens)"
          opacity="0.55"
        />
      </g>
    </svg>
  );
}
