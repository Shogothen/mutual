/**
 * Central app configuration. The product name is intentionally configurable
 * here (§1 spec) – change it in exactly one place.
 */
export const APP_CONFIG = {
  /** Working title. Swap here to rebrand the whole app. */
  name: "MUTUAL",
  /** Neutral name used for the PWA/home screen (privacy: nothing revealing). */
  neutralName: "Mutual",
  tagline: "Nur was euch beide bewegt, wird sichtbar.",
  /** Operator info for legal pages. TODO: fill in before a real launch (legal review required). */
  operator: {
    name: "[Betreiber eintragen – TODO LEGAL REVIEW]",
    address: "[Anschrift eintragen – TODO LEGAL REVIEW]",
    email: "[Kontakt eintragen – TODO LEGAL REVIEW]",
    country: "DE"
  },
  version: "0.1.0",
  invite: {
    /** Invite codes expire after this many hours. */
    expiryHours: 48
  },
  lock: {
    /** Auto-lock options in seconds; null = never. */
    options: [0, 60, 300, 900, null] as const,
    defaultSeconds: 300 as number | null
  },
  features: {
    /** Demo mode is only ever active in dev builds (§31 spec). */
    demoMode: import.meta.env.DEV,
    /** Premium flags – prepared, not enforced (§39 spec). */
    premium: {
      allCategories: false,
      customWishes: false,
      extendedConsentFlow: false,
      sharedPlanning: false,
      extraCheckIns: false,
      history: false,
      personalization: false,
      multipleCardSets: false
    }
  }
} as const;
