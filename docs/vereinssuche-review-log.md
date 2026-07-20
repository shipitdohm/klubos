# KlubOS Vereinssuche — Review-Log

Jede relevante Änderung bekommt hier einen Eintrag. Der Specialist trägt zuerst ein; der Reviewer ergänzt unabhängig sein Urteil.

## Vorlage

### YYYY-MM-DD — kurze Änderungsbeschreibung

- Commit/Diff:
- Specialist-Status: `READY_FOR_REVIEW` | `BLOCKED`
- Reviewer-Status: `PASS` | `FAIL`
- Getestete Umgebung:
- Suchanfragen:
- Treffer und Quellen:
- Logo-Ergebnis:
- Build/Test-Ergebnis:
- Bekannte Einschränkungen:
- Reviewer-Feedback:
- Nächster konkreter Schritt:

### 2026-07-20 — VS-0.2-review Preview-Kennzeichnung und Fixture-Regression

- Commit/Diff: Working tree; `vereinssuche.html`, `public/vereinssuche.html` und `dist/vereinssuche.html` auf `VS-0.2-review` aktualisiert. Legacy-Ausspielpfade unverändert.
- Specialist-Status: `BLOCKED`
- Reviewer-Status: `FAIL` (Fehlversuch 1/3).
- Getestete Umgebung: unabhängiger Browserlauf auf `http://127.0.0.1:4182/vereinssuche.html`; Prüfung am 2026-07-20. Root, `public` und `dist` per SHA-256/CMP synchron.
- Suchanfragen: `TC Kirchhörde`; `Tennisclub Köln`.
- Treffer und Quellen: `TC Kirchhörde` liefert genau einen lokalen Fixture-Treffer; der Status nennt ausdrücklich „keine Live-Websuche“. `Tennisclub Köln` liefert korrekt keinen Treffer, weil kein externer Suchlauf implementiert ist. Es wurde keine autorisierte Quelle abgefragt.
- Logo-Ergebnis: Der Treffer setzt ein externes Logo-Hotlink (`https://tennisclubkirchhoerde.de/wp-content/uploads/2022/11/TCK_Logo.png`) und besitzt einen Initialen-Fallback. Es gibt jedoch keine Quellen-/Rechte-/Abrufmetadaten und keinen versionierten Logo-Nachweis; daher keine verlässliche Contract-Erfüllung.
- Build/Test-Ergebnis: Unabhängiger Browser-Load, Fixture-Treffer und Nichtfund erfolgreich. `npm run build` konnte nicht ausgeführt werden: `npm` ist in der verfügbaren Shell nicht installiert/auffindbar (`command not found`).
- Bekannte Einschränkungen: Keine autorisierte echte Web-/Datenquellsuche; nur ein hardcodierter Verein; keine Source-URL, `checkedAt`, stabile Source-ID, Deduplizierung, echte Logo-Verifikation oder Quellenfehler-/Timeout-Abdeckung.
- Reviewer-Feedback:
  - [P0] Keine echte, autorisierte externe Quelle — Evidenz: `vereinssuche.html` enthält keinen `fetch`, XHR, Backend-Endpunkt oder Source-Adapter; `Tennisclub Köln` bleibt ohne Treffer.
  - [P0] Fixture-only Search — Evidenz: `TC Kirchhörde` wird aus der lokalen `clubs`-Liste geliefert; der UI-Status bestätigt „keine Live-Websuche“.
  - [P1] Quellenvertrag fehlt — Evidenz: keine `sourceUrl`, `sourceName`, `checkedAt`, stabile Source-ID, Confidence oder Deduplizierung im Ergebnis.
  - [P1] Logo-Strategie nicht belastbar — Evidenz: unkontrollierter externer Hotlink; Fallback vorhanden, aber ohne testbaren Status-/Rechtevertrag.
  - [P1] Build-Gate offen — Evidenz: `npm run build` scheitert vor dem Start mit `npm: command not found`.
- Nächster konkreter Schritt: Autorisierten Backend-/Serverless-Suchendpunkt oder eine ausdrücklich freigegebene Datenquelle festlegen und implementieren; danach mit mindestens zwei nicht vorab hinterlegten Vereinsfällen, Quellenbelegen, Logo-Fallback und Build wiederholen.

### 2026-07-20 — VS-0.3-live-osm echter Server-Adapter für OpenStreetMap

- Commit/Diff: Working tree; neuer Server-Adapter `/api/vereinssuche.js`, überarbeitete `vereinssuche.html`, `package.json`-Build-Gate sowie generierte `public/`-/`dist/`-Assets. Die Suche enthält keine lokale `clubs`-Fixture mehr. Nach dem Abschlusscheck wurde die `e.V.`-Wortgrenze im Ranking korrigiert und ein leerer Overpass-Fallback explizit als `source_unavailable` behandelt; die Versionsnummer bleibt `VS-0.3-live-osm`.
- Specialist-Status: `READY_FOR_REVIEW`
- Reviewer-Status: `FAIL` (Fehlversuch 2/3).
- Getestete Umgebung: Unabhängiger Adaptertest mit dem gebündelten Node-Runtime-Pfad; deterministischer Fehler-Mock; Browserlauf auf `http://127.0.0.1:4184/vereinssuche.html` gegen denselben aktuellen Adapter; Produktionsprobe am 2026-07-20. Die lokalen Trefferquellen waren live OpenStreetMap; der öffentliche Vercel-Pfad wurde separat per HTTPS geprüft.
- Suchanfragen:
  - `TC Kirchhörde`: 2 Live-Treffer, darunter `Tennisclub Kirchhörde eV` und `TuS Westfalia Hombruch`.
  - `Tennisclub Köln`: 8 Live-Treffer, darunter `VKC Tennisclub` und `Tennisclub Weiden e.V.`.
  - `Dortmund Tennis`: 3 Live-Treffer.
  - `Tennisclub Koln`: 8 Live-Treffer trotz Schreibfehler.
  - `zzzzzz tennisclub`: 0 Treffer und sichtbarer No-Result-Zustand.
  - Leere Suche: kein API-Aufruf, sichtbarer Hinweis `Suchbegriff fehlt`.
- Treffer und Quellen: Der Server fragt Nominatim für die Suchanfrage und bei regionalem Tennisbezug zusätzlich Overpass ab. Jeder Treffer enthält `id`, `name`, `city`, `country`, `sport`, `website`, `logoUrl`, `sourceUrl`, `sourceName`, `checkedAt` und `confidence`. Browserbeleg für Kirchhörde: `https://www.openstreetmap.org/way/34002810`; Browserbeleg für Köln u. a. `https://www.openstreetmap.org/way/1391056498`. Die UI zeigt Quelle, Datensatz-Link und Prüfzeitpunkt an.
- Logo-Ergebnis: Keine unkontrollierten externen Logo-Hotlinks mehr. `logoUrl` bleibt bis zu einer verifizierten Logo-Quelle leer; die Detailansicht zeigt einen neutralen Initialen-Fallback. Der Browserlauf zeigte `TK` für `Tennisclub Kirchhörde eV`.
- Build/Test-Ergebnis: `npm run build` bleibt im Systempfad wegen `npm: command not found` nicht ausführbar. Das Projekt-Build lief mit dem bereitgestellten Node-/pnpm-Runtimepfad nach der finalen Korrektur erfolgreich: `pnpm run build` → Astro `7 page(s) built`, `Complete!`. Unabhängiger Live-Adaptertest: Kirchhörde 2, Köln 8, Schreibfehler `Tennisclub Koln` 8, Fantasieanfrage 0. Browserfälle für Treffer, Quellenbeleg, neutralen Logo-Fallback, Leerwert, No-Result und Quellenfehler liefen. Der deterministische Overpass-Ausfall-Mock antwortete 502/source_unavailable mit `partial: true`; die UI zeigte `Live-Suche momentan nicht verfügbar` ohne lokalen Ersatz.
- Observed: Der Browser lädt `/api/vereinssuche?q=...`; die Antworten enthalten Live-OSM-Quellenbelege. `TC Kirchhörde` kommt im Browser über Overpass und nicht aus einer Fixture. Keine Treffer- und Fehlerzustände bleiben als erfundene lokale Treffer stehen.
- Claimed: OpenStreetMap/Nominatim und Overpass sind für diese Iteration die verwendeten öffentlichen Quellen. Nominatim wird gemäß eigener Usage Policy mit User-Agent und begrenzter Anfragefrequenz angesprochen; Overpass wird regionsbegrenzt und mit Fallback-Endpunkt angesprochen.
- Inferred: Die Vercel-Ausspielung kann `/api/vereinssuche.js` als Serverless-Function bereitstellen; die bisherige Render-Static-Konfiguration kann den Adapter nicht ausliefern. Für Produktion ist deshalb Vercel oder ein separat betriebener Node-/Serverless-Adapter erforderlich.
- Hypothesis: OSM deckt genügend deutsche Tennisvereine für einen ersten Search-MVP ab. Vollständigkeit, Aktualität der Websites und Vereins-/Vorstandsdaten sind damit nicht garantiert und müssen später durch Verbands- oder Vereinsquellen ergänzt werden.
- Bekannte Einschränkungen: OSM ist keine vollständige oder autoritative Vereinsdatenbank; Verbandszugehörigkeit, Mitgliederzahlen, Plätze, Mannschaften und Vorstandsrollen sind in dieser Iteration nicht belegt. Website-URLs stammen aus OSM-Tags und werden noch nicht unabhängig gegen die Vereinswebsite verifiziert. Cache ist pro Function-Instanz flüchtig. Es gibt keine explizite anwendungsweite Nominatim-Ratenbegrenzung; der 30-Sekunden-Cache ist kein Rate-Limiter. Öffentliche Overpass-Endpunkte können Rate-Limits, Timeouts oder Teilantworten liefern; die API markiert den Zustand über `partial`.
- Reviewer-Feedback:
  - [P0] Produktionspfad nicht ausgeliefert — Evidenz: `curl -i https://klubos.de/api/vereinssuche?q=TC%20Kirchh%C3%B6rde` antwortet `HTTP/2 404`, `server: Vercel`, `x-vercel-error: NOT_FOUND`. Damit ist die echte Suche lokal vorhanden, aber im aktuellen öffentlichen Deployment nicht nutzbar.
  - [P1] Nominatim-Ratenbegrenzung fehlt — Evidenz: `api/vereinssuche.js` hat nur einen pro Function-Instanz flüchtigen Query-Cache; keine anwendungsweite 1-Request-pro-Sekunde-Steuerung, Queue oder belastbare Provider-Ausweichstrategie.
  - [P1] Website-Vertrauen ist nicht ausreichend gekennzeichnet — Evidenz: `website` wird aus OSM-Tags übernommen, aber in der Detailansicht als Website ausgegeben; unabhängige Verifikation gegen die Vereinsdomain fehlt.
  - [P2] Kein Git-Commit/Repository-Revision im Handoff — Evidenz: Projektpfad ist weiterhin kein Git-Repository; Build-Reproduzierbarkeit beruht auf Runtime-Pfad und Working Tree.
- Nächster konkreter Schritt: Den exakt geprüften VS-0.3-Stand auf den Vercel-Produktionspfad deployen oder einen benannten Backend-Endpunkt konfigurieren; anschließend `curl` und Browser-Tests gegen die öffentliche URL wiederholen. Vor dem nächsten PASS zusätzlich Nominatim-Rate-Limit und Website-Status (`osm_tagged` statt ungeprüft `official`) dokumentieren. Bei einem weiteren erfolglosen Review (3/3) den Gründer einbeziehen.

### 2026-07-20 — VS-0.4-live-osm Deployment-Härtung und Quellenstatus

- Commit/Diff: Working tree; `api/vereinssuche.js` erhält eine serielle Nominatim-Drosselung mit mindestens 1 Sekunde Abstand pro warmer Function-Instanz sowie `websiteState: unverified_source_tag`/`websiteVerified: false`. `vereinssuche.html` markiert OSM-Website-Tags als ungeprüft. `vercel.json` konfiguriert die Function explizit mit `maxDuration: 60`. Neue Handoff-Datei: `docs/vereinssuche-v0.4-review.md`; Assets in `public/` und `dist/` neu gebaut.
- Specialist-Status: `BLOCKED_PENDING_DEPLOYMENT`
- Reviewer-Status: `FAIL` (Fehlversuch 2/3, aus VS-0.3).
- Observed: `curl -i https://klubos.de/api/vereinssuche?q=TC%20Kirchhörde` liefert HTTP 404, `server: Vercel`, `x-vercel-error: NOT_FOUND`. `https://klubos.de/vereinssuche.html` liefert weiterhin die alte Fixture-Version mit `const clubs`.
- Claimed: Der lokale VS-0.4-Stand ist gebaut; die Vercel-Konfiguration beschreibt `/api/vereinssuche.js` als Function. Das ist noch kein Beleg für öffentliche Auslieferung.
- Inferred: Ohne Zugriff auf das Vercel-Projekt, den Git-Remote oder Deployment-Credentials kann der öffentliche P0 nicht durch eine lokale Dateiänderung behoben werden. Vercel dokumentiert die Root-`api`-Konvention und Function-Konfiguration in der [vercel.json-Dokumentation](https://vercel.com/docs/project-configuration/vercel-json).
- Hypothesis: Ein Redeploy des exakten Projektroots auf das Vercel-Projekt hinter `klubos.de` wird den API-Endpunkt und VS-0.4 öffentlich ausliefern; dies muss mit `curl` und Browser bestätigt werden.
- Test-Ergebnis: `pnpm run build` erfolgreich (`Astro 7 page(s) built`, `Complete!`). Deterministischer Mock-Test bestätigt `websiteState: unverified_source_tag`, `websiteVerified: false` und 1004 ms Abstand zwischen zwei parallelen Nominatim-Anfragen. Öffentlicher Test bleibt bis zum Redeploy blockiert.
- Bekannte Einschränkungen: Die Drosselung gilt ohne Shared KV/Redis nur pro warmer Function-Instanz; eine streng anwendungsweite Rate-Limit-Garantie über mehrere Vercel-Instanzen benötigt einen gemeinsamen Limiter. OSM-Website-Tags bleiben bewusst ungeprüft und dürfen nicht als verifiziert-offizielle Website dargestellt werden.
- Nächster konkreter Schritt: Gründer stellt Zugriff auf das bestehende Vercel-Projekt/Repository-Deployment bereit oder führt den dokumentierten Redeploy aus; danach öffentlicher `curl`-/Browser-Test. Bei erneutem Review-Fail ist Fehlversuch 3/3 erreicht und der Gründer muss einbezogen werden.
