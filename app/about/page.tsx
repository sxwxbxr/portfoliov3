import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import PageLayout, { Section } from "../../components/PageLayout"
import { Block } from "../../components/site/Block"
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
  const portrait = resolveImage("/seya-weber-portrait.jpg")
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
      <Section className="sheet pb-18 md:pb-24">
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
              <div className="well relative aspect-square w-full max-w-[320px] overflow-hidden">
                {/* Square and capped at 320px: the photo is 640px, so it is never upscaled on 2x screens. */}
                <Image
                  src={portrait}
                  alt={copy.about.portraitAlt}
                  fill
                  sizes="320px"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <dl className="cast flex flex-col gap-3 p-6">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-baseline justify-between gap-4"
                >
                  <dt className="annotate">{fact.label}</dt>
                  <dd className="text-sm">{fact.value}</dd>
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

          When the skills table has rows they ARE this section, grouped by
          category. When it is empty the hand-written summary below stands in,
          so filling the admin upgrades the page instead of producing a second
          section that says the same thing twice. */}
      <Block
        id="skills"
        label={
          hasSkills
            ? copy.about.skillsEyebrow(skillGroupCount, skills.length)
            : copy.about.expertiseEyebrow(expertise.length)
        }
        title={copy.about.expertise}
        sub={copy.about.expertiseSub}
      >
        {hasSkills ? (
          <SkillGroups skills={skills as SkillRow[]} />
        ) : (
          <div className="border-t border-edge-soft">
            {expertise.map((area) => (
              <div
                key={area.category}
                className="def-grid border-b border-edge-soft py-5"
              >
                <h3 className="text-lg tracking-tight">{area.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {area.skills.map((skill) => (
                    <span key={skill} className="tab text-xs text-fg-muted">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Block>

      {/* ─── Education ─── */}
      {education.length > 0 && (
        <Block
          label={copy.about.educationEyebrow(education.length)}
          title={copy.about.education}
          sub={copy.about.educationSub}
        >
          <div className="border-t border-edge-soft">
            {education.map((edu) => (
              <div
                key={edu.id}
                className="flex flex-col gap-1 border-b border-edge-soft py-5 md:flex-row md:items-baseline md:gap-6"
              >
                <span className="md:flex-1">{edu.title}</span>
                {edu.institution && (
                  <span className="text-sm text-fg-muted md:flex-1">
                    {edu.institution}
                  </span>
                )}
                <span className="annotate md:text-right">{edu.period}</span>
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* ─── Connect ─── */}
      <Block
        label={copy.about.getInTouch}
        title={copy.about.ctaTitle}
        sub={copy.about.ctaBody}
        aside={
          <Link
            href="/contact"
            className="control control-primary inline-flex items-center gap-1 self-start py-2.5 pr-4 pl-5 text-sm"
          >
            {copy.about.getInTouch}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />
    </PageLayout>
  )
}
