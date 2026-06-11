import { createFileRoute } from "@tanstack/react-router";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

function parseClubReference(raw: string): { verband: string; verein: string } | null {
  try {
    const url = new URL(raw);
    const verband =
      url.searchParams.get("verband") ?? url.searchParams.get("federation");
    const verein =
      url.searchParams.get("verein") ?? url.searchParams.get("club");
    if (verband && verein) {
      return { verband: verband.toUpperCase(), verein: verein.replace(/^0+/, "") };
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type NuLigaTeam = {
  name?: string;
  league?: string;
  ageGroup?: string;
  season?: string;
};
type NuLigaPlayer = {
  firstName?: string;
  lastName?: string;
  licenceNr?: string;
  licenseNr?: string;
  lk?: string;
  yearOfBirth?: number;
};

async function fetchNuLigaData(verband: string, verein: string) {
  const padded = verein.padStart(5, "0");
  const bases = [
    `https://${verband.toLowerCase()}.liga.nu/rs/2014/federations/${verband}/clubs/${padded}`,
    `https://dtb.liga.nu/rs/2014/federations/${verband}/clubs/${padded}`,
  ];
  for (const base of bases) {
    const club = await fetchJson<Record<string, unknown>>(base);
    if (!club) continue;
    const [teams, players] = await Promise.all([
      fetchJson<NuLigaTeam[]>(`${base}/teams`),
      fetchJson<NuLigaPlayer[]>(`${base}/players`),
    ]);
    return {
      teams: Array.isArray(teams) ? teams : [],
      players: Array.isArray(players) ? players : [],
    };
  }
  return { teams: [], players: [] };
}

export const Route = createFileRoute("/api/public/hooks/sync-tennis")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: corsHeaders }),
      POST: async () => {
        try {
          const { supabaseAdmin } = await import(
            "@/integrations/supabase/client.server"
          );
          const { data: orgs, error } = await supabaseAdmin
            .from("organizations")
            .select("id, tennis_de_url")
            .not("tennis_de_url", "is", null);
          if (error) throw error;

          const results: Array<{ id: string; teams: number; members: number }> = [];

          for (const org of orgs ?? []) {
            if (!org.tennis_de_url) continue;
            const ref = parseClubReference(org.tennis_de_url);
            if (!ref) continue;
            const { teams, players } = await fetchNuLigaData(
              ref.verband,
              ref.verein,
            );

            if (teams.length > 0) {
              const rows = teams.map((team) => ({
                organization_id: org.id,
                name: team.name ?? "Unbenannte Mannschaft",
                league: team.league ?? null,
                age_group: team.ageGroup ?? null,
                season: team.season ?? null,
                association: ref.verband,
              }));
              await supabaseAdmin
                .from("teams")
                .delete()
                .eq("organization_id", org.id)
                .eq("association", ref.verband);
              await supabaseAdmin.from("teams").insert(rows);
            }

            if (players.length > 0) {
              const memberRows = players
                .filter((p) => p.firstName || p.lastName)
                .map((p) => ({
                  organization_id: org.id,
                  first_name: p.firstName ?? "—",
                  last_name: p.lastName ?? "—",
                  nuliga_id: p.licenceNr ?? p.licenseNr ?? null,
                  lk_rating: p.lk ?? null,
                  birth_year: p.yearOfBirth ?? null,
                }));
              const ids = memberRows
                .map((m) => m.nuliga_id)
                .filter((v): v is string => typeof v === "string");
              if (ids.length > 0) {
                await supabaseAdmin
                  .from("members")
                  .delete()
                  .eq("organization_id", org.id)
                  .in("nuliga_id", ids);
              }
              if (memberRows.length > 0) {
                await supabaseAdmin.from("members").insert(memberRows);
              }
            }

            await supabaseAdmin
              .from("organizations")
              .update({ members_synced_at: new Date().toISOString() })
              .eq("id", org.id);

            results.push({
              id: org.id,
              teams: teams.length,
              members: players.length,
            });
          }

          return new Response(
            JSON.stringify({ success: true, processed: results.length, results }),
            { headers: corsHeaders },
          );
        } catch (err) {
          return new Response(
            JSON.stringify({
              success: false,
              error: err instanceof Error ? err.message : "Unknown error",
            }),
            { status: 500, headers: corsHeaders },
          );
        }
      },
    },
  },
});
