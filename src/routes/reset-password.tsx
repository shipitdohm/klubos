import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Neues Passwort — Clubbase" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const recoveryLink = new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery";
    setHasRecoverySession(recoveryLink);

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setHasRecoverySession(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) return toast.error("Das Passwort muss mindestens 8 Zeichen haben.");
    if (password !== confirmation) return toast.error("Die Passwörter stimmen nicht überein.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);

    toast.success("Dein Passwort wurde aktualisiert.");
    navigate({ to: "/dashboard" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm surface-card p-7">
        <h1 className="text-xl font-semibold tracking-tight">Neues Passwort festlegen</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {hasRecoverySession
            ? "Wähle ein neues, sicheres Passwort für dein Konto."
            : "Öffne diese Seite über den Link in deiner Passwort-E-Mail."}
        </p>

        {hasRecoverySession ? (
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
              Neues Passwort
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
            </label>
            <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
              Passwort wiederholen
              <Input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={8} />
            </label>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Passwort speichern
            </Button>
          </form>
        ) : (
          <Button asChild variant="outline" className="mt-7 w-full">
            <Link to="/auth">Zurück zum Login</Link>
          </Button>
        )}
      </div>
    </main>
  );
}