import { useEffect, useState } from "react";
import { loadPrefs } from "@/lib/storage/prefs";

/**
 * Blurs the whole app when the tab loses focus or goes to the background,
 * so nothing sensitive is readable in app switchers or over a shoulder (§25).
 * Can be disabled in settings.
 */
export function PrivacyShield() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const update = () => {
      if (!loadPrefs().privacyShield) {
        setHidden(false);
        return;
      }
      setHidden(document.visibilityState === "hidden" || !document.hasFocus());
    };
    document.addEventListener("visibilitychange", update);
    window.addEventListener("blur", update);
    window.addEventListener("focus", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("blur", update);
      window.removeEventListener("focus", update);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("privacy-blurred", hidden);
  }, [hidden]);

  return null;
}
