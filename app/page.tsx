"use client"

import Link from "next/link"
import Navigation from "../components/Navigation"
import FadeInSection from "../components/FadeInSection"
import { ParticleBackground } from "../components/ParticleBackground"
import { AnimatedCounter } from "../components/AnimatedCounter"
import { InteractiveCard } from "../components/InteractiveCard"
import { ArrowDown, MapPin, ArrowRight, Users, Award, Calendar } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative min-h-screen flex items-center justify-center gradient-bg overflow-hidden pt-16">
        <ParticleBackground />
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <FadeInSection>
          <div className="text-center space-y-8 px-4 max-w-4xl mx-auto relative z-10">
            <div className="space-y-4">
              <div className="inline-block p-3 rounded-full bg-primary/10 mb-6 float-animation glow-effect">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <span className="text-2xl font-bold text-primary">SW</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
                Hi, I'm Seya Weber
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-serif animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                Project Manager Software and Digitalisation in St. Gallen, Switzerland.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              <MapPin className="w-4 h-4" />
              <span>St. Gallen, Switzerland</span>
            </div>

            <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              <Link
                href="/contact"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105 glow-effect hover:shadow-lg hover:shadow-primary/25"
              >
                Get in Touch
              </Link>
              <Link
                href="/projects"
                className="px-8 py-3 border border-border rounded-lg font-medium hover:bg-card transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                View Projects
              </Link>
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <ArrowDown className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
            </div>
          </div>
        </FadeInSection>
      </section>

      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <Users className="w-8 h-8 text-primary mx-auto mb-4" />
                <AnimatedCounter end={50} suffix="+" />
                <p className="text-muted-foreground">Projects Completed</p>
              </div>
              <div className="space-y-2">
                <Award className="w-8 h-8 text-primary mx-auto mb-4" />
                <AnimatedCounter end={5} suffix="+" />
                <p className="text-muted-foreground">Years Experience</p>
              </div>
              <div className="space-y-2">
                <Calendar className="w-8 h-8 text-primary mx-auto mb-4" />
                <AnimatedCounter end={100} suffix="%" />
                <p className="text-muted-foreground">Client Satisfaction</p>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <div className="grid md:grid-cols-3 gap-8">
              <InteractiveCard>
                <Link
                  href="/about"
                  className="group bg-card border border-border rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 block"
                >
                  <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">About Me</h3>
                  <p className="text-muted-foreground mb-4">
                    Learn more about my background and passion for technology.
                  </p>
                  <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </InteractiveCard>

              <InteractiveCard>
                <Link
                  href="/experience"
                  className="group bg-card border border-border rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 block"
                >
                  <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">Experience</h3>
                  <p className="text-muted-foreground mb-4">Explore my professional journey and key achievements.</p>
                  <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </InteractiveCard>

              <InteractiveCard>
                <Link
                  href="/projects"
                  className="group bg-card border border-border rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 block"
                >
                  <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">Projects</h3>
                  <p className="text-muted-foreground mb-4">Discover the projects I've worked on and their impact.</p>
                  <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </InteractiveCard>
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  )
}
