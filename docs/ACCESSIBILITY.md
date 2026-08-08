# Barrierefreiheit (Ziel: WCAG 2.2 AA)

## Umgesetzt
- Vollständige Tastaturbedienung; Konstellation: fokussierbare SVG-Knoten mit Enter/Space UND gleichwertige Listenansicht.
- Sichtbare Fokusringe global (:focus-visible, Lavendel, 2 px).
- Antwortoptionen: Text + Icon + Screenreader-Label; Zustand nie nur über Farbe.
- Semantik: radiogroup/radio für Antworten, fieldset/legend, dialog-Element mit Fokusfalle, aria-live für Speichern/Filterergebnisse, Skip-Link.
- Touch-Ziele ≥ 44 px (Tailwind-Token `touch`).
- Reduzierte Bewegung: Systempräferenz + In-App-Schalter; alle Animationen haben ruhige Fallbacks.
- Kontraste der Palette AA-konform (Werte in DESIGN_SYSTEM.md).
- Formulare: sichtbare Labels, Fehltexte mit role="alert".

## Bekannte offene Punkte
- Screenreader-Feinschliff der Konstellation (Gruppenbeschreibung vorhanden, Pfad-Navigation könnte reicher sein) – Listenansicht ist der verlässliche Weg.
- Automatisierte a11y-Tests (axe) sind noch nicht in CI verdrahtet.
