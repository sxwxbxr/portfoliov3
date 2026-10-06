import type { ReactNode } from "react"
import type { Metadata } from "next"
import { PhysioShell } from "@/components/physio/PhysioShell"
import { siteCopy } from "@/lib/physio/copy/site"

export const metadata: Metadata = {
  title: { default: siteCopy.landing.metaTitle, template: "%s | Physio Tools" },
  description: siteCopy.landing.metaDescription,
  openGraph: { siteName: "Physio Tools", locale: "de_CH", type: "website" },
}

export default function PhysioLayout({ children }: { children: ReactNode }) {
  return <PhysioShell>{children}</PhysioShell>
}
