import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { loadPrefs, updatePrefs } from "@/lib/storage/prefs";
import { KINK_CATEGORIES, DEPTH_PRESETS, DEFAULT_ENABLED, CATEGORY_COUNTS } from "@/domain/questions/categories";
import { CategorySymbol } from "@/components/visuals/CategorySymbol";
import { hashPin } from "@/lib/crypto/pin";
import { savePinRecord, clearPinRecord, clearAllLocalData } from "@/lib/storage/db";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useToast } from "@/components/ui/Toast";
import { WishBuilder } from "@/features/wishes/WishBuilder";
import { APP_CONFIG } from "@/config/app";

type DeletionScope = "answers" | "matches" | "couple" | "account";

const DELETION_COPY: Record<DeletionScope, { title: string; body: string; rpc: string }> = {
  answers: {
    title: "Eigene Antworten löschen",
    body: "Alle deine Antworten werden endgültig gelöscht. Matches, die darauf beruhen, verschwinden ebenfalls. Das kann nicht rückgängig gemacht werden.",
    rpc: "delete_own_answers"
  },
  matches: {
    title: "Gemeinsame Matches löschen",
    body: "Alle Matches, Grenzen und Pläne eurer Verbindung werden endgültig gelöscht. Eure einzelnen Antworten bleiben bestehen. Das kann nicht rückgängig gemacht werden.",
    rpc: "delete_couple_matches"
  },
  couple: {
    title: "Verbindung auflösen",
    body: "Die Verbindung und alle gemeinsamen Daten (Antworten, Matches, Grenzen, Pläne, Check-ins) werden endgültig gelöscht. Das kann nicht rückgängig gemacht werden.",
    rpc: "dissolve_couple"
  },
  account: {
    title: "Konto vollständig löschen",
    body: "Dein Konto und sämtliche damit verbundenen Daten werden endgültig gelöscht. Das kann nicht rückgängig gemacht werden.",
    rpc: "delete_account"
  }
};

export function SettingsScreen() {
  const queryClient = useQueryClient();
  const toast = useToast((s) => s.show);
  const [prefs, setPrefs] = useState(loadPrefs());
  const [pinInput, setPinInput] = useState("");
  const [deletion, setDeletion] = useState<DeletionScope | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const set = (patch: Parameters<typeof updatePrefs>[0]) => {
    setPrefs(updatePrefs(patch));
  };

  const setupPin = async () => {
    if (pinInput.length < 4) {
      toast("Der Code braucht mindestens 4 Zeichen.");
      return;
    }
    const record = await hashPin(pinInput);
    await savePinRecord(record);
    setPinInput("");
    toast("App-Sperre eingerichtet.");
  };

  const runDeletion = useMutation({
    mutationFn: async (scope: DeletionScope) => {
      const { error } = await supabase().rpc(DELETION_COPY[scope].rpc);
      if (error) throw new Error("Die Löschung konnte nicht ausgeführt werden.");
      if (scope === "account" || scope === "couple") {
        await clearAllLocalData();
      }
      if (scope === "account") {
        await supabase().auth.signOut();
        location.reload();
      }
    },
    onSuccess: () => {
      setDeletion(null);
      setConfirmText("");
      void queryClient.invalidateQueries();
      toast("Endgültig gelöscht.");
    },
    onError: (e: Error) => toast(e.message)
  });

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">
      <h1 className="font-display text-xl text-pearl">Einstellungen</h1>

      <Card className="space-y-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-mist">Privatsphäre</h2>
        <label className="flex min-h-touch cursor-pointer items-center justify-between gap-4">
          <span className="text-sm text-pearl">
            Blickschutz: Inhalte beim App-Wechsel unscharf stellen
          </span>
          <input
            type="checkbox"
            checked={prefs.privacyShield}
            onChange={(e) => set({ privacyShield: e.target.checked })}
            className="h-5 w-5 accent-[rgb(var(--c-iris))]"
          />
        </label>
        <div>
          <p className="mb-2 text-sm text-pearl">Automatische Sperre</p>
          <SegmentedControl
            label="Automatische Sperre"
            value={String(prefs.autoLockSeconds ?? "off")}
            onChange={(v) =>
              set({ autoLockSeconds: v === "off" ? null : (Number(v) as 0 | 60 | 300) })
            }
            options={[
              { value: "off", label: "Aus" },
              { value: "0", label: "Sofort" },
              { value: "60", label: "1 Min" },
              { value: "300", label: "5 Min" }
            ]}
          />
          <p className="mt-1 text-xs text-mist">Wirkt nur, wenn eine App-Sperre eingerichtet ist.</p>
        </div>
        <div>
          <label htmlFor="pin-setup" className="mb-1 block text-sm text-pearl">
            App-Sperre (Code, nur auf diesem Gerät)
          </label>
          <div className="flex gap-2">
            <input
              id="pin-setup"
              type="password"
              inputMode="numeric"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Mind. 4 Zeichen"
              className="min-h-touch flex-1 rounded-pill border border-veil bg-void/50 px-4 text-sm text-pearl"
            />
            <Button variant="secondary" onClick={() => void setupPin()}>Setzen</Button>
            <Button
              variant="ghost"
              onClick={() => {
                void clearPinRecord().then(() => toast("App-Sperre entfernt."));
              }}
            >
              Entfernen
            </Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-mist">Darstellung</h2>
        <div>
          <p className="mb-2 text-sm text-pearl">Bewegung und Animationen</p>
          <SegmentedControl
            label="Bewegung"
            value={prefs.reducedMotion}
            onChange={(v) => set({ reducedMotion: v })}
            options={[
              { value: "system", label: "Wie System" },
              { value: "on", label: "Reduziert" },
              { value: "off", label: "Voll" }
            ]}
          />
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-mist">Themenwelten</h2>
        <p className="text-xs text-mist">
          Ihr könnt Themen jederzeit aktivieren oder ausblenden. Eure Auswahl wird
          nicht als persönliche Antwort mitgeteilt und bleibt auf diesem Gerät.
        </p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tiefe wählen">
          {DEPTH_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={(prefs.depthPreset ?? "kink") === preset.id}
              onClick={() =>
                set({
                  depthPreset: preset.id,
                  enabledCategories:
                    preset.id === "custom"
                      ? (prefs.enabledCategories ?? [...DEFAULT_ENABLED])
                      : [...preset.categories]
                })
              }
              className={`min-h-touch rounded-pill border px-3.5 py-1.5 text-xs transition-colors
                ${(prefs.depthPreset ?? "kink") === preset.id
                  ? "border-lavender bg-iris/20 text-pearl"
                  : "border-veil text-mist hover:text-pearl"}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {KINK_CATEGORIES.map((c) => {
            const enabled = new Set(prefs.enabledCategories ?? DEFAULT_ENABLED);
            const on = enabled.has(c.slug);
            return (
              <li key={c.slug}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    const next = new Set(enabled);
                    if (on) next.delete(c.slug);
                    else next.add(c.slug);
                    set({ enabledCategories: [...next], depthPreset: "custom" });
                  }}
                  className={`flex w-full min-h-touch items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-xs transition-colors
                    ${on ? "border-lavender/60 bg-iris/10 text-pearl" : "border-veil/60 text-mist hover:text-pearl"}`}
                >
                  <span className={on ? "text-lavender" : "text-mist"}>
                    <CategorySymbol category={c.slug} size={18} />
                  </span>
                  <span className="flex-1">{c.label}</span>
                  <span className="text-[0.65rem] text-mist/70">{CATEGORY_COUNTS[c.slug]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-mist">Haptik</h2>
        <label className="flex min-h-touch cursor-pointer items-center justify-between gap-3">
          <span className="text-sm text-pearl/90">Dezentes haptisches Feedback</span>
          <input
            type="checkbox"
            checked={prefs.haptics}
            onChange={(e) => set({ haptics: e.target.checked })}
            className="h-5 w-5 accent-[rgb(var(--c-iris))]"
          />
        </label>
      </Card>

      <WishBuilder />

      <Card className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-mist">Löschen</h2>
        <p className="text-xs text-mist">
          Jede Löschung ist endgültig. Es gibt keinen Papierkorb und keine Wiederherstellung.
        </p>
        {(Object.keys(DELETION_COPY) as DeletionScope[]).map((scope) => (
          <Button key={scope} variant="danger" className="w-full" onClick={() => setDeletion(scope)}>
            {DELETION_COPY[scope].title}
          </Button>
        ))}
      </Card>

      <Card>
        <h2 className="text-sm font-medium uppercase tracking-wide text-mist">Rechtliches</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li><Link className="text-lavender underline-offset-4 hover:underline" to="/legal/impressum">Impressum</Link></li>
          <li><Link className="text-lavender underline-offset-4 hover:underline" to="/legal/datenschutz">Datenschutzerklärung</Link></li>
          <li><Link className="text-lavender underline-offset-4 hover:underline" to="/legal/nutzungsbedingungen">Nutzungsbedingungen</Link></li>
          <li><Link className="text-lavender underline-offset-4 hover:underline" to="/legal/sicherheit">Sicherheit und Vertrauen</Link></li>
        </ul>
        <p className="mt-4 text-xs text-mist">
          Betreiber: {APP_CONFIG.operator.name}. Version {APP_CONFIG.version}.
        </p>
      </Card>

      <Modal
        open={deletion !== null}
        onClose={() => {
          setDeletion(null);
          setConfirmText("");
        }}
        title={deletion ? DELETION_COPY[deletion].title : ""}
      >
        {deletion ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-pearl/90">{DELETION_COPY[deletion].body}</p>
            <label htmlFor="confirm-delete" className="block text-sm text-mist">
              Tippe zur Bestätigung: LÖSCHEN
            </label>
            <input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full rounded-card border border-veil bg-void/50 px-4 py-3 text-pearl"
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeletion(null)}>Abbrechen</Button>
              <Button
                variant="danger"
                disabled={confirmText !== "LÖSCHEN"}
                loading={runDeletion.isPending}
                onClick={() => runDeletion.mutate(deletion)}
              >
                Endgültig löschen
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
