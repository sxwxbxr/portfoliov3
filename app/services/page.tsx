"use client"

import Link from "next/link"
import PageLayout, { Section } from "../../components/PageLayout"

const servicePackages = [
  {
    title: "Delivery Leadership",
    description:
      "Fractional project leadership for digital transformation programs, complex migrations, and automation efforts.",
    outcomes: [
      "Clear scope, roadmap, and stakeholder alignment",
      "Risk and dependency management across teams",
      "Reporting cadences tailored to executive needs",
    ],
  },
  {
    title: "Solution Acceleration",
    description: "Hands-on implementation to turn validated concepts into production-ready tools and workflows.",
    outcomes: [
      "Rapid proof-of-concept and MVP builds",
      "Documentation and training for smooth handover",
      "QA support and instrumentation for continuous improvement",
    ],
  },
  {
    title: "Process & Product Coaching",
    description: "Support for teams adopting agile practices, shaping product discovery, and improving delivery rituals.",
    outcomes: [
      "Discovery and delivery frameworks your team can run",
      "Templates, checklists, and playbooks for repeatability",
      "Embedded coaching to reinforce new habits",
    ],
  },
]

const engagementModels = [
  { title: "Project-based", description: "Fixed-scope initiatives with defined milestones and delivery outcomes." },
  { title: "Retainer", description: "Ongoing advisory and execution support for teams that want a strategic partner on call." },
  { title: "Workshops", description: "Focused sessions to unblock decisions, facilitate discovery, or upskill your internal team." },
]

export default function Services() {
  return (
    <PageLayout
      title="Services"
      subtitle="Partner with me to move complex initiatives from idea to impact with the right blend of strategy and execution."
    >
      {/* Service packages */}
      <section className="pb-24 md:pb-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div>
            {servicePackages.map((service, i) => (
              <Section key={service.title} delay={i * 0.05}>
                <div
                  className={`py-8 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 md:gap-12">
                    <h3 className="font-display font-semibold text-lg">
                      {service.title}
                    </h3>
                    <div>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {service.description}
                      </p>
                      <ul className="space-y-2">
                        {service.outcomes.map((outcome) => (
                          <li key={outcome} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <span className="text-border mt-1">--</span>
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Section>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </section>

      {/* Engagement models */}
      <section className="py-24 md:py-32 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6">
          <Section>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-12">
              Engagement Models
            </h2>
          </Section>

          <div>
            {engagementModels.map((model, i) => (
              <Section key={model.title} delay={i * 0.05}>
                <div
                  className={`grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-12 py-6 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <h3 className="font-display font-semibold text-sm md:text-base">
                    {model.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {model.description}
                  </p>
                </div>
              </Section>
            ))}
            <div className="border-t border-border" />
          </div>

          <div className="mt-12">
            <Link
              href="/contact"
              className="link-underline text-primary font-medium"
            >
              Start a conversation &rarr;
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
