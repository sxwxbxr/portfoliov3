# Antwort auf deine zwei Pushbacks

Kurz vorweg, damit du weisst, wohin das läuft: **bei Frage 1 hattest du teilweise recht und ich revidiere** — aber nicht so, wie du es gemeint hast. Bei Frage 2 bleibt das Nein, allerdings aus komplett anderen Gründen als "Accessibility". Die Accessibility-Argumente sind bei dir tatsächlich die schwächsten, und ich hätte sie nicht in den Vordergrund stellen sollen.

---

## Frage 1: Zimmer als Hintergrund — macht das Spatial UI möglich?

### Wo die alte Ablehnung zu breit war

Ich habe "3D-modelliert **oder** pixel-art" als eine Sache behandelt. Das war falsch. Fast die gesamte Munition gegen den Vorschlag ist Munition gegen **Realtime-WebGL**, nicht gegen "ein Bild von deinem Zimmer":

- `three@0.185.1` = 182'763 B gzip, `@react-three/fiber` = 51'798 B. Untergrenze ~250 KB neues JS, bevor eine Zeile Szenen-Code existiert. Das sind 40 % von Alex Russells 2026er JS-Budget für JS-lastige Seiten (0.62 MiB) auf einem Galaxy A24.
- R3F braucht `next/dynamic` mit `ssr:false` — landet also strukturell **nach** der Hydration. Das ist exakt das Gegenteil der static-first-Umstellung, mit der du den 18-Sekunden-TTFB gefixt hast, auf einer Seite mit Speed Insights in Production.
- Lernkosten: Three.js Journey sind ~91 h Video, Blender-Grundlagen 8–16 h, ein eigener gebakter Raum realistisch 20–40 h obendrauf. Der schnellste Nicht-Spezialist (Henry Heffernan, heute Senior Design Engineer bei Vercel) brauchte ~2 Monate — und war vorher Artist und Game Developer.

Ändere die eine Variable "Realtime-3D → statisches Bild", und **jede** dieser Zahlen geht auf null. Der beste Beleg dafür ist ausgerechnet Linear, das im Design-Brief als Referenz steht: ich habe linear.app geholt — kein three.js, kein WebGL-Canvas. Die bewunderte "Linear-Szene" ist ein vorgerendertes Bild über Cloudflare Image Delivery mit `f=auto, width=2560`.

**Die 3D-modellierte Hälfte deines Vorschlags muss trotzdem weg** — nicht wegen Bytes, sondern wegen Kalender. 20–40 h Blender passen nicht in vier Wochen mit eingeschränkter Verfügbarkeit, und eine halbfertige Szene ist strikt schlechter als keine.

### Wo dein Vorschlag trotzdem nicht funktioniert — und das ist der Kern

Du hast nicht nach einem hübschen Hero-Bild gefragt. Du hast nach **einem tragenden Grund gefragt, der Spatial UI als System ermöglicht**. Das liefert ein Bild nicht, und zwar aus zwei Gründen, die sich nicht wegdesignen lassen:

**1. Eine Szene rettet Glass nicht — sie dreht das Problem um.** WCAG 1.4.3 verlangt weiterhin 4.5:1, und es gibt **keine Messmethode** für Kontrast gegen ein variables Bild. Aktuell hast du ein festes, testbares Problem (Card 1.06:1 hell / 1.02:1 dunkel). Hinter einer Szene wird daraus ein Problem pro Pixel und pro Scroll-Position. Der akzeptierte Fix heisst Scrim: eine halbdeckende Schicht zwischen Szene und Text — mathematisch reicht 0.54 Schwarz-Deckkraft, dann ist das Bild irrelevant. Genau das ist das gesuchte Elevation-Vokabular, und es funktioniert, indem es die Szene versteckt, für die du bezahlt hast. Apple hat das mit Liquid Glass im Weltmassstab getestet, ist bei gemessenen 1.5:1 gelandet, hat einen NN/g-Verriss und im Dezember 2025 einen offenen Brief der American Foundation for the Blind kassiert und in 26.1 einen "Tinted"-Modus nachgeschoben — mit einer OS-Ebene adaptivem Tinting, die `backdrop-filter` schlicht nicht hat.

**2. Das Auditier-Argument ist das, was mich wirklich stoppt.** Sobald irgendwo im Ancestor-Pfad eines Textknotens ein `background-image` oder Gradient liegt, gibt axe-core **kein Pass/Fail mehr zurück, sondern `incomplete`** — wörtlich: "Element's background color could not be determined due to a background image" (dequelabs/axe-core#3390, offen). Lighthouse *ist* axe-core. Deine Seite gehört heute zu den ~29 %, die Kontrast wirklich bestehen; 71 % der mobilen Homepages fallen durch. Ein Hiring Manager, der Lighthouse laufen lässt, sieht dann eine Kontrast-Sektion, die nichts mehr behauptet. Für Publikum (b) — Leute, die DevTools öffnen — ist "verifiziertes Grün gegen stilles *needs review*" der falsche Tausch. Der einzige automatisierte Ausweg ist Deques ML-Resolver auf dem Pro-Plan, ohne veröffentlichte Trefferquote. Alles andere ist manuelles Screenshot-Edge-Mapping pro Szene × Breakpoint × Theme. Für immer.

**Antwort auf die wörtliche Frage also: nein.** Spatial UI als System bekommst du auch mit ersetztem Hintergrund nicht — weil site-weiter Hintergrund + Text darüber genau die Kombination ist, die Auditierbarkeit, Mobile-Geometrie und Scroll-Performance gleichzeitig kaputt macht. `/projects`, `/services` und `/about` bekommen ihre Tiefe weiterhin aus Tokens.

### Was ich stattdessen bauen würde: "The Desk", eine Fläche, statisch

Das ist die Version, die ich shippen würde, und sie ist gut:

**Ein commissioniertes isometrisches Pixel-Art-Bild deines echten Arbeitszimmers, hart geclippt auf den Hero von `/`.** Nichts sonst. `components/HomeContent.tsx:239` ist bereits `relative min-h-screen ... overflow-hidden` — der geclippte Container existiert schon. Das ist strukturell dasselbe Muster wie Stripes Hero-Gradient: eine Fläche, hart geclippt, tot ausserhalb des Viewports.

Warum Pixel-Art und nicht Baked Render:
- **Kosten**: 60–150 USD, wenn du bei 2–3 Artists parallel bestellst. Die Parallelbestellung ist der wichtigste Risikoschritt — sie eliminiert den einen Fehlermodus, der dir den ganzen Kalender frisst (Artist meldet sich in Woche 2 nicht mehr).
- **Gewicht**: Indexed-Colour-PNG. Vier Layer à ≤60 KB bei 960×540, ≤200 KB pro Palette, ≤250 KB tatsächlich geladen. Ein gebakter Blender-Raum wäre 3–6 MB (Heffernans Lightmaps allein: 3.72 MB).
- **Der Punkt, den bisher niemand gemacht hat**: Pixel-Art ist das einzige Medium, wo **Dark Mode ein Palettentausch ist statt ein zweiter Render**. Tag-Version und monitorbeleuchtete Nacht-Version aus derselben Lineart, +15 USD. Ein Blender-Bake bräuchte einen kompletten zweiten Lighting-Pass.
- **Ehrlichkeit**: Ein Bild in Auftrag geben heisst nicht behaupten, Illustrator zu sein. Niemand hält dich für einen Fotografen, weil du einen Fotografen buchst. Das ist genau der Punkt, an dem Realtime-3D scheitert — das wäre ein Anspruch, den der Rest der Seite nicht einlösen kann.

**Das Briefing ist das eigentliche Deliverable.** Es muss **dein** Zimmer sein, mit identifizierbaren Objekten: der Planausschnitt auf dem Monitor, die Elektroplaner-Referenz, das ZHAW-Material, das St. Galler Fenster. Ein generisches Isometric-Dev-Room-Tileset von itch.io zerstört das ganze Argument — dann ist es Stock-Art, die so tut als wäre sie persönlich, und das ist schlechter als monochrom. Der Konversionswert ist "hier ist ein echter Mensch mit einem echten Schreibtisch in St. Gallen", und NN/gs Eyetracking sagt genau das: dekorative Feel-Good-Bilder werden komplett ignoriert, **Bilder von echten Menschen und echten Dingen werden als Content gelesen**.

Harte Regeln:
- Layer als **Sibling** auf `-z-10` innerhalb der Hero-Section, nie Ancestor eines Textknotens (wegen axe #3390).
- Parallax nur mit `useScroll`/`useTransform`, **nur translateY**, ±12/24/36 px. Kein `background-attachment: fixed` (repaintet jeden Scroll-Frame, auf iOS kaputt). `useReducedMotion()` ist in `HomeContent.tsx:6` schon importiert und in Zeile 112 in Gebrauch — kollabiert das auf null.
- Statische Szene, Parallax nur nutzergetrieben ⇒ **WCAG 2.2.2 (Level A) greift nie**, kein sichtbarer Pause-Button nötig.
- **Kein Scrim, kein `backdrop-filter` über der Szene.** Das heisst konkret: `.glass` fliegt aus dem Hero-Metrics-Panel (`HomeContent.tsx:359`) raus und wird `bg-card` + 1px Border. Szene und Glass schliessen sich aus, und Glass ist das, was geht.
- Mobile ist eine **Bande, keine Tapete**: auf 390 px mit Gutters siehst du sonst einen 16–24 px Rahmen, also nichts. Auf klein wird das Zimmer zur Figur — full-bleed in den unteren ~40 vh des Heros, null Text darüber.
- Integer-Snapping des Containers via `clamp()` über wenige Breakpoints, sonst flimmert `image-rendering: pixelated`. Das ist die eine echte Engineering-Aufgabe, 2–3 h.

**Zeit: 12–18 h deiner Stunden über zwei Wochen. Hartes Abbruch-Gate an Tag 10** — nicht integriert und grün, dann wird der Branch geparkt, nicht geshippt.

### Zwei Risiken, die ich nicht wegargumentieren kann

**Der axe-Lauf kann das trotzdem killen.** Sibling auf `-z-10` sollte #3390 umgehen, aber axe gibt auch `incomplete` bei "overlapped by another element" und "partially obscured". Das muss an Tag 11 tatsächlich gemessen werden, nicht angenommen.

**Der Geschmacksrisiko ist real und ich habe keine Evidenz dazu.** Pixel-Art trägt eine Konnotation: Indie-Games, Hobby, verspielt, jung. Für Publikum (b) spielt das wahrscheinlich gut. Für einen Schweizer KMU-Käufer, der gerade ein CHF-Budgetband für ein Retainer anklickt, ist es ehrlich ein Münzwurf, tendenziell leicht negativ. Gedämpfte Ink-&-Signal-Palette, technisch-isometrisch statt Cartoon, keine Figuren — das reduziert das Risiko, entfernt es nicht. Wenn deine Pipeline aus wenigen hochwertigen Beziehungen besteht statt aus Volumen, ist "polarisierend" eine schlechtere Wette, als sie aussieht.

---

## Frage 2: Neumorphismus + Accessibility-Toggle

### Zuerst: du budgetierst für einen Preis, der grösstenteils gar nicht erhoben wird

Deine Formulierung "es scheitert nur an Accessibility" konzediert etwas, das du nicht konzedieren musst. SC 1.4.11 erfasst genau zwei Dinge auf 3:1 — visuelle Information, die eine **UI-Komponente** oder ihren **Zustand** identifiziert, und Teile von Grafiken, die zum **Verständnis** nötig sind. Das W3C-Understanding-Dokument nimmt Grafiken "for aesthetic purposes" explizit aus und verlangt explizit **keine** sichtbare Hit-Area-Begrenzung, wenn ein anderer Cue die Komponente identifiziert. Eine Card, eine Metrik-Kachel, ein Zertifikats-Badge, ein Avatar-Rahmen: alles ausserhalb des Scopes. Deine 1.06:1 sind **kein WCAG-Fehler**.

Und Fliesstext ist überhaupt nicht betroffen: `--card-foreground: oklch(0.95)` auf einer weichen Oberfläche misst ~12.6:1 dunkel und ~16:1 hell. Da ist massiv Luft.

Was tatsächlich bricht, sind drei enge Sachen, und alle drei sind reparierbar, ohne die Optik dort weicher zu machen, wo man sie sieht:
1. Icon-only Controls, deren einziger Identifikations-Cue die Extrusion ist.
2. Pressed/Selected-Zustand, der nur über Schattenrichtung transportiert wird (Zustände stehen explizit im SC-Text).
3. Focus-Ringe unter 3:1.

### Und zum rechtlichen Teil, ohne Moral: dein Risiko ist praktisch null

Damit du aufhören kannst, darüber nachzudenken:
- **EAA (2019/882)**: du bist auf **zwei unabhängigen Wegen** draussen. Erstens ist "E-Commerce-Service" an einen **Verbrauchervertrag** gebunden — ein B2B-Qualifizierungsformular mit CHF-Bändern schliesst keinen. Zweitens die Microenterprise-Ausnahme in Art. 4(5) für Services: <10 Personen und ≤2 Mio EUR.
- **BFSG (DE)**: gleiche Struktur, B2C-gerichtet, plus Kleinstunternehmen-Ausnahme. Nur der praktische Hinweis: es muss klar erkennbar sein, dass ein Angebot B2B ist.
- **Schweiz heute**: BehiG/BehiV binden Bund und öffentliche Stellen. Für private Unternehmen gibt es **keine** technische Konformitätspflicht.
- Kalibrierung: WebAIM Million 2026 findet auf **95.9 %** der Top-Million-Homepages WCAG-Fehler, im Schnitt 56.1 pro Seite. Du bist kein Ausreisser und es kommt niemand.

Das einzige Datum, das zählt, ist die BehiG-Teilrevision, die private Anbieter erfassen soll — Inkrafttreten frühestens 2027, ohne generelle KMU-Ausnahme. Das ist kein Risiko für deine Seite, das ist ein **Marktsignal**: 2027–2030 entsteht in der DACH-KMU-Landschaft ein Remediation-Markt, genau während deines Studiums.

**Also: die Accessibility-Argumente sind bei dir die schwächsten. Du hattest recht, sie niedrig zu gewichten.** Die starken Argumente sind andere.

### Die Argumente, die tatsächlich beissen

**1. Die Mathematik deiner Palette.** Dein Dark Ground `oklch(0.09 0.005 260)` ist `#020203`. Der maximal erreichbare Kontrast **irgendeines** dunkleren Schattens dagegen — mit reinem Schwarz, dem theoretischen Boden — ist **1.01:1**. Nicht 1.4. Nicht 1.2. Eins Komma null eins. Es gibt nichts Dunkleres, in dem ein Schatten liegen könnte. Der Dual-Light-Source-Trick ist in deinem Dark Mode nicht schwierig, er ist **nicht verfügbar**. Auf der hellen Seite ist es fast so schlimm: `oklch(0.98)` lässt 1.06:1 Luft nach Weiss, das Highlight ist also auch fast unmöglich. Kanonischer Neumorphismus braucht Grounds bei oklch L ≈ 0.30 dunkel und ≈ 0.92 hell. Du sitzt bei 0.09 und 0.98. Neumorphismus als System kostet dich **beide Endpunkte von Ink & Signal** — und liefert dann immer noch nur 1.16–1.21:1.

**2. Nichts kann poppen — und du verkaufst auf zwei Flächen.** Der strukturelle Defekt ist definitionsgemäss: alles teilt eine Hintergrundfarbe, also trägt der Primary-CTA dasselbe visuelle Gewicht wie eine dekorative Card. CRED, der Vorzeige-Case, hat den Stil im April 2022 abgeräumt und mit NeoPOP ein High-Contrast-System open-sourced. Konversionskritische Flächen haben ihn zuerst verlassen. `/services` mit Retainer-Pitch und das CHF-Band-Formular sind genau solche Flächen.

**3. Drift ist der wahrscheinlichste Fehlermodus, und dein Kalender macht ihn wahrscheinlich.** Zwei Materialien sind eine permanente Disziplinsteuer. Ab September hast du nahe null Wartungsbandbreite. Das realistische Ergebnis nach sechs Monaten ist nicht "das Materialsystem ist würdevoll gealtert" — es ist: eine neue Komponente flach gebaut, weil schneller, die nächste taktil aus einem veralteten Copy-Paste, und die Hierarchie liest sich nicht mehr als Absicht, sondern als Schlamperei. Eine Ein-Material-Seite ist **wartungsfrei**. Das ist das stärkste Argument gegen die Richtung und es ist kein ästhetisches.

**4. Datiertheit — das schwächste der vier, aber nicht null.** 0.69 % → 0.41 % von 208'000 Design-Generationen zwischen Januar und Mai 2026, Glassmorphismus bei ~20× davon. Malewicz, der den Begriff geprägt hat, argumentiert am 27. Mai 2026 dafür, mit dem Benennen von Morphismen ganz aufzuhören. "Selten also unterscheidend" ist ein legitimes Reframe, aber "selten und fallend" ist auch mit "haben es probiert und wieder gelassen" vereinbar.

### Der Toggle, direkt beantwortet

**Fixt ein Toggle es? Nein — aber nicht aus dem Grund, den du erwartest.** Er fixt es nicht, weil erstens grösstenteils nichts zu fixen ist (siehe oben), und zweitens, weil der Mechanismus nicht ankommt:

- 64.5 % der befragten Menschen mit Behinderung sind Overlays/Site-Controls **nie begegnet**.
- 67 % stellen Farbe/Kontrast **auf OS-Ebene** ein.
- Von denen, die einem begegnet sind, berichteten 55 % von **Konflikten mit ihrem eigenen Assistive-Tech**.

Der strukturelle Grund: eine OS-Einstellung wird einmal gesetzt und gilt für immer und überall. Ein Per-Site-Toggle muss auf jeder neuen Domain neu entdeckt, gefunden und geklickt werden — von jemandem, der per Definition Mühe hat, die Seite zu sehen, auf der der Toggle liegt. Diese Ökonomie geht nie auf.

**Was signalisiert das Shippen eines Toggles?** Das hängt vollständig von drei Bedingungen ab, und du kannst alle drei brechen:

1. **Benennung**: heisst er "High Contrast" oder "Accessibility", ist er nach dem Defekt benannt. Heisst er "Edges: Soft / Defined", ist er nach dem Material benannt.
2. **Silhouette**: ein schwebender runder Button unten in der Ecke ist inzwischen das De-facto-Markenzeichen von accessiBe und UserWay. Diese Widgets laufen auf ~2 % des Webs, aber nur auf **0.3 % der Top-1000-Seiten** — es ist ein Marker des unteren Endes, und ausgerechnet die DevTools-Fraktion erkennt ihn sofort. Die FTC hat accessiBe im April 2025 mit 1 Mio USD belegt; das Overlay Fact Sheet hat 1'031 Unterzeichner. Nichts davon gilt deinem CSS-Switch — aber die **Form**, die du wählst, entscheidet, in welche Schublade er gelegt wird.
3. **Und das Entscheidende: ob der Default ohne ihn korrekt ist.** Niemand liest einen Dark-Mode-Toggle als Eingeständnis, dass Light Mode kaputt ist. Der Test, den ein Evaluator wirklich fährt, ist kontrafaktisch: *wenn ich das Ding nie anfasse, ist die Seite dann trotzdem richtig?* Die Bedeutung des Toggles wird komplett von der Qualität des Defaults bestimmt, nicht von seiner Existenz.

**Meine Empfehlung dazu**: bau die **Lese-Seite**, nicht die Klick-Seite.

```css
@media (prefers-contrast: more), (forced-colors: active) {
  :root { --border: oklch(0.60 0.006 90); }   /* 3.11:1 statt 1.2:1 */
  .dark { --border: oklch(0.56 0.006 260); }  /* 3.15:1 statt 1.08:1 */
}
```

Das sind ~20 Zeilen, brauchen kein UI, keine Persistenz, keine Hydration-Mismatch-Risiken, kein AT-Testing — und **unter 1 % aller Seiten machen das**. `prefers-reduced-motion` machen 50 %, `prefers-color-scheme` 12 %, `prefers-contrast` <1 %. Für einen DevTools-Evaluator ist das das höchste Kompetenzsignal pro Zeile, das auf dieser Seite überhaupt verfügbar ist, und es ist mehr, als ein Badge je erreichen könnte.

Wenn du danach noch Zeit hast: **eine Settings-Popover-Zeile statt eines Badges**, in der bestehenden Nav. Dein `components/ThemeToggle.tsx` ist übrigens aktuell ein reiner Zwei-Zustand-Button (`theme === "light" ? "dark" : "light"`) — er bietet nicht mal **System** an. Das ist der eigentliche kleine Fehler dort. Die Zielform:

```
Theme    System · Light · Dark
Edges    System · Soft  · Defined
Motion   System · Full  · Reduced
```

Mit der harten Bedingung, dass jedes "System" seine Media Query **wirklich** liest. Ein Settings-Panel, das System anbietet und das OS ignoriert, ist schlechter als gar keins — es verwandelt ein Kompetenzsignal in eine ertappte Lüge.

### Was ich stattdessen bauen würde: zwei Materialien, und das Wort "Neumorphismus" fällt nie

Dein Instinkt ist richtig. Flat Design hat eine Usability-Decke erreicht, an der Leute nicht mehr erkennen, was klickbar ist; "tactile maximalism" und das Skeuomorphismus-Revival sind 2026 die real steigenden Trends. Du hast nur das falsche Wort daran gehängt — und das Wort ist der einzige Teil, der das Reputationsrisiko trägt.

**Material A "Paper" (flach, unverändert)**: Page-Ground, Fliesstext, Navigation, Footer, die nummerierte Projektliste, `/privacy`. ~80 % der Pixel, bleibt genau wie heute. Das hält die Seite editorial statt 2020.

**Material B "Cast" (taktil)**: nur **Display-Objekte** — Hero-Metrik-Kacheln, Skill-Chips, Zertifikats-Badges, `/services`-Pricing-Tiles, Avatar-Rahmen. Nie eine nackte Section, nie die Nav, nie Langtext.

**Der Trick, der die Palette rettet: bau ein Podest, nicht eine Extrusion des Grunds.** Neumorphismus braucht Headroom in der Oberfläche, aus der das Objekt austritt — nicht im Page-Ground. Gemessene Werte:

| Token | dunkel | hell |
|---|---|---|
| `--ground` | `oklch(0.09 0.005 260)` — **unverändert** | `oklch(0.98 0.003 90)` — **unverändert** |
| `--cast` | `oklch(0.28 0.006 260)` → **1.42:1** vs Ground (heute: 1.02:1) | `oklch(0.92 0.004 90)` → **1.20:1** (heute: 1.06:1) |
| `--cast-hi` | `oklch(0.36)` → 1.34:1 vs cast | `#ffffff` → 1.27:1 |
| `--cast-lo` | `oklch(0.14)` → 1.37:1 vs cast | `oklch(0.82)` → 1.37:1 |

Zum Vergleich: kanonischer Dark-Neumorphismus liegt bei 1.16–1.18:1. Deine Podest-Version ist **~18 % besser getrennt als das Rezept**, und Ink & Signal überlebt vollständig, weil die Endpunkte Page-Ground bleiben.

**Geometrie halbieren — das ist der Anti-2020-Hebel.** Kanonisch sind 8–9 px Offset, 16–18 px Blur, 20 px+ Radien. Genau das liest sich als 2020. Nimm 6 px / 14 px und behalte `--radius: 0.75rem`. Enge Radien + kleine Offsets + dein bestehendes `.grain-overlay` bei 0.02/0.03 liest sich als **gefräst**, nicht als Kissen — und damit näher an der Plan-Set-Richtung als im Konflikt damit.

**Controls bleiben flach mit echtem Border.** Das ist die Regel, die aus Inkonsistenz eine Hierarchie macht, und sie kauft die Konformität nebenbei mit:

```css
.control {
  background: var(--cast);
  border: 1px solid var(--control-edge);   /* Teal: 6.97:1 dunkel / 4.84:1 hell */
  box-shadow: inset 0 1px 0 var(--cast-hi),
              0 4px 6px -1px rgb(0 0 0 / .10), 0 2px 4px -2px rgb(0 0 0 / .10);
}
.control:active {
  transform: translateY(1px) scale(0.97);
  background: color-mix(in oklch, var(--cast), black 8%);
  box-shadow: inset 4px 4px 10px var(--cast-lo), inset -4px -4px 10px var(--cast-hi);
  transition: 120ms cubic-bezier(0.23, 1, 0.32, 1);
}
```

Drei unabhängige State-Cues (Polarität, Fill, Rim) statt einem — überlebt auch `forced-colors`, wo `box-shadow` komplett gestrippt wird und nur der echte `border` übrig bleibt.

**Ein echter Fund, kein hypothetischer:** dein Light-Teal `--primary: oklch(0.50 0.16 160)` (globals.css:13) misst auf einer Cast-Oberfläche **4.12:1** — das wäre ein neuer, echter 1.4.3-Fehler, den die Umstellung einführt. `0.48` gibt 4.46:1, immer noch knapp. **Nimm `oklch(0.46 0.16 160)` → 4.84:1 auf Cast, 5.79:1 auf dem Ground.** Eine Zeile, eine Minute.

**Und wo das Gewicht wirklich herkommt: Motion, nicht Schatten.** `:active scale(0.97)`, 100–160 ms, `cubic-bezier(0.23, 1, 0.32, 1)`, Stagger 30–80 ms, Hover hinter `@media (hover: hover) and (pointer: fine)`. framer-motion ^12.23.21 ist installiert. Wahrgenommene Schwere entsteht viel mehr aus dem Einschwingen als aus Schattentiefe — und Motion hat **null Kontrastkosten**. Das ist der höchste Return auf der ganzen Liste.

**Gratis-Fund nebenbei:** `.glass` (globals.css:163) läuft `backdrop-filter: blur(12px) saturate(180%)` und ist an mindestens acht Stellen im Einsatz — `HomeContent.tsx:359` und `:492`, `CertificateCard.tsx:35`, `CertificatesRoadmap.tsx:101`, `Navigation.tsx:121` und `:173`, `AdminSidebar.tsx:78`. Über einem **flachen einfarbigen Hintergrund** ist das ein Compositor-Read plus Blur-Kernel, dessen Ergebnis optisch identisch zu einer deckenden Füllung ist: du bezahlst GPU in Production und bekommst null zurück. Die einzige Stelle, wo es etwas tut, ist die sticky Nav — und das ist gleichzeitig die Stelle, wo es pro Scroll-Frame neu blurrt. Pack die Utility in `@media (prefers-reduced-transparency: no-preference)` mit deckendem Baseline (Chromes additives Muster). Grund: `prefers-reduced-transparency` liegt bei 73.41 % Support, **Safari unterstützt es bis iOS 26.5 gar nicht**, Firefox hat es per Default aus — und dein DACH-Publikum ist Apple-lastig. Die Leute, die "Reduce Transparency" seit iOS 7.1 (2014) an haben, sind für dich unsichtbar.

---

## Was ich in deinen ~4 Wochen bauen würde

**Woche 1 — 7 Stunden, alles davon unbedingt gut, unabhängig von jeder Stilfrage:**

| # | Arbeit | Zeit |
|---|---|---|
| 1 | Token-Ladder: Dark-Surfaces bei oklch L 0.09 / 0.13 / 0.17 / 0.21, `--border` hoch (heute 1.2:1 hell / 1.08:1 dunkel — deine Borders sind selbst unsichtbar), Light-Teal auf `oklch(0.46)` | 2 h |
| 2 | `prefers-contrast: more` + `forced-colors: active` Blocks; `.glass` mit deckendem Baseline in `prefers-reduced-transparency` wrappen; **System-Option in `ThemeToggle.tsx` nachrüsten** | 1.5 h |
| 3 | Press-Physik auf allen Controls (`scale(0.97)`, 120 ms, ease-out, Stagger) | 3 h |

Das löst dein 1.06:1/1.02:1-Problem vollständig, fixt einen echten Kontrast-Bug, liefert die Taktilität, die du willst, und setzt dich in die <1 %, die `prefers-contrast` implementieren. **Wenn du diesen Monat nichts anderes machst, mach das.**

**Woche 2–3 — parallel, zwei Spuren, beide abbrechbar:**

- **Spur A (Geld, nicht Zeit):** Tag 0, 2 h — Fotos, Briefing, Paletten-Hex-Werte, 2–3 Aufträge parallel raus, 60–150 USD. Danach wartest du nur.
- **Spur B (Stunden):** Cast-Material auf 3–4 Display-Objekt-Typen, 4–6 h. Regel: entweder alle Typen oder keiner. Halb konvertiert reverten, nicht shippen.

**Tag 8–11:** Szenen-Integration 6–10 h, dann Tag 11 der Prüftag — axe-Lauf, NC-State-Edge-Maps auf 3 Breakpoints × 2 Themes, DevTools Paint-Flashing beim Scrollen, Lighthouse vorher/nachher. **Hartes Gate: nicht grün, Branch parken.**

**Streichen, wenn die Zeit knapp wird:** das Settings-Popover mit drei Zeilen. Es ist das Element mit dem schlechtesten Verhältnis von Aufwand zu Wirkung auf dieser Liste — die Media Queries darunter leisten 90 % davon zu 10 % der Kosten.

---

## Die unbequeme letzte Zeile

Der ehrliche Vergleich ist nicht "Zimmer gegen nichts". Es ist "Zimmer gegen **eine sauber geschriebene Case Study mit echten Zahlen** aus der Energieoptimierung oder der .NET-Zeit". Beide kosten dieselben 12–18 Stunden. Für Publikum (a) — den Schweizer KMU-Käufer mit dem CHF-Band — gewinnt die Case Study die Konversion vermutlich deutlich. Das Zimmer gewinnt Erinnerbarkeit, und die kann die Case Study für kein Geld kaufen.

Meine Wette, wenn ich für dich entscheiden müsste: **Woche 1 (7 h) sofort und als fertige Arbeit betrachten. Dann eine Case Study. Das Zimmer nur, wenn nach beidem noch Kalender übrig ist** — mit den 100 USD parallel bestellt, weil das Geld ist, nicht Zeit, und ein PNG, das im September auf deiner Festplatte liegt, kostet dich nichts.

Was definitiv nicht passiert: Realtime-3D, ein mittelgrauer "Dark Mode", eine CSS-Imitation von Liquid Glass, und ein rundes Accessibility-Badge unten rechts.