# Mitmachen

Danke für dein Interesse. Bevor du beiträgst, lies bitte docs/CONTENT_GUIDELINES.md und docs/SECURITY.md – die Doppelblind-Garantie ist nicht verhandelbar.

## Ablauf
1. Issue anlegen oder kommentieren, bevor du größere Änderungen beginnst.
2. Branch von `main`, kleine fokussierte PRs.
3. Lokal muss durchlaufen: `pnpm lint && pnpm typecheck && pnpm test -- --run && pnpm build`.
4. Änderungen an der Matching-Logik immer doppelt (TS + SQL) inkl. Tests, siehe docs/MATCHING_ENGINE.md.
5. Neue DB-Änderungen als neue nummerierte Migration, niemals bestehende editieren.

## Was wir nicht mergen
- Features, die Einzelantworten der Partnerperson sichtbar machen könnten (auch indirekt über Timing, Fehlermeldungen oder Metadaten).
- Engagement-Mechaniken mit Druck (Streaks, Erinnerungen im Stil „dein Partner wartet").
- Dritt-Tracking jeder Art.
