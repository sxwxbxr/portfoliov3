import type { Metadata } from "next"
import { Section } from "@/components/PageLayout"
import { SuggestionForm } from "@/components/physio/SuggestionForm"
import { suggestionsCopy } from "@/lib/physio/copy/suggestions"
import { physioUrl } from "@/lib/physio/urls"

const c = suggestionsCopy

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
  alternates: { canonical: physioUrl("/vorschlaege") },
  openGraph: {
    title: `${c.meta.title} | Physio-Tools`,
    description: c.meta.description,
    url: physioUrl("/vorschlaege"),
    type: "website",
  },
}

export default function VorschlaegePage() {
  return (
    <>
      <header className="sheet pt-10 pb-12 md:pt-16 md:pb-16">
        <div className="flex flex-col items-start gap-6">
          <h1 className="display text-balance">
            {c.hero.title}
            <span className="headline-sub">{c.hero.sub}</span>
          </h1>
          <p className="lede">{c.hero.lede}</p>
        </div>
      </header>

      <section className="sheet pb-24 md:pb-32">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <Section className="relative min-w-0">
            <div className="cast p-6 md:p-8">
              <h2 className="mb-6 text-xl tracking-tight">{c.form.heading}</h2>
              <SuggestionForm />
            </div>
          </Section>

          <Section delay={0.08} className="min-w-0 lg:pt-2">
            <h2 className="mb-6 text-xl tracking-tight">{c.process.heading}</h2>
            <ol className="flex flex-col gap-6">
              {c.process.steps.map((step) => (
                <li key={step.title} className="flex flex-col gap-1.5">
                  <h3 className="text-base tracking-tight">{step.title}</h3>
                  <p className="leading-relaxed text-fg-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      </section>
    </>
  )
}
