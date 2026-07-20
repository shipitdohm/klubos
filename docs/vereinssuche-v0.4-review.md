# Vereinssuche VS-0.4-live-osm — Deployment-Handoff

Status: `BLOCKED_PENDING_DEPLOYMENT`
Datum: 2026-07-20
Review-Basis: VS-0.3 `FAIL` Fehlversuch 2/3

## Änderung

VS-0.4 behält den echten OpenStreetMap-Adapter bei, ergänzt eine explizite Vercel-Funktionskonfiguration und behandelt die beiden Reviewer-P1s:

- Nominatim-Anfragen werden pro warmer Serverless-Instanz mit mindestens 1 Sekunde Abstand serialisiert.
- Website-Tags aus OSM werden im Ergebnis als `websiteState: unverified_source_tag` und `websiteVerified: false` markiert; die UI zeigt `Website · OSM-Tag ungeprüft`.

## Produktionsbefund

### Observed

- `curl -i https://klubos.de/api/vereinssuche?q=TC%20Kirchhörde` liefert aktuell HTTP 404 mit `server: Vercel` und `x-vercel-error: NOT_FOUND`.
- `https://klubos.de/vereinssuche.html` liefert weiterhin die alte Fixture-Version mit `const clubs`, nicht VS-0.3/VS-0.4.
- Das Desktop-Projekt besitzt keinen Git-Remote, keine Vercel-Projektbindung und keine Deployment-Credentials.

### Claimed

- `vercel.json` enthält jetzt eine explizite Function-Konfiguration für `api/vereinssuche.js` mit `maxDuration: 60`.
- Der lokale Serveradapter bleibt live-fähig; die öffentliche Auslieferung ist damit noch nicht hergestellt.

### Inferred

- Der P0 liegt derzeit im Deployment-/Source-Link, nicht in der lokalen Adapterlogik.
- Vercel dokumentiert, dass eine Root-`api`-Datei als Vercel Function bereitgestellt wird; die Funktion muss aber Bestandteil des tatsächlich deployten Projektstands sein.

### Hypothesis

- Ein Redeploy des exakten Projektroots auf das Vercel-Projekt hinter `klubos.de` wird `/api/vereinssuche` ausliefern. Das ist erst nach öffentlichem `curl`- und Browser-Test bestätigt.

## Acceptance gate before reviewer re-run

1. `curl -i` auf `/api/vereinssuche?q=TC...` liefert HTTP 200 JSON statt 404.
2. JSON enthält mindestens zwei Live-OSM-Treffer mit `sourceUrl`, `sourceName`, `checkedAt`, `confidence` und `logoState`.
3. Öffentliche Seite enthält VS-0.4 und lädt den API-Endpunkt im Browser.
4. `TC Kirchhörde`, `Tennisclub Köln`, Schreibfehler, No-Result, Empty, Error und Logo-Fallback werden öffentlich reproduziert.
5. Reviewer schreibt erneut PASS/FAIL in den Review-Log. Bei erneutem Fail ist es Fehlversuch 3/3 und der Gründer wird einbezogen.
