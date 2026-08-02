# KlubOS Landingpage / Pilot – Review-Kandidat

**Stand:** 02.08.2026
**Status:** In review
**Veröffentlichung:** lokal geprüft; nicht gepusht und nicht deployed.

## Scope

Dieser Kandidat verbindet die öffentliche Landingpage mit einem ehrlichen Pilot-Flow. Die Vereinssuche VS-0.8.4, ihre Produktlogik und geschützte Regression-/Vertragsdateien wurden nicht fachlich geändert. Vorhandene Working-Tree-Änderungen außerhalb dieses Scopes bleiben unangetastet.

## Umgesetzte Dateien

- `index.html` – Landingpage-Messaging, Workflow-Beispiel, Calculator-Weitergabe, Hero-Eyebrow und Favicon-only-Footer.
- `pilot.html` – dreistufiger Pilot-Flow ohne Beispieltermine; Booking-Provider- und Anfrage-Fallback; Calculator-Kontext, Review und E-Mail-Zusammenfassung.
- `package.json` – additive öffentliche Site-Config-Synchronisation; bestehende Vereinssuche-Synchronisation und `test:search-alias` bleiben erhalten.
- `.env.example` – öffentliche `PUBLIC_BOOKING_URL`-/`PUBLIC_BOOKING_PROVIDER`-Konfiguration.
- `js/site-config.js` – nicht-geheime lokale Fallback-Konfiguration.
- `scripts/generate-site-config.mjs` – erzeugt beim Sync/Build die öffentliche Konfiguration aus Umgebungsvariablen.
- `css/style.css` – kleiner responsiver Favicon-Stil für den Landingpage-Footer.
- `docs/landingpage-review-2026-08-02.md` – dieser Handoff.

## Pilot-Flow

1. `index.html` führt mit einem klaren Pilot-CTA zu `pilot.html`.
2. Der Verein und der gewünschte erste Workflow werden erfasst.
3. Ohne `PUBLIC_BOOKING_URL` setzt der Flow den nächsten Schritt ehrlich auf `Terminabstimmung auf Anfrage`; es werden keine Slots, Beispieldaten oder Juli-Termine gerendert.
4. Mit einer gültigen `https://`-Booking-URL zeigt der Flow den externen Kalender in einem neuen Tab. Nach manueller Bestätigung wird der Kontext als ausgewählter Termin in Review und E-Mail übernommen.
5. Der letzte Schritt erzeugt eine prüfbare E-Mail-Zusammenfassung; der Calculator-Kontext bleibt dabei erhalten.

Apple Calendar ist kein eigenständiger öffentlicher Booking-Backend. Für die produktive Konfiguration ist ein Google-Calendar Appointment Schedule, Cal.com oder Calendly mit Kalender-Synchronisation vorgesehen. Es werden keine Zugangsdaten im Repository abgelegt.

## Calculator-Übergabe

Der Calculator verlinkt mit `source=calculator` sowie `calculatorMonthly`, `calculatorWorkload` und `calculatorAreas` zu `pilot.html`. Der Pilot zeigt die Orientierung als Gesprächsgrundlage, kennzeichnet sie ausdrücklich als nicht verbindliches Einsparversprechen und nimmt sie in Review und E-Mail auf.

## Sichtbarer End-to-End-Workflow

Die Landingpage zeigt den konkreten Produktablauf: **Aufgabe wählen → Vereinskontext nutzen → Entwurf vorbereiten → prüfen und freigeben.** Damit wird die Vereins-KI als unterstützender Schritt in einem Arbeitsablauf eingeordnet, nicht als Produktidentität oder Chatbot-Gegenentwurf.

## Vertrauens- und Copy-Prüfung

- Überclaim „Bruchteil der Zeit“ entfernt.
- Interner Gag-/Debug-Text entfernt.
- Alte „Vorstandshub“- und Beispieltermin-Formulierungen aus Landingpage/Pilot entfernt.
- Hero-Eyebrow auf „Das Gehirn für euren Verein“ und damit auf die `ihr/euch/euer`-Ansprache vereinheitlicht.
- Footer verwendet im Landingpage-Branding nur noch das KlubOS-Favicon; das Header-Logo bleibt separat.

## Checks und Evidenz

- `node --check js/site-config.js` – PASS mit Workspace-Node-Runtime.
- Pilot-Inline-Script via Extraktion und `node --check` – PASS.
- Statischer Flow-Check – PASS: Booking-URL- und Fallback-Zweige, `state.slot`, Calculator-Parameter, Review-/E-Mail-Übergabe vorhanden; keine `data-slot`-Listener oder alten Beispieldaten im Pilot-Markup.
- Globale Stale-Copy-Suche nach `Vorstandshub`, `WOW`, `Bruchteil der Zeit`, `Beispieltermine` und Juli-Terminen in Landingpage/Pilot/Config – keine Treffer.
- `pnpm run check` – PASS: 19 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise (mit freigegebener Workspace-Runtime, da der erste Lauf beim Schreiben von `.astro` an `EPERM` scheiterte).
- Direkter `pnpm exec astro build` – PASS: 7 Astro-Seiten gebaut.
- Vorgesehener `pnpm run build` – BLOCKIERT vor Astro durch eine bestehende Working-Tree-Löschung: `cp: scripts/vereinssuche-regression-matrix.v0.8.4.json: No such file or directory`. Die Copy-Anweisung wurde bewusst nicht entfernt.
- `pnpm run test:search-alias` – BLOCKIERT durch die bestehende Working-Tree-Löschung `scripts/vereinssuche-alias-contract.mjs`; die Datei ist in `HEAD` vorhanden und wurde nicht wiederhergestellt oder verändert.
- `git diff -- package.json` – geprüft: nur additive Site-Config-Synchronisation; die vorhandene Regression-Matrix-Synchronisation und `test:search-alias` bleiben erhalten.
- Geschützte Vereinssuche-Diffs – geprüft: ausschließlich bereits bestehende Working-Tree-Änderungen/Löschungen, keine Änderungen aus diesem Landingpage-/Pilot-Scope.

Die responsive und visuelle Endkontrolle nach dieser letzten kleinen Copy/Icon-Runde bleibt dem Brain Agent vorbehalten. In dieser Runde wurden keine weiteren Designänderungen vorgenommen.

## Offene Founder-/Legal-Punkte

1. Einen produktiven Booking-Provider auswählen und `PUBLIC_BOOKING_URL` sowie optional `PUBLIC_BOOKING_PROVIDER` in der Deployment-Umgebung setzen.
2. Vor Produktion eine belastbare Lead-Erfassung statt `mailto` entscheiden (z. B. serverseitiger Endpoint oder CRM-Formular), damit Anfragen nicht vom Mailprogramm des Nutzers abhängen.
3. `impressum.html` und `datenschutz.html` enthalten weiterhin unvollständige/pre-production Rechtstext-Shells. Betreiber, ladungsfähige Anschrift, verantwortliche Person, Hosting-/Auftragsverarbeitungsdaten, Tracking-/Speicherentscheidungen und die finalen Rechtstexte müssen vom Founder/Legal ergänzt und geprüft werden. Diese Angaben wurden nicht erfunden und in diesem Scope nicht geändert.
4. Produktive Pilot-Automationen und Integrationen erst nach tatsächlicher Einrichtung als Fähigkeit kommunizieren.

## Founder-Iteration: Copy, Rollen-Avatare und visuelle Rhythmik

Zusätzlich umgesetzt, weiterhin **In review**, lokal-only:

- Der Vergleichsabschnitt erklärt jetzt den USP direkt: wiederkehrende Verwaltungsarbeit wird abgenommen; Aufgaben, Informationen und Unterlagen werden an einem gemeinsamen Ort organisiert.
- Die drei vorhandenen Assets unter `assets/role-avatars/` sind in `role-vorsitz`, `role-kasse` und `role-sport` eingebunden. Sie sitzen oben rechts, dürfen kontrolliert über die Kartenkante ragen und lassen der Copy eine eigene Textbreite.
- Die Rollen-Section ist als vollflächige weiße Atempause abgesetzt. Terracotta, Warning-Gold und Success-Grün werden nur als dezente rollenbezogene Halos und Akzente verwendet.
- Bei Mobile skalieren die Avatare auf 7,4rem bzw. 6,6rem bei sehr kleinen Breiten. Die Figuren bleiben sichtbar, ohne horizontalen Overflow zu erzeugen.

### Lokale Responsive-Evidenz

Browserprüfung über einen lokalen statischen HTTP-Server:

- Desktop 1440×900: Avatare oben rechts, teilweise über Kartenkante; `scrollWidth === clientWidth`.
- Mobile 390×844: Hero-Floating-Widgets ausgeblendet, Header und CTA ohne Überdeckung; Rollen-Avatare rechts in einspaltigen Karten; kein horizontaler Overflow.
- Sehr klein 320×800: Header-Buttons bleiben innerhalb des Viewports; `scrollWidth === clientWidth`; Floating-Widgets ausgeblendet.
- Browser-Konsole: 0 Warnungen, 0 Fehler.

### Checks dieser Iteration

- Inline-Scripts in `index.html` und `pilot.html` via `node --check`: PASS.
- Rollen-Asset-/Copy-Assertions: PASS; drei PNGs vorhanden und drei Avatar-Referenzen im Markup.
- `git diff --check -- index.html css/style.css`: PASS.
- `pnpm run check`: PASS, 20 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise.
- Kein Push, kein Deployment. Die bekannte Produktions-Build-Blockade durch die bestehende Löschung der geschützten `scripts/vereinssuche-regression-matrix.v0.8.4.json` bleibt unverändert dokumentiert.

## Founder-Iteration: Typografie, Navigation, Kartenkreise, Workflow und Personas – 02.08.2026

Diese Runde bleibt **In review**, lokal-only. Footer, Vereinssuche, Pilot-Flow, Kalender-Konfiguration und App-Oberflächen wurden nicht angefasst.

### Ursache und Änderung der Typografie

Die Satoshi-Fontfamilie und der CI-Stack waren unverändert. Die wahrgenommene Schwere kam aus der Kombination aus Hero-Gewicht 700 sowie mehreren nativen bzw. explizit auf 650/750 gesetzten Karten-/Microcopy-Regeln. Deshalb wurden nur die relevanten Landingpage-Stellen gezielt zurückgeführt: Hero-H1 auf 600, zentrale Feature-H2 auf 600 und native H3 in Problem-, Vergleichs-, Pilot- und Calculator-Karten ausdrücklich auf 600. Buttons bleiben bei 500, der Font-Stack und die CI-Letter-Spacings bleiben erhalten. Der Login bleibt bei 600 als zurückhaltender sekundärer Button; der Pilot-CTA bleibt farblich dominant.

### Header-Navigation

Die Navigation ist auf `Das Problem` und `So hilft KlubOS` reduziert. `Einloggen` bleibt als weißer Outline-/Surface-Button sichtbar, `Pilotgespräch vereinbaren` bleibt der einzige farbige Primär-CTA. Die entfernten Links haben keinen eigenen Conversion-Job auf der Landingpage und wurden nicht durch künstliche Zusatznavigation ersetzt.

### Kartenkreise und Workflow

Die dekorativen Ringe nutzen weiterhin die KlubOS-Palette, variieren aber bewusst nach Kartenposition: Terracotta oben rechts bei den Rollen, Warning-Gold links bzw. unten bei ausgewählten Karten und Success-Grün bei weiteren Karten/Workflows. Inhalte bleiben über `z-index` vor der Dekoration. Die vier Workflow-Karten zeigen jetzt große visuelle Nummern (`01`–`04`) mit den lesbaren Schritten **Aufgabe wählen → Vereinskontext nutzen → Entwurf vorbereiten → prüfen und freigeben**. Beim Erreichen des Abschnitts werden sie einmalig dezent nacheinander eingeblendet; bei `prefers-reduced-motion: reduce` bleibt der Inhalt sofort sichtbar und die Animation wird deaktiviert.

### Persona-Framing

Die Rollen-Section bleibt eine ruhige weiße Atempause. Alle drei PNG-Avatare verwenden einen vergleichbaren Oberkörper-Frame (`object-fit: cover`, `object-position: center top`, feste responsive Höhen) und dürfen kontrolliert über die obere Kartenkante ragen. Die Rollen-Karten haben dafür explizit `overflow: visible`; auf Mobile werden nur die Halos innerhalb der Kartenbreite gehalten, damit kein horizontaler Dokument-Overflow entsteht. Die Rollenmerkmale bleiben unverändert: Vorsitz ohne Brille im Anzug, Kasse mit dunklerem Hautton/Nerd-Brille/kariertem Hemd, Sport & Jugend im Trainingsanzug.

### Browser-Evidenz dieser Runde

Lokaler statischer HTTP-Server, jeweils nach Reload:

| Viewport | Ergebnis |
| --- | --- |
| 1440×900 | Hero, reduzierte Navigation, Typografie, Workflow-Reveal und Persona-Section geprüft; `document.documentElement.scrollWidth === clientWidth` |
| 390×844 | Header/CTA, Hero und mobile Karten geprüft; Floating-Hero-Karten nicht als normale Elemente sichtbar; kein Dokument-Overflow |
| 320×800 | Header/CTA bleiben im Viewport; Hero-Layout ohne Überdeckung; kein Dokument-Overflow |

Computed-Style-Prüfung: Hero-H1 600, Section-H2 600, Karten-H3 600, Buttons 500, Satoshi-Fallback-Stack unverändert. Workflow-Animation wurde nach dem Reveal vollständig auf Opazität 1/Transform 0 geprüft. Persona-Avatare wurden auf Desktop und Mobile mit sichtbarem Überstand über der Kartenkante geprüft. Browser-Konsole: keine Warnungen oder Fehler in der lokalen Landingpage.

### Checks und Resthinweise

- `pnpm run check` – PASS, 20 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise.
- Inline-JavaScript in `index.html` via Workspace-Node und `node --check` – PASS, 1 Script.
- `git diff --check -- index.html css/style.css` – PASS. Ein vollständiger `git diff --check` meldet weiterhin bereits vorhandene Trailing-Whitespace-Befunde in geschützten Vereinssuche-Dokumenten; diese wurden nicht geändert.
- `pnpm run build` – weiterhin BLOCKIERT vor Astro durch die bestehende Working-Tree-Löschung `scripts/vereinssuche-regression-matrix.v0.8.4.json`; die Package-Anweisung wurde nicht entfernt.
- Browser-Reduced-Motion wurde über die vorhandene CSS-Fallback-Regel statisch geprüft; der Inhaltszustand bleibt ohne Animation sichtbar. Eine separate Systempräferenz-Simulation war im lokalen Browserlauf nicht verfügbar.

Geänderte/neu angelegte Dateien im aktuellen Review-Kandidaten: `index.html` (diese Founder-Iteration), `css/style.css` (bereits vorher dirty im Kandidaten), `docs/landingpage-review-2026-08-02.md` (Handoff), sowie die bereits vorhandenen Rollen-Assets unter `assets/role-avatars/`. Es wurden in dieser Runde keine Vereinssuche-, Footer-, Pilot-, Kalender- oder App-Dateien geändert.

**Nicht gepusht, nicht deployed. Status: In review.**

## Founder-Iteration: Floating Widgets, Login, Personas und Workflow-Farbe – 02.08.2026

Diese Runde bleibt **In review**, lokal-only. Es wurden ausschließlich die vier angeforderten Landingpage-Punkte umgesetzt. Hero-Hauptheadline, Footer, Vereinssuche, Pilot-Flow, Kalender-Konfiguration und App-Oberflächen blieben unverändert.

### Änderungen

1. **Hero-Floating-Widgets:** Widget-Headlines verwenden jetzt Satoshi 500 mit minimal beruhigter Laufweite. Die Hero-Hauptheadline wurde nicht geändert.
2. **Header-Login:** Standardfarbe ist jetzt `var(--fg-muted)`, bei Hover und `:focus-visible` `var(--fg)`. Rahmen, Surface-Hintergrund und globale Focus-Outline bleiben erhalten.
3. **Personas:** Vorsitz, Kasse und Sport verwenden weiterhin denselben sichtbaren Außenrahmen. Der Kasse-Frame wird invers kleiner skaliert und anschließend kontrolliert vergrößert (`scale(1.16)`), damit Kopf/Oberkörper nicht kleiner wirken, der Außenrahmen aber gleich bleibt. Die Avatare sitzen etwas mittiger und ragen weiter über die Kartenkante. Mobile Overrides halten die Geometrie bei 390px und 320px innerhalb des Viewports.
4. **Workflow-Nummern:** `.workflow-step-index`, große Nummern und Labels verwenden explizit `var(--accent)`. Alle vier Schritte sind terracotta; Rollen-Akzentfarben bleiben davon getrennt.

### Responsive-/Browser-Evidenz

| Viewport | Ergebnis |
| --- | --- |
| 1440×900 | Floating-Widget-Headlines ruhiger, Login-/CTA-Hierarchie sichtbar, Avatar-Außenrahmen gleich groß, Workflow 01–04 terracotta; kein horizontaler Overflow |
| 390×844 | Header und CTA sauber angeordnet, Hero-Orbit verborgen, Persona-Frames gleich groß und sichtbar; kein Overflow |
| 320×800 | Header innerhalb des Viewports, Persona-Frames innerhalb der Dokumentbreite, keine angeschnittenen Layoutflächen; kein Overflow |

Computed-Style-Checks: Floating-Widget-H3 `font-weight: 500`; Login standardmäßig `var(--fg-muted)`; Workflow-Nummern/Labels `var(--accent)`; Persona-Außenrahmen nach Transform bei allen drei Rollen gleich groß. Die Hover-/Focus-Regeln wurden statisch geprüft; der globale `:focus-visible`-Outline bleibt aktiv. Browser-Konsole: keine Warnungen oder Fehler.

### Checks / Rest-Risiken

- `pnpm run check`: PASS, 20 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise.
- Inline-JavaScript in `index.html` mit Workspace-Node und `node --check`: PASS, 1 Script.
- `git diff --check -- index.html css/style.css docs/landingpage-review-2026-08-02.md`: PASS.
- Der bekannte Build-Blocker durch die bereits gelöschte geschützte Vereinssuche-Datei `scripts/vereinssuche-regression-matrix.v0.8.4.json` bleibt außerhalb dieses Scopes bestehen.
- Systemweite Reduced-Motion-Simulation war im lokalen Browser nicht verfügbar; bestehende CSS-Fallbacks wurden nicht verändert.
- Founder-Freigabe für die finalen Größen-/Farbgewichtungen der vier Punkte steht aus. Task bleibt **In review**, keine Completed-Felder gesetzt.

Geänderte Dateien dieser Runde: [index.html](/Users/lito/Desktop/ClubOS%20Zentrale/ClubOS/index.html), [css/style.css](/Users/lito/Desktop/ClubOS%20Zentrale/ClubOS/css/style.css) und dieser Handoff.

**Nicht gepusht, nicht deployed.**

## Founder-Iteration: Dekorationskreise, Typografie und weiße Abschnittsflächen – 02.08.2026

Diese lokale Runde bleibt **In review**. Footer, Vereinssuche, Pilot-Flow, Kalender-Konfiguration und App-Oberflächen wurden nicht verändert.

### Entfernte Dekorationen

- Floating-Widget-Kreise, generische `.widget-card::after`-Ringe, Problemkarten-Ringe, Rollen-Halos/Ringe, Workflow-Ringe und die früheren variierenden Kreisregeln vollständig entfernt.
- Hero-Glow, Grid-Hotspots und die ungenutzte radiale Hero-Grid-Maske entfernt. Das feine Grid bleibt ausschließlich als Hero-Hintergrund erhalten.
- Funktionale kleine Punkte und Datenvisualisierungen bleiben: Vergleichsindikatoren, Bridge-Statuspunkte, Sponsor-/Mitgliederstatusmarker, Farbpalette und das Mitglieder-Pie-Chart.
- Statische Prüfung: keine Treffer mehr für die entfernten Landingpage-Dekorationsregeln, `radial-gradient`, `hero-glow`, `grid-hotspot`, `widget-card::after` oder `role-card::before/after` in `index.html`/`css/style.css`.

### Typografie

Die nicht im CI vorgesehenen Gewichte 650 und 750 wurden aus der Landingpage-Kaskade entfernt. Relevante Karten-/Microcopy- und Calculator-Gewichte sind jetzt 600; der Finanzsaldo bleibt als Kennzahl bei 700. Hero/Section-H2, Karten-H3, Workflow-Zahlen und CTA bleiben lesbar, ohne synthetische Zwischengewichte oder Black-Wirkung. Fontfamilie, Satoshi-Fallback-Stack und bestehende kontrollierte Letter-Spacings bleiben erhalten.

### Weiße Flächen

`#problem`, `#vergleich`, `#system`, `#workflow`, `#rechner` und die Persona-Section erhalten vollflächig `#fff`, eigene Abschnitts-Tönungen werden damit nicht mehr vom globalen Grid/Canvas durchscheinen. Rechner-Launch-Panel und Ergebnis-Karte sind ebenfalls neutral weiß; der warme Ergebnis-Gradient wurde entfernt. Die Persona-Karten sind weiß statt gradient-getönt. Der Hero bleibt unverändert als einzige bewusst gerasterte Einstiegsfläche.

### Responsive- und Flow-Evidenz

| Viewport | Ergebnis |
| --- | --- |
| 1440×900 | Hero unverändert, Navigation/CTA sichtbar, weiße Abschnittsflächen und Persona-Avatare geprüft; kein horizontaler Dokument-Overflow |
| 390×844 | Header, Hero, weiße Problem-/Rechnerflächen und mobile Persona-Karten geprüft; Floating-Widgets verborgen; kein Overflow |
| 320×800 | Header/CTA innerhalb des Viewports, weiße Sections, Persona-Avatare sichtbar; kein Overflow |

Der Calculator wurde bei 390px geöffnet und durch Schritt 1–4 geführt. Default-Ergebnis `ca. 4–8` blieb erhalten; der Flow zeigt im letzten Schritt den deaktivierten Zustand `Ergebnis sichtbar`, Reset/CTA-Struktur bleiben vorhanden. Browser-Konsole: keine Warnungen oder Fehler.

### Checks / Rest-Risiken

- `pnpm run check`: PASS, 20 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise.
- Inline-Script `index.html` mit Workspace-Node und `node --check`: PASS, 1 Script.
- `git diff --check -- index.html css/style.css docs/landingpage-review-2026-08-02.md`: PASS.
- Die vollständige Repository-Prüfung bleibt wegen bereits vorhandener Trailing-Whitespace-Befunde in geschützten Vereinssuche-Dokumenten nicht clean; diese Dateien wurden nicht angefasst.
- Der bekannte `pnpm run build`-Blocker durch die bestehende Löschung von `scripts/vereinssuche-regression-matrix.v0.8.4.json` bleibt außerhalb dieses Scopes bestehen; Package-Scripts wurden nicht verändert.
- Reduced-Motion-Fallback ist im CSS vorhanden und der Inhalt bleibt ohne Animation sichtbar; eine separate Systempräferenz-Simulation war im lokalen Browser nicht verfügbar.

Geänderte Dateien dieser Runde: [index.html](/Users/lito/Desktop/ClubOS%20Zentrale/ClubOS/index.html), [css/style.css](/Users/lito/Desktop/ClubOS%20Zentrale/ClubOS/css/style.css) und dieser Handoff. Keine Änderungen an Vereinssuche, Footer, Pilot, Kalender oder App.

**Nicht gepusht, nicht deployed. Status: In review.**
