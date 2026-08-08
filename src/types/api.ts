import type { MatchStatus } from "@/domain/consent/stateMachine";
import type { MatchType } from "@/domain/matching/types";

export type DiscoveryCardRow = {
  id: string;
  slug: string;
  title: string;
  prompt: string;
  description: string | null;
  context: string | null;
  category: string;
  tags: string[];
  intensity_level: number;
  risk_level: "low" | "medium" | "high";
  role_model: "symmetric" | "directional" | "observer" | "switchable" | "not_relevant";
  allowed_roles: string[];
  safety_note: string | null;
  consent_note: string | null;
  content_sensitivity: "standard" | "explicit" | "advanced";
  requires_opt_in: boolean;
  requires_safety_confirmation: boolean;
  is_couple_card: boolean;
};

export type MatchRow = {
  id: string;
  couple_id: string;
  question_id: string;
  match_type: MatchType;
  score: number;
  intensity_min: number;
  intensity_max: number;
  talk_first: boolean;
  has_conditions: boolean;
  status: MatchStatus;
  created_at: string;
};

export type ConnectionState =
  | { connected: false }
  | { connected: true; couple_id: string; complete: boolean };
