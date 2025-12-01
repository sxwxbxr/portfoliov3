"use client"

import Link from "next/link"
import { useTheme } from "@/lib/theme-context"
import { ClassicLayout } from "@/components/classic/classic-layout"
import { ClassicSection } from "@/components/classic/classic-section"
import { IdeLayout } from "@/components/ide/ide-layout"
import { IdeEditor } from "@/components/ide/ide-editor"
import { SyntaxHighlight, CodeBlock } from "@/components/ide/code-block"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, MapPin, Briefcase, Rocket, Newspaper } from "lucide-react"
import {
  personalInfo,
  experiences,
  projects,
  caseStudies,
  blogPosts,
  services,
  skillStacks,
} from "@/src/content"

const featuredProjects = projects.slice(0, 3)
const featuredCases = caseStudies.slice(0, 2)
const featuredPosts = blogPosts.slice(0, 2)

export default function Home() {
  const { theme } = useTheme()

  if (theme === "classic") {
    return (
      <ClassicLayout>
        <section className="py-20">
          <div className="space-y-6 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{personalInfo.location}</p>
            <h1 className="text-5xl font-bold text-balance">{personalInfo.name}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">{personalInfo.summary}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Badge variant="outline">Project leadership</Badge>
              <Badge variant="outline">Automation</Badge>
              <Badge variant="outline">Migrations</Badge>
            </div>
            <div className="flex gap-4 pt-4 flex-wrap">
              <Button asChild size="lg">
                <Link href="/contact">Book a call</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/projects">View projects</Link>
              </Button>
            </div>
          </div>
        </section>

        <ClassicSection title="About" id="about">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {personalInfo.about.map((paragraph) => (
                <p key={paragraph} className="text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Based in {personalInfo.location}
                </CardTitle>
                <CardDescription>Focused on efficiency, clarity, and trustworthy delivery.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a className="hover:underline" href={`mailto:${personalInfo.contact.email}`}>
                    {personalInfo.contact.email}
                  </a>
                </div>
                <p className="text-sm text-muted-foreground">Response time: {personalInfo.contact.responseTime}</p>
              </CardContent>
            </Card>
          </div>
        </ClassicSection>

        <ClassicSection title="Experience" id="experience">
          <div className="space-y-6">
            {experiences.map((experience) => (
              <Card key={experience.role}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle>{experience.role}</CardTitle>
                      <CardDescription>
                        {experience.company} • {experience.period}
                      </CardDescription>
                    </div>
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  {experience.highlights.map((highlight) => (
                    <p key={highlight} className="leading-relaxed">
                      {highlight}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </ClassicSection>

        <ClassicSection title="Projects" id="projects">
          <div className="grid md:grid-cols-2 gap-6">
            {featuredProjects.map((project) => (
              <Card key={project.slug} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5" />
                    {project.title}
                  </CardTitle>
                  <CardDescription>{project.shortDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.slice(0, 4).map((tag) => (
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
          <div className="pt-6">
            <Button asChild variant="ghost">
              <Link href="/projects">Browse all projects</Link>
            </Button>
          </div>
        </ClassicSection>

        <ClassicSection title="Case Studies" id="case-studies">
          <div className="grid md:grid-cols-2 gap-6">
            {featuredCases.map((study) => (
              <Card key={study.slug} className="h-full">
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

        <ClassicSection title="Latest Writing" id="blog">
          <div className="grid md:grid-cols-2 gap-6">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5" />
                    {post.title}
                  </CardTitle>
                  <CardDescription>
                    {post.publishedAt} • {post.readTime}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>
                  <Link className="text-primary text-sm font-medium hover:underline" href={`/blog/${post.id}`}>
                    Continue reading
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </ClassicSection>

        <ClassicSection title="Services" id="services">
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.title} className="h-full">
                <CardHeader>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {service.outcomes.map((outcome) => (
                    <p key={outcome} className="text-muted-foreground text-sm">
                      • {outcome}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </ClassicSection>

        <ClassicSection title="Skills" id="skills">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical</CardTitle>
                <CardDescription>Stacks I rely on for delivery</CardDescription>
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
                <CardDescription>Working across teams</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {skillStacks.languages.map((language) => (
                  <div key={language.name} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{language.name}</span>
                    <span className="text-muted-foreground">{language.level}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </ClassicSection>

        <ClassicSection title="Contact" id="contact">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Let&apos;s talk
              </CardTitle>
              <CardDescription>Share what you need and I&apos;ll respond within a day.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
              <p>
                Email me at {" "}
                <a className="text-primary hover:underline" href={`mailto:${personalInfo.contact.email}`}>
                  {personalInfo.contact.email}
                </a>{" "}
                to start a conversation.
              </p>
              <p>Location: {personalInfo.location}</p>
            </CardContent>
          </Card>
        </ClassicSection>
      </ClassicLayout>
    )
  }

  return (
    <IdeLayout>
      <IdeEditor>
        <div className="space-y-8 max-w-4xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
              <span>1</span>
              <SyntaxHighlight comment>{"// portfolio/about.ts"}</SyntaxHighlight>
            </div>
            <CodeBlock>
              <div className="space-y-1">
                <div>
                  <SyntaxHighlight keyword>export</SyntaxHighlight> <SyntaxHighlight keyword>const</SyntaxHighlight>{" "}
                  <SyntaxHighlight variable>developer</SyntaxHighlight> = {"{"}
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
                  <SyntaxHighlight property>summary</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>{`"${personalInfo.summary}"`}</SyntaxHighlight>,
                </div>
                <div>{"}"}</div>
              </div>
            </CodeBlock>
            <p className="text-[var(--ide-text)] leading-relaxed">{personalInfo.about[0]}</p>
            <p className="text-[var(--ide-text)] leading-relaxed">{personalInfo.about[1]}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
              <span>28</span>
              <SyntaxHighlight comment>{"// portfolio/skills.ts"}</SyntaxHighlight>
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
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
              <span>46</span>
              <SyntaxHighlight comment>{"// portfolio/experience.tsx"}</SyntaxHighlight>
            </div>
            <div className="space-y-4">
              {experiences.map((experience) => (
                <Card key={experience.role} className="bg-[var(--ide-sidebar)] border-[var(--ide-border)]">
                  <CardHeader>
                    <CardTitle className="text-[var(--ide-text)] flex items-center justify-between gap-2">
                      <span>{experience.role}</span>
                      <span className="text-xs text-[var(--ide-text-muted)]">{experience.period}</span>
                    </CardTitle>
                    <CardDescription className="text-[var(--ide-text-muted)]">{experience.company}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-[var(--ide-text)] space-y-1 text-sm">
                    {experience.highlights.map((highlight) => (
                      <p key={highlight}>• {highlight}</p>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
              <span>82</span>
              <SyntaxHighlight comment>{"// portfolio/projects.tsx"}</SyntaxHighlight>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {featuredProjects.map((project) => (
                <Card key={project.slug} className="bg-[var(--ide-sidebar)] border-[var(--ide-border)]">
                  <CardHeader>
                    <CardTitle className="text-[var(--ide-text)] flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-[var(--ide-success)]" />
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-[var(--ide-text-muted)]">
                      {project.shortDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {project.tags.slice(0, 3).map((tag) => (
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

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
              <span>112</span>
              <SyntaxHighlight comment>{"// portfolio/blog.tsx"}</SyntaxHighlight>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="bg-[var(--ide-sidebar)] border-[var(--ide-border)]">
                  <CardHeader>
                    <CardTitle className="text-[var(--ide-text)]">{post.title}</CardTitle>
                    <CardDescription className="text-[var(--ide-text-muted)]">
                      {post.publishedAt} • {post.readTime}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-[var(--ide-text)] text-sm space-y-2">
                    <p>{post.excerpt}</p>
                    <Link className="text-[var(--ide-accent)]" href={`/blog/${post.id}`}>
                      Continue reading →
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
              <span>140</span>
              <SyntaxHighlight comment>{"// portfolio/contact.tsx"}</SyntaxHighlight>
            </div>
            <Card className="bg-[var(--ide-sidebar)] border-[var(--ide-border)] max-w-2xl">
              <CardHeader>
                <CardTitle className="text-[var(--ide-text)] flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[var(--ide-accent)]" />
                  Contact
                </CardTitle>
                <CardDescription className="text-[var(--ide-text-muted)]">
                  Response time: {personalInfo.contact.responseTime}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-[var(--ide-text)] space-y-2 text-sm">
                <p>
                  Email: <a className="text-[var(--ide-accent)]" href={`mailto:${personalInfo.contact.email}`}>
                    {personalInfo.contact.email}
                  </a>
                </p>
                <p>Location: {personalInfo.location}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </IdeEditor>
    </IdeLayout>
  )
}
