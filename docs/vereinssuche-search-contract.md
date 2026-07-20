# KlubOS Vereinssuche — gemeinsamer Suchvertrag

Status: Arbeitsvertrag für Search Specialist und Search Reviewer
Version: 1.1
Letzte Prüfung: 2026-07-20

## Ziel

Die Vereinssuche soll in Deutschland echte Tennisvereine im Internet finden und für das KlubOS-Onboarding verlässlich darstellen. TC Kirchhörde ist ein Testfall, aber kein zulässiger Ersatz für eine echte Suche.

## Quellenregel für Onboarding ab VS-0.8.3

- Der DTB-nuLiga-Ergebnisdienst ist die autorisierte Primärquelle für einen auszugebenden Vereinsdatensatz.
- OpenStreetMap darf als diagnostische Vergleichsquelle abgefragt werden, aber ein nicht-offizieller OSM-Kandidat wird niemals als eindeutiger Onboarding-Treffer ausgegeben. Ohne bestätigten offiziellen Treffer lautet der sichere Zustand `safe_no_match` oder `not_found` und enthält keine Ergebniszeile.
- Ein zusätzlicher Ortsname darf nur entfernt werden, wenn er in der offiziellen Vereinsadresse bzw. dem offiziellen Datensatz als Ort/Region belegt ist. Freies Wegschneiden beliebiger letzter Wörter ist kein zulässiges Matching.
- Die erwarteten 32 Fälle, vier P1-Regressionen und 100 Aliasvarianten sind in `scripts/vereinssuche-regression-matrix.v0.8.3.json` versioniert. Die Datei ist ein Erwartungsvertrag, kein Ersatz für den unabhängigen Live-Gate.

## Fester Ablauf

1. Suchanfrage entgegennehmen und normalisieren.
2. Autorisierte externe Quelle(n) abfragen.
3. Nur deutsche Tennisvereine aus den Ergebnissen übernehmen.
4. Namen, Ort, Website, Vereins-ID und Logo normalisieren.
5. Duplikate zusammenführen.
6. Ergebnisse nach Relevanz und Datenqualität sortieren.
7. Quelle, Zeitpunkt und Unsicherheiten speichern.
8. Ergebnis mit funktionierendem Logo oder bewusstem Fallback anzeigen.
9. Bei keinem Treffer, Mehrdeutigkeit oder Fehler eine verständliche Handlung anbieten.

## Mindest-Datenmodell

```text
id: stable source or generated identifier
name: official club name
city: normalized German city
country: DE
sport: tennis
website: official URL when verified
logoUrl: verified URL or explicit fallback state
sourceUrl: page/API used for the record
sourceName: source identifier
checkedAt: ISO timestamp
confidence: high | medium | low
```

## Abnahmetests

Mindestens diese Fälle testen und im Review-Log festhalten:

| Fall | Erwartung |
| --- | --- |
| `Kirchhörde` | TC Kirchhörde kann gefunden werden, ohne hardcodiert zu sein. |
| Ein anderer deutscher Tennisverein | Ein zweiter, nicht vorab hinterlegter Verein wird gefunden. |
| Stadt + Tennisverein | Relevante Treffer aus der Stadt werden priorisiert. |
| Schreibfehler | Sinnvolle tolerante Suche oder klare Nulltreffer-Meldung. |
| Leere Suche | Kein externer Suchlauf ohne Suchbegriff; verständlicher Hinweis. |
| Keine Treffer | Keine erfundenen Vereine; nächste Handlung wird angezeigt. |
| Logo fehlt | Kein kaputtes Bild; verifizierter Fallback. |
| Doppelte Quellen | Ein Verein erscheint nur einmal. |
| Quellenfehler/Timeout | Sichtbarer, sicherer Fehlerzustand ohne geheime Details. |

## Definition of Done

Eine Änderung ist erst `PASS`, wenn die Implementierung, der Build, die Abnahmetests und die Quellenbelege vorliegen. Ein einzelner lokaler Treffer oder eine statische Demo ist kein Beleg für funktionierende Vereinssuche.

## Architekturhinweis

Eine Browser-Seite allein sollte keine geheimen Such-API-Schlüssel enthalten. Wenn die externe Quelle einen Schlüssel, Rate-Limits, Caching oder serverseitige Normalisierung benötigt, gehört dieser Teil hinter einen autorisierten Backend-/Serverless-Endpunkt. Bis dieser existiert, muss die Funktion als Prototyp gekennzeichnet bleiben.
