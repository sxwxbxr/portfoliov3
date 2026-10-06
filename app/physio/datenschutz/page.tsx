import type { Metadata } from "next"
import { siteCopy } from "@/lib/physio/copy/site"
import { physioUrl } from "@/lib/physio/urls"

/*
 * LEGAL REVIEW REQUIRED. This notice is a draft written from the technical
 * facts of the platform (see lib/physio/copy/site.ts, `privacy`). It has not
 * been checked by a lawyer. Before the paid launch, verify in particular:
 *  - controller details and the contact address (currently only the imprint),
 *  - the named processors and the transfer wording for Vercel (USA),
 *  - the retention periods and the legal bases per purpose,
 *  - the SMTP provider (not named here yet) and Vercel Analytics / Speed Insights,
 *  - what happens in Polar after account deletion (Polar keeps customer and
 *    invoice records as Merchant of Record),
 *  - whether the suggestions form stores the user id (physio_suggestions.user_id).
 */

const c = siteCopy.privacy

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.metaDescription,
  alternates: { canonical: physioUrl("/datenschutz") },
}

export default function PrivacyPage() {
  return (
    <div className="sheet pt-10 pb-24 md:pt-16 md:pb-32">
      <header className="mb-12 flex flex-col gap-4">
        <h1 className="display text-balance">
          {c.title}
          <span className="headline-sub">{c.titleSub}</span>
        </h1>
        <p className="lede">{c.intro}</p>
        <p className="annotate text-fg-muted">{c.updated}</p>
      </header>

      <div className="flex flex-col">
        {c.sections.map((s) => (
          <section key={s.heading} className="grid gap-4 border-t border-edge-soft py-8 md:grid-cols-[14rem_1fr] md:gap-10">
            <h2 className="text-lg tracking-tight">{s.heading}</h2>
            <div className="flex min-w-0 flex-col gap-4">
              {"paragraphs" in s &&
                s.paragraphs?.map((p) => (
                  <p key={p} className="measure leading-relaxed text-fg-muted">
                    {p}
                  </p>
                ))}
              {"list" in s && s.list && (
                <ul className="flex flex-col gap-3">
                  {s.list.map((item) => (
                    <li key={item} className="measure leading-relaxed text-fg-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
