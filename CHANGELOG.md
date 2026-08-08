# Changelog

## 0.2.0 – High-End-Redesign (unveröffentlicht)

- Fragenbibliothek vollständig ersetzt: 292 direkte Kink-Karten in 29 Kategorien,
  mit Rollenmodellen, Intensität 1–4, Sensitivität, Opt-in und Consent-Hinweisen
  (Migration 0006, Seeds 0002_part1–3, Similarity-Check-Script)
- Neue Farbwelt (Void/Obsidian/Ink, Ultraviolet, Aqua), Grain- und Vignette-Utilities
- AnswerSelector: drei Antwortgruppen mit eigener Formensprache statt sechs Buttons
- 26 eigene abstrakte SVG-Kategorie-Symbole, stimmungsbasierte Hintergründe je Bereich
- Match Reveal als 9-Phasen-Choreografie (überspringbar, ≤ 2,5 s, Haptik)
- Themenwelten: Tiefen-Presets im Onboarding, Kategorie-Verwaltung in den
  Einstellungen, SensitiveContentGate für Opt-in-Themen
- Pairing-Hero mit §9-Copy und pointer-reaktivem Zwei-Felder-Visual,
  schwebende Navigation, /design-lab (nur DEV), Haptik-Einstellung

## 0.1.0 – Initial Build
- Vollständige App-Struktur: Onboarding, Pairing (Code/QR/Link), Entdecken (162 Karten, 18 Kategorien), Doppelblind-Matching serverseitig, Resonanz (Liste + Konstellation), Match-Reveal, private Rückbestätigung, Gemeinsam (Grenzen mit Doppelbestätigung), eigene Wünsche ohne Absender, Check-ins, Impulse, Einstellungen inkl. granularer endgültiger Löschung.
- Supabase: 5 Migrationen (Schema, RLS default-deny, Pairing mit Hash-Invites + Rate-Limit, Matching-Engine als SECURITY-DEFINER-RPC, Löschfunktionen), Seed mit 162 Karten, RLS-Angriffstests, Edge-Function-Wrapper.
- Privacy: Blickschutz, PIN-App-Sperre (PBKDF2), AES-GCM-Offline-Queue, neutrale PWA, keine Tracker.
- Design/Motion-Token-System, reduzierte Bewegung dreistufig, WCAG-2.2-AA-orientierte Umsetzung.
- CI (Lint/Typecheck/Tests/Build) und Pages-Deploy-Workflow, 51 Unit-Tests grün.
