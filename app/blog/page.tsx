"use client"

import Link from "next/link"
import { Newspaper } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClassicSection } from "@/components/classic/classic-section"
import { SyntaxHighlight, CodeBlock } from "@/components/ide/code-block"
import { DualLayoutPage } from "@/components/dual-layout-page"
import { blogPosts } from "@/src/config"

export default function BlogPage() {
  const classic = (
    <>
      <section className="py-16 border-b border-border">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Blog</p>
          <h1 className="text-4xl font-bold">Thoughts on delivery and engineering</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Notes from migrations, automations, and the journey from electrical planning to software.
          </p>
        </div>
      </section>

      <ClassicSection title="Latest posts">
        <div className="grid md:grid-cols-2 gap-6">
          {blogPosts.map((post) => (
            <Card key={post.id} className="h-full border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5" />
                  {post.title}
                </CardTitle>
                <CardDescription>
                  {post.publishedAt} • {post.readTime}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>{post.excerpt}</p>
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Link className="text-primary text-sm font-medium hover:underline" href={`/blog/${post.id}`}>
                  Continue reading
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </ClassicSection>
    </>
  )

  const ide = (
    <div className="space-y-8 max-w-5xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
          <span>1</span>
          <SyntaxHighlight comment>{"// blog/index.ts"}</SyntaxHighlight>
        </div>
        <CodeBlock>
          <div className="space-y-1">
            <div>
              <SyntaxHighlight keyword>export</SyntaxHighlight> <SyntaxHighlight keyword>const</SyntaxHighlight>{" "}
              <SyntaxHighlight variable>posts</SyntaxHighlight> = [
            </div>
            {blogPosts.map((post, idx) => (
              <div key={post.id} className="pl-4 space-y-1">
                <div>{"{"}</div>
                <div className="pl-4">
                  <SyntaxHighlight property>title</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>{`"${post.title}"`}</SyntaxHighlight>,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>publishedAt</SyntaxHighlight>:{" "}
                  <SyntaxHighlight string>{`"${post.publishedAt}"`}</SyntaxHighlight>,
                </div>
                <div className="pl-4">
                  <SyntaxHighlight property>tags</SyntaxHighlight>: [
                </div>
                <div className="pl-8">
                  {post.tags.map((tag, tagIdx) => (
                    <div key={tag}>
                      <SyntaxHighlight string>{`"${tag}"`}</SyntaxHighlight>
                      {tagIdx < post.tags.length - 1 ? "," : ""}
                    </div>
                  ))}
                </div>
                <div className="pl-4">]</div>
                <div>{"}"}{idx < blogPosts.length - 1 ? "," : ""}</div>
              </div>
            ))}
            <div>]</div>
          </div>
        </CodeBlock>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {blogPosts.map((post) => (
          <Card key={post.id} className="bg-[var(--ide-sidebar)] border-[var(--ide-border)] h-full">
            <CardHeader>
              <CardTitle className="text-[var(--ide-text)]">{post.title}</CardTitle>
              <CardDescription className="text-[var(--ide-text-muted)]">
                {post.publishedAt} • {post.readTime}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[var(--ide-text)] text-sm space-y-2">
              <p>{post.excerpt}</p>
              <div className="flex gap-2 flex-wrap">
                {post.tags.map((tag) => (
                  <Badge key={tag} className="bg-[var(--ide-accent)] text-white">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Link className="text-[var(--ide-accent)]" href={`/blog/${post.id}`}>
                Continue reading →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return <DualLayoutPage classic={classic} ide={ide} />
}
