import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Only the public anon key lives in the frontend. All data access is guarded
 * by RLS; matching runs in SECURITY DEFINER functions (docs/SECURITY.md).
 * The service_role key must never appear anywhere in this repository.
 */

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase ist nicht konfiguriert. Bitte .env anhand von .env.example anlegen."
    );
  }
  client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}
