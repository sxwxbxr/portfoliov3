import { ServicesView } from "@/components/views/ServicesView"
import { staticPageMetadata } from "@/lib/page-meta"

export const metadata = staticPageMetadata("services", "de")

export default function ServicesDe() {
  return <ServicesView />
}
