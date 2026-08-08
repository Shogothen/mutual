/** Motion token system (§24). Mirrors CSS vars in tokens.css. */
export const MOTION = {
  duration: { fast: 0.16, base: 0.28, slow: 0.56, reveal: 1.2 },
  easeOrganic: [0.22, 1, 0.36, 1] as const,
  easeDrift: [0.45, 0, 0.15, 1] as const,
  spring: { gentle: { type: "spring", stiffness: 220, damping: 26 } as const },
  distance: { sm: 8, md: 16, lg: 32 }
} as const;
