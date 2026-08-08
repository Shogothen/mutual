import { loadPrefs } from "@/lib/storage/prefs";

/**
 * Dezente Haptik über navigator.vibrate (§8.4). Immer optional,
 * respektiert die Nutzereinstellung und schweigt auf Geräten ohne Support.
 */
type Pattern = "confirm" | "reveal" | "consent" | "warn";

const PATTERNS: Record<Pattern, number | number[]> = {
  confirm: 12,
  reveal: [18, 40, 26],
  consent: [10, 30, 10],
  warn: [8, 60, 8, 60, 8]
};

export function haptic(pattern: Pattern): void {
  try {
    if (!loadPrefs().haptics) return;
    if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    /* Haptik ist nie kritisch. */
  }
}
