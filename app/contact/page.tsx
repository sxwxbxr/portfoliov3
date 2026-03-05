"use client"

import PageLayout, { Section } from "../../components/PageLayout"
import { ContactForm } from "../../components/ContactForm"

export default function Contact() {
  return (
    <PageLayout
      title="Get in touch"
      subtitle="Have a project in mind or want to discuss an opportunity? I'd love to hear from you."
    >
      <section className="pb-24 md:pb-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16">
            {/* Left -- contact info */}
            <Section>
              <div className="space-y-8">
                <div>
                  <p className="font-mono text-xs text-muted-foreground mb-2">Email</p>
                  <a
                    href="mailto:info@sweber.dev"
                    className="link-underline text-primary font-medium"
                  >
                    info@sweber.dev
                  </a>
                </div>
                <div>
                  <p className="font-mono text-xs text-muted-foreground mb-2">Phone</p>
                  <a
                    href="tel:+41798991112"
                    className="link-underline text-foreground"
                  >
                    +41 79 899 11 12
                  </a>
                </div>
                <div>
                  <p className="font-mono text-xs text-muted-foreground mb-2">Location</p>
                  <p>St. Gallen, Switzerland</p>
                </div>
                <div>
                  <p className="font-mono text-xs text-muted-foreground mb-2">Response time</p>
                  <p className="text-muted-foreground">Within 24 hours</p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="font-mono text-xs text-muted-foreground mb-3">Connect</p>
                  <div className="flex items-center gap-4">
                    <a
                      href="https://github.com/sxwxbxr"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline"
                    >
                      GitHub
                    </a>
                    <a
                      href="https://ch.linkedin.com/in/seya-weber-06a592256"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </Section>

            {/* Right -- form */}
            <Section delay={0.1}>
              <ContactForm />
            </Section>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
