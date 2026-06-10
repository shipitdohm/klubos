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

export const Route = createFileRoute("/_authenticated/mitglieder")({
  head: () => ({ meta: [{ title: "Mitglieder — Clubbase" }] }),
  component: Page,
});

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  role: string | null;
  organization_id: string;
};

function Page() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
  });

  const { data } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Member[];
    },
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .single();
    if (!profile?.organization_id) {
      toast.error("Kein Verein zugeordnet");
      return;
    }
    const { error } = await supabase.from("members").insert({
      ...form,
      organization_id: profile.organization_id,
    });
    if (error) return toast.error(error.message);
    toast.success("Mitglied hinzugefügt");
    setOpen(false);
    setForm({ first_name: "", last_name: "", email: "", role: "" });
    qc.invalidateQueries({ queryKey: ["members"] });
  }

  async function remove(row: Member) {
    const { error } = await supabase.from("members").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["members"] });
  }

  return (
    <AppShell>
      <PageHeader
        title="Mitglieder"
        description="Alle Mitglieder deines Vereins."
        action={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="size-3.5" />
            Mitglied
          </PrimaryButton>
        }
      />
      <DataTable
        rows={data ?? []}
        columns={[
          {
            key: "name",
            label: "Name",
            render: (r) => (
              <span className="font-medium">
                {r.first_name} {r.last_name}
              </span>
            ),
          },
          { key: "email", label: "E-Mail", render: (r) => r.email ?? "—" },
          { key: "role", label: "Rolle", render: (r) => r.role ?? "—" },
        ]}
        onDelete={remove}
        empty="Noch keine Mitglieder. Lege das erste an."
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Mitglied hinzufügen">
        <form onSubmit={add} className="space-y-4">
          <Field
            label="Vorname"
            value={form.first_name}
            onChange={(v) => setForm({ ...form, first_name: v })}
            required
          />
          <Field
            label="Nachname"
            value={form.last_name}
            onChange={(v) => setForm({ ...form, last_name: v })}
            required
          />
          <Field
            label="E-Mail"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <Field
            label="Rolle (optional)"
            value={form.role}
            onChange={(v) => setForm({ ...form, role: v })}
            placeholder="z. B. Trainer:in"
          />
          <PrimaryButton type="submit">Speichern</PrimaryButton>
        </form>
      </Modal>
    </AppShell>
  );
}
