import { supabase } from "@/lib/supabase/client";
import type { ConnectionState } from "@/types/api";

export type InviteResult = { couple_id: string; invite_code: string; expires_at: string };

export async function createCoupleWithInvite(expiryHours: number): Promise<InviteResult> {
  const { data, error } = await supabase().rpc("create_couple_with_invite", {
    p_expiry_hours: expiryHours
  });
  if (error) throw new Error(mapPairingError(error.message));
  return data as InviteResult;
}

export async function redeemInvite(code: string): Promise<{ couple_id: string }> {
  const { data, error } = await supabase().rpc("redeem_invite", { p_code: code.trim().toLowerCase() });
  if (error) throw new Error(mapPairingError(error.message));
  return data as { couple_id: string };
}

export async function getConnection(): Promise<ConnectionState> {
  const { data, error } = await supabase().rpc("get_my_connection");
  if (error) throw new Error("Verbindungsstatus konnte nicht geladen werden.");
  return data as ConnectionState;
}

export async function getPartnerActivity(): Promise<{ partner_active_today: boolean }> {
  const { data, error } = await supabase().rpc("get_partner_activity");
  if (error) return { partner_active_today: false };
  return data as { partner_active_today: boolean };
}

/** Discreet error copy – no information leakage (§6, §36). */
function mapPairingError(raw: string): string {
  if (raw.includes("too_many_attempts"))
    return "Zu viele Versuche. Bitte warte einen Moment und versuch es dann erneut.";
  if (raw.includes("already_connected"))
    return "Du bist bereits verbunden. Löse die bestehende Verbindung zuerst.";
  return "Dieser Code ist nicht mehr gültig.";
}
