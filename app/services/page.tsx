"use client"

import Link from "next/link"
import { ArrowUpRight, Check } from "lucide-react"
import PageLayout, { Section } from "../../components/PageLayout"

const servicePackages = [
  {
    title: "Delivery Leadership",
    description:
      "Projektleitung auf Zeit für Digitalisierungsprogramme, komplexe Migrationen und Automatisierungsvorhaben.",
    outcomes: [
      "Klarer Scope, Roadmap und Stakeholder-Alignment",
      "Risiko- und Abhängigkeitsmanagement über Teams hinweg",
      "Reporting-Rhythmus, der zur Führungsebene passt",
    ],
  },
  {
    title: "Solution Acceleration",
    description:
      "Praktische Umsetzung: validierte Konzepte werden produktionsreife Werkzeuge und Workflows.",
    outcomes: [
      "Schnelle Proof-of-Concepts und MVP-Builds",
      "Dokumentation und Schulung für eine saubere Übergabe",
      "QA-Support und Instrumentierung für laufende Verbesserung",
    ],
  },
  {
    title: "Process & Product Coaching",
    description:
      "Begleitung für Teams, die agile Praktiken einführen, Product Discovery schärfen und ihre Lieferrituale verbessern.",
    outcomes: [
      "Discovery- und Delivery-Frameworks, die dein Team selbst fahren kann",
      "Templates, Checklisten und Playbooks für Wiederholbarkeit",
      "Eingebettetes Coaching, das neue Gewohnheiten verankert",
    ],
  },
]

const engagementModels = [
  {
    title: "Projektbasiert",
    description: "Fixer Scope mit definierten Meilensteinen und Lieferergebnissen.",
  },
  {
    title: "Retainer",
    description:
      "Laufende Beratung und Umsetzung für Teams, die einen strategischen Partner auf Abruf wollen.",
    recommended: true,
  },
  {
    title: "Workshops",
    description:
      "Fokussierte Sessions, um Entscheidungen zu lösen, Discovery zu moderieren oder das interne Team zu befähigen.",
  },
]

export default function Services() {
  return (
    <PageLayout
      label="Leistungen"
      title="Services"
      subtitle="Komplexe Vorhaben von der Idee zur Wirkung — mit der richtigen Mischung aus Strategie und Umsetzung."
    >
      {/* ─── Packages: the most raised objects on the site ─── */}
      <section className="sheet pb-20 md:pb-28">
        <div className="grid gap-5 lg:grid-cols-3">
          {servicePackages.map((service, i) => (
            <Section key={service.title} delay={i * 0.05} className="h-full">
              <article className="cast rim flex h-full flex-col gap-5 p-7 md:p-8">
                <div className="flex flex-col gap-2">
                  <span className="annotate">
                    Paket {String(i + 1).padStart(2, "0")}
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
                  Anfragen
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
            Zusammenarbeit · {engagementModels.length} Modelle
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Engagement Models
          </h2>
        </Section>

        <div className="well flex flex-col gap-2 p-3 md:p-4">
          {engagementModels.map((model) => (
            <div key={model.title} className="cast-sm def-grid px-5 py-4">
              <h3 className="flex items-center gap-2.5 font-display text-sm font-semibold md:text-base">
                {model.title}
                {model.recommended && (
                  <span className="well-sm annotate px-2.5 py-1 text-signal">
                    Empfohlen
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
                Passt eines davon?
              </h2>
              <p className="text-sm text-fg-muted">
                Erzähl mir kurz, worum es geht — ich melde mich innerhalb von 24 Stunden.
              </p>
            </div>
            <Link
              href="/contact"
              className="control control-primary inline-flex items-center gap-2 px-5 py-3 text-sm font-medium"
            >
              Gespräch starten
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Section>
      </section>
    </PageLayout>
  )
}
