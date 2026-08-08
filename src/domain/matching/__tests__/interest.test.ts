import { describe, expect, it } from "vitest";
import { resolveInterest } from "../interest";
import { INTEREST_LEVELS, type InterestLevel } from "../types";

describe("resolveInterest", () => {
  it("never matches when either side says no", () => {
    for (const other of INTEREST_LEVELS) {
      expect(resolveInterest("no", other)).toEqual({ compatible: false, reason: "hard_no" });
      expect(resolveInterest(other, "no")).toEqual({ compatible: false, reason: "hard_no" });
    }
  });

  it("never produces an actionable match for not_now", () => {
    const positives: InterestLevel[] = [
      "not_now",
      "fantasy_only",
      "maybe_with_conditions",
      "would_try",
      "already_like"
    ];
    for (const other of positives) {
      expect(resolveInterest("not_now", other).compatible).toBe(false);
      expect(resolveInterest(other, "not_now").compatible).toBe(false);
    }
  });

  it.each([
    ["fantasy_only", "fantasy_only", "shared_fantasy"],
    ["fantasy_only", "would_try", "conversation_value"],
    ["fantasy_only", "maybe_with_conditions", "conversation_value"],
    ["fantasy_only", "already_like", "conversation_value"],
    ["maybe_with_conditions", "maybe_with_conditions", "careful_curiosity"],
    ["maybe_with_conditions", "would_try", "careful_curiosity"],
    ["maybe_with_conditions", "already_like", "careful_curiosity"],
    ["would_try", "would_try", "clear_match"],
    ["would_try", "already_like", "clear_match"],
    ["already_like", "already_like", "strong_match"]
  ] as const)("%s + %s -> %s", (a, b, expected) => {
    expect(resolveInterest(a, b)).toEqual({ compatible: true, matchType: expected });
    expect(resolveInterest(b, a)).toEqual({ compatible: true, matchType: expected });
  });

  it("is symmetric for every combination", () => {
    for (const a of INTEREST_LEVELS) {
      for (const b of INTEREST_LEVELS) {
        expect(resolveInterest(a, b)).toEqual(resolveInterest(b, a));
      }
    }
  });
});
