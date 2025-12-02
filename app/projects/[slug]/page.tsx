"use client"

import Link from "next/link"
import { notFound } from "next/navigation"
import { Github, Link2, Rocket } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClassicSection } from "@/components/classic/classic-section"
import { SyntaxHighlight, CodeBlock } from "@/components/ide/code-block"
import { DualLayoutPage } from "@/components/dual-layout-page"
import { projects } from "@/src/config"

export default function ProjectDetail({ params }: { params: { slug: string } }) {
  const project = projects.find((item) => item.slug === params.slug)

  if (!project) {
    notFound()
  }

  const classic = (
    <>
      <section className="py-16 border-b border-border">
        <div className="space-y-4 max-w-4xl">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Project</p>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Rocket className="h-6 w-6" /> {project.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{project.description}</p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex gap-4 flex-wrap text-sm text-muted-foreground">
            {project.github !== "#" && (
              <Link className="flex items-center gap-2 hover:underline" href={project.github} target="_blank">
                <Github className="h-4 w-4" /> Code
              </Link>
            )}
            {project.demo !== "#" && (
              <Link className="flex items-center gap-2 hover:underline" href={project.demo} target="_blank">
                <Link2 className="h-4 w-4" /> Demo
              </Link>
            )}
          </div>
        </div>
      </section>

      <ClassicSection title="Outcome">
        <Card>
          <CardHeader>
            <CardTitle>What it delivered</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
            <p>{project.shortDescription}</p>
            <p>{project.description}</p>
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
          <SyntaxHighlight comment>{`// projects/${project.slug}.ts`}</SyntaxHighlight>
        </div>
        <CodeBlock>
          <div className="space-y-1">
            <div>{"{"}</div>
            <div className="pl-4">
              <SyntaxHighlight property>title</SyntaxHighlight>:{" "}
              <SyntaxHighlight string>{`"${project.title}"`}</SyntaxHighlight>,
            </div>
            <div className="pl-4">
              <SyntaxHighlight property>summary</SyntaxHighlight>:{" "}
              <SyntaxHighlight string>{`"${project.shortDescription}"`}</SyntaxHighlight>,
            </div>
            <div className="pl-4">
              <SyntaxHighlight property>tags</SyntaxHighlight>: [
            </div>
            <div className="pl-8">
              {project.tags.map((tag, idx) => (
                <div key={tag}>
                  <SyntaxHighlight string>{`"${tag}"`}</SyntaxHighlight>
                  {idx < project.tags.length - 1 ? "," : ""}
                </div>
              ))}
            </div>
            <div className="pl-4">]</div>
            <div className="pl-4">
              <SyntaxHighlight property>links</SyntaxHighlight>: {"{"}
            </div>
            <div className="pl-8">
              <SyntaxHighlight property>github</SyntaxHighlight>: {project.github ? (
                <SyntaxHighlight string>{`"${project.github}"`}</SyntaxHighlight>
              ) : (
                <SyntaxHighlight string>{'"private"'}</SyntaxHighlight>
              )}
              ,
            </div>
            <div className="pl-8">
              <SyntaxHighlight property>demo</SyntaxHighlight>: {project.demo ? (
                <SyntaxHighlight string>{`"${project.demo}"`}</SyntaxHighlight>
              ) : (
                <SyntaxHighlight string>{'"n/a"'}</SyntaxHighlight>
              )}
            </div>
            <div className="pl-4">{`}`}</div>
            <div>{"}"}</div>
          </div>
        </CodeBlock>
      </div>

      <Card className="bg-[var(--ide-sidebar)] border-[var(--ide-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--ide-text)] flex items-center gap-2">
            <Rocket className="h-5 w-5 text-[var(--ide-success)]" />
            {project.title}
          </CardTitle>
          <CardDescription className="text-[var(--ide-text-muted)]">{project.shortDescription}</CardDescription>
        </CardHeader>
        <CardContent className="text-[var(--ide-text)] space-y-3 text-sm leading-relaxed">
          <p>{project.description}</p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} className="bg-[var(--ide-accent)] text-white">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex gap-4 flex-wrap text-[var(--ide-text-muted)]">
            {project.github !== "#" && (
              <Link className="flex items-center gap-2" href={project.github} target="_blank">
                <Github className="h-4 w-4" /> Code
              </Link>
            )}
            {project.demo !== "#" && (
              <Link className="flex items-center gap-2" href={project.demo} target="_blank">
                <Link2 className="h-4 w-4" /> Demo
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return <DualLayoutPage classic={classic} ide={ide} />
}
