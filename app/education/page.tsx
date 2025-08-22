"use client"

import PageLayout from "../../components/PageLayout"
import FadeInSection from "../../components/FadeInSection"

export default function Education() {
  return (
    <PageLayout title="Education" subtitle="My academic journey and continuous learning in technology and engineering">
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">BM</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Berufsmatura TALS</h3>
                <p className="text-muted-foreground text-sm mb-4">08/2024 – 07/2025</p>
                <p className="text-card-foreground">
                  Advanced vocational education focusing on technical and scientific subjects, preparing for higher
                  education in engineering and technology fields.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-secondary font-bold">CS</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">EFZ in Computer Science</h3>
                <p className="text-muted-foreground text-sm mb-2">Application Development – WISS St. Gallen</p>
                <p className="text-muted-foreground text-sm mb-4">08/2022 – 07/2024</p>
                <p className="text-card-foreground">
                  Comprehensive training in software development, focusing on .NET technologies, database management,
                  and modern application development practices.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-accent font-bold">EP</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">EFZ in Electrical Planning</h3>
                <p className="text-muted-foreground text-sm mb-2">GBS St. Gallen</p>
                <p className="text-muted-foreground text-sm mb-4">08/2018 – 07/2022</p>
                <p className="text-card-foreground">
                  Specialized training in electrical systems design, planning, and implementation, providing a strong
                  foundation in technical problem-solving.
                </p>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>
    </PageLayout>
  )
}
