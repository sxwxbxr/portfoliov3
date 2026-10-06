import type { Metadata } from "next"
import { ToolFrame } from "@/components/physio/ToolFrame"
import { ToolPaywall } from "@/components/physio/ToolPaywall"
import { SampleQuery } from "@/components/physio/search-string/SampleQuery"
import { SearchStringTool } from "@/components/physio/search-string/SearchStringTool"
import { ssCopy } from "@/lib/physio/copy/search-string"
import { getPhysioAccess } from "@/lib/physio/session"
import { getTool } from "@/lib/physio/tools"
import { physioUrl } from "@/lib/physio/urls"

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
      <ToolFrame slug="suchstring" view="full" lede={ssCopy.hero.lede} recordUse>
        <SearchStringTool mode="full" />
      </ToolFrame>
    )
  }

  const t = ssCopy.paywall
  return (
    <ToolFrame slug="suchstring" view="full" lede={t.lede}>
      <ToolPaywall
        tool={getTool("suchstring")!}
        loggedIn={!!access.user}
        points={[...t.points]}
        whatHeading={t.whatHeading}
        note={t.privacy}
        sample={
          <>
            <h2 className="headline mb-2">{t.sampleHeading}</h2>
            <p className="mb-5 text-sm text-fg-muted">{t.sampleCaption}</p>
            <SampleQuery />
          </>
        }
      />
    </ToolFrame>
  )
}
