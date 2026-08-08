import type { SymbolForm } from "@/domain/questions/categories";
import { CATEGORY_META } from "@/domain/questions/categories";

/**
 * Eigenes abstraktes Symbolsystem – keine Icon-Bibliothek.
 * Jede Form ist eine bewusste Übersetzung des Themas:
 * gerichtete Linien für Kontrolle, verbundene Schleifen für Fesselung,
 * eine offene Ellipse für Beobachten, Wellen für Sensorik usw.
 * Alles Stroke-basiert auf 32×32, Farbe erbt über currentColor.
 */

const S = 1.6; // stroke width

const FORMS: Record<SymbolForm, JSX.Element> = {
  // Dominanz: gerichtete Linien laufen auf ein ruhiges Zentrum zu.
  directed: (
    <>
      <circle cx="16" cy="16" r="3.2" fill="currentColor" stroke="none" opacity="0.9" />
      <path d="M16 3v7M29 16h-7M16 29v-7M3 16h7" />
      <path d="M6.6 6.6l4.2 4.2M25.4 6.6l-4.2 4.2" opacity="0.45" />
    </>
  ),
  // Fesselung: zwei verbundene geschwungene Schleifen.
  loops: (
    <>
      <path d="M10 20c-3.5 0-5.5-2.6-5.5-5.2S6.8 9.5 9.6 9.5c3.4 0 4.9 2.8 6.4 5.3 1.5 2.5 3 5.2 6.4 5.2 2.8 0 5.1-2.2 5.1-5.2S25.5 9.6 22 9.6" />
      <path d="M13.4 22.8c.9 1 2 1.6 3.4 1.6" opacity="0.5" />
    </>
  ),
  // Kleidung: fallender Schleier.
  veil: (
    <>
      <path d="M8 5c0 6-2.5 9-2.5 14 0 4.6 3.4 8 7.2 8" />
      <path d="M16 4c0 7-3 10-3 15 0 4 2.6 8 6.5 8" opacity="0.75" />
      <path d="M24 5c0 6 2.4 9 2.4 13.6 0 3-1.4 5.4-3.6 6.8" opacity="0.5" />
    </>
  ),
  // Spanking: eine Kurve trifft auf einen Punkt, konzentrische Reaktion.
  impact: (
    <>
      <path d="M4 24C10 22 14 17 15.5 10" />
      <circle cx="21" cy="20" r="2" fill="currentColor" stroke="none" />
      <path d="M21 13.8a6.2 6.2 0 016.2 6.2" opacity="0.7" />
      <path d="M21 9.6A10.4 10.4 0 0131.4 20" opacity="0.35" />
    </>
  ),
  // Orgasmuskontrolle: Wellen, die kurz vor der Kante abbrechen.
  waves: (
    <>
      <path d="M3 12c3.5 0 3.5 3 7 3s3.5-3 7-3 3.5 3 7 3" opacity="0.5" />
      <path d="M3 19c3.5 0 3.5 3 7 3s3.5-3 7-3 3.5 3 6 3" />
      <path d="M26.5 20.5l3-1.6M26.8 24.2l3.2.4" opacity="0.7" />
    </>
  ),
  // Lob: Halo über einer offenen Form.
  halo: (
    <>
      <path d="M8.5 9.5a9.5 9.5 0 0115 0" opacity="0.9" />
      <path d="M11.5 13a5.8 5.8 0 019 0" opacity="0.5" />
      <path d="M16 18v9M12 23.5L16 27l4-3.5" />
    </>
  ),
  // Machtgefälle: Stufen abwärts, unten ein ruhender Punkt.
  descent: (
    <>
      <path d="M5 8h8v6h7v6h7" />
      <circle cx="24.5" cy="25" r="2.4" fill="currentColor" stroke="none" opacity="0.9" />
      <path d="M5 8v3M13 14v3M20 20v2.5" opacity="0.4" />
    </>
  ),
  // Toys: Objekt im Orbit zweier Bahnen.
  orbit: (
    <>
      <ellipse cx="16" cy="16" rx="12.5" ry="5.5" />
      <ellipse cx="16" cy="16" rx="12.5" ry="5.5" transform="rotate(64 16 16)" opacity="0.5" />
      <circle cx="16" cy="16" r="2.6" fill="currentColor" stroke="none" />
    </>
  ),
  // Teasing: Sanduhr aus zwei offenen Bögen, ein Tropfen dazwischen.
  hourglass: (
    <>
      <path d="M9 5h14c0 6-4.5 8.5-7 11-2.5-2.5-7-5-7-11z" />
      <path d="M9 27h14c0-6-4.5-8.5-7-11-2.5 2.5-7 5-7 11z" opacity="0.55" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  // Rituale/Besitz: Gefäß mit innerem Licht.
  vessel: (
    <>
      <path d="M10 6c0 3-3 4.5-3 9 0 6.5 4 11 9 11s9-4.5 9-11c0-4.5-3-6-3-9" />
      <circle cx="16" cy="17.5" r="3" opacity="0.7" />
      <path d="M16 13v-2" opacity="0.5" />
    </>
  ),
  // Rollenspiel: zwei überlagerte Konturen.
  contours: (
    <>
      <path d="M12.5 6a8.5 9.5 0 100 19 8.5 9.5 0 000-19z" opacity="0.55" />
      <path d="M19.5 7a8.5 9.5 0 100 19 8.5 9.5 0 000-19z" />
    </>
  ),
  // Sinnesentzug: geschlossene Lidlinie unter weichem Bogen.
  mask: (
    <>
      <path d="M4 14c3.5 4.5 7.8 6.8 12 6.8S24.5 18.5 28 14" />
      <path d="M9 19.5l-1.6 2.6M16 21.4V24.5M23 19.5l1.6 2.6" opacity="0.6" />
      <path d="M7 9.5c3-2.6 6-3.9 9-3.9s6 1.3 9 3.9" opacity="0.35" />
    </>
  ),
  // Beobachten: offene elliptische Form mit fokussiertem Kern.
  aperture: (
    <>
      <path d="M4.5 16C8 10 11.8 7.5 16 7.5S24 10 27.5 16" />
      <path d="M6.5 19.5c3 3.5 6.2 5 9.5 5 2 0 4-.5 5.8-1.6" opacity="0.45" />
      <circle cx="16" cy="15.6" r="3.4" />
      <circle cx="16" cy="15.6" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  // Uniform/Fotos: Rahmen mit Innenleben.
  frame: (
    <>
      <rect x="6" y="6" width="20" height="20" rx="2.5" />
      <path d="M6 20l5.5-5.5 4.5 4.5 4-4L26 21" opacity="0.7" />
      <circle cx="20.5" cy="11.5" r="1.4" fill="currentColor" stroke="none" opacity="0.8" />
    </>
  ),
  // Sprache/Digital: Signalbögen aus einem Punkt.
  signal: (
    <>
      <circle cx="9" cy="22" r="2.2" fill="currentColor" stroke="none" />
      <path d="M13.5 17.5a7.5 7.5 0 012.2 5.3" opacity="0.9" />
      <path d="M16.6 13.4a13 13 0 013.9 9.3" opacity="0.6" />
      <path d="M19.8 9.4a18.6 18.6 0 015.5 13.3" opacity="0.35" />
    </>
  ),
  // Orte: topografische Feldlinien.
  field: (
    <>
      <path d="M4 22c4-2 6-6.5 6-11" opacity="0.4" />
      <path d="M9 25c5-2.5 7.5-8 7.5-14" opacity="0.7" />
      <path d="M15 27c6-3 9-9.5 9-16.5" />
      <circle cx="24.5" cy="7.5" r="1.6" fill="currentColor" stroke="none" opacity="0.8" />
    </>
  ),
  // Service: eine sich neigende, tragende Form.
  kneel: (
    <>
      <path d="M6 24c6 0 8-4 8-9V8" />
      <path d="M14 15c4 0 6 2.5 6 6.5v3" opacity="0.7" />
      <path d="M24 10.5a3.5 3.5 0 100-0.01" opacity="0.9" />
      <circle cx="24" cy="7" r="2.6" />
    </>
  ),
  // Switch: Möbius-artige Endlosschleife.
  moebius: (
    <>
      <path d="M16 10c5 0 9.5 2.4 9.5 6s-4.2 6-8 6c-3.4 0-5-2-5-4s1.6-4 5-4c3.8 0 8 2.4 8 6" opacity="0.45" />
      <path d="M16 22c-5 0-9.5-2.4-9.5-6s4.2-6 8-6c3.4 0 5 2 5 4s-1.6 4-5 4c-3.8 0-8-2.4-8-6" />
    </>
  ),
  // Langsamkeit: ein einzelner, sehr langer ruhiger Bogen.
  slow: (
    <>
      <path d="M4 20C9 12 14 8.5 20 8.5c4.4 0 7.6 2.6 7.6 6.2 0 3-2.2 5.3-5 5.3-2.4 0-4-1.6-4-3.7" />
      <circle cx="18.6" cy="16.3" r="1.1" fill="currentColor" stroke="none" opacity="0.8" />
    </>
  ),
  // Körperliche Kontrolle: eine Form umschließt eine andere.
  grip: (
    <>
      <path d="M8 8c-2.6 2.2-4 5-4 8 0 6.6 5.4 12 12 12 3 0 5.8-1.1 8-3" />
      <path d="M24 24c2.6-2.2 4-5 4-8 0-6.6-5.4-12-12-12" opacity="0.45" />
      <circle cx="16" cy="16" r="4.2" />
    </>
  ),
  // Mehrere Erwachsene: drei Punkte, lose verbunden – als Gedanke.
  trine: (
    <>
      <circle cx="16" cy="8" r="2.6" />
      <circle cx="8" cy="23" r="2.6" opacity="0.75" />
      <circle cx="24" cy="23" r="2.6" opacity="0.75" />
      <path d="M14.6 10.4L9.3 20.6M17.4 10.4l5.3 10.2M11 23h10" opacity="0.35" strokeDasharray="2.5 3" />
    </>
  ),
  // Regeln: ein gesetztes Zeichen.
  sigil: (
    <>
      <path d="M16 4v24M8 9h16" />
      <path d="M10.5 14.5h11M12.5 20h7" opacity="0.55" />
      <circle cx="16" cy="26" r="1.6" fill="currentColor" stroke="none" opacity="0.8" />
    </>
  ),
  // Initiative: ein Funke verlässt die Ruhe.
  spark: (
    <>
      <circle cx="11" cy="21" r="4.6" opacity="0.6" />
      <path d="M15 17L25 7M25 7h-5.5M25 7v5.5" />
    </>
  ),
  // Nachsorge/Erniedrigung: schützende Hülle um einen Kern.
  shell: (
    <>
      <path d="M16 4c7 3 11 7.5 11 13 0 6-4.5 11-11 11S5 23 5 17C5 11.5 9 7 16 4z" />
      <circle cx="16" cy="17" r="3.6" opacity="0.75" />
    </>
  ),
  // Grenzen: klare Linie, respektierter Abstand.
  boundary: (
    <>
      <path d="M16 4v24" strokeDasharray="4 3.4" />
      <circle cx="8" cy="16" r="3.4" opacity="0.85" />
      <circle cx="24" cy="16" r="3.4" opacity="0.85" />
    </>
  ),
  // Reine Fantasie: eine Form, die sich auflöst.
  mist: (
    <>
      <path d="M9 20a7.5 7.5 0 1114.6-2.4" />
      <path d="M25 20.5h3M22.5 24h6.5M20 27.5h5" opacity="0.5" />
    </>
  )
};

type Props = {
  category: string;
  size?: number;
  className?: string;
  /** Nur dekorativ (Standard) oder mit zugänglichem Label. */
  labelled?: boolean;
};

export function CategorySymbol({ category, size = 22, className = "", labelled = false }: Props) {
  const meta = CATEGORY_META[category];
  const form = meta ? FORMS[meta.symbol] : FORMS.field;
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={S}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? "img" : undefined}
      aria-label={labelled ? meta?.label : undefined}
      className={className}
    >
      {form}
    </svg>
  );
}
