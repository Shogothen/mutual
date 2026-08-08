# Art Direction (v2)

## Metapher
Zwei getrennte Energiefelder. Erst ihre kompatible Überlagerung erzeugt eine neue sichtbare Form.
Umsetzung: AuroraBackground (zwei Felder + Resonanzform im Zwischenraum), PairingHero
(zwei pointer-reaktive Lichtkörper, die sich annähern, aber nicht berühren), MatchReveal
(Felder → Partikel → neue Form → Membran → Karte), Onboarding-Visuals.

## Farbwelt (tokens.css)
- Tiefe: void #070711 → abyss #0c0d18 → smoke #121423, Border veil #2a2c44
- Licht: pearl #f5f2ff, mist #b8b4c9
- Akzente: iris (Ultraviolet) #8c76ff, lavender #c3b7ff, aqua #65daca
- Wärme: coral #ff8c7b – ausschließlich für Resonanzmomente; danger #ff6b78 separat
- Keine Ampelfarben in der Antwortauswahl. Keine Pink-Schwarz-Erotikoptik.

## Material
- Karten: smoke/90 mit Backdrop-Blur nur auf zentralen Objekten
- Grain: feTurbulence-Data-URI, Opazität 0,05, mix-blend overlay (`.grain`)
- Vignette: radiale Konzentration auf void (`.vignette`)
- Glas gezielt (Nav, Discovery-Karte), nie flächendeckend

## Visual Engine (OrganicField)
Flüssige Lichtkörper statt geblurrter Kreise: Blob-Konturen aus zwei Sinus-Oktaven
(10 Stützpunkte, quadratische Glättung), radiale Kernverläufe, irisierende
Kantenstrokes aus beiden Akzentfarben, additive Mischung. Konvergenz-Parameter
0→1 trägt die Metapher: Überlagerungsform entsteht in der Engine selbst.
Einsatz: Pairing-Hero (pointer-reaktiv), Match Reveal (Konvergenz-Animation),
Design Lab. Ein rAF-Loop, DPR-Cap 1.5, Tab-Pause, statisches Frame bei Reduced Motion.

## Sigil (Logo)
Zwei organische Konturen (Iris→Lavender / Aqua→Iris), deren Überschneidung als
Linse aufleuchtet. Atembewegung 6,5 s per CSS, statisch bei Reduced Motion.
Einsatz: Navigation, Pairing-Header, App-Lock-Membran.

## Symbolsystem
26 eigene abstrakte SVG-Formen (CategorySymbol.tsx), 32×32, Stroke 1.6, currentColor.
Jede Form übersetzt das Thema: gerichtete Linien (Dominanz), verbundene Schleifen
(Fesselung), offene Ellipse mit Kern (Beobachten), Wellen mit Abbruchkante
(Orgasmuskontrolle), schützende Hülle (Nachsorge), gestrichelte Linie mit
respektiertem Abstand (Grenzen). Keine Icon-Bibliothek für Identitätsflächen.

## Typografie
Fraunces Variable (Display, sinnlich, nicht kitschig) + Schibsted Grotesk Variable
(Interface). Große Headlines eng geführt, Sekundärtexte nie unter 0,75 rem.
