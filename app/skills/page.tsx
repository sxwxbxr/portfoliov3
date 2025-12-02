"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ClassicSection } from "@/components/classic/classic-section"
import { SyntaxHighlight, CodeBlock } from "@/components/ide/code-block"
import { DualLayoutPage } from "@/components/dual-layout-page"
import { skillStacks } from "@/src/content"

export default function SkillsPage() {
  const classic = (
    <>
      <section className="py-16 border-b border-border">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Skills</p>
          <h1 className="text-4xl font-bold">Tools I ship with</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A pragmatic stack for building, migrating, and automating software with teams.
          </p>
        </div>
      </section>

      <ClassicSection title="Technical">
        <Card>
          <CardHeader>
            <CardTitle>Core stack</CardTitle>
            <CardDescription>Technologies I rely on to move projects forward</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {skillStacks.skills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </CardContent>
        </Card>
      </ClassicSection>

      <ClassicSection title="Languages">
        <div className="grid md:grid-cols-2 gap-4">
          {skillStacks.languages.map((language) => (
            <Card key={language.name}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{language.name}</span>
                  <span className="text-sm text-muted-foreground">{language.level}</span>
                </CardTitle>
              </CardHeader>
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
          <SyntaxHighlight comment>{"// skills/index.ts"}</SyntaxHighlight>
        </div>
        <CodeBlock>
          <div className="space-y-1">
            <div>
              <SyntaxHighlight keyword>export</SyntaxHighlight> <SyntaxHighlight keyword>const</SyntaxHighlight>{" "}
              <SyntaxHighlight variable>skills</SyntaxHighlight> = [
            </div>
            <div className="pl-4">
              {skillStacks.skills.map((skill, idx) => (
                <span key={skill} className="pr-2">
                  <SyntaxHighlight string>{`"${skill}"`}</SyntaxHighlight>
                  {idx < skillStacks.skills.length - 1 ? "," : ""}
                </span>
              ))}
            </div>
            <div>]</div>
          </div>
        </CodeBlock>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
          <span>18</span>
          <SyntaxHighlight comment>{"// skills/languages.ts"}</SyntaxHighlight>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {skillStacks.languages.map((language) => (
            <Card key={language.name} className="bg-[var(--ide-sidebar)] border-[var(--ide-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--ide-text)] flex items-center justify-between">
                  <span>{language.name}</span>
                  <span className="text-sm text-[var(--ide-text-muted)]">{language.level}</span>
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  return <DualLayoutPage classic={classic} ide={ide} />
}
