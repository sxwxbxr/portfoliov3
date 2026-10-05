import { ProseMarkdown } from "@/components/ProseMarkdown"
import { getMonitorView } from "@/lib/demo/permito-features-server"
import { MONITOR_ACTION_SNIPPET, MONITOR_COMMAND } from "@/lib/demo/permito-features-snippets"
import { copy } from "@/lib/copy"
import { CodeBlock } from "./CodeBlock"

const t = copy.packages.demo.monitoring

export function MonitoringSection() {
  const view = getMonitorView()

  if (!view) {
    return (
      <div className="well px-5 py-4" role="alert">
        <p className="text-sm text-fg">{t.error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="well px-5 py-4" role="note">
        <p className="text-sm leading-relaxed text-fg">{t.recorded}</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex min-w-0 flex-col gap-3">
          <h3 className="text-lg tracking-tight">{t.run}</h3>
          <CodeBlock code={MONITOR_COMMAND} label="Monitoring command" />
          <CodeBlock title={t.sitesHeading} code={view.sitesFile} label="permito.sites.json" />
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <h3 className="text-lg tracking-tight">{t.summaryHeading}</h3>
          <div
            tabIndex={0}
            role="region"
            aria-label={t.summaryHeading}
            className="well overflow-x-auto focus-visible:outline-2 focus-visible:outline-signal"
          >
            <table className="w-full min-w-[480px] border-collapse text-left text-sm">
              <thead>
                <tr className="annotate">
                  <th scope="col" className="px-4 py-2.5 font-normal">{t.colSite}</th>
                  <th scope="col" className="px-4 py-2.5 font-normal">{t.colStatus}</th>
                  <th scope="col" className="px-4 py-2.5 font-normal">{t.colNotConfigured}</th>
                  <th scope="col" className="px-4 py-2.5 font-normal">{t.colBefore}</th>
                  <th scope="col" className="px-4 py-2.5 font-normal">{t.colAccepted}</th>
                </tr>
              </thead>
              <tbody>
                {view.sites.map((site) => (
                  <tr key={site.slug} className="border-t border-edge-soft align-top">
                    <th scope="row" className="px-4 py-2.5 text-left text-sm font-normal text-fg">{site.name}</th>
                    <td className="px-4 py-2.5 text-fg-muted">{t.status[site.status] ?? site.status}</td>
                    <td className="tabular px-4 py-2.5 text-fg-muted">{site.unconfigured}</td>
                    <td className="tabular px-4 py-2.5 text-fg-muted">{site.beforeConsent}</td>
                    <td className="tabular px-4 py-2.5 text-fg-muted">{site.accepted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="annotate">{t.scrollHint}</p>
        </div>
      </div>

      <section className="cast flex min-w-0 flex-col gap-4 p-6 md:p-7">
        <h3 className="text-lg tracking-tight">{t.reportHeading}</h3>
        <p className="text-sm leading-relaxed text-fg-muted">{t.reportNote}</p>
        <ProseMarkdown className="!max-w-none text-base">{view.report}</ProseMarkdown>
      </section>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex min-w-0 flex-col gap-4">
          <h3 className="text-lg tracking-tight">{t.actionHeading}</h3>
          <p className="text-sm leading-relaxed text-fg-muted">{t.actionBody}</p>
          <ul className="flex flex-col gap-2 text-sm text-fg-muted">
            {t.actionPoints.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-fg-muted">{t.limits}</p>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <CodeBlock code={MONITOR_ACTION_SNIPPET} label="GitHub Action template excerpt" />
          <p className="annotate">{t.actionNote}</p>
        </div>
      </div>
    </div>
  )
}
