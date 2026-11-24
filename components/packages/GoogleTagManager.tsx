"use client"

import { ConsentScript } from "@permitojs/react"

/** Public container id (it is visible in every page source anyway). */
export const GTM_ID = "GTM-W7RRKFPD"

/**
 * Loads the Google tag only after the visitor agrees to the `google-tag-manager`
 * service (category `statistics`). Google Consent Mode v2 starts as "denied"
 * (see the default snippet in app/(en)/packages/layout.tsx) and Permito sends
 * the updates, so tags inside the container obey the choice too.
 * `gtag("js")` is queued by the same snippet, as in Google's manual install.
 */
export function GoogleTagManager() {
  return (
    <ConsentScript
      service="google-tag-manager"
      src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
      async
    />
  )
}
