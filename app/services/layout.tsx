import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/seo"

// The page is a client component and cannot export metadata itself.
export const metadata = pageMetadata({
  title: "Services for SMEs",
  description:
    "Custom software, process automation with AI and digital project leadership for SMEs in Eastern Switzerland: what each service covers and how it works.",
  path: "/services",
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
