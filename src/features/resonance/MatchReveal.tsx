import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MatchRow } from "@/types/api";
import type { MatchType } from "@/domain/matching/types";
import { Button } from "@/components/ui/Button";
import { MOTION } from "@/components/motion/motionTokens";
import { useReducedMotionPref } from "@/hooks/useReducedMotion";
import { haptic } from "@/lib/haptics";
import { OrganicField } from "@/components/visuals/OrganicField";

/**
 * Match Reveal v2 (§23): kein Erfolgs-Popup, sondern das Sichtbarwerden
 * eines gemeinsamen Geheimnisses. Choreografie in Phasen:
 *   1 Umgebung beruhigt sich (Overlay dimmt)
 *   2 zwei Lichtfelder mit eigenen Bewegungsmustern
 *   3 Partikel oszillieren zwischen ihnen
 *   4–5 im Zwischenraum entsteht eine Form und öffnet sich als Membran
 *   6–7 Titel erscheint erst teilweise, dann die Karte
 *   8 kurze haptische Resonanz
 *   9 öffnen oder später ansehen
 * Gesamt ≤ 2,5 s, jederzeit überspringbar. Reduced Motion: ruhiger Fade.
 */

const HEADLINES: Record<MatchType, string> = {
  shared_fantasy: "Diese Fantasie teilt ihr.",
  conversation_value: "Zwischen euch ist etwas sichtbar geworden.",
  careful_curiosity: "Hier seid ihr beide neugierig.",
  clear_match: "Das würdet ihr beide ausprobieren.",
  strong_match: "Das kennt und mögt ihr beide."
};

export const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  shared_fantasy: "Gemeinsame Fantasie",
  conversation_value: "Gesprächswert",
  careful_curiosity: "Vorsichtige Neugier",
  clear_match: "Klares Match",
  strong_match: "Starkes Match"
};

/** Animiert den Konvergenz-Parameter 0 → 1 über die Feld-Phase. */
function ConvergingField({ active }: { active: boolean }) {
  const [cv, setCv] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1400);
      setCv(1 - Math.pow(1 - p, 3)); // ease-out cubic
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return <OrganicField converge={cv} interactive={false} intensity={1.1} colorB="255,140,123" />;
}

type Props = { match: MatchRow; title: string; onClose: () => void };

export function MatchReveal({ match, title, onClose }: Props) {
  const reduced = useReducedMotionPref();
  const [stage, setStage] = useState<"fields" | "card">(reduced ? "card" : "fields");

  useEffect(() => {
    if (reduced) return;
    const t = window.setTimeout(() => setStage("card"), 1450);
    return () => window.clearTimeout(t);
  }, [reduced]);

  useEffect(() => {
    if (stage === "card") haptic("reveal");
  }, [stage]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Neue gemeinsame Resonanz"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: MOTION.duration.base }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 px-6 backdrop-blur-sm"
    >
      {stage === "fields" ? (
        <button
          type="button"
          onClick={() => setStage("card")}
          className="absolute right-5 top-5 z-10 min-h-touch rounded-pill border border-veil/70 px-4 py-2 text-sm text-mist hover:text-pearl"
        >
          Überspringen
        </button>
      ) : null}

      {!reduced ? (
        /* Phasen 2–4: zwei flüssige Lichtkörper konvergieren; die dritte Form
           entsteht in der OrganicField-Engine selbst. */
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: stage === "fields" ? 1 : 0.45 }}
          transition={{ duration: 0.6, ease: MOTION.easeOrganic }}
        >
          <ConvergingField active={stage === "fields"} />
        </motion.div>
      ) : null}

      {/* Phase 5–7: Membran öffnet sich, Karte wird sichtbar */}
      <AnimatePresence>
        {stage === "card" ? (
          <motion.div
            key="card"
            initial={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, clipPath: "ellipse(12% 4% at 50% 50%)", filter: "blur(10px)" }
            }
            animate={{ opacity: 1, clipPath: "ellipse(120% 120% at 50% 50%)", filter: "blur(0px)" }}
            transition={{ duration: reduced ? MOTION.duration.base : 0.85, ease: MOTION.easeOrganic }}
            className="relative w-full max-w-md rounded-card border border-lavender/30 bg-abyss p-8 text-center shadow-[0_20px_80px_-30px_rgb(var(--c-iris)/0.5)]"
          >
            <p className="text-sm text-lavender">{MATCH_TYPE_LABELS[match.match_type]}</p>
            <motion.h2
              initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.25, duration: 0.45, ease: MOTION.easeOrganic }}
              className="mt-2 font-display text-2xl text-pearl"
            >
              {HEADLINES[match.match_type]}
            </motion.h2>
            <motion.p
              initial={reduced ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : 0.45, duration: 0.4 }}
              className="mt-4 text-lg text-pearl/90"
            >
              {title}
            </motion.p>
            <p className="mt-4 text-sm leading-relaxed text-mist">
              Ein Match ist eine Einladung. Keine Verpflichtung.
              {match.talk_first ? " Ihr beide könnt zuerst in Ruhe darüber sprechen." : ""}
            </p>
            <div className="mt-6 grid gap-2">
              <Button onClick={onClose} className="w-full">Ansehen</Button>
              <Button variant="ghost" onClick={onClose} className="w-full">Später ansehen</Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
