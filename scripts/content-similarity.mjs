// Content-QS: markiert Fragen mit zu hoher Ähnlichkeit (Jaccard über Wortmengen).
// Aufruf: node scripts/content-similarity.mjs [schwelle=0.6]
import { readFileSync, readdirSync } from "node:fs";
const threshold = Number(process.argv[2] ?? 0.6);
const dir = "supabase/seed";
const txt = readdirSync(dir).filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(`${dir}/${f}`, "utf8")).join("\n");
const legacy = /^(na|ko|in|ro|la|si|kl|fa|be|kn|or|hi|it|ne|di|gr)-/; // v1, deaktiviert
const rows = [...txt.matchAll(/\('([a-z]{2}-\d\d)','[^']*','([^']*)'/g)]
  .map((m) => [m[1], m[2]]).filter(([slug]) => !legacy.test(slug));
const tok = (s) => new Set(s.toLowerCase().replace(/[^a-zäöüß ]/g, "").split(" ").filter((w) => w.length > 3));
let flagged = 0;
for (let i = 0; i < rows.length; i++) {
  for (let j = i + 1; j < rows.length; j++) {
    const a = tok(rows[i][1]); const b = tok(rows[j][1]);
    const inter = [...a].filter((x) => b.has(x)).length;
    const jac = inter / (a.size + b.size - inter);
    if (jac > threshold) { console.log(`SIMILAR ${rows[i][0]} <-> ${rows[j][0]} (${jac.toFixed(2)})`); flagged++; }
  }
}
console.log(`${rows.length} Karten geprüft, ${flagged} Paare über ${threshold}.`);
process.exit(flagged > 0 ? 1 : 0);
