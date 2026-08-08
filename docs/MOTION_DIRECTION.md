# Motion Direction (v2)

## Tokens
fast 160 ms · base 280 ms · slow 560 ms · reveal 1200 ms;
ease-organic cubic-bezier(0.22,1,0.36,1) · ease-drift cubic-bezier(0.45,0,0.15,1).
Gespiegelt in motionTokens.ts und tokens.css.

## Prinzipien
Jede Bewegung hat eine Funktion: räumliche Beziehung, Bestätigung, Spannungsaufbau,
Statuswechsel. Keine Konfetti-, Bounce- oder Spielautomaten-Effekte. Häufige Aktionen
bleiben schnell (≤ 280 ms), emotionale Momente dürfen langsam sein.

## Match Reveal (§23)
1. Overlay dimmt die Umgebung (280 ms)
2. Zwei Felder driften mit unterschiedlichen y-Mustern ein (1150 ms, ease-drift)
3. Sechs Partikel oszillieren versetzt im Zwischenraum
4. Organische Zwischenform entsteht (Border-Radius-Asymmetrie, Coral-Ton)
5. Karte öffnet sich als Membran (clip-path ellipse 12 % → 120 %, 850 ms)
6–7. Headline und Titel erscheinen gestaffelt (Delay 250/450 ms)
8. haptic("reveal") beim Kartenwechsel
9. Ansehen / Später ansehen
Gesamt ~2,3 s; „Überspringen" jederzeit; Reduced Motion: direkter Fade auf die Karte.

## Discovery-Karte
Pointer-Tilt (perspective 1100px, ±3,6°, 480 ms ease-organic Rückstellung, nur
Nicht-Touch, nicht bei Reduced Motion), irisierende Conic-Kante, kategorie-
getöntes Umgebungslicht (Sensitivität → Aqua/Iris/Coral), angedeutetes Deck.

## Microinteractions
- AnswerSelector: Ripple-Resonanzwelle (420 ms) nur ohne Reduced Motion
- Navigation: lokales Lichtfeld + Resonanzlinie am aktiven Element
- Discovery-Karten: Enter y+Scale, Exit y-invertiert, base-Dauer
- Haptik (haptics.ts): confirm 12 ms, reveal [18,40,26], consent [10,30,10], warn gestuft;
  deaktivierbar in den Einstellungen, nie bei bloßer Bewegung

## Reduced Motion
Jede Animation hat eine reduzierte Variante: statischer Gradient statt Canvas,
direkte Zustandswechsel statt Choreografie, Fades ≤ 280 ms. Keine Information
existiert nur in einer Animation.
