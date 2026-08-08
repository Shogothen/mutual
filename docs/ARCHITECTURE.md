# Architektur

## Überblick
Single-Page-App (React 18, Vite) + Supabase als Backend (Postgres, RLS, RPC, Realtime, anonyme Auth). Statisches Hosting auf GitHub Pages. Kein eigener Server.

## Verantwortlichkeiten
- **Client**: UI, eigene Antworten erfassen, Matches anzeigen, lokale Verschlüsselung (Queue, PIN). Der Client enthält KEINE Matching-Entscheidungslogik für echte Daten.
- **Postgres (SECURITY DEFINER RPCs)**: `submit_answer` speichert die eigene Antwort, liest die Partnerantwort DB-intern, berechnet das Match und schreibt/löscht `match_results`. `create_couple_with_invite`, `redeem_invite`, `fn_get_discovery_cards`, `create_custom_wish`, Löschfunktionen.
- **RLS**: default-deny; own-rows für Antworten; couple-scope für Matches/Grenzen/Pläne; komplett gesperrt für Invite-Hashes.
- **Edge Function** `submit-answer`: optionaler HTTP-Wrapper um den RPC (läuft mit Caller-JWT, kein Service-Role).
- **Realtime**: INSERT auf `match_results` → neutraler Toast, danach regulärer, RLS-geprüfter Refetch.

## Warum die Matching-Logik doppelt existiert
Autoritativ in SQL (0004_matching.sql), gespiegelt als pure TS-Library (`src/domain/matching/`) mit vollständigen Unit-Tests. Die TS-Version dient Tests und künftig einem Demo-Modus; sie erhält niemals echte Partnerdaten. Beide implementieren dieselbe Matrix; Änderungen müssen immer in beiden erfolgen (Checkliste in MATCHING_ENGINE.md).

## Routing
HashRouter, weil GitHub Pages keine Server-Rewrites bietet. Deep Links (`#/join/CODE`, `#/resonanz`) funktionieren dadurch ohne 404-Workarounds. Trade-off dokumentiert und akzeptiert.

## State
- Serverzustand: TanStack Query (staleTime 30 s, Invalidation nach Mutationen).
- UI-Zustand: lokal / Zustand (Toast).
- Persistente Präferenzen (unkritisch): localStorage `mutual.prefs.v1`.
- Sensibel lokal: IndexedDB mit AES-GCM (Offline-Queue), PIN-Record (Hash+Salt).

## Fehlerbehandlung
Diskrete deutsche Fehlertexte ohne Informationsleck (Pairing-Fehler sind bewusst generisch). `submit_answer` antwortet uniform. Offline: Antworten landen verschlüsselt in der Queue und werden bei Reconnect geflusht (Konfliktauflösung über answer_version, letzter Stand gewinnt).
