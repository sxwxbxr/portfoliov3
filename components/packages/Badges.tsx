import type { Package } from "@/lib/packages/schema"
import { copy } from "@/lib/copy"

/** Status and licence markers shared by the overview card and the detail hero. */
export function PackageBadges({ pkg }: { pkg: Package }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="tab annotate">{copy.packages.status[pkg.status]}</span>
      <span className="tab annotate">{copy.packages.license[pkg.license]}</span>
    </div>
  )
}
