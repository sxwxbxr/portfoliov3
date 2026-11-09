import { ImprintView } from "@/components/views/ImprintView"
import { staticPageMetadata } from "@/lib/page-meta"

export const revalidate = 86400

export const metadata = staticPageMetadata("imprint", "en")

export default async function ImprintPage() {
  return ImprintView({ locale: "en" })
}
