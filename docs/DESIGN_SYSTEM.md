# Design-System

## Prinzip
„Dunkle Intimität ohne Klischee": tiefes Obsidianblau → dunkles Violett → Anthrazit, gedämpftes Perlweiß, kühles Lavendel/Iris als Akzent, sehr sparsames warmes Korall ausschließlich für Resonanzmomente. Keine roten Herzen, keine Flammen, kein Neon.

## Tokens (einzige Quelle: src/styles/tokens.css)
| Token | Wert | Verwendung |
|---|---|---|
| --c-void | #0b0e1a | App-Hintergrund |
| --c-abyss | #131022 | erhöhte Flächen, Dialoge |
| --c-smoke | #1e1c29 | Karten |
| --c-veil | #2e2b40 | Linien, Rahmen |
| --c-pearl | #e0ddea | Primärtext |
| --c-mist | #9a96ad | Sekundärtext |
| --c-lavender | #b7aee8 | interaktive Akzente, Fokus |
| --c-iris | #8b7fd4 | aktive Zustände |
| --c-coral | #e58c7b | NUR Resonanz/Reveal |
| --c-danger | #e07a7a | destruktive Aktionen |

Kontraste: pearl/void 14,8:1, mist/void 6,9:1, lavender/void 9,4:1 – AA für Text und UI erfüllt.

## Typografie
Fraunces Variable (Display: Headlines, Reveal) + Schibsted Grotesk Variable (Interface). Beide lokal gebundelt (@fontsource), kein CDN.

## Komponenten
`src/components/ui/`: Button (4 Varianten), Card, Chip, Modal (native dialog), SegmentedControl, RangeSlider (5 Stufen-Toggles statt Doppel-Slider – bewusste A11y-Entscheidung), ConsentCheckbox, EmptyState, Skeleton, Toast. Alle Touch-Ziele ≥ 44 px (`min-h-touch`), keine Hardcoded-Farben.
