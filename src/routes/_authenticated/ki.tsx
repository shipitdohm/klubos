import { createFileRoute, Outlet, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { createThread, deleteThread, listThreads } from "@/lib/clubbase.functions";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/ki")({
  head: () => ({ meta: [{ title: "Vereins-KI — Clubbase" }] }),
  component: Layout,
});

function Layout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const del = useServerFn(deleteThread);
  const params = useParams({ strict: false }) as { threadId?: string };

  const { data: threads } = useQuery({
    queryKey: ["threads"],
    queryFn: () => list({}),
  });

  async function newThread() {
    try {
      const t = await create({ data: { title: "Neue Konversation" } });
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/ki/$threadId", params: { threadId: t.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler");
    }
  }

  async function removeThread(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["threads"] });
    if (params.threadId === id) navigate({ to: "/ki" });
  }

  return (
    <AppShell>
      <div className="-mx-6 -my-8 flex h-[calc(100vh-3.5rem)] md:-mx-10">
        <aside className="hairline-r hidden w-64 shrink-0 flex-col bg-sidebar/40 md:flex">
          <div className="flex items-center justify-between px-4 py-3 hairline-b">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Konversationen
            </span>
            <button
              onClick={newThread}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-primary"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
            {(threads ?? []).length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                Noch keine Konversationen.
              </div>
            )}
            {threads?.map((t) => {
              const active = params.threadId === t.id;
              return (
                <div key={t.id} className="group relative">
                  <Link
                    to="/ki/$threadId"
                    params={{ threadId: t.id }}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                    }`}
                  >
                    <Sparkles
                      className={`size-3.5 ${active ? "text-primary" : ""}`}
                      strokeWidth={1.5}
                    />
                    <span className="flex-1 truncate">{t.title}</span>
                  </Link>
                  <button
                    onClick={(e) => removeThread(t.id, e)}
                    className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive group-hover:block"
                  >
                    <Trash2 className="size-3" strokeWidth={1.5} />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </AppShell>
  );
}
