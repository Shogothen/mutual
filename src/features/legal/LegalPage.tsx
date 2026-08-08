import { useParams } from "react-router-dom";
import { APP_CONFIG } from "@/config/app";

/**
 * Legal placeholder pages. TODO LEGAL REVIEW: all content below must be
 * reviewed and completed by a lawyer before any public launch (Impressum
 * pursuant to § 5 DDG, GDPR privacy policy, terms). Operator data comes from
 * APP_CONFIG and is intentionally placeholder text.
 */
const PAGES: Record<string, { title: string; body: string[] }> = {
  impressum: {
    title: "Impressum",
    body: [
      `Angaben gemäß § 5 DDG (Platzhalter – vor Veröffentlichung juristisch prüfen):`,
      `${APP_CONFIG.operator.name}, ${APP_CONFIG.operator.address}`,
      `Kontakt: ${APP_CONFIG.operator.email}`,
      "TODO LEGAL REVIEW: Vertretungsberechtigte, Registereintrag, USt-IdNr. ergänzen."
    ]
  },
  datenschutz: {
    title: "Datenschutzerklärung",
    body: [
      "TODO LEGAL REVIEW: Vollständige DSGVO-Datenschutzerklärung erforderlich.",
      "Grundprinzipien dieser App: anonyme Konten ohne E-Mail-Pflicht, keine Analyse- oder Werbedienste Dritter, keine Werbe-Tracker, Datenminimierung.",
      "Antworten werden verschlüsselt übertragen (TLS) und verschlüsselt gespeichert (Verschlüsselung im Ruhezustand beim Datenbankanbieter Supabase). Einzelantworten sind für die Partnerperson technisch nicht abrufbar.",
      "Wichtig und ehrlich: Dies ist keine Ende-zu-Ende-Verschlüsselung. Wer die Datenbank administriert, könnte Inhalte technisch einsehen. Details: Sicherheit und Vertrauen.",
      "Löschrechte: Alle Daten können in der App selbst endgültig gelöscht werden (Antworten, Matches, Verbindung, Konto)."
    ]
  },
  nutzungsbedingungen: {
    title: "Nutzungsbedingungen",
    body: [
      "TODO LEGAL REVIEW: Vollständige AGB erforderlich.",
      "Die App richtet sich ausschließlich an volljährige Personen (18+).",
      "Die Nutzung setzt voraus, dass alle Beteiligten freiwillig teilnehmen.",
      "Ein Match ist eine Einladung zum Gespräch und niemals eine Zustimmung zu einer Handlung.",
      "Inhalte, die Rechte Dritter oder geltendes Recht verletzen, sind untersagt."
    ]
  },
  sicherheit: {
    title: "Sicherheit und Vertrauen",
    body: [
      "Was diese App schützt: Deine einzelnen Antworten sind für deine Partnerperson zu keinem Zeitpunkt abrufbar – weder über die Oberfläche noch über die Schnittstelle. Das Matching läuft ausschließlich auf dem Server; sichtbar werden nur beidseitige Übereinstimmungen.",
      "Wovor sie technisch nicht schützen kann: Die Serverdatenbank ist im Ruhezustand verschlüsselt, aber nicht Ende-zu-Ende-verschlüsselt. Personen mit administrativem Datenbankzugriff könnten Inhalte einsehen. Wir gestalten die Architektur so, dass es dafür keinen betrieblichen Grund gibt, und speichern keine Klarnamen und keine E-Mail-Adressen.",
      "Dein Gerät: Optional kannst du eine App-Sperre (Code) und den Blickschutz aktivieren. Der Name der App auf dem Startbildschirm ist bewusst neutral gehalten.",
      "Deine Kontrolle: Jede Antwort, jedes Match, die Verbindung und das gesamte Konto lassen sich jederzeit endgültig löschen."
    ]
  }
};

export function LegalPage() {
  const { page } = useParams();
  const content = PAGES[page ?? ""] ?? PAGES["impressum"]!;
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-2xl text-pearl">{content.title}</h1>
      <div className="mt-5 space-y-4">
        {content.body.map((p) => (
          <p key={p.slice(0, 40)} className="text-sm leading-relaxed text-pearl/85">{p}</p>
        ))}
      </div>
    </div>
  );
}
