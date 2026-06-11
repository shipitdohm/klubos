import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const search = z.object({
  mode: z.enum(["login", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({
    meta: [{ title: "Einloggen — Clubbase" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">(initialMode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName || email },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Konto erstellt");
        navigate({ to: "/onboarding" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Willkommen zurück");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  async function requestPasswordReset() {
    if (!email) {
      toast.error("Bitte gib zuerst deine E-Mail-Adresse ein.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Wir haben dir einen Link zum Zurücksetzen gesendet.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-10 flex items-center justify-center gap-2">
          <div className="size-6 rounded-md bg-primary teal-glow" />
          <span className="text-base font-semibold tracking-tight">Clubbase</span>
        </Link>

        <div className="surface-card p-7">
          <h1 className="text-xl font-semibold tracking-tight">
            {mode === "login" ? "Einloggen" : "Konto erstellen"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "login"
              ? "Willkommen zurück bei Clubbase."
              : "Lege dein Vorstands-Konto an."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {mode === "signup" && (
              <Field
                label="Name"
                type="text"
                value={fullName}
                onChange={setFullName}
                placeholder="Max Mustermann"
              />
            )}
            <Field
              label="E-Mail"
              type="email"
              value={email}
              onChange={setEmail}
              required
              placeholder="du@verein.de"
            />
            <Field
              label="Passwort"
              type="password"
              value={password}
              onChange={setPassword}
              required
              placeholder="••••••••"
            />

            {mode === "login" && (
              <Button
                type="button"
                variant="link"
                className="h-auto justify-start px-0 text-xs"
                disabled={loading}
                onClick={requestPasswordReset}
              >
                Passwort vergessen?
              </Button>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-10 w-full teal-glow transition-transform hover:scale-[1.01]"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Weiter
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "login" ? (
              <>
                Noch kein Konto?{" "}
                <button
                  className="text-foreground underline-offset-4 hover:underline"
                  onClick={() => setMode("signup")}
                >
                  Konto erstellen
                </button>
              </>
            ) : (
              <>
                Schon ein Konto?{" "}
                <button
                  className="text-foreground underline-offset-4 hover:underline"
                  onClick={() => setMode("login")}
                >
                  Einloggen
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="block h-10 w-full rounded-md bg-input/40 px-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors hairline focus:border-primary"
        style={{ borderColor: "var(--color-border)" }}
      />
    </label>
  );
}
