import type { Metadata } from "next"
import type { CSSProperties } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { CurveLab } from "@/components/packages/demo/sigmoid/CurveLab"
import { ParallaxScene } from "@/components/packages/demo/sigmoid/ParallaxScene"
import { RevealGallery } from "@/components/packages/demo/sigmoid/RevealGallery"
import { SigmoidStatus } from "@/components/packages/demo/sigmoid/SigmoidStatus"
import { StoryDemo } from "@/components/packages/demo/sigmoid/StoryDemo"
import { TrackStats } from "@/components/packages/demo/sigmoid/TrackStats"
import { InstallCommand } from "@/components/packages/InstallCommand"
import { sigmoidDemo as t } from "@/lib/demo/sigmoid-copy"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"
import "./sigmoid.css"

export const revalidate = 60

export function generateMetadata(): Metadata {
  const url = pkgUrl("/sigmoid/demo")
  return {
    title: { absolute: t.seoTitle },
    description: t.description,
    alternates: { canonical: url },
    openGraph: { title: t.seoTitle, description: t.description, url, type: "website" },
  }
}

const SCRUB_CODE = `import { parallax, scrub } from "@sweberdev/sigmoid"

parallax(".layer-far", { distance: 20 })
parallax(".layer-near", { distance: 120 })

scrub(".ring", [
  { transform: "rotate(0deg)" },
  { transform: "rotate(360deg)" },
])`

const TRACK_CODE = `import { track } from "@sweberdev/sigmoid"

track(".stat", (p, el) => {
  el.textContent = Math.round(2400 * p).toLocaleString()
}, { range: "entry 0% cover 50%" })`

const STORY_CODE = `import { story } from "@sweberdev/sigmoid"

// <section id="how" style="height: 260vh">
//   <div style="position: sticky; top: 0">…</div>
// </section>
story("#how", {
  steps: 3,
  onStep: (i) => show(i),
})`

/** The lines of the zero-JavaScript section, rendered and shown as code. */
const LINES = [
  { attr: "fade-up", style: {} },
  { attr: "slide-left", style: { "--sigmoid-easing": "var(--sigmoid-ease-bouncy)", "--sigmoid-distance": "64px" } },
  { attr: "blur-in", style: { "--sigmoid-range": "entry 0% cover 60%" } },
  { attr: "clip-up", style: { "--sigmoid-easing": "var(--sigmoid-ease-sigmoid)" } },
] as const

const MARKUP = LINES.map((l, i) => {
  const style = Object.entries(l.style)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ")
  return `<p data-sigmoid="${l.attr}"${style ? ` style="${style}"` : ""}>\n  ${t.zeroJs.lines[i]}\n</p>`
}).join("\n")

export default function SigmoidDemoPage() {
  const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"

  return (
    <PageLayout>
      {/* The reading bar is only an attribute: sigmoid.css links it to the page scroll. */}
      <div data-sigmoid="progress" aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-fg" />

      <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex flex-col items-start gap-8">
          <Link
            href={pkgPath("/sigmoid")}
            className="annotate inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-fg"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t.overview}
          </Link>

          <h1 className="display text-balance">
            {t.title}
            <span className="headline-sub">{t.titleSub}</span>
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-fg-muted">{t.intro}</p>

          <SigmoidStatus />

          <nav aria-label={t.jump} className="annotate flex flex-wrap gap-x-5 gap-y-2">
            <span>{t.jump}:</span>
            {t.jumpLinks.map((l) => (
              <a key={l.href} href={l.href} className="underline underline-offset-2 hover:text-fg">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <Block id="curves" label={t.curves.label} title={t.curves.title} sub={t.curves.sub} lede={<p>{t.curves.lede}</p>}>
        <CurveLab />
      </Block>

      <Block id="reveal" label={t.reveal.label} title={t.reveal.title} sub={t.reveal.sub} lede={<p>{t.reveal.lede}</p>}>
        <RevealGallery />
      </Block>

      <Block
        id="parallax"
        label={t.parallax.label}
        title={t.parallax.title}
        sub={t.parallax.sub}
        lede={<p>{t.parallax.lede}</p>}
      >
        <div className="flex flex-col gap-10">
          <ParallaxScene />
          <div className="max-w-xl">
            <CodeBlock title={t.parallax.codeHeading} code={SCRUB_CODE} />
          </div>
        </div>
      </Block>

      <Block id="numbers" label={t.track.label} title={t.track.title} sub={t.track.sub} lede={<p>{t.track.lede}</p>}>
        <div className="flex flex-col gap-10">
          <TrackStats />
          <div className="max-w-xl">
            <CodeBlock title={t.track.codeHeading} code={TRACK_CODE} />
          </div>
        </div>
      </Block>

      <Block id="story" label={t.story.label} title={t.story.title} sub={t.story.sub} lede={<p>{t.story.lede}</p>}>
        <div className="flex flex-col gap-10">
          <StoryDemo />
          <div className="max-w-xl">
            <CodeBlock title={t.story.codeHeading} code={STORY_CODE} />
          </div>
        </div>
      </Block>

      <Block id="zero-js" label={t.zeroJs.label} title={t.zeroJs.title} sub={t.zeroJs.sub} lede={<p>{t.zeroJs.lede}</p>}>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            {LINES.map((l, i) => (
              <p
                key={l.attr}
                data-sigmoid={l.attr}
                style={l.style as CSSProperties}
                className="display text-balance text-3xl md:text-4xl"
              >
                {t.zeroJs.lines[i]}
              </p>
            ))}
          </div>
          <CodeBlock title={t.zeroJs.codeHeading} code={MARKUP} />
        </div>
      </Block>

      <Block
        label={t.closing.label}
        title={t.closing.title}
        sub={t.closing.sub}
        lede={<p>{t.closing.lede}</p>}
        aside={
          <div className="flex flex-col items-start gap-5">
            <InstallCommand command="pnpm add @sweberdev/sigmoid" packageSlug="sigmoid" />
            <Link href={pkgPath("/sigmoid/docs")} className={btn + " control-primary"}>
              {t.docs}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        }
      />
    </PageLayout>
  )
}
