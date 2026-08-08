import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/hooks/useReducedMotion";

/**
 * OrganicField – die zentrale Visual-Engine der App.
 * Rendert flüssige, organische Lichtkörper (keine geblurrten Kreise):
 * Blob-Konturen aus zwei Sinus-Oktaven, irisierende Kantenverläufe,
 * additive Lichtmischung, Pointer-Reaktivität und ein Konvergenz-Parameter,
 * der die Kernmetapher trägt: erst in der Überlagerung entsteht eine
 * dritte, hellere Form.
 *
 * Performance: ein rAF-Loop, DPR-Cap 1.5, Pause bei unsichtbarem Tab,
 * statisches Einzel-Frame-Rendering unter Reduced Motion.
 */

export type OrganicFieldProps = {
  /** RGB-Strings der beiden Körper, z. B. "140,118,255". */
  colorA?: string;
  colorB?: string;
  /** 0 = getrennt, 1 = vollständig überlagert. */
  converge?: number;
  /** Reagiert auf Pointer-Bewegung über dem Element. */
  interactive?: boolean;
  /** Gesamthelligkeit 0..1. */
  intensity?: number;
  /** Zusätzliche Satelliten-Partikel. */
  satellites?: boolean;
  className?: string;
};

type Body = {
  cx: number; cy: number; // relative Basisposition 0..1
  r: number; // relativer Radius
  phase: number;
  speed: number;
  color: string;
  drift: number; // Pointer-Richtung (+/-)
};

const TWO_PI = Math.PI * 2;
const POINTS = 10;

function blobPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number, t: number, phase: number
) {
  const pts: [number, number][] = [];
  for (let i = 0; i < POINTS; i++) {
    const a = (i / POINTS) * TWO_PI;
    const wobble =
      0.14 * Math.sin(a * 3 + t * 0.9 + phase) +
      0.08 * Math.sin(a * 5 - t * 1.4 + phase * 2.1) +
      0.05 * Math.sin(a * 2 + t * 0.5 + phase * 0.7);
    const rr = r * (1 + wobble);
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.92]);
  }
  ctx.beginPath();
  for (let i = 0; i < POINTS; i++) {
    const [x0, y0] = pts[i]!;
    const [x1, y1] = pts[(i + 1) % POINTS]!;
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    if (i === 0) ctx.moveTo(mx, my);
    else ctx.quadraticCurveTo(x0, y0, mx, my);
  }
  const [xl, yl] = pts[0]!;
  const [xn, yn] = pts[1]!;
  ctx.quadraticCurveTo(xl, yl, (xl + xn) / 2, (yl + yn) / 2);
  ctx.closePath();
}

export function OrganicField({
  colorA = "140,118,255",
  colorB = "101,218,202",
  converge = 0,
  interactive = true,
  intensity = 1,
  satellites = true,
  className = ""
}: OrganicFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const convergeRef = useRef(converge);
  convergeRef.current = converge;
  const reduced = useReducedMotionPref();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 1.5);
    let raf = 0;
    let running = true;
    let t = Math.random() * 100;

    const bodies: Body[] = [
      { cx: 0.32, cy: 0.46, r: 0.26, phase: 0.4, speed: 1, color: colorA, drift: 1 },
      { cx: 0.68, cy: 0.54, r: 0.24, phase: 2.6, speed: 0.82, color: colorB, drift: -1 }
    ];

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const minDim = Math.min(w, h);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const cv = convergeRef.current;
      const px = pointer.current.x;
      const py = pointer.current.y;

      const centers: [number, number, number][] = [];

      for (const b of bodies) {
        // Konvergenz zieht beide Körper zur Mitte, Pointer verschiebt subtil.
        const cx =
          (b.cx + (0.5 - b.cx) * cv) * w +
          (interactive ? px * 0.05 * w * b.drift : 0) +
          Math.sin(t * 0.35 * b.speed + b.phase) * 0.02 * w;
        const cy =
          (b.cy + (0.5 - b.cy) * cv) * h +
          (interactive ? py * 0.04 * h * b.drift : 0) +
          Math.cos(t * 0.28 * b.speed + b.phase) * 0.02 * h;
        const r = b.r * minDim * (1 + cv * 0.12);
        centers.push([cx, cy, r]);

        // Körper: gefüllter organischer Verlauf.
        const g = ctx.createRadialGradient(cx, cy, r * 0.08, cx, cy, r);
        g.addColorStop(0, `rgba(${b.color},${0.34 * intensity})`);
        g.addColorStop(0.55, `rgba(${b.color},${0.14 * intensity})`);
        g.addColorStop(1, `rgba(${b.color},0)`);
        blobPath(ctx, cx, cy, r, t * b.speed, b.phase);
        ctx.fillStyle = g;
        ctx.fill();

        // Irisierende Kante: Verlauf aus beiden Akzentfarben, feiner Stroke.
        const eg = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
        eg.addColorStop(0, `rgba(${colorA},${0.5 * intensity})`);
        eg.addColorStop(0.5, `rgba(245,242,255,${0.32 * intensity})`);
        eg.addColorStop(1, `rgba(${colorB},${0.5 * intensity})`);
        blobPath(ctx, cx, cy, r * 0.86, t * b.speed, b.phase);
        ctx.strokeStyle = eg;
        ctx.lineWidth = Math.max(1, minDim * 0.0035);
        ctx.stroke();
      }

      // Überlagerung: die dritte Form entsteht nur bei Nähe.
      const [a, b2] = centers;
      if (a && b2) {
        const dist = Math.hypot(a[0] - b2[0], a[1] - b2[1]);
        const near = Math.max(0, 1 - dist / (minDim * 0.9));
        const glow = Math.max(near, cv * 0.9);
        if (glow > 0.04) {
          const mx = (a[0] + b2[0]) / 2;
          const my = (a[1] + b2[1]) / 2;
          const rr = minDim * 0.12 * (0.5 + glow);
          const g = ctx.createRadialGradient(mx, my, 0, mx, my, rr);
          g.addColorStop(0, `rgba(245,242,255,${0.30 * glow * intensity})`);
          g.addColorStop(0.5, `rgba(255,140,123,${0.14 * glow * intensity})`);
          g.addColorStop(1, "rgba(0,0,0,0)");
          blobPath(ctx, mx, my, rr, t * 1.3, 5.2);
          ctx.fillStyle = g;
          ctx.fill();
        }
      }

      // Satelliten: wenige, ruhige Lichtpunkte auf elliptischen Bahnen.
      if (satellites) {
        for (let i = 0; i < 7; i++) {
          const base = bodies[i % 2]!;
          const [cx0, cy0, r0] = centers[i % 2]!;
          const oa = t * (0.22 + i * 0.05) + i * 1.7;
          const ox = cx0 + Math.cos(oa) * r0 * (1.25 + (i % 3) * 0.18);
          const oy = cy0 + Math.sin(oa) * r0 * (0.85 + (i % 2) * 0.2);
          ctx.beginPath();
          ctx.arc(ox, oy, Math.max(1, minDim * 0.004), 0, TWO_PI);
          ctx.fillStyle = `rgba(${base.color},${0.5 * intensity})`;
          ctx.fill();
        }
      }
    };

    const loop = () => {
      if (!running) return;
      t += 1 / 60;
      draw();
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      // Ein hochwertiges statisches Frame statt Animation.
      draw();
    } else {
      raf = requestAnimationFrame(loop);
    }

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running && !reduced) raf = requestAnimationFrame(loop);
      else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [colorA, colorB, interactive, intensity, satellites, reduced]);

  const onPointerMove = (e: React.PointerEvent) => {
    if (!interactive) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    pointer.current = {
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5
    };
  };

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      onPointerMove={onPointerMove}
      className={`h-full w-full ${className}`}
    />
  );
}
