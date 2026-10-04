"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import PageLayout, { Section } from "../../components/PageLayout"
import { Block } from "../../components/site/Block"
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
      {/* ─── Packages: a three-up of flat cards ─── */}
      <section className="sheet-wide pb-18 md:pb-24">
        <div className="grid gap-3 lg:grid-cols-3">
          {servicePackages.map((service, i) => (
            <Section key={service.title} delay={i * 0.05} className="h-full">
              <article className="cast flex h-full flex-col gap-5 p-6 md:p-7">
                <div className="flex flex-col gap-2">
                  <span className="annotate">
                    {copy.services.packageEyebrow(i + 1)}
                  </span>
                  <h3 className="text-lg tracking-tight">{service.title}</h3>
                </div>

                <p className="text-sm leading-relaxed text-fg-muted">
                  {service.description}
                </p>

                <ul className="flex flex-1 flex-col border-t border-edge-soft">
                  {service.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="border-b border-edge-soft py-3 text-sm leading-relaxed text-fg-muted"
                    >
                      {outcome}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className="control inline-flex items-center gap-1 self-start py-2 pr-3 pl-4 text-sm"
                >
                  {copy.services.enquire}
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </article>
            </Section>
          ))}
        </div>
      </section>

      {/* ─── Engagement models ─── */}
      <Block
        label={copy.services.modelsEyebrow(engagementModels.length)}
        title={copy.services.models}
        sub={copy.services.modelsSub}
      >
        <div className="border-t border-edge-soft">
          {engagementModels.map((model) => (
            <div key={model.title} className="def-grid border-b border-edge-soft py-5">
              <h3 className="flex items-center gap-2.5 text-lg tracking-tight">
                {model.title}
                {model.recommended && (
                  <span className="tab text-xs text-fg-muted">
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
      </Block>

      <Block
        label={copy.services.startConversation}
        title={copy.services.ctaTitle}
        sub={copy.services.ctaBody}
        aside={
          <Link
            href="/contact"
            className="control control-primary inline-flex items-center gap-1 self-start py-2.5 pr-4 pl-5 text-sm"
          >
            {copy.services.startConversation}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />
    </PageLayout>
  )
}
