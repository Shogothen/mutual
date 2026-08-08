import { supabase } from "@/lib/supabase/client";
import type { MatchRow } from "@/types/api";
import type { MatchStatus, PrivateConfirmation } from "@/domain/consent/stateMachine";
import { canTransition } from "@/domain/consent/stateMachine";

export async function fetchMatches(): Promise<MatchRow[]> {
  const { data, error } = await supabase()
    .from("match_results")
    .select("*")
    .order("score", { ascending: false });
  if (error) throw new Error("Eure Resonanz konnte gerade nicht geladen werden.");
  return (data ?? []) as MatchRow[];
}

export async function updateMatchStatus(match: MatchRow, next: MatchStatus): Promise<void> {
  if (!canTransition(match.status, next)) {
    throw new Error("Dieser Schritt ist gerade nicht möglich.");
  }
  const { error } = await supabase()
    .from("match_results")
    .update({ status: next })
    .eq("id", match.id);
  if (error) throw new Error("Die Änderung konnte nicht gespeichert werden.");
}

/** Private reconfirmation – the partner never sees this choice (§15). */
export async function setPrivateConfirmation(
  matchId: string,
  userId: string,
  confirmation: PrivateConfirmation
): Promise<void> {
  const { error } = await supabase()
    .from("match_confirmations")
    .upsert({ match_id: matchId, user_id: userId, confirmation }, { onConflict: "match_id,user_id" });
  if (error) throw new Error("Deine Auswahl konnte nicht gespeichert werden.");
}

export async function getOwnConfirmation(matchId: string): Promise<PrivateConfirmation | null> {
  const { data } = await supabase()
    .from("match_confirmations")
    .select("confirmation")
    .eq("match_id", matchId)
    .maybeSingle();
  return (data?.confirmation as PrivateConfirmation | undefined) ?? null;
}

/** Neutral realtime subscription: signals "something new", nothing more (§30). */
export function subscribeToMatches(coupleId: string, onNew: () => void): () => void {
  const channel = supabase()
    .channel(`matches-${coupleId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "match_results", filter: `couple_id=eq.${coupleId}` },
      () => onNew()
    )
    .subscribe();
  return () => {
    void supabase().removeChannel(channel);
  };
}
