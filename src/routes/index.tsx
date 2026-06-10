import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Users,
  CalendarRange,
  Wallet,
  Handshake,
  PartyPopper,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Clubbase — Das digitale Betriebssystem für deinen Verein",
      },
      {
        name: "description",
        content:
          "KI-gestützte Verwaltung für Vereinsvorstände. Weniger Arbeit für Freiwillige. Mehr Sport.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Sparkles,
    title: "Vereins-KI",
    desc: "Plane, schreibe, entscheide — mit deiner Vereins-KI.",
  },
  {
    icon: Users,
    title: "Mitgliederverwaltung",
    desc: "Alle Mitglieder, Rollen und Beiträge an einem Ort.",
  },
  {
    icon: CalendarRange,
    title: "Platz- & Hallenplanung",
    desc: "Belegung, Konflikte und Buchungen in Sekunden.",
  },
  {
    icon: Wallet,
    title: "Finanzen",
    desc: "Beiträge, Ausgaben, Förderungen — übersichtlich.",
  },
  {
    icon: Handshake,
    title: "Sponsoren",
    desc: "Sponsoren pflegen, Berichte erstellen, Verträge tracken.",
  },
  {
    icon: PartyPopper,
    title: "Events",
    desc: "Vom Sommerfest bis zur JHV — komplett organisiert.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="hairline-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-primary teal-glow" />
            <span className="text-base font-semibold tracking-tight">Clubbase</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              to="/auth"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Einloggen
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground teal-glow transition-transform hover:scale-[1.02]"
            >
              Frühen Zugang
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pt-28 pb-24 text-center sm:pt-36">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground hairline">
          <span className="size-1.5 rounded-full bg-primary teal-glow" />
          Privater Beta-Zugang
        </div>
        <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          Das digitale Betriebssystem
          <br />
          <span className="text-muted-foreground">für deinen Verein.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          KI-gestützte Verwaltung für Vereinsvorstände. Weniger Arbeit für
          Freiwillige. Mehr Sport.
        </p>
        <div className="mt-10 flex items-center justify-center">
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground teal-glow transition-transform hover:scale-[1.02]"
          >
            Frühen Zugang sichern
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-32">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl hairline sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative bg-card p-7 transition-colors hover:bg-secondary/40"
            >
              <f.icon className="size-5 text-primary" strokeWidth={1.5} />
              <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="hairline-b mt-auto">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-7 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded bg-primary" />
            <span className="text-sm font-medium">Clubbase</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Gebaut für Vorstände. Nicht für Mitglieder.
          </p>
        </div>
      </footer>
    </div>
  );
}
