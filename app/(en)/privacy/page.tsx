import { PrivacyView } from "@/components/views/PrivacyView"
import { staticPageMetadata } from "@/lib/page-meta"

export const revalidate = 86400

export const metadata = staticPageMetadata("privacy", "en")

export default async function PrivacyPage() {
  return PrivacyView({ locale: "en" })
}
