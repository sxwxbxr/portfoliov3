import { NotFoundView } from "@/components/views/NotFoundView"
import { noindexMetadata } from "@/lib/seo"

export const metadata = noindexMetadata

export default async function NotFound() {
  return NotFoundView({ locale: "en" })
}
