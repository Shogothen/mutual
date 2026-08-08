import { useQuery } from "@tanstack/react-query";
import { fetchDiscoveryCards } from "@/features/discovery/api";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Impulse: high-quality conversation prompts beyond the card game (§21).
 * Answered together, offline, at your own pace – nothing is tracked here.
 */
export function ImpulsesScreen() {
  const cards = useQuery({ queryKey: ["discovery-cards"], queryFn: fetchDiscoveryCards });
  const impulses = (cards.data ?? []).filter((c) => c.category === "gespraechsimpulse");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-xl text-pearl">Impulse</h1>
        <p className="mt-1 text-sm text-mist">
          Gesprächsanstöße für euch beide – ganz ohne Bewertung und ohne Aufzeichnung.
        </p>
      </header>
      {cards.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <ul className="space-y-3">
          {impulses.map((c) => (
            <li key={c.id}>
              <Card>
                <h2 className="text-lg text-pearl">{c.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-mist">{c.prompt}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
