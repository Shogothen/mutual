import type { IntensityLevel } from "../questions/types";

export type IntensityRange = { min: IntensityLevel; max: IntensityLevel };

export function normalizeRange(min: IntensityLevel, max: IntensityLevel): IntensityRange {
  return min <= max ? { min, max } : { min: max, max: min };
}

/** The overlap of both comfort ranges, or null when they do not intersect. */
export function intensityOverlap(a: IntensityRange, b: IntensityRange): IntensityRange | null {
  const min = Math.max(a.min, b.min) as IntensityLevel;
  const max = Math.min(a.max, b.max) as IntensityLevel;
  return min <= max ? { min, max } : null;
}
