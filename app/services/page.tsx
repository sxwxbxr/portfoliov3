"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ClassicSection } from "@/components/classic/classic-section"
import { SyntaxHighlight, CodeBlock } from "@/components/ide/code-block"
import { DualLayoutPage } from "@/components/dual-layout-page"
import { services } from "@/src/content"

export default function ServicesPage() {
  const classic = (
    <>
      <section className="py-16 border-b border-border">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Services</p>
          <h1 className="text-4xl font-bold">Pragmatic delivery support</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Fractional leadership and hands-on implementation to move critical initiatives forward.
          </p>
        </div>
      </section>

      <ClassicSection title="Offers">
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.title} className="h-full border-border">
              <CardHeader>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground text-sm">
                {service.outcomes.map((outcome) => (
                  <p key={outcome}>• {outcome}</p>
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
          <SyntaxHighlight comment>{"// services/index.ts"}</SyntaxHighlight>
        </div>
        <CodeBlock>
          <div className="space-y-1">
            <div>
              <SyntaxHighlight keyword>export</SyntaxHighlight> <SyntaxHighlight keyword>const</SyntaxHighlight>{" "}
              <SyntaxHighlight variable>services</SyntaxHighlight> = [
            </div>
            {services.map((service, idx) => (
              <div key={service.title} className="pl-4 space-y-1">
                <div>{"{"}</div>
                <div className="pl-4">
                  <SyntaxHighlight property>title</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>{`"${service.title}"`}</SyntaxHighlight>,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>description</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>{`"${service.description}"`}</SyntaxHighlight>,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>outcomes</SyntaxHighlight>: [
                </div>
                <div className="pl-8">
                  {service.outcomes.map((outcome, outcomeIdx) => (
                    <div key={outcome}>
                      <SyntaxHighlight string>{`"${outcome}"`}</SyntaxHighlight>
                      {outcomeIdx < service.outcomes.length - 1 ? "," : ""}
                    </div>
                  ))}
                </div>
                <div className="pl-4">]</div>
                <div>{"}"}{idx < services.length - 1 ? "," : ""}</div>
              </div>
            ))}
            <div>]</div>
          </div>
        </CodeBlock>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.title} className="bg-[var(--ide-sidebar)] border-[var(--ide-border)] h-full">
            <CardHeader>
              <CardTitle className="text-[var(--ide-text)]">{service.title}</CardTitle>
              <CardDescription className="text-[var(--ide-text-muted)]">{service.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-[var(--ide-text)] text-sm space-y-2">
              {service.outcomes.map((outcome) => (
                <p key={outcome}>• {outcome}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return <DualLayoutPage classic={classic} ide={ide} />
}
