import { LOG_RECORD, LOG_ROUTE } from "@/lib/demo/snippets"
import { copy } from "@/lib/copy"
import { CodeBlock } from "./CodeBlock"

const t = copy.packages.demo.log

export function ConsentLogSection() {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg tracking-tight">{t.recordHeading}</h3>
          <CodeBlock code={LOG_RECORD} label="Example consent log record" />
          <p className="annotate">{t.recordNote}</p>
        </div>
        <dl className="flex flex-col gap-4 text-sm leading-relaxed">
          <div className="flex flex-col gap-1">
            <dt className="text-fg">{t.storedHeading}</dt>
            <dd className="text-fg-muted">{t.stored}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-fg">{t.notStoredHeading}</dt>
            <dd className="text-fg-muted">{t.notStored}</dd>
          </div>
        </dl>
        <p className="text-sm leading-relaxed text-fg-muted">{t.yours}</p>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <h3 className="text-lg tracking-tight">{t.routeHeading}</h3>
        <CodeBlock code={LOG_ROUTE} label="Next.js route handler" />
        <p className="annotate">{t.routeNote}</p>
      </div>
    </div>
  )
}
