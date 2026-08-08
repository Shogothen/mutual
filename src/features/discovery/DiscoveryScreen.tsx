import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAnsweredIds, fetchDiscoveryCards } from "./api";
import { DiscoveryCard, type CardAnswer } from "./DiscoveryCard";
import { submitAnswer } from "@/features/matching/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase/client";
import { loadPrefs, updatePrefs } from "@/lib/storage/prefs";
import { CATEGORY_META, DEFAULT_ENABLED, type KinkCategory } from "@/domain/questions/categories";
import { SensitiveContentGate } from "./SensitiveContentGate";

/**
 * Discovery: progressive disclosure – low-threshold cards first, intense
 * topics later (§19). Sorted by intensity, then risk.
 */
export function DiscoveryScreen() {
  const queryClient = useQueryClient();
  const toast = useToast((s) => s.show);
  const [passed, setPassed] = useState<Set<string>>(new Set());
  const [enabled, setEnabled] = useState<Set<string>>(
    () => new Set(loadPrefs().enabledCategories ?? DEFAULT_ENABLED)
  );
  const [gateSkipped, setGateSkipped] = useState<Set<string>>(new Set());

  const cards = useQuery({ queryKey: ["discovery-cards"], queryFn: fetchDiscoveryCards });
  const answered = useQuery({ queryKey: ["answered-ids"], queryFn: fetchAnsweredIds });

  const queue = useMemo(() => {
    if (!cards.data || !answered.data) return [];
    return cards.data
      .filter((c) => !answered.data.has(c.id) && !passed.has(c.id))
      .filter((c) => c.category !== "gespraechsimpulse")
      .filter((c) => {
        const meta = CATEGORY_META[c.category];
        if (!meta) return true; // eigene Wünsche und Legacy-Inhalte
        if (enabled.has(c.category)) return true;
        // Opt-in-Themen erscheinen als Gate, sofern nicht bewusst übersprungen.
        return meta.optIn && !gateSkipped.has(c.category);
      })
      .sort((a, b) => a.intensity_level - b.intensity_level || a.title.localeCompare(b.title));
  }, [cards.data, answered.data, passed, enabled, gateSkipped]);

  const current = queue[0];
  const gateCategory =
    current && CATEGORY_META[current.category] && !enabled.has(current.category)
      ? (current.category as KinkCategory)
      : null;

  const activateCategory = (cat: string) => {
    setEnabled((prev) => {
      const next = new Set(prev).add(cat);
      updatePrefs({ enabledCategories: [...next] });
      return next;
    });
  };

  const mutation = useMutation({
    mutationFn: async (input: { cardId: string; answer: CardAnswer }) =>
      submitAnswer({
        questionId: input.cardId,
        interest: input.answer.interest,
        role: input.answer.role,
        intensityMin: input.answer.intensityMin,
        intensityMax: input.answer.intensityMax,
        timing: input.answer.timing,
        conditions: input.answer.conditions,
        answerVersion: 1
      }),
    onSuccess: (_data, vars) => {
      setPassed((p) => new Set(p).add(vars.cardId));
      void queryClient.invalidateQueries({ queryKey: ["answered-ids"] });
      void queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (err: Error, vars) => {
      setPassed((p) => new Set(p).add(vars.cardId));
      toast(err.message);
    }
  });

  if (cards.isLoading || answered.isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-4 py-8">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    );
  }

  if (cards.isError) {
    return (
      <EmptyState title="Karten konnten nicht geladen werden.">
        Prüfe deine Verbindung und versuch es gleich noch einmal.
      </EmptyState>
    );
  }

  if (!current) {
    return (
      <EmptyState title="Für heute ist hier alles beantwortet.">
        Neue Impulse und eigene Wünsche eurer Verbindung erscheinen hier automatisch.
      </EmptyState>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-xl text-pearl">Entdecken</h1>
        <p className="mt-1 text-sm text-mist">
          Deine Auswahl bleibt privat. Sichtbar wird ausschließlich eine gemeinsame Übereinstimmung.
        </p>
      </header>
      <AnimatePresence mode="wait">
        {gateCategory ? (
          <SensitiveContentGate
            key={`gate-${gateCategory}`}
            category={gateCategory}
            onActivate={() => activateCategory(gateCategory)}
            onSkip={() => setGateSkipped((p) => new Set(p).add(gateCategory))}
          />
        ) : (
        <DiscoveryCard
          key={current.id}
          card={current}
          onAnswer={(answer) => mutation.mutate({ cardId: current.id, answer })}
          onSkip={() => {
            void submitAnswerSilently(current.id, "skipped");
            setPassed((p) => new Set(p).add(current.id));
          }}
          onHide={() => {
            void submitAnswerSilently(current.id, "hidden");
            setPassed((p) => new Set(p).add(current.id));
          }}
        />
        )}
      </AnimatePresence>
      <p aria-live="polite" className="sr-only">
        {mutation.isPending ? "Antwort wird gespeichert." : ""}
      </p>
    </div>
  );
}

async function submitAnswerSilently(cardId: string, interest: "skipped" | "hidden"): Promise<void> {
  try {
    await supabase().rpc("submit_answer", { p_question_id: cardId, p_interest: interest });
  } catch {
    // Skips/hides are best-effort; they carry no matching weight.
  }
}
