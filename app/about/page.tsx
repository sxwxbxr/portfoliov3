"use client"

import PageLayout from "../../components/PageLayout"
import { AnimatedSection } from "../../components/AnimatedSection"
import { StaggerContainer, StaggerItem } from "../../components/StaggerContainer"
import { Mail, Phone } from "lucide-react"
import { SiGithub, SiLinkedin } from "react-icons/si"

export default function About() {
  return (
    <PageLayout
      title="About Me"
      subtitle="Get to know more about my background, passion, and approach to technology."
      label="Who I am"
    >
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <StaggerContainer className="space-y-6" staggerDelay={0.1}>
                <StaggerItem>
                  <div className="bento-card rounded-2xl border border-border bg-card p-8">
                    <p className="text-lg leading-relaxed">
                      I&apos;m a Software & Digitalization Project Manager at Telsonic, creating customer specific automation
                      workflows in business-critical systems. Founder and owner of Weber Development, developing custom software for various companies.
                    </p>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="bento-card rounded-2xl border border-border bg-card p-8">
                    <p className="text-lg leading-relaxed">
                      With a dual background in software engineering and electrical design, I turn complex operational
                      needs into clear requirements, lean processes, and maintainable solutions.
                    </p>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="bento-card rounded-2xl border border-border bg-card p-8">
                    <p className="text-lg leading-relaxed">
                      I&apos;m passionate about leveraging technology to drive efficiency and improve user experiences.
                    </p>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="bento-card rounded-2xl border border-border bg-card p-8">
                    <h3 className="text-xs font-medium text-primary uppercase tracking-widest mb-4">My Approach</h3>
                    <p className="text-lg leading-relaxed">
                      I believe in creating solutions that not only solve immediate problems but also scale with business
                      growth. My experience spans from hands-on development to strategic project management, allowing me
                      to bridge the gap between technical implementation and business objectives.
                    </p>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </div>

            <div className="space-y-6">
              <AnimatedSection delay={0.2}>
                <div className="bento-card rounded-2xl border border-border bg-card p-6">
                  <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">This is me</p>
                  <img
                    src="/260216_professionalMG.jpeg"
                    alt="Seya Weber"
                    className="aspect-square w-full rounded-xl object-cover object-top"
                  />
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    I enjoy turning ideas into simple, useful solutions. I like learning new things, improving what is already there and building stuff that makes everyday work a bit easier.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <div className="bento-card rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
                  <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">Quick Facts</p>
                  <div className="space-y-3">
                    {[
                      { label: "Location", value: "St. Gallen, CH" },
                      { label: "Experience", value: "1+ Years" },
                      { label: "Focus", value: "Automation" },
                      { label: "Languages", value: "DE, EN" },
                    ].map((fact) => (
                      <div key={fact.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{fact.label}</span>
                        <span className="font-medium">{fact.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.4}>
                <div className="bento-card rounded-2xl border border-border bg-card p-6">
                  <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">Connect</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Mail, label: "Email", href: "mailto:info@sweber.dev" },
                      { icon: SiGithub, label: "GitHub", href: "https://github.com/sxwxbxr", external: true },
                      { icon: SiLinkedin, label: "LinkedIn", href: "https://ch.linkedin.com/in/seya-weber-06a592256", external: true },
                      { icon: Phone, label: "Call", href: "tel:+41798991112" },
                    ].map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
