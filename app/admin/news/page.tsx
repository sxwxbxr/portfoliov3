export const dynamic = "force-dynamic"

import Link from "next/link"
import { desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { packagePosts } from "@/lib/schema"
import { getPackages } from "@/lib/packages"
import { pkgUrl } from "@/lib/packages/urls"
import DeleteButton from "@/components/admin/DeleteButton"

const badge =
  "text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-border"

export default async function AdminNewsPage() {
  const posts = await db
    .select()
    .from(packagePosts)
    .orderBy(desc(packagePosts.publishedAt), desc(packagePosts.id))
  const names = new Map(getPackages().map((p) => [p.slug, p.name]))
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Package News
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {posts.length} post{posts.length !== 1 ? "s" : ""} on the package site
          </p>
        </div>
        <Link
          href="/admin/news/new"
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          New post
        </Link>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No posts yet. Write your first one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Title", "Type", "Status", "Date", "Packages", "Source"].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 font-medium text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const scheduled = post.status === "published" && post.publishedAt > today
                  const status =
                    post.status !== "published"
                      ? { label: "Draft", cls: "bg-muted/60 text-muted-foreground" }
                      : scheduled
                        ? { label: "Scheduled", cls: "bg-accent text-foreground" }
                        : { label: "Published", cls: "bg-primary/10 text-primary" }
                  return (
                    <tr
                      key={post.id}
                      className="border-b border-border/50 hover:bg-accent/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium">{post.title}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {post.slug}
                        </div>
                      </td>
                      <td className="py-3 px-4 capitalize">{post.type}</td>
                      <td className="py-3 px-4">
                        <span className={`${badge} ${status.cls}`}>{status.label}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{post.publishedAt}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {post.packages.map((s) => (
                            <span key={s} className="px-2 py-0.5 text-xs bg-accent rounded-full">
                              {names.get(s) ?? s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {post.source !== "admin" && (
                          <span className={`${badge} bg-muted/60 text-muted-foreground`}>
                            {post.source}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/news/${post.id}/edit`}
                            className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors"
                          >
                            Edit
                          </Link>
                          {post.status === "published" && (
                            <a
                              href={pkgUrl(`/blog/${post.slug}`)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors"
                            >
                              View live
                            </a>
                          )}
                          <DeleteButton endpoint={`/api/admin/news/${post.id}`} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
