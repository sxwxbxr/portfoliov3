import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthPage } from "@/components/physio/account/AuthPage"
import { LoginForm } from "@/components/physio/account/AuthForms"
import { accountCopy } from "@/lib/physio/copy/account"

const c = accountCopy.login

export const metadata: Metadata = {
  title: c.metaTitle,
  robots: { index: false, follow: false },
}

export default function Page() {
  return (
    <AuthPage title={c.title} lede={c.lede}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthPage>
  )
}
