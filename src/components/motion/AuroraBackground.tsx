import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/hooks/useReducedMotion";

/**
 * Atmosphärischer Hintergrund: zwei unabhängige Lichtfelder, deren
 * Überlagerung eine dritte Form erzeugt – die zentrale Metapher.
 * v2: kontextabhängige Stimmungen je Bereich, Körnung, Vignette,
 * Pause bei unsichtbarem Tab, statischer Fallback bei Reduced Motion.
 */

export type BackgroundMood = "discovery" | "reveal" | "resonance" | "consent" | "settings";

/** RGB-Triplets je Stimmung: [Feld A, Feld B, Resonanz im Überlappungsraum]. */
const MOODS: Record<BackgroundMood, [string, string, string]> = {
  discovery: ["140,118,255", "101,218,202", "195,183,255"], // konzentriert, geheimnisvoll
  reveal: ["255,140,123", "195,183,255", "245,242,255"], // heller, emotionaler
  resonance: ["140,118,255", "101,218,202", "255,140,123"], // weit, kosmisch
  consent: ["101,218,202", "140,118,255", "184,180,201"], // ruhiger, geerdet
  settings: ["42,44,68", "140,118,255", "184,180,201"] // klar, reduziert
};

type Props = { intensity?: number; mood?: BackgroundMood };

export function AuroraBackground({ intensity = 0.5, mood = "discovery" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotionPref();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio ?? 1, 1.5);
    const [ca, cb, cr] = MOODS[mood];

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) raf = requestAnimationFrame(draw);
      else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVisibility);

    function draw() {
      if (!running || !ctx || !canvas) return;
      frame += 1;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const t = frame / 240;

      const ax = w * (0.3 + 0.08 * Math.sin(t));
      const ay = h * (0.35 + 0.06 * Math.cos(t * 0.8));
      const bx = w * (0.7 + 0.08 * Math.cos(t * 0.9));
      const by = h * (0.6 + 0.06 * Math.sin(t * 0.7));

      for (const f of [
        { x: ax, y: ay, c: ca },
        { x: bx, y: by, c: cb }
      ]) {
        const r = Math.min(w, h) * 0.45;
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
        g.addColorStop(0, `rgba(${f.c},${0.16 * intensity})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // Resonanz: eine dritte Form entsteht nur dort, wo beide Felder nah sind.
      const dist = Math.hypot(ax - bx, ay - by);
      const near = Math.max(0, 1 - dist / (Math.min(w, h) * 0.85));
      if (near > 0.05) {
        const mx = (ax + bx) / 2;
        const my = (ay + by) / 2;
        const r = Math.min(w, h) * 0.2 * (0.6 + near);
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, r);
        g.addColorStop(0, `rgba(${cr},${0.1 * intensity * near})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced, intensity, mood]);

  const [ca, cb] = MOODS[mood];
  return (
    <div aria-hidden className="grain vignette pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {reduced ? (
        <div
          className="h-full w-full"
          style={{
            background: `radial-gradient(60% 50% at 28% 32%, rgba(${ca},0.1), transparent 70%),` +
              `radial-gradient(55% 45% at 72% 62%, rgba(${cb},0.09), transparent 70%)`
          }}
        />
      ) : (
        <canvas ref={canvasRef} className="h-full w-full" />
      )}
    </div>
  );
}
