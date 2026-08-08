import { supabase } from "@/lib/supabase/client";
import { queueAnswer, readQueuedAnswers, removeQueuedAnswer } from "@/lib/storage/db";
import { answerSubmissionSchema, type AnswerSubmission } from "@/lib/validation/answer";

/**
 * Submits the OWN answer only. The server stores it, runs the authoritative
 * matching, and always responds with {status:'recorded'} – the response never
 * reveals whether or how the partner answered (§29).
 *
 * Offline: answers are AES-GCM-encrypted and queued in IndexedDB, then
 * flushed on reconnect (§26).
 */
export async function submitAnswer(input: AnswerSubmission): Promise<void> {
  const parsed = answerSubmissionSchema.parse(input);
  try {
    const { error } = await supabase().rpc("submit_answer", {
      p_question_id: parsed.questionId,
      p_interest: parsed.interest,
      p_role: parsed.role,
      p_intensity_min: parsed.intensityMin,
      p_intensity_max: parsed.intensityMax,
      p_timing: parsed.timing,
      p_conditions: parsed.conditions,
      p_answer_version: parsed.answerVersion
    });
    if (error) throw error;
  } catch {
    await queueAnswer(parsed.questionId, {
      questionId: parsed.questionId,
      answer: parsed,
      answerVersion: parsed.answerVersion,
      queuedAt: new Date().toISOString()
    });
    throw new Error(
      "Deine Antwort konnte gerade nicht sicher gespeichert werden. Sie bleibt verschlüsselt auf diesem Gerät und wird später erneut übertragen."
    );
  }
}

/** Flush the encrypted offline queue. Conflicts resolve via answer_version. */
export async function flushQueuedAnswers(): Promise<number> {
  const queued = await readQueuedAnswers();
  let flushed = 0;
  for (const item of queued) {
    try {
      await submitAnswer(item.answer as AnswerSubmission);
      await removeQueuedAnswer(item.questionId);
      flushed += 1;
    } catch {
      break; // still offline – keep the rest queued
    }
  }
  return flushed;
}
