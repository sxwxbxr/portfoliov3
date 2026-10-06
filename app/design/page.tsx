import { ChevronRight } from "lucide-react"
import { Block } from "@/components/site/Block"
import { Ruler } from "@/components/site/Ruler"

// Living style guide for the LINE design system.
// Deliberately fetches nothing, so it renders without DATABASE_URL.

export const metadata = {
  title: "LINE: Design system",
  robots: { index: false, follow: false },
}

const TOKENS: { name: string; cls: string; value: string; note: string }[] = [
  { name: "ground", cls: "bg-ground", value: "#0a0a0a", note: "Page background" },
  { name: "plate", cls: "bg-plate", value: "#141414", note: "Cards" },
  { name: "plate-hi", cls: "bg-plate-hi", value: "#1c1c1c", note: "Card hover, raised controls" },
  { name: "well", cls: "bg-well", value: "#0f0f0f", note: "Inputs, tracks, code" },
  { name: "fg", cls: "bg-fg", value: "#ededed", note: "Text" },
  { name: "fg-muted", cls: "bg-fg-muted", value: "#8f8f8f", note: "Body copy, secondary text" },
  { name: "fg-subtle", cls: "bg-fg-subtle", value: "#8a8a8a", note: "Meta, never body copy" },
  { name: "edge", cls: "bg-edge", value: "#6e6e6e", note: "Input boundaries" },
  { name: "edge-soft", cls: "bg-edge-soft", value: "#222222", note: "Section rules, row dividers" },
  { name: "edge-mid", cls: "bg-edge-mid", value: "#333333", note: "Control outlines" },
  { name: "signal", cls: "bg-signal", value: "#ffffff", note: "The only accent" },
]

const RULER_LABELS = ["Plan", "Build", "Ship", "Run", "Improve"] as const

export default function DesignSystem() {
  return (
    <div className="min-h-screen bg-ground text-fg">
      <header className="sheet pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="flex flex-col gap-3">
          <span className="annotate mb-3">Design system</span>
          <h1 className="display text-balance">LINE</h1>
          <p className="measure text-xl leading-snug text-fg-muted md:text-2xl">
            Dark ground, flat cards, hairline rules. White is the only accent and
            every weight is 400.
          </p>
        </div>
      </header>

      <Block
        flush
        label="Tokens"
        title="Eleven values"
        sub="Surfaces, text, lines and one accent."
        lede={
          <p>
            Defined in <code className="font-mono text-sm">app/globals.css</code> and
            exposed to Tailwind, so <code className="font-mono text-sm">bg-plate</code>,{" "}
            <code className="font-mono text-sm">text-fg-muted</code> and{" "}
            <code className="font-mono text-sm">border-edge-soft</code> all resolve.
          </p>
        }
      >
        <ul className="border-t border-edge-soft">
          {TOKENS.map((t) => (
            <li
              key={t.name}
              className="flex items-center gap-4 border-b border-edge-soft py-3"
            >
              <span
                className={`h-8 w-8 shrink-0 rounded-sm border border-edge-mid ${t.cls}`}
                aria-hidden="true"
              />
              <span className="w-24 shrink-0 text-sm">{t.name}</span>
              <span className="annotate w-20 shrink-0">{t.value}</span>
              <span className="annotate hidden sm:block">{t.note}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block
        label="Type"
        title="One family"
        sub="Hierarchy from size and colour, not weight."
      >
        <div className="border-t border-edge-soft">
          <div className="flex flex-col gap-2 border-b border-edge-soft py-6">
            <span className="annotate">.display</span>
            <p className="display">Project manager and developer</p>
          </div>
          <div className="flex flex-col gap-2 border-b border-edge-soft py-6">
            <span className="annotate">.headline + .headline-sub</span>
            <h2 className="headline">
              Lead line in white
              <span className="headline-sub">follow-up line in grey</span>
            </h2>
          </div>
          <div className="flex flex-col gap-2 border-b border-edge-soft py-6">
            <span className="annotate">.lede</span>
            <p className="lede measure">
              Body copy in grey at 17px with a relaxed line height. It is meant to
              be read in short paragraphs.
            </p>
          </div>
          <div className="flex flex-col gap-2 border-b border-edge-soft py-6">
            <span className="annotate">.annotate</span>
            <p className="annotate">Small grey sentence-case meta, 12 Mar 2026 · 4 min read</p>
          </div>
        </div>
      </Block>

      <Block label="Controls" title="Pills" sub="Buttons, tabs and fields.">
        <div className="flex flex-col gap-10">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="control inline-flex items-center gap-1 py-2 pr-3 pl-4 text-sm"
            >
              control
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="control control-primary inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"
            >
              control-primary
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="control control-ghost inline-flex items-center gap-1 py-2 pr-3 pl-4 text-sm"
            >
              control-ghost
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button type="button" className="control px-4 py-2 text-sm" disabled>
              disabled
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="tab text-xs text-fg-muted">tab</span>
            <span className="tab text-xs text-fg-muted">Next.js</span>
            <span className="tab text-xs text-fg-muted">TypeScript</span>
          </div>

          <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="annotate">Name</span>
              <input className="field px-4 py-2.5 text-sm" placeholder="What is your name?" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="annotate">Budget</span>
              <input className="field px-4 py-2.5 text-sm" placeholder="CHF 5’000 – 15’000" />
            </label>
          </div>

          <pre className="well overflow-x-auto p-4 font-mono text-sm text-fg-muted">
            npm run dev
          </pre>
        </div>
      </Block>

      <Block label="Surfaces" title="Flat cards" sub="One step lighter than the ground.">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="cast flex flex-col gap-2 p-6">
            <h3 className="text-lg tracking-tight">.cast</h3>
            <p className="text-sm text-fg-muted">Card on the ground. No shadow.</p>
          </div>
          <div className="cast card-link flex flex-col gap-2 p-6">
            <h3 className="text-lg tracking-tight">.card-link</h3>
            <p className="text-sm text-fg-muted">Lightens on hover.</p>
          </div>
          <div className="well flex flex-col gap-2 p-6">
            <h3 className="text-lg tracking-tight">.well</h3>
            <p className="text-sm text-fg-muted">Inputs, tracks and code.</p>
          </div>
        </div>
      </Block>

      <Block
        label="Ruler"
        title="A measuring strip"
        sub="Decorative, hidden from assistive tech."
        lede={
          <p>
            A white marker steps along the labelled ticks and rests on the first
            entry when motion is reduced.
          </p>
        }
      >
        <div className="-mx-5">
          <Ruler labels={RULER_LABELS} />
        </div>
      </Block>

      <section className="sheet pb-24 md:pb-32">
        <p className="annotate">
          A section is a <code className="font-mono">Block</code>: label on the left,
          two-tone heading on the right, content below. This page is made of them.
        </p>
      </section>
    </div>
  )
}
