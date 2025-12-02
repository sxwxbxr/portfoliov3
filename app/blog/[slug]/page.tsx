"use client"

import Link from "next/link"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { Calendar, Clock, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClassicSection } from "@/components/classic/classic-section"
import { SyntaxHighlight, CodeBlock } from "@/components/ide/code-block"
import { DualLayoutPage } from "@/components/dual-layout-page"
import { blogPosts } from "@/src/config"

export default function BlogDetail({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((item) => item.id === params.slug)

  if (!post) {
    notFound()
  }

  const classic = (
    <>
      <section className="py-16 border-b border-border">
        <div className="space-y-4 max-w-4xl">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Blog</p>
          <h1 className="text-4xl font-bold">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> {post.publishedAt}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> {post.readTime}
            </span>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
          <div className="flex gap-2 flex-wrap">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <ClassicSection title="Article">
        <article className="prose dark:prose-invert max-w-4xl">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>
        <div className="pt-8">
          <Link className="flex items-center gap-2 text-primary hover:underline" href="/blog">
            <ArrowLeft className="h-4 w-4" /> Back to blog
          </Link>
        </div>
      </ClassicSection>
    </>
  )

  const ide = (
    <div className="space-y-8 max-w-5xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--ide-text-muted)] text-sm">
          <span>1</span>
          <SyntaxHighlight comment>{`// blog/${post.id}.md`}</SyntaxHighlight>
        </div>
        <CodeBlock>
          <div className="space-y-1">
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
              <SyntaxHighlight property>readTime</SyntaxHighlight>:{" "}
              <SyntaxHighlight string>{`"${post.readTime}"`}</SyntaxHighlight>,
            </div>
            <div className="pl-4">
              <SyntaxHighlight property>tags</SyntaxHighlight>: [
            </div>
            <div className="pl-8">
              {post.tags.map((tag, idx) => (
                <div key={tag}>
                  <SyntaxHighlight string>{`"${tag}"`}</SyntaxHighlight>
                  {idx < post.tags.length - 1 ? "," : ""}
                </div>
              ))}
            </div>
            <div className="pl-4">]</div>
            <div>{"}"}</div>
          </div>
        </CodeBlock>
      </div>

      <Card className="bg-[var(--ide-sidebar)] border-[var(--ide-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--ide-text)]">{post.title}</CardTitle>
          <CardDescription className="text-[var(--ide-text-muted)]">
            {post.publishedAt} • {post.readTime}
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-[var(--ide-text)]">
          <ReactMarkdown>{post.content}</ReactMarkdown>
          <div className="pt-6">
            <Link className="text-[var(--ide-accent)]" href="/blog">
              ← Back to blog
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return <DualLayoutPage classic={classic} ide={ide} />
}
