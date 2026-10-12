import type { Metadata } from "next"
import fs from "fs"
import path from "path"
import PageLayout, { Section } from "@/components/PageLayout"
import { ProseMarkdown } from "@/components/ProseMarkdown"
import { pkgUrl } from "@/lib/packages/urls"
import { copy } from "@/lib/copy"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Licence terms",
  description: copy.packages.licenseSubtitle,
  alternates: { canonical: pkgUrl("/license") },
}

export default function LicensePage() {
  const body = fs.readFileSync(
    path.join(process.cwd(), "content", "legal", "license.md"),
    "utf8"
  )
  return (
    <PageLayout
      label={copy.packages.licenseLabel}
      title={copy.packages.licenseTitle}
      subtitle={copy.packages.licenseSubtitle}
    >
      <section className="sheet pb-24 md:pb-32">
        <Section>
          <article className="cast mx-auto max-w-[860px] p-7 md:p-12">
            <ProseMarkdown>{body}</ProseMarkdown>
          </article>
        </Section>
      </section>
    </PageLayout>
  )
}
