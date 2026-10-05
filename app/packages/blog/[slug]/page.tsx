import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ChevronRight } from "lucide-react"
import PageLayout, { Section } from "@/components/PageLayout"
import { JsonLd } from "@/components/JsonLd"
import { PostBody } from "@/components/packages/PostBody"
import { InstallCommand } from "@/components/packages/InstallCommand"
import { YouTubeEmbed } from "@/components/packages/YouTubeEmbed"
import { blog, getRelatedPosts, headingsOf, readingTime } from "@/lib/blog"
import { getPackage } from "@/lib/packages"
import { pkgPath, pkgUrl, MAIN_ORIGIN } from "@/lib/packages/urls"
import { copy } from "@/lib/copy"
import { PostCard, formatDate } from "../PostCard"

export const revalidate = 60

export async function generateStaticParams() {
  return (await blog.getPosts()).map((p) => ({ slug: p.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await blog.getPost(slug)
  if (!post) return {}
  const url = post.canonicalUrl ?? pkgUrl(`/blog/${post.slug}`)
  const description = post.metaDescription || post.excerpt
  return {
    title: { absolute: post.seoTitle || post.title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      locale: post.lang?.replace("-", "_"),
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params
  const post = await blog.getPost(slug)
  if (!post) notFound()

  const headings = headingsOf(post)
  const related = await getRelatedPosts(post)
  const pkgs = post.packages.flatMap((s) => {
    const p = getPackage(s)
    return p ? [p] : []
  })
  const url = post.canonicalUrl ?? pkgUrl(`/blog/${post.slug}`)

  const toc = headings.length >= 3 && (
    <nav aria-label={copy.pkgBlog.onThisPage} className="flex flex-col gap-3">
      <span className="annotate">{copy.pkgBlog.onThisPage}</span>
      <ul className="flex flex-col gap-2 text-sm">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-4" : undefined}>
            <a href={`#${h.id}`} className="text-fg-muted transition-colors duration-150 hover:text-fg">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )

  return (
    <PageLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.metaDescription || post.excerpt,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt ?? post.publishedAt,
          ...(post.lang && { inLanguage: post.lang }),
          author:
            post.author === "Seya Weber"
              ? { "@type": "Person", name: post.author, url: MAIN_ORIGIN }
              : { "@type": "Organization", name: post.author, url: MAIN_ORIGIN },
          publisher: { "@type": "Organization", name: "Weber Development", url: MAIN_ORIGIN },
          url,
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          image: post.coverImage ?? pkgUrl(`/blog/${post.slug}/opengraph-image`),
        }}
      />

      <div className="sheet flex flex-col gap-10 pb-24 md:pb-32">
        <header className="flex flex-col gap-5">
          <Link
            href={pkgPath("/blog")}
            className="annotate inline-flex items-center gap-1.5 self-start transition-colors duration-150 hover:text-fg"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.pkgBlog.backToBlog}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="tab text-xs text-fg-muted">{copy.pkgBlog.types[post.type]}</span>
            <time dateTime={post.publishedAt} className="annotate">
              {formatDate(post.publishedAt)}
            </time>
            <span className="annotate">{copy.pkgBlog.readingTime(readingTime(post.body, post.bodyFormat))}</span>
          </div>
          <h1 className="display text-balance" lang={post.lang}>
            {post.title}
          </h1>
          <p className="lede measure" lang={post.lang}>{post.excerpt}</p>
          <p className="annotate">{copy.pkgBlog.postedBy(post.author)}</p>
          {post.canonicalUrl && (
            <a href={post.canonicalUrl} rel="canonical" className="annotate self-start hover:text-fg">
              {copy.pkgBlog.originallyPublished}
            </a>
          )}
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-14">
          <div className="flex min-w-0 flex-col gap-10">
            {toc && <div className="well p-4 lg:hidden">{toc}</div>}

            {post.coverImage && (
              // Remote cover images come from whatever host the source uses,
              // so a plain <img> instead of next/image and its host allow-list.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverImage}
                alt={post.coverAlt ?? ""}
                className="measure h-auto w-full rounded-lg border border-edge-soft"
              />
            )}

            <PostBody post={post} />

            {post.videos.length > 0 && (
              <Section className="flex flex-col gap-4">
                <span className="annotate">{copy.pkgBlog.videos}</span>
                {post.videos.map((id) => (
                  <YouTubeEmbed key={id} youtubeId={id} title={post.title} />
                ))}
              </Section>
            )}

            {pkgs.map((p) => (
              <Section key={p.slug} className="cast flex flex-col gap-4 p-6 md:p-7">
                <span className="annotate">{copy.pkgBlog.usedPackage}</span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg tracking-tight">{p.name}</h2>
                  <p className="measure text-sm leading-relaxed text-fg-muted">{p.tagline}</p>
                </div>
                <InstallCommand command={p.install} packageSlug={p.slug} />
                <Link
                  href={pkgPath(`/${p.slug}`)}
                  className="control inline-flex items-center gap-1 self-start py-2.5 pr-3 pl-4 text-sm"
                >
                  {copy.pkgBlog.viewPackage}
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </Section>
            ))}

            {related.length > 0 && (
              <Section className="flex flex-col gap-5">
                <h2 className="headline">{copy.pkgBlog.related}</h2>
                <div className="border-t border-edge-soft">
                {related.map((r) => (
                  <PostCard key={r.slug} post={r} />
                ))}
                </div>
              </Section>
            )}
          </div>

          {toc && (
            <aside className="hidden lg:block">
              <div className="sticky top-28">{toc}</div>
            </aside>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
