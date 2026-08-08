import { useEffect, useState } from "react";
import { loadPrefs } from "@/lib/storage/prefs";
import { loadPinRecord } from "@/lib/storage/db";

/** Auto-lock after configurable inactivity (§25). */
export function useAppLock(): { locked: boolean; unlock: () => void } {
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let timer: number | undefined;

    const arm = () => {
      const seconds = loadPrefs().autoLockSeconds;
      window.clearTimeout(timer);
      if (seconds === null) return;
      if (seconds === 0) return; // handled by visibility change below
      timer = window.setTimeout(async () => {
        if (await loadPinRecord()) setLocked(true);
      }, seconds * 1000);
    };

    const onActivity = () => arm();
    const onHide = async () => {
      const prefs = loadPrefs();
      if (prefs.autoLockSeconds === 0 && (await loadPinRecord())) setLocked(true);
    };

    ["pointerdown", "keydown", "touchstart"].forEach((e) =>
      window.addEventListener(e, onActivity, { passive: true })
    );
    document.addEventListener("visibilitychange", onHide);
    arm();
    return () => {
      window.clearTimeout(timer);
      ["pointerdown", "keydown", "touchstart"].forEach((e) =>
        window.removeEventListener(e, onActivity)
      );
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  return { locked, unlock: () => setLocked(false) };
}
