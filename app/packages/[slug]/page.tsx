import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Check, ChevronRight, Minus } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { ProseMarkdown } from "@/components/ProseMarkdown"
import { JsonLd } from "@/components/JsonLd"
import { InstallCommand } from "@/components/packages/InstallCommand"
import { PackageBadges } from "@/components/packages/Badges"
import { PricingBlock } from "@/components/packages/PricingBlock"
import { TrackedLink } from "@/components/packages/TrackedLink"
import { YouTubeEmbed } from "@/components/packages/YouTubeEmbed"
import { getPackage, getPackages } from "@/lib/packages"
import type { Package } from "@/lib/packages/schema"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"
import { getPostsForPackage } from "@/lib/blog"
import { copy } from "@/lib/copy"

export const revalidate = 60

export function generateStaticParams() {
  return getPackages().map((p) => ({ slug: p.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pkg = getPackage(slug)
  if (!pkg) return {}
  const title = pkg.seoTitle ?? pkg.name
  const url = pkgUrl(`/${pkg.slug}`)
  return {
    title: { absolute: title },
    description: pkg.tagline,
    alternates: { canonical: url },
    openGraph: { title, description: pkg.tagline, url, type: "website" },
  }
}

function structuredData(pkg: Package) {
  const offers = (pkg.pricing?.tiers ?? []).flatMap((tier) => {
    const base = {
      "@type": "Offer",
      priceCurrency: pkg.pricing!.currency,
      url: pkgUrl(`/${pkg.slug}#pricing`),
      availability:
        pkg.pro?.availability === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
    }
    const per = tier.perSeat ? ", per person" : ""
    const out: Record<string, unknown>[] = []
    if (tier.monthly !== undefined)
      out.push({ ...base, name: `${tier.name} (monthly${per})`, price: tier.monthly })
    if (tier.yearly !== undefined)
      out.push({ ...base, name: `${tier.name} (yearly${per})`, price: tier.yearly })
    if (tier.oneTime !== undefined)
      out.push({ ...base, name: `${tier.name} (one-time${per})`, price: tier.oneTime })
    return out
  })

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: pkg.name,
    description: pkg.tagline,
    url: pkgUrl(`/${pkg.slug}`),
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    license:
      pkg.license === "commercial" ? undefined : "https://opensource.org/licenses/MIT",
    author: { "@type": "Person", name: "Seya Weber", url: "https://sweber.dev" },
    ...(offers.length > 0 && { offers }),
  }
}


function Cell({ value }: { value: boolean | string }) {
  if (value === true)
    return (
      <>
        <Check className="mx-auto h-4 w-4 text-fg-muted" aria-hidden="true" />
        <span className="sr-only">{copy.packages.included}</span>
      </>
    )
  if (value === false)
    return (
      <>
        <Minus className="mx-auto h-4 w-4 text-fg-subtle" aria-hidden="true" />
        <span className="sr-only">{copy.packages.notIncluded}</span>
      </>
    )
  return <span className="text-fg-muted">{value}</span>
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5 text-sm text-fg-muted">
      {items.map((f) => (
        <li key={f} className="flex items-start gap-2.5">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-fg-muted" aria-hidden="true" />
          {f}
        </li>
      ))}
    </ul>
  )
}

export default async function PackagePage({ params }: Props) {
  const { slug } = await params
  const pkg = getPackage(slug)
  if (!pkg) notFound()

  const posts = await getPostsForPackage(pkg.slug, 3)
  const showPosts = posts.length > 0
  const showArticles = !showPosts && pkg.articles.length > 0
  const s = copy.packages.sections
  const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"
  const chev = <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />

  return (
    <PageLayout>
      <JsonLd data={structuredData(pkg)} />

      {/* Above the fold: no scroll-reveal, so the largest paint does not wait for hydration. */}
      <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex flex-col items-start gap-8">
          <Link
            href={pkgPath("/")}
            className="annotate inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-fg"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.packages.backToOverview}
          </Link>

          <div className="flex flex-col items-start gap-5">
            <PackageBadges pkg={pkg} />
            <h1 className="display text-balance">
              {pkg.name}
              <span className="headline-sub">{pkg.tagline}</span>
            </h1>
          </div>

          <div className="w-full max-w-2xl">
            <InstallCommand command={pkg.install} packageSlug={pkg.slug} />
          </div>

          <div className="flex flex-wrap gap-3">
            {(pkg.docs || pkg.links.docs) && (
              <TrackedLink
                // Own docs open on this site (and host); only external docs leave it.
                href={pkg.docs ? pkgPath(`/${pkg.slug}/docs`) : pkg.links.docs!}
                event="docs_click"
                data={{ package: pkg.slug }}
                className={btn + " control-primary"}
              >
                {copy.packages.docs}
                {chev}
              </TrackedLink>
            )}
            {pkg.links.github && (
              <TrackedLink href={pkg.links.github} className={btn}>
                {copy.packages.github}
                {chev}
              </TrackedLink>
            )}
            {pkg.links.npm && (
              <TrackedLink href={pkg.links.npm} className={btn}>
                {copy.packages.npm}
                {chev}
              </TrackedLink>
            )}
            {pkg.links.changelog && (
              <TrackedLink href={pkg.links.changelog} className={btn}>
                {copy.packages.changelog}
                {chev}
              </TrackedLink>
            )}
          </div>
        </div>
      </header>

      <section className="sheet pb-16 md:pb-24">
        <ProseMarkdown>{pkg.description}</ProseMarkdown>
      </section>

      {pkg.code && (
        // The snippet sits in the right column under the heading: code does
        // not need the full page width the way card grids do.
        <Block
          label={s.code.label}
          title={s.code.title}
          sub={s.code.sub}
          aside={
            <div className="mt-4 flex min-w-0 flex-col gap-3">
              {pkg.code.title && <p className="annotate">{pkg.code.title}</p>}
              <div className="well overflow-hidden p-1.5">
                <pre className="overflow-x-auto rounded-md p-4 font-mono text-[13px] leading-relaxed text-fg">
                  <code>{pkg.code.snippet}</code>
                </pre>
              </div>
            </div>
          }
        />
      )}

      <Block label={s.features.label} title={s.features.title} sub={s.features.sub}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="cast flex flex-col gap-5 p-6 md:p-7">
            <h3 className="text-lg tracking-tight">{copy.packages.freeHeading}</h3>
            <FeatureList items={pkg.features.free} />
          </div>
          {pkg.features.pro && pkg.features.pro.length > 0 && (
            <div className="cast flex flex-col gap-5 p-6 md:p-7">
              <h3 className="text-lg tracking-tight">{copy.packages.proHeading}</h3>
              <FeatureList items={pkg.features.pro} />
            </div>
          )}
        </div>
      </Block>

      {pkg.comparison && pkg.comparison.length > 0 && (
        <Block label={s.comparison.label} title={s.comparison.title} sub={s.comparison.sub}>
          <div className="cast relative overflow-x-auto p-2">
            <table className="w-full min-w-[480px] border-collapse text-left text-sm">
              <thead>
                <tr className="annotate">
                  <th scope="col" className="px-4 py-3 font-normal">
                    {copy.packages.comparisonFeature}
                  </th>
                  <th scope="col" className="px-4 py-3 text-center font-normal">
                    {copy.packages.comparisonFree}
                  </th>
                  <th scope="col" className="px-4 py-3 text-center font-normal">
                    {copy.packages.comparisonPro}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pkg.comparison.map((row) => (
                  <tr key={row.feature} className="border-t border-edge-soft">
                    <th scope="row" className="px-4 py-3 font-normal text-fg">
                      {row.feature}
                    </th>
                    <td className="px-4 py-3 text-center">
                      <Cell value={row.free} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Cell value={row.pro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>
      )}

      {pkg.pro && pkg.pro.packages.length > 0 && (
        <Block
          label={s.proPackages.label}
          title={s.proPackages.title}
          sub={s.proPackages.sub}
          aside={
            pkg.pro.demoUrl && (
              <div className="flex flex-col items-start gap-3">
                <Link href={pkgPath(pkg.pro.demoUrl)} className={btn + " control-primary"}>
                  {copy.packages.liveDemo}
                  {chev}
                </Link>
                <p className="annotate">{copy.packages.liveDemoNote}</p>
              </div>
            )
          }
        >
          <ul className="grid gap-3 md:grid-cols-2">
            {pkg.pro.packages.map((p) => (
              <li key={p.name} className="cast flex flex-col gap-2 p-6">
                <code className="break-all font-mono text-sm text-fg">{p.name}</code>
                <p className="text-sm leading-relaxed text-fg-muted">{p.description}</p>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {pkg.pricing && (
        <Block id="pricing" label={s.pricing.label} title={s.pricing.title} sub={s.pricing.sub}>
          <PricingBlock pkg={pkg} />
        </Block>
      )}

      {pkg.faq.length > 0 && (
        <Block label={s.faq.label} title={s.faq.title} sub={s.faq.sub}>
          <div className="border-t border-edge-soft">
            {pkg.faq.map((item) => (
              <details key={item.q} className="group border-b border-edge-soft py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-fg [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="text-fg-subtle transition-transform duration-150 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="measure mt-3 leading-relaxed text-fg-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </Block>
      )}

      {(showPosts || showArticles) && (
        <Block label={s.articles.label} title={s.articles.title} sub={s.articles.sub}>
          <ul className="grid gap-3 md:grid-cols-3">
            {showPosts &&
              posts.map((post) => (
                <li key={post.slug} className="cast card-link relative flex flex-col gap-2 p-6">
                  <p className="annotate">{post.publishedAt}</p>
                  <Link
                    href={pkgPath(`/blog/${post.slug}`)}
                    className="text-lg tracking-tight text-fg after:absolute after:inset-0 after:content-['']"
                  >
                    {post.title}
                  </Link>
                  <p className="text-sm leading-relaxed text-fg-muted">{post.excerpt}</p>
                </li>
              ))}
            {showArticles &&
              pkg.articles.map((a) => (
                <li key={a.url} className="cast card-link p-6">
                  <TrackedLink
                    href={a.url}
                    className="inline-flex items-center gap-1 text-lg tracking-tight text-fg"
                  >
                    {a.title}
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </TrackedLink>
                </li>
              ))}
          </ul>
        </Block>
      )}

      {pkg.videos.length > 0 && (
        <Block label={s.videos.label} title={s.videos.title} sub={s.videos.sub}>
          <div className="grid gap-6 md:grid-cols-2">
            {pkg.videos.map((v) => (
              <figure key={v.youtubeId} className="flex flex-col gap-3">
                <YouTubeEmbed youtubeId={v.youtubeId} title={v.title} />
                <figcaption className="text-sm text-fg-muted">{v.title}</figcaption>
              </figure>
            ))}
          </div>
        </Block>
      )}
    </PageLayout>
  )
}
