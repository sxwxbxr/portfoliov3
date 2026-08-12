"use client"

import Link from "next/link"
import { ArrowUpRight, Check } from "lucide-react"
import PageLayout, { Section } from "../../components/PageLayout"
import { copy } from "@/lib/copy"

const servicePackages = copy.services.packages
const engagementModels = copy.services.engagementModels

export default function Services() {
  return (
    <PageLayout
      label={copy.services.label}
      title={copy.services.title}
      subtitle={copy.services.subtitle}
    >
      {/* ─── Packages: the most raised objects on the site ─── */}
      <section className="sheet pb-20 md:pb-28">
        <div className="grid gap-5 lg:grid-cols-3">
          {servicePackages.map((service, i) => (
            <Section key={service.title} delay={i * 0.05} className="h-full">
              <article className="cast rim flex h-full flex-col gap-5 p-7 md:p-8">
                <div className="flex flex-col gap-2">
                  <span className="annotate">
                    {copy.services.packageEyebrow(i + 1)}
                  </span>
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    {service.title}
                  </h3>
                </div>

                <p className="text-sm leading-relaxed text-fg-muted">
                  {service.description}
                </p>

                <ul className="flex flex-1 flex-col gap-2.5">
                  {service.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-signal"
                        aria-hidden="true"
                      />
                      <span className="leading-relaxed text-fg-muted">{outcome}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className="control inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium"
                >
                  {copy.services.enquire}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            </Section>
          ))}
        </div>
      </section>

      {/* ─── Engagement models ─── */}
      <section className="sheet flex flex-col gap-8 pb-24 md:pb-32">
        <Section className="flex flex-col gap-2">
          <span className="annotate">
            {copy.services.modelsEyebrow(engagementModels.length)}
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {copy.services.models}
          </h2>
        </Section>

        <div className="well flex flex-col gap-2 p-3 md:p-4">
          {engagementModels.map((model) => (
            <div key={model.title} className="cast-sm def-grid px-5 py-4">
              <h3 className="flex items-center gap-2.5 font-display text-sm font-semibold md:text-base">
                {model.title}
                {model.recommended && (
                  <span className="well-sm annotate px-2.5 py-1 text-signal">
                    {copy.common.recommended}
                  </span>
                )}
              </h3>
              <p className="text-sm leading-relaxed text-fg-muted">
                {model.description}
              </p>
            </div>
          ))}
        </div>

        <Section>
          <div className="cast rim flex flex-col items-start justify-between gap-5 p-8 md:flex-row md:items-center md:p-10">
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-2xl font-bold tracking-tight">
                {copy.services.ctaTitle}
              </h2>
              <p className="text-sm text-fg-muted">{copy.services.ctaBody}</p>
            </div>
            <Link
              href="/contact"
              className="control control-primary inline-flex items-center gap-2 px-5 py-3 text-sm font-medium"
            >
              {copy.services.startConversation}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Section>
      </section>
    </PageLayout>
  )
}
