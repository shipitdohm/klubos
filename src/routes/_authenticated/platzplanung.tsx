import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import {
  PageHeader,
  PrimaryButton,
  DataTable,
  Modal,
  Field,
  Plus,
} from "@/components/data-ui";
import { getMyContext } from "@/lib/clubbase.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/platzplanung")({
  head: () => ({ meta: [{ title: "Platzplanung — Clubbase" }] }),
  component: Page,
});

type Booking = {
  id: string;
  facility: string;
  starts_at: string;
  ends_at: string;
  booked_by: string | null;
};

function Page() {
  const qc = useQueryClient();
  const getCtx = useServerFn(getMyContext);
  const { data: ctx } = useQuery({ queryKey: ["me"], queryFn: () => getCtx({}) });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    facility: "",
    starts_at: "",
    ends_at: "",
    booked_by: "",
  });

  const { data } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data as Booking[];
    },
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .single();
    if (!profile?.organization_id) return toast.error("Kein Verein");
    const { error } = await supabase.from("bookings").insert({
      facility: form.facility,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      booked_by: form.booked_by || null,
      organization_id: profile.organization_id,
    });
    if (error) return toast.error(error.message);
    toast.success("Buchung erstellt");
    setOpen(false);
    setForm({ facility: "", starts_at: "", ends_at: "", booked_by: "" });
    qc.invalidateQueries({ queryKey: ["bookings"] });
  }

  async function remove(row: Booking) {
    await supabase.from("bookings").delete().eq("id", row.id);
    qc.invalidateQueries({ queryKey: ["bookings"] });
  }

  const fmt = (s: string) =>
    new Date(s).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <AppShell>
      <PageHeader
        title="Platzplanung"
        description="Plätze und Hallen buchen."
        action={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="size-3.5" />
            Buchung
          </PrimaryButton>
        }
      />

      {ctx?.organization?.eversports_url && (
        <div className="surface-card mb-6 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 hairline-b">
            <div>
              <h2 className="text-sm font-semibold">Eversports Live-Buchung</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Direkt eingebettet — Buchungen laufen weiter über Eversports.
              </p>
            </div>
            <a
              href={ctx.organization.eversports_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline"
            >
              In Eversports öffnen ↗
            </a>
          </div>
          <iframe
            src={ctx.organization.eversports_url}
            title="Eversports Platzbuchung"
            className="h-[900px] w-full bg-background"
          />
        </div>
      )}

      <DataTable
        rows={data ?? []}
        columns={[
          {
            key: "facility",
            label: "Anlage",
            render: (r) => <span className="font-medium">{r.facility}</span>,
          },
          { key: "starts_at", label: "Von", render: (r) => fmt(r.starts_at) },
          { key: "ends_at", label: "Bis", render: (r) => fmt(r.ends_at) },
          { key: "booked_by", label: "Gebucht von", render: (r) => r.booked_by ?? "—" },
        ]}
        onDelete={remove}
        empty="Noch keine eigenen Buchungen."
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Buchung erstellen">
        <form onSubmit={add} className="space-y-4">
          <Field
            label="Anlage"
            value={form.facility}
            onChange={(v) => setForm({ ...form, facility: v })}
            required
            placeholder="Platz 1, Halle B …"
          />
          <Field
            label="Von"
            type="datetime-local"
            value={form.starts_at}
            onChange={(v) => setForm({ ...form, starts_at: v })}
            required
          />
          <Field
            label="Bis"
            type="datetime-local"
            value={form.ends_at}
            onChange={(v) => setForm({ ...form, ends_at: v })}
            required
          />
          <Field
            label="Gebucht von"
            value={form.booked_by}
            onChange={(v) => setForm({ ...form, booked_by: v })}
          />
          <PrimaryButton type="submit">Speichern</PrimaryButton>
        </form>
      </Modal>
    </AppShell>
  );
}
