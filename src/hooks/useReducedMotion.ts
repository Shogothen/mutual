import { useSyncExternalStore } from "react";
import { loadPrefs } from "@/lib/storage/prefs";

function subscribe(cb: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  window.addEventListener("mutual:prefs", cb);
  return () => {
    mq.removeEventListener("change", cb);
    window.removeEventListener("mutual:prefs", cb);
  };
}

function snapshot(): boolean {
  const pref = loadPrefs().reducedMotion;
  if (pref === "on") return true;
  if (pref === "off") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True when animations should be replaced by calm fades (§24, §34). */
export function useReducedMotionPref(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
