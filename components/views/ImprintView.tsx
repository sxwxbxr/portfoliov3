import fs from "fs"
import path from "path"
import PageLayout, { Section } from "@/components/PageLayout"
import { ProseMarkdown } from "@/components/ProseMarkdown"
import { getCopy, localizePath, type Locale } from "@/lib/i18n"
import { JsonLd } from "@/components/JsonLd"
import { breadcrumbList } from "@/lib/structured-data"

export function ImprintView({ locale = "en" }: { locale?: Locale }) {
  const copy = getCopy(locale)
  const body = fs.readFileSync(
    path.join(process.cwd(), "content", "legal", locale === "de" ? "imprint.de.md" : "imprint.md"),
    "utf8"
  )
  return (
    <PageLayout
      label={copy.packages.imprintLabel}
      title={copy.packages.imprintTitle}
      subtitle={copy.packages.imprintSubtitle}
    >
      <JsonLd
        data={breadcrumbList(
          [{ name: locale === "de" ? "Impressum" : "Imprint", path: localizePath("/imprint", locale) }],
          locale
        )}
      />
      <section className="sheet pb-24 md:pb-32">
        <Section>
          <article className="border-t border-edge-soft pt-10">
            <ProseMarkdown>{body}</ProseMarkdown>
          </article>
        </Section>
      </section>
    </PageLayout>
  )
}
