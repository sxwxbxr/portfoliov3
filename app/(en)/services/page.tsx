import { ServicesView } from "@/components/views/ServicesView"
import { staticPageMetadata } from "@/lib/page-meta"

export const metadata = staticPageMetadata("services", "en")

export default function ServicesPage() {
  return <ServicesView locale="en" />
}
