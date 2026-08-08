import { supabase } from "@/lib/supabase/client";
import type { DiscoveryCardRow } from "@/types/api";

export async function fetchDiscoveryCards(): Promise<DiscoveryCardRow[]> {
  const { data, error } = await supabase().rpc("fn_get_discovery_cards");
  if (error) throw new Error("Karten konnten gerade nicht geladen werden.");
  return (data ?? []) as DiscoveryCardRow[];
}

export async function fetchAnsweredIds(): Promise<Set<string>> {
  const { data, error } = await supabase().from("answer_submissions").select("question_id");
  if (error) return new Set();
  return new Set((data ?? []).map((r) => r.question_id as string));
}
