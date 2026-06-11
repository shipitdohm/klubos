import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LOGO_SIGNED_URL_TTL_SECONDS = 60 * 60;

async function loadOrganization(
  supabase: Awaited<ReturnType<typeof import("@supabase/supabase-js").createClient>>,
  organizationId: string,
) {
  const { data: org } = await supabase
    .from("organizations")
    .select(
      "id, name, slug, logo_url, tennis_de_url, eversports_url, members_synced_at",
    )
    .eq("id", organizationId)
    .maybeSingle();
  if (!org) return null;

  let logoSignedUrl: string | null = null;
  if (org.logo_url) {
    const { data: signed } = await supabase.storage
      .from("club-assets")
      .createSignedUrl(org.logo_url, LOGO_SIGNED_URL_TTL_SECONDS);
    logoSignedUrl = signed?.signedUrl ?? null;
  }
  return { ...org, logoSignedUrl };
}

export const getMyContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, organization_id")
      .eq("id", userId)
      .maybeSingle();

    const organization = profile?.organization_id
      ? await loadOrganization(supabase, profile.organization_id)
      : null;
    return { profile, organization };
  });

export const createOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ name: z.string().min(2) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const organizationId = crypto.randomUUID();
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40);
    const organization = {
      id: organizationId,
      name: data.name,
      slug: `${slug}-${Date.now().toString(36)}`,
    };
    const { error } = await supabase.from("organizations").insert(organization);
    if (error) throw new Error(error.message);

    const { error: upErr } = await supabase
      .from("profiles")
      .update({ organization_id: organizationId })
      .eq("id", userId);
    if (upErr) throw new Error(upErr.message);

    return organization;
  });

export const updateOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      name: z.string().min(2).optional(),
      tennis_de_url: z.string().url().nullable().optional(),
      eversports_url: z.string().url().nullable().optional(),
      logo_url: z.string().nullable().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.organization_id) throw new Error("Kein Verein zugeordnet");

    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.tennis_de_url !== undefined) patch.tennis_de_url = data.tennis_de_url;
    if (data.eversports_url !== undefined) patch.eversports_url = data.eversports_url;
    if (data.logo_url !== undefined) patch.logo_url = data.logo_url;

    const { error } = await supabase
      .from("organizations")
      .update(patch)
      .eq("id", profile.organization_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listTeams = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("teams")
      .select(
        "id, name, league, season, age_group, association, captain, training_time, external_url",
      )
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/**
 * Parses tennis.de / nuLiga URLs and returns the federation nickname and club number.
 *
 * Supports inputs like:
 *  - https://services.tennis.de/extern/tennisdeteamsearch.zul?verband=BTV&verein=02351
 *  - https://btv.liga.nu/cgi-bin/...?federation=BTV&club=02351
 *  - https://www.tennis.de/spielen/...?verband=BTV&verein=2351
 */
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
  const match = raw.match(/(BTV|HTV|WTV|NTV|TVBB|RLPTV|TVM|STB|SBTV|TBSV|TBV|TVS|TTV|HATV|TVN)\D+(\d{2,6})/i);
  if (match) return { verband: match[1].toUpperCase(), verein: match[2] };
  return null;
}

type NuLigaTeam = {
  id?: string;
  teamId?: string;
  name?: string;
  league?: string;
  ageGroup?: string;
  season?: string;
};
type NuLigaPlayer = {
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  licenceNr?: string;
  licenseNr?: string;
  email?: string;
  lk?: string;
  ranking?: string;
  yearOfBirth?: number;
  birthYear?: number;
};

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchNuLigaData(verband: string, verein: string) {
  const padded = verein.padStart(5, "0");
  const candidates = [
    `https://${verband.toLowerCase()}.liga.nu/rs/2014/federations/${verband}/clubs/${padded}`,
    `https://dtb.liga.nu/rs/2014/federations/${verband}/clubs/${padded}`,
  ];

  let club: Record<string, unknown> | null = null;
  let base: string | null = null;
  for (const candidate of candidates) {
    const data = await fetchJson<Record<string, unknown>>(candidate);
    if (data) {
      club = data;
      base = candidate;
      break;
    }
  }
  if (!club || !base) return { club: null, teams: [] as NuLigaTeam[], players: [] as NuLigaPlayer[] };

  const [teams, players] = await Promise.all([
    fetchJson<NuLigaTeam[]>(`${base}/teams`),
    fetchJson<NuLigaPlayer[]>(`${base}/players`),
  ]);

  return {
    club,
    teams: Array.isArray(teams) ? teams : [],
    players: Array.isArray(players) ? players : [],
  };
}

async function syncOrganizationFromTennisDe(
  supabase: Awaited<ReturnType<typeof import("@supabase/supabase-js").createClient>>,
  organizationId: string,
  tennisDeUrl: string,
) {
  const ref = parseClubReference(tennisDeUrl);
  if (!ref)
    throw new Error(
      "Konnte Verband und Vereinsnummer aus der URL nicht erkennen. Bitte die offizielle Vereinsseite von tennis.de oder nuLiga verwenden.",
    );

  const { club, teams, players } = await fetchNuLigaData(ref.verband, ref.verein);

  if (teams.length > 0) {
    const rows = teams.map((team) => ({
      organization_id: organizationId,
      name: team.name ?? "Unbenannte Mannschaft",
      league: team.league ?? null,
      age_group: team.ageGroup ?? null,
      season: team.season ?? null,
      association: ref.verband,
      external_url: `https://${ref.verband.toLowerCase()}.liga.nu`,
    }));
    await supabase
      .from("teams")
      .delete()
      .eq("organization_id", organizationId)
      .eq("association", ref.verband);
    await supabase.from("teams").insert(rows);
  }

  if (players.length > 0) {
    const memberRows = players
      .map((player) => {
        const first =
          player.firstName ?? player.first_name ?? player.email?.split("@")[0] ?? "";
        const last = player.lastName ?? player.last_name ?? "";
        if (!first && !last) return null;
        const nuliga_id =
          player.licenceNr ?? player.licenseNr ?? null;
        return {
          organization_id: organizationId,
          first_name: first || "—",
          last_name: last || "—",
          nuliga_id,
          lk_rating: player.lk ?? player.ranking ?? null,
          birth_year: player.yearOfBirth ?? player.birthYear ?? null,
        } as const;
      })
      .filter(Boolean) as Array<Record<string, unknown>>;

    if (memberRows.length > 0) {
      const ids = memberRows
        .map((row) => row.nuliga_id)
        .filter((value): value is string => typeof value === "string");
      if (ids.length > 0) {
        await supabase
          .from("members")
          .delete()
          .eq("organization_id", organizationId)
          .in("nuliga_id", ids);
      }
      await supabase.from("members").insert(memberRows);
    }
  }

  await supabase
    .from("organizations")
    .update({ members_synced_at: new Date().toISOString() })
    .eq("id", organizationId);

  return {
    teams_imported: teams.length,
    members_imported: players.length,
    club_found: !!club,
    federation: ref.verband,
    club_number: ref.verein,
  };
}

export const syncTennisData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.organization_id) throw new Error("Kein Verein zugeordnet");

    const { data: org } = await supabase
      .from("organizations")
      .select("id, tennis_de_url")
      .eq("id", profile.organization_id)
      .maybeSingle();
    if (!org?.tennis_de_url)
      throw new Error("Bitte hinterlege zuerst eine Tennis.de-/nuLiga-URL.");

    return syncOrganizationFromTennisDe(supabase, org.id, org.tennis_de_url);
  });

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("ai_threads")
      .select("id, title, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ title: z.string().optional() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.organization_id) throw new Error("Kein Verein zugeordnet");

    const { data: thread, error } = await supabase
      .from("ai_threads")
      .insert({
        user_id: userId,
        organization_id: profile.organization_id,
        title: data.title ?? "Neue Konversation",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return thread;
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("ai_threads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getThreadMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ threadId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("ai_messages")
      .select("id, role, parts, created_at")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id,
      role: r.role as "user" | "assistant" | "system",
      parts: r.parts as unknown as Array<{ type: string; text?: string }>,
    }));
  });
