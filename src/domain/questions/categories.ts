/**
 * Kink-Kategorien v2: die inhaltliche Landkarte der App.
 * Jede Kategorie trägt Label, Beschreibung, Sensitivität, Opt-in-Verhalten
 * und eine eigene abstrakte Symbolform (siehe CategorySymbol.tsx).
 */

export type KinkCategory =
  | "dominanz_unterwerfung" | "befehle_regeln" | "machtgefaelle"
  | "fesseln_fixierung" | "sinnesentzug" | "spanking_schmerzreize"
  | "dirty_talk" | "lob_verehrung" | "erniedrigung"
  | "orgasmuskontrolle" | "teasing_verzoegerung" | "toys"
  | "rollenspiele" | "uniformen_rollenbilder" | "kleidung_inszenierung"
  | "beobachten_zeigen" | "fotos_aufnahmen" | "digitale_intimitaet"
  | "orte_atmosphaere" | "service_hingabe" | "rollenwechsel"
  | "sinnliche_langsamkeit" | "koerperliche_kontrolle"
  | "mehrere_erwachsene_fantasie" | "besitz_rituale"
  | "initiative_ueberraschung" | "nachsorge" | "grenzen_tabus"
  | "fantasie_ohne_umsetzung";

export type SymbolForm =
  | "directed" | "loops" | "veil" | "impact" | "waves" | "halo"
  | "descent" | "orbit" | "hourglass" | "vessel" | "contours" | "mask"
  | "aperture" | "frame" | "signal" | "field" | "kneel" | "moebius"
  | "slow" | "grip" | "trine" | "sigil" | "spark" | "shell" | "boundary"
  | "mist";

export type CategoryMeta = {
  slug: KinkCategory;
  label: string;
  description: string;
  sensitivity: "standard" | "explicit" | "advanced";
  /** Muss in den Themenwelten bewusst aktiviert werden. */
  optIn: boolean;
  symbol: SymbolForm;
};

export const KINK_CATEGORIES: readonly CategoryMeta[] = [
  { slug: "sinnliche_langsamkeit", label: "Sinnliche Langsamkeit", description: "Gedehnte Zeit, Atem, Blicke und Berührungen ohne Eile.", sensitivity: "standard", optIn: false, symbol: "slow" },
  { slug: "initiative_ueberraschung", label: "Initiative und Überraschung", description: "Klar wollen, klar zeigen – und sich überraschen lassen.", sensitivity: "standard", optIn: false, symbol: "spark" },
  { slug: "kleidung_inszenierung", label: "Kleidung und Inszenierung", description: "Stoffe, Blicke, langsames Entkleiden und Dinge, die anbleiben.", sensitivity: "standard", optIn: false, symbol: "veil" },
  { slug: "orte_atmosphaere", label: "Orte und Atmosphäre", description: "Räume, Licht und Situationen, die eine Szene tragen.", sensitivity: "standard", optIn: false, symbol: "field" },
  { slug: "dirty_talk", label: "Dirty Talk", description: "Direkte Worte, klare Anweisungen und Sprache, die im Alltag keinen Platz hat.", sensitivity: "explicit", optIn: false, symbol: "signal" },
  { slug: "lob_verehrung", label: "Lob und Verehrung", description: "Begehrt werden, verehren und Lob als Teil der Dynamik.", sensitivity: "standard", optIn: false, symbol: "halo" },
  { slug: "teasing_verzoegerung", label: "Teasing und Verzögerung", description: "Necken, warten lassen und Spannung als eigenes Ziel.", sensitivity: "explicit", optIn: false, symbol: "hourglass" },
  { slug: "dominanz_unterwerfung", label: "Dominanz und Unterwerfung", description: "Führung, Hingabe und bewusst vereinbarte Macht.", sensitivity: "explicit", optIn: false, symbol: "directed" },
  { slug: "befehle_regeln", label: "Befehle und Regeln", description: "Anweisungen, Verbote und Regeln als jederzeit kündbares Spiel.", sensitivity: "explicit", optIn: false, symbol: "sigil" },
  { slug: "koerperliche_kontrolle", label: "Körperliche Kontrolle", description: "Halten, führen, Gewicht spüren – Kontrolle ohne Hilfsmittel.", sensitivity: "explicit", optIn: false, symbol: "grip" },
  { slug: "fesseln_fixierung", label: "Fesseln und Fixierung", description: "Bewegung einschränken, Kontrolle abgeben und Sicherheit bewusst gestalten.", sensitivity: "explicit", optIn: false, symbol: "loops" },
  { slug: "sinnesentzug", label: "Augenbinden und Sinnesentzug", description: "Sehen, Hören und Erwartung gezielt reduzieren.", sensitivity: "explicit", optIn: false, symbol: "mask" },
  { slug: "spanking_schmerzreize", label: "Spanking und Schmerzreize", description: "Kontrollierte Intensität zwischen Reiz und Zärtlichkeit.", sensitivity: "explicit", optIn: false, symbol: "impact" },
  { slug: "orgasmuskontrolle", label: "Orgasmuskontrolle", description: "Hinauszögern, erlauben, verweigern – der Höhepunkt als Spielfeld.", sensitivity: "explicit", optIn: false, symbol: "waves" },
  { slug: "toys", label: "Toys", description: "Gemeinsam auswählen, kombinieren und die Kontrolle darüber teilen.", sensitivity: "explicit", optIn: false, symbol: "orbit" },
  { slug: "rollenspiele", label: "Rollenspiele", description: "Andere Figuren, andere Regeln, andere Begegnungen.", sensitivity: "explicit", optIn: false, symbol: "contours" },
  { slug: "uniformen_rollenbilder", label: "Uniformen und Rollenbilder", description: "Kleidung, die eine Rolle mitbringt – und Regeln gleich dazu.", sensitivity: "explicit", optIn: false, symbol: "frame" },
  { slug: "beobachten_zeigen", label: "Beobachten und sich zeigen", description: "Zusehen, gesehen werden und private Inszenierung.", sensitivity: "explicit", optIn: false, symbol: "aperture" },
  { slug: "service_hingabe", label: "Service und Hingabe", description: "Dienen, umsorgt werden und Hingabe als eigene Sprache.", sensitivity: "explicit", optIn: false, symbol: "kneel" },
  { slug: "rollenwechsel", label: "Wechselnde Rollen", description: "Zwischen Führen und Folgen wechseln – in einer Nacht oder über Wochen.", sensitivity: "explicit", optIn: false, symbol: "moebius" },
  { slug: "besitz_rituale", label: "Zugehörigkeit und Rituale", description: "Symbole, Zeremonien und Regeln für vereinbarte Zeiträume.", sensitivity: "explicit", optIn: false, symbol: "vessel" },
  { slug: "digitale_intimitaet", label: "Digitale Intimität", description: "Nachrichten, Stimme und Distanz als eigener Spielraum.", sensitivity: "explicit", optIn: false, symbol: "signal" },
  { slug: "fantasie_ohne_umsetzung", label: "Fantasie ohne Umsetzung", description: "Gedanken, die Gedanken bleiben – und trotzdem geteilt werden dürfen.", sensitivity: "explicit", optIn: false, symbol: "mist" },
  { slug: "machtgefaelle", label: "Machtgefälle", description: "Inszenierte Autorität und Gehorsam als klar vereinbartes Spiel.", sensitivity: "advanced", optIn: true, symbol: "descent" },
  { slug: "erniedrigung", label: "Einvernehmliche Erniedrigung", description: "Vereinbarte Worte, klare Tabus und Nachsorge als Pflichtteil.", sensitivity: "advanced", optIn: true, symbol: "shell" },
  { slug: "fotos_aufnahmen", label: "Fotos und private Aufnahmen", description: "Aufnahmen mit klaren Regeln für Speicherung und Löschung.", sensitivity: "explicit", optIn: true, symbol: "frame" },
  { slug: "mehrere_erwachsene_fantasie", label: "Fantasien mit mehreren Erwachsenen", description: "Gedanken und Gespräche über Dritte – als Fantasie zwischen euch.", sensitivity: "explicit", optIn: true, symbol: "trine" },
  { slug: "nachsorge", label: "Nachsorge", description: "Was nach intensiven Szenen trägt: Nähe, Worte, Rituale.", sensitivity: "standard", optIn: false, symbol: "shell" },
  { slug: "grenzen_tabus", label: "Grenzen und Tabus", description: "Safewords, Tabuzonen und das Recht, jederzeit Nein zu sagen.", sensitivity: "standard", optIn: false, symbol: "boundary" }
] as const;

export const CATEGORY_META: Record<string, CategoryMeta> = Object.fromEntries(
  KINK_CATEGORIES.map((c) => [c.slug, c])
);

/** Standardmäßig aktive Kategorien (ohne Opt-in-Themen). */
export const DEFAULT_ENABLED: readonly KinkCategory[] = KINK_CATEGORIES
  .filter((c) => !c.optIn)
  .map((c) => c.slug);

export type DepthPreset = {
  id: "neugier" | "spannung" | "kink" | "intensiv" | "custom";
  label: string;
  description: string;
  categories: readonly KinkCategory[];
};

const NEUGIER: KinkCategory[] = [
  "sinnliche_langsamkeit", "initiative_ueberraschung", "kleidung_inszenierung",
  "orte_atmosphaere", "lob_verehrung", "nachsorge", "grenzen_tabus"
];
const SPANNUNG: KinkCategory[] = [
  ...NEUGIER, "dirty_talk", "teasing_verzoegerung", "sinnesentzug",
  "beobachten_zeigen", "digitale_intimitaet", "toys", "fantasie_ohne_umsetzung"
];
const KINK: KinkCategory[] = [
  ...SPANNUNG, "dominanz_unterwerfung", "befehle_regeln", "koerperliche_kontrolle",
  "fesseln_fixierung", "spanking_schmerzreize", "orgasmuskontrolle",
  "rollenspiele", "uniformen_rollenbilder", "service_hingabe",
  "rollenwechsel", "besitz_rituale"
];
const INTENSIV: KinkCategory[] = [
  ...KINK, "machtgefaelle", "erniedrigung", "fotos_aufnahmen",
  "mehrere_erwachsene_fantasie"
];

export const DEPTH_PRESETS: readonly DepthPreset[] = [
  { id: "neugier", label: "Sinnliche Neugier", description: "Atmosphäre, Langsamkeit, Initiative – der ruhige Einstieg.", categories: NEUGIER },
  { id: "spannung", label: "Mehr Spannung", description: "Dazu: Worte, Teasing, Sinne, Blicke und Toys.", categories: SPANNUNG },
  { id: "kink", label: "Klare Kink-Exploration", description: "Dazu: Dominanz, Fesseln, Spanking, Kontrolle und Rollen.", categories: KINK },
  { id: "intensiv", label: "Intensive Dynamiken", description: "Alles – inklusive der Themen, die bewusste Aktivierung brauchen.", categories: INTENSIV },
  { id: "custom", label: "Themen selbst auswählen", description: "Du stellst deine Themenwelt einzeln zusammen.", categories: KINK }
] as const;

/** Kartenanzahl je Kategorie (aus dem Seed, für die Themenauswahl). */
export const CATEGORY_COUNTS: Record<KinkCategory, number> = {
  dominanz_unterwerfung: 12, befehle_regeln: 10, machtgefaelle: 10,
  fesseln_fixierung: 12, sinnesentzug: 10, spanking_schmerzreize: 12,
  dirty_talk: 12, lob_verehrung: 10, erniedrigung: 10,
  orgasmuskontrolle: 12, teasing_verzoegerung: 10, toys: 12,
  rollenspiele: 12, uniformen_rollenbilder: 8, kleidung_inszenierung: 10,
  beobachten_zeigen: 12, fotos_aufnahmen: 8, digitale_intimitaet: 10,
  orte_atmosphaere: 10, service_hingabe: 10, rollenwechsel: 8,
  sinnliche_langsamkeit: 10, koerperliche_kontrolle: 10,
  mehrere_erwachsene_fantasie: 8, besitz_rituale: 10,
  initiative_ueberraschung: 10, nachsorge: 8, grenzen_tabus: 8,
  fantasie_ohne_umsetzung: 8
};
