import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import PageLayout, { Section } from "../../components/PageLayout"
import { SkillGroups, groupByCategory, type SkillRow } from "../../components/SkillGroups"
import { getEducationEntries, getSkills } from "@/lib/data"
import { resolveImage } from "@/lib/project-image"
import { copy } from "@/lib/copy"

export const revalidate = 86400

const expertise = copy.common.expertiseAreas

const facts = [
  { label: copy.about.factLocation, value: copy.about.factLocationValue },
  { label: copy.about.factExperience, value: copy.about.factExperienceValue },
  { label: copy.about.factFocus, value: copy.about.factFocusValue },
  { label: copy.about.factLanguages, value: copy.about.factLanguagesValue },
]

export default async function About() {
  const [education, skills] = await Promise.all([
    getEducationEntries(),
    getSkills(),
  ])
  const hasSkills = skills.length > 0
  const skillGroupCount = groupByCategory(skills as SkillRow[]).length
  const portrait = resolveImage("/260216_professionalMG.jpeg")
  // There is deliberately no CV download here. It is replaced by an opt-in
  // "send me the CV" checkbox on the contact form — see docs/CV_DELIVERY.md.
  // The point is that a CV should be requested, not lying on a public URL.

  return (
    <PageLayout
      label={copy.about.label}
      title={copy.about.title}
      subtitle={copy.about.subtitle}
    >
      {/* ─── Bio ─── */}
      <Section className="sheet pb-20 md:pb-28">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.6fr_1fr]">
          <div className="measure flex flex-col gap-5">
            {copy.about.bio.map((paragraph, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-xl leading-relaxed md:text-2xl"
                    : "leading-relaxed text-fg-muted"
                }
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-5">
            {portrait && (
              <div className="well relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={portrait}
                  alt={copy.about.portraitAlt}
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
            <span className="annotate">
              {copy.about.educationEyebrow(education.length)}
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {copy.about.education}
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
              {copy.about.ctaTitle}
            </h2>
            <p className="text-sm text-fg-muted">{copy.about.ctaBody}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="control control-primary inline-flex items-center gap-2 px-5 py-3 text-sm font-medium"
            >
              {copy.about.getInTouch}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>
    </PageLayout>
  )
}
