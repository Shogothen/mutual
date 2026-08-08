import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/features/auth/useSession";
import { getConnection } from "@/features/pairing/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useToast } from "@/components/ui/Toast";

type Answer = "yes" | "partly" | "no";

/**
 * Emotional check-in (§20): questions are answered PRIVATELY. Nothing is
 * shared unless the person explicitly chooses to share a summary. If an
 * answer signals discomfort, the app offers options – it NEVER auto-messages
 * the partner and never pressures.
 */
export function CheckInScreen() {
  const { session } = useSession();
  const connection = useQuery({ queryKey: ["connection"], queryFn: getConnection });
  const toast = useToast((s) => s.show);

  const [comfortable, setComfortable] = useState<Answer>("yes");
  const [respected, setRespected] = useState<Answer>("yes");
  const [pace, setPace] = useState<Answer>("yes");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const uncomfortable = comfortable === "no" || respected === "no";

  const save = useMutation({
    mutationFn: async (share: boolean) => {
      const coupleId = connection.data?.connected ? connection.data.couple_id : null;
      if (!coupleId || !session) throw new Error("Keine aktive Verbindung.");
      const { data, error } = await supabase()
        .from("check_ins")
        .insert({
          couple_id: coupleId,
          user_id: session.user.id,
          felt_comfortable: comfortable,
          felt_respected: respected,
          pace_ok: pace,
          private_note: note.trim() || null
        })
        .select("id")
        .single();
      if (error) throw new Error("Der Check-in konnte nicht gespeichert werden.");
      if (share) {
        const { error: shareError } = await supabase().from("check_in_shares").insert({
          check_in_id: data.id,
          couple_id: coupleId,
          shared_by: session.user.id,
          summary:
            "Ich habe einen Check-in gemacht und möchte gern in Ruhe mit dir darüber sprechen."
        });
        if (shareError) throw new Error("Das Teilen hat nicht geklappt.");
      }
    },
    onSuccess: (_d, share) => {
      setSaved(true);
      toast(share ? "Gespeichert und als Gesprächswunsch geteilt." : "Privat gespeichert. Nur du siehst deine Antworten.");
    },
    onError: (e: Error) => toast(e.message)
  });

  if (saved) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <Card className="text-center">
          <h1 className="font-display text-xl text-pearl">Danke für deine Ehrlichkeit.</h1>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            Deine Antworten gehören dir. Wenn du magst, sprich mit deiner Partnerperson
            darüber – in deinem Tempo, wenn es passt.
          </p>
          <Button variant="secondary" className="mt-5" onClick={() => setSaved(false)}>
            Neuer Check-in
          </Button>
        </Card>
      </div>
    );
  }

  const OPTS = [
    { value: "yes", label: "Ja" },
    { value: "partly", label: "Teils" },
    { value: "no", label: "Nein" }
  ] as const;

  return (
    <div className="mx-auto max-w-md space-y-5 px-4 py-8">
      <header>
        <h1 className="font-display text-xl text-pearl">Wie geht es dir?</h1>
        <p className="mt-1 text-sm text-mist">
          Deine Antworten sind privat. Geteilt wird nur, was du ausdrücklich teilst.
        </p>
      </header>

      <Card className="space-y-5">
        <div>
          <p className="mb-2 text-sm text-pearl">Fühlst du dich mit eurem gemeinsamen Weg wohl?</p>
          <SegmentedControl label="Wohlfühlen" options={OPTS} value={comfortable} onChange={setComfortable} />
        </div>
        <div>
          <p className="mb-2 text-sm text-pearl">Fühlst du dich mit deinen Grenzen respektiert?</p>
          <SegmentedControl label="Respekt" options={OPTS} value={respected} onChange={setRespected} />
        </div>
        <div>
          <p className="mb-2 text-sm text-pearl">Passt das Tempo für dich?</p>
          <SegmentedControl label="Tempo" options={OPTS} value={pace} onChange={setPace} />
        </div>
        <div>
          <label htmlFor="checkin-note" className="mb-1 block text-sm text-mist">
            Private Notiz (optional, nur für dich)
          </label>
          <textarea
            id="checkin-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full rounded-card border border-veil bg-void/50 px-4 py-3 text-sm text-pearl"
          />
        </div>
      </Card>

      {uncomfortable ? (
        <Card className="border-coral/30">
          <p className="text-sm leading-relaxed text-pearl/90">
            Danke, dass du ehrlich bist. Du entscheidest, was jetzt passiert – nichts
            davon wird automatisch weitergegeben:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-mist">
            <li>Du kannst einzelne Themen in der Resonanz pausieren oder ausblenden.</li>
            <li>Du kannst deine Gedanken zunächst nur als private Notiz festhalten.</li>
            <li>
              Wenn du dich in deiner Beziehung unsicher oder unter Druck gesetzt fühlst,
              findest du bei der Telefonseelsorge (0800 111 0 111, kostenlos, anonym)
              und beim Hilfetelefon Gewalt gegen Frauen (116 016) jederzeit Unterstützung.
            </li>
          </ul>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button loading={save.isPending} onClick={() => save.mutate(false)}>
          Privat speichern
        </Button>
        <Button variant="secondary" loading={save.isPending} onClick={() => save.mutate(true)}>
          Speichern und Gesprächswunsch teilen
        </Button>
      </div>
    </div>
  );
}
