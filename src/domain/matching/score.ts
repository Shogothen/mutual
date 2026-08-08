import type { IntensityRange } from "./intensity";
import type { MatchType } from "./types";

/**
 * Internal compatibility score. Used only to sort content – never shown to
 * users as a percentage or a performance value (§12 spec).
 */
const BASE: Record<MatchType, number> = {
  shared_fantasy: 30,
  conversation_value: 35,
  careful_curiosity: 55,
  clear_match: 80,
  strong_match: 95
};

export function computeScore(
  matchType: MatchType,
  overlap: IntensityRange,
  talkFirst: boolean,
  hasConditions: boolean
): number {
  const overlapWidth = overlap.max - overlap.min; // 0..4
  let score = BASE[matchType] + overlapWidth;
  if (talkFirst) score -= 2;
  if (hasConditions) score -= 1;
  return Math.max(0, Math.min(100, score));
}
