import type React from "react"
import { RootShell } from "@/components/RootShell"
import { rootMetadata } from "@/lib/seo"

export const metadata = rootMetadata("de")

export default async function GermanRootLayout({ children }: { children: React.ReactNode }) {
  return RootShell({ locale: "de", children })
}
