"use client"

import Link from "next/link"
import PageLayout from "../../components/PageLayout"
import { caseStudies } from "../../src/config"

export default function CaseStudies() {
  return (
    <PageLayout
      title="Case Studies"
      subtitle="Real-world projects, challenges overcome, and measurable results achieved for clients across different industries."
    >
      <section className="pb-24 md:pb-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div>
            {caseStudies.map((study, i) => (
              <Link
                key={study.slug}
                href={`/case-studies/${study.slug}`}
                className="group block"
              >
                <div
                  className={`grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 py-6 md:py-8 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold tracking-tight group-hover:text-primary transition-colors duration-200">
                      {study.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="font-mono">{study.client}</span>
                      <span className="hidden md:inline text-border">|</span>
                      <span>{study.industry}</span>
                      <span className="hidden md:inline text-border">|</span>
                      <span className="font-mono">{study.duration}</span>
                    </div>
                    <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">
                      {study.challenge}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground group-hover:text-primary transition-colors duration-200" aria-hidden="true">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                      >
                        <path
                          d="M4.5 11.5L11.5 4.5M11.5 4.5H5.5M11.5 4.5V10.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
