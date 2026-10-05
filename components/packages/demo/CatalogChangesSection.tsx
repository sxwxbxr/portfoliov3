import { getCatalogChanges } from "@/lib/demo/permito-features-server"
import { CATALOG_CHANGES_COMMAND } from "@/lib/demo/permito-features-snippets"
import { copy } from "@/lib/copy"
import { CodeBlock } from "./CodeBlock"

const t = copy.packages.demo.catalogChanges

export function CatalogChangesSection() {
  const view = getCatalogChanges()

  if (!view) {
    return (
      <div className="well px-5 py-4" role="alert">
        <p className="text-sm text-fg">{t.error}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="well flex flex-col gap-2 px-5 py-4" role="note">
          <p className="text-sm leading-relaxed text-fg">{t.simulated}</p>
          <p className="text-sm leading-relaxed text-fg-muted">{t.simulatedBody}</p>
        </div>
        <CodeBlock title={t.outputHeading} code={view.text} label="Output of permito-catalog changes" />
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg tracking-tight">{t.run}</h3>
          <CodeBlock code={CATALOG_CHANGES_COMMAND} label="Catalog changes command" />
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-lg tracking-tight">{t.exitHeading}</h3>
          <p className="text-sm text-fg">{view.affectsCookieTable ? t.exitThis : "This run: 0."}</p>
          <p className="text-sm leading-relaxed text-fg-muted">{t.exitBody}</p>
        </div>
      </div>
    </div>
  )
}
