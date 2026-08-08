/**
 * Non-sensitive preferences only (§26 spec). Nothing here may ever contain
 * answers, matches, conditions, wishes or free text.
 */

export type Prefs = {
  language: "de";
  reducedMotion: "system" | "on" | "off";
  theme: "dark";
  onboardingDone: boolean;
  privacyShield: boolean;
  autoLockSeconds: number | null;
  /** Aktivierte Themenwelten; null = Standardset ohne Opt-in-Themen. */
  enabledCategories: string[] | null;
  depthPreset: "neugier" | "spannung" | "kink" | "intensiv" | "custom" | null;
  haptics: boolean;
};

const KEY = "mutual.prefs.v1";

const DEFAULTS: Prefs = {
  language: "de",
  reducedMotion: "system",
  theme: "dark",
  onboardingDone: false,
  privacyShield: true,
  autoLockSeconds: 300,
  enabledCategories: null,
  depthPreset: null,
  haptics: true
};

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) };
  } catch {
    return DEFAULTS;
  }
}

export function savePrefs(prefs: Prefs): void {
  localStorage.setItem(KEY, JSON.stringify(prefs));
}

export function updatePrefs(patch: Partial<Prefs>): Prefs {
  const next = { ...loadPrefs(), ...patch };
  savePrefs(next);
  return next;
}
