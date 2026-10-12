import fs from "fs"
import path from "path"
import PageLayout, { Section } from "@/components/PageLayout"
import { ProseMarkdown } from "@/components/ProseMarkdown"
import { getSiteSettings } from "@/lib/data"
import { getCopy, localizePath, type Locale } from "@/lib/i18n"
import { JsonLd } from "@/components/JsonLd"
import { breadcrumbList } from "@/lib/structured-data"

export async function PrivacyView({ locale = "en" }: { locale?: Locale }) {
  const copy = getCopy(locale)
  const settings = await getSiteSettings()

  // Until the full notice is written in /admin, show a short placeholder
  // instead of a 404: the footer and the consent banner both link here.
  // The German edition never falls back to the English notice: it uses the
  // German DB text, else the German placeholder.
  const stored = locale === "de" ? settings.privacyContentDe : settings.privacyContent
  const content =
    stored.trim() ||
    fs.readFileSync(
      path.join(
        process.cwd(),
        "content",
        "legal",
        locale === "de" ? "privacy-placeholder.de.md" : "privacy-placeholder.md"
      ),
      "utf8"
    )

  return (
    <PageLayout
      label={copy.privacy.label}
      title={copy.privacy.title}
      subtitle={copy.privacy.subtitle}
    >
      <JsonLd
        data={breadcrumbList(
          [{ name: locale === "de" ? "Datenschutzerklärung" : "Privacy policy", path: localizePath("/privacy", locale) }],
          locale
        )}
      />
      <section className="sheet pb-24 md:pb-32">
        <Section>
          {/* Long-form legal text: one plain column under a hairline. */}
          <article className="border-t border-edge-soft pt-10">
            <ProseMarkdown>{content}</ProseMarkdown>
          </article>
        </Section>
      </section>
    </PageLayout>
  )
}
