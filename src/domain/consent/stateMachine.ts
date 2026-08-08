/**
 * Consent state machine for a match (§15 spec).
 *
 * A match is never consent. Every forward step needs an explicit action;
 * silence never advances the state. Both people can pause, archive or
 * withdraw at any time without giving a reason.
 */

export type MatchStatus =
  | "discovered"
  | "reconfirmed"
  | "talking"
  | "boundaries_aligned"
  | "planned"
  | "experienced"
  | "debriefed"
  | "paused"
  | "archived"
  | "withdrawn";

export type PrivateConfirmation =
  | "wants_to_talk"
  | "keep_as_fantasy"
  | "unsure"
  | "not_current"
  | "hide";

/** Transitions that require an explicit user action. */
const TRANSITIONS: Record<MatchStatus, readonly MatchStatus[]> = {
  discovered: ["reconfirmed", "paused", "archived", "withdrawn"],
  reconfirmed: ["talking", "paused", "archived", "withdrawn"],
  talking: ["boundaries_aligned", "paused", "archived", "withdrawn"],
  boundaries_aligned: ["planned", "talking", "paused", "archived", "withdrawn"],
  planned: ["experienced", "talking", "paused", "archived", "withdrawn"],
  experienced: ["debriefed", "paused", "archived", "withdrawn"],
  debriefed: ["talking", "planned", "paused", "archived", "withdrawn"],
  paused: ["discovered", "reconfirmed", "talking", "archived", "withdrawn"],
  archived: ["discovered", "withdrawn"],
  withdrawn: []
};

export function canTransition(from: MatchStatus, to: MatchStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/**
 * The shared conversation space only opens when *both* people privately chose
 * "wants_to_talk". Any other combination keeps the space closed – and neither
 * person learns what the other chose.
 */
export function sharedSpaceUnlocked(a: PrivateConfirmation | null, b: PrivateConfirmation | null): boolean {
  return a === "wants_to_talk" && b === "wants_to_talk";
}

/** A withdrawn match can never be reopened; a new discovery cycle is required. */
export function isTerminal(status: MatchStatus): boolean {
  return status === "withdrawn";
}
