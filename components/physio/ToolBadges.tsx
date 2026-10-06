import { siteCopy } from "@/lib/physio/copy/site"
import type { PhysioTool } from "@/lib/physio/tools"

const t = siteCopy.tools.card

const outline = "inline-flex items-center rounded-md border border-edge-mid px-2 py-0.5 text-xs font-medium text-fg-muted"

/**
 * Real status only: "Neu" for a freshly added tool, "Beta" while it still changes,
 * "Bald" for an announced tool without a page. A live tool older than 60 days has no badge.
 */
export function ToolBadges({ tool, isNew }: { tool: PhysioTool; isNew: boolean }) {
  if (tool.status === "soon") return <span className={outline}>{t.soon}</span>
  return (
    <>
      {isNew && <span className="tab text-xs font-medium">{t.new}</span>}
      {tool.status === "beta" && <span className={outline}>{t.beta}</span>}
    </>
  )
}
