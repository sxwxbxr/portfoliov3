"use client"

import PageLayout from "../../components/PageLayout"
import FadeInSection from "../../components/FadeInSection"
import { Mail, Github, Linkedin } from "lucide-react"

export default function About() {
  return (
    <PageLayout title="About Me" subtitle="Get to know more about my background, passion, and approach to technology">
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <p className="text-lg leading-relaxed text-card-foreground">
                    I'm a Software & Digitalization Project Lead at Telsonic, creating customer specific automation
                    workflows in business-critical systems.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <p className="text-lg leading-relaxed text-card-foreground">
                    With a dual background in software engineering and electrical design, I turn complex operational
                    needs into clear requirements, lean processes, and maintainable solutions.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <p className="text-lg leading-relaxed text-card-foreground">
                    I'm passionate about leveraging technology to drive efficiency and improve user experiences.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <h3 className="text-xl font-semibold mb-4">My Approach</h3>
                  <p className="text-lg leading-relaxed text-card-foreground">
                    I believe in creating solutions that not only solve immediate problems but also scale with business
                    growth. My experience spans from hands-on development to strategic project management, allowing me
                    to bridge the gap between technical implementation and business objectives.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-4">Quick Facts</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span>St. Gallen, CH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experience</span>
                      <span>3+ Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Focus</span>
                      <span>Automation</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Languages</span>
                      <span>DE, EN</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-4">Connect</h3>
                  <div className="flex gap-3">
                    <button className="flex-1 p-3 border border-border rounded-lg hover:bg-card transition-colors">
                      <Mail className="w-5 h-5 mx-auto" />
                    </button>
                    <button className="flex-1 p-3 border border-border rounded-lg hover:bg-card transition-colors">
                      <Github className="w-5 h-5 mx-auto" />
                    </button>
                    <button className="flex-1 p-3 border border-border rounded-lg hover:bg-card transition-colors">
                      <Linkedin className="w-5 h-5 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>
    </PageLayout>
  )
}
