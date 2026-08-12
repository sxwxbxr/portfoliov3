import { notFound } from "next/navigation"
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

  if (!settings.privacyContent.trim()) {
    notFound()
  }

  return (
    <PageLayout
      label={copy.privacy.label}
      title={copy.privacy.title}
      subtitle={copy.privacy.subtitle}
    >
      <section className="sheet pb-24 md:pb-32">
        <Section>
          {/* Long-form legal text reads best as one continuous surface, so it
              gets a single plate rather than a stack of cards. */}
          <article className="cast rim mx-auto max-w-[860px] p-7 md:p-12">
            <ProseMarkdown>{settings.privacyContent}</ProseMarkdown>
          </article>
        </Section>
      </section>
    </PageLayout>
  )
}
