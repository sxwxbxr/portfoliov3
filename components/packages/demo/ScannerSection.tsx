import { getScanReport, type ScanItem } from "@/lib/demo/permito-server"
import { SCAN_COMMAND } from "@/lib/demo/snippets"
import { copy } from "@/lib/copy"
import { CodeBlock } from "./CodeBlock"

const t = copy.packages.demo.scanner

function Group({
  title,
  hint,
  items,
  children,
}: {
  title: string
  hint: string
  items: ScanItem[]
  children: (item: ScanItem) => React.ReactNode
}) {
  return (
    <section className="cast flex flex-col gap-4 p-6 md:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg tracking-tight">{title}</h3>
        <span className="annotate tabular">{items.length}</span>
      </div>
      <p className="text-sm leading-relaxed text-fg-muted">{hint}</p>
      {items.length === 0 ? (
        <p className="text-sm text-fg-muted">{t.empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-edge-soft border-t border-edge-soft">
          {items.map((item, i) => (
            <li key={`${item.type}-${item.name}-${i}`} className="py-3">
              {children(item)}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function ScannerSection() {
  const report = getScanReport()

  if (!report) {
    return (
      <div className="well px-5 py-4" role="alert">
        <p className="text-sm text-fg">{t.error}</p>
      </div>
    )
  }

  const findings = report.unconfigured.length + report.beforeConsent.length
  const exitCode = findings > 0 ? 1 : 0

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="well flex flex-col gap-3 px-5 py-4" role="note">
          <p className="text-sm leading-relaxed text-fg">{t.recorded}</p>
          <p className="annotate break-all">
            {t.scanned}: <code className="font-mono text-fg-muted">{report.pages.join(", ")}</code>
          </p>
        </div>

        <dl className="flex flex-wrap gap-x-8 gap-y-2 px-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-fg-muted">{t.unconfigured}</dt>
            <dd className="tabular text-fg">{report.summary.unconfigured}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-fg-muted">{t.before}</dt>
            <dd className="tabular text-fg">{report.summary.beforeConsent}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-fg-muted">{t.matched}</dt>
            <dd className="tabular text-fg">{report.summary.matched}</dd>
          </div>
        </dl>

        <Group title={t.unconfigured} hint={t.unconfiguredHint} items={report.unconfigured}>
          {(item) => (
            <div className="flex flex-col gap-1.5">
              <p className="flex flex-wrap items-baseline gap-x-3">
                <code className="break-all font-mono text-sm text-fg">{item.name}</code>
                <span className="annotate">{item.type}</span>
              </p>
              <p className="text-sm text-fg-muted">
                {item.suggestions && item.suggestions.length > 0 ? (
                  <>
                    {t.suggestions}:{" "}
                    {item.suggestions.map((s, i) => (
                      <span key={s.id}>
                        {i > 0 && ", "}
                        {s.name} (<code className="font-mono text-[13px] text-fg">{s.id}</code>)
                      </span>
                    ))}
                  </>
                ) : (
                  t.noSuggestions
                )}
              </p>
            </div>
          )}
        </Group>

        <Group title={t.before} hint={t.beforeHint} items={report.beforeConsent}>
          {(item) => (
            <div className="flex flex-col gap-1.5">
              <p className="flex flex-wrap items-baseline gap-x-3">
                <code className="break-all font-mono text-sm text-fg">{item.name}</code>
                <span className="annotate">{item.type}</span>
              </p>
              <p className="text-sm text-fg-muted">
                {t.service}: <code className="font-mono text-[13px] text-fg">{item.serviceId}</code>
                {item.category && (
                  <>
                    , {t.category}: <code className="font-mono text-[13px] text-fg">{item.category}</code>
                  </>
                )}
              </p>
            </div>
          )}
        </Group>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg tracking-tight">{t.run}</h3>
          <CodeBlock code={SCAN_COMMAND} label="Scanner command" />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-lg tracking-tight">{t.exitHeading}</h3>
          <p className="text-sm text-fg">{t.exitThis(exitCode)}</p>
          <ul className="flex flex-col gap-2 text-sm text-fg-muted">
            {t.exits.map((e) => (
              <li key={e.code} className="flex gap-3">
                <code className="font-mono text-fg">{e.code}</code>
                <span>{e.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm leading-relaxed text-fg-muted">{t.limits}</p>
      </div>
    </div>
  )
}
