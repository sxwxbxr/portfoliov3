import Link from "next/link"
import PageLayout, { Section } from "../../components/PageLayout"
import { getSkills } from "@/lib/data"

export const revalidate = 60

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
      title="Skills & Expertise"
      subtitle="Technical expertise and competencies developed across software development, project management, and engineering."
    >
      <section className="pb-24 md:pb-32">
        <div className="max-w-[1200px] mx-auto px-6">
          {groups.length === 0 ? (
            <div className="glass rounded-xl p-10 md:p-14 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Nothing posted yet
              </p>
              <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
                Skills inventory in progress.
              </h3>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Add entries through the admin panel to populate this section.
              </p>
            </div>
          ) : (
            <div>
              {groups.map((group, gi) => (
                <Section key={group.category} delay={gi * 0.04}>
                  <div
                    className={`grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3 md:gap-12 py-10 ${
                      gi > 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <h2 className="font-display font-semibold text-base md:sticky md:top-24 self-start">
                      {group.category}
                    </h2>
                    <div className="space-y-0">
                      {group.items.map((skill, i) => (
                        <div
                          key={`${skill.category}-${skill.name}-${i}`}
                          className={`flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 md:gap-6 py-4 ${
                            i > 0 ? "border-t border-border" : ""
                          }`}
                        >
                          <div className="md:flex-1">
                            <p className="font-semibold">{skill.name}</p>
                            {skill.detail && (
                              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                {skill.detail}
                              </p>
                            )}
                          </div>
                          {skill.level && (
                            <span className="font-mono text-xs text-muted-foreground md:text-right shrink-0">
                              {skill.level}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>
              ))}
              <div className="border-t border-border" />
            </div>
          )}

          <div className="mt-12">
            <Link
              href="/about"
              className="link-underline text-primary text-sm font-medium"
            >
              More about me &rarr;
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
