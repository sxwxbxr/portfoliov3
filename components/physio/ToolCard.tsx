import Link from "next/link"
import { guideCopy } from "@/lib/physio/copy/guide"
import { siteCopy } from "@/lib/physio/copy/site"
import type { PhysioTool } from "@/lib/physio/tools"
import { physioPath } from "@/lib/physio/urls"
import { LockIcon, ToolIcon } from "./ToolIcon"
import { ToolBadges } from "./ToolBadges"

const t = siteCopy.tools.card

const btn = "control inline-flex min-h-11 items-center justify-center px-5 py-2.5 text-sm"

/**
 * One tool in a list (hub and landing page). Demo is the primary action when there is one,
 * because most visitors have no subscription yet; the hint line says what is free.
 * An announced tool ("soon") has no links at all.
 */
export function ToolCard({ tool, isNew }: { tool: PhysioTool; isNew: boolean }) {
  const soon = tool.status === "soon"
  const hint = soon ? t.soonNote : tool.access === "free" ? t.free : tool.demoPath ? t.paid : t.paidNoDemo
  const demoFirst = !!tool.demoPath && tool.access === "paid"

  return (
    <article className="cast flex h-full min-w-0 flex-col gap-4 p-5 md:p-6" aria-labelledby={`tool-${tool.slug}`}>
      <div className="flex items-start justify-between gap-3">
        <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-lg bg-(--wash) text-signal">
          <ToolIcon name={tool.icon} />
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <ToolBadges tool={tool} isNew={isNew} />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <h3 id={`tool-${tool.slug}`} className="text-xl text-balance">
          {tool.name}
        </h3>
        <p className="leading-relaxed text-fg-muted">{tool.summary}</p>
      </div>

      {(tool.tags.length > 0 || tool.guide) && (
        <ul className="flex flex-wrap gap-1.5" aria-label={t.tags}>
          {tool.guide && <li className="tab rounded-md px-2 py-0.5 text-xs font-medium">{guideCopy.toolBadge}</li>}
          {tool.tags.map((tag) => (
            <li key={tag} className="rounded-md border border-edge-soft bg-plate-hi px-2 py-0.5 text-xs text-fg-muted">
              {tag}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-auto flex items-center gap-2 pt-1 text-sm text-fg-muted">
        {!soon && tool.access === "paid" && <LockIcon className="shrink-0" />}
        {hint}
      </p>

      {!soon && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {tool.demoPath && (
            <Link
              href={physioPath(tool.demoPath)}
              className={`${btn} ${demoFirst ? "control-primary" : ""}`}
              aria-label={t.demoNamed(tool.name)}
            >
              {t.demo}
            </Link>
          )}
          <Link
            href={physioPath(tool.path)}
            className={`${btn} ${demoFirst ? "" : "control-primary"}`}
            aria-label={t.openNamed(tool.name)}
          >
            {t.open}
          </Link>
        </div>
      )}
    </article>
  )
}
