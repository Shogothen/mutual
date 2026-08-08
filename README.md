# MUTUAL

**Nur was euch beide bewegt, wird sichtbar.**

Eine private Web-App für Paare, die gemeinsame Wünsche, Fantasien und Grenzen entdecken wollen – ohne dass eine Person jemals die Einzelantworten der anderen sieht. Echtes Doppelblind-Matching, serverseitig erzwungen.

> Der Produktname ist ein Arbeitstitel und in `src/config/app.ts` zentral austauschbar.

---

## Inhalt

1. [Produktidee](#produktidee)
2. [Feature-Überblick](#feature-überblick)
3. [Tech-Stack](#tech-stack)
4. [Architektur](#architektur)
5. [Lokales Setup](#lokales-setup)
6. [Supabase-Setup](#supabase-setup)
7. [Umgebungsvariablen](#umgebungsvariablen)
8. [Entwicklung](#entwicklung)
9. [Tests](#tests)
10. [Deployment auf GitHub Pages](#deployment-auf-github-pages)
11. [Projektstruktur](#projektstruktur)
12. [Matching-Engine](#matching-engine)
13. [Sicherheit und Privatsphäre](#sicherheit-und-privatsphäre)
14. [Ehrliches Bedrohungsmodell](#ehrliches-bedrohungsmodell)
15. [Barrierefreiheit](#barrierefreiheit)
16. [Design- und Motion-System](#design--und-motion-system)
17. [Content-Richtlinien](#content-richtlinien)
18. [Rechtliches](#rechtliches)
19. [Roadmap / bewusst offen gelassen](#roadmap--bewusst-offen-gelassen)
20. [Lizenz und Beitrag](#lizenz-und-beitrag)

---

## Produktidee

Viele Paare tragen Wünsche mit sich, die sie aus Angst vor Zurückweisung nie aussprechen. MUTUAL löst das mit einem Doppelblind-Prinzip: Beide beantworten dieselben Themen unabhängig und privat. Sichtbar wird ausschließlich, was **beide** interessiert. Ein „Nein" bleibt für immer unsichtbar – niemand erfährt je, dass die andere Person etwas abgelehnt hat.

Ein Match ist dabei nie eine Zustimmung, sondern eine **Einladung zum Gespräch**. Die App drängt nie, gamifiziert nicht mit Streaks oder Druck und behandelt Zustimmung als fortlaufenden Prozess (Consent-Statusmaschine, private Rückbestätigung, beidseitig bestätigte Grenzen).

## Feature-Überblick

- **Entdecken**: 292 kuratierte deutsche Karten in 29 Kategorien, progressiv sortiert (niedrigschwellig zuerst). 6 Antwortoptionen inkl. „Nur als Fantasie" und „Vielleicht, unter Bedingungen" mit 10 vordefinierten privaten Bedingungen, Rollenpräferenz, Intensitätsbereich (1–5), Zeitpunkt.
- **Resonanz**: Matches als Liste oder ruhige Konstellation (SVG, tastaturbedienbar). 5 Match-Typen, niemals Prozentwerte, niemals Ranglisten.
- **Match-Reveal**: Zwei Lichtfelder finden zueinander; reduzierte Bewegung = ruhiger Fade.
- **Private Rückbestätigung**: Nach jedem Match entscheidet jede Person privat (sprechen / Fantasie behalten / unsicher / nicht aktuell / ausblenden). Der gemeinsame Bereich öffnet sich nur bei beidseitigem Gesprächswunsch.
- **Gemeinsam**: Bestätigte Themen, Grenzen mit Doppelbestätigung (Schweigen ist nie Zustimmung).
- **Eigene Wünsche**: Strukturierte Karten, die ohne Absender im Deck der Partnerperson erscheinen.
- **Check-ins**: Private Befindlichkeitsfragen; geteilt wird nur auf ausdrücklichen Wunsch. Bei Unwohlsein: Optionen statt Automatismen, inkl. Hinweise auf externe Hilfe.
- **Impulse**: Gesprächsanstöße ohne jede Aufzeichnung.
- **Pairing**: Anonyme Konten (keine E-Mail), Einladungscode (128 Bit, nur als Hash gespeichert, 48 h gültig, einmalig, ratenlimitiert), QR-Code und Link.
- **Privatsphäre-Features**: Blickschutz-Blur, App-Sperre (PIN, PBKDF2), neutraler PWA-Name, granulare endgültige Löschung (Antworten / Matches / Verbindung / Konto).
- **PWA**: Installierbar, App-Shell offline, verschlüsselte Offline-Antwort-Queue (AES-GCM in IndexedDB) mit Flush bei Reconnect.

## Tech-Stack

React 18 + TypeScript (strict) · Vite 5 · Tailwind CSS · Framer Motion · React Router (HashRouter) · TanStack Query · Zustand · Zod · Supabase (Anonymous Auth, Postgres + RLS, RPC, Realtime, Edge Function) · Vitest + Testing Library · Playwright · vite-plugin-pwa · pnpm

## Architektur

Kernprinzip: **Der Client kennt nur die eigenen Antworten und die gemeinsamen Matches.**

```
Client (React)                        Supabase
┌──────────────────────┐              ┌─────────────────────────────────┐
│ eigene Antworten     │──rpc────────▶│ submit_answer (SECURITY DEFINER)│
│ (nie Partnerdaten)   │              │  1. eigene Antwort speichern    │
│                      │              │  2. Partnerantwort lesen (DB)   │
│ match_results        │◀──select─────│  3. Matching + Score            │
│ (RLS: nur Mitglieder)│              │  4. match_results upsert/delete │
│                      │◀──realtime───│  Antwort: immer {recorded}      │
└──────────────────────┘              └─────────────────────────────────┘
```

- Die Matching-Logik lebt **doppelt**: als Postgres-Funktionen (autoritativ, `supabase/migrations/0004_matching.sql`) und als pure TypeScript-Library (`src/domain/matching/`) für Unit-Tests. Beide implementieren exakt dieselbe Matrix.
- RLS verhindert auf Zeilenebene jeden Zugriff auf Partnerantworten; es existiert **kein** API-Pfad, der sie liefert (Details: `docs/SECURITY.md`, Tests: `supabase/tests/rls_test_cases.sql`).
- `submit_answer` antwortet immer identisch (`{status:'recorded'}`) – auch Timing/Fehlerbilder verraten nichts über den Partnerstand.
- Realtime meldet nur neutral „etwas Neues" auf `match_results`-Inserts.

Mehr: `docs/ARCHITECTURE.md`, `docs/MATCHING_ENGINE.md`, `docs/DATABASE.md`.

## Lokales Setup

Voraussetzungen: Node 22+, pnpm 9+, ein Supabase-Projekt (kostenloser Tier reicht).

```bash
pnpm install
cp .env.example .env          # Werte eintragen, siehe unten
pnpm dev                      # http://localhost:5173
```

Ohne konfiguriertes Supabase zeigt die App einen klaren Hinweis statt kryptischer Fehler.

## Supabase-Setup

1. Projekt auf [supabase.com](https://supabase.com) anlegen.
2. **Authentication → Providers → Anonymous sign-ins aktivieren.**
3. SQL-Editor: Migrationen in Reihenfolge ausführen:
   `0001_schema.sql` → `0002_rls_policies.sql` → `0003_pairing.sql` → `0004_matching.sql` → `0005_deletion.sql`, dann `supabase/seed/0001_question_cards.sql`.
   Alternativ per CLI: `supabase db push` und `supabase db seed`.
4. Realtime für Tabelle `match_results` aktivieren (Database → Replication).
5. Optional: Edge Function deployen: `supabase functions deploy submit-answer` (die App nutzt standardmäßig den direkten RPC; die Function ist ein optionaler HTTP-Wrapper).
6. RLS-Sicherheitstests laufen lassen: `psql "$DB_URL" -f supabase/tests/rls_test_cases.sql` – erwartete Ausgabe: `ALL RLS TESTS PASSED`.

## Umgebungsvariablen

| Variable | Pflicht | Beschreibung |
|---|---|---|
| `VITE_SUPABASE_URL` | ja | Projekt-URL, z. B. `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ja | Public-Anon-Key (kein Service-Role-Key! Dieser gehört niemals in den Client) |
| `VITE_BASE_PATH` | nur Pages | Basis-Pfad des Builds, z. B. `/mutual/` für `https://user.github.io/mutual/` |

Für den Deploy-Workflow werden `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` als **GitHub Actions Secrets** hinterlegt.

## Entwicklung

```bash
pnpm dev          # Dev-Server
pnpm typecheck    # tsc strict
pnpm lint         # ESLint (no-console ist ein Fehler)
pnpm format       # Prettier
pnpm build        # Produktions-Build inkl. PWA
pnpm preview      # Build lokal testen
```

## Tests

```bash
pnpm test -- --run           # Vitest: Domain (Matching, Consent), Validierung, Krypto
pnpm test:e2e                # Playwright (benötigt echtes Supabase, siehe Hinweis)
```

- **Unit**: vollständige Interest-Matrix (alle 36 Kombinationen), Rollen-Kompatibilitätsmatrix, Intensitätsüberlappung, Score-Berechnung, Consent-Statusübergänge, Zod-Schemata, PIN-Hashing. 51 Tests.
- **RLS**: `supabase/tests/rls_test_cases.sql` simuliert 8 Angriffsszenarien (Partnerantworten lesen, fremde Paare, Invite-Hashes, manipulierte Inserts, Drittbeitritt, Code-Raten).
- **E2E**: Playwright-Specs für Onboarding-Gate und den Zwei-Personen-Matchflow über zwei isolierte Browserkontexte. Sie benötigen bewusst ein echtes Backend – die App ist server-autoritativ, ein Mock würde genau die Garantien wegmocken, die getestet werden sollen.

## Deployment auf GitHub Pages

1. Repository pushen, in den Repo-Settings **Pages → Source: GitHub Actions** wählen.
2. Secrets `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` anlegen.
3. Push auf `main` löst `deploy.yml` aus; `VITE_BASE_PATH` wird automatisch auf `/<repo-name>/` gesetzt.
4. Routing: Die App nutzt **HashRouter** (`#/resonanz`), damit Deep Links auf Pages ohne Server-Rewrites funktionieren – inklusive Einladungslinks `#/join/CODE`. Kein 404-Hack nötig.

## Projektstruktur

```
src/
  app/            App-Shell, Routen-Gate, Layout
  components/     ui/ (Buttons, Cards, …), motion/, privacy/
  config/         app.ts – Name, Betreiber, Feature-Flags
  domain/         Reine Logik: questions/, matching/, consent/ (+ Tests)
  features/       auth, onboarding, pairing, discovery, matching, resonance,
                  shared-space, wishes, checkins, impulses, settings, legal
  hooks/          useAppLock, useReducedMotion
  lib/            crypto/ (AES-GCM, PIN), storage/ (IndexedDB, Prefs),
                  supabase/, validation/
  styles/         tokens.css (alle Farben/Motion), global.css
supabase/
  migrations/     0001–0005 (Schema, RLS, Pairing, Matching, Löschung)
  seed/           292 Karten
  functions/      submit-answer (Edge Function)
  tests/          RLS-Angriffstests
docs/             12 Detail-Dokumente
e2e/              Playwright-Specs
```

## Matching-Engine

Kurzfassung der Regeln (vollständig in `docs/MATCHING_ENGINE.md`):

- `Nein` → niemals ein Match, niemals sichtbar.
- `Nicht jetzt` → kein Match, Thema kann später erneut erscheinen.
- `Fantasie` + `Fantasie` → **Gemeinsame Fantasie** (explizit nicht zur Umsetzung).
- `Fantasie` + (`Ausprobieren`/`Mag ich`) → **Gesprächswert**, klar als „eine Person nur als Fantasie" gekennzeichnet – ohne zu verraten, wer.
- `Vielleicht` + `Vielleicht/Ausprobieren/Mag ich` → **Vorsichtige Neugier**, Bedingungen bleiben privat; sichtbar ist nur „es gibt Bedingungen".
- `Ausprobieren`+`Ausprobieren`, `Ausprobieren`+`Mag ich` → **Klares Match**; `Mag ich`+`Mag ich` → **Starkes Match**.
- Rollen: symmetrisch / direktional (Komplement nötig) / Beobachter / wechselbar; `wechselnd/beides` ist mit allem kompatibel, zwei identische starre Richtungen matchen nicht.
- Intensität: gematcht wird nur der **Überlappungsbereich**; ohne Überlappung → Gesprächswert.
- Interner Score (0–100) dient nur der Sortierung und wird nie als Prozentzahl angezeigt.

## Sicherheit und Privatsphäre

- Anonyme Konten, keine E-Mail, keine Klarnamen, keine Profilfotos.
- Invite-Codes: 128 Bit Zufall, serverseitig nur SHA-256-Hash, 48 h TTL, Einmalnutzung, 5 Versuche / 15 min, generische Fehlermeldungen.
- RLS default-deny auf allen 17 Tabellen; `pairing_invites` ist für Clients komplett unlesbar.
- Antworten: eigene Zeilen lesbar/schreibbar, Partnerzeilen für den Client nicht existent.
- Lokale Daten: Offline-Queue AES-GCM-verschlüsselt (nicht-extrahierbarer Schlüssel in IndexedDB), PIN via PBKDF2 (310 000 Iterationen, SHA-256, zufälliges Salt).
- Kein drittes Analytics, keine Tracker, keine Werbung. `audit_events` speichert ausschließlich Ereignistypen ohne Inhalte.
- CI erzwingt Lint/Typecheck/Tests; `no-console` ist ein Lint-Fehler (kein versehentliches Logging sensibler Daten).

## Ehrliches Bedrohungsmodell

Diese App ist **nicht** Ende-zu-Ende-verschlüsselt, und das behaupten wir auch nirgends:

| Schutz gegen | Status |
|---|---|
| Partnerperson sieht Einzelantworten | ✅ technisch ausgeschlossen (RLS + serverseitiges Matching, kein API-Pfad) |
| Dritte mit Gerätezugriff | ✅ optional PIN-Sperre, Blickschutz, neutraler App-Name |
| Netzwerk-Mitleser | ✅ TLS |
| Fremde Paare / andere Nutzer | ✅ RLS |
| Datenbank-Administrator / Supabase-Betreiber | ❌ könnte Inhalte technisch einsehen (at-rest-Verschlüsselung, aber kein E2E) |
| Rechtlich erzwungene Herausgabe | ❌ wie jeder gehostete Dienst |

Diese Grenzen stehen wörtlich in der App unter „Sicherheit und Vertrauen". Vollständig: `docs/THREAT_MODEL.md`.

## Barrierefreiheit

WCAG 2.2 AA als Ziel: vollständige Tastaturbedienung (inkl. Konstellation, mit Listen-Alternative), sichtbare Fokusringe, ARIA-Labels und Live-Regions, Antwortoptionen nie nur über Farbe unterscheidbar, Touch-Ziele ≥ 44 px, `prefers-reduced-motion` + In-App-Schalter, Kontraste der Token-Palette geprüft. Details: `docs/ACCESSIBILITY.md`.

## Design- und Motion-System

Dunkle, luxuriöse Ruhe: Obsidianblau/Violett/Anthrazit, Perlweiß, Lavendel/Iris, sehr sparsames Korall nur für Resonanzmomente. Fraunces (Display) + Schibsted Grotesk (Interface). Alle Farben und Motion-Werte leben ausschließlich in `src/styles/tokens.css` bzw. `motionTokens.ts`. Animationen sind langsam, organisch, bedeutungsvoll – niemals Casino. Details: `docs/DESIGN_SYSTEM.md`, `docs/MOTION_SYSTEM.md`.

## Content-Richtlinien

Alle 292 Karten: respektvoll, erwachsen, klar, genderinklusiv, niemals vulgär oder pornografisch, niemals wertend. Risikothemen tragen Sicherheitshinweise und teils eine Pflicht-Kenntnisnahme. Regeln für neue Karten: `docs/CONTENT_GUIDELINES.md`.

## Rechtliches

Die Seiten Impressum, Datenschutz, Nutzungsbedingungen und „Sicherheit und Vertrauen" sind als strukturierte Platzhalter implementiert und in `src/features/legal/LegalPage.tsx` sowie `src/config/app.ts` mit `TODO LEGAL REVIEW` markiert. **Vor einem echten Launch ist eine juristische Prüfung zwingend** (Impressumspflicht, DSGVO, AGB, Altersverifikations-Anforderungen). Die App richtet sich ausschließlich an Volljährige.

## Roadmap / bewusst offen gelassen

- WebAuthn/Passkey-Sperre (PIN-Sperre ist implementiert; Gerüst in `docs/SECURITY.md` beschrieben)
- Gemeinsame Planung („dieses Wochenende / bald / irgendwann") über die Grenzen hinaus
- Premium-Feature-Flags sind in `APP_CONFIG.features.premium` vorbereitet, aber nicht erzwungen
- Mehrsprachigkeit (Copy ist zentralisiert, aber noch nicht über i18n-Framework)

## Lizenz und Beitrag

Lizenz: siehe `LICENSE` (Platzhalter – vor Veröffentlichung festlegen). Beiträge: `CONTRIBUTING.md`. Sicherheitsmeldungen: `SECURITY.md`.
