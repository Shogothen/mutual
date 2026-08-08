# High-End-Audit (v2)

Ausgangspunkt: funktionierender v1-Prototyp, visuell und inhaltlich unter Zielniveau.

## Zentrale Befunde

| Bereich | Befund v1 | Maßnahme v2 |
| --- | --- | --- |
| Fragenbibliothek | 162 Karten, zu vorsichtig, Paartherapie-Ton, kaum konkrete Kinks | Vollständig ersetzt: 292 direkte Karten in 29 Kategorien, Rollen, Intensität 1–4, Opt-in-Flags |
| Antwortauswahl | 6 gleichförmige Buttons, implizite Wertungsachse | Eigenes AnswerSelector-Objekt mit 3 Gruppen (Grenze / Offenheit / Interesse), eigener Formensprache, Ripple |
| Farbwelt | Solide, aber zu grau-gedeckt | Void/Obsidian/Ink-Tiefe, Ultraviolet, Aqua, sparsames Coral; Grain + Vignette |
| Hintergrund | Ein statisches Aurora-Setup | Stimmungen je Bereich (discovery/reveal/resonance/consent/settings), Resonanzform im Überlappungsraum, Tab-Pause |
| Match Reveal | Einfache Fade-Karte | 9-Phasen-Choreografie ≤ 2,5 s, überspringbar, Membran-Öffnung, Haptik, Copy je Match-Typ |
| Kategorie-Symbole | Keine (nur Text) | 26 eigene abstrakte SVG-Formen, Stroke-basiert, semantisch begründet |
| Navigation | Standard-Tab-Bar | Schwebende dunkle Leiste, eigene SVG-Zeichen, lokales Licht am aktiven Element |
| Progressive Tiefe | Kategorie-Chips ohne Konzept | Tiefen-Presets (§21) im Onboarding + Themenwelten in den Einstellungen + SensitiveContentGate |
| Startscreen | Technischer Pairing-Dialog | Hero mit Headline/Subline/Privacy-Hinweis (§9.1) und pointer-reaktivem Zwei-Felder-Visual |
| Content-QS | Keine | scripts/content-similarity.mjs (Jaccard, Schwelle 0,6, CI-tauglich mit Exit-Code) |

## Bekannte Restpunkte

- Playwright-E2E und Visual-Regression benötigen eine echte Supabase-Instanz mit ausgeführten Migrationen (0001–0006) und Seeds.
- Rechtstexte sind weiterhin geprüfte Platzhalter (TODO LEGAL REVIEW).
- WebGL/R3F bewusst nicht eingesetzt: Canvas 2D + SVG erfüllen die Metapher bei besserer Performance und einfacherem Reduced-Motion-Fallback.
- Sound-Design nicht implementiert (Spec §35: optional, standardmäßig aus).
