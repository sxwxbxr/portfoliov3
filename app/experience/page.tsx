import Link from "next/link"
import PageLayout, { Section } from "../../components/PageLayout"
import { getExperience } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function Experience() {
  const experience = await getExperience()

  return (
    <PageLayout
      title="Experience"
      subtitle="My professional journey across software development, project management, and engineering."
    >
      <section className="pb-24 md:pb-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div>
            {experience.map((exp, i) => (
              <Section key={exp.company + exp.period} delay={i * 0.05}>
                <div
                  className={`py-8 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-0 mb-4">
                    <div className="flex items-center gap-2.5 md:flex-1">
                      {exp.current && (
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                        </span>
                      )}
                      <h3 className={`font-semibold text-lg ${!exp.current ? "md:ml-[18px]" : ""}`}>
                        {exp.company}
                      </h3>
                    </div>
                    <span className="text-muted-foreground text-sm md:flex-1">
                      {exp.role}
                    </span>
                    <span className="font-mono text-sm text-muted-foreground md:text-right">
                      {exp.period}
                    </span>
                  </div>
                  <ul className="space-y-2 md:ml-[18px]">
                    {(exp.responsibilities as string[]).map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="text-border mt-1.5">--</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Section>
            ))}
            <div className="border-t border-border" />
          </div>

          <div className="mt-8">
            <Link
              href="/about"
              className="link-underline text-primary text-sm font-medium"
            >
              More about me &rarr;
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
