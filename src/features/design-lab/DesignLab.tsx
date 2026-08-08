import { useState } from "react";
import { KINK_CATEGORIES, DEPTH_PRESETS } from "@/domain/questions/categories";
import { CategorySymbol } from "@/components/visuals/CategorySymbol";
import { AnswerSelector } from "@/features/discovery/AnswerSelector";
import { AuroraBackground, type BackgroundMood } from "@/components/motion/AuroraBackground";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import type { InterestLevel } from "@/domain/matching/types";
import { MOTION } from "@/components/motion/motionTokens";
import { OrganicField } from "@/components/visuals/OrganicField";
import { MutualSigil } from "@/components/visuals/MutualSigil";

/**
 * /design-lab – nur im Development Mode erreichbar (§40).
 * Zeigt Tokens, Symbole, Auswahlobjekte und Hintergrund-Stimmungen,
 * damit visuelle Details nicht in Produktionsscreens getestet werden müssen.
 */

const SWATCHES = [
  "void", "abyss", "smoke", "veil", "pearl", "mist", "lavender", "iris", "aqua", "coral", "danger"
] as const;

export function DesignLab() {
  const [mood, setMood] = useState<BackgroundMood>("discovery");
  const [answer, setAnswer] = useState<InterestLevel | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-12 px-4 py-10">
      <AuroraBackground intensity={0.5} mood={mood} />
      <header>
        <h1 className="font-display text-3xl text-pearl">Design Lab</h1>
        <p className="mt-1 text-sm text-mist">Nur im Development Mode sichtbar.</p>
      </header>

      <section aria-label="Farben">
        <h2 className="mb-3 font-display text-xl text-pearl">Farbwelt</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {SWATCHES.map((name) => (
            <div key={name} className="text-center">
              <div
                className="h-14 rounded-xl border border-veil/50"
                style={{ background: `rgb(var(--c-${name}))` }}
              />
              <p className="mt-1 text-xs text-mist">{name}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Typografie">
        <h2 className="mb-3 font-display text-xl text-pearl">Typografie</h2>
        <p className="font-display text-3xl text-pearl">Was euch beide reizt.</p>
        <p className="mt-2 text-pearl">Interface: Schibsted Grotesk Variable.</p>
        <p className="mt-1 text-sm text-mist">Sekundärtext in Mist, ausreichend groß.</p>
      </section>

      <section aria-label="Hintergrund-Stimmungen">
        <h2 className="mb-3 font-display text-xl text-pearl">Hintergrund-Stimmungen</h2>
        <div className="flex flex-wrap gap-2">
          {(["discovery", "reveal", "resonance", "consent", "settings"] as const).map((m) => (
            <Chip key={m} selected={mood === m} onClick={() => setMood(m)}>{m}</Chip>
          ))}
        </div>
      </section>

      <section aria-label="Visual Engine">
        <h2 className="mb-3 font-display text-xl text-pearl">OrganicField-Engine</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-44 overflow-hidden rounded-card border border-veil/50">
            <OrganicField converge={0.1} />
          </div>
          <div className="h-44 overflow-hidden rounded-card border border-veil/50">
            <OrganicField converge={0.85} colorB="255,140,123" interactive={false} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <MutualSigil size={40} />
          <span className="text-sm text-mist">Animiertes Sigil – zwei Konturen, eine Linse.</span>
        </div>
      </section>

      <section aria-label="Kategorie-Symbole">
        <h2 className="mb-3 font-display text-xl text-pearl">Kategorie-Symbole</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {KINK_CATEGORIES.map((c) => (
            <div key={c.slug} className="flex items-center gap-3 rounded-xl border border-veil/50 bg-smoke/70 p-3">
              <span className="text-lavender"><CategorySymbol category={c.slug} size={26} /></span>
              <span className="text-xs text-pearl/85">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Antwortauswahl">
        <h2 className="mb-3 font-display text-xl text-pearl">AnswerSelector</h2>
        <div className="max-w-md rounded-card border border-veil/60 bg-smoke/90 p-5">
          <AnswerSelector value={answer} onChange={setAnswer} />
        </div>
      </section>

      <section aria-label="Tiefen-Presets">
        <h2 className="mb-3 font-display text-xl text-pearl">Themenwelt-Tiefen</h2>
        <ul className="space-y-1 text-sm text-mist">
          {DEPTH_PRESETS.map((d) => (
            <li key={d.id}>
              <span className="text-pearl">{d.label}</span> – {d.categories.length} Kategorien
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Motion-Tokens">
        <h2 className="mb-3 font-display text-xl text-pearl">Motion</h2>
        <p className="text-sm text-mist">
          fast {MOTION.duration.fast}s · base {MOTION.duration.base}s · slow {MOTION.duration.slow}s ·
          reveal {MOTION.duration.reveal}s
        </p>
        <Button className="mt-3">Beispiel-Button</Button>
      </section>
    </div>
  );
}
