"use client"

import Link from "next/link"
import { Mail, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ClassicSection } from "@/components/classic/classic-section"
import { SyntaxHighlight, CodeBlock } from "@/components/ide/code-block"
import { DualLayoutPage } from "@/components/dual-layout-page"
import { personalInfo } from "@/src/content"

export default function ContactPage() {
  const classic = (
    <>
      <section className="py-16 border-b border-border">
        <div className="space-y-4 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
          <h1 className="text-4xl font-bold">Let&apos;s collaborate</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Share what you&apos;re building or migrating. I respond within {personalInfo.contact.responseTime}.
          </p>
        </div>
      </section>

      <ClassicSection title="How to reach me">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email
            </CardTitle>
            <CardDescription>Fastest way to reach me.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <Link className="text-primary hover:underline" href={`mailto:${personalInfo.contact.email}`}>
              {personalInfo.contact.email}
            </Link>
            <p>Response time: {personalInfo.contact.responseTime}</p>
          </CardContent>
        </Card>
        <div className="pt-6 text-sm text-muted-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4" /> {personalInfo.location}
        </div>
      </ClassicSection>
    </>
  )

  const ide = (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
          <span>1</span>
          <SyntaxHighlight comment>{"// contact/info.ts"}</SyntaxHighlight>
        </div>
        <CodeBlock>
          <div className="space-y-1">
            <div>{"{"}</div>
            <div className="pl-4">
              <SyntaxHighlight property>email</SyntaxHighlight>:{" "}
              <SyntaxHighlight string>{`"${personalInfo.contact.email}"`}</SyntaxHighlight>,
            </div>
            <div className="pl-4">
              <SyntaxHighlight property>responseTime</SyntaxHighlight>:{" "}
              <SyntaxHighlight string>{`"${personalInfo.contact.responseTime}"`}</SyntaxHighlight>,
            </div>
            <div className="pl-4">
              <SyntaxHighlight property>location</SyntaxHighlight>:{" "}
              <SyntaxHighlight string>{`"${personalInfo.location}"`}</SyntaxHighlight>
            </div>
            <div>{"}"}</div>
          </div>
        </CodeBlock>
      </div>

      <Card className="bg-[var(--ide-sidebar)] border-[var(--ide-border)] max-w-xl">
        <CardHeader>
          <CardTitle className="text-[var(--ide-text)] flex items-center gap-2">
            <Mail className="h-5 w-5 text-[var(--ide-accent)]" /> Contact
          </CardTitle>
          <CardDescription className="text-[var(--ide-text-muted)]">
            Response time: {personalInfo.contact.responseTime}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-[var(--ide-text)] text-sm space-y-2">
          <p>
            Email: <a className="text-[var(--ide-accent)]" href={`mailto:${personalInfo.contact.email}`}>
              {personalInfo.contact.email}
            </a>
          </p>
          <p>Location: {personalInfo.location}</p>
        </CardContent>
      </Card>
    </div>
  )

  return <DualLayoutPage classic={classic} ide={ide} />
}
