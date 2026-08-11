import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Download } from "lucide-react"
import PageLayout, { Section } from "../../components/PageLayout"
import { SkillGroups, groupByCategory, type SkillRow } from "../../components/SkillGroups"
import { getEducationEntries, getSkills } from "@/lib/data"
import { resolveImage } from "@/lib/project-image"
import { copy } from "@/lib/copy"

export const revalidate = 86400

const expertise = [
  {
    category: "Development",
    skills: ["C#", ".NET", "TypeScript", "React", "Next.js", "SQL", "REST APIs", "Python"],
  },
  {
    category: "Project Management",
    skills: [
      "Agile / Scrum",
      "Stakeholder Management",
      "Requirements Engineering",
      "Risk Management",
    ],
  },
  {
    category: "Tools & Platforms",
    skills: ["Azure DevOps", "Git", "Docker", "Vercel", "Jira", "Supabase"],
  },
]

const facts = [
  { label: "Standort", value: "St. Gallen, CH" },
  { label: "Erfahrung", value: "3+ Jahre" },
  { label: "Fokus", value: "Automation & PM" },
  { label: "Sprachen", value: "DE, EN, FR" },
]

export default async function About() {
  const [education, skills] = await Promise.all([
    getEducationEntries(),
    getSkills(),
  ])
  const hasSkills = skills.length > 0
  const skillGroupCount = groupByCategory(skills as SkillRow[]).length
  const portrait = resolveImage("/260216_professionalMG.jpeg")
  // The CV has been linked unconditionally while public/documents/ does not
  // exist. A dead download on the one page that asks for trust is worse than
  // no download at all.
  const cv = resolveImage("/documents/CV_SeyaWeber.pdf")

  return (
    <PageLayout
      label="Über mich"
      title="About"
      subtitle="Project Manager, Entwickler und Baumeister schlanker digitaler Lösungen in St. Gallen."
    >
      {/* ─── Bio ─── */}
      <Section className="sheet pb-20 md:pb-28">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.6fr_1fr]">
          <div className="measure flex flex-col gap-5">
            <p className="text-xl leading-relaxed md:text-2xl">
              Ich bin Project Manager für Software und Digitalisierung bei Telsonic
              und baue kundenspezifische Automatisierungs-Workflows in
              geschäftskritischen Systemen. Daneben führe ich Weber Development und
              entwickle massgeschneiderte Software für verschiedene Firmen.
            </p>
            <p className="leading-relaxed text-fg-muted">
              Mit einem doppelten Hintergrund in Softwareentwicklung und
              Elektroplanung übersetze ich komplexe operative Anforderungen in klare
              Spezifikationen, schlanke Prozesse und wartbare Lösungen. Mein Weg lief
              über Elektroplanung, Energieoptimierung für ein Schweizer
              Bankenportfolio, Healthcare-Datenmigration und jetzt industrielle
              Automatisierung und SaaS-Produktentwicklung.
            </p>
            <p className="leading-relaxed text-fg-muted">
              Ich baue Lösungen, die nicht nur das akute Problem lösen, sondern mit
              dem Geschäft mitwachsen. Weil ich sowohl selbst entwickle als auch
              Projekte führe, kann ich zwischen technischer Umsetzung und
              betrieblichen Zielen übersetzen.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {portrait && (
              <div className="well relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={portrait}
                  alt="Seya Weber, Project Manager und Software Developer"
                  fill
                  sizes="(min-width: 768px) 420px, 100vw"
                  className="object-cover object-top"
                  priority
                />
              </div>
            )}

            <dl className="cast rim flex flex-col gap-3 p-6">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-baseline justify-between gap-4"
                >
                  <dt className="annotate">{fact.label}</dt>
                  <dd className="font-mono text-sm">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* ─── Expertise ───────────────────────────────────────────────────
          One section, two sources. /skills used to be a separate route that
          rendered the database rows; it was empty and advertised in the nav,
          which is worse than not existing. It lives here now.

          When the skills table has rows they ARE this section — grouped by
          category, one tray each. When it is empty the hand-written summary
          below stands in, so filling the admin upgrades the page instead of
          producing a second section that says the same thing twice. */}
      <Section id="skills" className="sheet flex flex-col gap-8 py-20 md:py-28">
        <div className="flex flex-col gap-2">
          <span className="annotate">
            {hasSkills
              ? copy.about.skillsEyebrow(skillGroupCount, skills.length)
              : copy.about.expertiseEyebrow(expertise.length)}
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {copy.about.expertise}
          </h2>
        </div>

        {hasSkills ? (
          <SkillGroups skills={skills as SkillRow[]} />
        ) : (
          <div className="flex flex-col gap-4">
            {expertise.map((area) => (
              <div key={area.category} className="cast rim def-grid p-6">
                <h3 className="font-display text-sm font-semibold md:text-base">
                  {area.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {area.skills.map((skill) => (
                    <span
                      key={skill}
                      className="well-sm px-2.5 py-1 font-mono text-xs text-fg-muted"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ─── Education ─── */}
      {education.length > 0 && (
        <Section className="sheet flex flex-col gap-8 py-20 md:py-28">
          <div className="flex flex-col gap-2">
            <span className="annotate">Ausbildung · {education.length} Stationen</span>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Education
            </h2>
          </div>

          <div className="well flex flex-col gap-2 p-3 md:p-4">
            {education.map((edu) => (
              <div
                key={edu.id}
                className="cast-sm flex flex-col gap-1 px-4 py-3.5 md:flex-row md:items-center"
              >
                <span className="font-semibold md:flex-1">{edu.title}</span>
                {edu.institution && (
                  <span className="text-sm text-fg-muted md:flex-1">
                    {edu.institution}
                  </span>
                )}
                <span className="annotate md:text-right">{edu.period}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ─── Connect ─── */}
      <Section className="sheet pb-24 md:pb-32">
        <div className="cast rim flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center md:p-10">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Zusammenarbeiten?
            </h2>
            <p className="text-sm text-fg-muted">
              Ich bin offen für neue Projekte und Kooperationen.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="control control-primary inline-flex items-center gap-2 px-5 py-3 text-sm font-medium"
            >
              Kontakt aufnehmen
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {cv && (
              <a
                href={cv}
                download
                className="control inline-flex items-center gap-2 px-5 py-3 text-sm font-medium"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                CV herunterladen
              </a>
            )}
          </div>
        </div>
      </Section>
    </PageLayout>
  )
}
