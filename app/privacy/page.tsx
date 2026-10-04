import fs from "fs"
import path from "path"
import PageLayout, { Section } from "../../components/PageLayout"
import { ProseMarkdown } from "../../components/ProseMarkdown"
import { getSiteSettings } from "@/lib/data"
import { copy } from "@/lib/copy"

export const revalidate = 86400

export const metadata = {
  title: "Privacy",
  description:
    "How personal data submitted via this site is processed and stored.",
}

export default async function Privacy() {
  const settings = await getSiteSettings()

  // Until the full notice is written in /admin, show a short placeholder
  // instead of a 404: the footer and the consent banner both link here.
  const content =
    settings.privacyContent.trim() ||
    fs.readFileSync(
      path.join(process.cwd(), "content", "legal", "privacy-placeholder.md"),
      "utf8"
    )

  return (
    <PageLayout
      label={copy.privacy.label}
      title={copy.privacy.title}
      subtitle={copy.privacy.subtitle}
    >
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
