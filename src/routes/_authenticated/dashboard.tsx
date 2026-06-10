import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyContext } from "@/lib/clubbase.functions";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  CalendarRange,
  Wallet,
  Handshake,
  PartyPopper,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Clubbase" }] }),
  component: Dashboard,
});

type WidgetKey =
  | "members"
  | "next_event"
  | "facility"
  | "tasks"
  | "next_meeting"
  | "sponsors";

const DEFAULT_WIDGETS: WidgetKey[] = [
  "members",
  "next_event",
  "facility",
  "tasks",
  "next_meeting",
  "sponsors",
];

function Dashboard() {
  const navigate = useNavigate();
  const getCtx = useServerFn(getMyContext);
  const { data: ctx, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => getCtx({}),
  });

  useEffect(() => {
    if (!isLoading && ctx && !ctx.organization) {
      navigate({ to: "/onboarding" });
    }
  }, [ctx, isLoading, navigate]);

  const orgId = ctx?.organization?.id;

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const [members, events, sponsors, bookings] = await Promise.all([
        supabase
          .from("members")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId!),
        supabase
          .from("events")
          .select("title, starts_at")
          .eq("organization_id", orgId!)
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true })
          .limit(1),
        supabase
          .from("sponsors")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId!)
          .eq("active", true),
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId!),
      ]);
      return {
        membersCount: members.count ?? 0,
        nextEvent: events.data?.[0] ?? null,
        sponsorsCount: sponsors.count ?? 0,
        bookingsCount: bookings.count ?? 0,
      };
    },
  });

  const { data: enabled } = useQuery({
    queryKey: ["widget-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("widget_settings")
        .select("widget_key, enabled");
      const map = new Map(data?.map((d) => [d.widget_key, d.enabled]) ?? []);
      return DEFAULT_WIDGETS.filter((k) => map.get(k) !== false);
    },
  });

  const widgetsToShow = enabled ?? DEFAULT_WIDGETS;

  const allWidgets: Record<
    WidgetKey,
    { icon: typeof Users; label: string; value: string; to: string }
  > = {
    members: {
      icon: Users,
      label: "Mitglieder",
      value: `${stats?.membersCount ?? 0}`,
      to: "/mitglieder",
    },
    next_event: {
      icon: PartyPopper,
      label: "Nächstes Event",
      value: stats?.nextEvent
        ? new Date(stats.nextEvent.starts_at).toLocaleDateString("de-DE", {
            weekday: "short",
            day: "numeric",
            month: "long",
          })
        : "Kein Termin",
      to: "/events",
    },
    facility: {
      icon: CalendarRange,
      label: "Platzbuchungen",
      value: `${stats?.bookingsCount ?? 0}`,
      to: "/platzplanung",
    },
    tasks: {
      icon: Sparkles,
      label: "Offene Aufgaben",
      value: "3",
      to: "/ki",
    },
    next_meeting: {
      icon: PartyPopper,
      label: "Nächste Sitzung",
      value: "Mo, 16. Juni",
      to: "/events",
    },
    sponsors: {
      icon: Handshake,
      label: "Sponsoren aktiv",
      value: `${stats?.sponsorsCount ?? 0}`,
      to: "/sponsoren",
    },
  };

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dein Verein auf einen Blick.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {widgetsToShow.map((key) => {
          const w = allWidgets[key];
          return (
            <div key={key} className="surface-card group relative flex flex-col p-5">
              <div className="flex items-start justify-between">
                <w.icon className="size-4 text-primary" strokeWidth={1.5} />
              </div>
              <div className="mt-8">
                <div className="text-3xl font-semibold tracking-tight">
                  {w.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {w.label}
                </div>
              </div>
              <Link
                to={w.to}
                className="mt-6 inline-flex items-center gap-1 self-end text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                Öffnen
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
