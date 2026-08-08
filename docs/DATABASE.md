# Datenbank

17 Tabellen, Migrationen 0001–0005 (additiv, nummeriert). Wichtigste Strukturen:

- **couples / couple_members**: Verbindung; partieller Unique-Index erzwingt genau eine aktive Verbindung pro Person; `redeem_invite` erzwingt max. 2 aktive Mitglieder (FOR UPDATE gegen Races).
- **pairing_invites**: nur code_hash (bytea, unique), expires_at, redeemed_at/by. Keine Client-Policies. **invite_attempts** für Rate-Limits.
- **question_cards**: 162 Seed-Karten; category/intensity/risk/role_model mit Check-Constraints; allowed_roles Array; safety_note + requires_safety_confirmation.
- **answer_submissions**: unique(couple,user,question); interest_level inkl. skipped/hidden; role, intensity_min/max, timing, conditions text[], answer_version für Konfliktauflösung.
- **match_results**: unique(couple,question); nur gemeinsame Felder; status mit Check auf die Statusmaschine; Trigger erlaubt Clients ausschließlich Status-Updates.
- **match_confirmations**: private Rückbestätigung, unique(match,user), RLS own-rows – die Partnerperson kann sie nie lesen.
- **shared_boundaries**: proposed_by/responded_by mit Check responded_by ≠ proposed_by → echte Doppelbestätigung.
- **shared_plans**, **check_ins** (privat) / **check_in_shares** (explizit geteilt), **custom_wishes**, **user_settings**, **audit_events** (nur Ereignistypen), **data_deletion_requests** (Nachvollziehbarkeit der Löschung, ohne Inhalte).

Alle Fremdschlüssel mit `on delete cascade` in Richtung couple/user, damit die Löschfunktionen vollständig aufräumen. Seeds sind idempotent nicht nötig (einmalige Initialbefüllung); neue Karten kommen als neue Seed-Dateien.
