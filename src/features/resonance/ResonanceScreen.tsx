import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMatches, getOwnConfirmation, setPrivateConfirmation, subscribeToMatches, updateMatchStatus } from "./api";
import { fetchDiscoveryCards } from "@/features/discovery/api";
import { getConnection } from "@/features/pairing/api";
import { MatchReveal, MATCH_TYPE_LABELS } from "./MatchReveal";
import type { MatchRow } from "@/types/api";
import type { PrivateConfirmation } from "@/domain/consent/stateMachine";
import { CATEGORY_LABELS, type QuestionCategory } from "@/domain/questions/types";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useReducedMotionPref } from "@/hooks/useReducedMotion";
import { useSession } from "@/features/auth/useSession";

type Filter = "all" | "new" | "fantasy" | "talk" | "curiosity" | "confirmed" | "planned" | "archived";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "new", label: "Neu" },
  { value: "fantasy", label: "Fantasie" },
  { value: "talk", label: "Gespräch" },
  { value: "curiosity", label: "Neugier" },
  { value: "confirmed", label: "Bestätigt" },
  { value: "planned", label: "Geplant" },
  { value: "archived", label: "Archiviert" }
];

function matchesFilter(m: MatchRow, f: Filter): boolean {
  switch (f) {
    case "all": return m.status !== "archived" && m.status !== "withdrawn";
    case "new": return m.status === "discovered";
    case "fantasy": return m.match_type === "shared_fantasy";
    case "talk": return m.match_type === "conversation_value" || m.status === "talking";
    case "curiosity": return m.match_type === "careful_curiosity";
    case "confirmed": return ["reconfirmed", "talking", "boundaries_aligned"].includes(m.status);
    case "planned": return m.status === "planned";
    case "archived": return m.status === "archived";
  }
}

/**
 * Resonance (§14): shared matches only. Constellation view (SVG, keyboard
 * accessible) plus a classic list view. Never a leaderboard, never percentages.
 */
export function ResonanceScreen() {
  const queryClient = useQueryClient();
  const { session } = useSession();
  const reduced = useReducedMotionPref();
  const toast = useToast((s) => s.show);
  const [view, setView] = useState<"constellation" | "list">("list");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<MatchRow | null>(null);
  const [reveal, setReveal] = useState<MatchRow | null>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  const matches = useQuery({ queryKey: ["matches"], queryFn: fetchMatches });
  const cards = useQuery({ queryKey: ["discovery-cards"], queryFn: fetchDiscoveryCards });
  const connection = useQuery({ queryKey: ["connection"], queryFn: getConnection });

  const titleOf = useMemo(() => {
    const map = new Map((cards.data ?? []).map((c) => [c.id, c] as const));
    return (questionId: string) => map.get(questionId);
  }, [cards.data]);

  // Neutral realtime: "something new emerged between you" – no details (§30).
  useEffect(() => {
    if (!connection.data?.connected) return;
    return subscribeToMatches(connection.data.couple_id, () => {
      toast("Zwischen euch ist etwas Neues entstanden.");
      void queryClient.invalidateQueries({ queryKey: ["matches"] });
    });
  }, [connection.data, queryClient, toast]);

  // Reveal newly discovered matches once per session.
  useEffect(() => {
    const fresh = (matches.data ?? []).find((m) => m.status === "discovered" && !seen.has(m.id));
    if (fresh && !reveal) {
      setReveal(fresh);
      setSeen((s) => new Set(s).add(fresh.id));
    }
  }, [matches.data, seen, reveal]);

  if (matches.isLoading || cards.isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-3 px-4 py-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const visible = (matches.data ?? []).filter((m) => matchesFilter(m, filter));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-xl text-pearl">Resonanz</h1>
          <p className="mt-1 text-sm text-mist">Hier erscheint nur, was euch beide bewegt.</p>
        </div>
        <div role="group" aria-label="Darstellung wechseln" className="flex gap-1 rounded-pill border border-veil p-1">
          <button
            type="button"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
            className={`min-h-touch rounded-pill px-3 text-sm ${view === "list" ? "bg-iris/30 text-pearl" : "text-mist"}`}
          >
            Liste
          </button>
          <button
            type="button"
            aria-pressed={view === "constellation"}
            onClick={() => setView("constellation")}
            className={`min-h-touch rounded-pill px-3 text-sm ${view === "constellation" ? "bg-iris/30 text-pearl" : "text-mist"}`}
          >
            Konstellation
          </button>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter">
        {FILTERS.map((f) => (
          <Chip key={f.value} selected={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
          </Chip>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {visible.length} gemeinsame Themen sichtbar.
      </p>

      {visible.length === 0 ? (
        <EmptyState title="Noch keine gemeinsame Resonanz.">
          Ihr könnt in eurem eigenen Tempo weitermachen. Alles, was euch beide bewegt, erscheint hier von selbst.
        </EmptyState>
      ) : view === "constellation" ? (
        <Constellation matches={visible} titleOf={(id) => titleOf(id)?.title ?? "Gemeinsames Thema"} onOpen={setSelected} animated={!reduced} />
      ) : (
        <ul className="space-y-3">
          {visible.map((m) => {
            const card = titleOf(m.question_id);
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelected(m)}
                  className="w-full rounded-card border border-veil/60 bg-smoke/70 p-5 text-left transition-colors hover:border-lavender/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-lavender">{MATCH_TYPE_LABELS[m.match_type]}</span>
                    <span className="text-xs text-mist">
                      {card ? CATEGORY_LABELS[card.category as QuestionCategory] : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-lg text-pearl">{card?.title ?? "Gemeinsames Thema"}</p>
                  {m.talk_first || m.has_conditions ? (
                    <p className="mt-1 text-sm text-mist">
                      {m.talk_first ? "Erst ein Gespräch. " : ""}
                      {m.has_conditions ? "Es gibt private Bedingungen." : ""}
                    </p>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selected ? (
        <MatchDetail
          match={selected}
          title={titleOf(selected.question_id)?.title ?? "Gemeinsames Thema"}
          prompt={titleOf(selected.question_id)?.prompt ?? ""}
          userId={session?.user.id ?? ""}
          onClose={() => {
            setSelected(null);
            void queryClient.invalidateQueries({ queryKey: ["matches"] });
          }}
        />
      ) : null}

      {reveal ? (
        <MatchReveal
          match={reveal}
          title={titleOf(reveal.question_id)?.title ?? "Gemeinsames Thema"}
          onClose={() => setReveal(null)}
        />
      ) : null}
    </div>
  );
}

/** Shared Constellation v2: organische, leuchtende Knoten in einem räumlichen
 *  Feld; Verbindungen als weiche Kurven, Farbe deutet den Match-Typ an. */
function Constellation({
  matches,
  titleOf,
  onOpen,
  animated
}: {
  matches: MatchRow[];
  titleOf: (questionId: string) => string;
  onOpen: (m: MatchRow) => void;
  animated: boolean;
}) {
  const nodes = matches.map((m, i) => {
    const hash = [...m.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);
    const angle = (i / Math.max(matches.length, 1)) * Math.PI * 2 + (hash % 100) / 160;
    const radius = 28 + (hash % 32);
    return {
      m,
      hash,
      x: 50 + Math.cos(angle) * radius * 0.9,
      y: 50 + Math.sin(angle) * radius * 0.7,
      r: m.match_type === "strong_match" ? 3.4 : m.match_type === "clear_match" ? 2.8 : 2.2
    };
  });

  const colorOf = (t: MatchRow["match_type"]) =>
    t === "strong_match"
      ? "rgb(var(--c-coral))"
      : t === "shared_fantasy"
        ? "rgb(var(--c-aqua))"
        : "rgb(var(--c-lavender))";

  /** Organischer Knoten-Umriss, deterministisch aus dem Match-Hash. */
  const blob = (x: number, y: number, r: number, seed: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const rr = r * (1 + 0.18 * Math.sin(a * 3 + seed) + 0.1 * Math.sin(a * 5 + seed * 1.7));
      pts.push(`${(x + Math.cos(a) * rr).toFixed(2)},${(y + Math.sin(a) * rr).toFixed(2)}`);
    }
    return `M${pts.join(" L")} Z`;
  };

  return (
    <svg
      viewBox="0 0 100 100"
      role="group"
      aria-label="Konstellation eurer gemeinsamen Themen. Für eine klassische Übersicht nutze die Listenansicht."
      className="grain h-[min(70vh,32rem)] w-full rounded-card border border-veil/50 bg-abyss/40"
    >
      <defs>
        <filter id="nodeGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <radialGradient id="fieldDepth" cx="0.5" cy="0.42" r="0.7">
          <stop offset="0" stopColor="rgb(var(--c-iris))" stopOpacity="0.08" />
          <stop offset="1" stopColor="rgb(var(--c-void))" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill="url(#fieldDepth)" />
      {nodes.map((n, i) => {
        const prev = nodes[i - 1];
        if (!prev) return null;
        const mx = (prev.x + n.x) / 2 + ((n.hash % 9) - 4) * 1.1;
        const my = (prev.y + n.y) / 2 + ((n.hash % 7) - 3) * 1.1;
        return (
          <path
            key={`l-${n.m.id}`}
            d={`M${prev.x},${prev.y} Q${mx},${my} ${n.x},${n.y}`}
            fill="none"
            stroke="rgb(var(--c-lavender) / 0.16)"
            strokeWidth="0.18"
            strokeDasharray="0.7 1.3"
          />
        );
      })}
      {nodes.map((n) => (
        <g key={n.m.id}>
          <path
            d={blob(n.x, n.y, n.r * 1.9, n.hash)}
            fill={colorOf(n.m.match_type)}
            opacity="0.16"
            filter="url(#nodeGlow)"
          >
            {animated ? (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${n.x} ${n.y}`}
                to={`${n.hash % 2 ? 360 : -360} ${n.x} ${n.y}`}
                dur={`${34 + (n.hash % 20)}s`}
                repeatCount="indefinite"
              />
            ) : null}
          </path>
          <path
            d={blob(n.x, n.y, n.r, n.hash * 1.3)}
            tabIndex={0}
            role="button"
            aria-label={`${titleOf(n.m.question_id)}, ${MATCH_TYPE_LABELS[n.m.match_type]}. Öffnen mit Eingabetaste.`}
            fill={colorOf(n.m.match_type)}
            stroke="rgb(var(--c-pearl) / 0.35)"
            strokeWidth="0.14"
            className="cursor-pointer focus:outline-none focus:stroke-[rgb(var(--c-pearl))] focus:[stroke-width:0.6]"
            onClick={() => onOpen(n.m)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen(n.m);
              }
            }}
          >
            {animated ? (
              <animate
                attributeName="opacity"
                values="0.85;1;0.85"
                dur={`${5 + (n.hash % 4)}s`}
                repeatCount="indefinite"
              />
            ) : null}
          </path>
        </g>
      ))}
    </svg>
  );
}

/** Match detail with the private reconfirmation flow (§15). */
function MatchDetail({
  match,
  title,
  prompt,
  userId,
  onClose
}: {
  match: MatchRow;
  title: string;
  prompt: string;
  userId: string;
  onClose: () => void;
}) {
  const toast = useToast((s) => s.show);
  const [confirmation, setConfirmation] = useState<PrivateConfirmation | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void getOwnConfirmation(match.id).then((c) => {
      setConfirmation(c);
      setLoaded(true);
    });
  }, [match.id]);

  const choose = async (c: PrivateConfirmation) => {
    try {
      await setPrivateConfirmation(match.id, userId, c);
      setConfirmation(c);
      if (c === "wants_to_talk" && match.status === "discovered") {
        await updateMatchStatus(match, "reconfirmed").catch(() => undefined);
      }
      toast("Deine Auswahl bleibt privat gespeichert.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Das hat gerade nicht geklappt.");
    }
  };

  const OPTIONS: { value: PrivateConfirmation; label: string }[] = [
    { value: "wants_to_talk", label: "Ich möchte darüber sprechen" },
    { value: "keep_as_fantasy", label: "Ich möchte es zunächst nur als Fantasie behalten" },
    { value: "unsure", label: "Ich bin noch unsicher" },
    { value: "not_current", label: "Nicht mehr aktuell" },
    { value: "hide", label: "Bitte ausblenden" }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Match: ${title}`}
      className="fixed inset-0 z-40 flex items-end justify-center bg-void/80 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-card border border-veil bg-abyss p-6 sm:rounded-card"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-lavender">{MATCH_TYPE_LABELS[match.match_type]}</p>
        <h2 className="mt-1 font-display text-2xl text-pearl">{title}</h2>
        <p className="mt-3 leading-relaxed text-pearl/90">{prompt}</p>
        <p className="mt-4 rounded-lg border border-veil/60 bg-smoke/60 p-3 text-sm text-mist">
          Dieses Match bleibt hier, bis es sich für euch beide richtig anfühlt.
          Der gemeinsame Bereich öffnet sich nur, wenn ihr beide sprechen möchtet
          – ohne dass die andere Person deine Auswahl sieht.
        </p>

        <fieldset className="mt-5" disabled={!loaded}>
          <legend className="mb-2 text-sm text-mist">Deine private Entscheidung:</legend>
          <div className="space-y-2">
            {OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={confirmation === o.value}
                onClick={() => void choose(o.value)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors
                  ${confirmation === o.value ? "border-lavender bg-iris/20 text-pearl" : "border-veil text-pearl/80 hover:border-mist"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={onClose}>Schließen</Button>
        </div>
      </div>
    </div>
  );
}
