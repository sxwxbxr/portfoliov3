import type { ReactNode } from "react"
import Link from "next/link"
import { siteCopy } from "@/lib/physio/copy/site"
import type { PhysioTool } from "@/lib/physio/tools"
import { physioPath } from "@/lib/physio/urls"
import { LockIcon } from "./ToolIcon"

const t = siteCopy.tools.paywall
const btn = "control inline-flex min-h-11 items-center justify-center px-6 text-sm"

type Props = {
  tool: PhysioTool
  /** What the tool does, one honest sentence each. */
  points: string[]
  /** Visitor has a login (but no active subscription). */
  loggedIn: boolean
  /** Optional proof next to the points: a real result of the tool, built with its engine. */
  sample?: ReactNode
  /** Small print under the points, e.g. what stays on the device. */
  note?: ReactNode
  /** Overrides for the defaults in lib/physio/copy/site.ts (tools.paywall). */
  heading?: string
  whatHeading?: string
}

/**
 * The teaser a paid tool shows to visitors without access, below its ToolFrame header.
 * Subscribe and demo buttons, a login or "no active subscription" hint, then the bullet
 * points with an optional sample. Generic on purpose: the tool brings only its wording.
 */
export function ToolPaywall({ tool, points, loggedIn, sample, note, heading = t.title, whatHeading = t.whatHeading }: Props) {
  return (
    <>
      <section aria-labelledby="paywall-heading" className="sheet pb-12 md:pb-14">
        <div className="flex flex-col items-start gap-5">
          <h2 id="paywall-heading" className="headline flex items-center gap-3">
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg bg-(--wash) text-signal">
              <LockIcon size={18} />
            </span>
            {heading}
          </h2>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link href={physioPath("/abo")} className={`${btn} control-primary`}>
              {t.aboLink}
            </Link>
            {tool.demoPath && (
              <Link href={physioPath(tool.demoPath)} className={btn}>
                {t.demoLink}
              </Link>
            )}
          </div>
          <p className="text-sm text-fg-muted">
            {loggedIn ? (
              t.verifyHint
            ) : (
              <>
                {t.loginHint}{" "}
                <Link
                  href={`${physioPath("/anmelden")}?next=${encodeURIComponent(tool.path)}`}
                  className="inline-flex min-h-11 items-center text-fg underline underline-offset-4"
                >
                  {t.loginLink}
                </Link>
              </>
            )}
          </p>
        </div>
      </section>

      <div
        className={
          "sheet border-t border-edge-soft pt-12 pb-24 md:pb-32 " +
          (sample ? "grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : "")
        }
      >
        <section aria-labelledby="paywall-what" className="min-w-0">
          <h2 id="paywall-what" className="headline mb-6">
            {whatHeading}
          </h2>
          <ul className="flex max-w-[62ch] flex-col">
            {points.map((p) => (
              <li key={p} className="border-t border-edge-soft py-4 text-sm leading-relaxed text-fg-muted first:border-t-0 first:pt-0">
                {p}
              </li>
            ))}
          </ul>
          {note && <p className="annotate mt-6 max-w-[40ch] text-fg-muted">{note}</p>}
        </section>
        {sample && <div className="min-w-0">{sample}</div>}
      </div>
    </>
  )
}
