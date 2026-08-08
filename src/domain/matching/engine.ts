import { resolveInterest } from "./interest";
import { intensityOverlap, normalizeRange } from "./intensity";
import { rolesCompatible } from "./roles";
import { computeScore } from "./score";
import { needsTalkFirst } from "./timing";
import type { Answer, CardMatchingContext, MatchOutcome } from "./types";

/**
 * Pure matching function. The authoritative instance of these rules runs
 * server-side (supabase/migrations/0002_matching.sql). This TypeScript
 * implementation exists so the exact same business rules can be unit-tested
 * and reused in the demo mode. Both implementations are covered by the same
 * test fixtures (src/domain/matching/__tests__).
 *
 * Guarantees:
 * - A "no" or "not_now" on either side never produces a match and never
 *   leaks why (the NoMatch reason stays server-side / in-process).
 * - Matches only carry data both people are allowed to see.
 */
export function computeMatch(a: Answer, b: Answer, card: CardMatchingContext): MatchOutcome {
  const interest = resolveInterest(a.interest, b.interest);
  if (!interest.compatible) return { matched: false, reason: interest.reason };

  if (!rolesCompatible(card.roleModel, a.role, b.role)) {
    return { matched: false, reason: "role" };
  }

  const overlap = intensityOverlap(
    normalizeRange(a.intensityMin, a.intensityMax),
    normalizeRange(b.intensityMin, b.intensityMax)
  );
  if (!overlap) return { matched: false, reason: "intensity" };

  const talkFirst = needsTalkFirst(a.timing, b.timing);
  const hasConditions = a.conditions.length > 0 || b.conditions.length > 0;

  return {
    matched: true,
    matchType: interest.matchType,
    score: computeScore(interest.matchType, overlap, talkFirst, hasConditions),
    intensityMin: overlap.min,
    intensityMax: overlap.max,
    talkFirst,
    hasConditions
  };
}
