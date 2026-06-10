import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CalendarRange,
  Wallet,
  Handshake,
  PartyPopper,
  Sparkles,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyContext } from "@/lib/clubbase.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mitglieder", label: "Mitglieder", icon: Users },
  { to: "/platzplanung", label: "Platzplanung", icon: CalendarRange },
  { to: "/finanzen", label: "Finanzen", icon: Wallet },
  { to: "/sponsoren", label: "Sponsoren", icon: Handshake },
  { to: "/events", label: "Events", icon: PartyPopper },
  { to: "/ki", label: "Vereins-KI", icon: Sparkles },
  { to: "/einstellungen", label: "Einstellungen", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const ctx = useServerFn(getMyContext);
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: () => ctx({}),
  });

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Abgemeldet");
    navigate({ to: "/auth", replace: true });
  }

  const initial =
    data?.profile?.full_name?.[0]?.toUpperCase() ||
    data?.profile?.email?.[0]?.toUpperCase() ||
    "V";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hairline-r sticky top-0 hidden h-screen w-60 flex-col bg-sidebar md:flex">
        <div className="flex h-14 items-center px-5 hairline-b">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="size-5 rounded-md bg-primary teal-glow" />
            <span className="text-sm font-semibold tracking-tight">Clubbase</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV.map((item) => {
            const active =
              pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                }`}
              >
                <item.icon
                  className={`size-4 ${active ? "text-primary" : ""}`}
                  strokeWidth={1.5}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={signOut}
          className="m-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground"
        >
          <LogOut className="size-4" strokeWidth={1.5} />
          Abmelden
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-background/80 px-6 backdrop-blur hairline-b">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {data?.organization?.name ?? "Dein Verein"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground">
              <Bell className="size-4" strokeWidth={1.5} />
            </button>
            <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
              {initial}
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
