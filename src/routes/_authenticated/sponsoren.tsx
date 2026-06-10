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

export const Route = createFileRoute("/_authenticated/sponsoren")({
  head: () => ({ meta: [{ title: "Sponsoren — Clubbase" }] }),
  component: Page,
});

type Sponsor = {
  id: string;
  name: string;
  contact_email: string | null;
  amount_cents: number;
  active: boolean;
};

function Page() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", contact_email: "", amount: "" });

  const { data } = useQuery({
    queryKey: ["sponsors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Sponsor[];
    },
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .single();
    if (!profile?.organization_id) return toast.error("Kein Verein");
    const { error } = await supabase.from("sponsors").insert({
      name: form.name,
      contact_email: form.contact_email || null,
      amount_cents: form.amount
        ? Math.round(parseFloat(form.amount.replace(",", ".")) * 100)
        : 0,
      organization_id: profile.organization_id,
    });
    if (error) return toast.error(error.message);
    toast.success("Sponsor hinzugefügt");
    setOpen(false);
    setForm({ name: "", contact_email: "", amount: "" });
    qc.invalidateQueries({ queryKey: ["sponsors"] });
  }

  async function remove(row: Sponsor) {
    await supabase.from("sponsors").delete().eq("id", row.id);
    qc.invalidateQueries({ queryKey: ["sponsors"] });
  }

  return (
    <AppShell>
      <PageHeader
        title="Sponsoren"
        description="Partner deines Vereins."
        action={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="size-3.5" />
            Sponsor
          </PrimaryButton>
        }
      />
      <DataTable
        rows={data ?? []}
        columns={[
          {
            key: "name",
            label: "Name",
            render: (r) => <span className="font-medium">{r.name}</span>,
          },
          {
            key: "contact_email",
            label: "Kontakt",
            render: (r) => r.contact_email ?? "—",
          },
          {
            key: "amount_cents",
            label: "Beitrag",
            render: (r) =>
              (r.amount_cents / 100).toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
              }),
          },
          {
            key: "active",
            label: "Status",
            render: (r) =>
              r.active ? (
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Aktiv
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Inaktiv</span>
              ),
          },
        ]}
        onDelete={remove}
        empty="Noch keine Sponsoren."
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Sponsor hinzufügen">
        <form onSubmit={add} className="space-y-4">
          <Field
            label="Name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
          />
          <Field
            label="Kontakt-E-Mail"
            type="email"
            value={form.contact_email}
            onChange={(v) => setForm({ ...form, contact_email: v })}
          />
          <Field
            label="Beitrag pro Jahr (EUR)"
            type="number"
            value={form.amount}
            onChange={(v) => setForm({ ...form, amount: v })}
          />
          <PrimaryButton type="submit">Speichern</PrimaryButton>
        </form>
      </Modal>
    </AppShell>
  );
}
