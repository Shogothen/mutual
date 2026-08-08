import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { wishTextSchema } from "@/lib/validation/answer";
import { CATEGORY_LABELS, type QuestionCategory } from "@/domain/questions/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";

/**
 * Structured wish builder (§18). The resulting card appears in the partner's
 * discovery deck without a sender. Honest framing: with only two people, the
 * origin can never be technically or psychologically guaranteed anonymous.
 */
export function WishBuilder() {
  const toast = useToast((s) => s.show);
  const [category, setCategory] = useState<QuestionCategory>("neues_ausprobieren");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [intensity, setIntensity] = useState(2);

  const create = useMutation({
    mutationFn: async () => {
      wishTextSchema.parse(title);
      wishTextSchema.parse(prompt);
      const { error } = await supabase().rpc("create_custom_wish", {
        p_category: category,
        p_title: title.trim(),
        p_prompt: prompt.trim(),
        p_role_model: "symmetric",
        p_intensity: intensity
      });
      if (error) {
        if (error.message.includes("content_not_allowed")) {
          throw new Error("Dieser Inhalt ist hier nicht möglich. Bitte formuliere den Wunsch anders.");
        }
        throw new Error("Der Wunsch konnte gerade nicht gespeichert werden.");
      }
    },
    onSuccess: () => {
      setTitle("");
      setPrompt("");
      toast("Die Karte wird ohne Absender zwischen anderen Themen angezeigt.");
    },
    onError: (e: Error) => toast(e.message)
  });

  return (
    <Card>
      <h2 className="font-display text-lg text-pearl">Eigenen Wunsch hinzufügen</h2>
      <p className="mt-1 text-sm text-mist">
        Die Karte wird ohne Absender zwischen anderen Themen angezeigt.
      </p>
      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <div>
          <p className="mb-2 text-sm text-mist">Themenbereich</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_LABELS) as QuestionCategory[])
              .filter((c) => c !== "gespraechsimpulse")
              .map((c) => (
                <Chip key={c} selected={category === c} onClick={() => setCategory(c)}>
                  {CATEGORY_LABELS[c]}
                </Chip>
              ))}
          </div>
        </div>
        <div>
          <label htmlFor="wish-title" className="mb-1 block text-sm text-mist">Kurzer Titel</label>
          <input
            id="wish-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            className="w-full rounded-card border border-veil bg-void/50 px-4 py-3 text-pearl"
          />
        </div>
        <div>
          <label htmlFor="wish-prompt" className="mb-1 block text-sm text-mist">
            Grundidee, neutral formuliert
          </label>
          <textarea
            id="wish-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={280}
            rows={3}
            className="w-full rounded-card border border-veil bg-void/50 px-4 py-3 text-pearl"
          />
        </div>
        <div>
          <p className="mb-2 text-sm text-mist">Intensität: Stufe {intensity}</p>
          <input
            type="range"
            min={1}
            max={5}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            aria-label="Intensität des Wunsches"
            className="w-full accent-[rgb(var(--c-iris))]"
          />
        </div>
        <Button type="submit" loading={create.isPending} disabled={title.trim().length < 3 || prompt.trim().length < 3}>
          Als Karte einreihen
        </Button>
      </form>
    </Card>
  );
}
