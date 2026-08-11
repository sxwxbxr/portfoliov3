import { SkillPopover } from "@/components/skill-explorer/SkillPopover"
import { AI_FEATURES_ENABLED } from "@/lib/features"

export interface SkillRow {
  category: string
  name: string
  detail: string
  level: string
  sortOrder: number
}

export function groupByCategory(skills: SkillRow[]) {
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
  return order.map((category) => ({ category, items: groups.get(category)! }))
}

/**
 * Skills grouped by category: one sunken tray per category with each skill
 * seated in it.
 *
 * Deliberately no proficiency bars, meters or stars. A self-assessed meter
 * invents a precision the underlying data does not have, and to a technical
 * reader it is the clearest junior signal on a portfolio. The level stays a
 * mono word.
 */
export function SkillGroups({ skills }: { skills: SkillRow[] }) {
  const groups = groupByCategory(skills)
  if (groups.length === 0) return null

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <div key={group.category} className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4 px-1">
            <h3 className="font-display text-lg font-semibold tracking-tight md:text-xl">
              {group.category}
            </h3>
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
                      <span className="annotate shrink-0">{skill.level}</span>
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
        </div>
      ))}
    </div>
  )
}
