import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/events")({
  head: () => ({ meta: [{ title: "Events — Clubbase" }] }),
  component: Page,
});

type Event = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  location: string | null;
};

function Page() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    starts_at: "",
    location: "",
  });

  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data as Event[];
    },
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .single();
    if (!profile?.organization_id) return toast.error("Kein Verein");
    const { error } = await supabase.from("events").insert({
      ...form,
      starts_at: new Date(form.starts_at).toISOString(),
      organization_id: profile.organization_id,
    });
    if (error) return toast.error(error.message);
    toast.success("Event angelegt");
    setOpen(false);
    setForm({ title: "", description: "", starts_at: "", location: "" });
    qc.invalidateQueries({ queryKey: ["events"] });
  }

  async function remove(row: Event) {
    await supabase.from("events").delete().eq("id", row.id);
    qc.invalidateQueries({ queryKey: ["events"] });
  }

  return (
    <AppShell>
      <PageHeader
        title="Events"
        description="Termine und Veranstaltungen."
        action={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="size-3.5" />
            Event
          </PrimaryButton>
        }
      />
      <DataTable
        rows={data ?? []}
        columns={[
          {
            key: "title",
            label: "Titel",
            render: (r) => <span className="font-medium">{r.title}</span>,
          },
          {
            key: "starts_at",
            label: "Wann",
            render: (r) =>
              new Date(r.starts_at).toLocaleString("de-DE", {
                weekday: "short",
                day: "2-digit",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              }),
          },
          { key: "location", label: "Ort", render: (r) => r.location ?? "—" },
        ]}
        onDelete={remove}
        empty="Noch keine Events."
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Event anlegen">
        <form onSubmit={add} className="space-y-4">
          <Field
            label="Titel"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            required
          />
          <Field
            label="Datum & Zeit"
            type="datetime-local"
            value={form.starts_at}
            onChange={(v) => setForm({ ...form, starts_at: v })}
            required
          />
          <Field
            label="Ort"
            value={form.location}
            onChange={(v) => setForm({ ...form, location: v })}
          />
          <Field
            label="Beschreibung"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
          />
          <PrimaryButton type="submit">Speichern</PrimaryButton>
        </form>
      </Modal>
    </AppShell>
  );
}
