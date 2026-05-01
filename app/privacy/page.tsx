import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import PageLayout, { Section } from "../../components/PageLayout"
import { getSiteSettings } from "@/lib/data"

export const revalidate = 60

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
      title="Privacy"
      subtitle="How data submitted through this site is processed."
    >
      <Section className="pb-24 md:pb-32">
        <div className="max-w-[720px] mx-auto px-6">
          <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-p:leading-[1.75] prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            <ReactMarkdown>{settings.privacyContent}</ReactMarkdown>
          </article>
        </div>
      </Section>
    </PageLayout>
  )
}
