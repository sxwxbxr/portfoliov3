import "@weber-development/permito-cookie-table/styles.css"
import { getCookieTables, type TableLanguage } from "@/lib/demo/permito-server"
import { TABLE_BUILD_SNIPPET, TABLE_CHECK_SNIPPET, TABLE_CONFIG_SNIPPET } from "@/lib/demo/snippets"
import { copy } from "@/lib/copy"
import { CodeBlock } from "./CodeBlock"
import { CookieTableTabs, type TableTab } from "./CookieTableTabs"

const t = copy.packages.demo.table
const LANGS: TableLanguage[] = ["de", "fr", "it", "en"]

/**
 * The table styles read the --pmt-* variables. They are mapped to the site
 * tokens here so the table matches this page and not the light fallbacks.
 */
const TABLE_VARS = {
  "--pmt-font": "var(--font-inter), system-ui, sans-serif",
  "--pmt-bg": "var(--plate)",
  "--pmt-fg": "var(--fg)",
  "--pmt-muted": "var(--fg-muted)",
  "--pmt-border": "var(--edge-mid)",
  "--pmt-surface": "var(--plate-hi)",
  "--pmt-accent": "var(--fg)",
  "--pmt-focus": "var(--signal)",
} as React.CSSProperties

export function CookieTableSection() {
  const { html, markdown } = getCookieTables()

  const tabs: TableTab[] = [
    ...LANGS.map((lang) => ({
      id: lang,
      label: t.tabs[lang],
      lang,
      content: (
        <div
          tabIndex={0}
          role="region"
          aria-label={t.tabs[lang]}
          lang={lang}
          style={TABLE_VARS}
          className="overflow-x-auto rounded-[var(--radius)] focus-visible:outline-2 focus-visible:outline-signal [&_.pmt-cookie-table]:min-w-[1100px] [&_a]:underline [&_a]:underline-offset-2"
          dangerouslySetInnerHTML={{ __html: html[lang] }}
        />
      ),
    })),
    {
      id: "md",
      label: t.tabs.md,
      content: <CodeBlock code={markdown} label="Markdown output" />,
    },
  ]

  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="flex min-w-0 flex-col gap-3">
          <CodeBlock title="consent.config.ts" code={TABLE_CONFIG_SNIPPET} />
          <p className="annotate">{t.configNote}</p>
        </div>
        <CodeBlock title="Build" code={TABLE_BUILD_SNIPPET} />
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <CookieTableTabs tabs={tabs} label={t.tabsLabel} />
        <p className="annotate">{t.scrollHint}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col gap-3">
          <p className="measure text-sm leading-relaxed text-fg-muted">{t.ci}</p>
          <p className="measure text-sm leading-relaxed text-fg-muted">{t.limits}</p>
        </div>
        <CodeBlock title="CI" code={TABLE_CHECK_SNIPPET} />
      </div>
    </div>
  )
}
