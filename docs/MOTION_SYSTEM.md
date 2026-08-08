# Motion-System

## Philosophie
Bewegung erzählt Bedeutung: Zwei getrennte Felder, die sich berühren. Ruhig, organisch, niemals Casino, niemals Konfetti. Sound existiert nicht.

## Tokens (tokens.css ↔ motionTokens.ts)
- fast 160 ms (Hover/Press), base 280 ms (Karten, Übergänge), slow 560 ms (Panels), reveal 1200 ms (Match-Reveal).
- ease-organic cubic-bezier(0.22,1,0.36,1); ease-drift für Lichtfelder.
- Distanzen 8/16/32 px.

## Schlüsselmomente
1. **Aurora-Hintergrund**: zwei driftende Lichtfelder (Canvas 2D, dpr-gedeckelt); statischer CSS-Gradient bei reduzierter Bewegung.
2. **Match-Reveal**: Iris- und Korallfeld gleiten aufeinander zu (1,2 s), Karte erscheint durch Blur-Maske; reduziert = einfacher Fade.
3. **Kartenwechsel**: sanftes Y+Scale, AnimatePresence mode="wait".
4. **Konstellation**: langsames SVG-Pulsieren (6 s), deaktiviert bei reduzierter Bewegung.

## Reduzierte Bewegung
Dreistufig: Systemeinstellung (prefers-reduced-motion) als Default, In-App-Override (Einstellungen). Hook `useReducedMotionPref` (useSyncExternalStore). Globaler CSS-Fallback killt zusätzlich alle Animationen auf Systemebene.
