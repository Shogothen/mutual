import { describe, expect, it } from "vitest";
import { rolesCompatible } from "../roles";
import type { RolePreference } from "../../questions/types";

const ALL: RolePreference[] = [
  "initiating",
  "receiving",
  "observing",
  "switching",
  "both",
  "not_relevant"
];

describe("rolesCompatible", () => {
  it("symmetric and not_relevant cards ignore roles", () => {
    for (const a of ALL)
      for (const b of ALL) {
        expect(rolesCompatible("symmetric", a, b)).toBe(true);
        expect(rolesCompatible("not_relevant", a, b)).toBe(true);
      }
  });

  describe("directional cards", () => {
    it("initiating + receiving works in both directions", () => {
      expect(rolesCompatible("directional", "initiating", "receiving")).toBe(true);
      expect(rolesCompatible("directional", "receiving", "initiating")).toBe(true);
    });
    it("two people who only initiate are not a functional match", () => {
      expect(rolesCompatible("directional", "initiating", "initiating")).toBe(false);
    });
    it("two people who only receive are not a functional match", () => {
      expect(rolesCompatible("directional", "receiving", "receiving")).toBe(false);
    });
    it("switching and both can fill either side", () => {
      for (const flex of ["switching", "both"] as const) {
        expect(rolesCompatible("directional", flex, "initiating")).toBe(true);
        expect(rolesCompatible("directional", flex, "receiving")).toBe(true);
        expect(rolesCompatible("directional", flex, flex)).toBe(true);
      }
      expect(rolesCompatible("directional", "switching", "both")).toBe(true);
    });
  });

  describe("observer cards", () => {
    it("observing + receiving (being seen) works", () => {
      expect(rolesCompatible("observer", "observing", "receiving")).toBe(true);
      expect(rolesCompatible("observer", "receiving", "observing")).toBe(true);
    });
    it("two observers do not match", () => {
      expect(rolesCompatible("observer", "observing", "observing")).toBe(false);
    });
    it("flexible roles can fill either side", () => {
      expect(rolesCompatible("observer", "both", "observing")).toBe(true);
      expect(rolesCompatible("observer", "switching", "receiving")).toBe(true);
    });
  });

  describe("switchable cards", () => {
    it("rejects two rigid identical directions", () => {
      expect(rolesCompatible("switchable", "initiating", "initiating")).toBe(false);
      expect(rolesCompatible("switchable", "receiving", "receiving")).toBe(false);
    });
    it("accepts everything else", () => {
      expect(rolesCompatible("switchable", "initiating", "receiving")).toBe(true);
      expect(rolesCompatible("switchable", "switching", "switching")).toBe(true);
      expect(rolesCompatible("switchable", "both", "both")).toBe(true);
    });
  });
});
