"use client"

import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClassicSection } from "@/components/classic/classic-section"
import { SyntaxHighlight, CodeBlock } from "@/components/ide/code-block"
import { DualLayoutPage } from "@/components/dual-layout-page"
import { caseStudies } from "@/src/config"

export default function CaseStudyDetail({ params }: { params: { slug: string } }) {
  const study = caseStudies.find((item) => item.slug === params.slug)

  if (!study) {
    notFound()
  }

  const classic = (
    <>
      <section className="py-16 border-b border-border">
        <div className="space-y-4 max-w-4xl">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Case Study</p>
          <h1 className="text-4xl font-bold">{study.title}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{study.challenge}</p>
          <div className="flex gap-3 flex-wrap text-sm text-muted-foreground">
            <span>{study.industry}</span>
            <span>• {study.duration}</span>
            <span>• {study.team}</span>
          </div>
        </div>
      </section>

      <ClassicSection title="Solution">
        <Card>
          <CardHeader>
            <CardTitle>Approach</CardTitle>
            <CardDescription>{study.client}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>{study.solution}</p>
            <div>
              <p className="font-semibold text-foreground mb-2">Results</p>
              <ul className="list-disc pl-5 space-y-1">
                {study.results.map((result) => (
                  <li key={result}>{result}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </ClassicSection>
    </>
  )

  const ide = (
    <div className="space-y-8 max-w-5xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
          <span>1</span>
          <SyntaxHighlight comment>{`// case-studies/${study.slug}.ts`}</SyntaxHighlight>
        </div>
        <CodeBlock>
          <div className="space-y-1">
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
            <div className="pl-4">
              <SyntaxHighlight property>team</SyntaxHighlight>:{" "}
              <SyntaxHighlight string>{`"${study.team}"`}</SyntaxHighlight>,
            </div>
            <div className="pl-4">
              <SyntaxHighlight property>challenge</SyntaxHighlight>:{" "}
              <SyntaxHighlight string>{`"${study.challenge}"`}</SyntaxHighlight>,
            </div>
            <div className="pl-4">
              <SyntaxHighlight property>solution</SyntaxHighlight>:{" "}
              <SyntaxHighlight string>{`"${study.solution}"`}</SyntaxHighlight>,
            </div>
            <div className="pl-4">
              <SyntaxHighlight property>results</SyntaxHighlight>: [
            </div>
            <div className="pl-8">
              {study.results.map((result, idx) => (
                <div key={result}>
                  <SyntaxHighlight string>{`"${result}"`}</SyntaxHighlight>
                  {idx < study.results.length - 1 ? "," : ""}
                </div>
              ))}
            </div>
            <div className="pl-4">]</div>
            <div>{"}"}</div>
          </div>
        </CodeBlock>
      </div>

      <Card className="bg-[var(--ide-sidebar)] border-[var(--ide-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--ide-text)]">{study.title}</CardTitle>
          <CardDescription className="text-[var(--ide-text-muted)]">{study.industry} • {study.duration}</CardDescription>
        </CardHeader>
        <CardContent className="text-[var(--ide-text)] space-y-3 text-sm leading-relaxed">
          <p>{study.challenge}</p>
          <p>{study.solution}</p>
          <div className="space-y-1">
            <p className="font-semibold text-[var(--ide-text)]">Results</p>
            <div className="flex flex-wrap gap-2">
              {study.results.map((result) => (
                <Badge key={result} className="bg-[var(--ide-accent)] text-white">
                  {result}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return <DualLayoutPage classic={classic} ide={ide} />
}
