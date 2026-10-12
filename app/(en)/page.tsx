import { HomeView } from "@/components/views/HomeView"
import { staticPageMetadata } from "@/lib/page-meta"

// Static-first: admin writes invalidate on demand via revalidatePublic().
// The 24h value is only a self-healing fallback, not the primary refresh path.
export const revalidate = 86400

export const metadata = staticPageMetadata("home", "en")

export default async function Home() {
  return HomeView({ locale: "en" })
}
