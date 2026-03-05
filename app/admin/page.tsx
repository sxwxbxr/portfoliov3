export const dynamic = "force-dynamic"

import Link from "next/link"
import { db } from "@/lib/db"
import { projects, experienceEntries, blogPosts, caseStudies } from "@/lib/schema"
import { count } from "drizzle-orm"
import { getSession } from "@/lib/auth"

export default async function AdminDashboardPage() {
  const session = await getSession()

  const [[projectCount], [experienceCount], [blogCount], [caseStudyCount]] =
    await Promise.all([
      db.select({ value: count() }).from(projects),
      db.select({ value: count() }).from(experienceEntries),
      db.select({ value: count() }).from(blogPosts),
      db.select({ value: count() }).from(caseStudies),
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
    },
    {
      label: "Case Studies",
      count: caseStudyCount.value,
      href: "/admin/case-studies",
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
            className="glass rounded-xl p-6 hover:border-primary/20 transition-colors group"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
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
            href="/admin/blog/new"
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            New Blog Post
          </Link>
          <Link
            href="/admin/case-studies/new"
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            New Case Study
          </Link>
        </div>
      </div>
    </div>
  )
}
