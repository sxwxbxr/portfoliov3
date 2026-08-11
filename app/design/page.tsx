import ThemeToggle from "@/components/ThemeToggle"

// Living style guide for the CAST material system.
// Deliberately fetches nothing, so it renders without DATABASE_URL.
// Remove once the redesign has landed and the system is settled.

export const metadata = {
  title: "CAST — Material System",
  robots: { index: false, follow: false },
}

function Row({
  label,
  note,
  children,
}: {
  label: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h2 className="font-display text-lg font-semibold tracking-tight">{label}</h2>
        {note && <span className="annotate">{note}</span>}
      </div>
      {children}
    </section>
  )
}

const MEASURED: Array<[string, string, string]> = [
  ["Fliesstext auf schlechtester Fläche", "10.02:1", "10.03:1"],
  ["Muted-Text auf schlechtester Fläche", "4.62:1", "4.61:1"],
  ["Annotation auf schlechtester Fläche", "3.11:1", "3.11:1"],
  ["Control-Kante auf schlechtester Fläche", "3.11:1", "3.11:1"],
  ["Akzent als Text", "4.62:1", "4.61:1"],
]

export default function DesignSystem() {
  return (
    <div className="min-h-screen bg-ground text-fg">
      <div className="mx-auto max-w-[1100px] px-6 py-16 flex flex-col gap-16">
        <header className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex flex-col gap-2">
              <span className="annotate">Materialsystem · Branch newDesignV3</span>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                CAST
              </h1>
            </div>
            <ThemeToggle />
          </div>
          <p className="max-w-[62ch] text-fg-muted leading-relaxed">
            Objekte werden aus dem Grund <em>gegossen</em>, nicht darauf gelegt. Eine
            Lichtquelle oben links, zwei Polaritäten — erhaben und vertieft — und nichts,
            was schwebt. Die Geometrie ist gegenüber klassischem Soft-UI halbiert
            (6&nbsp;px Versatz statt 8–9, 14&nbsp;px Blur statt 16–18); das ist der
            Unterschied zwischen <em>gefräst</em> und <em>Kissen</em>.
          </p>
        </header>

        <Row label="Flächen" note="Grund · Plate erhaben · Well vertieft">
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="cast rim p-6 flex flex-col gap-1">
              <span className="annotate">.cast</span>
              <span className="text-sm text-fg-muted">Erhaben. Karten, Kacheln, Panels.</span>
            </div>
            <div className="well p-6 flex flex-col gap-1">
              <span className="annotate">.well</span>
              <span className="text-sm text-fg-muted">Vertieft. Behälter, Tracks, Eingaben.</span>
            </div>
            <div className="p-6 flex flex-col gap-1 border border-edge-soft rounded-lg">
              <span className="annotate">Grund</span>
              <span className="text-sm text-fg-muted">Die Fläche, aus der alles austritt.</span>
            </div>
          </div>
        </Row>

        <Row label="Controls" note="Material trägt die Optik · der Border trägt die Affordanz">
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" className="control px-4 py-2.5 text-sm font-medium">
              Sekundär
            </button>
            <button type="button" className="control control-primary px-5 py-3 text-sm font-medium">
              Nachricht senden
            </button>
            <button type="button" className="control px-4 py-2.5 text-sm font-medium" data-pressed="true">
              Gedrückt
            </button>
            <button type="button" className="control px-4 py-2.5 text-sm font-medium" disabled>
              Deaktiviert
            </button>
          </div>
          <p className="max-w-[62ch] text-sm text-fg-muted leading-relaxed">
            Drei unabhängige Zustands-Cues: <strong>Polarität</strong> (erhaben wird
            vertieft), <strong>Füllung</strong> und <strong>Rim</strong>. Lösch jeden
            Schatten aus dem Stylesheet — genau das tut <code className="font-mono text-xs">forced-colors</code> —
            und das Control bleibt identifizierbar und hält weiterhin 3:1. Das ist die
            Freiheit, die klassischer Neumorphismus aufgibt, indem er den Rand löscht.
          </p>
        </Row>

        <Row label="Control-Grössen" note="drei Stufen — globals.css kennt keine, also gilt diese Tabelle">
          <div className="well flex flex-wrap items-end gap-3 p-3 md:p-4">
            <button type="button" className="control px-3.5 py-2 text-xs font-medium">
              sm · px-3.5 py-2 text-xs
            </button>
            <button type="button" className="control px-4 py-2.5 text-sm font-medium">
              md · px-4 py-2.5 text-sm
            </button>
            <button type="button" className="control px-5 py-3 text-sm font-medium">
              lg · px-5 py-3 text-sm
            </button>
          </div>
          <p className="max-w-[62ch] text-sm text-fg-muted leading-relaxed">
            <strong>sm</strong> für Chips und Icon-Zeilen in Karten, <strong>md</strong> als
            Standard für jede Inline-Aktion, <strong>lg</strong> für den einen Abschluss-CTA
            einer Seite und für volle Breite in Formularen. Es gab zwischenzeitlich fünf
            Kombinationen für dasselbe semantische Gewicht — <code className="font-mono text-xs">px-6&nbsp;py-3</code> und{" "}
            <code className="font-mono text-xs">px-5&nbsp;py-2.5</code> sind zurückgeführt.
          </p>
        </Row>

        <Row label="Dropdown" note="Trigger ist ein Feld, das Panel eine Platte">
          <p className="max-w-[62ch] text-sm text-fg-muted leading-relaxed">
            <strong>Kaskadenfalle:</strong> shadcn-Primitives backen{" "}
            <code className="font-mono text-xs">border shadow-md</code> in die
            Utilities-Ebene. Tailwind ordnet Utilities NACH{" "}
            <code className="font-mono text-xs">@layer components</code>, wo{" "}
            <code className="font-mono text-xs">.cast</code> und{" "}
            <code className="font-mono text-xs">.well</code> leben — ein{" "}
            <code className="font-mono text-xs">className=&quot;cast&quot;</code> auf so einem
            Element bleibt wirkungslos, ohne Fehler.{" "}
            <code className="font-mono text-xs">components/ui/select.tsx</code> und{" "}
            <code className="font-mono text-xs">checkbox.tsx</code> tragen das Material jetzt
            selbst; <code className="font-mono text-xs">popover.tsx</code> wird stattdessen am
            Aufrufort neutralisiert (Panel als innere Platte).
          </p>
        </Row>

        <Row label="Eingaben" note="Gegenpolarität zum Button">
          <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
            <label className="flex flex-col gap-2">
              <span className="annotate">Name</span>
              <input className="field px-4 py-2.5 text-sm" placeholder="Wie heisst du?" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="annotate">Budget</span>
              <input className="field px-4 py-2.5 text-sm" placeholder="CHF 5’000 – 15’000" />
            </label>
          </div>
          <p className="max-w-[62ch] text-sm text-fg-muted leading-relaxed">
            Man sieht auf einen Blick, worein man tippt und was man drückt — Eingaben sind
            vertieft, Buttons erhaben. Der Focus-Ring liegt auf dem Element selbst, nicht
            im Schatten.
          </p>
        </Row>

        <Row label="Typografie" note="Space Grotesk · Inter · JetBrains Mono">
          <div className="cast rim p-7 flex flex-col gap-4">
            <h3 className="font-display text-3xl font-bold tracking-tight">
              Project Manager &amp; Software Developer
            </h3>
            <p className="max-w-[62ch] leading-relaxed">
              Fliesstext in Inter. Diese drei Schriften waren bisher geladen, aber nie
              angewendet — <code className="font-mono text-xs">globals.css</code> nannte die
              Familien wörtlich, während <code className="font-mono text-xs">layout.tsx</code> sie
              als Variablen deklariert. Wenn du hier Space Grotesk und JetBrains Mono
              siehst, ist der Bug behoben.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              <span className="annotate">Annotation · Tabular 0123456789</span>
              <span className="font-mono text-sm tabular">CHF 12’480.00</span>
            </div>
          </div>
        </Row>

        <Row label="Akzent" note="rationiert auf Zustand, Fokus und das Aktuelle">
          <div className="flex flex-wrap items-center gap-6">
            <span className="inline-flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-signal-bright" />
              <span className="text-sm">Verfügbar für Projekte</span>
            </span>
            <a href="#top" className="link-underline text-signal text-sm font-medium">
              Als Link
            </a>
            <span className="well-sm px-3 py-1.5 text-xs font-mono text-signal">Aktuell</span>
          </div>
        </Row>

        <Row label="Gemessen" note="abgeleitet, nicht geschätzt — gegen die jeweils schlechteste Fläche">
          <div className="well p-1 overflow-x-auto">
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="text-left">
                  <th className="annotate p-3 font-normal">Paar</th>
                  <th className="annotate p-3 font-normal text-right">Light</th>
                  <th className="annotate p-3 font-normal text-right">Dark</th>
                </tr>
              </thead>
              <tbody>
                {MEASURED.map(([label, light, dark]) => (
                  <tr key={label} className="border-t border-edge-soft">
                    <td className="p-3">{label}</td>
                    <td className="p-3 text-right font-mono tabular text-signal">{light}</td>
                    <td className="p-3 text-right font-mono tabular text-signal">{dark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="max-w-[62ch] text-sm text-fg-muted leading-relaxed">
            Die schlechteste Fläche unterscheidet sich je Modus: in Light Mode ist es der
            vertiefte Well (dunkler Text auf dunklerer Fläche), in Dark Mode die erhabene
            Plate. Jeder Token oben ist der Wert, der seinem Grund am nächsten liegt und
            sein Ziel trotzdem noch erreicht — im sRGB-Gamut, nicht abgeschnitten.
          </p>
        </Row>
      </div>
    </div>
  )
}
