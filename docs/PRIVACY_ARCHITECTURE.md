# Privacy-Architektur

## Datenminimierung
Kein Name, keine E-Mail, kein Foto, kein Geburtsdatum. Ein Konto ist eine anonyme UUID. `profiles` enthält nur created_at/last_seen_at (tagesgenau für „heute aktiv").

## Datenflüsse
1. Antwort: Client → RPC `submit_answer` → eigene Zeile + serverinternes Matching → uniforme Antwort. Partnerantworten verlassen die DB nie.
2. Matches: RLS-geprüfter Select auf `match_results` (nur gemeinsame Felder: Typ, Überlappung, has_conditions, talk_first, Status).
3. Wünsche: `create_custom_wish` → Anzeige beim Partner via `fn_get_discovery_cards` ohne created_by.
4. Check-ins: privat; Teilen erzeugt einen separaten, bewusst schlanken `check_in_shares`-Eintrag mit fixer, neutraler Summary.
5. Realtime: nur das Ereignis „neue Zeile in match_results", Payload wird ignoriert, Daten kommen per Refetch.

## Lokale Daten
| Ort | Inhalt | Schutz |
|---|---|---|
| localStorage | UI-Präferenzen, Onboarding-Flag | unkritisch, keine Inhalte |
| IndexedDB `keys` | AES-Schlüssel (nicht extrahierbar), PIN-Record | WebCrypto |
| IndexedDB `pending_answers` | Offline-Antworten | AES-GCM-256 |
| Supabase Auth Storage | Session-Token | Standard-Supabase |

## Löschkonzept (alles endgültig, ohne Papierkorb)
- `delete_own_answers`: eigene Antworten + abhängige Matches.
- `delete_couple_matches`: Matches, Bestätigungen, Grenzen, Pläne.
- `dissolve_couple`: gesamte Verbindung inkl. aller gemeinsamen Daten.
- `delete_account`: Kaskade + auth.users-Zeile. Client löscht zusätzlich alle lokalen Stores.

## Keine Dritten
Kein Analytics, keine Werbung, keine externen Fonts-CDNs (Fonts sind gebundelt), keine Tracker. Einzige externe Verbindung: das eigene Supabase-Projekt.
