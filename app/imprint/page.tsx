import type { Metadata } from "next"
import fs from "fs"
import path from "path"
import PageLayout, { Section } from "@/components/PageLayout"
import { ProseMarkdown } from "@/components/ProseMarkdown"
import { copy } from "@/lib/copy"
import { pageMetadata } from "@/lib/seo"

export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  title: "Imprint",
  description:
    "Legal notice for sweber.dev and its subdomains: Weber Development, Seya Weber, Bichwil SG, Switzerland, with postal address and contact details.",
  path: "/imprint",
})

export default function Imprint() {
  const body = fs.readFileSync(
    path.join(process.cwd(), "content", "legal", "imprint.md"),
    "utf8"
  )
  return (
    <PageLayout
      label={copy.packages.imprintLabel}
      title={copy.packages.imprintTitle}
      subtitle={copy.packages.imprintSubtitle}
    >
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
