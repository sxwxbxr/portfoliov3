import { getGtmView, type GtmTag } from "@/lib/demo/permito-features-server"
import { GTM_COMMAND } from "@/lib/demo/permito-features-snippets"
import { copy } from "@/lib/copy"
import { CodeBlock } from "./CodeBlock"

const t = copy.packages.demo.gtmCheck

function Group({ title, hint, tags }: { title: string; hint: string; tags: GtmTag[] }) {
  return (
    <section className="cast flex flex-col gap-4 p-6 md:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg tracking-tight">{title}</h3>
        <span className="annotate tabular">{tags.length}</span>
      </div>
      <p className="text-sm leading-relaxed text-fg-muted">{hint}</p>
      {tags.length === 0 ? (
        <p className="text-sm text-fg-muted">{t.empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-edge-soft border-t border-edge-soft">
          {tags.map((tag) => (
            <li key={`${tag.name}-${tag.type}`} className="flex flex-col gap-1.5 py-3">
              <p className="flex flex-wrap items-baseline gap-x-3">
                <span className="break-words text-sm text-fg">{tag.name}</span>
                <code className="break-all font-mono text-[13px] text-fg-muted">{tag.type}</code>
                {tag.paused && <span className="annotate">{t.paused}</span>}
              </p>
              <p className="text-sm text-fg-muted">
                {tag.serviceId ? (
                  <>
                    {t.service}: <code className="font-mono text-[13px] text-fg">{tag.serviceId}</code>
                    {tag.category && (
                      <>
                        , {t.category}: <code className="font-mono text-[13px] text-fg">{tag.category}</code>
                      </>
                    )}
                    {tag.matchDetail && <>, {t.via} {tag.matchDetail}</>}
                  </>
                ) : (
                  tag.hosts && tag.hosts.length > 0 && (
                    <>
                      {t.hosts}: <code className="break-all font-mono text-[13px] text-fg">{tag.hosts.join(", ")}</code>
                    </>
                  )
                )}
              </p>
              {tag.hint && <p className="text-sm text-fg-muted">{tag.hint}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function GtmCheckSection() {
  const view = getGtmView()

  if (!view) {
    return (
      <div className="well px-5 py-4" role="alert">
        <p className="text-sm text-fg">{t.error}</p>
      </div>
    )
  }

  const { groups, container, summary } = view

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="well flex flex-col gap-2 px-5 py-4" role="note">
          <p className="text-sm leading-relaxed text-fg">{t.demoNote}</p>
          <p className="text-sm leading-relaxed text-fg-muted">{t.demoNoteMore}</p>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <h3 className="text-lg tracking-tight">{t.containerHeading}</h3>
          <p className="annotate">{t.containerNote(container.name, container.publicId, container.versionId)}</p>
          <div
            tabIndex={0}
            role="region"
            aria-label={t.containerHeading}
            className="well overflow-x-auto focus-visible:outline-2 focus-visible:outline-signal"
          >
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="annotate">
                  <th scope="col" className="px-4 py-2.5 font-normal">{t.colTag}</th>
                  <th scope="col" className="px-4 py-2.5 font-normal">{t.colType}</th>
                  <th scope="col" className="px-4 py-2.5 font-normal">{t.colTrigger}</th>
                  <th scope="col" className="px-4 py-2.5 font-normal">{t.colConsent}</th>
                </tr>
              </thead>
              <tbody>
                {view.exportTags.map((tag) => (
                  <tr key={tag.id} className="border-t border-edge-soft align-top">
                    <th scope="row" className="px-4 py-2.5 text-left text-sm font-normal text-fg">{tag.name}</th>
                    <td className="px-4 py-2.5 font-mono text-[13px] text-fg-muted">{tag.type}</td>
                    <td className="px-4 py-2.5 text-fg-muted">{tag.triggers.join(", ")}</td>
                    <td className="px-4 py-2.5 font-mono text-[13px] text-fg-muted">{tag.consentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="annotate">{t.scrollHint}</p>
        </div>

        <Group title={t.notInConfig} hint={t.notInConfigHint} tags={groups.notInConfig} />
        <Group title={t.noConsentCheck} hint={t.noConsentCheckHint} tags={groups.noConsentCheck} />
        <Group title={t.unknown} hint={t.unknownHint} tags={groups.unknown} />
        <Group title={t.notice} hint={t.noticeHint} tags={groups.notice} />
        <Group title={t.okLabel} hint="" tags={groups.ok} />
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg tracking-tight">{t.run}</h3>
          <CodeBlock code={GTM_COMMAND} label="GTM check command" />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-lg tracking-tight">{t.exitHeading}</h3>
          <p className="text-sm text-fg">{t.exitThis(summary.exitCode)}</p>
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
