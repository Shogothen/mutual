import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ConsentCheckbox } from "@/components/ui/ConsentCheckbox";
import { DEPTH_PRESETS, DEFAULT_ENABLED } from "@/domain/questions/categories";
import { updatePrefs } from "@/lib/storage/prefs";
import { MOTION } from "@/components/motion/motionTokens";
import { useReducedMotionPref } from "@/hooks/useReducedMotion";
import { APP_CONFIG } from "@/config/app";

const CONSENT_ITEMS = [
  "Ich bin mindestens 18 Jahre alt.",
  "Ich nutze die App ausschließlich mit volljährigen Personen.",
  "Ein Match bedeutet keine automatische Zustimmung.",
  "Zustimmung kann jederzeit zurückgenommen werden.",
  "Ein Nein muss nicht begründet werden.",
  "Die App ersetzt kein persönliches Gespräch."
];

/** Five focused, emotional steps – never a legal form (§8). */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotionPref();
  const [step, setStep] = useState(0);
  const [consents, setConsents] = useState<boolean[]>(CONSENT_ITEMS.map(() => false));
  const [depth, setDepth] = useState<(typeof DEPTH_PRESETS)[number]["id"]>("kink");
  const allConsented = consents.every(Boolean);

  const steps = [
    <div key="0" className="text-center">
      <div aria-hidden className="relative mx-auto mb-8 h-28 w-28">
        <div className="absolute inset-0 rounded-[46%_54%_58%_42%/52%_44%_56%_48%] bg-iris/25 blur-md" />
        <div className="absolute inset-1 rounded-[46%_54%_58%_42%/52%_44%_56%_48%] border border-pearl/15 bg-abyss/60 backdrop-blur-sm" />
      </div>
      <h1 className="font-display text-3xl leading-tight text-pearl">
        Manche Gedanken sind leichter anzuklicken als auszusprechen.
      </h1>
      <p className="mt-4 text-mist">
        {APP_CONFIG.name} zeigt euch ausschließlich das, was euch beide interessiert.
      </p>
    </div>,
    <div key="1" className="text-center">
      <div aria-hidden className="relative mx-auto mb-8 h-32 w-56">
        <div className="absolute left-2 top-4 h-24 w-24 rounded-full bg-iris/25 blur-xl" />
        <div className="absolute right-2 top-4 h-24 w-24 rounded-full bg-coral/20 blur-xl" />
        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pearl/30 blur-sm" />
      </div>
      <h2 className="font-display text-2xl text-pearl">Du antwortest nur für dich.</h2>
      <p className="mt-4 text-mist">
        Deine Partnerperson sieht weder deine Auswahl noch übersprungene Fragen.
        Nur Übereinstimmungen werden sichtbar – ein Match entsteht erst, wenn eure
        Antworten miteinander kompatibel sind.
      </p>
    </div>,
    <div key="2">
      <h2 className="font-display text-2xl text-pearl">Ein Match ist eine Einladung. Keine Verpflichtung.</h2>
      <p className="mt-2 text-sm text-mist">
        Jede gemeinsame Idee kann jederzeit pausiert oder zurückgezogen werden.
        Diese Grundsätze gelten für euch beide.
      </p>
      <div className="mt-5 space-y-1">
        {CONSENT_ITEMS.map((item, i) => (
          <ConsentCheckbox
            key={item}
            label={item}
            checked={consents[i] ?? false}
            onChange={(v) => setConsents((c) => c.map((x, j) => (i === j ? v : x)))}
          />
        ))}
      </div>
    </div>,
    <div key="3" className="text-center">
      <h2 className="font-display text-2xl text-pearl">Seid ihr bereit, euch neu zu entdecken?</h2>
      <p className="mt-4 text-mist">
        Gleich kannst du eine Verbindung erstellen, einen Code eingeben oder einen
        QR-Code scannen. Alles ohne E-Mail-Adresse und ohne Klarnamen.
      </p>
    </div>,
    <div key="4">
      <h2 className="font-display text-2xl text-pearl">Wie tief möchtet ihr eintauchen?</h2>
      <p className="mt-2 text-sm text-mist">
        Ihr könnt Themen jederzeit aktivieren oder ausblenden. Eure Auswahl wird
        nicht als persönliche Antwort mitgeteilt.
      </p>
      <div className="mt-5 space-y-2" role="radiogroup" aria-label="Themenwelt-Tiefe">
        {DEPTH_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            role="radio"
            aria-checked={depth === preset.id}
            onClick={() => setDepth(preset.id)}
            className={`w-full rounded-xl border px-4 py-3 text-left transition-colors
              ${depth === preset.id ? "border-lavender bg-iris/15" : "border-veil/70 hover:border-mist/70"}`}
          >
            <span className="block text-sm text-pearl">{preset.label}</span>
            <span className="mt-0.5 block text-xs text-mist">{preset.description}</span>
          </button>
        ))}
      </div>
    </div>
  ];

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      const preset = DEPTH_PRESETS.find((d) => d.id === depth);
      updatePrefs({
        onboardingDone: true,
        depthPreset: depth,
        enabledCategories:
          depth === "custom" ? [...DEFAULT_ENABLED] : preset ? [...preset.categories] : null
      });
      onDone();
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: MOTION.distance.md }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: MOTION.duration.base, ease: MOTION.easeOrganic }}
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
      <div className="mt-10 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          Zurück
        </Button>
        <div aria-hidden className="flex gap-1.5">
          {steps.map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === step ? "bg-lavender" : "bg-veil"}`} />
          ))}
        </div>
        <Button onClick={next} disabled={step === 2 && !allConsented}>
          {step === steps.length - 1 ? "Los geht's" : "Weiter"}
        </Button>
      </div>
    </div>
  );
}
