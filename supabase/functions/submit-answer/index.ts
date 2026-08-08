// MUTUAL – Edge Function wrapper around the authoritative submit_answer RPC.
// Deploy: supabase functions deploy submit-answer
// The frontend calls the RPC directly by default; this HTTP wrapper exists for
// clients that prefer a function endpoint and adds strict input parsing.
//
// It runs with the CALLER's JWT (no service role), so RLS and function
// grants apply exactly as for the direct RPC.

import { createClient } from "npm:@supabase/supabase-js@2.47.10";

type Payload = {
  questionId: string;
  interest: string;
  role?: string;
  intensityMin?: number;
  intensityMax?: number;
  timing?: string;
  conditions?: string[];
  answerVersion?: number;
};

const INTERESTS = new Set([
  "no", "not_now", "fantasy_only", "maybe_with_conditions",
  "would_try", "already_like", "skipped", "hidden"
]);

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405 });
  }
  const auth = req.headers.get("Authorization") ?? "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: auth } } }
  );

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400 });
  }
  if (!body.questionId || !INTERESTS.has(body.interest)) {
    return new Response(JSON.stringify({ error: "invalid_input" }), { status: 400 });
  }

  const { data, error } = await supabase.rpc("submit_answer", {
    p_question_id: body.questionId,
    p_interest: body.interest,
    p_role: body.role ?? "not_relevant",
    p_intensity_min: body.intensityMin ?? 1,
    p_intensity_max: body.intensityMax ?? 5,
    p_timing: body.timing ?? "open",
    p_conditions: body.conditions ?? [],
    p_answer_version: body.answerVersion ?? 1
  });

  if (error) {
    // Generic error only – no detail that could leak partner state.
    console.error("submit_answer failed", error.code);
    return new Response(JSON.stringify({ error: "not_recorded" }), { status: 400 });
  }
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});
