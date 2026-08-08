import { CATEGORY_META, CATEGORY_COUNTS, type KinkCategory } from "@/domain/questions/categories";
import { CategorySymbol } from "@/components/visuals/CategorySymbol";
import { Button } from "@/components/ui/Button";

/**
 * Bewusste Aktivierung sensibler Themenwelten (§21). Keine Warnung,
 * keine Moral – Kontrolle über die eigene Experience. Die Auswahl bleibt
 * lokal auf dem Gerät und wird nie als persönliche Antwort mitgeteilt.
 */
type Props = {
  category: KinkCategory;
  onActivate: () => void;
  onSkip: () => void;
};

export function SensitiveContentGate({ category, onActivate, onSkip }: Props) {
  const meta = CATEGORY_META[category];
  if (!meta) return null;
  return (
    <section
      aria-label={`Themenwelt ${meta.label} aktivieren`}
      className="rounded-card border border-veil/60 bg-smoke/90 p-6 text-center backdrop-blur"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-veil/70 text-lavender">
        <CategorySymbol category={category} size={30} />
      </div>
      <h2 className="font-display text-xl text-pearl">{meta.label}</h2>
      <p className="mt-2 text-sm leading-relaxed text-mist">{meta.description}</p>
      <p className="mt-3 text-sm text-pearl/80">
        Diese Themenwelt wartet auf deine bewusste Aktivierung.
        {" "}{CATEGORY_COUNTS[category]} Fragen, jederzeit wieder ausblendbar.
      </p>
      <p className="mt-2 text-xs text-mist/80">
        Deine Auswahl bleibt auf diesem Gerät und wird nicht als Antwort mitgeteilt.
      </p>
      <div className="mt-5 grid gap-2">
        <Button onClick={onActivate} className="w-full">Themenwelt öffnen</Button>
        <Button variant="ghost" onClick={onSkip} className="w-full">Geschlossen lassen</Button>
      </div>
    </section>
  );
}
