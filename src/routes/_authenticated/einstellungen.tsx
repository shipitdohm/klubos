import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PageHeader, PrimaryButton, Field } from "@/components/data-ui";
import {
  getMyContext,
  updateOrganization,
  syncTennisData,
} from "@/lib/clubbase.functions";
import { toast } from "sonner";
import { Loader2, Upload, RefreshCw } from "lucide-react";

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
  const getCtx = useServerFn(getMyContext);
  const updateOrg = useServerFn(updateOrganization);
  const syncTennis = useServerFn(syncTennisData);

  const { data: ctx } = useQuery({
    queryKey: ["me"],
    queryFn: () => getCtx({}),
  });

  const [name, setName] = useState("");
  const [tennisUrl, setTennisUrl] = useState("");
  const [eversportsUrl, setEversportsUrl] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ctx?.organization) {
      setName(ctx.organization.name ?? "");
      setTennisUrl(ctx.organization.tennis_de_url ?? "");
      setEversportsUrl(ctx.organization.eversports_url ?? "");
    }
  }, [ctx?.organization]);

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

  async function saveOrg(event: React.FormEvent) {
    event.preventDefault();
    setSavingOrg(true);
    try {
      await updateOrg({
        data: {
          name: name || undefined,
          tennis_de_url: tennisUrl || null,
          eversports_url: eversportsUrl || null,
        },
      });
      toast.success("Vereinsdaten gespeichert");
      qc.invalidateQueries({ queryKey: ["me"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Speichern");
    } finally {
      setSavingOrg(false);
    }
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !ctx?.organization?.id) return;
    if (file.size > 2_000_000) {
      toast.error("Datei zu groß (max. 2 MB).");
      return;
    }
    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `${ctx.organization.id}/logo.${ext}`;
      const { error } = await supabase.storage
        .from("club-assets")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      await updateOrg({ data: { logo_url: path } });
      toast.success("Logo aktualisiert");
      qc.invalidateQueries({ queryKey: ["me"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploadingLogo(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const result = await syncTennis({});
      toast.success(
        `Sync abgeschlossen: ${result.teams_imported} Mannschaften, ${result.members_imported} Mitglieder`,
      );
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["teams"] });
      qc.invalidateQueries({ queryKey: ["members"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync fehlgeschlagen");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Einstellungen"
        description="Verein, Integrationen und Dashboard anpassen."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card">
          <div className="p-5 hairline-b">
            <h2 className="text-sm font-semibold">Verein</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Stammdaten und Logo deines Vereins.
            </p>
          </div>
          <form onSubmit={saveOrg} className="space-y-4 p-5">
            <div className="flex items-center gap-4">
              {ctx?.organization?.logoSignedUrl ? (
                <img
                  src={ctx.organization.logoSignedUrl}
                  alt="Vereinslogo"
                  className="size-14 rounded-md object-cover hairline"
                />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-md bg-secondary text-xs text-muted-foreground hairline">
                  Logo
                </div>
              )}
              <div>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploadingLogo}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs text-foreground transition-colors hover:bg-secondary/60 hairline disabled:opacity-60"
                >
                  {uploadingLogo ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  Logo hochladen
                </button>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  PNG, JPG oder SVG. Max. 2 MB.
                </p>
              </div>
            </div>

            <Field label="Vereinsname" value={name} onChange={setName} required />
            <PrimaryButton type="submit" disabled={savingOrg}>
              {savingOrg ? "Speichere…" : "Speichern"}
            </PrimaryButton>
          </form>
        </section>

        <section className="surface-card">
          <div className="p-5 hairline-b">
            <h2 className="text-sm font-semibold">Tennis.de / nuLiga</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Mannschaften und gemeldete Spieler:innen automatisch synchronisieren.
            </p>
          </div>
          <form onSubmit={saveOrg} className="space-y-4 p-5">
            <Field
              label="Vereinsseite auf tennis.de / nuLiga"
              value={tennisUrl}
              onChange={setTennisUrl}
              placeholder="https://www.tennis.de/...?verband=BTV&verein=02351"
            />
            <p className="text-[11px] text-muted-foreground">
              Tipp: Suche deinen Verein auf tennis.de und kopiere den Link. Wir
              erkennen Verband und Vereinsnummer automatisch.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <PrimaryButton type="submit" disabled={savingOrg}>
                URL speichern
              </PrimaryButton>
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing || !ctx?.organization?.tennis_de_url}
                className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs transition-colors hover:bg-secondary/60 hairline disabled:opacity-60"
              >
                {syncing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                Jetzt synchronisieren
              </button>
            </div>
            {ctx?.organization?.members_synced_at && (
              <p className="text-[11px] text-muted-foreground">
                Letzter Sync:{" "}
                {new Date(ctx.organization.members_synced_at).toLocaleString(
                  "de-DE",
                )}
              </p>
            )}
          </form>
        </section>

        <section className="surface-card">
          <div className="p-5 hairline-b">
            <h2 className="text-sm font-semibold">Eversports Platzbuchung</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Hinterlege eure Eversports-Buchungs-URL — sie wird direkt in der
              Platzplanung eingebettet.
            </p>
          </div>
          <form onSubmit={saveOrg} className="space-y-4 p-5">
            <Field
              label="Eversports-Buchungs-URL"
              value={eversportsUrl}
              onChange={setEversportsUrl}
              placeholder="https://www.eversports.com/widget/w/…"
            />
            <p className="text-[11px] text-muted-foreground">
              Den individuellen Code findet ihr in Eversports Manager unter
              „Einstellungen → Platzbuchungs-Widget".
            </p>
            <PrimaryButton type="submit" disabled={savingOrg}>
              Speichern
            </PrimaryButton>
          </form>
        </section>

        <section className="surface-card">
          <div className="p-5 hairline-b">
            <h2 className="text-sm font-semibold">Dashboard-Widgets</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Wähle, welche Widgets du sehen möchtest.
            </p>
          </div>
          <div>
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
        </section>
      </div>
    </AppShell>
  );
}
