"use client"

import Link from "next/link"
import PageLayout from "../../components/PageLayout"
import { AnimatedSection } from "../../components/AnimatedSection"
import { StaggerContainer, StaggerItem } from "../../components/StaggerContainer"
import { CheckCircle2, Users, Workflow, Lightbulb, ArrowUpRight } from "lucide-react"

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
    step: "01",
    title: "Alignment Workshop",
    detail: "We map objectives, constraints, and success metrics to ensure the engagement starts with clarity.",
  },
  {
    step: "02",
    title: "Co-created Delivery Plan",
    detail: "We shape the roadmap, define responsibilities, and agree on communication and reporting rhythms.",
  },
  {
    step: "03",
    title: "Execution & Iteration",
    detail: "Implementation begins with visible checkpoints, demos, and data so stakeholders stay informed.",
  },
  {
    step: "04",
    title: "Handover & Next Steps",
    detail: "We wrap with documentation, training, and recommendations that support long-term ownership.",
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
      label="What I offer"
    >
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Service Packages */}
          <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
            {servicePackages.map((service) => (
              <StaggerItem key={service.title}>
                <div className="bento-card rounded-2xl border border-border bg-card p-8 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{service.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{service.description}</p>
                  <ul className="space-y-3 mt-auto">
                    {service.outcomes.map((outcome) => (
                      <li key={outcome} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* How Engagements Unfold + Who I Work With */}
          <div className="grid gap-6 md:grid-cols-2">
            <AnimatedSection>
              <div className="bento-card rounded-2xl border border-border bg-card p-8 h-full">
                <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">Process</p>
                <h3 className="text-2xl font-semibold mb-6">How engagements unfold</h3>
                <div className="space-y-4">
                  {engagementProcess.map((step) => (
                    <div key={step.step} className="rounded-xl bg-muted/40 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-primary">{step.step}</span>
                        <p className="font-semibold text-sm">{step.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="bento-card rounded-2xl border border-border bg-card p-8 h-full">
                <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">Clients</p>
                <h3 className="text-2xl font-semibold mb-6">Who I work with</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Teams that need a trusted partner to navigate digital change without disrupting the day-to-day.
                </p>
                <ul className="space-y-5">
                  {[
                    { icon: Users, text: "Operations leaders modernising legacy workflows and tooling." },
                    { icon: Workflow, text: "Product teams balancing regulatory, technical, and stakeholder demands." },
                    { icon: Lightbulb, text: "Founders and innovators seeking a pragmatic path from concept to launch." },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <item.icon className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground leading-relaxed">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>

          {/* CTA */}
          <AnimatedSection>
            <div className="bento-card rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 p-10 md:p-14 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Let&apos;s scope your next initiative</h3>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Share your goals and constraints, and I&apos;ll outline the approach, timeline, and collaboration model that gets you there.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  Start a project <ArrowUpRight className="w-4 h-4" />
                </Link>
                <a
                  href="mailto:info@sweber.dev"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors"
                >
                  Email me directly
                </a>
              </div>
            </div>
          </AnimatedSection>

          {/* Engagement Models */}
          <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
            {engagementModels.map((model) => (
              <StaggerItem key={model.title}>
                <div className="rounded-2xl border border-border bg-card p-6 text-center">
                  <h4 className="text-base font-semibold mb-3">{model.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{model.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </PageLayout>
  )
}
