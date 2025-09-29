"use client"

import Navigation from "../../components/Navigation"
import PageLayout from "../../components/PageLayout"
import FadeInSection from "../../components/FadeInSection"
import { ContactForm } from "../../components/ContactForm"
import { InteractiveCard } from "../../components/InteractiveCard"
import { Mail, MapPin, Clock, Phone } from "lucide-react"
import { SiGithub, SiLinkedin } from "react-icons/si"

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageLayout>
        <div className="space-y-16">
          <FadeInSection>
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Let&apos;s Work Together
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
                Ready to bring your project to life? I&apos;d love to hear about your ideas and discuss how we can make them
                reality.
              </p>
            </div>
          </FadeInSection>

          <section className="py-12">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1 space-y-8">
                  <FadeInSection>
                    <div>
                      <h3 className="text-2xl font-semibold mb-6">Get in Touch</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                        I&apos;m always interested in discussing new opportunities, innovative projects, or simply connecting
                        with fellow professionals in the tech industry.
                      </p>
                    </div>
                  </FadeInSection>

                  <FadeInSection>
                    <div className="space-y-4">
                      <InteractiveCard>
                        <a
                          href="mailto:swbr@sweber.dev"
                          className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all duration-300"
                          aria-label="Email swbr@sweber.dev"
                        >
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Mail className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Email</h4>
                            <p className="text-muted-foreground">swbr@sweber.dev</p>
                          </div>
                        </a>
                      </InteractiveCard>

                      <InteractiveCard>
                        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all duration-300">
                          <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-secondary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Location</h4>
                            <p className="text-muted-foreground">St. Gallen, Switzerland</p>
                          </div>
                        </div>
                      </InteractiveCard>

                      <InteractiveCard>
                        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all duration-300">
                          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-accent" />
                          </div>
                          <div>
                            <h4 className="font-medium">Response Time</h4>
                            <p className="text-muted-foreground">Within 24 hours</p>
                          </div>
                        </div>
                      </InteractiveCard>

                      <InteractiveCard>
                        <a
                          href="tel:+41798991112"
                          className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all duration-300"
                          aria-label="Call +41 79 899 11 12"
                        >
                          <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                            <Phone className="w-6 h-6 text-secondary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Phone</h4>
                            <p className="text-muted-foreground">+41 79 899 11 12</p>
                          </div>
                        </a>
                      </InteractiveCard>
                    </div>
                  </FadeInSection>

                  <FadeInSection>
                    <div>
                      <h4 className="font-medium mb-4">Connect on Social</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <InteractiveCard>
                          <a
                            href="mailto:swbr@sweber.dev"
                            className="flex items-center justify-center gap-2 p-3 bg-card border border-border rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
                            aria-label="Email swbr@sweber.dev"
                          >
                            <Mail className="w-6 h-6" />
                            <span className="text-sm font-medium">Email</span>
                          </a>
                        </InteractiveCard>
                        <InteractiveCard>
                          <a
                            href="https://github.com/sxwxbxr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 p-3 bg-card border border-border rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
                            aria-label="Visit GitHub profile"
                          >
                            <SiGithub className="w-6 h-6" />
                            <span className="text-sm font-medium">GitHub</span>
                          </a>
                        </InteractiveCard>
                        <InteractiveCard>
                          <a
                            href="https://linkedin.com/placeholder"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 p-3 bg-card border border-border rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
                            aria-label="Connect on LinkedIn"
                          >
                            <SiLinkedin className="w-6 h-6" />
                            <span className="text-sm font-medium">LinkedIn</span>
                          </a>
                        </InteractiveCard>
                        <InteractiveCard>
                          <a
                            href="tel:+41798991112"
                            className="flex items-center justify-center gap-2 p-3 bg-card border border-border rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
                            aria-label="Call +41 79 899 11 12"
                          >
                            <Phone className="w-6 h-6" />
                            <span className="text-sm font-medium">Call</span>
                          </a>
                        </InteractiveCard>
                      </div>
                    </div>
                  </FadeInSection>
                </div>

                <div className="lg:col-span-2">
                  <FadeInSection>
                    <ContactForm />
                  </FadeInSection>
                </div>
              </div>
            </div>
          </section>

          <FadeInSection>
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Prefer a Quick Chat?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Sometimes it&apos;s easier to discuss projects over a call. I&apos;m available for brief consultations to
                understand your needs better.
              </p>
              <a
                href="tel:+41798991112"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105 glow-effect"
                aria-label="Call +41 79 899 11 12"
              >
                Schedule a Call
              </a>
            </div>
          </FadeInSection>
        </div>
      </PageLayout>
    </div>
  )
}
