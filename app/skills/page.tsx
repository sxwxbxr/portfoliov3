import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import PageLayout, { Section } from "../../components/PageLayout"
import { EmptyState } from "../../components/EmptyState"
import { getSkills } from "@/lib/data"
import { SkillPopover } from "@/components/skill-explorer/SkillPopover"
import { AI_FEATURES_ENABLED } from "@/lib/features"

export const revalidate = 86400

interface SkillRow {
  category: string
  name: string
  detail: string
  level: string
  sortOrder: number
}

function groupByCategory(skills: SkillRow[]) {
  const order: string[] = []
  const groups = new Map<string, SkillRow[]>()
  for (const skill of skills) {
    const key = skill.category || "Uncategorized"
    if (!groups.has(key)) {
      groups.set(key, [])
      order.push(key)
    }
    groups.get(key)!.push(skill)
  }
  return order.map((category) => ({
    category,
    items: groups.get(category)!,
  }))
}

export default async function Skills() {
  const skills = await getSkills()
  const groups = groupByCategory(skills as SkillRow[])

  return (
    <PageLayout
      label={
        groups.length > 0
          ? `${groups.length} ${
              groups.length === 1 ? "Kategorie" : "Kategorien"
            } · ${skills.length} Skills`
          : "Kompetenzen"
      }
      title="Skills & Expertise"
      subtitle="Technische Expertise und Kompetenzen aus Softwareentwicklung, Projektleitung und Engineering."
    >
      <section className="sheet flex flex-col gap-10 pb-24 md:pb-32">
        {groups.length === 0 ? (
          <EmptyState
            label="Noch nichts hinterlegt"
            title="Die Skill-Übersicht entsteht gerade."
          >
            Sobald die Einträge gepflegt sind, erscheinen sie hier nach
            Kategorie sortiert.
          </EmptyState>
        ) : (
          // One sunken tray per category, with each skill seated in it as a
          // raised chip. No proficiency bars: a self-assessed meter invents a
          // precision the data does not have. The level stays a mono word.
          <div className="flex flex-col gap-8">
            {groups.map((group, gi) => (
              <Section
                key={group.category}
                delay={gi * 0.04}
                className="flex flex-col gap-3"
              >
                <div className="flex items-baseline justify-between gap-4 px-1">
                  <h2 className="font-display text-lg font-semibold tracking-tight md:text-xl">
                    {group.category}
                  </h2>
                  <span className="annotate">
                    {String(group.items.length).padStart(2, "0")}
                  </span>
                </div>

                <ul className="well grid gap-2 p-3 sm:grid-cols-2 md:p-4">
                  {group.items.map((skill, i) =>
                    AI_FEATURES_ENABLED ? (
                      <SkillPopover
                        key={`${skill.category}-${skill.name}-${i}`}
                        skill={skill}
                        isFirst={i === 0}
                      />
                    ) : (
                      // Keep this seat in sync with the one rendered by
                      // components/skill-explorer/SkillPopover.tsx.
                      <li
                        key={`${skill.category}-${skill.name}-${i}`}
                        className="cast-sm flex flex-col gap-1.5 px-4 py-3.5"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="font-semibold">{skill.name}</p>
                          {skill.level && (
                            <span className="annotate shrink-0">
                              {skill.level}
                            </span>
                          )}
                        </div>
                        {skill.detail && (
                          <p className="text-sm leading-relaxed text-fg-muted">
                            {skill.detail}
                          </p>
                        )}
                      </li>
                    )
                  )}
                </ul>
              </Section>
            ))}
          </div>
        )}

        <Link
          href="/about"
          className="control inline-flex items-center gap-2 self-start px-4 py-2.5 text-sm font-medium"
        >
          Mehr über mich
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </PageLayout>
  )
}
