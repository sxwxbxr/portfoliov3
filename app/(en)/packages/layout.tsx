import type { ReactNode } from "react"
import { ConsentProvider } from "@/components/packages/ConsentProvider"

export default function PackagesLayout({ children }: { children: ReactNode }) {
  return <ConsentProvider>{children}</ConsentProvider>
}
