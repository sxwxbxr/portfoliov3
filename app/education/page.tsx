"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ClassicSection } from "@/components/classic/classic-section"
import { SyntaxHighlight, CodeBlock } from "@/components/ide/code-block"
import { DualLayoutPage } from "@/components/dual-layout-page"
import { education } from "@/src/content"

export default function EducationPage() {
  const classic = (
    <>
      <section className="py-16 border-b border-border">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Education</p>
          <h1 className="text-4xl font-bold">Continuous learning that strengthens delivery</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            From vocational training to ongoing studies, every step reinforces pragmatic engineering and project leadership.
          </p>
        </div>
      </section>

      <ClassicSection title="Milestones">
        <div className="space-y-6">
          {education.map((entry) => (
            <Card key={entry.title} className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{entry.title}</span>
                  <span className="text-sm text-muted-foreground">{entry.period}</span>
                </CardTitle>
                <CardDescription>{entry.school}</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">{entry.focus}</CardContent>
            </Card>
          ))}
        </div>
      </ClassicSection>
    </>
  )

  const ide = (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
          <span>1</span>
          <SyntaxHighlight comment>{"// education/index.ts"}</SyntaxHighlight>
        </div>
        <CodeBlock>
          <div className="space-y-1">
            <div>
              <SyntaxHighlight keyword>export</SyntaxHighlight> <SyntaxHighlight keyword>const</SyntaxHighlight>{" "}
              <SyntaxHighlight variable>education</SyntaxHighlight> = [
            </div>
            {education.map((entry, idx) => (
              <div key={entry.title} className="pl-4 space-y-1">
                <div>{"{"}</div>
                <div className="pl-4">
                  <SyntaxHighlight property>title</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>{`"${entry.title}"`}</SyntaxHighlight>,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>period</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>{`"${entry.period}"`}</SyntaxHighlight>,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>focus</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>{`"${entry.focus}"`}</SyntaxHighlight>,
                </div>
                <div>{"}"}{idx < education.length - 1 ? "," : ""}</div>
              </div>
            ))}
            <div>]</div>
          </div>
        </CodeBlock>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {education.map((entry) => (
          <Card key={entry.title} className="bg-[var(--ide-sidebar)] border-[var(--ide-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--ide-text)] flex items-center justify-between">
                <span>{entry.title}</span>
                <span className="text-xs text-[var(--ide-text-muted)]">{entry.period}</span>
              </CardTitle>
              <CardDescription className="text-[var(--ide-text-muted)]">{entry.school}</CardDescription>
            </CardHeader>
            <CardContent className="text-[var(--ide-text)] text-sm leading-relaxed">{entry.focus}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return <DualLayoutPage classic={classic} ide={ide} />
}
