"use client"

import { useTheme } from "@/lib/theme-context"
import { IdeLayout } from "@/components/ide/ide-layout"
import { IdeEditor } from "@/components/ide/ide-editor"
import { SyntaxHighlight, CodeBlock } from "@/components/ide/code-block"
import { ClassicLayout } from "@/components/classic/classic-layout"
import { ClassicHero } from "@/components/classic/classic-hero"
import { ClassicSection } from "@/components/classic/classic-section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Briefcase, Code2, Rocket, Mail } from "lucide-react"

export default function Home() {
  const { theme } = useTheme()

  if (theme === "classic") {
    return (
      <ClassicLayout>
        <ClassicHero />

        <ClassicSection title="About" id="about">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                I'm a passionate developer with 5+ years of experience building modern web applications. I specialize in
                React, TypeScript, and Next.js, with a strong focus on creating accessible and performant user
                experiences.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                When I'm not coding, you'll find me contributing to open-source projects, writing technical articles, or
                exploring new technologies and frameworks.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Skills</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>TypeScript</Badge>
                <Badge>React</Badge>
                <Badge>Next.js</Badge>
                <Badge>Node.js</Badge>
                <Badge>Tailwind CSS</Badge>
                <Badge>PostgreSQL</Badge>
                <Badge>GraphQL</Badge>
                <Badge>AWS</Badge>
              </div>
            </div>
          </div>
        </ClassicSection>

        <ClassicSection title="Experience" id="experience">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Senior Frontend Engineer</CardTitle>
                    <CardDescription>Tech Company Inc. • 2022 - Present</CardDescription>
                  </div>
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Leading frontend architecture decisions and mentoring junior developers. Built and maintained critical
                  user-facing features serving millions of users.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Full Stack Developer</CardTitle>
                    <CardDescription>Startup Labs • 2020 - 2022</CardDescription>
                  </div>
                  <Code2 className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Developed full-stack applications from scratch, working with React, Node.js, and PostgreSQL.
                  Implemented CI/CD pipelines and improved deployment processes.
                </p>
              </CardContent>
            </Card>
          </div>
        </ClassicSection>

        <ClassicSection title="Projects" id="projects">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  E-Commerce Platform
                </CardTitle>
                <CardDescription>Full-stack shopping experience</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Built a modern e-commerce platform with Next.js, Stripe integration, and real-time inventory
                  management.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Next.js</Badge>
                  <Badge variant="outline">Stripe</Badge>
                  <Badge variant="outline">PostgreSQL</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Developer Tools
                </CardTitle>
                <CardDescription>CLI tool for developers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Created a CLI tool to automate common development workflows, downloaded by thousands of developers.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Node.js</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge variant="outline">Open Source</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </ClassicSection>

        <ClassicSection title="Contact" id="contact">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Get in Touch
              </CardTitle>
              <CardDescription>Have a project in mind? Let's talk about how I can help.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea id="message" placeholder="Your message..." rows={5} />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
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
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
              <span>1</span>
              <SyntaxHighlight comment>// portfolio/about.tsx</SyntaxHighlight>
            </div>

            <CodeBlock>
              <div className="space-y-1">
                <div>
                  <SyntaxHighlight keyword>export</SyntaxHighlight> <SyntaxHighlight keyword>const</SyntaxHighlight>{" "}
                  <SyntaxHighlight variable>developer</SyntaxHighlight> = {"{"}
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>name</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>"Your Name"</SyntaxHighlight>,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>role</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>"Full Stack Developer"</SyntaxHighlight>,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>experience</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>"5+ years"</SyntaxHighlight>,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>passion</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>"Building elegant solutions"</SyntaxHighlight>,
                </div>
                <div>{"}"}</div>
              </div>
            </CodeBlock>

            <p className="text-[var(--ide-text)] leading-relaxed">
              I'm a passionate developer specializing in modern web technologies. I love creating beautiful, performant
              applications that solve real problems.
            </p>
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
              <span>24</span>
              <SyntaxHighlight comment>// portfolio/skills.ts</SyntaxHighlight>
            </div>

            <CodeBlock>
              <div className="space-y-1">
                <div>
                  <SyntaxHighlight keyword>const</SyntaxHighlight> <SyntaxHighlight variable>skills</SyntaxHighlight> =
                  [
                </div>
                <div className="pl-4">
                  <SyntaxHighlight string>"TypeScript"</SyntaxHighlight>,{" "}
                  <SyntaxHighlight string>"React"</SyntaxHighlight>, <SyntaxHighlight string>"Next.js"</SyntaxHighlight>
                  ,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight string>"Node.js"</SyntaxHighlight>,{" "}
                  <SyntaxHighlight string>"PostgreSQL"</SyntaxHighlight>,{" "}
                  <SyntaxHighlight string>"AWS"</SyntaxHighlight>
                </div>
                <div>]</div>
              </div>
            </CodeBlock>
          </div>

          {/* Experience Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
              <span>42</span>
              <SyntaxHighlight comment>// portfolio/experience.tsx</SyntaxHighlight>
            </div>

            <div className="space-y-4">
              <Card className="bg-[var(--ide-sidebar)] border-[var(--ide-border)]">
                <CardHeader>
                  <CardTitle className="text-[var(--ide-text)] flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[var(--ide-accent)]" />
                    Senior Frontend Engineer
                  </CardTitle>
                  <CardDescription className="text-[var(--ide-text-muted)]">
                    Tech Company Inc. • 2022 - Present
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-[var(--ide-text)]">
                  Leading frontend architecture and mentoring developers. Built features serving millions of users.
                </CardContent>
              </Card>

              <Card className="bg-[var(--ide-sidebar)] border-[var(--ide-border)]">
                <CardHeader>
                  <CardTitle className="text-[var(--ide-text)] flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-[var(--ide-accent)]" />
                    Full Stack Developer
                  </CardTitle>
                  <CardDescription className="text-[var(--ide-text-muted)]">Startup Labs • 2020 - 2022</CardDescription>
                </CardHeader>
                <CardContent className="text-[var(--ide-text)]">
                  Developed full-stack applications with React, Node.js, and PostgreSQL.
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
              <span>68</span>
              <SyntaxHighlight comment>// portfolio/projects.tsx</SyntaxHighlight>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-[var(--ide-sidebar)] border-[var(--ide-border)]">
                <CardHeader>
                  <CardTitle className="text-[var(--ide-text)] flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-[var(--ide-success)]" />
                    E-Commerce Platform
                  </CardTitle>
                  <CardDescription className="text-[var(--ide-text-muted)]">
                    Full-stack shopping experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-[var(--ide-text)] text-sm">Modern platform with Stripe and real-time inventory.</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-[var(--ide-accent)] text-white">Next.js</Badge>
                    <Badge className="bg-[var(--ide-accent)] text-white">Stripe</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--ide-sidebar)] border-[var(--ide-border)]">
                <CardHeader>
                  <CardTitle className="text-[var(--ide-text)] flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-[var(--ide-warning)]" />
                    Developer Tools
                  </CardTitle>
                  <CardDescription className="text-[var(--ide-text-muted)]">CLI tool for developers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-[var(--ide-text)] text-sm">Automates workflows, used by thousands.</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-[var(--ide-accent)] text-white">Node.js</Badge>
                    <Badge className="bg-[var(--ide-accent)] text-white">TypeScript</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
              <span>94</span>
              <SyntaxHighlight comment>// portfolio/contact.tsx</SyntaxHighlight>
            </div>

            <Card className="bg-[var(--ide-sidebar)] border-[var(--ide-border)] max-w-2xl">
              <CardHeader>
                <CardTitle className="text-[var(--ide-text)] flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[var(--ide-accent)]" />
                  Get in Touch
                </CardTitle>
                <CardDescription className="text-[var(--ide-text-muted)]">
                  Let's discuss your next project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-[var(--ide-text)]">
                        Name
                      </label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        className="bg-[var(--ide-bg)] border-[var(--ide-border)] text-[var(--ide-text)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-[var(--ide-text)]">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="bg-[var(--ide-bg)] border-[var(--ide-border)] text-[var(--ide-text)]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-[var(--ide-text)]">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Your message..."
                      rows={5}
                      className="bg-[var(--ide-bg)] border-[var(--ide-border)] text-[var(--ide-text)]"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[var(--ide-accent)] hover:bg-[var(--ide-accent)]/90">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-[var(--ide-border)]">
            <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
              <span>128</span>
              <SyntaxHighlight comment>// End of file</SyntaxHighlight>
            </div>
          </div>
        </div>
      </IdeEditor>
    </IdeLayout>
  )
}
