# Matching-Engine

Autoritative Implementierung: `supabase/migrations/0004_matching.sql` (fn_interest_match, fn_roles_compatible, fn_match_score, submit_answer). Gespiegelte, getestete TS-Version: `src/domain/matching/`.

## Interest-Matrix
|            | no | not_now | fantasy | maybe | try | like |
|------------|----|---------|---------|-------|-----|------|
| no         | –  | –       | –       | –     | –   | –    |
| not_now    | –  | –       | –       | –     | –   | –    |
| fantasy    | –  | –       | shared_fantasy | conversation_value | conversation_value | conversation_value |
| maybe      | –  | –       | conversation_value | careful_curiosity | careful_curiosity | careful_curiosity |
| try        | –  | –       | conversation_value | careful_curiosity | clear_match | clear_match |
| like       | –  | –       | conversation_value | careful_curiosity | clear_match | strong_match |

`skipped`/`hidden` nehmen nie am Matching teil.

## Rollen
- symmetric / not_relevant: immer kompatibel.
- directional: Es muss mindestens eine initiierende UND eine empfangende Seite abgedeckt sein; `switching`/`both` decken beide Seiten ab. Zwei identische starre Richtungen (2× initiating oder 2× receiving) → kein Match.
- observer: Es müssen Beobachten UND Gesehen-Werden abgedeckt sein (receiving/both/switching decken Gesehen-Werden ab).
- switchable: identisch starr → kein Match; jede flexible Kombination → Match.

Bei Rollen-Inkompatibilität mit beidseitig positivem Interesse wird das Match zu conversation_value herabgestuft (Gesprächswert statt Verschweigen).

## Intensität
Gemeinsamer Bereich = [max(minA,minB), min(maxA,maxB)]. Leer → conversation_value. Das Match trägt nur den Überlappungsbereich.

## Score (intern, nie als Prozent angezeigt)
Basis: shared_fantasy 35, conversation_value 30, careful_curiosity 55, clear_match 80, strong_match 95. + Breite der Intensitätsüberlappung, − 2 bei talk_first, − 1 je Bedingungsseite. Clamp 0–100. Dient ausschließlich der Sortierung.

## Bedingungen und Privatsphäre
Bedingungs-Slugs bleiben in `answer_submissions` und tauchen in `match_results` NIE auf – dort steht nur `has_conditions boolean`. Ebenso wird bei fantasy+X nicht gespeichert oder angezeigt, WER nur Fantasie angegeben hat.

## Änderungs-Checkliste
1. Matrix in `src/domain/matching/interest.ts` UND `0004_matching.sql` ändern.
2. Unit-Tests erweitern (`engine.test.ts` enthält einen No-Leak-Test: Bedingungs-Slugs dürfen im Ergebnis-JSON nicht vorkommen).
3. Neue Migration statt Änderung alter Dateien.
