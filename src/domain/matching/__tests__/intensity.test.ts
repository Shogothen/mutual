import { describe, expect, it } from "vitest";
import { intensityOverlap, normalizeRange } from "../intensity";

describe("intensityOverlap", () => {
  it("returns the intersection of overlapping ranges", () => {
    expect(intensityOverlap({ min: 1, max: 3 }, { min: 2, max: 5 })).toEqual({ min: 2, max: 3 });
  });
  it("returns null for disjoint ranges", () => {
    expect(intensityOverlap({ min: 1, max: 2 }, { min: 4, max: 5 })).toBeNull();
  });
  it("handles identical single-point ranges", () => {
    expect(intensityOverlap({ min: 3, max: 3 }, { min: 3, max: 3 })).toEqual({ min: 3, max: 3 });
  });
  it("normalizes inverted input", () => {
    expect(normalizeRange(4, 2)).toEqual({ min: 2, max: 4 });
  });
});
