import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { PageHeader, DataTable } from "@/components/data-ui";
import { getMyContext, listTeams } from "@/lib/clubbase.functions";

export const Route = createFileRoute("/_authenticated/mannschaften")({
  head: () => ({ meta: [{ title: "Mannschaften — Clubbase" }] }),
  component: Page,
});

function Page() {
  const getCtx = useServerFn(getMyContext);
  const fetchTeams = useServerFn(listTeams);

  const { data: ctx } = useQuery({ queryKey: ["me"], queryFn: () => getCtx({}) });
  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: () => fetchTeams({}),
  });

  const widgetSrc = (() => {
    const url = ctx?.organization?.tennis_de_url;
    if (!url) return null;
    try {
      const parsed = new URL(url);
      const verband =
        parsed.searchParams.get("verband") ?? parsed.searchParams.get("federation");
      const verein =
        parsed.searchParams.get("verein") ?? parsed.searchParams.get("club");
      if (!verband || !verein) return null;
      return `https://services.tennis.de/extern/tennisdeteamsearch.zul?verband=${verband}&verein=${verein}&linkfarbe=0EA5A0`;
    } catch {
      return null;
    }
  })();

  return (
    <AppShell>
      <PageHeader
        title="Mannschaften"
        description="Mannschaften, Liga-Stände und Spielpläne — live von tennis.de."
      />

      <div className="space-y-6">
        {!ctx?.organization?.tennis_de_url ? (
          <div className="surface-card p-6 text-sm text-muted-foreground">
            Hinterlege deine{" "}
            <Link to="/einstellungen" className="text-primary underline-offset-4 hover:underline">
              tennis.de-/nuLiga-URL in den Einstellungen
            </Link>
            , damit wir Mannschaften und Spielpläne automatisch importieren.
          </div>
        ) : (
          <>
            <DataTable
              rows={teams ?? []}
              columns={[
                {
                  key: "name",
                  label: "Mannschaft",
                  render: (r) => <span className="font-medium">{r.name}</span>,
                },
                { key: "league", label: "Liga", render: (r) => r.league ?? "—" },
                { key: "age_group", label: "Altersklasse", render: (r) => r.age_group ?? "—" },
                { key: "season", label: "Saison", render: (r) => r.season ?? "—" },
                {
                  key: "captain",
                  label: "Mannschaftsführer",
                  render: (r) => r.captain ?? "—",
                },
              ]}
              empty="Noch keine Mannschaften importiert. Starte den Sync in den Einstellungen."
            />

            {widgetSrc && (
              <div className="surface-card overflow-hidden">
                <div className="px-5 py-3 hairline-b">
                  <h2 className="text-sm font-semibold">Live-Spielpläne & Tabellen</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Eingebettet direkt von tennis.de — immer aktuell.
                  </p>
                </div>
                <iframe
                  src={widgetSrc}
                  title="tennis.de Mannschaften"
                  className="h-[800px] w-full bg-background"
                />
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
