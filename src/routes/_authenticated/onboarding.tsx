import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createOrganization, getMyContext } from "@/lib/clubbase.functions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const getCtx = useServerFn(getMyContext);
  const create = useServerFn(createOrganization);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCtx({}).then((ctx) => {
      if (ctx.organization) navigate({ to: "/dashboard" });
    });
  }, [getCtx, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await create({ data: { name } });
      toast.success("Verein erstellt");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm surface-card p-7">
        <h1 className="text-xl font-semibold">Verein einrichten</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Wie heißt dein Verein? Du kannst später weitere Vorstände einladen.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Vereinsname
            </span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="SV Musterstadt 1923"
              className="block h-10 w-full rounded-md bg-input/40 px-3 text-sm outline-none hairline focus:border-primary"
            />
          </label>
          <button
            type="submit"
            disabled={loading || name.length < 2}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground teal-glow disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Weiter
          </button>
        </form>
      </div>
    </div>
  );
}
