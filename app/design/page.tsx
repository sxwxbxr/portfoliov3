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
  ["Body text on the worst surface", "10.02:1", "10.03:1"],
  ["Muted text on the worst surface", "4.62:1", "4.61:1"],
  ["Annotation on the worst surface", "3.11:1", "3.11:1"],
  ["Control edge on the worst surface", "3.11:1", "3.11:1"],
  ["Accent as text", "4.62:1", "4.61:1"],
]

export default function DesignSystem() {
  return (
    <div className="min-h-screen bg-ground text-fg">
      <div className="mx-auto max-w-[1100px] px-6 py-16 flex flex-col gap-16">
        <header className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex flex-col gap-2">
              <span className="annotate">Material system · Branch newDesignV3</span>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                CAST
              </h1>
            </div>
            <ThemeToggle />
          </div>
          <p className="max-w-[62ch] text-fg-muted leading-relaxed">
            Objects are <em>cast</em> out of the ground, not laid on top of it. One light
            source at the top left, two polarities — raised and sunken — and nothing that
            floats. The geometry is halved against classic soft UI (6&nbsp;px offset
            instead of 8–9, 14&nbsp;px blur instead of 16–18); that is the difference
            between <em>milled</em> and <em>cushion</em>.
          </p>
        </header>

        <Row label="Surfaces" note="Ground · plate raised · well sunken">
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="cast rim p-6 flex flex-col gap-1">
              <span className="annotate">.cast</span>
              <span className="text-sm text-fg-muted">Raised. Cards, tiles, panels.</span>
            </div>
            <div className="well p-6 flex flex-col gap-1">
              <span className="annotate">.well</span>
              <span className="text-sm text-fg-muted">Sunken. Containers, tracks, inputs.</span>
            </div>
            <div className="p-6 flex flex-col gap-1 border border-edge-soft rounded-lg">
              <span className="annotate">Ground</span>
              <span className="text-sm text-fg-muted">The surface everything emerges from.</span>
            </div>
          </div>
        </Row>

        <Row label="Controls" note="material carries the look · the border carries the affordance">
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" className="control px-4 py-2.5 text-sm font-medium">
              Secondary
            </button>
            <button type="button" className="control control-primary px-5 py-3 text-sm font-medium">
              Send message
            </button>
            <button type="button" className="control px-4 py-2.5 text-sm font-medium" data-pressed="true">
              Pressed
            </button>
            <button type="button" className="control px-4 py-2.5 text-sm font-medium" disabled>
              Disabled
            </button>
          </div>
          <p className="max-w-[62ch] text-sm text-fg-muted leading-relaxed">
            Three independent state cues: <strong>polarity</strong> (raised becomes
            sunken), <strong>fill</strong> and <strong>rim</strong>. Delete every shadow
            from the stylesheet — which is exactly what <code className="font-mono text-xs">forced-colors</code> does —
            and the control stays identifiable and still holds 3:1. That is the freedom
            classic neumorphism gives up when it deletes the edge.
          </p>
        </Row>

        <Row label="Control sizes" note="three steps — globals.css defines none, so this table is the rule">
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
            <strong>sm</strong> for chips and icon rows inside cards, <strong>md</strong> as
            the default for every inline action, <strong>lg</strong> for a page&apos;s one
            closing CTA and for full width in forms. There were five combinations for the
            same semantic weight at one point — <code className="font-mono text-xs">px-6&nbsp;py-3</code> and{" "}
            <code className="font-mono text-xs">px-5&nbsp;py-2.5</code> have been folded back in.
          </p>
        </Row>

        <Row label="Dropdown" note="the trigger is a field, the panel a plate">
          <p className="max-w-[62ch] text-sm text-fg-muted leading-relaxed">
            <strong>Cascade trap:</strong> shadcn primitives bake{" "}
            <code className="font-mono text-xs">border shadow-md</code> into the utilities
            layer. Tailwind orders utilities AFTER{" "}
            <code className="font-mono text-xs">@layer components</code>, where{" "}
            <code className="font-mono text-xs">.cast</code> and{" "}
            <code className="font-mono text-xs">.well</code> live — a{" "}
            <code className="font-mono text-xs">className=&quot;cast&quot;</code> on such an
            element has no effect, and no error.{" "}
            <code className="font-mono text-xs">components/ui/select.tsx</code> and{" "}
            <code className="font-mono text-xs">checkbox.tsx</code> now carry the material
            themselves; <code className="font-mono text-xs">popover.tsx</code> is neutralised
            at the call site instead (panel as an inner plate).
          </p>
        </Row>

        <Row label="Inputs" note="opposite polarity to the button">
          <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
            <label className="flex flex-col gap-2">
              <span className="annotate">Name</span>
              <input className="field px-4 py-2.5 text-sm" placeholder="What's your name?" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="annotate">Budget</span>
              <input className="field px-4 py-2.5 text-sm" placeholder="CHF 5’000 – 15’000" />
            </label>
          </div>
          <p className="max-w-[62ch] text-sm text-fg-muted leading-relaxed">
            You can see at a glance what you type into and what you press — inputs are
            sunken, buttons raised. The focus ring sits on the element itself, not in the
            shadow.
          </p>
        </Row>

        <Row label="Typography" note="Space Grotesk · Inter · JetBrains Mono">
          <div className="cast rim p-7 flex flex-col gap-4">
            <h3 className="font-display text-3xl font-bold tracking-tight">
              Project Manager &amp; Software Developer
            </h3>
            <p className="max-w-[62ch] leading-relaxed">
              Body text in Inter. These three faces were loaded but never applied —{" "}
              <code className="font-mono text-xs">globals.css</code> named the families
              literally while <code className="font-mono text-xs">layout.tsx</code> declares
              them as variables. If you see Space Grotesk and JetBrains Mono here, the bug
              is fixed.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              <span className="annotate">Annotation · Tabular 0123456789</span>
              <span className="font-mono text-sm tabular">CHF 12’480.00</span>
            </div>
          </div>
        </Row>

        <Row label="Accent" note="rationed to state, focus and the current thing">
          <div className="flex flex-wrap items-center gap-6">
            <span className="inline-flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-signal-bright" />
              <span className="text-sm">Available for projects</span>
            </span>
            <a href="#top" className="link-underline text-signal text-sm font-medium">
              As a link
            </a>
            <span className="well-sm px-3 py-1.5 text-xs font-mono text-signal">Current</span>
          </div>
        </Row>

        <Row label="Measured" note="derived, not estimated — against the worst surface in each mode">
          <div className="well p-1 overflow-x-auto">
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="text-left">
                  <th className="annotate p-3 font-normal">Pair</th>
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
            The worst surface differs per mode: in light mode it is the sunken well (dark
            text on a darker surface), in dark mode the raised plate. Every token above is
            the value closest to its ground that still hits its target — inside the sRGB
            gamut, not clipped.
          </p>
        </Row>
      </div>
    </div>
  )
}
