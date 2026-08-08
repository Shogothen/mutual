import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { redeemInvite } from "@/features/pairing/api";
import { Button } from "@/components/ui/Button";

/** Deep link #/join/CODE – redeems the invite after explicit confirmation. */
export function JoinRoute() {
  const { code } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [state, setState] = useState<"confirm" | "busy" | "error">("confirm");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!code) navigate("/", { replace: true });
  }, [code, navigate]);

  const redeem = async () => {
    if (!code) return;
    setState("busy");
    try {
      await redeemInvite(code);
      await queryClient.invalidateQueries({ queryKey: ["connection"] });
      navigate("/", { replace: true });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Dieser Code ist nicht mehr gültig.");
      setState("error");
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 text-center">
      <h1 className="font-display text-2xl text-pearl">Einladung annehmen?</h1>
      <p className="mt-3 text-sm text-mist">
        Du bist eingeladen, eine private Verbindung einzugehen. Nach dem Beitritt wird der Code ungültig.
      </p>
      {state === "error" ? <p role="alert" className="mt-4 text-sm text-danger">{message}</p> : null}
      <div className="mt-8 space-y-3">
        <Button className="w-full" loading={state === "busy"} onClick={() => void redeem()}>
          Verbindung eingehen
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => navigate("/", { replace: true })}>
          Nicht jetzt
        </Button>
      </div>
    </div>
  );
}
