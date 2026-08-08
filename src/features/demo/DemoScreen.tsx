import { Link } from "react-router-dom";
import { computeMatch } from "@/domain/matching/engine";
import type { Answer } from "@/domain/matching/types";
import { Card } from "@/components/ui/Card";
import { APP_CONFIG } from "@/config/app";

const a: Answer = { interest: "would_try", role: "not_relevant", intensityMin: 2, intensityMax: 4, timing: "open", conditions: [] };
const b: Answer = { interest: "already_like", role: "not_relevant", intensityMin: 3, intensityMax: 5, timing: "soon", conditions: ["talk_first"] };

/**
 * Dev-only demo (§31): runs the mirrored TS matching engine on example data
 * so the flow can be inspected without a partner. Real matches only ever
 * originate server-side.
 */
export function DemoScreen() {
  if (!APP_CONFIG.features.demoMode) {
    return <p className="p-8 text-mist">Der Demo-Modus ist nur in Entwicklungs-Builds verfügbar.</p>;
  }
  const result = computeMatch(a, b, { roleModel: "symmetric" });
  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-8">
      <h1 className="font-display text-xl text-pearl">Demo-Modus (nur Entwicklung)</h1>
      <p className="text-sm text-mist">
        Beispielrechnung der gespiegelten TypeScript-Matching-Engine. Echte Matches entstehen
        ausschließlich serverseitig. Für einen vollständigen Zwei-Personen-Test: zwei
        Browserprofile gegen dieselbe Supabase-Instanz verbinden.
      </p>
      <Card>
        <pre className="overflow-x-auto text-xs text-pearl/90">{JSON.stringify({ a, b, result }, null, 2)}</pre>
      </Card>
      <Link to="/" className="text-sm text-lavender underline underline-offset-4">Zurück zur App</Link>
    </div>
  );
}
