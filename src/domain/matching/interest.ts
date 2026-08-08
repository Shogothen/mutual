import type { InterestLevel, MatchType } from "./types";

/**
 * Business rules for interest compatibility (docs/MATCHING_ENGINE.md, §12 spec):
 *
 *  1. "no" never produces a match – for either side, regardless of the other answer.
 *  2. "not_now" never produces an actionable match.
 *  3. fantasy + fantasy        -> shared_fantasy (a conversation about the fantasy,
 *                                 never a proposal to act on it)
 *  4. fantasy + would_try      -> conversation_value (talk prompt only)
 *  5. fantasy + maybe          -> conversation_value
 *  6. fantasy + already_like   -> conversation_value
 *  7. maybe + maybe            -> careful_curiosity
 *  8. maybe + would_try        -> careful_curiosity
 *  9. maybe + already_like     -> careful_curiosity
 * 10. would_try + would_try    -> clear_match
 * 11. would_try + already_like -> clear_match
 * 12. already_like + already_like -> strong_match
 *
 * The table is symmetric by construction: resolve(a, b) === resolve(b, a).
 */

type Positive = Exclude<InterestLevel, "no" | "not_now">;

const INTEREST_MATRIX: Record<Positive, Record<Positive, MatchType>> = {
  fantasy_only: {
    fantasy_only: "shared_fantasy",
    maybe_with_conditions: "conversation_value",
    would_try: "conversation_value",
    already_like: "conversation_value"
  },
  maybe_with_conditions: {
    fantasy_only: "conversation_value",
    maybe_with_conditions: "careful_curiosity",
    would_try: "careful_curiosity",
    already_like: "careful_curiosity"
  },
  would_try: {
    fantasy_only: "conversation_value",
    maybe_with_conditions: "careful_curiosity",
    would_try: "clear_match",
    already_like: "clear_match"
  },
  already_like: {
    fantasy_only: "conversation_value",
    maybe_with_conditions: "careful_curiosity",
    would_try: "clear_match",
    already_like: "strong_match"
  }
};

export type InterestOutcome =
  | { compatible: true; matchType: MatchType }
  | { compatible: false; reason: "hard_no" | "deferred" };

export function resolveInterest(a: InterestLevel, b: InterestLevel): InterestOutcome {
  if (a === "no" || b === "no") return { compatible: false, reason: "hard_no" };
  if (a === "not_now" || b === "not_now") return { compatible: false, reason: "deferred" };
  return { compatible: true, matchType: INTEREST_MATRIX[a][b] };
}
