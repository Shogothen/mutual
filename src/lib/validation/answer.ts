import { z } from "zod";

export const interestLevelSchema = z.enum([
  "no",
  "not_now",
  "fantasy_only",
  "maybe_with_conditions",
  "would_try",
  "already_like"
]);

export const rolePreferenceSchema = z.enum([
  "initiating",
  "receiving",
  "observing",
  "switching",
  "both",
  "not_relevant"
]);

export const timingSchema = z.enum(["open", "soon", "someday", "talk_first"]);

export const intensitySchema = z.number().int().min(1).max(5);

export const answerSubmissionSchema = z
  .object({
    questionId: z.string().uuid(),
    interest: interestLevelSchema,
    role: rolePreferenceSchema,
    intensityMin: intensitySchema,
    intensityMax: intensitySchema,
    timing: timingSchema,
    conditions: z.array(z.string().max(64)).max(10),
    answerVersion: z.number().int().min(1)
  })
  .refine((v) => v.intensityMin <= v.intensityMax, {
    message: "Der Intensitätsbereich ist ungültig."
  });

export type AnswerSubmission = z.infer<typeof answerSubmissionSchema>;

/** Custom wish free text: length-limited, no HTML, server re-validates. */
export const wishTextSchema = z
  .string()
  .trim()
  .max(280)
  .refine((v) => !/[<>]/.test(v), { message: "Bitte ohne HTML-Zeichen formulieren." });
