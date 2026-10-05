import Link from "next/link"
import type { DocsNav as Nav } from "@/lib/packages/docs"
import { docsPath } from "@/lib/packages/docs"
import { copy } from "@/lib/copy"

const t = copy.packages.docsPage

function PageLinks({ nav, slug, current }: { nav: Nav; slug: string; current?: string }) {
  return (
    <ul className="flex flex-col gap-6">
      {nav.sections.map((section) => (
        <li key={section.label} className="flex flex-col gap-2">
          <p className="annotate px-3">{section.label}</p>
          <ul className="flex flex-col gap-0.5">
            {section.pages.map((page) => {
              const active = page.path === current
              return (
                <li key={page.path}>
                  <Link
                    href={docsPath(slug, page.path)}
                    aria-current={active ? "page" : undefined}
                    className={
                      "block rounded-md px-3 py-2 text-sm leading-snug transition-colors duration-150 " +
                      (active
                        ? "bg-plate text-fg"
                        : "text-fg-muted hover:bg-plate hover:text-fg")
                    }
                  >
                    {page.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </li>
      ))}
    </ul>
  )
}

/**
 * Docs sidebar. Below md it is a <details> disclosure (no client JS), from md
 * up it is a sticky column. Both render the same list; CSS shows one.
 */
export function DocsNav({ nav, slug, current }: { nav: Nav; slug: string; current?: string }) {
  const currentTitle = nav.pages.find((p) => p.path === current)?.title
  return (
    <>
      <details className="group mb-8 rounded-md border border-edge-soft md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-signal [&::-webkit-details-marker]:hidden">
          <span className="flex min-w-0 flex-col">
            <span className="annotate">{t.menu}</span>
            <span className="truncate">{currentTitle ?? t.overviewLabel}</span>
          </span>
          <span
            aria-hidden="true"
            className="text-fg-subtle transition-transform duration-150 group-open:rotate-45"
          >
            +
          </span>
        </summary>
        <nav aria-label={t.navLabel} className="border-t border-edge-soft p-2 pb-4">
          <PageLinks nav={nav} slug={slug} current={current} />
        </nav>
      </details>

      <nav
        aria-label={t.navLabel}
        className="sticky top-28 hidden max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 [scrollbar-color:var(--edge-soft)_transparent] [scrollbar-width:thin] md:block"
      >
        <PageLinks nav={nav} slug={slug} current={current} />
      </nav>
    </>
  )
}
