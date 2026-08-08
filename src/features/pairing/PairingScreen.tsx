import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";
import { createCoupleWithInvite, redeemInvite } from "./api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { APP_CONFIG } from "@/config/app";
import { haptic } from "@/lib/haptics";
import { OrganicField } from "@/components/visuals/OrganicField";
import { MutualSigil } from "@/components/visuals/MutualSigil";

/**
 * Hero-Visual (§9.2): zwei flüssige Lichtkörper (OrganicField-Engine)
 * reagieren auf den Pointer, nähern sich an, berühren sich aber noch nicht.
 */
function PairingHero() {
  return (
    <div aria-hidden className="relative mx-auto mb-6 h-52 w-full max-w-sm overflow-hidden rounded-card">
      <OrganicField converge={0.12} intensity={0.95} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-void to-transparent" />
    </div>
  );
}

/** Create a connection or join one – code, link or QR (§7). */
export function PairingScreen() {
  const queryClient = useQueryClient();
  const toast = useToast((s) => s.show);
  const [mode, setMode] = useState<"choose" | "created" | "join">("choose");
  const [invite, setInvite] = useState<{ code: string; qr: string; link: string } | null>(null);
  const [joinCode, setJoinCode] = useState("");

  const create = useMutation({
    mutationFn: () => createCoupleWithInvite(APP_CONFIG.invite.expiryHours),
    onSuccess: async (data) => {
      const link = `${location.origin}${location.pathname}#/join/${data.invite_code}`;
      const qr = await QRCode.toDataURL(link, { margin: 1, width: 240, color: { dark: "#e0ddea", light: "#131022" } });
      setInvite({ code: data.invite_code, qr, link });
      setMode("created");
      void queryClient.invalidateQueries({ queryKey: ["connection"] });
    },
    onError: (e: Error) => toast(e.message)
  });

  const join = useMutation({
    mutationFn: () => redeemInvite(joinCode),
    onSuccess: () => {
      haptic("consent");
      toast("Euer privater Raum ist verbunden. Von hier an bleibt jede einzelne Antwort privat.");
      void queryClient.invalidateQueries({ queryKey: ["connection"] });
    },
    onError: (e: Error) => toast(e.message)
  });

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      {mode === "choose" ? (
        <>
          <div className="mb-5 flex items-center gap-3">
            <MutualSigil size={34} />
            <span className="font-display text-lg tracking-wide text-pearl">Mutual</span>
          </div>
          <PairingHero />
        </>
      ) : null}
      <h1 className="holo-text font-display text-3xl leading-tight">
        Was euch beide reizt, bleibt nicht länger unausgesprochen.
      </h1>
      <p className="mt-3 text-mist">
        Beantwortet intime Fragen getrennt voneinander. Einzelne Antworten bleiben
        privat. Sichtbar wird nur, was ihr beide entdecken möchtet.
      </p>
      <p className="mt-3 text-xs text-mist/80">
        Keine Klarnamen. Keine sichtbaren Einzelantworten. Jederzeit löschbar. Der
        Einladungscode ist {APP_CONFIG.invite.expiryHours} Stunden gültig und wird nur
        einmal angezeigt.
      </p>

      {mode === "choose" ? (
        <div className="mt-8 space-y-3">
          <Button className="w-full" loading={create.isPending} onClick={() => create.mutate()}>
            Unsere Verbindung starten
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => setMode("join")}>
            Mit Code beitreten
          </Button>
        </div>
      ) : null}

      {mode === "created" && invite ? (
        <Card className="mt-8 text-center">
          <p className="text-sm text-mist">Zeig diesen Code deiner Partnerperson – er erscheint nur dieses eine Mal:</p>
          <p className="mt-3 select-all break-all rounded-lg bg-void/60 p-3 font-mono text-lg tracking-wider text-lavender">
            {invite.code}
          </p>
          <img src={invite.qr} alt="QR-Code der Einladung" className="mx-auto mt-4 rounded-lg" width={200} height={200} />
          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => {
              void navigator.clipboard.writeText(invite.link);
              toast("Einladungslink kopiert.");
            }}
          >
            Einladungslink kopieren
          </Button>
          <p className="mt-4 text-xs text-mist">
            Bewahre den Code wie ein Passwort auf. Ohne ihn kann niemand eurer Verbindung beitreten.
          </p>
        </Card>
      ) : null}

      {mode === "join" ? (
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            join.mutate();
          }}
        >
          <label htmlFor="join-code" className="block text-sm text-mist">
            Einladungscode
          </label>
          <input
            id="join-code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-card border border-veil bg-abyss px-4 py-3 font-mono text-pearl"
          />
          <Button type="submit" className="w-full" loading={join.isPending} disabled={joinCode.trim().length < 8}>
            Beitreten
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => setMode("choose")}>
            Zurück
          </Button>
        </form>
      ) : null}
    </div>
  );
}
