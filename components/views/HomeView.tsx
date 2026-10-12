import {
  getProjects,
  getExperience,
  getBlogPosts,
  getCaseStudies,
  getSiteSettings,
} from "@/lib/data"
import HomeContent from "@/components/HomeContent"
import { BLOG_ENABLED, CASE_STUDIES_ENABLED } from "@/lib/features"
import { resolveImage } from "@/lib/project-image"
import { localizeExperience, localizeProject, localizeSettings } from "@/lib/i18n-data"
import { derivePeriodRange } from "@/lib/period-range"
import type { Locale } from "@/lib/i18n"
import { JsonLd } from "@/components/JsonLd"
import { faqPage } from "@/lib/structured-data"
import { home as homeEn } from "@/content/home/en"
import { home as homeDe } from "@/content/home/de"

export async function HomeView({ locale = "en" }: { locale?: Locale }) {
  const [projects, experience, blogPosts, caseStudies, settings] = await Promise.all([
    getProjects(),
    getExperience(),
    BLOG_ENABLED ? getBlogPosts() : Promise.resolve([]),
    CASE_STUDIES_ENABLED ? getCaseStudies() : Promise.resolve([]),
    getSiteSettings(),
  ])

  // Resolved here rather than in the tile: the check touches the filesystem and
  // must not be dragged into the client bundle.
  const withImages = projects.map((p) => ({
    ...localizeProject(p, locale),
    imageSrc: resolveImage(p.image),
  }))

  const { faq } = locale === "de" ? homeDe : homeEn

  return (
    <>
    {faq.length > 0 && <JsonLd data={faqPage(faq, locale === "de" ? "/de" : "/", locale)} />}
    <HomeContent
      projects={withImages}
      experience={experience.map((e) => {
        const row = localizeExperience(e, locale)
        // The stored period is English ("Jan 2023 -- Present"); rebuild it for German.
        if (locale !== "de") return row
        return { ...row, period: derivePeriodRange(e.startDate, e.endDate, locale).period || row.period }
      })}
      blogPosts={blogPosts}
      caseStudies={caseStudies}
      settings={localizeSettings(settings, locale)}
    />
    </>
  )
}
