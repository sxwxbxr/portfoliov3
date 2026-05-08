export const dynamic = "force-dynamic"

import Link from "next/link"
import { db } from "@/lib/db"
import { projects, experienceEntries, blogPosts, caseStudies, certificates } from "@/lib/schema"
import { count } from "drizzle-orm"
import { getSession } from "@/lib/auth"
import { BLOG_ENABLED, CASE_STUDIES_ENABLED } from "@/lib/features"

export default async function AdminDashboardPage() {
  const session = await getSession()

  const [
    [projectCount],
    [experienceCount],
    [blogCount],
    [caseStudyCount],
    [certificateCount],
  ] = await Promise.all([
    db.select({ value: count() }).from(projects),
    db.select({ value: count() }).from(experienceEntries),
    db.select({ value: count() }).from(blogPosts),
    db.select({ value: count() }).from(caseStudies),
    db.select({ value: count() }).from(certificates),
  ])

  const stats = [
    {
      label: "Projects",
      count: projectCount.value,
      href: "/admin/projects",
    },
    {
      label: "Experience",
      count: experienceCount.value,
      href: "/admin/experience",
    },
    {
      label: "Blog Posts",
      count: blogCount.value,
      href: "/admin/blog",
      disabled: !BLOG_ENABLED,
    },
    {
      label: "Case Studies",
      count: caseStudyCount.value,
      href: "/admin/case-studies",
      disabled: !CASE_STUDIES_ENABLED,
    },
    {
      label: "Certificates",
      count: certificateCount.value,
      href: "/admin/certificates",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Welcome back{session?.email ? `, ${session.email.split("@")[0]}` : ""}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your portfolio content from here.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`glass rounded-xl p-6 hover:border-primary/20 transition-colors group relative ${
              stat.disabled ? "opacity-70" : ""
            }`}
            title={
              stat.disabled
                ? "Hidden from the public site — flip the flag in lib/features.ts to re-enable"
                : undefined
            }
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              {stat.disabled && (
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border">
                  Disabled
                </span>
              )}
            </div>
            <p className="font-display text-3xl font-semibold mt-1">
              {stat.count}
            </p>
            <p className="text-xs text-muted-foreground mt-3 group-hover:text-primary transition-colors">
              Manage &rarr;
            </p>
          </Link>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-display text-lg font-semibold mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/projects/new"
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            New Project
          </Link>
          <Link
            href="/admin/experience/new"
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            New Experience
          </Link>
          <Link
            href="/admin/certificates/new"
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            New Certificate
          </Link>
          <Link
            href="/admin/certificates/education/new"
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            New Education Entry
          </Link>
        </div>
      </div>
    </div>
  )
}
