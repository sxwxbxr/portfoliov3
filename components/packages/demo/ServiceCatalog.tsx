import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { localize } from "@permitojs/core"
import type { CatalogEntry } from "@weber-development/permito-catalog"
import { getCatalogView } from "@/lib/demo/permito-server"
import { MAPPER_SNIPPET } from "@/lib/demo/snippets"
import { copy } from "@/lib/copy"
import { CodeBlock } from "./CodeBlock"

const t = copy.packages.demo.catalog
const countries = new Intl.DisplayNames(["en"], { type: "region" })
const country = (code: string) => countries.of(code) ?? code

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="annotate">{label}</dt>
      <dd className="text-sm leading-relaxed text-fg">{children}</dd>
    </div>
  )
}

function SourceLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all underline underline-offset-2 hover:text-fg-muted"
    >
      {href}
    </a>
  )
}

function Entry({ entry, open }: { entry: CatalogEntry; open?: boolean }) {
  const selfHosted = entry.hosting === "self-hosted"
  return (
    <details open={open} className="cast group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[inherit] p-5 text-fg focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal md:px-7 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-lg tracking-tight">{entry.name}</span>
          <span className="annotate">
            {entry.provider}, {selfHosted ? t.hostingSelf : country(entry.entityCountry)}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="annotate hidden sm:inline">
            {t.retrieved} {entry.retrievedAt}
          </span>
          <ChevronDown
            className="h-4 w-4 text-fg-muted transition-transform duration-150 group-open:rotate-180"
            aria-hidden="true"
          />
        </span>
      </summary>

      <div className="flex flex-col gap-6 px-5 pb-6 md:px-7">
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <Fact label={t.provider}>{entry.provider}</Fact>
          <Fact label={t.hosting}>{selfHosted ? t.hostingSelf : t.hostingProvider}</Fact>
          {entry.hosting === "provider" ? (
            <>
              <Fact label={t.entity}>
                {entry.legalEntity}, {country(entry.entityCountry)}
              </Fact>
              <Fact label={t.thirdCountries}>
                {entry.thirdCountryTransfer.countries.length > 0
                  ? entry.thirdCountryTransfer.countries.map(country).join(", ")
                  : t.thirdCountriesNone}
              </Fact>
              <Fact label={t.dpf}>
                {entry.thirdCountryTransfer.dpf
                  ? t.dpfEntry(
                      entry.thirdCountryTransfer.dpf.listedEntity,
                      entry.thirdCountryTransfer.dpf.euUs,
                      entry.thirdCountryTransfer.dpf.swissUs,
                    )
                  : t.dpfNotChecked}
              </Fact>
            </>
          ) : (
            <Fact label={t.entity}>{t.selfHostedNote}</Fact>
          )}
          <div className="sm:col-span-2">
            <Fact label={t.purpose}>{localize(entry.purpose, "en")}</Fact>
          </div>
        </dl>

        <div className="flex min-w-0 flex-col gap-2">
          <p className="annotate">{t.storage}</p>
          {entry.cookies.length === 0 ? (
            <p className="text-sm text-fg-muted">{t.storageNone}</p>
          ) : (
            <div
              tabIndex={0}
              role="region"
              aria-label={`${entry.name}: ${t.storage}`}
              className="well overflow-x-auto focus-visible:outline-2 focus-visible:outline-signal"
            >
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="annotate">
                    <th scope="col" className="px-4 py-2.5 font-normal">{t.colName}</th>
                    <th scope="col" className="px-4 py-2.5 font-normal">{t.colType}</th>
                    <th scope="col" className="px-4 py-2.5 font-normal">{t.colDuration}</th>
                    <th scope="col" className="px-4 py-2.5 font-normal">{t.colDescription}</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.cookies.map((c) => (
                    <tr key={`${c.name}-${c.storage}`} className="border-t border-edge-soft align-top">
                      <th scope="row" className="px-4 py-2.5 text-left font-mono text-[13px] font-normal text-fg">
                        {c.name}
                      </th>
                      <td className="px-4 py-2.5 text-fg-muted">{c.storage}</td>
                      <td className="px-4 py-2.5 text-fg-muted">
                        {c.duration ? localize(c.duration, "en") : t.durationNone}
                      </td>
                      <td className="px-4 py-2.5 text-fg-muted">
                        {c.description ? localize(c.description, "en") : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="annotate min-w-0">
          {t.source}: <SourceLink href={entry.source} />. {t.retrieved} {entry.retrievedAt}.
        </p>
      </div>
    </details>
  )
}

export function ServiceCatalog() {
  const { featured, others } = getCatalogView()
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        {featured.map((entry, i) => (
          <Entry key={entry.id} entry={entry} open={i === 0} />
        ))}
      </div>

      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg tracking-tight">{t.othersHeading(others.length)}</h3>
          <p className="annotate">{t.othersNote}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-fg-muted">
            {others.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <h3 className="text-lg tracking-tight">{t.mapperHeading}</h3>
          <p className="text-sm leading-relaxed text-fg-muted">{t.rule}</p>
          <p className="text-sm leading-relaxed text-fg-muted">{t.mapperBody}</p>
          <CodeBlock code={MAPPER_SNIPPET} label="toConsentService example" />
        </div>
      </div>
    </div>
  )
}
