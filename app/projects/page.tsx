"use client"

import Link from "next/link"
import { Rocket } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClassicSection } from "@/components/classic/classic-section"
import { SyntaxHighlight, CodeBlock } from "@/components/ide/code-block"
import { DualLayoutPage } from "@/components/dual-layout-page"
import { projects } from "@/src/config"

export default function ProjectsPage() {
  const classic = (
    <>
      <section className="py-16 border-b border-border">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Projects</p>
          <h1 className="text-4xl font-bold">Selected work across industries</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Migrations, automation, and products delivered with measurable outcomes.
          </p>
        </div>
      </section>

      <ClassicSection title="All projects">
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.slug} className="h-full border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  {project.title}
                </CardTitle>
                <CardDescription>{project.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {project.tags.slice(0, 5).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Link className="text-primary text-sm font-medium hover:underline" href={`/projects/${project.slug}`}>
                  View details
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
          <SyntaxHighlight comment>{"// projects/index.ts"}</SyntaxHighlight>
        </div>
        <CodeBlock>
          <div className="space-y-1">
            <div>
              <SyntaxHighlight keyword>export</SyntaxHighlight> <SyntaxHighlight keyword>const</SyntaxHighlight>{" "}
              <SyntaxHighlight variable>projects</SyntaxHighlight> = [
            </div>
            {projects.map((project, idx) => (
              <div key={project.slug} className="pl-4 space-y-1">
                <div>{"{"}</div>
                <div className="pl-4">
                  <SyntaxHighlight property>title</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>{`"${project.title}"`}</SyntaxHighlight>,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>slug</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>{`"${project.slug}"`}</SyntaxHighlight>,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>tags</SyntaxHighlight>: [
                </div>
                <div className="pl-8">
                  {project.tags.slice(0, 4).map((tag, tagIdx) => (
                    <div key={tag}>
                      <SyntaxHighlight string>{`"${tag}"`}</SyntaxHighlight>
                      {tagIdx < project.tags.slice(0, 4).length - 1 ? "," : ""}
                    </div>
                  ))}
                </div>
                <div className="pl-4">]</div>
                <div>{"}"}{idx < projects.length - 1 ? "," : ""}</div>
              </div>
            ))}
            <div>]</div>
          </div>
        </CodeBlock>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <Card key={project.slug} className="bg-[var(--ide-sidebar)] border-[var(--ide-border)] h-full">
            <CardHeader>
              <CardTitle className="text-[var(--ide-text)] flex items-center gap-2">
                <Rocket className="h-5 w-5 text-[var(--ide-success)]" />
                {project.title}
              </CardTitle>
              <CardDescription className="text-[var(--ide-text-muted)]">{project.shortDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {project.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} className="bg-[var(--ide-accent)] text-white">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Link className="text-[var(--ide-text)] text-sm font-medium" href={`/projects/${project.slug}`}>
                View details →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return <DualLayoutPage classic={classic} ide={ide} />
}
