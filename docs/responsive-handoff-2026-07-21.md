# KlubOS öffentliche Website — Responsive Handoff

Stand: 21.07.2026  
Scope: öffentliche Website und öffentliche Einstiege vor der App. Die interne App-Mobile-Entscheidung bleibt unverändert.

## Befunde und Änderungen

### P1 — Landingpage-Widgets auf Tabletbreite angeschnitten

**Observed:** Bei 1024px lagen die seitlichen Hero-Widgets teilweise außerhalb des sichtbaren Viewports. Der Body selbst hatte keinen horizontalen Scrollbereich, die Karten waren aber links und rechts angeschnitten.

**Fix:** In `index.html` werden die seitlichen Widgets zwischen 901px und 1100px innerhalb des Hero-Rahmens positioniert. Desktop-Breiten oberhalb 1100px behalten die bestehende, bewusst schwebende Komposition.

### P1 — Mobile Hero-Eyebrow vom Fixed Header überlagert

**Observed:** Bei 375px bis 414px lag der obere Teil von „Für deutsche Tennisvereine · Vorstandshub“ teilweise unter dem Fixed Header.

**Fix:** Der mobile Hero erhält zusätzlichen oberen Innenabstand. Die Headline, CTAs und Widget-Karten bleiben vollständig sichtbar.

### P2 — Dekorative Hero-Karten am Desktop-Rand

**Observed:** Die äußeren Social-/Booking-Widget-Karten lagen bei 1280px und 1440px teilweise außerhalb des Viewports. Dadurch konnten sichtbare Textteile angeschnitten werden.

**Fix:** Beide äußeren Karten liegen jetzt innerhalb des Viewports. Das Raster und die Glow-Flächen dürfen als rein dekorative, nicht-interaktive Hintergründe weiterhin über den Rand hinauslaufen.

### Keine Änderungen an der Vereinssuche-Produktlogik

Die Vereinssuche wurde nur auf Darstellung und Navigation geprüft. Es wurden keine Such-, Daten-, Übernahme- oder Golden-Workflow-Regeln geändert.

## Viewport-Matrix

| Viewport | Öffentliche Seiten | Ergebnis |
| --- | --- | --- |
| 375 × 812 | Landingpage, Datenschutz, Impressum, Login, Signup, Pilot, Vereinssuche | Kein horizontaler Seiten-Overflow; Landingpage nach Fix ohne Header-Überlagerung |
| 390 × 844 | Landingpage, öffentliche Einstiege | Kein horizontaler Seiten-Overflow |
| 414 × 896 | Landingpage, öffentliche Einstiege | Kein horizontaler Seiten-Overflow |
| 768 × 1024 | Landingpage, öffentliche Einstiege | Kein horizontaler Seiten-Overflow; Mobile-Navigation/Layout bleibt stabil |
| 1024 × 768 | Landingpage, öffentliche Einstiege | Hero-Widgets nach Fix vollständig im sichtbaren Bereich |
| 1280 × 800 | Landingpage, öffentliche Einstiege | Bestehende schwebende Desktop-Komposition erhalten |
| 1440 × 900 | Landingpage, öffentliche Einstiege | Bestehende schwebende Desktop-Komposition erhalten |

Die seitlichen Widgets bleiben bei 1280px und 1440px vollständig sichtbar. Nur rein dekorative Raster-/Glow-Flächen können über den Rand hinausreichen und erzeugen keinen horizontalen Body-Scrollbereich.

## Flow-Evidenz

- Landingpage CTA „Euren Verein entdecken“ führt zu `vereinssuche.html`.
- Landingpage Header „Einloggen“ führt zu `login.html`.
- Landingpage „Pilot besprechen“ führt zu `pilot.html`.
- Login-Formular ist auf Mobile bedienbar; ein synthetischer ungültiger Testzugang erzeugt den erwarteten Validierungsfehler.
- Vereinssuche wird im projektspezifischen Asset-Sync-Workflow als vollständige Legacy-Seite ausgeliefert; ihre Produktlogik wurde nicht verändert.

## Checks

- `node --check js/app.js`: erfolgreich
- `astro check`: 0 Fehler, 0 Warnungen, 0 Hinweise
- `astro build`: erfolgreich
- Build-Ausgabe nach dem vorgesehenen Legacy-Asset-Sync geprüft
- Responsive Browser-Prüfung lokal durchgeführt

## Live-/Deploymentstatus

- **Lokal geprüft:** oben genannte Viewports, CTA-Flows und öffentliche Formulare.
- **Öffentlich live geprüft:** `https://klubos.de/` nach Deployment bei 375 × 812, 1024 × 768 und 1440 × 900; CTA zur Vereinssuche und horizontale Scrollbreite geprüft.
- **Unabhängiger Controller-Check:** final PASS nach dem zweiten Deployment; Hero-Karten, `scrollWidth = clientWidth`, öffentliche Seiten, CTAs und Live-Konsole bestätigt.
- **200%-Browserzoom:** mit der verfügbaren Browsersteuerung nicht als echter Browser-Zoomschritt reproduziert; die schmalen CSS-Viewport-Checks decken den relevanten Reflow-Fall ab.

## Offene Punkte

1. Prüfen, ob die Vercel-/Build-Umgebung den `sync:assets`-Schritt aus `package.json` tatsächlich ausführt; ohne diesen Schritt werden die Legacy-HTML-Einstiege nicht in die statische Ausgabe kopiert.
2. Der angeforderte Pfad `docs/vereinssuche-golden-workflow-v0.8.4.md` war im Repository nicht vorhanden. Vor Änderungen an der Vereinssuche muss der verbindliche Workflow wieder zugänglich gemacht werden.
