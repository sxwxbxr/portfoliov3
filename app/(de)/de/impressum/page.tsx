import { ImprintView } from "@/components/views/ImprintView"
import { staticPageMetadata } from "@/lib/page-meta"

export const revalidate = 3600

export const metadata = staticPageMetadata("imprint", "de")

export default async function ImprintDe() {
  return ImprintView({ locale: "de" })
}
