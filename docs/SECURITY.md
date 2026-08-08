# Sicherheit

## Serverseitig
- **RLS default-deny** auf allen Tabellen; Policies in `0002_rls_policies.sql`, Angriffstests in `supabase/tests/rls_test_cases.sql`.
- `answer_submissions`: select/insert/update nur `user_id = auth.uid()`. Es existiert kein Pfad zu Partnerzeilen.
- `pairing_invites`/`invite_attempts`: keinerlei Client-Policies – nur SECURITY-DEFINER-Funktionen greifen zu.
- `match_results`: select für Paar-Mitglieder; update nur `status` (Trigger `tg_match_status_only` blockt alles andere); insert/delete nur durch die Engine.
- `custom_wishes`: Autor sieht eigene; die Partnerperson erhält sie ausschließlich absenderlos über `fn_get_discovery_cards`.
- SECURITY-DEFINER-Funktionen setzen `search_path = public, extensions`, validieren jeden Input, sperren mit `FOR UPDATE` gegen Race-Conditions (Doppelbeitritt, paralleles Matching) und werfen generische Fehler (`invalid_or_expired`).

## Invite-Flow
128-Bit-Zufallscode (gen_random_bytes(16), hex). Gespeichert wird nur SHA-256. TTL 48 h (konfigurierbar), Einmalnutzung, max. 5 Versuche pro Nutzer je 15 Minuten (`invite_attempts`), generische Fehlermeldung unabhängig von der Ursache.

## Clientseitig
- Anon-Key ist public by design; Sicherheit hängt ausschließlich an RLS (deshalb die Angriffstests).
- Service-Role-Key existiert nirgends im Client oder in CI-Logs.
- Offline-Queue: AES-GCM-256, Schlüssel als nicht-extrahierbarer CryptoKey in IndexedDB (`extractable:false`).
- App-Sperre: PBKDF2-SHA-256, 310 000 Iterationen, 16-Byte-Salt, konstantzeitiger Vergleich über WebCrypto. WebAuthn ist als Ausbaustufe vorgesehen (Platzhalter-Flag in APP_CONFIG.lock).
- Kein `console.log` (Lint-Error), keine sensiblen Daten in URLs (Invite-Code steht nur im Hash-Fragment, das nicht an Server übertragen wird; nach Redeem wird es entfernt/ersetzt).

## Meldeweg
Sicherheitslücken bitte gemäß SECURITY.md im Repo-Root (Kontakt des Betreibers) melden, nicht als öffentliches Issue.
