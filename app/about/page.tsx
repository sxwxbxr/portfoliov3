"use client"

import Link from "next/link"
import { MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClassicSection } from "@/components/classic/classic-section"
import { SyntaxHighlight, CodeBlock } from "@/components/ide/code-block"
import { DualLayoutPage } from "@/components/dual-layout-page"
import { personalInfo, skillStacks } from "@/src/content"

export default function AboutPage() {
  const classic = (
    <>
      <section className="py-16 border-b border-border">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">About</p>
          <h1 className="text-4xl font-bold">{personalInfo.name}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">{personalInfo.summary}</p>
          <div className="flex gap-3 flex-wrap pt-2">
            <Badge variant="outline">{personalInfo.location}</Badge>
            <Badge variant="outline">Automation</Badge>
            <Badge variant="outline">Delivery</Badge>
          </div>
        </div>
      </section>

      <ClassicSection title="Story">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6 text-muted-foreground leading-relaxed">
            {personalInfo.about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Based in {personalInfo.location}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Response time: {personalInfo.contact.responseTime}</p>
              <Link className="text-primary hover:underline" href={`mailto:${personalInfo.contact.email}`}>
                {personalInfo.contact.email}
              </Link>
            </CardContent>
          </Card>
        </div>
      </ClassicSection>

      <ClassicSection title="Toolkit">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {skillStacks.skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {skillStacks.languages.map((language) => (
                <div key={language.name} className="flex items-center justify-between text-muted-foreground">
                  <span className="font-medium text-foreground">{language.name}</span>
                  <span>{language.level}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </ClassicSection>
    </>
  )

  const ide = (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
          <span>1</span>
          <SyntaxHighlight comment>{"// about/profile.ts"}</SyntaxHighlight>
        </div>
        <CodeBlock>
          <div className="space-y-1">
            <div>
              <SyntaxHighlight keyword>export</SyntaxHighlight> <SyntaxHighlight keyword>const</SyntaxHighlight>{" "}
              <SyntaxHighlight variable>profile</SyntaxHighlight> = {"{"}
            </div>
            <div className="pl-4">
              <SyntaxHighlight property>name</SyntaxHighlight>:{" "}
              <SyntaxHighlight string>{`"${personalInfo.name}"`}</SyntaxHighlight>,
            </div>
            <div className="pl-4">
              <SyntaxHighlight property>role</SyntaxHighlight>:{" "}
              <SyntaxHighlight string>{`"${personalInfo.title}"`}</SyntaxHighlight>,
            </div>
            <div className="pl-4">
              <SyntaxHighlight property>location</SyntaxHighlight>:{" "}
              <SyntaxHighlight string>{`"${personalInfo.location}"`}</SyntaxHighlight>,
            </div>
            <div className="pl-4">
              <SyntaxHighlight property>responseTime</SyntaxHighlight>:{" "}
              <SyntaxHighlight string>{`"${personalInfo.contact.responseTime}"`}</SyntaxHighlight>,
            </div>
            <div>{"}"}</div>
          </div>
        </CodeBlock>
        <div className="space-y-2 text-[var(--ide-text)] leading-relaxed">
          {personalInfo.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
          <span>24</span>
          <SyntaxHighlight comment>{"// about/skills.ts"}</SyntaxHighlight>
        </div>
        <CodeBlock>
          <div className="space-y-1">
            <div>
              <SyntaxHighlight keyword>const</SyntaxHighlight> <SyntaxHighlight variable>skills</SyntaxHighlight> = [
            </div>
            <div className="pl-4">
              {skillStacks.skills.map((skill, index) => (
                <span key={skill} className="pr-2">
                  <SyntaxHighlight string>{`"${skill}"`}</SyntaxHighlight>
                  {index < skillStacks.skills.length - 1 ? "," : ""}
                </span>
              ))}
            </div>
            <div>]</div>
          </div>
        </CodeBlock>
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

      <div className="space-y-2 text-[var(--ide-text)] text-sm">
        <p>
          Contact: <a className="text-[var(--ide-accent)]" href={`mailto:${personalInfo.contact.email}`}>
            {personalInfo.contact.email}
          </a>
        </p>
        <p>Location: {personalInfo.location}</p>
      </div>
    </div>
  )

  return <DualLayoutPage classic={classic} ide={ide} />
}
