# Bedrohungsmodell (ehrlich)

## Schutzziele
1. Die Partnerperson darf Einzelantworten niemals sehen (Kernversprechen).
2. Dritte mit kurzem Gerätezugriff sollen nichts Verwertbares sehen.
3. Fremde dürfen keiner Verbindung beitreten oder Daten fremder Paare lesen.
4. Der Betreiber soll so wenig wie möglich wissen (Datenminimierung), auch wenn er technisch nicht ausgesperrt ist.

## Angreifer und Bewertung
| Angreifer | Schutz | Mechanismus |
|---|---|---|
| Partnerperson (neugierig, auch technisch versiert) | stark | RLS + serverseitiges Matching; uniforme RPC-Antworten; keine Timing-Differenzen im Antwortpfad; absenderlose Wünsche |
| Schultersurfer / App-Switcher | mittel–stark | Blickschutz-Blur, neutraler Name/Icon, App-Sperre |
| Person mit entsperrtem Gerät | mittel | PIN-Sperre (optional), Auto-Lock; ohne PIN: Restrisiko benannt |
| Netzwerkangreifer | stark | TLS überall |
| Anderer Nutzer der Plattform | stark | RLS, 128-Bit-Invites nur als Hash, Rate-Limit |
| DB-Admin / Supabase / Hoster | **nicht geschützt** | at-rest-Verschlüsselung, aber kein E2E; ehrlich in-App dokumentiert |
| Staatliche Anordnung | **nicht geschützt** | wie jeder gehostete Dienst |

## Bewusste Nicht-Ziele
- Ende-zu-Ende-Verschlüsselung: würde serverseitiges Matching in dieser Architektur verhindern (der Server muss beide Antworten vergleichen können). Ein zukünftiger Ansatz (z. B. PSI/holomorphe Verfahren) wäre ein eigenes Projekt.
- Anonymität der Wunsch-Urheberschaft bei nur zwei Personen: technisch absenderlos, psychologisch nie garantierbar – die App kommuniziert das ehrlich („ohne Absender angezeigt", nicht „anonym").

## Restrisiken
- Realtime-Metadaten: Ein Match-Insert verrät der Partnerperson, dass „irgendetwas" gematcht hat – das ist gewollt und inhaltsleer.
- Der Client kennt naturgemäß die EIGENEN Antworten; Gerätekompromittierung schlägt daher immer durch (mitigiert durch PIN/Blur/Neutralität).
