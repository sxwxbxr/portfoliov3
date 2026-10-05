import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import PageLayout from "@/components/PageLayout"
import { DocsNav } from "@/components/packages/docs/DocsNav"
import { DocsMarkdown } from "@/components/packages/docs/DocsMarkdown"
import { getPackage, getPackages } from "@/lib/packages"
import {
  docsEditUrl,
  docsPath,
  getDocsNavFor,
  getDocsPage,
  isValidDocsPath,
} from "@/lib/packages/docs"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"
import { extractHeadings } from "@/lib/blog"
import { copy } from "@/lib/copy"

export const revalidate = 3600
export const dynamicParams = true

const t = copy.packages.docsPage

type Props = { params: Promise<{ slug: string; path?: string[] }> }

/** One param set for the overview and one per page in nav.json. A failed fetch yields none. */
export async function generateStaticParams() {
  const sets = await Promise.all(
    getPackages().map(async (pkg) => {
      if (!pkg.docs) return []
      const nav = await getDocsNavFor(pkg.docs)
      if (!nav) return []
      return [
        { slug: pkg.slug, path: [] as string[] },
        ...nav.pages.map((p) => ({ slug: pkg.slug, path: p.path.split("/") })),
      ]
    })
  )
  return sets.flat()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, path } = await params
  const pkg = getPackage(slug)
  if (!pkg?.docs) return {}
  const page = path?.join("/")
  const url = pkgUrl(`/${slug}/docs${page ? `/${page}` : ""}`)

  if (!page) {
    const title = t.seoSuffix(pkg.name)
    return {
      title: { absolute: title },
      description: pkg.tagline,
      alternates: { canonical: url },
      openGraph: { title, description: pkg.tagline, url, type: "website" },
    }
  }

  const doc = await getDocsPage(pkg.docs, page)
  if (!doc) return {}
  const title = `${doc.title} – ${t.seoSuffix(pkg.name)}`
  const description = doc.description || pkg.tagline
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
  }
}

export default async function DocsPage({ params }: Props) {
  const { slug, path } = await params
  const pkg = getPackage(slug)
  if (!pkg?.docs) notFound()
  const docs = pkg.docs
  const page = path?.join("/")
  if (page !== undefined && !isValidDocsPath(page)) notFound()

  const nav = await getDocsNavFor(docs)
  // A failed fetch degrades: the overview explains it, a page is a 404.
  if (!nav && page !== undefined) notFound()

  const crumbLink = "transition-colors duration-150 hover:text-fg"

  if (page === undefined) {
    return (
      <PageLayout>
        <div className="sheet pt-10 pb-24 md:pt-16">
          <div className="md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-12 lg:gap-16">
            {nav && <DocsNav nav={nav} slug={slug} />}
            <div className="min-w-0">
              <nav aria-label={t.crumbs} className="annotate mb-6 flex flex-wrap gap-x-2">
                <Link href={pkgPath(`/${slug}`)} className={crumbLink}>
                  {pkg.name}
                </Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{t.overviewLabel}</span>
              </nav>
              <h1 className="text-balance text-3xl tracking-tight text-fg md:text-4xl">
                {t.overviewTitle(pkg.name)}
              </h1>
              <p className="measure mt-4 text-lg leading-relaxed text-fg-muted">{pkg.tagline}</p>

              {nav ? (
                <div className="mt-12 flex flex-col gap-10">
                  {nav.sections.map((section, i) => (
                    <section key={section.label} aria-labelledby={`sec-${i}`}>
                      <h2 id={`sec-${i}`} className="annotate border-b border-edge-soft pb-3">
                        {section.label}
                      </h2>
                      <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {section.pages.map((p) => (
                          <li key={p.path} className="flex">
                            <Link
                              href={docsPath(slug, p.path)}
                              className="flex w-full flex-col gap-1.5 rounded-lg border border-edge-soft p-5 transition-colors duration-150 hover:border-edge hover:bg-plate"
                            >
                              <span className="tracking-tight text-fg">{p.title}</span>
                              {p.description && (
                                <span className="text-sm leading-relaxed text-fg-muted">
                                  {p.description}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              ) : (
                <div role="status" className="measure mt-12 flex flex-col items-start gap-4">
                  <p className="leading-relaxed text-fg-muted">{t.unavailable}</p>
                  <a
                    href={`https://github.com/${docs.repo}/tree/${docs.ref}/${docs.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="control inline-flex items-center px-5 py-2.5 text-sm"
                  >
                    {t.openRepository}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  const doc = await getDocsPage(docs, page)
  if (!doc || !nav) notFound()

  const index = nav.pages.findIndex((p) => p.path === page)
  const prev = nav.pages[index - 1]
  const next = nav.pages[index + 1]
  const section = nav.sections.find((s) => s.pages.some((p) => p.path === page))
  const headings = extractHeadings(doc.body)

  return (
    <PageLayout>
      <div className="sheet pt-10 pb-24 md:pt-16">
        <div className="md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-12 lg:gap-16 xl:grid-cols-[14rem_minmax(0,1fr)_12rem]">
          <DocsNav nav={nav} slug={slug} current={page} />
          <div className="min-w-0">
            <nav aria-label={t.crumbs} className="annotate mb-6 flex flex-wrap gap-x-2">
              <Link href={pkgPath(`/${slug}`)} className={crumbLink}>
                {pkg.name}
              </Link>
              <span aria-hidden="true">/</span>
              <Link href={docsPath(slug)} className={crumbLink}>
                {copy.packages.docs}
              </Link>
              {section && (
                <>
                  <span aria-hidden="true">/</span>
                  <span>{section.label}</span>
                </>
              )}
            </nav>

            <h1 className="text-balance text-3xl tracking-tight text-fg md:text-4xl">{doc.title}</h1>
            {doc.description && (
              <p className="measure mt-4 text-lg leading-relaxed text-fg-muted">{doc.description}</p>
            )}

            <div className="mt-10">
              <DocsMarkdown slug={slug} current={page}>
                {doc.body}
              </DocsMarkdown>
            </div>

            <footer className="mt-16 flex flex-col gap-8 border-t border-edge-soft pt-8">
              <a
                href={docsEditUrl(docs, page)}
                target="_blank"
                rel="noopener noreferrer"
                className="annotate self-start underline underline-offset-2 hover:text-fg"
              >
                {t.editOnGitHub}
              </a>
              <nav aria-label={t.navLabel} className="grid gap-3 sm:grid-cols-2">
                {prev ? (
                  <Link
                    href={docsPath(slug, prev.path)}
                    rel="prev"
                    className="cast flex flex-col gap-1 p-5 transition-colors duration-150 hover:bg-plate"
                  >
                    <span className="annotate">{t.previous}</span>
                    <span className="text-fg">{prev.title}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {next && (
                  <Link
                    href={docsPath(slug, next.path)}
                    rel="next"
                    className="cast flex flex-col gap-1 p-5 transition-colors duration-150 hover:bg-plate sm:col-start-2 sm:text-right"
                  >
                    <span className="annotate">{t.next}</span>
                    <span className="text-fg">{next.title}</span>
                  </Link>
                )}
              </nav>
            </footer>
          </div>

          {/* Only on wide screens, where a third column fits beside the text. */}
          {headings.length >= 2 && (
            <aside className="hidden xl:block">
              <nav aria-label={t.onThisPage} className="sticky top-28 flex flex-col gap-3">
                <p className="annotate">{t.onThisPage}</p>
                <ul className="flex flex-col gap-2 border-l border-edge-soft">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className={
                          "-ml-px block border-l border-transparent text-sm leading-snug text-fg-muted transition-colors duration-150 hover:border-fg hover:text-fg " +
                          (h.level === 3 ? "pl-6" : "pl-3")
                        }
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
