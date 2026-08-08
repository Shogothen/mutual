/** Content domain types. Seed data lives in supabase/seed and src/domain/questions/cards. */

export type QuestionCategory =
  | "naehe_atmosphaere"
  | "kommunikation"
  | "initiative"
  | "rollen_dynamik"
  | "langsames_ausprobieren"
  | "sinnliche_wahrnehmung"
  | "kleidung_inszenierung"
  | "fantasie_rollenspiel"
  | "beobachten_gesehen_werden"
  | "kontrolle"
  | "orte_situationen"
  | "hilfsmittel"
  | "intensitaet"
  | "neues_ausprobieren"
  | "digitale_naehe"
  | "nachsorge"
  | "grenzen_tabus"
  | "gespraechsimpulse";

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  naehe_atmosphaere: "Nähe und Atmosphäre",
  kommunikation: "Kommunikation",
  initiative: "Initiative",
  rollen_dynamik: "Rollen und Dynamik",
  langsames_ausprobieren: "Langsames Ausprobieren",
  sinnliche_wahrnehmung: "Sinnliche Wahrnehmung",
  kleidung_inszenierung: "Kleidung und Inszenierung",
  fantasie_rollenspiel: "Fantasie und Rollenspiel",
  beobachten_gesehen_werden: "Beobachten und gesehen werden",
  kontrolle: "Kontrolle und Abgabe von Kontrolle",
  orte_situationen: "Orte und Situationen",
  hilfsmittel: "Hilfsmittel",
  intensitaet: "Intensität",
  neues_ausprobieren: "Neues ausprobieren",
  digitale_naehe: "Digitale Nähe",
  nachsorge: "Nachsorge und Nähe danach",
  grenzen_tabus: "Grenzen und Tabus",
  gespraechsimpulse: "Gesprächsimpulse"
};

export type RoleModel = "symmetric" | "directional" | "observer" | "switchable" | "not_relevant";

export type RolePreference =
  | "initiating"
  | "receiving"
  | "observing"
  | "switching"
  | "both"
  | "not_relevant";

export type IntensityLevel = 1 | 2 | 3 | 4 | 5;
export type RiskLevel = "low" | "medium" | "high";

export type QuestionCard = {
  id: string;
  slug: string;
  version: number;
  locale: "de";
  title: string;
  prompt: string;
  description?: string;
  category: QuestionCategory;
  tags: string[];
  intensityLevel: IntensityLevel;
  riskLevel: RiskLevel;
  roleModel: RoleModel;
  allowedRoles: RolePreference[];
  safetyNote?: string;
  requiresSafetyConfirmation: boolean;
  active: boolean;
};
