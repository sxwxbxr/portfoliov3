"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ClassicSection } from "@/components/classic/classic-section"
import { SyntaxHighlight, CodeBlock } from "@/components/ide/code-block"
import { DualLayoutPage } from "@/components/dual-layout-page"
import { experiences } from "@/src/content"

export default function ExperiencePage() {
  const classic = (
    <>
      <section className="py-16 border-b border-border">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Experience</p>
          <h1 className="text-4xl font-bold">Delivery at the intersection of software and operations</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Hands-on project management and engineering in automation, migration, and product delivery.
          </p>
        </div>
      </section>

      <ClassicSection title="Roles">
        <div className="space-y-6">
          {experiences.map((experience) => (
            <Card key={experience.role} className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{experience.role}</span>
                  <span className="text-sm text-muted-foreground">{experience.period}</span>
                </CardTitle>
                <CardDescription>{experience.company}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                {experience.highlights.map((highlight) => (
                  <p key={highlight}>• {highlight}</p>
                ))}
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
          <SyntaxHighlight comment>{"// experience/index.ts"}</SyntaxHighlight>
        </div>
        <CodeBlock>
          <div className="space-y-1">
            <div>
              <SyntaxHighlight keyword>export</SyntaxHighlight> <SyntaxHighlight keyword>const</SyntaxHighlight>{" "}
              <SyntaxHighlight variable>roles</SyntaxHighlight> = [
            </div>
            {experiences.map((experience, idx) => (
              <div key={experience.role} className="pl-4 space-y-1">
                <div>{"{"}</div>
                <div className="pl-4">
                  <SyntaxHighlight property>role</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>{`"${experience.role}"`}</SyntaxHighlight>,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>company</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>{`"${experience.company}"`}</SyntaxHighlight>,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>period</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>{`"${experience.period}"`}</SyntaxHighlight>,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>highlights</SyntaxHighlight>: [
                </div>
                <div className="pl-8">
                  {experience.highlights.map((highlight, highlightIdx) => (
                    <div key={highlight}>
                      <SyntaxHighlight string>{`"${highlight}"`}</SyntaxHighlight>
                      {highlightIdx < experience.highlights.length - 1 ? "," : ""}
                    </div>
                  ))}
                </div>
                <div className="pl-4">]</div>
                <div>{"}"}{idx < experiences.length - 1 ? "," : ""}</div>
              </div>
            ))}
            <div>]</div>
          </div>
        </CodeBlock>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {experiences.map((experience) => (
          <Card key={experience.role} className="bg-[var(--ide-sidebar)] border-[var(--ide-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--ide-text)] flex items-center justify-between">
                <span>{experience.role}</span>
                <span className="text-xs text-[var(--ide-text-muted)]">{experience.period}</span>
              </CardTitle>
              <CardDescription className="text-[var(--ide-text-muted)]">{experience.company}</CardDescription>
            </CardHeader>
            <CardContent className="text-[var(--ide-text)] text-sm space-y-1">
              {experience.highlights.map((highlight) => (
                <p key={highlight}>• {highlight}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return <DualLayoutPage classic={classic} ide={ide} />
}
