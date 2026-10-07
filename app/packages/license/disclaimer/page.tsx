import type { Metadata } from "next"
import fs from "fs"
import path from "path"
import PageLayout, { Section } from "@/components/PageLayout"
import { ProseMarkdown } from "@/components/ProseMarkdown"
import { pkgUrl } from "@/lib/packages/urls"
import { copy } from "@/lib/copy"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "No legal advice: what Permito does, and what stays with you.",
  alternates: { canonical: pkgUrl("/license/disclaimer") },
}

export default function DisclaimerPage() {
  const body = fs.readFileSync(
    path.join(process.cwd(), "content", "legal", "disclaimer.md"),
    "utf8"
  )
  return (
    <PageLayout
      label={copy.packages.licenseLabel}
      title="Disclaimer"
      subtitle="No legal advice: what Permito does, and what stays with you."
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
