import type { TimingPreference } from "./types";

/**
 * Timing never blocks a match – it shapes how the match is framed.
 * "talk_first" from either side means the shared space opens in
 * conversation mode before anything can be planned.
 */
export function needsTalkFirst(a: TimingPreference, b: TimingPreference): boolean {
  return a === "talk_first" || b === "talk_first";
}
