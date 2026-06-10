import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createThread } from "@/lib/clubbase.functions";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/ki/")({
  component: Empty,
});

const PROMPTS = [
  "Sommersaison planen",
  "Sponsorenbericht schreiben",
  "Einladung zur JHV erstellen",
  "Mitglieder-Erinnerung senden",
];

function Empty() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const create = useServerFn(createThread);

  async function start(initialTitle: string) {
    try {
      const t = await create({ data: { title: initialTitle } });
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({
        to: "/ki/$threadId",
        params: { threadId: t.id },
        search: { q: initialTitle === "Neue Konversation" ? undefined : initialTitle },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler");
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 teal-glow">
        <Sparkles className="size-6 text-primary" strokeWidth={1.5} />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Vereins-KI</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Stell deiner KI Fragen zum Verein. Sie kennt eure Mitglieder, Termine,
        Buchungen und Sponsoren.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => start(p)}
            className="rounded-full px-4 py-2 text-xs text-muted-foreground transition-colors hairline hover:border-primary hover:text-foreground"
          >
            {p}
          </button>
        ))}
      </div>
      <button
        onClick={() => start("Neue Konversation")}
        className="mt-8 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground teal-glow"
      >
        Neue Konversation
      </button>
    </div>
  );
}
