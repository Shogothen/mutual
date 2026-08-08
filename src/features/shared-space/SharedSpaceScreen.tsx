import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { fetchMatches } from "@/features/resonance/api";
import { fetchDiscoveryCards } from "@/features/discovery/api";
import { getConnection } from "@/features/pairing/api";
import { MATCH_TYPE_LABELS } from "@/features/resonance/MatchReveal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "@/features/auth/useSession";

type Boundary = {
  id: string;
  boundary_text: string;
  status: "proposed" | "confirmed" | "declined" | "amended";
  proposed_by: string;
};

/**
 * "Gemeinsam": confirmed matches, boundaries with double confirmation
 * (silence never counts as agreement, §16), simple shared plans.
 */
export function SharedSpaceScreen() {
  const { session } = useSession();
  const matches = useQuery({ queryKey: ["matches"], queryFn: fetchMatches });
  const cards = useQuery({ queryKey: ["discovery-cards"], queryFn: fetchDiscoveryCards });
  const connection = useQuery({ queryKey: ["connection"], queryFn: getConnection });
  const [openMatch, setOpenMatch] = useState<string | null>(null);

  const active = (matches.data ?? []).filter((m) =>
    ["reconfirmed", "talking", "boundaries_aligned", "planned", "experienced", "debriefed"].includes(m.status)
  );
  const titleOf = (qid: string) => cards.data?.find((c) => c.id === qid)?.title ?? "Gemeinsames Thema";

  if (matches.isSuccess && active.length === 0) {
    return (
      <EmptyState title="Hier liegt noch nichts Gemeinsames.">
        Sobald ihr beide bei einem Match sprechen möchtet, öffnet sich hier euer gemeinsamer Bereich.
      </EmptyState>
    );
  }

  const coupleId = connection.data?.connected ? connection.data.couple_id : null;

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <header>
        <h1 className="font-display text-xl text-pearl">Gemeinsam</h1>
        <p className="mt-1 text-sm text-mist">
          Bestätigte Matches, Grenzen und Ideen – in eurem Tempo.
        </p>
      </header>
      {active.map((m) => (
        <Card key={m.id}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-lavender">{MATCH_TYPE_LABELS[m.match_type]}</p>
              <p className="text-lg text-pearl">{titleOf(m.question_id)}</p>
            </div>
            <Button variant="secondary" onClick={() => setOpenMatch(openMatch === m.id ? null : m.id)}>
              {openMatch === m.id ? "Schließen" : "Öffnen"}
            </Button>
          </div>
          {openMatch === m.id && coupleId && session ? (
            <BoundarySection matchId={m.id} coupleId={coupleId} userId={session.user.id} />
          ) : null}
        </Card>
      ))}
    </div>
  );
}

function BoundarySection({ matchId, coupleId, userId }: { matchId: string; coupleId: string; userId: string }) {
  const queryClient = useQueryClient();
  const toast = useToast((s) => s.show);
  const [text, setText] = useState("");

  const boundaries = useQuery({
    queryKey: ["boundaries", matchId],
    queryFn: async () => {
      const { data, error } = await supabase()
        .from("shared_boundaries")
        .select("id, boundary_text, status, proposed_by")
        .eq("match_id", matchId)
        .order("created_at");
      if (error) throw new Error("Grenzen konnten nicht geladen werden.");
      return (data ?? []) as Boundary[];
    }
  });

  const propose = useMutation({
    mutationFn: async () => {
      const { error } = await supabase().from("shared_boundaries").insert({
        match_id: matchId,
        couple_id: coupleId,
        proposed_by: userId,
        boundary_text: text.trim()
      });
      if (error) throw new Error("Die Grenze konnte nicht gespeichert werden.");
    },
    onSuccess: () => {
      setText("");
      void queryClient.invalidateQueries({ queryKey: ["boundaries", matchId] });
    },
    onError: (e: Error) => toast(e.message)
  });

  const respond = useMutation({
    mutationFn: async (input: { id: string; status: "confirmed" | "declined" }) => {
      const { error } = await supabase()
        .from("shared_boundaries")
        .update({ status: input.status, responded_by: userId })
        .eq("id", input.id);
      if (error) throw new Error("Die Antwort konnte nicht gespeichert werden.");
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["boundaries", matchId] }),
    onError: (e: Error) => toast(e.message)
  });

  return (
    <div className="mt-5 border-t border-veil/50 pt-4">
      <h3 className="text-sm font-medium text-pearl">Gemeinsame Grenzen</h3>
      <p className="mt-1 text-xs text-mist">
        Eine Grenze gilt erst, wenn die andere Person sie ausdrücklich bestätigt hat.
        Schweigen bedeutet niemals Zustimmung.
      </p>
      <ul className="mt-3 space-y-2">
        {(boundaries.data ?? []).map((b) => (
          <li key={b.id} className="rounded-lg border border-veil/60 bg-abyss/50 p-3 text-sm">
            <p className="text-pearl/90">{b.boundary_text}</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs text-mist">
                {b.status === "proposed" ? "Vorgeschlagen – noch nicht bestätigt" :
                 b.status === "confirmed" ? "Von euch beiden bestätigt" :
                 b.status === "declined" ? "Abgelehnt" : "Angepasst"}
              </span>
              {b.status === "proposed" && b.proposed_by !== userId ? (
                <span className="flex gap-2">
                  <Button variant="secondary" onClick={() => respond.mutate({ id: b.id, status: "confirmed" })}>
                    Bestätigen
                  </Button>
                  <Button variant="ghost" onClick={() => respond.mutate({ id: b.id, status: "declined" })}>
                    Ablehnen
                  </Button>
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim().length > 0) propose.mutate();
        }}
      >
        <label htmlFor={`b-${matchId}`} className="sr-only">Neue Grenze vorschlagen</label>
        <input
          id={`b-${matchId}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={280}
          placeholder="Eine Grenze vorschlagen …"
          className="min-h-touch flex-1 rounded-pill border border-veil bg-void/50 px-4 text-sm text-pearl placeholder:text-mist"
        />
        <Button type="submit" variant="secondary" loading={propose.isPending} disabled={text.trim().length === 0}>
          Vorschlagen
        </Button>
      </form>
    </div>
  );
}
