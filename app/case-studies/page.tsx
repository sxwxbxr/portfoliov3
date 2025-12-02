"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ClassicSection } from "@/components/classic/classic-section"
import { SyntaxHighlight, CodeBlock } from "@/components/ide/code-block"
import { DualLayoutPage } from "@/components/dual-layout-page"
import { caseStudies } from "@/src/config"

export default function CaseStudiesPage() {
  const classic = (
    <>
      <section className="py-16 border-b border-border">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Case Studies</p>
          <h1 className="text-4xl font-bold">Impactful deliveries</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Practical examples of migrations, automation, and operational upgrades.
          </p>
        </div>
      </section>

      <ClassicSection title="Highlights">
        <div className="grid md:grid-cols-2 gap-6">
          {caseStudies.map((study) => (
            <Card key={study.slug} className="h-full border-border">
              <CardHeader>
                <CardTitle>{study.title}</CardTitle>
                <CardDescription>{study.industry} • {study.duration}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>{study.challenge}</p>
                <Link className="text-primary text-sm font-medium hover:underline" href={`/case-studies/${study.slug}`}>
                  Read more
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </ClassicSection>
    </>
  )

  const ide = (
    <div className="space-y-8 max-w-5xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
          <span>1</span>
          <SyntaxHighlight comment>{"// case-studies/index.ts"}</SyntaxHighlight>
        </div>
        <CodeBlock>
          <div className="space-y-1">
            <div>
              <SyntaxHighlight keyword>export</SyntaxHighlight> <SyntaxHighlight keyword>const</SyntaxHighlight>{" "}
              <SyntaxHighlight variable>caseStudies</SyntaxHighlight> = [
            </div>
            {caseStudies.map((study, idx) => (
              <div key={study.slug} className="pl-4 space-y-1">
                <div>{"{"}</div>
                <div className="pl-4">
                  <SyntaxHighlight property>title</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>{`"${study.title}"`}</SyntaxHighlight>,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>industry</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>{`"${study.industry}"`}</SyntaxHighlight>,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>duration</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>{`"${study.duration}"`}</SyntaxHighlight>,
                </div>
                <div>{"}"}{idx < caseStudies.length - 1 ? "," : ""}</div>
              </div>
            ))}
            <div>]</div>
          </div>
        </CodeBlock>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {caseStudies.map((study) => (
          <Card key={study.slug} className="bg-[var(--ide-sidebar)] border-[var(--ide-border)] h-full">
            <CardHeader>
              <CardTitle className="text-[var(--ide-text)]">{study.title}</CardTitle>
              <CardDescription className="text-[var(--ide-text-muted)]">{study.industry} • {study.duration}</CardDescription>
            </CardHeader>
            <CardContent className="text-[var(--ide-text)] text-sm space-y-2">
              <p>{study.challenge}</p>
              <Link className="text-[var(--ide-accent)]" href={`/case-studies/${study.slug}`}>
                Read more →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return <DualLayoutPage classic={classic} ide={ide} />
}
