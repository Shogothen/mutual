import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InterestLevel } from "@/domain/matching/types";
import { MOTION } from "@/components/motion/motionTokens";
import { useReducedMotionPref } from "@/hooks/useReducedMotion";

/**
 * Eigenes Auswahlobjekt statt sechs gleichförmiger Buttons (§12.4).
 * Drei Gruppen mit eigener Formensprache – keine Ampelfarben, keine
 * Wertungsachse: "Nur Fantasie" ist keine schwächere Form von "Ausprobieren".
 *   Private Grenze        – ruhige, geschlossene Linienformen
 *   Gedankliche Offenheit – offene, halbdurchlässige Formen
 *   Aktives Interesse     – gefüllte, leuchtende Formen
 */

type Option = { value: InterestLevel; short: string; full: string };
type Group = { id: string; title: string; options: Option[]; shape: "line" | "open" | "filled" };

const GROUPS: Group[] = [
  {
    id: "boundary",
    title: "Private Grenze",
    shape: "line",
    options: [
      { value: "no", short: "Nein", full: "Nein, das reizt mich nicht" },
      { value: "not_now", short: "Nicht jetzt", full: "Gerade nicht – vielleicht zu einem anderen Zeitpunkt" }
    ]
  },
  {
    id: "openness",
    title: "Gedankliche Offenheit",
    shape: "open",
    options: [
      { value: "fantasy_only", short: "Fantasie", full: "Nur als Fantasie – nicht zur Umsetzung" },
      { value: "maybe_with_conditions", short: "Vielleicht", full: "Vielleicht, wenn die Bedingungen stimmen" }
    ]
  },
  {
    id: "interest",
    title: "Aktives Interesse",
    shape: "filled",
    options: [
      { value: "would_try", short: "Ausprobieren", full: "Das würde ich ausprobieren" },
      { value: "already_like", short: "Mag ich", full: "Das mag ich bereits" }
    ]
  }
];

function Indicator({ shape, active }: { shape: Group["shape"]; active: boolean }) {
  const c = active ? "rgb(var(--c-lavender))" : "rgb(var(--c-mist) / 0.7)";
  return (
    <svg aria-hidden viewBox="0 0 20 20" width="18" height="18" className="shrink-0">
      {shape === "line" ? (
        <path d="M4 10h12" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      ) : shape === "open" ? (
        <path d="M10 3.2a6.8 6.8 0 106.8 6.8" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <circle cx="10" cy="10" r="6" fill={active ? "rgb(var(--c-iris))" : "none"} stroke={c} strokeWidth="1.8" />
      )}
    </svg>
  );
}

type Props = {
  value: InterestLevel | null;
  onChange: (value: InterestLevel) => void;
};

export function AnswerSelector({ value, onChange }: Props) {
  const reduced = useReducedMotionPref();
  const [ripple, setRipple] = useState<string | null>(null);

  const select = (v: InterestLevel) => {
    onChange(v);
    if (!reduced) {
      setRipple(v);
      window.setTimeout(() => setRipple(null), 420);
    }
  };

  return (
    <div role="radiogroup" aria-label="Deine Antwort" className="space-y-3">
      {GROUPS.map((group) => (
        <div key={group.id}>
          <p className="mb-1.5 text-[0.7rem] uppercase tracking-[0.14em] text-mist/80">
            {group.title}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {group.options.map((o) => {
              const active = value === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={o.full}
                  title={o.full}
                  onClick={() => select(o.value)}
                  className={`relative isolate flex min-h-touch items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 text-left text-sm transition-[border-color,background-color,color] duration-200
                    ${active
                      ? group.shape === "filled"
                        ? "border-lavender bg-iris/25 text-pearl"
                        : group.shape === "open"
                          ? "border-lavender/80 bg-lavender/10 text-pearl"
                          : "border-mist/70 bg-veil/40 text-pearl"
                      : "border-veil/70 text-pearl/75 hover:border-mist/70"}`}
                >
                  <Indicator shape={group.shape} active={active} />
                  <span>{o.short}</span>
                  <AnimatePresence>
                    {ripple === o.value ? (
                      <motion.span
                        aria-hidden
                        initial={{ opacity: 0.35, scale: 0 }}
                        animate={{ opacity: 0, scale: 2.6 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.42, ease: MOTION.easeOrganic }}
                        className="absolute inset-0 -z-10 rounded-xl bg-lavender/30"
                      />
                    ) : null}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-xs text-mist/70">
        Fantasie und Umsetzung sind getrennte Antworten – keine Stufen derselben Skala.
      </p>
    </div>
  );
}
