import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AuroraBackground, type BackgroundMood } from "@/components/motion/AuroraBackground";
import { ToastViewport } from "@/components/ui/Toast";
import { MutualSigil } from "@/components/visuals/MutualSigil";

/**
 * App-Shell v2: schwebende dunkle Navigationsleiste mit eigenständigen
 * SVG-Zeichen und lokalem Licht am aktiven Element (§28). Der Hintergrund
 * wechselt seine Stimmung je Bereich (§6.1).
 */

const ICONS: Record<string, JSX.Element> = {
  entdecken: <path d="M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z" />,
  resonanz: (
    <>
      <circle cx="8" cy="12" r="4.2" />
      <circle cx="16" cy="12" r="4.2" opacity="0.6" />
    </>
  ),
  gemeinsam: (
    <>
      <path d="M12 20c-4.5-2.6-7-5.4-7-8.6C5 8.4 7 6.6 9.4 6.6c1 0 2 .4 2.6 1.1.6-.7 1.6-1.1 2.6-1.1C17 6.6 19 8.4 19 11.4c0 3.2-2.5 6-7 8.6z" opacity="0.85" />
    </>
  ),
  impulse: (
    <>
      <path d="M6 15c2-5 4-8 6-8s4 3 6 8" />
      <path d="M9 18h6" opacity="0.6" />
    </>
  ),
  mehr: (
    <>
      <circle cx="6.5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="17.5" cy="12" r="1.4" />
    </>
  )
};

const NAV = [
  { to: "/", label: "Entdecken", icon: "entdecken" },
  { to: "/resonanz", label: "Resonanz", icon: "resonanz" },
  { to: "/gemeinsam", label: "Gemeinsam", icon: "gemeinsam" },
  { to: "/impulse", label: "Impulse", icon: "impulse" },
  { to: "/einstellungen", label: "Mehr", icon: "mehr" }
] as const;

function moodFor(pathname: string): BackgroundMood {
  if (pathname.startsWith("/resonanz")) return "resonance";
  if (pathname.startsWith("/gemeinsam")) return "consent";
  if (pathname.startsWith("/einstellungen")) return "settings";
  return "discovery";
}

export function AppLayout() {
  const location = useLocation();
  return (
    <div className="flex min-h-dvh">
      <a href="#main" className="skip-link">Zum Inhalt springen</a>
      <AuroraBackground intensity={0.4} mood={moodFor(location.pathname)} />

      <nav
        aria-label="Hauptnavigation"
        className="fixed inset-x-3 z-30 rounded-2xl border border-veil/60 bg-abyss/85 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.7)] backdrop-blur-md
          bottom-[max(0.75rem,env(safe-area-inset-bottom))]
          md:static md:inset-auto md:flex md:w-56 md:flex-col md:rounded-none md:border-0 md:border-r md:border-veil/60 md:bg-transparent md:p-6 md:shadow-none md:backdrop-blur-0"
      >
        <div aria-hidden className="hidden items-center gap-2.5 md:mb-8 md:flex">
          <MutualSigil size={28} />
          <span className="font-display text-lg text-pearl">Mutual</span>
        </div>
        <ul className="flex justify-around md:flex-col md:gap-1">
          {NAV.map((item) => (
            <li key={item.to} className="md:w-full">
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `group relative flex min-h-touch flex-col items-center gap-0.5 px-3 py-2 text-[0.68rem] transition-colors
                   md:flex-row md:gap-3 md:rounded-pill md:px-4 md:text-sm
                   ${isActive ? "text-lavender md:bg-iris/15" : "text-mist hover:text-pearl"}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <span
                        aria-hidden
                        className="absolute inset-x-3 top-1 -z-10 h-9 rounded-xl bg-iris/15 blur-[2px] md:hidden"
                      />
                    ) : null}
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {ICONS[item.icon]}
                    </svg>
                    {item.label}
                    {isActive ? (
                      <span aria-hidden className="absolute -bottom-0.5 h-0.5 w-5 rounded-full bg-lavender/80 md:hidden" />
                    ) : null}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <main id="main" className="min-w-0 flex-1 pb-28 md:pb-8">
        <Outlet />
      </main>
      <ToastViewport />
    </div>
  );
}
