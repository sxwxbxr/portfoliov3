import type { ReactNode } from "react"
import { getConsentModeDefaultScript } from "@permitojs/react/server"
import { ConsentProvider } from "@/components/packages/ConsentProvider"

// Google Consent Mode v2 "default": everything denied until Permito sends the
// update. Must run before any Google tag, so it is part of the server HTML.
// gtag("js") is the second line of Google's own install snippet.
const CONSENT_DEFAULT = `${getConsentModeDefaultScript()}gtag("js",new Date());`

export default function PackagesLayout({ children }: { children: ReactNode }) {
  // data-site="packages": the night look of the portfolio, kept quiet
  // (see globals.css), because these pages are for reading and trying out.
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT }} />
      <ConsentProvider>
        <div data-site="packages">{children}</div>
      </ConsentProvider>
    </>
  )
}
