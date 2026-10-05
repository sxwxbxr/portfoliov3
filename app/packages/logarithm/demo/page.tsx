import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { AuditPlayground } from "@/components/packages/demo/logarithm/AuditPlayground"
import { logarithmDemo as t } from "@/lib/demo/logarithm-copy"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"

export const revalidate = 60

const RECORD = `// app/projects/actions.ts
await audit.with({ tenantId: org.id, actor: { id: user.id, name: user.name } }).record({
  action: "project.updated",
  targets: [{ type: "project", id: project.id, name: project.name }],
  before: project,
  after: updated,
})`

const ROUTE = `// app/api/audit/route.ts
import { createAuditHandler } from "@sweberdev/logarithm"

export const GET = createAuditHandler({
  log: audit,
  async authorize() {
    const session = await getSession()
    return session?.role === "admin" ? { tenantId: session.orgId } : null
  },
})`

const VIEW = `// app/settings/activity/page.tsx
"use client"
import { AuditLog } from "@sweberdev/logarithm-react"
import "@sweberdev/logarithm-react/styles.css"

export default function Activity() {
  return <AuditLog endpoint="/api/audit" locale="de-CH" />
}`

export function generateMetadata(): Metadata {
  const url = pkgUrl("/logarithm/demo")
  return {
    title: { absolute: t.seoTitle },
    description: t.description,
    alternates: { canonical: url },
    openGraph: { title: t.seoTitle, description: t.description, url, type: "website" },
  }
}

export default function LogarithmDemoPage() {
  const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"

  return (
    <PageLayout>
      <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex flex-col items-start gap-8">
          <Link
            href={pkgPath("/logarithm")}
            className="annotate inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-fg"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t.overview}
          </Link>

          <h1 className="display text-balance">
            {t.title}
            <span className="headline-sub">{t.titleSub}</span>
          </h1>

          <div className="flex max-w-2xl flex-col gap-4">
            <p className="text-lg leading-relaxed text-fg-muted">{t.intro}</p>
            <p className="text-sm leading-relaxed text-fg-muted">{t.isolation}</p>
          </div>
        </div>
      </header>

      <Block label={t.app.label} title={t.app.title} sub={t.app.sub} lede={<p>{t.app.lede}</p>} flush>
        <AuditPlayground />
      </Block>

      <Block label={t.code.label} title={t.code.title} sub={t.code.sub} lede={<p>{t.code.lede}</p>}>
        <div className="grid min-w-0 gap-6 lg:grid-cols-3">
          <CodeBlock code={RECORD} label="Record an event" />
          <CodeBlock code={ROUTE} label="API route" />
          <CodeBlock code={VIEW} label="Activity page" />
        </div>
      </Block>

      <Block
        label={t.closing.label}
        title={t.closing.title}
        sub={t.closing.sub}
        lede={<p>{t.closing.lede}</p>}
        aside={
          <div className="flex flex-wrap items-start gap-3">
            <Link href={pkgPath("/logarithm/docs")} className={btn + " control-primary"}>
              {t.docs}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link href={`${pkgPath("/logarithm")}#pricing`} className={btn}>
              {t.pricing}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        }
      />
    </PageLayout>
  )
}
