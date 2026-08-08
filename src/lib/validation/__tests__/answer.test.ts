import { describe, expect, it } from "vitest";
import { answerSubmissionSchema, wishTextSchema } from "../answer";

describe("answerSubmissionSchema", () => {
  const valid = {
    questionId: "123e4567-e89b-42d3-a456-426614174000",
    interest: "would_try",
    role: "not_relevant",
    intensityMin: 1,
    intensityMax: 3,
    timing: "open",
    conditions: [],
    answerVersion: 1
  };

  it("accepts a valid submission", () => {
    expect(answerSubmissionSchema.parse(valid)).toBeTruthy();
  });

  it("rejects inverted intensity ranges", () => {
    expect(() =>
      answerSubmissionSchema.parse({ ...valid, intensityMin: 4, intensityMax: 2 })
    ).toThrow();
  });

  it("rejects unknown interest values", () => {
    expect(() => answerSubmissionSchema.parse({ ...valid, interest: "yes" })).toThrow();
  });

  it("rejects non-uuid question ids", () => {
    expect(() => answerSubmissionSchema.parse({ ...valid, questionId: "1; drop table" })).toThrow();
  });
});

describe("wishTextSchema", () => {
  it("rejects HTML angle brackets", () => {
    expect(() => wishTextSchema.parse("<script>alert(1)</script>")).toThrow();
  });
  it("rejects overlong text", () => {
    expect(() => wishTextSchema.parse("a".repeat(300))).toThrow();
  });
  it("accepts normal German text", () => {
    expect(wishTextSchema.parse("Ein ruhiger Abend nur für uns.")).toBeTruthy();
  });
});
