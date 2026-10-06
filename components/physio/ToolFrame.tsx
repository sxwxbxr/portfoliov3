import type { ReactNode } from "react"
import Link from "next/link"
import { siteCopy } from "@/lib/physio/copy/site"
import { getTool, getToolCategory, isNewTool } from "@/lib/physio/tools"
import { physioPath } from "@/lib/physio/urls"
import { RecordToolUse } from "./RecordToolUse"
import { ToolBadges } from "./ToolBadges"

const c = siteCopy.tools.frame

type Props = {
  /** Registry slug (lib/physio/tools.ts). */
  slug: string
  /** Which page of the tool this is. Only matters when the tool has a demo. */
  view?: "full" | "demo"
  /** Replaces the tool name as the page heading. */
  title?: ReactNode
  /** Replaces the one-line summary under the heading. */
  lede?: ReactNode
  /** Next to the Demo | Vollversion switch: help link, export button, whatever the tool needs up here. */
  actions?: ReactNode
  /** Remember the visit for "Zuletzt verwendet" on /tools. Pass true only where the visitor really uses the tool. */
  recordUse?: boolean
  children: ReactNode
}

/**
 * The frame around every tool page: breadcrumb (Tools > Kategorie > Tool), heading with
 * summary and status badges, the Demo | Vollversion switch when the tool has a demo, and
 * the tool itself as children. Server component; the only client part is RecordToolUse.
 */
export function ToolFrame({ slug, view = "full", title, lede, actions, recordUse = false, children }: Props) {
  const tool = getTool(slug)
  if (!tool) throw new Error(`ToolFrame: no tool "${slug}" in lib/physio/tools.ts`)
  const category = getToolCategory(tool.category)

  const crumb = "inline-flex min-h-11 items-center text-fg-muted underline-offset-4 hover:text-fg hover:underline md:min-h-0"

  return (
    <>
      {recordUse && <RecordToolUse slug={tool.slug} />}
      <header className="sheet pt-6 pb-10 md:pt-8 md:pb-14">
        <nav aria-label={c.breadcrumb} className="mb-6 text-sm md:mb-8">
          <ol className="flex flex-wrap items-center gap-x-2 text-fg-muted">
            <li className="flex items-center gap-2">
              <Link href={physioPath("/tools")} className={crumb}>
                {c.home}
              </Link>
              <Sep />
            </li>
            <li className="flex items-center gap-2">
              <Link href={`${physioPath("/tools")}#cat-${category.key}`} className={crumb}>
                {category.label}
              </Link>
              <Sep />
            </li>
            <li aria-current="page" className="font-medium text-fg">
              {tool.name}
            </li>
          </ol>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="flex min-w-0 flex-col items-start gap-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="display text-balance">{title ?? tool.name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <ToolBadges tool={tool} isNew={isNewTool(tool)} />
              </div>
            </div>
            <p className="lede">{lede ?? tool.summary}</p>
          </div>

          {(tool.demoPath || actions) && (
            <div className="flex flex-wrap items-center gap-3 lg:shrink-0 lg:justify-end">
              {tool.demoPath && <ViewSwitch demo={tool.demoPath} full={tool.path} view={view} />}
              {actions}
            </div>
          )}
        </div>
      </header>
      {children}
    </>
  )
}

function Sep() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="text-edge-mid">
      <path d="M4.5 2.5 8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Two links styled as one segmented control; the current page carries aria-current. */
function ViewSwitch({ demo, full, view }: { demo: string; full: string; view: "full" | "demo" }) {
  const seg =
    "inline-flex min-h-11 items-center justify-center rounded-md px-5 text-sm font-medium text-fg-muted transition-colors hover:text-fg " +
    "aria-[current=page]:bg-signal aria-[current=page]:text-signal-fg"
  return (
    <nav aria-label={c.viewLabel} className="inline-flex gap-1 rounded-lg border border-edge-mid bg-plate-hi p-1">
      <Link href={physioPath(demo)} className={seg} aria-current={view === "demo" ? "page" : undefined}>
        {c.demo}
      </Link>
      <Link href={physioPath(full)} className={seg} aria-current={view === "full" ? "page" : undefined}>
        {c.full}
      </Link>
    </nav>
  )
}
