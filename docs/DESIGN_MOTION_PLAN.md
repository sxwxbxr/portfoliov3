# sweber.dev — Finale Design- & Motion-Empfehlung

**Datum:** 11.08.2026 · **Status:** Entscheidungsvorlage, daraus wird gebaut
**Kurzfassung:** Richtung **„Datum"** (Plan-Set / technische Zeichnung), umgesetzt mit anime.js v4. **Kein** Neumorphismus, **kein** Spatial UI als System. Drei Signature-Momente, elf Utility-Gesten, ein Motion-Vertrag.

> ### Verifikationsstand
>
> Selbst am Code nachgeprüft und **bestätigt**: die `next/font`-Variablen-Lücke (`layout.tsx:21/29/37` deklariert `--font-inter` / `--font-space-grotesk` / `--font-jetbrains-mono`, `globals.css:115-117` referenziert stattdessen literale Familiennamen) · kein einziger `prefers-reduced-motion`-Block in `globals.css` · das doppelte Ring-Alpha (`:25` + `:122`) · kein `certificates`-Export in `scripts/seed-data.ts` · `applicationDocuments/` ist in Git getrackt und **nicht** in `.gitignore` · `public/documents/` existiert nicht, `about/page.tsx:164` verlinkt dorthin · `prompts.ts:56` „her" vs. `context.ts:11` he/him · **null** Imports für `gsap`, `recharts`, `embla-carousel-react`, `geist` · `styles/globals.css` von nichts importiert · framer-motion an genau 6 Stellen · Lenis `duration: 1.2` (`SmoothScroll.tsx:30`).
>
> **Nicht abschliessend prüfbar, bitte selbst kontrollieren:**
> - **Repo-Sichtbarkeit.** Dass `applicationDocuments/` getrackt ist, steht fest. Ob `github.com/sxwxbxr/portfoliov3` public ist, konnte ich von hier aus nicht feststellen — davon hängt ab, ob Punkt 0.1 „heute\" oder „bei Gelegenheit" ist.
> - **`/privacy`.** Die Route ruft `notFound()`, wenn `settings.privacyContent` leer ist, und der Seed-Default ist `""`. Ob in der Produktions-DB über `/admin` Inhalt hinterlegt wurde, sieht man nur dort. Wenn ja, entfällt der Punkt.

---

## 0. Bevor irgendetwas anderes passiert

Drei Dinge, die keine Designentscheidung sind, sondern Schadensbegrenzung. Sie stehen hier oben, weil sie jeden Punkt weiter unten überwiegen.

1. **`applicationDocuments/` ist in Git getrackt.** Fünf gescannte PDFs — Arbeitszeugnis, Resume DEU, zwei Fähigkeitsausweise EFZ, Lehrzeugnis — liegen im Repo `github.com/sxwxbxr/portfoliov3`, und `.gitignore` schliesst sie nicht aus. Wenn das Repo public ist, ist das eine offene Personendaten-Exposition. Repo-Sichtbarkeit prüfen, Files aus der History entfernen (`git filter-repo`), `.gitignore` ergänzen. Heute.
2. **Tote Vertrauens-Links.** `/documents/CV_SeyaWeber.pdf` gibt 404 (es existiert kein `public/documents/`). `/privacy` gibt 404, weil `privacyContent` als `""` geseedet ist — und das Kontaktformular verlinkt es *bedingungslos* (`ContactForm.tsx:345-352`), während es Name, Firma, CHF-Budget und Projektumfang einsammelt. Genau dieses Detail bemerkt ein Schweizer Einkäufer.
3. **Der Pitch-Generator misgendert dich.** `lib/ai/prompts.ts:56` sagt „her portfolio website", `lib/ai/context.ts:11` sagt he/him. Das ist das eine Artefakt, das ein Recruiter kopieren und weiterleiten soll. Dazu: `prompts.ts:26` und `:39` weisen das Modell an, Cloudflare Workers zu referenzieren — die in keinem geseedeten Skill und keinem Projekt vorkommen.

Keine Animation der Welt überlebt einen Besucher, der auf `demo: "#"` klickt.

---

## 1. Ehrliche Standortbestimmung

### Was die Seite heute wirklich gut macht

Das wird in allen drei Direction-Dokumenten unterschätzt, deshalb zuerst: die Zurückhaltung ist echt und sie ist ein Qualitätssignal. Der Cursor-Spotlight läuft bei Opacity 0.025 und schaltet sich auf Touch und bei reduced motion selbst ab. Grain sitzt bei 2 %. Hover ist 200 ms Farbe plus eine 2 px breite Kante. Es gibt einen Skip-Link, ein Print-Stylesheet, ISR mit `generateStaticParams`, `fra1`-Pinning. Sieben Komponenten prüfen `prefers-reduced-motion` in JS. Ein Engineering Manager liest das als kompetente Disziplin, nicht als Effekt-Demo. Das behalten wir vollständig.

Zwei Gesten sind echt authored und nicht von der Stange: der `clipPath: inset(100% 0 0 0)` Line-Reveal im Hero, und der Accent-Balken in `ProjectListItem.tsx:39-47`, der auf Hover von `h-0` auf `h-full` wächst. Beide sind unterausgenutzt.

### Wo es wirklich bricht

**Monokultur.** Neun Oberflächen rendern dasselbe Muster: `border-t border-border`-Zeilen, `max-w-[1200px] px-6 py-24 md:py-32`, links Label, Mitte muted, rechts Mono. `/experience → /education → /skills → /services` unterscheiden sich nur durch das `<h1>`. Die Homepage unterhalb des Heroes sind vier solche Listen hintereinander. Die Zwei-Spalten-Definitionsliste existiert in drei leicht verschiedenen Breiten (`[200px_1fr]`, `[220px_1fr]`, `[250px_1fr]`) — das liest sich als Drift, nicht als System.

**Der Hero sagt nichts.** Full-Viewport, Name, Jobtitel, das Wort „Scroll". Der eigene Design-Brief formuliert als Akzeptanzkriterium „ein Hiring Manager findet wer du bist, was du machst, deine Arbeit, und wie er dich kontaktiert — in 10 Sekunden". Genau dort fällt die Seite am härtesten durch.

**Die LCP-Wahrheit.** Verifiziert in `components/HomeContent.tsx:259`: framer-motion serialisiert `initial` ins SSR-Markup. Das statisch prerenderte, CDN-gecachte HTML enthält das `<h1>` mit `opacity: 0` und kann nicht malen, bis React hydriert hat. Commit `05e1a50` hat 18 s TTFB gefixt — und dann wartet die Seite trotzdem auf JS. Das ist der teuerste Bug im Repo.

**Drei Korrektheits-Defekte, verifiziert:**
- `app/globals.css:115-117` mappt `--font-sans/display/mono` auf **literale Familiennamen**, während `app/layout.tsx:17-39` die Variablen `--font-inter` / `--font-space-grotesk` / `--font-jetbrains-mono` deklariert. Diese drei Variablen kommen nirgends sonst im Repo vor. next/font self-hostet unter gehashten Familiennamen. **Die Seite rendert für praktisch jeden Besucher in `ui-sans-serif` / `ui-monospace`.** Drei Zeilen Fix.
- `app/globals.css` enthält **keinen einzigen** `@media (prefers-reduced-motion: reduce)` Block. Jedes `animate-ping`, `animate-pulse`, `animate-bounce`, jede `.link-underline`-Transition ignoriert die OS-Einstellung.
- `--ring` hat `/ 0.3` eingebacken (`:25`), und `* { outline-ring/50 }` (`:122`) halbiert das nochmal → ~15 % Alpha, ~1.14:1. Der Focus-Ring ist unsichtbar. Die `.focus-ring`-Utility, die das lösen würde, hat **null** Verwendungen.
- Dark `--muted-foreground` = 4.27:1. Das ist die Standard-Fliesstextfarbe der ganzen Seite und **failed WCAG AA**.

**Inhalt trägt die Form nicht.** Kein `certificates`-Array in `scripts/seed-data.ts` (verifiziert — exportiert werden nur projects, blogPosts, caseStudies, educationEntries, skills, siteSettings, experience). `/education` kollabiert auf „The shelf is empty -- for now", direkt unter einem Nav-Eintrag, der „Academic background & certs" verspricht. Fünf von neun Projekten haben `github: "#"` und `demo: "#"`. Hero-Metriken sind Selbstdeklarationen, bei denen „9+ Projects Delivered" exakt die Anzahl geseedeter Zeilen ist.

### Publikum — wer wirklich liest

Zwei Lesarten, beide mit ~90 Sekunden auf dem Handy:

- **Schweizer/DACH B2B-Käufer.** Das Kontaktformular qualifiziert nach CHF-Bandbreite und Timeline, `/services` verkauft Retainer, der AI-Prompt sagt wörtlich „A potential client has filled in a contact form". Dieser Leser will: Belege, Nachvollziehbarkeit, Rechtssicherheit.
- **Hiring Manager / technischer Evaluator.** `/pitch` listet „Recruiter" als erste Rolle. Dieser Leser öffnet DevTools, tabbt durch, und erkennt eine Trendästhetik auf zwanzig Meter.

Beide belohnen dasselbe: **eine Seite, die selbst der Kompetenzbeweis ist.** Nicht eine Seite, die Kompetenz behauptet und dann mit Parallax dekoriert.

---

## 2. VERDICT: Richtung „Datum"

**Primäre Richtung: Datum** — die Hairline wird zum Zeichen-Instrument. Drei Strichstärken statt einer, Mono wird ein echtes Annotationssystem mit Tabularziffern, der eine Teal-Akzent bedeutet nur noch „gemessen oder aktuell wahr". Jedes Ornament ist echter Inhalt.

**Warum Datum gewinnt — drei Gründe, nicht mehr:**

1. **Es ist das einzige System, in dem das Design-Budget Glaubwürdigkeit *kauft* statt sie auszugeben.** Eine gezeichnete Karriere-Linie 2019→2026 mit vier Arbeitgebern ersetzt „Name + Scroll". Section-Captions aus echten Counts (`§ 05 · EXPERIENCE · 2019–PRESENT`) differenzieren neun identische Listen für fast nichts. Ornament und Beleg sind dasselbe Objekt.
2. **Es entfernt Laufzeitkosten, statt welche hinzuzufügen.** Keine animierte `box-shadow` irgendwo. Eine einzige geblurrte Fläche (die Nav). `.grain-overlay` — ein fixed full-viewport SVG-Pseudo-Element auf z-40 über *allem* — wird zu zwei Linear-Gradients. CursorSpotlight fliegt raus. Der Lottie-Player fliegt raus. `ScrollProgress`' setState-pro-Scroll-Event plus `document.body.scrollHeight`-Forced-Layout fliegt raus.
3. **Es ist nicht klonbar, weil es autobiografisch ist.** Elektroplaner → Energieplaner → .NET → PM. Plan-Set-Sprache ist keine Trend-Zitation. Letterpress landet auf `oklch(0.145)` — buchstäblich shadcn's Default-Dark-Base. Control Surface liest sich als 2020-Dribbble für jeden, der `/about` nicht liest. Beide datieren die Seite auf ihr Baujahr. Datum nicht.

### Was ich aus Direction 2 (Control Surface) übernehme

Die Engineering-Techniken — und die sind besser als in Datum selbst:

- **Der `[data-shade]`-Crossfade.** Wenn sich irgendwo Elevation ändert, wird die Opacity eines absolut positionierten, vorkomponierten Shadow-Childs animiert. Nie eine interpolierte `box-shadow`. Das ist der einzig richtige Weg und nur D2 hat ihn.
- **Das Affordance-Invariant für Formulare:** vertiefte Wells für Inputs, erhabene Plates für Buttons, und der Rim ist ≥3:1 — nicht der Schatten. Der Test: lösche jeden Schatten aus dem Stylesheet, das Interface bleibt vollständig lesbar und compliant.
- **`Number.isFinite`-Guard** bei jedem Count-up, weil `settings.heroMetrics` admin-editierbarer Freitext ist und „C1" oder „Native" enthalten kann.
- **`createAnimatable` für event-getriebene Werte** (Nav-Offset): retargeten statt `animate()`-Calls zu stapeln.
- **Die `document.fonts.ready`-Gate vor jedem `splitText`.** Fonts laden mit `display: swap`; ein Split beim Mount misst den Fallback.

### Was ich aus Direction 1 (Letterpress) übernehme

Genau zwei Items, beide reine Performance:

- **`nav-elevation-ramp`**: `onScroll` treibt ein Plain-JS-Objekt, dessen `onRender` CSS-Custom-Properties auf das Nav-Element schreibt. Null React-Re-Renders, ersetzt das setState-pro-Scroll-Event in `Navigation.tsx:56-74`.
- **`scroll-ruler`**: animiertes `width` → composited `scaleX`, getrieben von einem `onScroll`-Observer.

Plus die Sequenzierungs-Ehrlichkeit: erst Korrektheit, dann Inhalt, dann Tiefe.

---

### Direkte Antwort: Spatial UI vs. Neumorphismus

Du hast beides gefragt. Beide Antworten sind Nein, aber aus verschiedenen Gründen.

#### Neumorphismus: **Nein. Kategorisch, nicht verhandelbar.**

Das ist kein Geschmacksurteil, es ist Arithmetik. Die definierende Bewegung von Neumorphismus ist, den Rand zu löschen: die Fläche hat dieselbe Farbe wie ihr Hintergrund und wird nur durch ein Paar aus Licht- und Schattenschatten getrennt. Gemessen:

- Kanonische Kante `#a3b1c6` gegen `#e0e5ec`: **~1.7:1**
- Typische wahrgenommene Kante: **1.2–1.5:1**
- Anforderung WCAG 1.4.11 (Level AA) für UI-Komponenten und ihre Zustandsindikatoren: **3:1**

Die Falle, und sie ist der Grund, warum Leute das trotzdem shippen: der *Text* auf diesen Flächen misst ~9.4:1. Ein naiver Kontrast-Check auf Copy gibt vollständige Entwarnung, während jedes einzelne Control durchfällt. Dazu: WCAG 2.2 2.4.13 verlangt für den Focus-Indikator ≥3:1 zwischen fokussiertem und unfokussiertem Zustand — ein schattenbasierter Ring auf einer schattenbasierten Fläche kann das geometrisch nicht. Screenreader bekommen aus einem Schatten nichts. Und gedrückt / ungedrückt / nicht-interaktiv sehen alle gleich aus.

Der entscheidende Punkt: **es gibt kein „barrierefreies Neumorphismus", das noch als Neumorphismus erkennbar ist.** Die Kanten auf 3:1 zu heben heisst, einen sichtbaren Rand und einen echten Farbunterschied einzuführen — und damit ist der Stil weg. Michal Malewicz, der den Begriff 2019 geprägt hat, hat ihn nie als System empfohlen; jeder Text danach war negativ.

Für ein Portfolio, dessen wichtigstes Publikum `npx @axe-core/cli` laufen lässt, ist das ein Eigentor mit auditierbaren Zahlen. Du würdest eine Wissenslücke in Barrierefreiheit an deinen eigenen Buttons dokumentieren.

*Die Elektroplaner-Herkunft ist echt und ich glaube sie. Aber sie rettet die Ästhetik nur, wenn jemand `/about` liest — die Seite, die er in 90 Sekunden am wenigsten erreicht. Du bekommst den datierten Look ohne die Geschichte.*

#### Spatial UI: **Nein als System. Ja für genau zwei Flächen.**

Die restriktive Version — Hairline-Borders plus tokenisierte Low-Opacity-Schatten für Hierarchie, genau eine geblurrte Fläche — ist verteidigbar. Die volle Version ist es nicht, aus vier Gründen:

1. **Deine Palette kann es geometrisch nicht.** Dark `--background` = `oklch(0.09 0.005 260)` = `#020203`, relative Luminanz 0.00073. Nichts kann darunter zurücktreten, kein gestapelter Schatten ist sichtbar. Light `--background` bei 0.98 lässt 0.02 L nach oben. Card-vs-Background ist **1.06:1 light / 1.02:1 dark**. Um Elevation zu ermöglichen, müsstest du beide Grounds re-basen — Wochen an Kontrast-Kaskadenarbeit (`--primary` fällt von 4.96:1 auf ~4.3:1 und muss nachdunkeln, dark `--muted-foreground` muss von seinem AA-Fail hoch, 139 `border-border`-Verwendungen über 56 Files müssen neu bewertet werden) — und das sichtbare Resultat fasst ein Hiring Manager als „die Cards haben jetzt Schatten" zusammen.
2. **Translucency ist per Konstruktion nicht auditierbar.** Eine Glasfläche erbt, was dahinter liegt. Sie besteht Kontrast auf einer Seite und fällt auf der nächsten durch — und Portfolio-Hintergründe sind Projekt-Screenshots, also der maximal unvorhersehbare Fall. Apples eigene Regel für Liquid Glass ist explizit: eine *funktionale* Schicht über dem Inhalt (Bars, Toolbars, Controls), niemals eine Content-Layer-Behandlung. Apple hat innerhalb eines Point-Release ein „Tinted"-Control und einen „Reduce Bright Effects"-Toggle nachgeschoben. Wenn der Hersteller am Tag eins Kill-Switches ausliefert, ist das eine Aussage über den Default.
3. **Der echte Refraktions-Look ist Chromium-only.** `feDisplacementMap` in `backdrop-filter` funktioniert in Safari und Firefox nicht — also genau bei den Nutzern, die die Referenz erkennen würden.
4. **Der Backdrop-Root-Footgun.** Jeder Vorfahr mit `opacity < 1`, `filter`, `mask`, `clip-path` oder `will-change` wird selbst zum Backdrop-Root und deaktiviert `backdrop-filter` bei Nachkommen — lautlos. framer-motion setzt `will-change` und animiert `opacity` auf Wrappern als Normalfall. Du würdest Glas bauen, das in Isolation funktioniert und beim ersten Route-Transition-Wrapper ohne Fehlermeldung aufhört zu wirken.

**Was ich davon behalte:** genau ein tokenisierter zweiteiliger Low-Opacity-Schatten (`--elev-nav`) auf **zwei** Flächen — der Sticky-Nav und dem Chat-Panel. Plus `@supports`-Gate, `min-width: 768px`-Floor (Blur über scrollendem Content ist die schlechteste Paint-Form, die es gibt, und iOS Safari repaintet erst nach Scroll-Ende) und ein `prefers-reduced-transparency`-Fallback. `.glass` geht von ~30 Verwendungen auf **eine**.

Alles andere: Hierarchie durch Strichstärke, aus einem Screenshot auditierbar.

---

## 3. Der Animations-Katalog

Sortiert nach Impact/Effort. **★ = Signature Moment** (davon gibt es genau drei — das ist eine Regel, keine Beobachtung: eine Geste neunmal wiederholt ist keine Sprache, sondern ein Tick, und dieser Codebase hat bereits bewiesen, dass er eine Geste überstrapaziert — dasselbe Fade-up existiert heute in drei Tunings).

---

### 1. Instrument Off — Reduced Motion als Zielzustand (Fundament)

**Wo:** `app/globals.css`, `app/layout.tsx` (2-Zeilen-Inline-Script im `<head>`), jeder Scope im System.

**Was der Besucher erlebt:** Mit aktiviertem Reduced Motion *degradiert* die Seite nicht — sie ist **aufgelöst**. Jede Linie bereits gezogen, jeder Balken bereits ausgefahren, jede Zahl auf ihrem Wert, die Karriere-Linie fertig gezeichnet, der Today-Marker gesetzt. Es sieht aus wie die fertige Zeichnung, nicht wie eine Zeichnung, der man die Animation weggenommen hat.

Gleichzeitig ist das der Fix für den LCP-Bug: **HTML kommt vollständig vom CDN, JS opted sich ein.**

```ts
// app/layout.tsx <head>, vor allem anderen:
// <script dangerouslySetInnerHTML={{ __html:
//   `document.documentElement.classList.add('js-motion')` }} />

createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)" } })
  .add((self) => {
    if (self.matches.reduceMotion) {
      utils.set("[data-draw]", { opacity: 1, y: 0 })
      utils.set("[data-rule]", { scaleX: 1 })
      utils.set(svg.createDrawable("[data-plot]"), { draw: "0 1" })
      return
    }
    /* … Timelines … */
  })
```

Scope hängt pro Query einen `change`-Listener und ruft `refresh()` — kippt die OS-Einstellung zur Laufzeit, baut sich alles neu auf. Strikt besser als die drei One-Shot-`matchMedia().matches`-Reads in `SmoothScroll.tsx:18`, `CursorSpotlight.tsx:13`, `ScrollProgress.tsx:10`, wo ein Umschalten bis zum Reload nichts tut.

**Effort:** S · **Reduced-Motion-Fallback:** *ist* der Fallback.

> **Harte Regel, die daraus folgt:** Auf dem LCP-Element wird **niemals** `opacity` animiert. Nur `transform`. From-States werden in CSS unter `html.js-motion` autoriert, nicht von anime.js (anime.js SSRt nichts — das ist die Chance, nicht das Problem).

> **Der Abnahmetest für alles Weitere:** Schalte Reduced Motion im OS ein und schau dir die Seite an. Wenn sie unfertig aussieht, dekoriert die Animation, statt zu kommunizieren — dann streich sie.

---

### 2. Ruled Hover — die Projekt-Zeile, neu getunt (und bewusst *ohne* anime.js)

**Wo:** `components/ProjectListItem.tsx:29-47, 50-71` (verwendet in `HomeContent.tsx:385` und `app/projects/page.tsx:21`).

**Was der Besucher erlebt:** Die Basislinie der Zeile verdickt sich von 1 px auf 2 px und wechselt von `--rule` auf `--rule-strong` — Graphit, nicht Teal, weil der Akzent jetzt für Zustand reserviert ist. Der Accent-Balken zeichnet sich in derselben Bewegung von dieser Basislinie nach oben. 140 ms statt 300 ms. Index und Pfeil wechseln die Farbe ohne Weg. Es fühlt sich an wie ein Zeichencursor, der auf eine Linie einrastet.

**Implementation: reines CSS. Kein anime.js.** Das ist der Punkt. Ein Portfolio, das für einen Listen-Hover eine JS-Animation-Engine bemüht, ist genau das, was ein technischer Leser bemerkt — und es spart 13 Listener über die `/projects`-Liste.

```css
@media (hover: hover) and (pointer: fine) {
  .row:hover .rule { background: var(--rule-strong); height: var(--stroke-dim); }
  .row:hover [data-row-accent] { transform: scaleY(1); }
}
[data-row-accent] { transform-origin: bottom; transform: scaleY(0);
  transition: transform var(--dur-hover) var(--ease-plot); }
```

Drei Fixes reiten mit: `group-hover:backdrop-blur-sm` (`:35`) **löschen** — ein per-Zeile-Backdrop-Filter-Repaint über opakem Grund kostet ohne sichtbaren Nutzen. Die fehlende `@media (hover: hover)`-Gate ergänzen — heute feuert der Hover auf Touch und bleibt hängen, auf genau dem Gerät, auf dem Recruiter screenen. Und `transition-[height]` auf `scaleY` umstellen.

**Effort:** S · **Reduced Motion:** globaler CSS-Guard neutralisiert die Transition; im Scope zusätzlich `utils.set("[data-row-accent]", { scaleY: 1, opacity: 0 })`, damit kein Balken mitten in der Transition stehenbleibt.

---

### 3. Sheet Change — die Seitentransition, die heute nicht existiert

**Wo:** neu `app/template.tsx`. Es gibt aktuell **kein** `template.tsx`, `loading.tsx` oder `error.tsx` irgendwo in `app/`.

**Was der Besucher erlebt:** Blattwechsel im Plan-Set. Die ausgehende Seite animiert *nicht* — kein Exit heisst keine wahrgenommene Latenz auf einen Klick. Die eingehende löst sich mit Opacity plus 4 px Lift über 220 ms auf. Fertig. Heute ist jede Navigation ein Hard Cut in eine Seite ohne Entrance; `/projects/[slug]` sind 298 Zeilen mit exakt null Motion.

```tsx
"use client"
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const first = useRef(true)
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return
    if (first.current) { first.current = false; return }   // Cold entry malt sofort
    if (!document.documentElement.classList.contains("js-motion")) return
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    utils.set(el, { opacity: 0 })                          // sync, kein Flash
    const a = animate(el, { opacity: [0,1], y: [4,0], duration: 220, ease: "out(3)" })
    const id = requestAnimationFrame(() => scrollContainers.forEach(c => c.refresh()))
    return () => { cancelAnimationFrame(id); a.revert() }
  }, [pathname])
  return <div ref={ref}>{children}</div>
}
```

**Effort:** S · **Reduced Motion:** Early return, Hard Cut wie heute.

> ⚠️ **Prerequisite, nicht optional:** Dieser Wrapper animiert `opacity` und setzt `will-change` → er wird zum **Backdrop-Root** und killt `backdrop-filter` bei jedem Nachkommen, lautlos. Ich habe verifiziert: `PageLayout.tsx:50` **und** `HomeContent.tsx:236` rendern `<Navigation />` innerhalb von `children`. **`<Navigation />` muss vorher nach `app/layout.tsx` gehoben werden, als Geschwister von `<main>`.** Das fixt gleichzeitig den `<nav>`-in-`<main>`-Landmark-Fehler und lässt die drei hartkodierten Nav-Bäume (`Navigation.tsx:12-44`, `FullscreenMenu.tsx:11-34`, `Footer.tsx:7-28`) zu einer Quelle kollabieren.

---

### 4. Scroll Ruler — der Fortschrittsbalken, der kein React mehr rendert

**Wo:** `components/ScrollProgress.tsx:14-35`.

**Was der Besucher erlebt:** Visuell fast unverändert — 2 px Rail oben. Aber er scrubbt perfekt statt mit 150 ms CSS-`width`-Transition hinterherzujagen. Die echte Änderung ist unsichtbar.

Heute: `setState` bei **jedem** Scroll-Event an der Wurzel des React-Trees, plus `document.body.scrollHeight` (Forced Layout) pro Frame, plus animiertes `width` (nicht kompositierbar).

```ts
// bar: transform-origin: left; will-change: transform;
animate(barRef.current!, {
  scaleX: [0, 1], ease: "linear",
  autoplay: onScroll({
    target: document.documentElement, enter: "top top", leave: "bottom bottom", sync: true,
  }),
})
```

**Effort:** S · **Reduced Motion:** Rail statisch via `utils.set` auf die korrekte Position — ein Fortschrittsindikator ist informativ, `return null` ist hier eigentlich falsch. Nebenbei: der Print-Selector `app/globals.css:246` zielt auf `.scroll-progress`, eine Klasse, die die Komponente nie setzt.

> **Regel:** Diese Umstellung geht in denselben PR wie *jede* neue scroll-getriebene Arbeit. Zwei Scroll-Systeme, die Layout-Thrash addieren, sind eine messbare INP-Regression — und Speed Insights misst bereits Produktionsverkehr (`app/layout.tsx:179`).

---

### 5. Annotation Wipe — Mono-Randnotizen, die mitgezeichnet werden

**Wo:** jede Section-Überschrift: `HomeContent.tsx:379/405/434`, `app/projects/page.tsx:14-23`, `app/skills/page.tsx:59`, `app/education/page.tsx:35/95/143`, `app/services/page.tsx:60/99`.

**Was der Besucher erlebt:** Jede Section bekommt eine Mono-Randnotiz, die in denselben 420 ms wie ihre Dimension-Linie von links nach rechts freigewischt wird: `§ 03 · SELECTED WORK · 09 ENTRIES`, `§ 05 · EXPERIENCE · 2019–PRESENT`, `§ 02 · SKILLS · 16 ACROSS 4 GROUPS`.

Das ist die **billigste mögliche Lösung für das grösste visuelle Problem der Seite.** Neun Oberflächen, die nur durch ihr `<h1>` unterscheidbar sind, tragen plötzlich je eine eigene gemessene Bildunterschrift. Und jeder Wert kommt aus Daten, die ohnehin auf der Seite sind — Ornament, das gleichzeitig Information ist.

```tsx
// <span class="annotate relative">…<i data-wipe aria-hidden
//   class="absolute inset-0 bg-background" style="transform-origin: right center"/></span>
animate("[data-wipe]", {
  scaleX: [1, 0], duration: 420, ease: "out(3)", delay: stagger(60),
  autoplay: onScroll({ enter: "bottom-=60 top", sync: "play", repeat: false }),
})
```

Transform-only Mask-Wipe, **niemals** `clip-path: inset()`-Strings interpolieren.

**Effort:** S · **Reduced Motion:** Wipe-Element bekommt `scaleX: 0` gesetzt, Text ist ab dem ersten Paint im DOM und lesbar.

> Zwei Geschmacksregeln: die Counts müssen **abgeleitet** sein (`projects.length`), nie getippt — „09 ENTRIES" neben sechs Zeilen ist schlimmer als keine Annotation. Und: nur der Inhalt variiert, nie das Timing. Kein `scrambleText` — das ist exakt das „junior showing off"-Register, das dieses Publikum bestraft.

---

### 6. Dimension Rule — der eine Reveal, der drei ersetzt

**Wo:** neu `components/motion/Reveal.tsx`. Ersetzt **beide** Scroll-Reveal-Wrapper: `components/PageLayout.tsx:15-45` (y:32, 0.7 s) und die private Kopie in `components/HomeContent.tsx:101-131` (y:20, 0.6 s) plus `StaggerChildren` (`:133-173`, y:16, 0.5 s). Greift auch auf `app/projects/page.tsx` (importiert `PageLayout`, aber nicht `Section` — die Liste hat heute *gar keinen* Reveal) und `app/projects/[slug]/page.tsx`.

**Was der Besucher erlebt:** Sections gleiten nicht mehr hoch. Die obere Linie der Section zieht sich links→rechts, wie eine Masslinie, die gesetzt wird; der Inhalt darunter löst sich an Ort auf, mit Opacity und 6 px Lift — nicht 32 px Weg. Es liest sich als Inhalt, der ausgemessen wird.

Das ist die **hebelstärkste einzelne Motion-Entscheidung im ganzen Dokument.** Neun Oberflächen nutzen dasselbe `border-t`-Zeilenmuster; die *Linie* zu animieren statt des Inhalts macht die meistwiederholte Komponente der Seite zu ihrer Signatur. Und die Reduktion von 32 px auf 6 px entfernt genau das, was ein Fade-up als Template lesen lässt.

```ts
createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)" } })
  .add((self) => {
    if (self.matches.reduceMotion) {
      utils.set("[data-rule]", { scaleX: 1 }); utils.set("[data-draw]", { opacity: 1, y: 0 }); return
    }
    createTimeline({ autoplay: onScroll({ enter: "bottom-=80 top", sync: "play", repeat: false }) })
      .add("[data-rule]", { scaleX: [0, 1], duration: 520, ease: "out(4)" }, 0)
      .add("[data-draw]", { opacity: [0, 1], y: [6, 0], duration: 420, ease: "out(3)" },
           stagger(28, { start: 90 }))
  })
```

`transform-origin: left center` lebt in der `.rule`-Klasse, nicht in JS.

Fixt nebenbei drei Bugs: drei Tunings derselben Geste, `PageLayout.tsx:55-58` (Titelblock ignoriert Reduced Motion, anders als die `Section` zehn Zeilen darüber im selben File), und `/projects` ohne Reveal.

**Effort:** M · **Reduced Motion:** `utils.set` auf Endzustand.

---

### 7. Ledger Stagger — Zeilenlisten kommen als Einträge, nicht als Block

**Wo:** `ProjectListItem` (Homepage + `/projects`), Experience-Zeilen (`HomeContent.tsx:439-469`, `app/experience/page.tsx:19-51`), Education (`app/education/page.tsx:35-69`, `app/about/page.tsx:112-142`), Skills (`app/skills/page.tsx:59-103`).

**Was der Besucher erlebt:** Im Hauptbuch kommen Linie und Index zuerst, der Eintrag wird dagegen geschrieben. Index und Basislinie landen ~40 ms vor dem Label, Zeilen steppen mit 28 ms. Offset ist **4 px horizontal, nie vertikal** — ein vertikaler Stagger eine vertikale Liste hinunter liest sich, als würde die ganze Liste durchhängen.

```ts
createTimeline({ autoplay: onScroll({ enter: "bottom-=60 top", sync: "play", repeat: false }) })
  .add("[data-row-index], [data-row-rule]",
       { opacity: [0,1], scaleX: [.2,1], duration: 260, ease: "out(3)" }, stagger(28, { from: "first" }))
  .add("[data-row-label]",
       { opacity: [0,1], x: [-4,0], duration: 320, ease: "out(3)" }, stagger(28, { start: 40 }))
```

28 ms statt der heute üblichen 50–60 ms, weil diese Listen 6–16 Zeilen lang sind. Bei `/skills` (16 Skills, 4 Kategorien) startet der Stagger **pro Kategoriegruppe neu**, sonst hat die Liste einen 450-ms-Schwanz und fühlt sich an, als würde sie laden.

**Effort:** S · **Reduced Motion:** derselbe Scope-Guard.

---

### 8. Nav Seat + Elevation Ramp

**Wo:** `components/Navigation.tsx:56-74` (Scroll-Listener), `:118-124` (der `scrolled ? "glass border-b shadow-sm"` Klassen-Swap), `:166-213` (AnimatePresence-Dropdown).

**Was der Besucher erlebt:** Statt bei exakt 50 px auf Glas umzuspringen, hebt sich die Nav kontinuierlich über die ersten 120 px: Background-Alpha schliesst von 60 % auf 94 %, die untere Hairline blendet ein, sie landet auf `--elev-nav`. Beim Runterscrollen zieht sie sich um ihre eigene Höhe zurück — **kritisch gedämpft, kein Overshoot.** Eine Nav, die federt, ist sofort billig.

```ts
const ramp = { v: 0 }
animate(ramp, {
  v: 1, ease: "linear",
  autoplay: onScroll({ target: "#nav-sentinel", enter: "top top", leave: "top+=120 top", sync: 0.2 }),
  onRender: () => {
    const el = navRef.current!
    el.style.setProperty("--nav-alpha", `${(60 + ramp.v * 34).toFixed(1)}%`)
    el.style.setProperty("--nav-edge",  ramp.v.toFixed(3))
  },
})
// Retract: createAnimatable, weil ein event-getriebener Wert retargeten muss
const bar = createAnimatable("[data-navbar]", { y: 260, ease: "out(3)" })
```

**Effort:** M · **Reduced Motion:** Das File hat heute **null** Reduced-Motion-Handling. Der ganze Block kommt in einen `createScope({ mediaQueries: { reduce } })`, Retract entfällt komplett.

> ⚠️ **Der Blur-Radius wird nicht animiert.** Fixe Blur-Radius, gerampte Alpha. Eine `backdrop-filter`-Blur-Radius-Rampe re-rasterisiert den Blur bei neuem Radius in jedem Frame, über volle Breite, auf einem Sticky-Element über scrollendem Content — die schlechteste Paint-Form, die der Browser kennt. Dazu: `@supports`-Gate, kein Blur unter 768 px, `prefers-reduced-transparency`-Fallback.

---

### 9. ★ Roadmap Draw — die Gantt-Chart, die sich endlich zeichnet

**Wo:** `components/certificates/CertificatesRoadmap.tsx:152-214` (Monatsgrid `:112-131`, Phasenbalken `:182-197`, Today-Linie `:198-208`), gerendert auf `app/education/page.tsx:143-152`.

**Was der Besucher erlebt:** Monatsspalten ticken links nach rechts ein, **bevor** die Balken kommen — die Skala existiert, bevor die Daten darauf geplottet werden. Dann fahren die Phasenbalken im 70-ms-Abstand aus ihrer Startposition aus. Die Today-Linie zeichnet sich von oben nach unten durch sie hindurch und setzt sich bei 55 % Opacity. Die Pille landet zuletzt.

Höchster Payoff pro Codezeile auf der ganzen Seite: die Geometrie ist bereits berechnet, das Element hat bereits `overflow-hidden`, und die Überschrift der Komponente sagt wörtlich „N certificates in motion" (`:104`), während nichts sich bewegt.

```ts
createTimeline({
  autoplay: onScroll({ target: root.current!, enter: "bottom-=80 top", sync: "play", repeat: false }),
})
  .add(".month-col",       { opacity: [0,1], duration: 160 }, stagger(22))
  .add("[data-phase-mask]", { x: ["0%","100%"], duration: 620, ease: "out(4)" }, stagger(70, { start: 120 }))
  .add("[data-today-line]", { scaleY: [0,1], opacity: [0,.55], duration: 380, ease: "out(3)" }, "<<+=180")
  .add("[data-today-pill]", { opacity: [0,1], y: [-4,0], duration: 220, ease: "out(3)" }, "<")
```

> ⚠️ **Kein `scaleX` auf dem Balken.** Ich habe es verifiziert: `CertificatesRoadmap.tsx:194-196` enthält `<span className="truncate">{span} mo · {cert.category…}</span>` *im* Balken. Horizontales Skalieren würde dieses Label 620 ms lang stauchen und strecken. Stattdessen: eine deckende Maske in `--well`-Farbe über dem Balken, innerhalb des bestehenden `overflow-hidden`-Tracks, per `x` verschoben.

> Timeline-Positionen: `'<<+=180'` ist 180 ms nach dem **Start** des vorigen Elements, `'<'` ist dessen **Ende**. Leicht zu verwechseln, hier mit sehr unterschiedlicher Choreografie.

**Effort:** M · **Reduced Motion:** `utils.set("[data-phase-mask]", { x: "100%" })` — Balken sind einfach schon gezeichnet.

> 🚫 **Datenblocker:** `scripts/seed-data.ts` exportiert kein `certificates`-Array (verifiziert). Auf einer frisch geseedeten DB rendert diese Komponente **nichts**. Ohne echte Zertifikate im Seed nicht bauen — eine animierte leere Ablage ist schlimmer als eine statische.

---

### 10. ★ Career Plot — der Hero wird zur gezeichneten Karriere-Linie

**Wo:** `components/HomeContent.tsx:239-335`, neue Client-Komponente `components/hero/CareerPlot.tsx`, gespeist aus dem `experience`-Prop, das `app/page.tsx:16-22` ohnehin schon durchreicht.

**Was der Besucher erlebt:** Der Hero hört auf, ein Name und das Wort „Scroll" zu sein. Drei Mono-annotierte Zeilen setzen sich aus einer Clip-Maske, und darunter zieht eine Datum-Linie über die volle Breite von 2019 nach 2026, mit vier Knoten, die landen, während sie passiert wird: **Bettermann · Credit Suisse (ISS) · InnoForce · Telsonic.** Der aktuelle Knoten bekommt den Teal-Signalpunkt. Das Segment nach heute läuft mit 45 % Gewicht weiter zu einem beschrifteten Endpunkt: `SEP 2026 · BSc DATA SCIENCE, ZHAW`.

Nach 1.2 Sekunden kennt der Besucher den ganzen Bogen — ohne zu scrollen. Das ist die eine Änderung, die den 90-Sekunden-Test von Durchfallen auf Bestehen dreht. Und sie bringt die ZHAW-Transition an die Oberfläche, die heute ausschliesslich in `lib/ai/context.ts:13` steht und einen Besucher nur über das Chat-Widget erreicht.

```ts
scope.current = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)" } })
  .add(async (self) => {
    const { lines } = splitText("[data-hero-line]", { lines: { wrap: "clip" }, accessible: true })
    if (self.matches.reduceMotion) {
      utils.set([...lines, ".plot-node", ".plot-label"], { opacity: 1, y: 0, scale: 1 })
      utils.set(svg.createDrawable(".plot-line"), { draw: "0 1" }); return
    }
    await document.fonts.ready                       // display:swap — sonst misst der Split den Fallback
    const DRAW = 900
    createTimeline({ defaults: { ease: "out(3)" } })
      .add(lines, { y: ["110%","0%"], duration: 620 }, stagger(70))   // KEIN opacity auf dem LCP-Node
      .add(svg.createDrawable(".plot-line"),
           { draw: ["0 0","0 1"], duration: DRAW, ease: "linear" }, "<<+=220")
      // Knoten-Delay aus der DATUMSPOSITION, nicht aus festem Stagger:
      .add(".plot-node", { scale: [0,1], opacity: [0,1], duration: 260,
             ease: spring({ bounce: .2, duration: 320 }) },
           (el) => 220 + DRAW * Number((el as HTMLElement).dataset.t))   // data-t = 0..1 auf der Achse
      .add(".plot-future", { opacity: [0,.45], duration: 400 }, "<+=120")
      .init()
  })
```

> ⚠️ **Choreografie-Korrektur gegenüber dem Vorschlag:** Die Linie zeichnet **linear**, und jeder Knoten-Delay wird aus seiner Datumsposition auf der Achse abgeleitet. Ein fixer `stagger(115)` gegen eine `inOut(2)`-Kurve bei nicht-äquidistanten Anstellungsdaten (2019 / 2021 / 2022 / 2025) bedeutet, dass die Knoten *nicht* landen, wenn die Linie sie erreicht — das ist der ganze Punkt des Moments, und ohne diesen Fix liest es sich als zwei unabhängige Animationen auf einer Timeline.

> ⚠️ **`svg.createDrawable` treibt `stroke-dasharray`** — es kollidiert also mit einem optisch gestrichelten Future-Segment. Das Zukunfts-Segment durchgehend zeichnen und die Strichelung per Klasse `onComplete` setzen, oder maskieren.

**Effort:** L · **Staging:** In Phase 2 als **statisches SVG** shippen (aus dem `experience`-Prop gerendert). Der Inhaltsgewinn ist der ganze Wert; die Animation kommt in Phase 3. So sitzt kein `splitText` + `createDrawable` + responsives SVG-Layout gleichzeitig auf dem LCP-Surface, bevor der Rest steht.

**Reduced Motion:** Plot vollständig gezeichnet, alle Knoten gesetzt.

---

### 11. ★ Spine — die eine scroll-gebundene Bewegung, auf `/experience`

**Wo:** `app/experience/page.tsx:19-55`, umgebaut von einer flachen Zeilenliste zu einer datierten Vertikal-Achse mit Jahresmarken (2019 · 2021 · 2022 · 2025 · now).

**Was der Besucher erlebt:** Eine 1-px-Linie läuft links neben der Liste herunter, mit Jahresmarken. Der gefüllte Teil dieser Linie ist mit gedämpftem Nachlauf an den Scroll gebunden — sie füllt sich, während man die Laufbahn hinunterliest. Der `current: true`-Knoten ist das einzige Teal auf der Seite.

Das ist die **einzige** gescrubbte Animation im System, und sie verdient die Ausnahme, weil sie funktional ist: ein Lesefortschrittsindikator, der zufällig auch eine Zeitachse ist. Sie löst ausserdem ein strukturelles Problem, das kein Styling löst — `/experience` ist heute die Homepage-Experience-Section mit Bullets, identisches Markup inklusive.

```ts
// .spine-fill { transform-origin: top center; }  ← CSS
animate(".spine-fill", {
  scaleY: [0, 1], ease: "linear",
  autoplay: onScroll({ target: ".spine", enter: "center bottom", leave: "bottom center", sync: .35 }),
})
animate(".spine-tick", {
  opacity: [.35, 1], scaleX: [1, 1.6], duration: 200, ease: "out(3)",
  autoplay: onScroll({ enter: "center center", sync: "play" }),
})
```

**Effort:** M · **Reduced Motion:** `scaleY: 1`, alle Ticks aktiv.

> **Bedingung:** Nur zusammen mit Katalog-Item #4 (ScrollProgress-Rewrite) shippen. Ersetzt gleichzeitig die drei `animate-ping`-Verfügbarkeitspunkte (`HomeContent.tsx:311/450`, `experience/page.tsx:29`) — das meistgeklonte „available for work"-Klischee im Web, das ausserdem unabhängig von der Motion-Präferenz pulsiert.

---

### 12. Well Focus — Formularfelder als gefräste Kanäle

**Wo:** `components/ContactForm.tsx:246, 268, 285, 300-308`, `app/pitch/page.tsx:130, 168-178`.

**Was der Besucher erlebt:** Jedes Input, Textarea und Select-Trigger wird ein vertiefter Kanal — **die entgegengesetzte Polarität zum Button.** Man sieht auf einen Blick, worein man tippt und was man drückt. Bei Focus vertieft sich der Well leicht und eine 2-px-Akzentschiene wischt an der Unterkante von links nach rechts und hält.

Das ist die einzige Konversionsfläche der Seite — alles trichtert auf eine qualifizierte E-Mail-Anfrage. Sie bekommt die meiste Material-Aufmerksamkeit.

```ts
$w.addEventListener("focusin", () => {
  animate($rail,  { scaleX: [0,1], ease: spring({ bounce: .10, duration: 380 }) })
  animate($shade, { opacity: [0,1], duration: 180, ease: "out(2)" })
})
```

**Effort:** M · **Reduced Motion:** Schiene sofort auf `scaleX: 1`.

> ⚠️ **Barrierefreiheit ist hier das ganze Risiko.** Die Schiene ist dekorativ und `aria-hidden` — sie ist **niemals** der Focus-Indikator. Der echte Ring bleibt auf dem Input, 2 px, ≥3:1 fokussiert-vs-unfokussiert (WCAG 2.4.13). Und: das doppelte Alpha (`globals.css:25` + `:122`) muss vorher weg, sonst ist Focus auf jedem Feld unsichtbar. Placeholder-Kontrast gegen `--well` neu prüfen, nicht gegen `--background`.

---

### 13. Receipt — der Erfolgsmoment, gezeichnet

**Wo:** `components/ContactForm.tsx:373-399` (heute ein blankes `{showSuccessModal && …}` ohne jede Transition) und `:203-208` (Validierungsfehler, die einspringen und Layout verschieben).

**Was der Besucher erlebt:** Das Panel löst sich in 240 ms auf, ein SVG-Rahmen strichelt sich darum, ein Häkchen zeichnet sich, dann steigt die Bestätigung mit der 24-h-Zusage ein. Dieselbe Sprache wie Career Plot und Roadmap — das Letzte, was ein Lead sieht, ist dieselbe Hand wie das Erste.

```ts
createTimeline({ defaults: { ease: "out(3)" } })
  .add(".receipt", { opacity: [0,1], scale: [.97,1], duration: 240 })
  .add(svg.createDrawable(".receipt-frame"), { draw: ["0 0","0 1"], duration: 520, ease: "inOut(2)" }, "<<+=80")
  .add(svg.createDrawable(".receipt-check"), { draw: ["0 0","0 1"], duration: 340 }, "<-=120")
  .add(".receipt-copy", { opacity: [0,1], y: [6,0], duration: 260 }, stagger(40))
  .init()
```

Ersetzt `components/CheckmarkAnimation.tsx` plus `@dotlottie/player-component` plus `public/animations/checkmark.lottie` — eine echte Dependency- und Asset-Löschung, die nebenbei fixt, dass das Lottie heute für **jeden** abspielt, auch bei Reduced Motion.

Derselbe Zweizeiler fixt die Validierungsfehler: permanenter `min-height: 1.125rem`-Slot reservieren, dann `animate(err, { opacity: [0,1], y: [-3,0], duration: 140 })`. **Niemals `height` animieren** — das ist CLS im einzigen Konversionsfunnel.

**Effort:** M · **Reduced Motion:** `utils.set` auf Endzustand, Modal erscheint sofort. Focus wandert im `onComplete` der Open-Timeline auf den Close-Button, nicht davor — sonst kündigt ein Screenreader ein Panel an, das noch animiert. Focus-Trap aus `FullscreenMenu.tsx:56-70` kopieren.

---

### 14. Tally — Zahlen zählen hoch (nur zusammen mit dem Copy-Fix)

**Wo:** `HomeContent.tsx:358-371` (Hero-Metriken), `app/education/page.tsx:95-116` (Credentials-Strip), `app/projects/[slug]/page.tsx:223-235` (nummerierte Results).

**Was der Besucher erlebt:** Zahlen zählen beim Eintreten von null hoch, 900 ms, hart ausklingend — 90 % der Strecke im ersten Drittel. Eine Zählung, kein Spielautomat.

```ts
const d = { v: 0 }
animate(d, {
  v: to, duration: 900, ease: "out(4)", modifier: utils.round(0),
  onRender: () => { el.textContent = `${d.v}${suffix}` },
  autoplay: onScroll({ enter: "bottom-=60 top", sync: "play", repeat: false }),
})
```

**Effort:** S · **Reduced Motion:** `animate()` überspringen — das HTML enthält bereits den Endwert.

> 🚫 **Inhaltliche Vorbedingung, nicht Caveat.** Eine Zahl zu animieren ist eine Beweisgeste. Auf Füllmaterial angewendet macht sie das Füllmaterial zum prominentesten Element der Seite. „9+ Projects Delivered", wo 9 exakt die Anzahl geseedeter Zeilen ist, und „5+ Technologies" sind die schwächste Copy auf der Seite. **Erst ersetzen** durch belegbare Zahlen mit Mono-Herkunftsangabe: `150+ PROPERTIES · CREDIT SUISSE`, `4 EMPLOYERS SINCE 2019`, `2× EFZ`. Dann animieren.
>
> Technisch: `Number.isFinite`-Guard (Werte wie „C1" oder „Native" bleiben statisch), `font-variant-numeric: tabular-nums`, Endwert im SSR-HTML, `min-width` in `ch`. Nie das LCP-Element.

---

## 4. Design Tokens — `app/globals.css`

Ersetzt die `:root`/`.dark`-Blöcke (Zeilen 6–75) und die Custom-Utilities in `@layer base` (120–241).

```css
/* ══════════════════════════════════════════════════════════════
   DATUM — Strichhierarchie statt Elevation
   ══════════════════════════════════════════════════════════════ */

:root {
  /* ── Grund. Light bleibt hell und editorial — kein Re-Base nötig,
        weil wir keine Elevation brauchen. ── */
  --background: oklch(0.98 0.003 90);
  --foreground: oklch(0.13 0.010 260);

  /* ── Strichhierarchie: das gesamte Tiefensystem ── */
  --rule-hair:   oklch(0.90  0.005 90);   /* Plan-Grid, nie strukturell        */
  --rule:        oklch(0.855 0.006 90);   /* Trenner, Rahmen        ~1.6:1     */
  --rule-strong: oklch(0.66  0.008 90);   /* Masslinien, Hover, Control-Kante
                                              ~3.1:1 → erfüllt WCAG 1.4.11    */
  --stroke-hair: 0.5px;
  --stroke-rule: 1px;
  --stroke-dim:  2px;
  --grid-minor:  8px;
  --grid-major:  64px;

  /* ── Farbe. Ein Akzent, rationiert auf „gemessen oder aktuell wahr". ── */
  --annotation: oklch(0.44 0.012 260);    /* Mono-Randnotizen       ~7.2:1     */
  --signal:     oklch(0.46 0.160 160);    /* war 0.50 → 4.96:1; jetzt ~5.8:1,
                                              hält auch auf --card/--muted     */

  /* ── shadcn-Aliase, damit nichts bricht ── */
  --primary: var(--signal);
  --primary-foreground: var(--background);
  --border: var(--rule);
  --input:  var(--rule-strong);           /* Control-Kanten brauchen 3:1       */
  --muted-foreground: var(--annotation);
  --ring:   var(--signal);                /* Alpha ENTFERNT — siehe unten      */
  --card: var(--background);
  --popover: var(--background);
  --radius: 0.375rem;                     /* Controls; alles Gezeichnete = 0   */

  /* ── Der EINZIGE geborgte Spatial-Token. Nav + Chat-Panel. Sonst nichts. ── */
  --elev-nav: 0 1px 2px -1px oklch(0 0 0 / .06), 0 4px 14px -6px oklch(0 0 0 / .05);
  --nav-alpha: 60%;

  /* ── Motion ── */
  --ease-plot:  cubic-bezier(0.23, 1, 0.32, 1);
  --ease-morph: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-expo:  cubic-bezier(0.16, 1, 0.3, 1);   /* bestehende Kurve, bleibt   */
  --dur-press:  120ms;  --dur-hover: 140ms;  --dur-menu: 180ms;
  --dur-page:   220ms;  --dur-draw:  520ms;  --stagger-row: 28ms;

  /* ── Layout-Tokens, die heute dupliziert sind ── */
  --col-label: 220px;   /* war 200/220/250 an fünf Stellen                     */
  --container: 1200px;  /* entfernt die calc()-Duplizierung HomeContent:305,322 */

  /* ── z-Skala statt ad-hoc 1/10/30/40/50/60/100 ── */
  --z-base: 0; --z-raised: 10; --z-sticky: 30; --z-grid: 1;
  --z-nav: 50; --z-overlay: 80; --z-modal: 90; --z-toast: 100;
}

.dark {
  /* war oklch(0.09 0.005 260) = #020203, Luminanz 0.00073 — blueprint-grade
     statt Void; auch die Voraussetzung dafür, dass Hairlines überhaupt sitzen */
  --background: oklch(0.155 0.008 255);
  --foreground: oklch(0.95  0.005 90);

  --rule-hair:   oklch(0.240 0.008 255);
  --rule:        oklch(0.300 0.008 255);
  --rule-strong: oklch(0.460 0.010 255);   /* ~3.2:1 auf der neuen Basis       */

  --annotation:  oklch(0.680 0.012 255);   /* war 0.55 = 4.27:1 → AA-FAIL      */
  --signal:      oklch(0.780 0.140 160);

  --elev-nav: 0 1px 2px -1px oklch(0 0 0 / .5), inset 0 1px 0 oklch(1 0 0 / .05);
}

@theme inline {
  --color-rule:        var(--rule);
  --color-rule-strong: var(--rule-strong);
  --color-rule-hair:   var(--rule-hair);
  --color-annotation:  var(--annotation);
  --color-signal:      var(--signal);
  --shadow-nav:        var(--elev-nav);
  --radius-2xl: calc(var(--radius) + 8px);  /* war still 1rem = identisch zu xl */

  /* ══ BUGFIX. Heute stehen hier literale Familiennamen (Zeilen 115-117),
     während layout.tsx:17-39 --font-inter / --font-space-grotesk /
     --font-jetbrains-mono deklariert. next/font self-hostet unter gehashten
     Familien, die NUR über diese Variablen erreichbar sind. Ohne diesen Fix
     rendert die Seite für jeden Besucher in ui-sans-serif. ══ */
  --font-sans:    var(--font-inter),          ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-space-grotesk),  ui-sans-serif, system-ui, sans-serif;
  --font-mono:    var(--font-jetbrains-mono), ui-monospace, monospace;
}

/* ── @layer components, NICHT @layer base. Alle sechs bestehenden Customs
      liegen heute in base (120-241) — deshalb verlieren sie gegen bg-*/
/*    und border-*-Utilities und können keine hover:/md:-Varianten nehmen. ── */
@layer components {
  .plan-grid {                              /* ersetzt .grain-overlay          */
    background-image:
      linear-gradient(to right,  var(--rule-hair) var(--stroke-hair), transparent var(--stroke-hair)),
      linear-gradient(to bottom, var(--rule-hair) var(--stroke-hair), transparent var(--stroke-hair));
    background-size: var(--grid-major) var(--grid-major);
    /* KEIN mask-image auf einem Page-Root-Wrapper — mask erzeugt einen
       backdrop-root und würde den Nav-Blur lautlos killen. Edge-Fade als
       separates Overlay-Element, oder Grid nur innerhalb von <main>. */
  }

  .ruled {                                  /* ersetzt .glass ausser in der Nav */
    border: var(--stroke-rule) solid var(--rule);
    background: transparent;
    border-radius: 0;
  }

  .rule     { height: var(--stroke-rule); background: var(--rule);
              transform-origin: left center; }
  .rule-dim { height: var(--stroke-dim);  background: var(--rule-strong); }

  .annotate { font-family: var(--font-mono); font-size: .6875rem;
              letter-spacing: .14em; text-transform: uppercase;
              font-variant-numeric: tabular-nums lining-nums;
              color: var(--annotation); }
  .tabular  { font-variant-numeric: tabular-nums lining-nums; }

  /* Die EINE durchscheinende Fläche im ganzen System. */
  .chrome { background: var(--background);
            border-bottom: var(--stroke-rule) solid var(--rule);
            box-shadow: var(--elev-nav); }
  @supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    @media (min-width: 768px) {
      .chrome {
        background: color-mix(in oklab, var(--background) var(--nav-alpha), transparent);
        -webkit-backdrop-filter: blur(10px) saturate(1.35);
                backdrop-filter: blur(10px) saturate(1.35);   /* FIXER Radius */
      }
    }
  }
  @media (prefers-reduced-transparency: reduce) {
    .chrome { background: var(--background); backdrop-filter: none; }
  }
}

@layer base {
  /* war: * { @apply border-border outline-ring/50 } — halbierte einen Ring,
     dessen Token bereits /0.3 eingebacken hatte → ~15% Alpha, ~1.14:1 */
  * { @apply border-rule outline-ring; }

  /* .focus-ring ist heute definiert und NULL-mal verwendet. Jetzt global —
     outline statt box-shadow, damit .ruled-Elevation nicht überschrieben wird. */
  :where(a, button, [role="button"], input, textarea, select, summary):focus-visible {
    outline: 2px solid var(--signal);
    outline-offset: 2px;
    border-radius: 2px;
  }
}

/* ── Motion-Grundvertrag. HTML kommt vollständig; JS opted sich ein. ── */
html.js-motion:not(.reduce-motion) [data-draw] { opacity: 0 }
html.js-motion:not(.reduce-motion) [data-rule] { transform: scaleX(0) }
/* Auf dem LCP-Element NUR transform, nie opacity: */
html.js-motion:not(.reduce-motion) [data-hero-line] { transform: translateY(110%) }

/* ── Fehlt heute komplett in globals.css. Schliesst die CSS-Hälfte jeder
      Reduced-Motion-Lücke in einem Edit. ── */
@media (prefers-reduced-motion: reduce) {
  html [data-draw]      { opacity: 1 }
  html [data-rule]      { transform: none }
  html [data-hero-line] { transform: none }
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}

/* ── Hover darf auf Touch nicht hängenbleiben ── */
@media (hover: hover) and (pointer: fine) {
  .row:hover .rule { background: var(--rule-strong); height: var(--stroke-dim); }
}
```

**Gelöscht:** `--chart-1..5` in beiden Blöcken (recharts hat null Imports). `.reveal-up` + Keyframe (`:227-240`, null Verwendungen). `.link-slide` (`:195-213`, ein Consumer, Duplikat von `.link-underline`). `.text-balance` (`:141-143`, redefiniert ein Tailwind-v4-Built-in). Der tote Print-Selector `.scroll-progress` (`:246`). `.grain-overlay` (`:146-160`). `.glass` — von ~30 Verwendungen auf **null**, ersetzt durch `.ruled` und `.chrome`.

**Ausserdem:** `<meta name="theme-color">` in `app/layout.tsx:154` ist ein handgepicktes `#1a8a6a`, das nie zur berechneten `--primary` passte — auf den Token zeigen lassen. `::selection` (`:131/:136`) hardcodet den Akzent statt den Token zu referenzieren.

---

## 5. anime.js v4 — Integrationsplan

### Install

```bash
npm i animejs@^4.5.0      # Types sind gebündelt, kein @types/ nötig. MIT.
npm rm gsap recharts embla-carousel-react tailwindcss-animate geist autoprefixer
rm styles/globals.css     # 124 Zeilen v0-Scaffold-Duplikat mit anderer Palette,
                          # von nichts importiert, eine Falle für jeden Token-Edit
```

`gsap@^3.14.2` hat **null** Imports (verifiziert: grep nach `from "gsap` / `ScrollTrigger` trifft nur `DESIGN_BRIEF_V2.md` und die Lockfiles). Sofort löschen, unabhängig von allem anderen. Dasselbe für `recharts`, `embla-carousel-react`, `geist`, `autoprefixer` und `tailwindcss-animate` (das ist das Tailwind-**v3**-Plugin; dieses Projekt ist v4 und importiert `tw-animate-css`).

Billiger Zwischengewinn, unabhängig: `experimental.optimizePackageImports` in `next.config.mjs` — die Datei setzt heute überhaupt keine Bundler-Optionen (`:2-41` ist nur eslint/typescript/headers).

### Das React-Pattern für diesen Codebase

Ein Hook, überall derselbe. Erzwingt die sichere Cleanup-Form.

```ts
// components/motion/useAnimeScope.ts
"use client"
import { useEffect, useRef, type RefObject } from "react"
import { createScope, type Scope } from "animejs"

export function useAnimeScope<T extends HTMLElement>(
  setup: (self: Scope) => void,
  deps: unknown[] = [],
): [RefObject<T | null>, RefObject<Scope | null>] {
  const root = useRef<T>(null)
  const scope = useRef<Scope | null>(null)
  const setupRef = useRef(setup); setupRef.current = setup

  useEffect(() => {
    if (!root.current) return
    scope.current = createScope({
      root,                                   // das REF-OBJEKT, nicht root.current
      mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)" },
    }).add((self) => setupRef.current(self))
    return () => { scope.current?.revert(); scope.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return [root, scope]
}
```

Warum `createScope` und nicht direkte `animate()`-Calls:
1. Jeder Selector innerhalb des Callbacks ist auf `root` gescopet — `utils.$('.rule')` leckt nie in eine andere Komponente.
2. Ein `scope.revert()` im Cleanup reisst **alles** ab — überlebt StrictMode-Doppelmount und Unmount.
3. `mediaQueries` bekommt pro Query einen Live-`change`-Listener und ruft `refresh()`. Reduced Motion zur Laufzeit umschalten funktioniert ohne Reload.
4. `self.add('name', fn)` registriert Methoden auf `scope.methods`, aufrufbar aus React-Handlern.

**Fallen, verifiziert:**
- `createScope({ root })` — **nie** `root.current`. Scope entpackt `.current` selbst.
- Methoden **ausserhalb** von `setState`-Updatern aufrufen. Updater können doppelt laufen (StrictMode, Concurrent). Das offizielle Doc-Beispiel macht das falsch.
- `revert()` setzt `methods = {}`. Immer `scope.current?.methods?.foo?.(…)`.
- Es gibt **keinen** Default-Export und kein globales `anime`. `import anime from 'animejs'` ist v3 und bricht.
- v3→v4-Renames, die still nichts tun: `easing`→`ease`, `value`→`to`, `begin/complete`→`onBegin/onComplete`, `endDelay`→`loopDelay`, `round: n`→`modifier: utils.round(n)`.
- Es gibt **kein** `createScrollObserver`. Die einzige Factory heisst `onScroll()`.

### SSR / Client-Boundary

anime.js v4 ist **import-safe auf dem Server** (`isBrowser`-Guards in `core/consts.js`). Kein `dynamic(..., { ssr: false })` nötig — und in App Router ist das in einer Server Component ohnehin illegal.

Aber: **`animate()` auf dem Server aufzurufen wirft.** Also:
- Top-Level-Imports: fine.
- Alle Calls: in `useEffect` oder Event-Handlern. Nie im Render, nie im Modul-Scope.
- Jede Komponente, die anime.js nutzt: `"use client"`. Der Boundary liegt in diesem Projekt ohnehin schon sehr hoch.
- Server-Pages wie `app/projects/[slug]/page.tsx` (298 Zeilen) **nicht** konvertieren — dünner Client-`<Reveal>`-Wrapper mit `children` als Props, Markup bleibt server-gerendert.

### Lenis-Bridge: **keine.**

Das ist die wichtigste Erkenntnis und sie spart Arbeit. anime.js' `ScrollObserver` hängt einen echten nativen Listener (`addEventListener('scroll', …)`) und liest `win.scrollY`. Lenis treibt **echten** nativen Scroll — `setScroll()` ruft `wrapper.scrollTo({ top, behavior: 'instant' })` mit `wrapper = window`. Also ändert sich `window.scrollY` wirklich, native Scroll-Events feuern wirklich, `onScroll()` beobachtet sie mit **null Konfiguration**.

Das ist fundamental anders als locomotive-scroll v4 (transform-basiert), weshalb GSAP dort einen `scrollerProxy` braucht. Lenis 1.3.18 enthält null Treffer für `transform|translate3d|willChange`.

**Also: kein `lenis.on('scroll')`-Bridge.** Das GSAP-Rezept zu kopieren wäre ein zusätzlicher Per-Frame-Callback mit Layout-Read — eine echte Performance-Regression.

Optional, nur falls je ein Ein-Frame-Lag sichtbar wird: `engine.useDefaultMainLoop = false` plus `engine.update()` in Lenis' RAF. **Wenn**, dann zwingend mit `engine.useDefaultMainLoop = true; engine.wake()` im Cleanup — `SmoothScroll.tsx:18-22` returned bei Reduced Motion früh, die RAF-Schleife startet also nie, und ein dort stehengebliebenes `false` würde jede Animation site-weit einfrieren.

**Was wir an Lenis ändern:** `duration: 1.2` → **0.8** (`SmoothScroll.tsx:30`). Eine Zeile. 1.2 s liest sich für einen technischen Leser als Kampf gegen das OS; 0.8 s liest sich als Dämpfung.

Und in den `data-lenis-prevent`-Containern (`ChatMessages.tsx:63`, `SkillPopover.tsx:85`, `ModelCombobox.tsx:78`) scrollt nativ — wenn dort je ein `onScroll({ container })` hinkommt, muss das Element explizit übergeben werden.

### framer-motion: gestaffelter Rückbau — und sei ehrlich, dass er gestaffelt ist

Sechs Import-Stellen: `Navigation.tsx:7`, `FullscreenMenu.tsx:7`, `PageLayout.tsx:5`, `HomeContent.tsx:6`, `chat-widget/ChatWidget.tsx:4`, `project-deepdive/DeepDiveButton.tsx:4`.

**Welle 1 — Enter/Scroll-Reveal, 1:1-Mapping, reiner Gewinn:**
`PageLayout.Section:15-45` · `HomeContent.Section:101-131` · `StaggerChildren:133-173` · die drei Hero-Clip-Path-Blöcke `:256-334` · der Page-Fade `:230-234` · der Titel-Fade `PageLayout.tsx:55-58`. Alles `useInView` + `initial/animate` ohne Exit → `onScroll()` + `stagger()`. Danach ist framer-motion aus den Shells von `/about`, `/experience`, `/projects`, `/skills`, `/education`, `/privacy`, `/contact` raus.

**Welle 2 — die vier Exit-Stellen, Handarbeit:**
`Navigation.tsx:166-213` (More-Dropdown) · `FullscreenMenu.tsx:92-195` (die ~700 ms Staggered-Overlay, die heute Reduced Motion komplett ignoriert) · `ChatWidget.tsx:72-80` · `DeepDiveButton.tsx:87-93`. anime.js hat kein `AnimatePresence`-Äquivalent, jede braucht eine eigene „mounted bis Exit aufgelöst"-State-Machine:

```ts
const close = () => animate(panelRef.current, {
  opacity: 0, scale: .98, y: 8, duration: 140, ease: "out(2)",
  onComplete: () => setMounted(false),      // Unmount ERST nach dem Exit
})
```

> **Wichtig:** `ChatWidget` hängt in `app/layout.tsx:175` und `AI_FEATURES_ENABLED` ist `true`. Bis diese eine Komponente konvertiert ist, lädt framer-motion auf **jeder** Route, inklusive `/login` und `/pitch`. **Eine Teilmigration spart exakt null Kilobyte** und liefert stattdessen eine zweite RAF-Engine aus. Nicht auf halbem Weg stehenbleiben.

**Die ehrliche Bilanz:** gemessen liegt eine realistische anime.js-Import-Fläche (`animate` + `createScope` + `onScroll` + `stagger` + `createTimeline` + `svg` + `text` + `utils`) bei **~26.7 kB gzip** gegen framer-motions **~30–45 kB**. Das ist ungefähr ein Nullsummenspiel. **Der Kauf ist Fähigkeit, nicht Payload:** SVG-Stroke-Drawing, gedämpftes Scroll-Scrubbing, zeilengenaues Text-Splitting, Scope-Level-Reduced-Motion mit Live-Listenern — nichts davon kann framer-motion nativ. Plus eine RAF-Engine weniger, sobald Welle 2 durch ist. Rechtfertige die Umstellung damit, oder mach sie nicht.

Tree-Shaking funktioniert aus dem Haupt-Entry: `animejs/animation` misst byte-identisch zu `{ animate } from 'animejs'`. Also einfach Named Imports aus `'animejs'`. Aber **nie** `import * as anime` — 42.5 kB gzip statt 13.4.

### Reduced-Motion-Strategie (drei Schichten)

1. **CSS-Netz** — der globale `@media (prefers-reduced-motion: reduce)`-Block oben. Schliesst in einem Edit jedes `animate-ping` (`HomeContent.tsx:311/450`, `experience:29`), `animate-spin` (`ContactForm.tsx:361`, `pitch:197`), `animate-bounce` (`ChatMessages.tsx:24`), `animate-pulse` (`ui/skeleton.tsx:7`) und alle shadcn `animate-in/out`.
2. **Scope-`mediaQueries`** — pro Animation, mit Live-`change`-Listener. Ersetzt die drei One-Shot-`matchMedia().matches`-Reads.
3. **`utils.set` auf den Endzustand** — nicht „nichts tun", sondern „die fertige Zeichnung".

---

## 6. Roadmap in drei Phasen

### Phase 1 — Fundament & Wahrheit · ~5–7 Arbeitstage

Diese Phase ist unter *jeder* Design-Richtung eindeutig positiv und ist selbst der Kompetenzbeweis, den die Seite behauptet.

**Sicherheit & Inhalt (Tag 1–2)**
- `applicationDocuments/` aus Git-History entfernen, Repo-Sichtbarkeit prüfen, `.gitignore`.
- CV nach `public/documents/` legen. `privacyContent` im `site_settings`-Singleton schreiben (bis dahin: den Link in `ContactForm.tsx:345-352` konditional machen).
- `prompts.ts:56` „her" → „his". Cloudflare-Referenzen (`:26`, `:39`) raus.
- `package.json:2` `my-v0-project` umbenennen. README neu schreiben — die aktuelle Version schreibt den Codebase einem Generator zu, für exakt das Publikum, das ihn klont.
- Elf `"#"`-Links: echten Link oder Feld leer + Button ausblenden.
- `certificates` in `scripts/seed-data.ts` seeden. Ohne das ist Katalog-Item #9 tot.
- Hero-Metriken durch belegbare Zahlen ersetzen.

**Korrektheit (Tag 3–4)**
- Die drei `next/font`-Variablen fixen. **Drei Zeilen, und die Seite rendert zum ersten Mal in Inter/Space Grotesk/JetBrains Mono.**
- Inter Weight 600 nachladen (`font-semibold` an `ProjectListItem.tsx:55`, `HomeContent.tsx:455/500/540` ist heute synthetisiert). JetBrains Mono 500 dazu.
- Globaler Reduced-Motion-Block.
- Focus-Ring: Doppel-Alpha entfernen, `:focus-visible` global.
- Dark `--muted-foreground` von 4.27:1 hoch.
- `gsap` + 5 Deps + `styles/globals.css` löschen.
- **LCP-Fix**: `html.js-motion`-Inline-Script, From-States nach CSS, `opacity` vom Hero-`<h1>` runter.
- `<Navigation />` nach `app/layout.tsx` heben. Drei Nav-Bäume auf eine Quelle.

**Erste anime.js-Items (Tag 5–7)**
- Install + `useAnimeScope`.
- Katalog **#1** Instrument Off · **#2** Ruled Hover · **#3** Sheet Change · **#4** Scroll Ruler.
- Token-Block ausrollen, `.glass` → `.ruled`/`.chrome`, `.grain-overlay` → `.plan-grid`.
- Lenis auf 0.8 s.

**Ergebnis nach Phase 1:** Die Seite paintet ohne JS, hat sichtbare Fonts, besteht axe, hat eine echte Reduced-Motion-Story, keinen toten Link — und fühlt sich beim Navigieren zusammenhängend an. Ein Hiring Manager, der jetzt DevTools öffnet, findet nichts.

---

### Phase 2 — Die Sprache · ~7–10 Arbeitstage

- Katalog **#5** Annotation Wipe (die neun Listen differenzieren)
- Katalog **#6** Dimension Rule (drei Reveals → einer, alle 12 Routen)
- Katalog **#7** Ledger Stagger
- Katalog **#8** Nav Seat + Elevation Ramp
- Katalog **#10** Career Plot **als statisches SVG** — der volle inhaltliche Gewinn ohne das Motion-Risiko
- Katalog **#14** Tally (nach dem Copy-Fix aus Phase 1)
- Per-Page-Metadata + `generateMetadata` für alle Routen (heute teilen sich 12 Routen einen Title, eine Description, ein Canonical `https://sweber.dev` und eine OG-Card — das Canonical arbeitet aktiv gegen die Indexierung der Unterseiten)
- IA: `/experience`, `/skills`, `/education`, `/services` aus dem „More"-Dropdown holen
- framer-motion Welle 1

**Ergebnis nach Phase 2:** Die Seite hat eine erkennbare eigene Sprache. Der Hero beantwortet den 10-Sekunden-Test. Neun identische Listen sind neun unterscheidbare Sections.

---

### Phase 3 — Signatur · ~7–10 Arbeitstage

- Katalog **#9 ★** Roadmap Draw (Daten aus Phase 1 vorhanden)
- Katalog **#10 ★** Career Plot — jetzt animiert, mit datumsabgeleiteten Knoten-Delays
- Katalog **#11 ★** Spine Scrub
- Katalog **#12** Well Focus
- Katalog **#13** Receipt (+ CheckmarkAnimation und `@dotlottie/player-component` löschen)
- framer-motion Welle 2 — die vier Exit-Stellen, `ChatWidget` zuletzt und zwingend
- Bildstrategie: heute existieren **zwei** `next/image`-Aufrufe auf der gesamten öffentlichen Seite, und das Projekt-Hero ist durch ein synchrones `fs.existsSync` mit Riesenbuchstaben-Fallback abgesichert. Das ist keine Animation lösbar.
- Abnahme: `npx @axe-core/cli --tags wcag2aa,wcag21aa,wcag22aa` · Lighthouse mobil throttled · Chrome DevTools Paint Flashing beim Scrollen (ein full-width repaintender Nav-Header ist als grünes Dauer-Overlay sofort sichtbar) · Keyboard-Only-Durchlauf ohne Maus in beiden Themes · Speed Insights nach 7 Tagen gegen den Vorher-Wert.

---

## 7. Was wir bewusst NICHT machen

| Idee | Warum nicht |
|---|---|
| **Neumorphismus, in jeder Form** | Kanten bei 1.2–1.7:1 gegen 3:1 (WCAG 1.4.11). Body-Copy bei 9:1 gibt falsche Entwarnung. Die konforme Version hat sichtbare Ränder — also ist der Stil weg. |
| **Spatial UI als System** | Beide Grounds müssten re-based werden (Wochen Kontrast-Kaskade), Glas-Kontrast ist per Konstruktion nicht auditierbar, echte Refraktion ist Chromium-only. Der sichtbare Ertrag: „die Cards haben jetzt Schatten." |
| **Parallax / `depth-parallax`** | Bei 24 px Cap unterhalb der Wahrnehmungsschwelle; darüber die meistgeklonte Geste des Genres. Zweite Scroll-Hijack-Schicht über Lenis, dokumentierter vestibulärer Trigger, INP-Kosten auf genau den Mittelklasse-Handys, auf denen gescreent wird. Es gibt keine Einstellung, bei der das gewinnt. |
| **`row-shear`** (Pointermove-Parallax pro Projektzeile) | `getBoundingClientRect()` in einem Pointermove-Handler, pro Zeile, über 13 Zeilen, auf der häufigsten Interaktion der Seite. Layout-Read pro Pointer-Event für 6 px, die niemand bewusst sieht. |
| **Skill-Balken / Proficiency-Meter** (`skill-rails`, `skill-meter`) | Selbsteingeschätzte Balken erfinden Präzision, die die Daten nicht haben, und sind das klarste Junior-Signal bei technischen Lesern. „React 4/5" provoziert genau eine Frage: gemessen wie? Mono-Wort behalten, Meter weglassen. |
| **`theme-rocker`** (gefederter Kippschalter) | Ein physischer Zwei-Positionen-Schalter für ein Control, das pro Session einmal gedrückt wird. Da wird die Materialmetapher zur Requisite. Verschärft ausserdem den bestehenden Hydration-Reflow (`ThemeToggle.tsx:16-18` returned `null` bis mounted). |
| **`plate-rise`** (animierte `box-shadow` auf dem Projekt-Hero) | `box-shadow` ist nicht kompositierbar. 700 ms interpolierter String auf dem 16:9-Hero = 700 ms Full Repaints auf dem grössten Element der Seite, gleichzeitig mit `clip-path` und `scale` auf demselben Node. |
| **Animierter Blur-Radius in der Nav** | Re-rasterisiert den Blur bei neuem Radius in jedem Frame, volle Breite, über scrollendem Content. Fixer Radius, gerampte Alpha. |
| **`scaleX` auf den Roadmap-Phasenbalken** | Verifiziert: `CertificatesRoadmap.tsx:194` enthält ein `<span>`-Label im Balken. Skalieren staucht es 620 ms lang. Maske verschieben. |
| **`title-lines` auf allen 11 Unterseiten** | `splitText` auf 11 Page-Titles heisst permanente `fonts.ready` + Debounced-Resize-Re-Split-Pflicht auf jeder Route, für eine Geste, die niemand bewusst registriert. Clip-Reveal nur im Hero. |
| **`nav-rule`** (wandernder Underline) | Gecachte `offsetLeft/offsetWidth` veralten beim bekannten Hydration-Reflow, und es ersetzt ~20 funktionierende Underlines. Vor allem: das Problem der Nav ist IA, nicht Motion — vier Content-Seiten hinter „More" sind kein Underline-Problem. |
| **Count-up auf den heutigen Hero-Metriken** | Eine Zahl zu animieren ist eine Beweisgeste. Auf „9+ Projects Delivered" (= exakt die Anzahl geseedeter Zeilen) angewendet macht sie die schwächste Copy zum prominentesten Element. Erst Copy, dann Motion. |
| **`--e3` / dreistufige Elevation** | Eine dritte Stufe plus 1-px-Ring in Dark ist der Punkt, an dem das System als Dekoration liest. |
| **CSS Scroll-Driven Animations als Primärmechanismus** | Noch nicht Baseline (Firefox in Stable hinter einem Flag, ~84 % global). `@supports (animation-timeline: view())` als Progressive Enhancement: ja. Als Fundament: nein. |
| **framer-motion → anime.js als Bundle-Argument** | Gemessen ein Nullsummenspiel, und framer bleibt bis zur ChatWidget-Konvertierung auf jeder Route. Rechtfertige die Umstellung mit Fähigkeit, oder lass es. |
| **`mask-image` auf einem Page-Root-Wrapper** | `mask` erzeugt einen Backdrop-Root und würde den Nav-Blur lautlos killen. Gleiche Klasse Bug wie der Template-Wrapper. |
| **Irgendeine dieser Richtungen vor Phase 1** | Kein Z-Achsen-Ornament überlebt einen Besucher, der auf `demo: "#"` klickt oder von einem Lead-Formular aus auf eine 404-Datenschutzerklärung. |

---

## 8. Die zwei Regeln, die alles überschreiben

1. **Auf dem LCP-Element wird niemals `opacity` animiert.** From-States in CSS unter `html.js-motion`. Das HTML muss ohne JS vollständig sein.
2. **Der Abnahmetest ist der Reduced-Motion-Zustand.** Schalte ihn im OS ein. Sieht die Seite unfertig aus, hat die Animation dekoriert statt kommuniziert — und dann gehört sie gestrichen, egal wie gut sie sich anfühlt.

Datum kann diesen Test bestehen, weil jede animierte Eigenschaft in diesem Vokabular einen bedeutungstragenden Endzustand hat: eine gezogene Linie, ein ausgefahrener Balken, eine Zahl auf ihrem Wert, ein gesetzter Marker. Ein System aus Fade-ups hat nichts zu zeigen. Das ist der eigentliche Grund, warum diese Richtung gewinnt.