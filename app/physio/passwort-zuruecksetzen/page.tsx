import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthPage } from "@/components/physio/account/AuthPage"
import { ResetForm } from "@/components/physio/account/AuthForms"
import { accountCopy } from "@/lib/physio/copy/account"

const c = accountCopy.reset

export const metadata: Metadata = {
  title: c.metaTitle,
  robots: { index: false, follow: false },
  // The one-time token is in the URL: never send it on as a Referer.
  referrer: "no-referrer",
}

export default function Page() {
  return (
    <AuthPage title={c.title} lede={c.lede}>
      <Suspense>
        <ResetForm />
      </Suspense>
    </AuthPage>
  )
}
