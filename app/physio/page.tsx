import type { Metadata } from "next"
import Link from "next/link"
import { HeroPreview } from "@/components/physio/HeroPreview"
import { accountCopy } from "@/lib/physio/copy/account"
import { siteCopy } from "@/lib/physio/copy/site"
import { PHYSIO_TOOLS } from "@/lib/physio/tools"
import { physioPath, physioUrl } from "@/lib/physio/urls"

export const revalidate = 60

const c = siteCopy.landing

export const metadata: Metadata = {
  title: { absolute: c.metaTitle },
  description: c.metaDescription,
  alternates: { canonical: physioUrl("/") },
  openGraph: {
    title: c.metaTitle,
    description: c.metaDescription,
    url: physioUrl("/"),
    siteName: "Physio Tools",
    locale: "de_CH",
    type: "website",
  },
}

const btn = "control inline-flex min-h-11 items-center justify-center px-5 py-2.5 text-sm"

/** Same env strings as /abo ("3 CHF pro Monat"); the amount itself lives in Polar. */
function priceLines(): string[] {
  const monthly = process.env.PHYSIO_PRICE_MONTHLY_LABEL?.trim()
  const yearly = process.env.PHYSIO_PRICE_YEARLY_LABEL?.trim()
  const plans = accountCopy.plans
  return [
    monthly ? `${plans.monthly.title}: ${monthly}` : "",
    yearly ? `${plans.yearly.title}: ${yearly}` : "",
  ].filter(Boolean)
}

export default function PhysioLanding() {
  const firstDemo = PHYSIO_TOOLS.find((t) => t.status === "live" && t.demoPath)
  const prices = priceLines()

  return (
    <>
      {/* Hero: the claim on the left, the proof (the real engine output) on the right. */}
      <section className="sheet pt-10 pb-14 md:pt-16 md:pb-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-14">
          <div className="flex flex-col items-start gap-6">
            <p className="p-eyebrow">{c.eyebrow}</p>
            <h1 className="display text-balance text-[length:clamp(2.125rem,1.3rem+3.4vw,3.5rem)]">
              {c.title}
              <span className="headline-sub">{c.titleSub}</span>
            </h1>
            <p className="lede">{c.lede}</p>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              {firstDemo?.demoPath && (
                <Link href={physioPath(firstDemo.demoPath)} className={`${btn} control-primary`}>
                  {c.ctaDemo}
                </Link>
              )}
              <Link href={physioPath("/abo")} className={btn}>
                {c.ctaPlans}
              </Link>
            </div>
            <p className="text-sm text-fg-muted">{c.ctaNote}</p>
          </div>
          <div className="min-w-0">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Tools: the one live tool gets the room, the rest is an honest "not yet". */}
      <section id="tools" className="sheet pb-16 md:pb-24" style={{ scrollMarginTop: "5rem" }}>
        <div className="mb-8 flex flex-col gap-1">
          <h2 className="headline">{c.tools.heading}</h2>
          <p className="text-fg-muted">{c.tools.sub}</p>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          {PHYSIO_TOOLS.map((tool) => (
            <article key={tool.slug} className="cast flex min-w-0 flex-col gap-6 p-6 md:p-8">
              <div className="flex flex-col gap-3">
                <h3 className="flex flex-wrap items-center gap-3 text-2xl">
                  {tool.name}
                  {tool.status === "soon" && <span className="tab text-xs">{c.tools.soon}</span>}
                </h3>
                <p className="measure leading-relaxed text-fg-muted">{tool.summary}</p>
              </div>
              {(c.tools.highlights[tool.slug] ?? []).length > 0 && (
                <ul className="flex flex-col gap-3 border-t border-edge-soft pt-5">
                  {c.tools.highlights[tool.slug].map((h) => (
                    <li key={h} className="flex gap-3 text-sm leading-relaxed text-fg">
                      <span aria-hidden="true" className="mt-[0.55rem] size-1.5 shrink-0 rounded-[2px] bg-signal" />
                      <span className="min-w-0">{h}</span>
                    </li>
                  ))}
                </ul>
              )}
              {tool.status === "live" && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  {tool.demoPath && (
                    <Link href={physioPath(tool.demoPath)} className={`${btn} control-primary`}>
                      {c.tools.demo}
                    </Link>
                  )}
                  <Link href={physioPath(tool.path)} className={btn}>
                    {c.tools.open}
                  </Link>
                </div>
              )}
            </article>
          ))}
          <aside className="flex min-w-0 flex-col gap-3 rounded-[var(--radius-card)] border border-dashed border-edge-mid p-6 md:p-8">
            <h3 className="text-xl">{c.tools.moreTitle}</h3>
            <p className="leading-relaxed text-fg-muted">{c.tools.moreText}</p>
            <Link href={physioPath("/vorschlaege")} className="mt-auto inline-flex min-h-11 items-center font-medium text-signal underline underline-offset-4">
              {c.tools.moreCta}
            </Link>
          </aside>
        </div>
      </section>

      {/* How it works: the four real steps of the tool, big serif numerals instead of icons. */}
      <section className="sheet grid grid-cols-1 gap-8 pb-16 md:pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-14">
        <header className="flex flex-col gap-2 lg:sticky lg:top-24 lg:self-start">
          <h2 className="headline text-balance">{c.how.heading}</h2>
          <p className="text-fg-muted">{c.how.sub}</p>
        </header>
        <ol className="flex flex-col">
          {c.how.items.map((item, i) => (
            <li key={item.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-t border-edge-soft py-6 first:border-t-0 first:pt-0 sm:grid-cols-[3.5rem_minmax(0,1fr)]">
              <span className="p-step-num" aria-hidden="true">
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-col gap-1.5">
                <h3 className="text-xl">{item.title}</h3>
                <p className="measure leading-relaxed text-fg-muted">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Trust: three plain statements, no icons, on a quiet band. */}
      <section className="border-y border-edge-soft bg-plate-hi">
        <div className="sheet py-12 md:py-16">
          <h2 className="headline mb-8 max-w-xl text-balance">{c.trust.heading}</h2>
          <dl className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
            {c.trust.items.map((item) => (
              <div key={item.title} className="flex min-w-0 flex-col gap-2 border-t-2 border-signal pt-4">
                <dt className="font-[family-name:var(--font-physio-serif)] text-xl font-semibold tracking-tight">{item.title}</dt>
                <dd className="leading-relaxed text-fg-muted">{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Money and the way to ask for more. */}
      <section className="sheet grid grid-cols-1 gap-5 py-16 md:py-24 lg:grid-cols-2 lg:gap-6">
        <div className="cast flex min-w-0 flex-col items-start gap-5 p-6 md:p-8">
          <h2 className="headline">{c.pricing.heading}</h2>
          <p className="leading-relaxed text-fg-muted">{c.pricing.text}</p>
          {prices.length > 0 ? (
            <ul className="flex flex-col gap-1 font-medium text-fg">
              {prices.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          ) : (
            <p className="leading-relaxed text-fg">{c.pricing.priceFallback}</p>
          )}
          <ul className="flex flex-col gap-2 border-t border-edge-soft pt-5 text-sm text-fg-muted">
            {c.pricing.points.map((p) => (
              <li key={p} className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.5rem] size-1.5 shrink-0 rounded-[2px] bg-signal" />
                {p}
              </li>
            ))}
          </ul>
          <Link href={physioPath("/abo")} className={`${btn} mt-auto`}>
            {c.pricing.cta}
          </Link>
        </div>

        <div className="flex min-w-0 flex-col items-start gap-5 rounded-[var(--radius-card)] bg-signal p-6 text-signal-fg md:p-8">
          <h2 className="headline text-signal-fg">{c.suggest.heading}</h2>
          <p className="leading-relaxed text-signal-fg/90">{c.suggest.text}</p>
          <Link href={physioPath("/vorschlaege")} className={`${btn} mt-auto border-transparent text-fg focus-visible:outline-white`}>
            {c.suggest.cta}
          </Link>
        </div>
      </section>
    </>
  )
}
