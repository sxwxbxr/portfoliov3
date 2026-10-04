import { SkillPopover } from "@/components/skill-explorer/SkillPopover"
import { AI_FEATURES_ENABLED } from "@/lib/features"
import { copy } from "@/lib/copy"

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
    const key = skill.category || copy.about.uncategorised
    if (!groups.has(key)) {
      groups.set(key, [])
      order.push(key)
    }
    groups.get(key)!.push(skill)
  }
  return order.map((category) => ({ category, items: groups.get(category)! }))
}

/**
 * Skills grouped by category: a heading per category and one hairline-separated
 * row per skill.
 *
 * Deliberately no proficiency bars, meters or stars. A self-assessed meter
 * invents a precision the underlying data does not have, and to a technical
 * reader it is the clearest junior signal on a portfolio. The level stays a
 * plain word.
 */
export function SkillGroups({ skills }: { skills: SkillRow[] }) {
  const groups = groupByCategory(skills)
  if (groups.length === 0) return null

  return (
    <div className="flex flex-col gap-12">
      {groups.map((group) => (
        <div key={group.category} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4 pb-2">
            <h3 className="text-lg tracking-tight">
              {group.category}
            </h3>
            <span className="annotate">
              {String(group.items.length).padStart(2, "0")}
            </span>
          </div>

          <ul className="border-t border-edge-soft">
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
                  className="flex flex-col gap-1.5 border-b border-edge-soft py-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p>{skill.name}</p>
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
