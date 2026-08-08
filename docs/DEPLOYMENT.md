# Deployment

## GitHub Pages (Standardweg)
1. Repo pushen, Pages-Source auf „GitHub Actions" stellen.
2. Secrets: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.
3. `deploy.yml` baut mit `VITE_BASE_PATH=/<repo>/` und deployed `dist/`.
4. Custom Domain: CNAME in den Pages-Settings; dann `VITE_BASE_PATH=/` im Workflow setzen.

## Warum HashRouter
Pages liefert für unbekannte Pfade 404 ohne Rewrites. HashRouter hält alle Routen client-seitig (`/#/resonanz`), inklusive Einladungs-Deep-Links. Kein 404.html-Kopier-Hack, keine doppelte Wartung.

## Supabase-Umgebungen
Empfohlen: zwei Projekte (staging/prod), Migrationen via `supabase db push` aus dem Repo. Anon-Key ist öffentlich; Sicherheit liegt in RLS. Realtime für `match_results` in jeder Umgebung aktivieren.

## PWA
`vite-plugin-pwa` generiert Manifest + Service Worker (App-Shell-Precache; Supabase-Requests laufen NetworkOnly und werden nie gecacht). Update-Strategie: autoUpdate.

## Rollback
Pages: vorherigen Workflow-Run re-deployen. DB: Migrationen sind additiv; für destruktive Änderungen immer neue Migration mit expliziter Begründung.
