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

### 2026-07-20 — VS-0.4 auf GitHub gepusht, Vercel Preview erfolgreich

- Commit/Diff: `c321cb4` auf `agent/live-vereinssuche-deploy` in `shipitdohm/clubos`; Draft-PR [#3](https://github.com/shipitdohm/clubos/pull/3) gegen `main`.
- Specialist-Status: `BLOCKED_PENDING_PRODUCTION_MERGE`
- Reviewer-Status: `ausstehend` für den öffentlich gemergten Stand.
- Observed: GitHub/Vercel meldet den Preview-Deployment-Check `SUCCESS` für den Commit; Deployment-ID `5520565747`, Umgebung `Preview`. Die Production-Domain `klubos.de` wurde dadurch noch nicht verändert.
- Claimed: Der auf GitHub liegende Branch enthält den geprüften VS-0.4-Stand inklusive `/api/vereinssuche.js` und `vercel.json`.
- Nächster konkreter Schritt: Draft-PR prüfen und nach Freigabe nach `main` mergen; danach öffentlich `curl` und Browser gegen `https://klubos.de` ausführen. Erst dann kann der Search Reviewer den dritten Release-Gate-Lauf durchführen.

### 2026-07-20 — VS-0.4 Production-Verifikation nach Merge

- Commit/Diff: Merge-Commit `4808e20e2bd6bbec0f3b8ce06fb25cb7587b1ccd` auf `main`; PR #3 ist gemergt.
- Specialist-Status: `READY_FOR_REVIEW`
- Reviewer-Status: `ausstehend` — dritter unabhängiger Release-Gate-Lauf erforderlich.
- Observed: `curl -i https://klubos.de/api/vereinssuche?q=TC%20Kirchh%C3%B6rde` liefert öffentlich HTTP 200 JSON von Vercel. Die Antwort enthält `sourceName: OpenStreetMap (Nominatim + Overpass)`, `sourceUrl`, `checkedAt`, `confidence`, `websiteState: unverified_source_tag` und `logoState: fallback`.
- Öffentliche API-Regression: `TC Kirchhörde` → 2 Treffer; `Tennisclub Köln` → 8; `Tennisclub Koln` → 8; `zzzzzz tennisclub` → 0. Alle Antworten waren HTTP 200.
- Öffentlicher Browser: `https://klubos.de/vereinssuche.html` zeigt VS-0.4; `TC Kirchhörde` zeigt zwei Ergebnisbuttons, Quelle `OpenStreetMap Overpass`, Status `2 Vereine gefunden`, Website-Label `Website · OSM-Tag ungeprüft` und den neutralen `TK`-Fallback.
- Nächster konkreter Schritt: Search Reviewer führt den dritten unabhängigen öffentlichen Browser-/Quellen-/Regressionstest aus und dokumentiert PASS/FAIL. Die strenge anwendungsweite Nominatim-Garantie über mehrere Serverless-Instanzen bleibt als Shared-KV/Redis-Folgearbeit offen.

### 2026-07-20 — VS-0.5-official-nuliga-single

- Commit/Diff: Working tree; `api/vereinssuche.js` ergänzt den öffentlichen DTB-nuLiga-Such-POST als Primärquelle, parst die offizielle Vereinsdetailseite und liefert maximal einen Treffer. `vereinssuche.html` zeigt keine Ergebnisliste mehr, sondern nur einen eindeutigen Treffer oder einen verständlichen Null-/Mehrdeutigkeitszustand.
- Specialist-Status: `READY_FOR_REVIEW`
- Reviewer-Status: `ausstehend` — unabhängiger Review gegen den neuen Stand erforderlich.
- Observed: Der öffentlich erreichbare DTB-nuLiga-Dienst akzeptiert `POST https://dtb.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/clubSearch` mit `searchFor`, `federation=DTB` und `WOSubmitAction=clubSearch`. Die Detailseiten enthalten Vereinsname, Verbands-/Bezirksangabe, Vereinsnummer, Adresse, Website-Link, Mitgliederzahlen, Plätze und Funktionärsrollen. Beispiele: [TC Kirchhörde](https://dtb.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/clubInfoDisplay?club=26403), [TSC Hansa Dortmund](https://dtb.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/clubInfoDisplay?club=26401), [TC Großhesselohe](https://dtb.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/clubInfoDisplay?club=23375).
- Claimed: nuLiga ist für diese Iteration die offizielle Primärquelle; OSM bleibt ausschließlich als Fallback, wenn daraus genau ein starker Namensmatch hervorgeht. Mehrere Kandidaten werden nicht mehr an die UI ausgeliefert. Eine stabile, dokumentierte öffentliche tennis.de-API wurde im Audit nicht gefunden; es wurde deshalb kein inoffizieller Browser-Endpunkt behauptet oder eingebaut. Die offizielle tennis.de-Hilfe beschreibt die öffentliche Mannschaftssuche und verweist für Vereinsnummern auf diese Suche: [Mannschaftssuche](https://www.tennis.de/service/helpcenter/nutzung-von-funktionen-und-suchen/mannschaftssuche.html).
- Test-Ergebnis, echter Live-Adapter:
  - `TC Kirchhörde` → HTTP 200, `resultCount: 1`, `unique_official_match`, Westfälischer Tennis-Verband e.V., `nuLiga:3021291`, Dortmund.
  - `TSC Hansa` → HTTP 200, `resultCount: 1`, `unique_official_match`, Westfälischer Tennis-Verband e.V., `nuLiga:3021288`, Dortmund.
  - `TC Großhesselohe` → HTTP 200, `resultCount: 1`, `unique_official_match`, Bayerischer Tennis-Verband e.V., `nuLiga:01021`, Großhesselohe.
  - `Tennisclub Köln` → HTTP 200, `resultCount: 0`, `ambiguous`; kein beliebiger Treffer wird ausgewählt.
  - `zzzzzz tennisclub` → HTTP 200, `resultCount: 0`, `not_found`.
  - Alle drei offiziellen Treffer enthalten `sourceUrl`, `sourceName`, `checkedAt`, `confidence: high`, `websiteState`, `logoState: fallback`; Zusatzfelder enthalten Mitgliederzahl, Plätze und öffentliche Rollenangaben.
- Test-Ergebnis, Build/Static: `node --check api/vereinssuche.js` erfolgreich; Inline-Suchscript syntaktisch erfolgreich geprüft; `git diff --check` erfolgreich; direkter Astro-Produktionsbuild mit gebündeltem Node erfolgreich (`7 page(s) built`, `Complete!`). `pnpm run build` konnte im ersten Durchlauf wegen der nicht-interaktiven pnpm-Modulbereinigung und danach wegen ignorierter Dependency-Build-Skripte nicht als Skript-Gate abgeschlossen werden; der direkte Astro-Build lief erfolgreich. Die erzeugte `node_modules`-Umgebung und unversionierte pnpm-Hilfsdateien sind kein Produktdiff.
- Known limitations: nuLiga liefert HTML statt einer von uns vertraglich garantierten JSON-API; der Parser ist deshalb gegen Markup-Änderungen zu überwachen. `tennis.de` bleibt als mögliche zweite offizielle Quelle offen, bis ein autorisierter, stabiler Zugriff geklärt ist. Öffentliche Funktionärsrollen sind personenbezogene Daten und benötigen vor Lead-Nutzung eine separate DSGVO-/Zweckbindungsprüfung. OSM-Website-Tags bleiben ungeprüft.
- Nächster konkreter Schritt: Search Reviewer prüft VS-0.5 unabhängig mit Browser- und Quellenregression gegen die drei gewünschten Vereine sowie Empty-, Ambiguous-, No-Result-, Error- und Logo-Fallback-Zustände.

### 2026-07-20 — VS-0.5 öffentliche Verifikation nach Push

- Commit: `cf55f53` auf `origin/main`; Vercel liefert die neue Version öffentlich aus.
- Observed: `https://klubos.de/vereinssuche.html` enthält `Live-Quelle VS-0.5`, die DTB-nuLiga-Primärquellenbeschreibung und keinen sichtbaren Mehrfachauswahl-Codepfad.
- Öffentliche API-Regressionsfälle: `TC Kirchhörde` → HTTP 200, 1 offizieller Treffer, Westfälischer Tennis-Verband; `TSC Hansa` → HTTP 200, 1 offizieller Treffer, Westfälischer Tennis-Verband; `TC Großhesselohe` → HTTP 200, 1 offizieller Treffer, Bayerischer Tennis-Verband; `Tennisclub Köln` → HTTP 200, 0 wegen `ambiguous`; `zzzzzz tennisclub` → HTTP 200, 0 wegen `not_found`.
- Öffentlicher Browserfall: `TC Großhesselohe` zeigt `1 eindeutiger Treffer`, `TC Großhesselohe`, `Bayerischer Tennis-Verband e.V. · Oberbayern-München`, `1.228` Mitglieder, `15 Freiplätze · 7 Hallenplätze`, die nuLiga-Quelle und `0` sichtbare `.vs-result-option`-Elemente.
- Status: `READY_FOR_REVIEW`; der unabhängige Search Reviewer prüft diesen öffentlichen Stand separat.

### 2026-07-20 — VS-0.6 Contract-Gaps: Empty Submit und reproduzierbarer Review-Fehlerzustand

- Commit/Diff: `2a9d30a` auf `origin/main`; `vereinssuche.html` ergänzt einen sichtbaren Empty-Submit-Hinweis mit `role="alert"`, `aria-invalid` und einem im Suchzustand sichtbaren Statuspanel. Die Versionskennung wurde auf `VS-0.6` angehoben. `api/vereinssuche.js` ergänzt den exakt reservierten Review-Query `__klubos_review_source_unavailable__`, der öffentlich deterministisch HTTP 502 mit `error: source_unavailable` liefert.
- Specialist-Status: `IN_WORK` — lokale Implementierung und Tests abgeschlossen; Push und öffentliche Verifikation stehen noch aus.
- Reviewer-Status: `ausstehend` — unabhängiger Review gegen VS-0.6 erforderlich.
- Observed: Der VS-0.5-Gate meldete beim leeren Submit keinen sichtbaren Hinweis und belegte keinen reproduzierbaren öffentlichen Quellenfehler. Der neue Sentinel wird nur bei exakt diesem reservierten Suchbegriff ausgelöst; er ruft keine externe Quelle auf, enthält keine geheimen Daten und wird mit `Cache-Control: no-store` beantwortet.
- Claimed: Ein leerer Submit zeigt jetzt `Suchbegriff fehlt`, den Inline-Hinweis `Bitte gib einen Vereinsnamen, eine Stadt oder ein Kürzel ein.` und setzt `aria-invalid="true"`. Der öffentliche Review-Sentinel zeigt `Live-Suche momentan nicht verfügbar` und erlaubt den reproduzierbaren Test des Fehlervertrags, ohne einen echten Upstream-Ausfall zu behaupten.
- Inferred: Die beiden P1-Contract-Gaps aus VS-0.5 sind damit im UI bzw. über einen bewusst begrenzten öffentlichen Test-Hook prüfbar geschlossen; normale Suchanfragen bleiben unverändert auf DTB-nuLiga mit OSM-Fallback beschränkt.
- Hypothesis / offene Annahmen: Der reservierte Sentinel ist für den Release-Gate ausreichend, weil er den öffentlich ausgelieferten Error-Transport und die UI reproduzierbar prüft. Ein echter Timeout oder Ausfall von DTB-nuLiga/OSM ist damit ausdrücklich nicht simuliert und bleibt separat zu überwachen.
- Lokale Tests: `node --check api/vereinssuche.js` erfolgreich; direkter Astro-Produktionsbuild mit gebündeltem Node erfolgreich (`7 page(s) built`, `Complete!`); Inline-Suchscript syntaktisch und statisch auf Empty-Hinweis/ARIA geprüft; Handler-Test: leerer Query → HTTP 200/`empty_query`, Sentinel → HTTP 502/`source_unavailable`; `git diff --check` erfolgreich.
- Öffentliche Tests nach Push: `https://klubos.de/vereinssuche.html` liefert HTTP 200 mit `Live-Quelle VS-0.6`, `vs-query-hint`, `role="alert"` und `aria-live="polite"`; API-Sentinel per `curl` → HTTP 502 mit `error: source_unavailable`, `matchState: source_unavailable`, `reviewSentinel: true`; Browser → leerer Submit mit sichtbarem Empty-Hinweis und `aria-invalid="true"`, Sentinel mit sichtbarem `Live-Suche momentan nicht verfügbar`. Die drei offiziellen Regressionen, Ambiguous-, No-Result- und Logo-Fallback-Fälle bleiben aus VS-0.5 bestehen und sind durch den Reviewer erneut zu prüfen.
- Nächster Schritt: Search Reviewer führt den unabhängigen VS-0.6-Release-Gate gegen die öffentliche URL aus und dokumentiert PASS/FAIL nach der Acceptance-Matrix.

### 2026-07-20 — VS-0.7.5 kanonischer DTB-Aliasvertrag und sicherer OSM-Fallback

- Commit/Diff: `a7948fd` → `64a9d59` → `26e6164` → `de6d242` → `936a061` → `59604ef`; `api/vereinssuche-normalization.js` führt die kanonische Namensnormalisierung, Aliasvarianten, längere Ortsfragmente, angehängte Stadtqualifizierungen und stabile Identitätsschlüssel ein. `api/vereinssuche.js` fragt nuLiga mit TC/Tennisclub-, Unicode/ASCII-, Bindestrich- und e.V.-Varianten ab, beendet offizielle Mehrdeutigkeit ohne OSM-Ersatz und akzeptiert OSM nur bei kanonisch passendem Namen. Ein offizieller Namenszusatz wie `TSC Hansa Dortmund` oder `TC Augsburg Siebentisch` wird bei direkter nuLiga-Antwort akzeptiert; generische Stadtanfragen wie `Tennisclub Köln` werden bei einem nur erweiterten Alias-Kandidaten als `ambiguous` behandelt. Eindeutige Ortsfragmente wie `Zündorf` können den vollständigen offiziellen Datensatz auflösen; angehängte Stadtqualifizierungen wie in `TC Weiden Köln` werden auf die offizielle Namensbasis reduziert; unbelegte kurze Kürzel wie `TCK` dürfen keinen OSM-Treffer erzeugen; bei `source_unavailable` gibt es keinen OSM-Ersatz. Die strenge Gleichheitsprüfung bleibt ausschließlich beim OSM-Fallback. `vereinssuche.html` zeigt VS-0.7.5 und erklärt den sicheren Fallback. `scripts/vereinssuche-alias-contract.mjs` plus `package.json` ergänzen den lokalen Vertragstest.
- Specialist-Status: `READY_FOR_REVIEW` nach Push und öffentlicher Verifikation.
- Reviewer-Status: `ausstehend` — unabhängiger VS-0.7-Review erforderlich.
- Observed, Baseline vor Änderung: Die öffentliche VS-0.6-API lieferte `Tennisclub Großhesselohe` als medium-confidence-OSM-Treffer in Pullach, `TC Grosshesselohe` als `ambiguous`, `TC GH` als falschen OSM-Treffer `TC Blau-Weiß Beuel`, `Tennisclub Kirchhörde` als OSM, `Tennisclub Weiden` als OSM, `Tennisclub Bamberg` als OSM Oberhaid und `Tennisclub Neuss` als OSM Neuss-Weckhoven. Diese Fälle wurden vor der Änderung gegen `https://klubos.de/api/vereinssuche?q=...` reproduziert.
- Claimed: nuLiga wird nun mit bis zu 12 deterministisch erzeugten Suchvarianten abgefragt. `TC` und `Tennisclub` werden gegenseitig aufgelöst; Unicode/ASCII-Varianten und deutsche Schreibweisen werden branchenweise erzeugt; Bindestriche und e.V.-Suffixe werden kanonisiert. Offizielle Treffer werden über `officialId`, Datensatz-URL, kanonischen Namen, Ort und Domain dedupliziert. Ein OSM-Einzeltreffer wird nur übernommen, wenn Name und optionale Ortszusätze kanonisch passen; ein plausibler offizieller Mehrdeutigkeitszustand blockiert den OSM-Fallback.
- Inferred: Die gemeldeten Verwechslungen werden dadurch entweder auf den offiziellen DTB-Treffer normalisiert (`Tennisclub Großhesselohe`, `TC Grosshesselohe`, `Tennisclub Kirchhörde`, `Tennisclub Weiden`, `TC Weiden Köln`, `Tennisclub Bamberg`, `TC Augsburg`, `Tennisclub Blau Weiß Zündorf`, `Tennisclub Rot Weiss Porz`) oder sicher als `ambiguous`/`not_found` behandelt (`TC GH`, `TCK`, `Tennisclub Neuss`, `Tennisclub Köln`), statt einen ähnlichen Nachbarverein auszugeben. Die VS-0.7.5-Regressionsprobe bestätigt zusätzlich `TSC Hansa` → `TSC Hansa Dortmund`, `TC Augsburg` → `TC Augsburg Siebentisch` und die Zündorf-/Porz-/Weiden-Varianten als offizielle Treffer.
- Hypothesis / offene Annahme: Das ist ein kanonischer Aliasvertrag über die live abgefragten nuLiga-Suchergebnisse, aber noch kein vorab vollständig synchronisierter DTB-Gesamtindex. Offizielle Kürzel, Vereinsnummern und Domains stabilisieren die Identität, ersetzen aber keine spätere regelmäßige DTB-Index-Synchronisierung. `TC GH` bleibt bewusst ohne Treffer, solange keine offizielle Quelle eine eindeutige Kürzelauflösung liefert.
- Lokale Tests: `node --check` für beide API-Module erfolgreich; `node scripts/vereinssuche-alias-contract.mjs` erfolgreich mit 18 realen Vereinsankern und 113 Varianten; direkter Astro-Build erfolgreich (`7 page(s) built`, `Complete!`); `git diff --check` erfolgreich. Die 113 Aliasvarianten sind ausschließlich ein lokaler Normalisierungstest und kein Live-Suchclaim.
- Öffentliche VS-0.7.2-Regression nach Push: Seite lieferte `data-version="VS-0.7.2-official-alias-safe"` und `Live-Quelle VS-0.7.2`; dabei wurde `TCK` noch als OSM und `TC Augsburg` bei einem Quellenlauf nicht offiziell erkannt. Diese Befunde wurden vor dem finalen VS-0.7.3-Gate behoben. Öffentliche VS-0.7.3-Regression nach dem folgenden Push ist noch auszuführen.
- Öffentliche VS-0.7.3-Verifikation nach Push `de6d242`: Seite lieferte `data-version="VS-0.7.3-official-alias-safe"`; dabei blieb `Tennisclub Blau Weiß Zündorf` noch OSM. Dieser Befund wurde vor dem finalen VS-0.7.4-Gate behoben.
- Öffentliche VS-0.7.4-Verifikation nach Push `936a061`: Seite liefert `data-version="VS-0.7.4-official-alias-safe"` und `Live-Quelle VS-0.7.4`. `Tennisclub Blau Weiß Zündorf` und `TC Blau-Weiß Zündorf` liefern jeweils genau 1 offiziellen DTB-/nuLiga-Treffer `TC Blau-Weiss Zündorf`, Köln; `Tennisclub Großhesselohe` und `TC Grosshesselohe` liefern denselben offiziellen Datensatz; `TC Augsburg` liefert `TC Augsburg Siebentisch` offiziell; `TC GH` → 0 `not_found`; `TCK` → 0 `ambiguous`; `Tennisclub Köln` → 0 `ambiguous`. Der Reviewer fand zusätzlich `TC Weiden Köln` als offene Aliaslücke. Diese wurde im finalen VS-0.7.5-Stand behoben. Quellenfelder und höchstens ein Ergebnis bleiben vorhanden.
- Öffentliche VS-0.7.5-Verifikation am 20.07.2026 nach Push `59604ef`: `https://klubos.de/vereinssuche.html` liefert HTTP 200, `data-version="VS-0.7.5-official-alias-safe"` und `Live-Quelle VS-0.7.5`. Die API liefert jeweils genau 1 offiziellen DTB-/nuLiga-Treffer für `TC Kirchhörde` → Dortmund, `TSC Hansa` → `TSC Hansa Dortmund`, `TC Großhesselohe` und `TC Grosshesselohe` → `TC Großhesselohe`, `TC Weiden Köln` → `TC Weiden` Köln, `Tennisclub Blau Weiß Zündorf` und `TC Blau-Weiß Zündorf` → `TC Blau-Weiss Zündorf` Köln sowie `Tennisclub Rot Weiss Porz` → `TC Rot-Weiss Porz` Köln. Jeder Treffer hatte `sourceUrl`, `sourceName`, `checkedAt`, `confidence: high` und `logoState: fallback`. `TC GH` → 0 `not_found`, `TCK` → 0 `ambiguous`, `Tennisclub Köln` → 0 `ambiguous`; Empty Query → HTTP 200/`empty_query`; Review-Sentinel → HTTP 502/`source_unavailable`/`reviewSentinel: true`.
- Öffentliche Browser-Verifikation am 20.07.2026: `TC Weiden Köln` zeigte 1 eindeutigen Treffer, DTB-nuLiga-Quelle, Mitglieder `1.253`, `12 Freiplätze · Hallenplätze`, Vorstandsrollen und neutrales `TW`-Logo-Fallback; kein Mehrfachauswahl-Element. Leerer Submit zeigte „Bitte gib einen Vereinsnamen, eine Stadt oder ein Kürzel ein.“ und `aria-invalid="true"`; der Sentinel zeigte „Live-Suche momentan nicht verfügbar“.
- 32er-Stressmatrix: Eine parallele öffentliche Probe lieferte 31 JSON-Antworten (`18 official`, `3 osm`, `6 ambiguous`, `4 not_found`) und einen reinen Socket-Reset; die betroffenen Einzelanfragen `TC Grosshesselohe`, `Tennisclub Weiden` und `TSC Hansa` wurden danach einzeln erfolgreich als offizielle Treffer wiederholt. Das ist kein vollständiger 32/32-Transport-PASS und bleibt im unabhängigen Review gedrosselt zu wiederholen. Die 113 Aliasvarianten sind ausschließlich ein lokaler Normalisierungstest und kein Live-Suchclaim.
- Nächster Schritt: Unabhängigen Search Reviewer gegen exakt `59604ef` mit PASS/FAIL nach der Acceptance-Matrix beauftragen; die 32er-Matrix und mindestens 100 lokalen Aliasvarianten bleiben explizit zu prüfen.

### 2026-07-20 — VS-0.7.6 ASCII-, e.V.- und Ortsduplikat-Normalisierung

- Commit/Diff: `449210a` auf `origin/main`; `api/vereinssuche-normalization.js` ergänzt einen expliziten ASCII-Alias für `Kirchhorde` → `Kirchhoerde`, entfernt offizielle e.V.-Suffixe und reduziert doppelte End-Ortssegmente wie `Augsburg Augsburg`. `api/vereinssuche.js` darf einen offiziellen Namenszusatz nur dann aus einer reduzierten Aliasvariante übernehmen, wenn diese Reduktion identitätserhaltend ist; generische Umschreibungen wie `Tennisclub Köln` → `TC Köln` bleiben mehrdeutig. `vereinssuche.html` wird auf VS-0.7.6 angehoben. `scripts/vereinssuche-alias-contract.mjs` enthält die neuen Regressionen.
- Specialist-Status: `READY_FOR_REVIEW` — Commit `449210a` ist gepusht, öffentliche API und Browser sind verifiziert; der unabhängige 32+100-Gate steht noch aus.
- Reviewer-Baseline: Der unabhängige VS-0.7.5-Gate dokumentierte `FAIL`: 32er-Matrix `20 official`, `5 ambiguous`, `3 not_found`, `4 Transporttimeouts`, `0 OSM`; 100er-Matrix `79 official`, `6 ambiguous`, `4 not_found`, `11 Transporttimeouts`, `0 OSM`. Browser, Contract-Felder, Empty-/Error-/Logo-Fallback und keine Ergebnisliste waren PASS. P1 waren `TC Kirchhorde`/`Tennisclub Kirchhorde` → `ambiguous` sowie `TC Augsburg e.V.`/`Tennisclub Augsburg e.V.` → `not_found`; P2 war `TC Augsburg Augsburg` → `ambiguous`. Transporttimeouts bleiben getrennte Providerbefunde.
- Claimed: Die neuen Reduktionen werden vor dem offiziellen DTB-Matching als Suchvarianten erzeugt. Ein offizieller Treffer darf dadurch nur bei e.V.-Entfernung, bekanntem ASCII-Alias oder doppeltem End-Ortsegment direkt akzeptiert werden; die bestehende Unsicherheitslogik für generische Ortsanfragen bleibt erhalten. OSM erhält keine zusätzliche Berechtigung.
- Inferred: `Kirchhorde` kann damit den offiziellen `TC Kirchhörde`-Datensatz erreichen; `TC Augsburg e.V.` und `TC Augsburg Augsburg` können die bereits funktionierende offizielle `TC Augsburg`-Auflösung wiederverwenden, ohne einen anderen Verein still auszuwählen.
- Hypothesis / offene Annahme: Der explizite ASCII-Alias ist derzeit bewusst auf den belegten Vereins-/Ortsnamen `Kirchhorde` begrenzt; eine generische Ersetzung jedes einfachen `o` durch `ö` wäre nicht eindeutig und wird nicht eingeführt. Ein vollständig synchronisierter DTB-Aliasindex bleibt Folgearbeit.
- Lokale Tests: `node --check` für beide API-Module erfolgreich; Aliasvertrag erfolgreich mit 18 Ankern und 113 Varianten plus den neuen ASCII-/e.V.-/Duplikat-Assertions; generische Köln-Umschreibung bleibt als negative Assertion geschützt; direkter Astro-Build erfolgreich (`7 page(s) built`, `Complete!`); `git diff --check` erfolgreich. Kein Live-Suchclaim vor Push.
- Öffentliche VS-0.7.6-Verifikation am 20.07.2026 nach Push `449210a`: Seite liefert HTTP 200, `data-version="VS-0.7.6-official-alias-safe"` und `Live-Quelle VS-0.7.6`. API: `TC Kirchhorde` und `Tennisclub Kirchhorde` → jeweils genau 1 offizieller DTB-/nuLiga-Treffer `TC Kirchhörde`, Dortmund; `TC Augsburg e.V.` und `Tennisclub Augsburg e.V.` → jeweils genau 1 offizieller Treffer `TC Augsburg Siebentisch`, Augsburg; `TC Augsburg Augsburg` → genau 1 offizieller Treffer `TC Augsburg Siebentisch`, Augsburg. Alle fünf Antworten waren HTTP 200 mit `sourceName` DTB-nuLiga und `confidence: high`.
- Öffentliche Browser-Verifikation am 20.07.2026: `TC Kirchhorde` zeigt VS-0.7.6, genau 1 eindeutigen DTB-nuLiga-Treffer `TC Kirchhörde`, Dortmund, Mitglieder/Plätze/Vorstand, Quellen-Datensatz und keine sichtbaren Ergebnisoptionen.
- Nächster Schritt: Unabhängigen Search Reviewer gegen exakt `449210a` mit PASS/FAIL nach der Acceptance-Matrix beauftragen; die 32er-Matrix und mindestens 100 Live-Aliasvarianten bleiben explizit zu prüfen. Transporttimeouts werden separat vom fachlichen Ergebnis dokumentiert.

### 2026-07-20 — VS-0.7.7 symmetrische ASCII-/Bindestrich-Aliase für Zündorf und Halle

- Commit/Diff: Working tree auf Basis `449210a`; `api/vereinssuche-normalization.js` ergänzt den belegten ASCII-Alias `Zundorf` → `Zuendorf` und priorisiert identitätserhaltende Varianten für e.V.-Entfernung, Bindestrich-/TC-/Tennisclub-Umschreibung und diese ASCII-Aliase vor kürzeren Mehrdeutigkeitsvarianten. `api/vereinssuche.js` akzeptiert offizielle Kandidaten aus solchen Varianten nur bei identitätserhaltendem kanonischem Schlüssel. `scripts/vereinssuche-alias-contract.mjs` führt eine versionierte erwartete-Identität-Matrix für `nuliga:DTB:35409` (Zündorf) und `nuliga:DTB:26504` (Halle) sowie die neuen Aliasformen.
- Specialist-Status: `IN_WORK` — lokale Korrektur und Regressionstests stehen noch vor Push und öffentlicher Verifikation.
- Reviewer-Baseline: Der unabhängige VS-0.7.6-Gate dokumentierte `FAIL`: 32er-Matrix `25 official`, `5 ambiguous`, `2 not_found`, `0 Transport`, `0 OSM`; 100er-Matrix `81 official`, `16 ambiguous`, `1 not_found`, `2 getrennte AbortError-Transports`, `0 OSM`. Browser, Felder, Empty-/Error-/Logo-Fallback und keine Ergebnisliste waren PASS. P1 waren ASCII-Zündorf (`TC/Tennisclub Blau-Weiss Zundorf`) und kombinierte Halle-Varianten; P2 war die fehlende versionierte erwartete Vereins-ID-Matrix.
- Claimed: `TC Blau-Weiss Zundorf`, `Tennisclub Blau Weiss Zundorf`, `Tennisclub Blau-Weiss Halle e.V.`, `Tennisclub Blau-Weiss Halle Halle`, `TC Blau Weiss Halle` und `Tennisclub Blau Weiss Halle` werden vor dem DTB-Kandidatenvergleich auf die jeweiligen offiziellen kanonischen Schlüssel reduziert. OSM erhält keine zusätzliche Berechtigung; Transportabbrüche bleiben getrennte Befunde.
- Inferred: Die bekannten offiziellen Datensätze `nuliga:DTB:35409` und `nuliga:DTB:26504` können damit unabhängig von ASCII-Umlaut, Bindestrichverlust, TC/Tennisclub-Schreibweise, e.V. und doppeltem Ortssegment wiederverwendet werden.
- Hypothesis / offene Annahme: `Zundorf` → `Zuendorf` ist als belegter Ortsalias explizit hinterlegt; eine generische Ersetzung beliebiger Einzelbuchstaben bleibt ausgeschlossen, weil sie falsche Vereine erzeugen könnte. Die erwartete-ID-Matrix ist ein versionierter Regressionsvertrag und kein Ersatz für eine live synchronisierte DTB-Gesamtliste.
- Lokale Tests: Aliasvertrag erweitert um die erwarteten kanonischen Identitäten und neuen Aliasformen; `node scripts/vereinssuche-alias-contract.mjs` erfolgreich mit 18 Ankern und 113 Varianten; beide `node --check`-Prüfungen, `git diff --check` und direkter Astro-Build erfolgreich (`7 page(s) built`, `Complete!`). Kein Live-Suchclaim vor Push.
- Follow-up innerhalb VS-0.7.7: Für die Upstream-Suche wird zusätzlich die belegte Unicode-Variante `Zundorf` → `Zündorf` priorisiert; der kanonische Schlüssel bleibt umlautneutral `zuendorf`.
- Nächster Schritt: VS-0.7.7 lokal bauen und testen, pushen, die 32er-Matrix plus mindestens 100 sequenzielle Live-Aliasvarianten wiederholen und anschließend den unabhängigen Search Reviewer ausschließlich gegen VS-0.7.7 beauftragen.

### 2026-07-20 — VS-0.7.8 Priorisierung offizieller zusammengesetzter Namen

- Commit/Diff: Working tree auf Basis `92dbc91`; `api/vereinssuche-normalization.js` priorisiert nun die vollständige offizielle `TC`-Form aus suffixbereinigten, Unicode-/ASCII- und Bindestrichvarianten vor verkürzten Suchformen. Dadurch wird `TC Blau-Weiss Halle` vor `TC Blau-Weiss` abgefragt. `api/vereinssuche.js` und `vereinssuche.html` werden auf VS-0.7.8 angehoben.
- Specialist-Status: `IN_WORK` — lokale Korrektur und Regressionstests erfolgreich; Push, öffentliche Verifikation und neuer unabhängiger Gate stehen aus.
- Observed: VS-0.7.7 lieferte die ASCII-Zündorf-Varianten nach frischem Cache-Fenster offiziell als `nuliga:DTB:35409`; `Tennisclub Blau-Weiss Halle e.V.` blieb jedoch `ambiguous`, obwohl der direkte offizielle Basisfall `TC Blau-Weiss Halle` bereits als `nuliga:DTB:26504` bekannt ist.
- Claimed: Die Variantenreihenfolge fragt für Halle zuerst `TC Blau-Weiss Halle`, priorisiert danach `TC Blau-Weiß Halle`, für ASCII-Zündorf zuerst `TC Blau-Weiss Zündorf` und für kombinierte Tennisclub-/Bindestrichvarianten die vollständige Namensform ab. Verkürzte Compound-Formen wie `TC Blau-Weiss` werden bei vollständigen Namen nicht vorgezogen. Die erwartete-ID-Matrix aus VS-0.7.7 bleibt bestehen.
- Inferred: Die verbleibende Halle-Mehrdeutigkeit entstand durch zu frühe verkürzte Kandidatenabfragen, nicht durch einen OSM-Ersatz oder fehlende offizielle Quelle.
- Hypothesis / offene Annahme: Die Priorisierung reduziert Upstream-Mehrdeutigkeit, ohne generische Begriffe automatisch zu einem Verein zu machen; der unabhängige Live-Gate muss dies gegen 32 plus mindestens 100 Varianten bestätigen.
- Lokale Tests: Aliasvertrag `18` Anker/`113` Varianten inklusive erwarteter `nuliga:DTB:35409`-/`nuliga:DTB:26504`-Identitäten erfolgreich; First-Variant-Assertions für `TC Blau Weiss Halle` und `Tennisclub Blau Weiss Halle` erfolgreich; beide `node --check`-Prüfungen, `git diff --check` und direkter Astro-Build erfolgreich (`7 page(s) built`, `Complete!`).
- Nächster Schritt: VS-0.7.8 bauen, pushen, die sechs Zündorf-/Halle-Fälle öffentlich verifizieren und danach den unabhängigen 32+100-Gate ausschließlich gegen VS-0.7.8 starten.

### 2026-07-20 — VS-0.7.9 offizieller Alias-Retry nach Mehrdeutigkeit

- Commit/Diff: Working tree auf Basis `b4078f5`; `api/vereinssuche.js` wiederholt bei offizieller Mehrdeutigkeit genau die bevorzugte vollständige `TC`-Aliasvariante (zusammengesetzter Name zuerst) und akzeptiert nur einen kanonisch exakten offiziellen Treffer. `vereinssuche.html` und der Adapter werden auf VS-0.7.9 angehoben. OSM wird durch den Retry nicht erweitert.
- Specialist-Status: `IN_WORK` — lokale Änderung steht vor Build, Push und öffentlicher Verifikation.
- Observed: VS-0.7.8 löst `Tennisclub Blau-Weiss Halle e.V.` und `Tennisclub Blau-Weiss Halle Halle` offiziell auf, während der Alias `TC Blau Weiss Halle` in einer frischen Antwort noch `ambiguous` blieb; die direkte offizielle Schreibweise `TC Blau-Weiss Halle` liefert `nuliga:DTB:26504`.
- Claimed: VS-0.7.9 versucht nach dem normalen Aliaslauf einmal die vollständige offizielle `TC`-Variante erneut. Nur kanonische Gleichheit wird akzeptiert; ein erweiterter oder mehrdeutiger Kandidat bleibt abgelehnt.
- Inferred: Ein Upstream-/Variantensuchlauf kann einen vollständigen offiziellen Kandidaten trotz vorhandener korrekter Schreibweise zu früh hinter einer verkürzten Mehrdeutigkeit verlieren; der begrenzte Retry schließt diese Lücke ohne Fuzzy-Match.
- Hypothesis / offene Annahme: Der Retry verbessert die Robustheit gegen nuLiga-Varianten-/Providerreihenfolge, ersetzt aber keine echte DTB-ID-Synchronisierung und darf bei weiterem `ambiguous` keinen Verein raten.
- Lokale Tests: Nach Abschluss des Versionbumps erneut Aliasvertrag, beide `node --check`-Prüfungen, `git diff --check` und Astro-Build ausführen; der unabhängige Live-Gate bleibt maßgeblich.
- Nächster Schritt: VS-0.7.9 bauen, pushen, die sechs Zündorf-/Halle-Fälle inklusive Cache-Trennung öffentlich prüfen und danach den unabhängigen 32+100-Gate ausschließlich gegen VS-0.7.9 starten.

### 2026-07-20 — VS-0.8.0 schreibweisensicherer API-Cache

- Commit/Diff: Working tree auf Basis `447155e`; `api/vereinssuche.js` verwendet für den Kurzzeitcache jetzt die konkrete normalisierte Schreibweise inklusive Bindestrichen und Suffixen statt des kanonisch zusammengezogenen Namens. Dadurch können `TC Blau Weiss Halle` und `TC Blau-Weiss Halle` keine unterschiedlichen Live-Ergebnisse gegenseitig überschreiben. `vereinssuche.html` und der Adapter werden auf VS-0.8.0 angehoben.
- Specialist-Status: `IN_WORK` — lokale Änderung steht vor Build, Push und öffentlicher Verifikation.
- Observed: Ein `ambiguous`-Payload für `TC Blau Weiss Halle` wurde wegen des bisherigen Cache-Keys auch für die direkte Schreibweise `TC Blau-Weiss Halle` wiederverwendet; die öffentliche direkte Antwort zeigte dabei `cached: true` und die ursprüngliche Query-Schreibweise.
- Claimed: Jede konkrete Suchschreibweise erhält nun ihren eigenen 30-Sekunden-Cacheeintrag; die kanonische Normalisierung bleibt für Matching und Deduplizierung zuständig, nicht für das Vermischen unterschiedlicher Rohabfragen.
- Inferred: Der Cache-Key war ein Teil des beobachteten Halle-Aliasfehlers und konnte auch korrekte offizielle Ergebnisse nachfolgender Varianten verdecken.
- Hypothesis / offene Annahme: Getrennte Schreibweisencaches erhöhen die Upstream-Abfragen moderat; der vorhandene 30-Sekunden-TTL und die Nominatim-Drosselung bleiben bestehen. Die unabhängige Matrix muss prüfen, dass keine Cachevariante falsche Mehrdeutigkeit oder falsche Entität erzeugt.
- Lokale Tests: Nach dem Versionbump erneut Aliasvertrag, `node --check`, `git diff --check` und Astro-Build ausführen. Kein Live-Suchclaim vor Push.
- Nächster Schritt: VS-0.8.0 bauen, pushen, direkte und aliasierte Halle-/Zündorf-Schreibweisen mit getrennten Cache-Keys prüfen und danach den unabhängigen 32+100-Gate ausschließlich gegen VS-0.8.0 starten.

### 2026-07-20 — VS-0.8.1 vollständige Compound-Variante zuerst

- Commit/Diff: Working tree auf Basis `aaaedd9`; `api/vereinssuche-normalization.js` priorisiert die compound-/Bindestrich-Variante auch gegenüber der ungetrennten `TC Blau Weiss Halle`-Rohform. `TC Blau Weiss Halle` und `Tennisclub Blau Weiss Halle` beginnen dadurch mit `TC Blau-Weiss Halle`. `api/vereinssuche.js` und `vereinssuche.html` werden auf VS-0.8.1 angehoben.
- Specialist-Status: `IN_WORK` — lokale Änderung steht vor Build, Push und öffentlicher Verifikation.
- Observed: VS-0.8.0 trennte die Cache-Keys korrekt; `TC Blau-Weiss Halle`, `Tennisclub Blau-Weiss Halle e.V.` und Zündorf waren offiziell. `TC Blau Weiss Halle` blieb trotz vorhandener Compound-Variante `ambiguous`, weil die Rohform zuerst abgefragt wurde.
- Claimed: Die vollständige offizielle Compound-Variante wird jetzt als erste Live-Abfrage verwendet; der bestehende exakte Retry und die getrennten Schreibweisencaches bleiben aktiv.
- Inferred: Damit wird die funktionierende offizielle DTB-Form direkt verwendet, bevor nuLiga eine ungetrennte Rohform als mehrdeutig klassifiziert.
- Hypothesis / offene Annahme: Die erste Variantenauswahl behebt die verbleibende Halle-Lücke, ohne Fuzzy-Matching oder OSM-Ersatz einzuführen; der unabhängige Gate muss dies bestätigen.
- Lokale Tests: Neue First-Variant-Assertions für Halle, Aliasvertrag mit 18 Ankern/113 Varianten, beide `node --check`-Prüfungen, `git diff --check` und Astro-Build erfolgreich auszuführen.
- Nächster Schritt: VS-0.8.1 bauen, pushen, `TC Blau Weiss Halle` öffentlich verifizieren und danach 32+100 ausschließlich gegen VS-0.8.1 prüfen lassen.
