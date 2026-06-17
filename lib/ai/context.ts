import {
  getProjects,
  getSkills,
  getExperience,
  getEducationEntries,
  getCertificates,
  getSiteSettings,
} from "@/lib/data"

// Narrative facts that don't live in the database. Keep this short and current.
export const SEYA_NARRATIVE = `- Seya is male and uses he/him pronouns.
- Based in St. Gallen, Switzerland.
- Availability: limited until Aug 2026 (finishing current role); from Sep 2026 focused full-time on a BSc Data Science at ZHAW Winterthur — freelance/part-time projects possible depending on scope.
- Languages: German (native), English (fluent), French (basic).
- Preferred contact: info@sweber.dev`

/**
 * Builds a compact, DB-backed context block about Seya for the AI system
 * prompts. Single source of truth — projects, skills, experience, education and
 * certificates come live from the database; only the narrative above is static.
 */
export async function buildSeyaContext(): Promise<string> {
  const [projects, skills, experience, education, certificates, settings] =
    await Promise.all([
      getProjects(),
      getSkills(),
      getExperience(),
      getEducationEntries(),
      getCertificates(),
      getSiteSettings(),
    ])

  // Group skills by category, preserving sortOrder.
  const skillsByCategory = new Map<string, string[]>()
  for (const skill of skills) {
    const key = skill.category || "Other"
    if (!skillsByCategory.has(key)) skillsByCategory.set(key, [])
    skillsByCategory.get(key)!.push(skill.name)
  }
  const skillLines = [...skillsByCategory.entries()].map(
    ([category, names]) => `- ${category}: ${names.join(", ")}`
  )

  const projectLines = projects.map((p) => {
    const summary = p.shortDescription || p.description || ""
    const tags = (p.tags ?? []).join(", ")
    return `- ${p.title}${summary ? ` — ${summary}` : ""}${tags ? ` [${tags}]` : ""}`
  })

  const experienceLines = experience.map(
    (e) =>
      `- ${e.role} at ${e.company}${e.period ? ` (${e.period})` : ""}${
        e.current ? " — current" : ""
      }`
  )

  const educationLines = education.map(
    (ed) =>
      `- ${ed.title}${ed.institution ? `, ${ed.institution}` : ""}${
        ed.period ? ` (${ed.period})` : ""
      }`
  )

  const certificateLines = certificates.map(
    (c) =>
      `- ${c.name}${c.provider ? ` (${c.provider})` : ""}${
        c.status ? ` — ${c.status}` : ""
      }`
  )

  const sections: string[] = ["# About Seya Weber"]
  if (settings.currentRole) {
    sections.push(
      `Current role: ${settings.currentRole}${
        settings.currentEmployer ? ` at ${settings.currentEmployer}` : ""
      }.`
    )
  }
  if (settings.contactLocation) sections.push(`Location: ${settings.contactLocation}.`)
  if (settings.contactEmail) sections.push(`Contact: ${settings.contactEmail}.`)
  sections.push(SEYA_NARRATIVE)

  if (skillLines.length) sections.push("", "## Skills", ...skillLines)
  if (projectLines.length) sections.push("", "## Projects", ...projectLines)
  if (experienceLines.length) sections.push("", "## Experience", ...experienceLines)
  if (educationLines.length) sections.push("", "## Education", ...educationLines)
  if (certificateLines.length) sections.push("", "## Certificates", ...certificateLines)

  return sections.join("\n")
}
