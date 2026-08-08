import { MutualSigil } from "@/components/visuals/MutualSigil";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { verifyPin } from "@/lib/crypto/pin";
import { loadPinRecord } from "@/lib/storage/db";
import { APP_CONFIG } from "@/config/app";

export function AppLockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const record = await loadPinRecord();
    if (!record || (await verifyPin(pin, record))) {
      onUnlock();
    } else {
      setError("Der Code stimmt nicht. Versuch es noch einmal.");
      setPin("");
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void px-6">
      <div aria-hidden className="relative mb-6 h-28 w-28">
        <div className="absolute inset-0 rounded-[46%_54%_58%_42%/52%_44%_56%_48%] border border-veil/70 bg-abyss/70" />
        <div className="absolute inset-2.5 rounded-[52%_48%_44%_56%/46%_54%_50%_50%] border border-iris/30 bg-smoke/50" />
        <div className="absolute inset-5 rounded-[48%_52%_56%_44%/54%_46%_50%_50%] border border-lavender/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <MutualSigil size={44} />
        </div>
      </div>
      <p className="mb-8 font-display text-2xl text-pearl">{APP_CONFIG.name}</p>
      <form onSubmit={submit} className="w-full max-w-xs space-y-4">
        <label htmlFor="pin" className="block text-sm text-mist">
          Gib deinen Code ein, um fortzufahren.
        </label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full rounded-card border border-veil bg-abyss px-4 py-3 text-center text-xl tracking-[0.5em] text-pearl"
        />
        {error ? (
          <p role="alert" className="text-sm text-danger">{error}</p>
        ) : null}
        <Button type="submit" loading={busy} className="w-full">Entsperren</Button>
      </form>
    </div>
  );
}
