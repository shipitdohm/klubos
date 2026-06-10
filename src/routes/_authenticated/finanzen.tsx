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

export const Route = createFileRoute("/_authenticated/finanzen")({
  head: () => ({ meta: [{ title: "Finanzen — Clubbase" }] }),
  component: Page,
});

type Entry = {
  id: string;
  description: string;
  amount_cents: number;
  kind: string;
  occurred_on: string;
};

function Page() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    kind: "income",
    occurred_on: new Date().toISOString().slice(0, 10),
  });

  const { data } = useQuery({
    queryKey: ["finances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("finances")
        .select("*")
        .order("occurred_on", { ascending: false });
      if (error) throw error;
      return data as Entry[];
    },
  });

  const total =
    data?.reduce(
      (acc, r) => acc + (r.kind === "income" ? r.amount_cents : -r.amount_cents),
      0,
    ) ?? 0;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .single();
    if (!profile?.organization_id) return toast.error("Kein Verein");
    const { error } = await supabase.from("finances").insert({
      description: form.description,
      amount_cents: Math.round(parseFloat(form.amount.replace(",", ".")) * 100),
      kind: form.kind,
      occurred_on: form.occurred_on,
      organization_id: profile.organization_id,
    });
    if (error) return toast.error(error.message);
    toast.success("Eintrag gespeichert");
    setOpen(false);
    setForm({
      description: "",
      amount: "",
      kind: "income",
      occurred_on: new Date().toISOString().slice(0, 10),
    });
    qc.invalidateQueries({ queryKey: ["finances"] });
  }

  async function remove(row: Entry) {
    await supabase.from("finances").delete().eq("id", row.id);
    qc.invalidateQueries({ queryKey: ["finances"] });
  }

  const eur = (cents: number) =>
    (cents / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  return (
    <AppShell>
      <PageHeader
        title="Finanzen"
        description="Einnahmen und Ausgaben."
        action={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="size-3.5" />
            Eintrag
          </PrimaryButton>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="surface-card p-5">
          <div className="text-xs text-muted-foreground">Saldo</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{eur(total)}</div>
        </div>
        <div className="surface-card p-5">
          <div className="text-xs text-muted-foreground">Einträge</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {data?.length ?? 0}
          </div>
        </div>
        <div className="surface-card p-5">
          <div className="text-xs text-muted-foreground">Letzter Eintrag</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {data?.[0]
              ? new Date(data[0].occurred_on).toLocaleDateString("de-DE")
              : "—"}
          </div>
        </div>
      </div>

      <DataTable
        rows={data ?? []}
        columns={[
          {
            key: "description",
            label: "Beschreibung",
            render: (r) => <span className="font-medium">{r.description}</span>,
          },
          {
            key: "kind",
            label: "Art",
            render: (r) => (
              <span
                className={
                  r.kind === "income" ? "text-primary" : "text-muted-foreground"
                }
              >
                {r.kind === "income" ? "Einnahme" : "Ausgabe"}
              </span>
            ),
          },
          {
            key: "amount_cents",
            label: "Betrag",
            render: (r) => (
              <span className="tabular-nums">
                {r.kind === "income" ? "+" : "−"} {eur(r.amount_cents)}
              </span>
            ),
          },
          {
            key: "occurred_on",
            label: "Datum",
            render: (r) => new Date(r.occurred_on).toLocaleDateString("de-DE"),
          },
        ]}
        onDelete={remove}
        empty="Noch keine Buchungen."
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Eintrag erstellen">
        <form onSubmit={add} className="space-y-4">
          <Field
            label="Beschreibung"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            required
          />
          <Field
            label="Betrag (EUR)"
            type="number"
            value={form.amount}
            onChange={(v) => setForm({ ...form, amount: v })}
            required
          />
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Art
            </span>
            <select
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value })}
              className="block h-10 w-full rounded-md bg-input/40 px-3 text-sm outline-none hairline focus:border-primary"
            >
              <option value="income">Einnahme</option>
              <option value="expense">Ausgabe</option>
            </select>
          </label>
          <Field
            label="Datum"
            type="date"
            value={form.occurred_on}
            onChange={(v) => setForm({ ...form, occurred_on: v })}
          />
          <PrimaryButton type="submit">Speichern</PrimaryButton>
        </form>
      </Modal>
    </AppShell>
  );
}
