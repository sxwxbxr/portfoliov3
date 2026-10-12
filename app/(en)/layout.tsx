import type React from "react"
import { RootShell } from "@/components/RootShell"
import { rootMetadata } from "@/lib/seo"

export const metadata = rootMetadata("en")

export default async function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return RootShell({ locale: "en", children })
}
