"use client"

import Navigation from "../../components/Navigation"
import PageLayout from "../../components/PageLayout"
import FadeInSection from "../../components/FadeInSection"
import { ContactForm } from "../../components/ContactForm"
import { InteractiveCard } from "../../components/InteractiveCard"
import { Mail, Github, Linkedin, MapPin, Clock, MessageSquare } from "lucide-react"

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageLayout>
        <div className="space-y-16">
          <FadeInSection>
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Let's Work Together
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
                Ready to bring your project to life? I'd love to hear about your ideas and discuss how we can make them
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
                        I'm always interested in discussing new opportunities, innovative projects, or simply connecting
                        with fellow professionals in the tech industry.
                      </p>
                    </div>
                  </FadeInSection>

                  <FadeInSection>
                    <div className="space-y-4">
                      <InteractiveCard>
                        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all duration-300">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Mail className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Email</h4>
                            <p className="text-muted-foreground">seya.weber@example.com</p>
                          </div>
                        </div>
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
                    </div>
                  </FadeInSection>

                  <FadeInSection>
                    <div>
                      <h4 className="font-medium mb-4">Connect on Social</h4>
                      <div className="flex gap-4">
                        <InteractiveCard>
                          <button className="p-3 bg-card border border-border rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105">
                            <Github className="w-6 h-6" />
                          </button>
                        </InteractiveCard>
                        <InteractiveCard>
                          <button className="p-3 bg-card border border-border rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105">
                            <Linkedin className="w-6 h-6" />
                          </button>
                        </InteractiveCard>
                        <InteractiveCard>
                          <button className="p-3 bg-card border border-border rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105">
                            <MessageSquare className="w-6 h-6" />
                          </button>
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
                Sometimes it's easier to discuss projects over a call. I'm available for brief consultations to
                understand your needs better.
              </p>
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105 glow-effect">
                Schedule a Call
              </button>
            </div>
          </FadeInSection>
        </div>
      </PageLayout>
    </div>
  )
}
