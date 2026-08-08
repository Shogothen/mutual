import { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { DiscoveryCardRow } from "@/types/api";
import type { InterestLevel, TimingPreference } from "@/domain/matching/types";
import type { IntensityLevel, RolePreference } from "@/domain/questions/types";
import { CATEGORY_LABELS, type QuestionCategory } from "@/domain/questions/types";
import { CATEGORY_META } from "@/domain/questions/categories";
import { CategorySymbol } from "@/components/visuals/CategorySymbol";
import { AnswerSelector } from "@/features/discovery/AnswerSelector";
import { haptic } from "@/lib/haptics";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { MOTION } from "@/components/motion/motionTokens";
import { useReducedMotionPref } from "@/hooks/useReducedMotion";

const CONDITIONS: { slug: string; label: string }[] = [
  { slug: "talk_first", label: "Nur nach einem ausführlichen Gespräch" },
  { slug: "stop_signal", label: "Nur mit einem klaren Stoppsignal" },
  { slug: "slow", label: "Zunächst sehr langsam" },
  { slug: "talk_only_first", label: "Erst einmal nur als Fantasie besprechen" },
  { slug: "familiar_place", label: "Nur in vertrauter Umgebung" },
  { slug: "sober_relaxed", label: "Nur wenn wir beide nüchtern sind" },
  { slug: "time_limit", label: "Nur mit klarer zeitlicher Begrenzung" },
  { slug: "aftercare", label: "Nur mit Nachsorge" },
  { slug: "no_photos", label: "Nur ohne Fotos oder Aufnahmen" },
  { slug: "no_marks", label: "Nur ohne sichtbare Spuren" },
  { slug: "self_release", label: "Nur mit jederzeit möglicher Selbstbefreiung" },
  { slug: "preset_limits", label: "Nur mit vorher vereinbartem Intensitätslimit" },
  { slug: "lead_role", label: "Nur wenn ich die führende Rolle habe" },
  { slug: "receive_role", label: "Nur wenn ich die empfangende Rolle habe" },
  { slug: "switch_possible", label: "Nur wenn wir Rollen wechseln können" }
];

const ROLE_LABELS: Record<RolePreference, string> = {
  initiating: "Ich möchte führen / geben",
  receiving: "Ich möchte mich führen lassen / empfangen",
  observing: "Ich möchte beobachten",
  switching: "Ich möchte wechseln können",
  both: "Beide Rollen reizen mich",
  not_relevant: "Rolle ist mir noch unklar"
};

export type CardAnswer = {
  interest: InterestLevel;
  role: RolePreference;
  intensityMin: IntensityLevel;
  intensityMax: IntensityLevel;
  timing: TimingPreference;
  conditions: string[];
};

type Props = {
  card: DiscoveryCardRow;
  onAnswer: (answer: CardAnswer) => void;
  onSkip: () => void;
  onHide: () => void;
};

const SENSITIVITY_AMBIENT: Record<string, string> = {
  standard: "var(--c-aqua)",
  explicit: "var(--c-iris)",
  advanced: "var(--c-coral)"
};

export function DiscoveryCard({ card, onAnswer, onSkip, onHide }: Props) {
  const reduced = useReducedMotionPref();
  const tiltRef = useRef<HTMLDivElement>(null);

  // Perspektivischer Tilt: die Karte reagiert auf die Fingerposition (§8.3).
  const onTilt = (e: React.PointerEvent) => {
    if (reduced || e.pointerType === "touch") return;
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1100px) rotateX(${(-y * 3.2).toFixed(2)}deg) rotateY(${(x * 3.6).toFixed(2)}deg)`;
  };
  const resetTilt = () => {
    const el = tiltRef.current;
    if (el) el.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg)";
  };
  const [interest, setInterest] = useState<InterestLevel | null>(null);
  const [role, setRole] = useState<RolePreference>(
    card.role_model === "symmetric" || card.role_model === "not_relevant"
      ? "not_relevant"
      : "both"
  );
  const [intensity, setIntensity] = useState<{ min: IntensityLevel; max: IntensityLevel }>({
    min: 1,
    max: Math.min(card.intensity_level + 1, 5) as IntensityLevel
  });
  const [timing, setTiming] = useState<TimingPreference>("open");
  const [conditions, setConditions] = useState<string[]>([]);
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);
  const [showSafety, setShowSafety] = useState(false);

  const needsDetails =
    interest !== null && interest !== "no" && interest !== "not_now";
  const needsRole =
    card.role_model !== "symmetric" && card.role_model !== "not_relevant";
  const roleOptions = card.allowed_roles.filter(
    (r): r is RolePreference => r in ROLE_LABELS
  );
  const canSubmit =
    interest !== null &&
    (!card.requires_safety_confirmation || !needsDetails || safetyConfirmed);

  const submit = () => {
    if (!interest) return;
    haptic("confirm");
    onAnswer({
      interest,
      role,
      intensityMin: intensity.min,
      intensityMax: intensity.max,
      timing,
      conditions: interest === "maybe_with_conditions" ? conditions : []
    });
  };

  const ambient = SENSITIVITY_AMBIENT[card.content_sensitivity] ?? "var(--c-iris)";

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: MOTION.distance.md, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -MOTION.distance.md }}
      transition={{ duration: MOTION.duration.base, ease: MOTION.easeOrganic }}
      className="relative"
    >
      {/* Kategorie-getöntes Umgebungslicht + angedeutetes Deck dahinter. */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] opacity-60 blur-2xl"
        style={{ background: `radial-gradient(60% 50% at 50% 12%, rgb(${ambient} / 0.28) 0%, transparent 70%)` }}
      />
      <div aria-hidden className="absolute inset-x-5 -top-2.5 -z-10 h-8 rounded-t-card border border-veil/40 bg-abyss/60" />
      <div aria-hidden className="absolute inset-x-10 -top-4.5 -z-20 h-8 rounded-t-card border border-veil/25 bg-abyss/40" />
      <article
        ref={tiltRef}
        onPointerMove={onTilt}
        onPointerLeave={resetTilt}
        aria-label={`Karte: ${card.title}`}
        className="tilt-card iridescent-border grain relative overflow-hidden rounded-card bg-smoke/90 p-6 shadow-[0_18px_60px_-20px_rgb(var(--c-iris)/0.35)] backdrop-blur"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-25"
          style={{ background: `radial-gradient(70% 100% at 50% 0%, rgb(${ambient} / 0.9), transparent 75%)` }}
        />
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-mist">
        <span className="flex items-center gap-2 rounded-pill border border-veil px-2.5 py-1 text-lavender">
          <CategorySymbol category={card.category} size={16} />
          <span className="text-mist">
            {CATEGORY_META[card.category]?.label ??
              CATEGORY_LABELS[card.category as QuestionCategory] ??
              card.category}
          </span>
        </span>
        <span aria-label={`Intensitätsstufe ${card.intensity_level} von 4`} className="flex items-center gap-1.5">
          <span aria-hidden className="flex gap-0.5">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`h-1 w-3 rounded-full ${i <= card.intensity_level ? "bg-iris" : "bg-veil"}`}
              />
            ))}
          </span>
          Intensität
        </span>
      </div>

      <h2 className="font-display text-2xl leading-snug text-pearl">{card.title}</h2>
      <p className="mt-3 leading-relaxed text-pearl/90">{card.prompt}</p>
      {card.context ? <p className="mt-2 text-sm text-mist">{card.context}</p> : null}
      {card.description ? <p className="mt-2 text-sm text-mist">{card.description}</p> : null}
      {card.consent_note ? (
        <p className="mt-3 rounded-lg border border-veil/50 bg-abyss/40 p-3 text-sm text-pearl/80">
          {card.consent_note}
        </p>
      ) : null}

      {card.safety_note ? (
        <div className="mt-4">
          <button
            type="button"
            aria-expanded={showSafety}
            onClick={() => setShowSafety((v) => !v)}
            className="min-h-touch text-sm text-lavender underline underline-offset-4"
          >
            Sicherheitshinweis {showSafety ? "ausblenden" : "anzeigen"}
          </button>
          {showSafety ? (
            <p className="mt-2 rounded-lg border border-veil bg-abyss/60 p-3 text-sm text-pearl/90">
              {card.safety_note}
            </p>
          ) : null}
        </div>
      ) : null}

      <fieldset className="mt-6">
        <legend className="mb-3 text-sm text-mist">Antworte nur für dich.</legend>
        <AnswerSelector value={interest} onChange={setInterest} />
      </fieldset>

      {needsDetails ? (
        <div className="mt-6 space-y-5 border-t border-veil/50 pt-5">
          {needsRole && roleOptions.length > 1 ? (
            <div>
              <p className="mb-2 text-sm text-mist">Welche Rolle spricht dich an?</p>
              <div className="flex flex-wrap gap-2">
                {roleOptions.map((r) => (
                  <Chip key={r} selected={role === r} onClick={() => setRole(r)}>
                    {ROLE_LABELS[r]}
                  </Chip>
                ))}
              </div>
            </div>
          ) : null}

          <RangeSlider
            label="Passender Intensitätsbereich"
            min={intensity.min}
            max={intensity.max}
            onChange={(min, max) => setIntensity({ min, max })}
          />

          <SegmentedControl
            label="Zeitpunkt"
            value={timing}
            onChange={setTiming}
            options={[
              { value: "open", label: "Offen" },
              { value: "soon", label: "Bald" },
              { value: "someday", label: "Irgendwann" },
              { value: "talk_first", label: "Erst sprechen" }
            ]}
          />

          {interest === "maybe_with_conditions" ? (
            <fieldset>
              <legend className="mb-2 text-sm text-mist">
                Deine Bedingungen bleiben privat.
              </legend>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((c) => (
                  <Chip
                    key={c.slug}
                    selected={conditions.includes(c.slug)}
                    onClick={() =>
                      setConditions((prev) =>
                        prev.includes(c.slug)
                          ? prev.filter((x) => x !== c.slug)
                          : [...prev, c.slug]
                      )
                    }
                  >
                    {c.label}
                  </Chip>
                ))}
              </div>
            </fieldset>
          ) : null}

          {card.requires_safety_confirmation ? (
            <label className="flex min-h-touch cursor-pointer items-start gap-3 rounded-lg border border-veil/60 bg-abyss/50 p-3">
              <input
                type="checkbox"
                checked={safetyConfirmed}
                onChange={(e) => setSafetyConfirmed(e.target.checked)}
                className="mt-0.5 h-5 w-5 accent-[rgb(var(--c-iris))]"
              />
              <span className="text-sm text-pearl/90">
                Ich habe den Sicherheitshinweis gelesen. Ein Match wäre eine Einladung
                zum Gespräch – keine Zustimmung.
              </span>
            </label>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={submit} disabled={!canSubmit}>
          Antwort speichern
        </Button>
        <Button variant="ghost" onClick={onSkip}>
          Überspringen
        </Button>
        <Button variant="ghost" onClick={onHide} aria-label="Dieses Thema dauerhaft ausblenden">
          Dauerhaft ausblenden
        </Button>
      </div>
      </article>
    </motion.div>
  );
}
