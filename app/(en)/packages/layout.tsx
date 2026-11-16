import type { ReactNode } from "react"
import { ConsentProvider } from "@/components/packages/ConsentProvider"

export default function PackagesLayout({ children }: { children: ReactNode }) {
  // data-site="packages": the night look of the portfolio, kept quiet
  // (see globals.css), because these pages are for reading and trying out.
  return (
    <ConsentProvider>
      <div data-site="packages">{children}</div>
    </ConsentProvider>
  )
}
