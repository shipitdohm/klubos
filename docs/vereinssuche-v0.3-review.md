# Vereinssuche VS-0.3-live-osm — Specialist Handoff

Status: `READY_FOR_REVIEW`
Datum: 2026-07-20

## Scope

Die Suche fragt bei jeder nichtleeren Anfrage den Server-Endpunkt `/api/vereinssuche` ab. Der Adapter nutzt OpenStreetMap Nominatim für die textuelle Suche und bei regionalem Tennisbezug Overpass für zusätzliche Tennisobjekte. Es gibt keinen lokalen Fixture-Rückfall.

## Geänderte Dateien

- `api/vereinssuche.js` — serverseitiger Adapter, Normalisierung, Deduplizierung, Ranking, Cache, Timeout und Quellenmetadaten; abschließend wurden die `e.V.`-Wortgrenze im Ranking korrigiert und ein leerer Overpass-Fallback als `source_unavailable` behandelt.
- `vereinssuche.html` — Live-Fetch, Ergebniskarte, Ergebnisliste, Quellenbeleg, Fehler-/Leer-/No-Result-Zustände und neutraler Logo-Fallback.
- `package.json` — Build-Skript ohne rekursiven npm-Aufruf; Asset-Synchronisierung in `prebuild`.
- `HOSTING.md` — Produktionsvoraussetzung für Serverless-API dokumentiert.
- `docs/vereinssuche-review-log.md` — dieser Review-Stand und die Evidenz.
- `docs/vereinssuche-v0.3-review.md` — versionierter Handoff.
- generiert: `public/` und `dist/` synchronisiert durch den bestehenden Asset-Build.

## Observed / Claimed / Inferred / Hypothesis

### Observed

- `TC Kirchhörde` liefert im Browser zwei Ergebnisse; der erste Datensatz ist `Tennisclub Kirchhörde eV`, Dortmund.
- Der Kirchhörde-Datensatz zeigt `https://www.openstreetmap.org/way/34002810`, Prüfzeitpunkt, Website `https://tennisclubkirchhoerde.de/` und den Initialen-Fallback `TK`.
- `Tennisclub Köln` liefert acht Ergebnisse; `Tennisclub Koln` liefert ebenfalls Treffer.
- `zzzzzz tennisclub` zeigt `Keine Treffer aus der Live-Quelle`.
- Leere Suche zeigt `Suchbegriff fehlt` und startet keinen externen Suchlauf.
- Bei absichtlich gestopptem Testserver zeigt die UI `Live-Suche momentan nicht verfügbar` und `Es wurden keine lokalen Ersatzdaten verwendet`. Der Adapter behandelt außerdem einen Overpass-Ausfall ohne direkte Treffer explizit als `source_unavailable` statt als erfundenen No-Result.

### Claimed

- Die Produktquelle dieser Version ist OpenStreetMap über Nominatim und Overpass; Suchquelle, Objekt-URL und `checkedAt` werden mit dem Ergebnis gespeichert und angezeigt.
- Der finale Build wurde nach den Adapter-Fixes mit dem bereitgestellten Node-/pnpm-Runtimepfad ausgeführt: Astro meldete `7 page(s) built` und `Complete!`.

### Inferred

- Vercel kann den Adapter als `/api/vereinssuche.js` bereitstellen; ein rein statisches Render-Deployment kann das nicht.
- `website` ist ein aus OSM übernommener Link, nicht automatisch eine unabhängig verifizierte offizielle Vereinswebsite.

### Hypothesis

- OSM ist als erste öffentliche Suchquelle für einen MVP ausreichend, aber nicht vollständig genug für eine belastbare deutsche Vereins- oder Vorstandsdatenbank.

## Acceptance evidence

| Fall | Ergebnis |
| --- | --- |
| Kirchhörde | Live Overpass-Treffer; nicht hardcodiert |
| Anderer deutscher Verein | Köln und Dortmund liefern weitere Live-Treffer |
| Stadt + Tennis | `Dortmund Tennis` liefert regionale Treffer |
| Schreibfehler | `Tennisclub Koln` liefert Treffer |
| Leere Suche | Hinweis, kein API-Aufruf |
| Keine Treffer | Kein Fixture; sichtbarer No-Result-Zustand |
| Logo fehlt | Neutraler Initialen-Fallback ohne Hotlink |
| Deduplizierung | Ergebnisse werden nach normalisiertem Name + Stadt zusammengeführt |
| Quellenfehler/Timeout | Sichtbarer sicherer Fehler ohne interne Details oder lokalen Rückfall |
| Build | pnpm-equivalent erfolgreich; `npm` fehlt in der Test-Shell |

## Open assumptions for reviewer

- Unabhängig prüfen, ob der produktive Vercel-Build den Serverless-Endpunkt tatsächlich ausliefert.
- Quellen- und Nutzungsbedingungen von Nominatim/Overpass für den geplanten Traffic sowie eine deutsche Datenschutz-/Impressumsumsetzung vor Produktion bestätigen.
- OSM-Abdeckung, Aktualität und Trefferqualität gegen weitere belastbare Vereinsquellen vergleichen.
- Nach drei Review-Fehlversuchen den Gründer einbeziehen; keine weitere kosmetische Fixture-Iteration als echte Suche werten.
