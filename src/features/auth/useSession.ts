import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

/**
 * Anonymous-first auth: on first open an anonymous Supabase account is
 * created automatically (§7). No email required, ever, for basic use.
 */
export function useSession(): { session: Session | null; ready: boolean; offline: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setOffline(true);
      setReady(true);
      return;
    }
    const client = supabase();
    let cancelled = false;

    client.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      if (data.session) {
        setSession(data.session);
        setReady(true);
        return;
      }
      const { data: anon, error } = await client.auth.signInAnonymously();
      if (cancelled) return;
      if (error) setOffline(true);
      else setSession(anon.session);
      setReady(true);
    });

    const { data: sub } = client.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, ready, offline };
}
