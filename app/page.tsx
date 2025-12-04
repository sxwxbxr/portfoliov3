"use client"

import Link from "next/link"
import { ArrowRight, ArrowUpRight, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuroraBackground } from "@/components/AuroraBackground"
import { BlurFade } from "@/components/BlurFade"
import {
  education,
  engagementModels,
  experiences,
  heroInfo,
  quickFacts,
  services,
  skills,
  stats,
} from "@/lib/personal-data"
import { blogPosts, caseStudies, projects } from "@/src/config"

export default function Home() {
  const featuredProjects = projects.slice(0, 4)
  const featuredStudies = caseStudies.slice(0, 2)
  const latestPosts = blogPosts.slice(0, 2)

  return (
    <main className="bg-gradient-to-b from-background via-background to-background/40 text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 pb-24 pt-10 md:pt-16">
        <header className="sticky top-4 z-20 flex items-center justify-between rounded-full border border-border/60 bg-background/80 px-4 py-2 shadow-lg shadow-primary/5 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
              SW
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Project Manager & Builder</p>
              <p className="text-sm font-semibold">Seya Weber</p>
            </div>
          </div>
          <div className="hidden items-center gap-1 md:flex">
            <Button variant="ghost" asChild>
              <Link href="#services">Services</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#experience">Experience</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#projects">Projects</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#contact">Contact</Link>
            </Button>
            <Button asChild className="ml-2">
              <Link href="mailto:info@sweber.dev">Let&apos;s talk</Link>
            </Button>
          </div>
        </header>

        <section id="hero" className="grid items-center gap-8 md:grid-cols-[1.1fr,0.9fr]">
          <BlurFade>
            <AuroraBackground className="p-10 shadow-2xl">
              <div className="space-y-6">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                  {heroInfo.availability}
                </Badge>
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {heroInfo.location}
                  </p>
                  <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                    {heroInfo.name}
                  </h1>
                  <p className="text-xl text-primary">{heroInfo.role}</p>
                  <p className="max-w-2xl text-lg text-muted-foreground">{heroInfo.summary}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="lg" asChild>
                    <Link href="#projects" className="flex items-center gap-2">
                      View work
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#contact">Book a call</Link>
                  </Button>
                  <div className="flex items-center gap-2">
                    <Link href={heroInfo.socials.github} className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition hover:-translate-y-1 hover:border-primary" target="_blank" rel="noreferrer">
                      <Github className="h-5 w-5" />
                    </Link>
                    <Link href={heroInfo.socials.linkedin} className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition hover:-translate-y-1 hover:border-primary" target="_blank" rel="noreferrer">
                      <Linkedin className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {stats.map((stat) => (
                    <Card key={stat.label} className="border-border/70 bg-card/70">
                      <CardHeader className="pb-2">
                        <CardDescription>{stat.label}</CardDescription>
                        <CardTitle className="text-2xl">{stat.value}</CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            </AuroraBackground>
          </BlurFade>

          <BlurFade delay={0.1} className="space-y-4">
            <Card className="border-border/70 bg-card/80">
              <CardHeader>
                <CardTitle>Quick facts</CardTitle>
                <CardDescription>From automation-first thinking to multilingual collaboration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickFacts.map((fact) => (
                  <div key={fact.label} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">{fact.label}</span>
                    <span className="font-medium">{fact.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
              <CardHeader className="pb-2">
                <CardTitle>Currently</CardTitle>
                <CardDescription>Leading customer-specific automation workflows at Telsonic Ultrasonics.</CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span>Founder of Weber Development and always eager to co-create impactful tools.</span>
              </CardFooter>
            </Card>

            <Card className="border-border/70 bg-card/80">
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <Link href={`mailto:${heroInfo.email}`} className="hover:text-primary">
                    {heroInfo.email}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <Link href={`tel:${heroInfo.phone}`} className="hover:text-primary">
                    {heroInfo.phone}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </BlurFade>
        </section>

        <section id="services" className="space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-primary">Offerings</p>
              <h2 className="text-3xl font-semibold md:text-4xl">Where I create leverage</h2>
              <p className="max-w-2xl text-muted-foreground">
                Strategy meets execution across delivery leadership, solution acceleration, and coaching.
              </p>
            </div>
            <Badge variant="outline" className="h-fit rounded-full">
              Automation · Software · Delivery
            </Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service, index) => (
              <BlurFade key={service.title} delay={index * 0.05}>
                <Card className="h-full border-border/70 bg-card/80 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                  <CardHeader>
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {service.outcomes.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </BlurFade>
            ))}
          </div>
        </section>

        <section id="experience" className="space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-primary">Journey</p>
              <h2 className="text-3xl font-semibold md:text-4xl">Experience with technical depth</h2>
              <p className="max-w-2xl text-muted-foreground">
                From electrical planning to software delivery leadership, I translate field constraints into pragmatic software.
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="#contact" className="flex items-center gap-2">
                Explore opportunities
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {experiences.map((experience, index) => (
              <BlurFade key={experience.title} delay={index * 0.05}>
                <Card className="border-border/70 bg-card/80">
                  <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>{experience.title}</CardTitle>
                      <CardDescription className="text-primary">{experience.company}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      {experience.period}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {experience.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </BlurFade>
            ))}
          </div>
        </section>

        <section id="projects" className="space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-primary">Projects</p>
              <h2 className="text-3xl font-semibold md:text-4xl">Recent work & experiments</h2>
              <p className="max-w-2xl text-muted-foreground">
                Real-world software delivery across healthcare, finance, automation, and developer tooling.
              </p>
            </div>
            <Badge variant="outline" className="h-fit rounded-full">
              {featuredProjects.length} featured projects
            </Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredProjects.map((project, index) => (
              <BlurFade key={project.slug} delay={index * 0.05}>
                <Card className="group h-full border-border/70 bg-card/80 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                  <CardHeader>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-full">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="group-hover:text-primary">{project.title}</CardTitle>
                    <CardDescription>{project.shortDescription}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex items-center gap-3 text-sm font-medium text-primary">
                    <span>View details</span>
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </CardFooter>
                </Card>
              </BlurFade>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-primary">Case studies</p>
              <h2 className="text-3xl font-semibold md:text-4xl">Delivering outcomes you can trust</h2>
              <p className="max-w-2xl text-muted-foreground">Testimonials and measurable results from complex initiatives.</p>
            </div>
            <Badge variant="secondary" className="h-fit rounded-full">
              Healthcare · Energy · Product delivery
            </Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredStudies.map((study, index) => (
              <BlurFade key={study.slug} delay={index * 0.05}>
                <Card className="h-full border-border/70 bg-card/80">
                  <CardHeader>
                    <CardTitle>{study.title}</CardTitle>
                    <CardDescription>
                      {study.client} · {study.industry}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>{study.challenge}</p>
                    <p className="text-foreground">Solution: {study.solution}</p>
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs uppercase tracking-wide text-primary">Results</p>
                      <ul className="mt-2 space-y-1">
                        {study.results.slice(0, 3).map((result) => (
                          <li key={result} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  {study.testimonial && (
                    <CardFooter className="flex flex-col gap-2 border-t border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
                      <p className="italic">“{study.testimonial.quote}”</p>
                      <p className="text-xs uppercase tracking-wide text-primary">
                        {study.testimonial.author} · {study.testimonial.company}
                      </p>
                    </CardFooter>
                  )}
                </Card>
              </BlurFade>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-primary">Skills</p>
              <h2 className="text-3xl font-semibold md:text-4xl">Technical range & leadership</h2>
              <p className="max-w-2xl text-muted-foreground">The mix I use to move initiatives from idea to adoption.</p>
            </div>
            <Badge variant="outline" className="h-fit rounded-full">
              Fluent in DE / EN / FR
            </Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/70 bg-card/80">
              <CardHeader>
                <CardTitle>Frameworks & tools</CardTitle>
                <CardDescription>Hands-on with modern stacks for web, desktop, and automation.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {skills.frameworks.map((item) => (
                  <Badge key={item} variant="secondary" className="rounded-full">
                    {item}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/80">
              <CardHeader>
                <CardTitle>Project leadership</CardTitle>
                <CardDescription>Habits that keep delivery predictable.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {skills.project.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/70 bg-card/80">
              <CardHeader>
                <CardTitle>Technical depth</CardTitle>
                <CardDescription>Architecture, APIs, and testing to keep quality high.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {skills.technical.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/80">
              <CardHeader>
                <CardTitle>Languages</CardTitle>
                <CardDescription>Collaboration across teams and regions.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {skills.languages.map((language) => (
                  <Badge key={language.name} variant="outline" className="rounded-full">
                    {language.name} · {language.level}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle>Engagement models</CardTitle>
              <CardDescription>Flexible collaboration built around your team.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {engagementModels.map((model) => (
                <Badge key={model} variant="secondary" className="rounded-full">
                  {model}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-primary">Education</p>
              <h2 className="text-3xl font-semibold md:text-4xl">Learning that fuels practice</h2>
              <p className="max-w-2xl text-muted-foreground">A dual background in software engineering and electrical design.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {education.map((item, index) => (
              <BlurFade key={item.title} delay={index * 0.05}>
                <Card className="h-full border-border/70 bg-card/80">
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    {item.place && <CardDescription>{item.place}</CardDescription>}
                    <Badge variant="outline" className="w-fit rounded-full text-xs">
                      {item.period}
                    </Badge>
                  </CardHeader>
                </Card>
              </BlurFade>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-primary">Insights</p>
              <h2 className="text-3xl font-semibold md:text-4xl">Writing & reflections</h2>
              <p className="max-w-2xl text-muted-foreground">Thoughts on digital transformation, delivery, and career shifts.</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/blog">Visit blog</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {latestPosts.map((post, index) => (
              <BlurFade key={post.id} delay={index * 0.05}>
                <Card className="h-full border-border/70 bg-card/80">
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit rounded-full text-xs">
                      {post.readTime}
                    </Badge>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex items-center gap-2 text-sm font-medium text-primary">
                    <span>Read article</span>
                    <ArrowRight className="h-4 w-4" />
                  </CardFooter>
                </Card>
              </BlurFade>
            ))}
          </div>
        </section>

        <section id="contact" className="space-y-6">
          <AuroraBackground className="p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.25em] text-primary">Let&apos;s collaborate</p>
                <h2 className="text-3xl font-semibold md:text-4xl">Tell me about your next initiative</h2>
                <p className="max-w-2xl text-muted-foreground">
                  Whether you need delivery leadership, a proof of concept, or better workflows, I&apos;m here to help.
                </p>
              </div>
              <div className="flex flex-col gap-3 md:w-72">
                <Button size="lg" asChild>
                  <Link href="mailto:info@sweber.dev" className="flex items-center gap-2">
                    Send an email
                    <Mail className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="tel:+41798991112" className="flex items-center gap-2">
                    Call directly
                    <Phone className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </AuroraBackground>
        </section>
      </div>
    </main>
  )
}
