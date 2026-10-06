import type { Metadata } from "next"
import Link from "next/link"
import { QueryView } from "@/components/physio/search-string/QueryView"
import { SearchStringTool } from "@/components/physio/search-string/SearchStringTool"
import { ssCopy } from "@/lib/physio/copy/search-string"
import { getPhysioAccess } from "@/lib/physio/session"
import { EXAMPLES, analyze, buildQuery, createModel } from "@/lib/physio/search-string"
import { physioPath, physioUrl } from "@/lib/physio/urls"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: ssCopy.metaTitle,
  description: ssCopy.metaDescription,
  alternates: { canonical: physioUrl("/tools/suchstring") },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${ssCopy.metaTitle} | physio.sweber.dev`,
    description: ssCopy.metaDescription,
    url: physioUrl("/tools/suchstring"),
    type: "website",
  },
}

export default async function SuchstringPage() {
  const access = await getPhysioAccess()

  if (access.hasAccess) {
    return (
      <>
        <header className="sheet pt-10 pb-12 md:pt-16 md:pb-16">
          <div className="flex flex-col items-start gap-5">
            <h1 className="display text-balance">
              {ssCopy.hero.title}
              <span className="headline-sub">{ssCopy.hero.sub}</span>
            </h1>
            <p className="lede">{ssCopy.hero.lede}</p>
          </div>
        </header>
        <SearchStringTool mode="full" />
      </>
    )
  }

  return <Paywall loggedIn={!!access.user} />
}

/** Built with the real engine, so the sample is what the tool produces. */
function sampleQuery(): string {
  const ex = EXAMPLES.find((e) => e.id === "mueller") ?? EXAMPLES[0]
  return buildQuery(createModel(analyze({ text: ex.text, pico: ex.pico }))).query
}

function Paywall({ loggedIn }: { loggedIn: boolean }) {
  const t = ssCopy.paywall
  return (
    <>
      <header className="sheet pt-10 pb-12 md:pt-16 md:pb-16">
        <div className="flex flex-col items-start gap-6">
          <h1 className="display text-balance">
            {t.title}
            <span className="headline-sub">{t.sub}</span>
          </h1>
          <p className="lede">{t.lede}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={physioPath("/abo")} className="control control-primary inline-flex min-h-11 items-center px-6 text-sm">
              {t.aboLink}
            </Link>
            <Link href={physioPath("/tools/suchstring/demo")} className="control inline-flex min-h-11 items-center px-6 text-sm">
              {t.demoLink}
            </Link>
          </div>
          <p className="text-sm text-fg-muted">
            {loggedIn ? (
              t.verifyHint
            ) : (
              <>
                {t.loginHint}{" "}
                <Link
                  href={physioPath("/anmelden?next=/tools/suchstring")}
                  className="text-fg underline underline-offset-4"
                >
                  {t.loginLink}
                </Link>
              </>
            )}
          </p>
        </div>
      </header>

      <div className="sheet grid gap-x-16 gap-y-12 border-t border-edge-soft pt-12 pb-24 md:pb-32 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section aria-labelledby="pw-what">
          <h2 id="pw-what" className="headline mb-6">
            {t.whatHeading}
          </h2>
          <ul className="flex flex-col">
            {t.points.map((p) => (
              <li key={p} className="border-t border-edge-soft py-4 text-sm leading-relaxed text-fg-muted first:border-t-0 first:pt-0">
                {p}
              </li>
            ))}
          </ul>
          <p className="annotate text-fg-muted mt-6 max-w-[40ch]">{t.privacy}</p>
        </section>

        <section aria-labelledby="pw-sample" className="min-w-0">
          <h2 id="pw-sample" className="headline mb-2">
            {t.sampleHeading}
          </h2>
          <p className="mb-5 text-sm text-fg-muted">{t.sampleCaption}</p>
          <div className="well p-1.5">
            <div className="rounded-md p-4 md:p-5">
              <QueryView query={sampleQuery()} label={ssCopy.result.stringLabel} />
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
