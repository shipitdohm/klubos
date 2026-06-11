import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/data-ui";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/einstellungen")({
  head: () => ({ meta: [{ title: "Einstellungen — Clubbase" }] }),
  component: Page,
});

const WIDGETS = [
  { key: "members", label: "Mitglieder" },
  { key: "next_event", label: "Nächstes Event" },
  { key: "facility", label: "Platzbuchungen" },
  { key: "tasks", label: "Offene Aufgaben" },
  { key: "next_meeting", label: "Nächste Sitzung" },
  { key: "sponsors", label: "Sponsoren aktiv" },
];

function Page() {
  const qc = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["widget-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("widget_settings")
        .select("widget_key, enabled");
      return Object.fromEntries(
        data?.map((setting) => [setting.widget_key, setting.enabled]) ?? [],
      );
    },
  });

  async function toggle(key: string, enabled: boolean) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("widget_settings")
      .upsert(
        { user_id: user.id, widget_key: key, enabled },
        { onConflict: "user_id,widget_key" },
      );
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["widget-settings"] });
  }

  return (
    <AppShell>
      <PageHeader
        title="Einstellungen"
        description="Konfiguriere dein Dashboard."
      />
      <div className="surface-card max-w-xl">
        <div className="p-5 hairline-b">
          <h2 className="text-sm font-semibold">Dashboard-Widgets</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Wähle, welche Widgets du sehen möchtest.
          </p>
        </div>
        <div className="divide-y divide-border/40">
          {WIDGETS.map((w) => {
            const enabled = settings?.[w.key] !== false;
            return (
              <div
                key={w.key}
                className="flex items-center justify-between px-5 py-3.5 hairline-b last:border-b-0"
              >
                <span className="text-sm">{w.label}</span>
                <button
                  onClick={() => toggle(w.key, !enabled)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    enabled ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-4 rounded-full bg-foreground transition-transform ${
                      enabled ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
