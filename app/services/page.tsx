"use client"

import PageLayout from "../../components/PageLayout"
import FadeInSection from "../../components/FadeInSection"
import { InteractiveCard } from "../../components/InteractiveCard"
import Link from "next/link"
import { CheckCircle2, Workflow, Users, Lightbulb, ArrowRight } from "lucide-react"

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

const engagementProcess = [
  {
    title: "1. Alignment Workshop",
    detail: "We map objectives, constraints, and success metrics to ensure the engagement starts with clarity.",
  },
  {
    title: "2. Co-created Delivery Plan",
    detail: "We shape the roadmap, define responsibilities, and agree on communication and reporting rhythms.",
  },
  {
    title: "3. Execution & Iteration",
    detail: "Implementation begins with visible checkpoints, demos, and data so stakeholders stay informed.",
  },
  {
    title: "4. Handover & Next Steps",
    detail: "We wrap with documentation, training, and recommendations that support long-term ownership.",
  },
]

const engagementModels = [
  {
    title: "Project-based",
    description: "Fixed-scope initiatives with defined milestones and delivery outcomes.",
  },
  {
    title: "Retainer",
    description: "Ongoing advisory and execution support for teams that want a strategic partner on call.",
  },
  {
    title: "Workshops",
    description: "Focused sessions to unblock decisions, facilitate discovery, or upskill your internal team.",
  },
]

export default function Services() {
  return (
    <PageLayout
      title="Services"
      subtitle="Partner with me to move complex initiatives from idea to impact with the right blend of strategy and execution"
    >
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl space-y-16">
          <FadeInSection>
            <div className="grid gap-8 md:grid-cols-3">
              {servicePackages.map((service) => (
                <InteractiveCard key={service.title}>
                  <div className="flex h-full flex-col rounded-xl border border-border bg-card p-8">
                    <div className="flex items-center gap-3 text-primary">
                      <Lightbulb className="h-6 w-6" aria-hidden="true" />
                      <h3 className="text-xl font-semibold text-foreground">{service.title}</h3>
                    </div>
                    <p className="mt-4 text-muted-foreground leading-relaxed">{service.description}</p>
                    <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                      {service.outcomes.map((outcome) => (
                        <li key={outcome} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </InteractiveCard>
              ))}
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="grid gap-8 md:grid-cols-2">
              <InteractiveCard>
                <div className="h-full rounded-xl border border-border bg-card p-8">
                  <h3 className="text-2xl font-semibold">How engagements unfold</h3>
                  <p className="mt-3 text-muted-foreground">
                    Every partnership is structured for clarity, predictable delivery, and measurable results.
                  </p>
                  <ol className="mt-6 space-y-4 text-muted-foreground">
                    {engagementProcess.map((step) => (
                      <li key={step.title} className="rounded-lg bg-muted/40 p-4">
                        <p className="font-semibold text-foreground">{step.title}</p>
                        <p className="mt-2 text-sm leading-relaxed">{step.detail}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </InteractiveCard>

              <InteractiveCard>
                <div className="h-full rounded-xl border border-border bg-card p-8">
                  <h3 className="text-2xl font-semibold">Who I work with</h3>
                  <p className="mt-3 text-muted-foreground">
                    Teams that need a trusted partner to navigate digital change without disrupting the day-to-day.
                  </p>
                  <ul className="mt-6 space-y-4 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <Users className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
                      <span>Operations leaders modernising legacy workflows and tooling.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Workflow className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
                      <span>Product teams balancing regulatory, technical, and stakeholder demands.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Lightbulb className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
                      <span>Founders and innovators seeking a pragmatic path from concept to launch.</span>
                    </li>
                  </ul>
                </div>
              </InteractiveCard>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 p-10 text-center">
              <h3 className="text-3xl font-semibold">Let&apos;s scope your next initiative</h3>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Share your goals and constraints, and I&apos;ll outline the approach, timeline, and collaboration model that gets you there.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Start a project
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="mailto:hello@seyaweber.com"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-medium transition-colors hover:bg-card"
                >
                  Email me directly
                </Link>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="grid gap-6 md:grid-cols-3">
              {engagementModels.map((model) => (
                <div key={model.title} className="rounded-xl border border-border bg-card p-6 text-center">
                  <h4 className="text-lg font-semibold text-foreground">{model.title}</h4>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{model.description}</p>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>
    </PageLayout>
  )
}
