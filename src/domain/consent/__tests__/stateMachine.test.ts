import { describe, expect, it } from "vitest";
import { canTransition, isTerminal, sharedSpaceUnlocked } from "../stateMachine";

describe("consent state machine", () => {
  it("follows the happy path only through explicit steps", () => {
    expect(canTransition("discovered", "reconfirmed")).toBe(true);
    expect(canTransition("reconfirmed", "talking")).toBe(true);
    expect(canTransition("talking", "boundaries_aligned")).toBe(true);
    expect(canTransition("boundaries_aligned", "planned")).toBe(true);
    expect(canTransition("planned", "experienced")).toBe(true);
    expect(canTransition("experienced", "debriefed")).toBe(true);
  });

  it("never skips consent steps", () => {
    expect(canTransition("discovered", "talking")).toBe(false);
    expect(canTransition("discovered", "planned")).toBe(false);
    expect(canTransition("reconfirmed", "planned")).toBe(false);
    expect(canTransition("talking", "experienced")).toBe(false);
  });

  it("allows pausing and withdrawing from every non-terminal state", () => {
    for (const s of [
      "discovered",
      "reconfirmed",
      "talking",
      "boundaries_aligned",
      "planned",
      "experienced",
      "debriefed"
    ] as const) {
      expect(canTransition(s, "paused")).toBe(true);
      expect(canTransition(s, "withdrawn")).toBe(true);
    }
  });

  it("withdrawn is terminal", () => {
    expect(isTerminal("withdrawn")).toBe(true);
    expect(canTransition("withdrawn", "discovered")).toBe(false);
  });

  it("only unlocks the shared space when both privately chose to talk", () => {
    expect(sharedSpaceUnlocked("wants_to_talk", "wants_to_talk")).toBe(true);
    expect(sharedSpaceUnlocked("wants_to_talk", "unsure")).toBe(false);
    expect(sharedSpaceUnlocked("wants_to_talk", null)).toBe(false);
    expect(sharedSpaceUnlocked("keep_as_fantasy", "keep_as_fantasy")).toBe(false);
  });
});
