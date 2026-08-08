import type { IntensityLevel, RoleModel, RolePreference } from "../questions/types";

/** How a person answered a discovery card. */
export type InterestLevel =
  | "no"
  | "not_now"
  | "fantasy_only"
  | "maybe_with_conditions"
  | "would_try"
  | "already_like";

export const INTEREST_LEVELS: readonly InterestLevel[] = [
  "no",
  "not_now",
  "fantasy_only",
  "maybe_with_conditions",
  "would_try",
  "already_like"
] as const;

export type TimingPreference = "open" | "soon" | "someday" | "talk_first";

export type Answer = {
  interest: InterestLevel;
  role: RolePreference;
  intensityMin: IntensityLevel;
  intensityMax: IntensityLevel;
  timing: TimingPreference;
  /** Private condition slugs. Never shared verbatim with the partner. */
  conditions: string[];
};

/**
 * Match types, ordered by commitment. None of them ever mean consent to act –
 * they are invitations to talk (docs/MATCHING_ENGINE.md).
 */
export type MatchType =
  | "shared_fantasy"
  | "conversation_value"
  | "careful_curiosity"
  | "clear_match"
  | "strong_match";

export type MatchResult = {
  matched: true;
  matchType: MatchType;
  /** Internal sorting score. Never shown as a percentage or performance value. */
  score: number;
  /** Overlapping intensity range both people are comfortable with. */
  intensityMin: IntensityLevel;
  intensityMax: IntensityLevel;
  /** True when at least one person wants to talk before anything else. */
  talkFirst: boolean;
  /** True when at least one person attached private conditions. */
  hasConditions: boolean;
};

export type NoMatch = {
  matched: false;
  /** Internal only. Never surfaced to either client (information leak). */
  reason: "interest" | "role" | "intensity" | "hard_no" | "deferred";
};

export type MatchOutcome = MatchResult | NoMatch;

export type CardMatchingContext = {
  roleModel: RoleModel;
};
