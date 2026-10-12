import type { ReactNode } from "react"
import { noindexMetadata } from "@/lib/seo"

// The page is a client component and cannot export metadata itself.
export const metadata = noindexMetadata

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
