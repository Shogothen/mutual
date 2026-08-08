import { describe, expect, it } from "vitest";
import { computeMatch } from "../engine";
import type { Answer } from "../types";

const base = (over: Partial<Answer> = {}): Answer => ({
  interest: "would_try",
  role: "not_relevant",
  intensityMin: 1,
  intensityMax: 3,
  timing: "open",
  conditions: [],
  ...over
});

describe("computeMatch", () => {
  it("produces a clear match for would_try + would_try", () => {
    const result = computeMatch(base(), base(), { roleModel: "symmetric" });
    expect(result).toMatchObject({ matched: true, matchType: "clear_match" });
  });

  it("produces a strong match for already_like + already_like", () => {
    const result = computeMatch(
      base({ interest: "already_like" }),
      base({ interest: "already_like" }),
      { roleModel: "symmetric" }
    );
    expect(result).toMatchObject({ matched: true, matchType: "strong_match" });
  });

  it("a hard no on either side blocks everything", () => {
    expect(
      computeMatch(base({ interest: "no" }), base({ interest: "already_like" }), {
        roleModel: "symmetric"
      })
    ).toEqual({ matched: false, reason: "hard_no" });
  });

  it("incompatible roles block a directional card", () => {
    const result = computeMatch(
      base({ role: "initiating" }),
      base({ role: "initiating" }),
      { roleModel: "directional" }
    );
    expect(result).toEqual({ matched: false, reason: "role" });
  });

  it("disjoint intensity ranges block a match", () => {
    const result = computeMatch(
      base({ intensityMin: 1, intensityMax: 2 }),
      base({ intensityMin: 4, intensityMax: 5 }),
      { roleModel: "symmetric" }
    );
    expect(result).toEqual({ matched: false, reason: "intensity" });
  });

  it("carries the intensity overlap into the match", () => {
    const result = computeMatch(
      base({ intensityMin: 1, intensityMax: 4 }),
      base({ intensityMin: 3, intensityMax: 5 }),
      { roleModel: "symmetric" }
    );
    expect(result).toMatchObject({ matched: true, intensityMin: 3, intensityMax: 4 });
  });

  it("flags talkFirst when either person prefers a conversation first", () => {
    const result = computeMatch(base({ timing: "talk_first" }), base(), {
      roleModel: "symmetric"
    });
    expect(result).toMatchObject({ matched: true, talkFirst: true });
  });

  it("flags conditions without ever exposing them", () => {
    const result = computeMatch(
      base({ interest: "maybe_with_conditions", conditions: ["slow", "stop_signal"] }),
      base(),
      { roleModel: "symmetric" }
    );
    expect(result).toMatchObject({ matched: true, hasConditions: true });
    // The result object must not contain the condition slugs themselves.
    expect(JSON.stringify(result)).not.toContain("stop_signal");
  });

  it("fantasy + would_try yields conversation value, never an action proposal", () => {
    const result = computeMatch(base({ interest: "fantasy_only" }), base(), {
      roleModel: "symmetric"
    });
    expect(result).toMatchObject({ matched: true, matchType: "conversation_value" });
  });

  it("keeps the score in 0..100 and never exposes a percentage semantic", () => {
    const result = computeMatch(base(), base(), { roleModel: "symmetric" });
    if (result.matched) {
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    }
  });
});
