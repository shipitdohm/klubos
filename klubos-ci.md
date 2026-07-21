# KlubOS — Corporate Identity & UI-System

Stand: 15.07.2026
Quelle: die aktuell implementierten Website- und Software-Oberflächen in diesem Repository.

Diese Datei beschreibt die visuelle Basis von KlubOS. Sie ist aus den tatsächlich verwendeten Styles und Komponenten abgeleitet und soll bei neuen Seiten, Widgets, Präsentationen und Marketingmaterialien als Referenz dienen.

## 1. Markenkern

KlubOS wirkt wie ein ruhiger, intelligenter Arbeits-Hub für Vereinsvorstände: warm, präzise, vertrauenswürdig und praktisch. Die Gestaltung soll administrative Komplexität reduzieren und nicht selbst kompliziert wirken.

Die Marke verbindet:

- **Warmth:** gebrochene, warme Neutraltöne statt kaltem Enterprise-Grau.
- **Clarity:** klare Hierarchie, dünne Linien, viel Weißraum und kurze verständliche Labels.
- **Operational intelligence:** Widgets, Daten, Status und AI-Interaktion erscheinen als zusammenhängendes System.
- **Quiet confidence:** Terrakotta setzt gezielte Akzente; die Oberfläche bleibt überwiegend ruhig.
- **Human utility:** kein futuristischer AI-Zirkus, sondern sichtbarer Zeitgewinn für echte Vorstandsarbeit.

## 2. Typografie

### Primärschrift

**Satoshi** ist die aktuelle KlubOS-UI- und Markenschrift.

```css
font-family: 'Satoshi', 'Avenir Next', 'Manrope', -apple-system,
  BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

Sie wird im Repository über Fontshare mit den Schnitten 400, 500, 600, 700 und 800 geladen. Bei neuen Oberflächen soll dieselbe Stack-Reihenfolge verwendet werden.

### Monospace

Für technische Werte, IDs oder Code:

```css
font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
```

### Gewichte und Einsatz

| Gewicht | Verwendung |
| --- | --- |
| 400 | Fließtext, längere Beschreibungen, Hilfe- und Statuscopy |
| 500 | Buttons, Navigation, Formlabels, sekundäre UI-Aktionen |
| 600 | Überschriften, Kartenüberschriften, wichtige Labels |
| 700 | Hero-Headlines, Kennzahlen, primäre Hervorhebungen |
| 800 | sehr große Landingpage-Zahlen oder starke Display-Momente, sparsam |

Typografische Muster:

- Überschriften haben eine leicht negative Laufweite (`-0.02em` bis `-0.04em`).
- Body-Text arbeitet meist mit `line-height: 1.5` bis `1.6`.
- Kleine Kategorien und Eyebrows sind uppercase, mit erhöhter Laufweite (`0.06em` bis `0.10em`) und gedämpfter Farbe.
- Zahlen und Kennzahlen dürfen kompakt und kräftig sein; sie sollen wie nützliche Arbeitsdaten, nicht wie Werbung wirken.
- Customer-facing Text bleibt Deutsch-first und klar. Keine unnötigen englischen SaaS-Begriffe.

## 3. Farbpalette

### Kernpalette — verbindlich

| Token | Hex | Rolle |
| --- | --- | --- |
| `--bg` | `#F3F1F0` | warmer Seitenhintergrund |
| `--surface` | `#FFFFFF` | Karten, Panels, Eingabeflächen |
| `--surface-2` | `#ECE8E5` | sekundäre Flächen, Chips, aktive Navigation, Inputs |
| `--fg` | `#1B1816` | primäre Schrift, Headlines, wichtige Daten |
| `--fg-muted` | `#6A625E` | erklärender Text, sekundäre Labels |
| `--fg-dim` | `#A29A96` | Meta-Informationen, Eyebrows, deaktivierte Inhalte |
| `--border` | `#DED8D4` | feine Umrandungen und Trennlinien |
| `--accent` | `#BB5522` | KlubOS Terracotta: CTA, aktive Zustände, AI-Akzent, Links |
| `--accent-hover` | `#9F461B` | dunklere Hover- und Pressed-Variante |
| `--danger` | `#BA3F36` | Fehler, kritische oder überfällige Zustände |
| `--warning` | `#A8761D` | Warnungen, offene oder anstehende Zustände |
| `--success` | `#3E7A56` | Erfolg, erledigt, bezahlt, bestätigt |

Die zentrale Markenfarbe ist **Terracotta `#BB5522`**. Sie ist bewusst vom Clay-Court von Roland-Garros inspiriert und trägt damit den Tennisbezug von KlubOS direkt in die visuelle Identität. Sie soll als fokussierter Handlungs- und Orientierungsakzent eingesetzt werden, nicht als vollflächige Grundfarbe.

### Transparenzen und atmosphärische Farben

Die Oberfläche verwendet häufig dieselben Kernfarben mit Transparenz:

- Terrakotta-Glow: `rgba(187, 85, 34, 0.06–0.24)`.
- Dunkle Raster und Schatten: `rgba(17, 24, 39, 0.025–0.12)`.
- Glasflächen: `rgba(255, 255, 255, 0.72–0.96)`.
- Weiße Navigation/Header: etwa `rgba(255, 255, 255, 0.86)` mit Blur.

Diese Transparenzen sind Bestandteil des Stils: weich, leicht räumlich und funktional. Sie dürfen aber nicht die Lesbarkeit von Text und Daten beeinträchtigen.

### Sekundäre Widget- und Illustrationsfarben

Die Landingpage nutzt zusätzliche Farben für Miniaturen, Charts und Widget-Vorschauen: warme Sand-/Orange-Töne (`#C8753C`, `#D8A574`, `#FD7E14`, `#FFC107`), Grün (`#30A46C` bzw. `#2F7E52`), Blau (`#60A5FA`), Pink (`#E83E8C`) und Violett (`#6F42C1`).

Diese Farben sind **funktionale Sekundärfarben**, keine gleichwertigen Hauptmarkenfarben. Sie dürfen für Datenvisualisierung, Statusdifferenzierung und illustrative Widget-Inhalte verwendet werden. Primäre CTAs, Headlines, Navigation und Logo-Anwendungen bleiben Terrakotta bzw. die Kernneutralpalette.

### Bekannte Übergangstöne

Einige Prototyp-Oberflächen verwenden noch kühle Hintergründe wie `#F7F9FB`, `#EEF4F7` oder zusätzliche warme Suchseiten-Hintergründe wie `#F7F1EB` und `#EBE4DE`. Für neue Arbeit gilt die warme Kernpalette als Standard. Diese Übergangstöne sollen bei späterer UI-Konsolidierung auf die zentralen Tokens zurückgeführt oder bewusst als benannte Kontextfläche dokumentiert werden.

## 4. Formensprache

- Dünne Umrandungen: im aktuellen System meist `0.5px solid var(--border)`.
- Standard-Radien: `8px` klein, `12px` Standard, `16px` groß.
- Pills und Status-Badges: `999px`.
- Größere Landing-/Search-Container dürfen `14px`, `18px`, `20px`, `22px`, `24px` oder `28px` verwenden, wenn die Hierarchie es sichtbar unterstützt.
- Keine harten, schweren Rahmen. Tiefe entsteht durch Kontrast, feine Linien, Glasflächen und sehr weiche Schatten.
- Karten sind klar abgegrenzt, aber nicht dekorativ überladen.

Aktuelle Basistokens:

```css
--radius-sm: 8px;
--radius: 12px;
--radius-lg: 16px;
```

## 5. Schatten, Glas und Raum

KlubOS nutzt eine zurückhaltende Glass-/Operating-System-Anmutung:

- Weiße oder fast weiße Flächen mit `backdrop-filter: blur(...)`.
- Weiche Schatten wie `0 14px 40px rgba(17, 24, 39, 0.10)`.
- Größere frei schwebende App-Flächen dürfen `blur(12px)` bis `blur(34px)` und hohe Transparenz verwenden.
- Terrakotta-Glow wird nur punktuell eingesetzt, z. B. bei primären Buttons, aktiven Zuständen, dem AI-Kontext oder heroartigen Widget-Ansichten.
- Die Landingpage verwendet ein dezentes 60px-Raster und diffuse Hotspots. Das Raster ist ein Strukturmotiv, kein dominantes Muster.

## 6. Layout- und Komponentenprinzipien

### Landingpage

- Produktdarstellung über schwebende, konkrete Widgets statt abstrakter AI-Bilder.
- Hero mit viel Raum, klarer Headline, einer primären Terrakotta-CTA und einer zurückhaltenden Ghost-/Secondary-Aktion.
- Feature-Karten zeigen jeweils einen konkreten Verwaltungsbereich.
- Widget previews dürfen lebendiger und farbiger sein, bleiben aber in weißen, fein umrandeten Karten verankert.
- Zahlen, Rechner und Validierungselemente verwenden starke Typografie auf ruhigem Grund.

### App / Vorstandshub

- Floating Sidebar als wiedererkennbares Systemelement: abgerundete, helle Pods, dezenter Schatten, Blur und klare aktive Terrakotta-Markierung.
- Dashboard als Widget-Grid. Jedes Widget hat einen klaren Titel, eine Kennzahl oder einen Status und eine eindeutige nächste Aktion.
- Karten bleiben funktional und scanbar. Interaktion wird durch `border`, `background` und Farbe signalisiert, nicht durch laute Animation.
- AI-Chat nutzt Terrakotta für die Nutzer-/AI-Aktion und warme sekundäre Flächen für den Gesprächsverlauf.

### Formulare und Suche

- Labels klein, uppercase und gedämpft.
- Inputs hell oder `--surface-2`, mit feiner Umrandung und Terrakotta-Fokus.
- Fokus-Ring sparsam und weich: etwa `0 0 0 4px rgba(187, 85, 34, 0.06)`.
- Vereinssuche darf Tennis-spezifische Grüntöne in der Platz-/Sportvisualisierung verwenden; diese bleiben semantisch auf den Tennis-Kontext begrenzt.

### Icons und Logo

- Line-Icons in SVG, `currentColor`, ca. 1–2px Strichstärke.
- Icons sind Orientierungshilfe, nicht Dekoration.
- Das verbindliche Hauptlogo ist die exakt gelieferte PNG-Wort-Bild-Marke `assets/klubos-logo-long-black.png` für helle Flächen. Für dunkle oder terrakottafarbene Flächen wird `assets/klubos-logo-long-white.png` verwendet.
- Das verbindliche App Icon und Favicon ist `assets/klubos-favicon.png` ohne Wortzeichen.
- Die Originalvorlagen liegen unter `assets/source/`. Ihre Hintergründe wurden entfernt; Logoform, Wortmarke, Proportionen und Farben wurden nicht neu gezeichnet. Keine alternative Wortmarke in HTML/CSS, kein neues SVG und keine konkurrierende Logo-Variante anlegen.

## 7. Bewegung

- Motion ist leicht, weich und nützlich: `ease`, langsame schwebende Widget-Bewegung, dezente Reveal-Animationen, kurze Hover-Transitions.
- Animationen sollen den Eindruck eines lebendigen Systems vermitteln, nicht Aufmerksamkeit vom Inhalt wegziehen.
- Für `prefers-reduced-motion: reduce` müssen Animationen deaktiviert oder deutlich reduziert werden.
- Keine Bewegung als Voraussetzung dafür, dass eine Information verstanden oder eine Aktion ausgeführt werden kann.

## 8. Do / Don't

### Do

- Terrakotta für Handlungen, Fokus und KlubOS-Orientierung verwenden.
- Mit warmen Neutraltönen und Weißraum arbeiten.
- Konkrete Vorstandsarbeit in Widgets sichtbar machen.
- Daten, Status und nächste Aktion klar priorisieren.
- Satoshi und die bestehenden Radius-/Border-Tokens wiederverwenden.
- Sekundärfarben nur semantisch oder illustrativ einsetzen.

### Don't

- Nicht jede Oberfläche orange färben.
- Keine kalte Standard-SaaS-Ästhetik mit blauem Primärbutton einführen.
- Keine Neonfarben oder AI-Science-Fiction als Hauptlook.
- Keine neuen Fonts oder Schattenstile pro Einzelseite.
- Keine Emoji-Icons als primäre Produkt-Icons.
- Keine dekorative Animation, die den Vorstand bei einer Verwaltungsaufgabe ausbremst.

## 9. Technische Quelle und Pflege

Die visuelle Source of Truth im Repository ist aktuell `css/style.css`. Die Legacy-HTML-Seiten, die Astro-Komponenten unter `src/` und die Landingpage referenzieren dieselben CSS-Tokens, ergänzen aber teilweise Inline-Styles.

Bei neuen UI-Arbeiten:

1. Zuerst die Tokens in `css/style.css` verwenden.
2. Neue Farben nur hinzufügen, wenn sie eine klar benannte semantische oder illustrative Rolle haben.
3. Wiederkehrende Inline-Styles in gemeinsame Klassen oder Tokens überführen.
4. Neue Seiten visuell gegen Landingpage, Dashboard und Vereinssuche prüfen.
5. Bei Änderungen an Font, Kernpalette, Logo, Radius-System oder Motion-Regeln diese Datei und die Notion-Seite **Brand & Identity** gemeinsam aktualisieren.

## 10. Offene CI-Entscheidungen

- Finale rechtliche Marken-/Logoablage und Favicon/App-Icon.
- Finale Definition, ob die derzeitige Satoshi-Lizenz-/Hosting-Entscheidung unverändert bleibt.
- Finale Auswahl der Sekundärfarben für produktive Charts und Statussysteme.
- Bereinigung der Übergangstöne und Inline-Styles nach der weiteren Astro-Migration.
