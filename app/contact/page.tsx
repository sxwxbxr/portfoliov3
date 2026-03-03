"use client"

import PageLayout from "../../components/PageLayout"
import { AnimatedSection } from "../../components/AnimatedSection"
import { StaggerContainer, StaggerItem } from "../../components/StaggerContainer"
import { ContactForm } from "../../components/ContactForm"
import { Mail, MapPin, Clock, Phone, ArrowUpRight } from "lucide-react"
import { SiGithub, SiLinkedin } from "react-icons/si"

const contactCards = [
  { icon: Mail, label: "Email", value: "info@sweber.dev", href: "mailto:info@sweber.dev" },
  { icon: Phone, label: "Phone", value: "+41 79 899 11 12", href: "tel:+41798991112" },
  { icon: MapPin, label: "Location", value: "St. Gallen, Switzerland" },
  { icon: Clock, label: "Response", value: "Within 24 hours" },
]

const socialLinks = [
  { icon: Mail, label: "Email", href: "mailto:info@sweber.dev" },
  { icon: SiGithub, label: "GitHub", href: "https://github.com/sxwxbxr", external: true },
  { icon: SiLinkedin, label: "LinkedIn", href: "https://ch.linkedin.com/in/seya-weber-06a592256", external: true },
  { icon: Phone, label: "Call", href: "tel:+41798991112" },
]

export default function Contact() {
  return (
    <PageLayout
      title="Let's Work Together"
      subtitle="Ready to bring your project to life? I'd love to hear about your ideas and discuss how we can make them reality."
      label="Contact"
    >
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-8">
              <AnimatedSection>
                <div>
                  <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">Reach out</p>
                  <h3 className="text-2xl font-semibold mb-4">Get in Touch</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    I&apos;m always interested in discussing new opportunities, innovative projects, or simply connecting
                    with fellow professionals.
                  </p>
                </div>
              </AnimatedSection>

              <StaggerContainer className="space-y-3" staggerDelay={0.08}>
                {contactCards.map((card) => {
                  const Wrapper = card.href ? "a" : "div"
                  const wrapperProps = card.href ? { href: card.href } : {}
                  return (
                    <StaggerItem key={card.label}>
                      <Wrapper
                        {...wrapperProps}
                        className="flex items-center gap-4 p-4 bento-card rounded-xl border border-border bg-card"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <card.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{card.label}</p>
                          <p className="text-sm font-medium">{card.value}</p>
                        </div>
                      </Wrapper>
                    </StaggerItem>
                  )
                })}
              </StaggerContainer>

              <AnimatedSection delay={0.3}>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Connect</p>
                  <div className="grid grid-cols-2 gap-2">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl border border-border text-sm font-medium hover:bg-muted hover:text-primary transition-colors"
                      >
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <div className="lg:col-span-2">
              <AnimatedSection delay={0.1}>
                <div className="bento-card rounded-2xl border border-border bg-card p-8">
                  <ContactForm />
                </div>
              </AnimatedSection>
            </div>
          </div>

          <AnimatedSection delay={0.2}>
            <div className="mt-20 bento-card rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 p-10 md:p-14 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Prefer a Quick Chat?</h3>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Sometimes it&apos;s easier to discuss projects over a call. I&apos;m available for brief consultations.
              </p>
              <a
                href="tel:+41798991112"
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Schedule a Call
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </PageLayout>
  )
}
