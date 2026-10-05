import { Children, isValidElement, type ReactNode } from "react"
import type { Components } from "react-markdown"
import { ProseMarkdown } from "@/components/ProseMarkdown"
import { slugify } from "@/lib/blog"
import { resolveDocsHref } from "@/lib/packages/docs"

function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((c) =>
      typeof c === "string" || typeof c === "number"
        ? String(c)
        : isValidElement<{ children?: ReactNode }>(c)
          ? textOf(c.props.children)
          : ""
    )
    .join("")
}

const SCROLL_MARGIN = { scrollMarginTop: "6rem" }

/** A docs page: PROSE styling plus heading anchors, rewritten links and focusable code. */
export function DocsMarkdown({
  children,
  slug,
  current,
}: {
  children: string
  slug: string
  /** Path of the page being rendered, the base for relative links. */
  current: string
}) {
  const components: Components = {
    h2: ({ children: c }) => (
      <h2 id={slugify(textOf(c))} style={SCROLL_MARGIN}>
        {c}
      </h2>
    ),
    h3: ({ children: c }) => (
      <h3 id={slugify(textOf(c))} style={SCROLL_MARGIN}>
        {c}
      </h3>
    ),
    a: ({ href, children: c }) => <a href={resolveDocsHref(href, current, slug)}>{c}</a>,
    // The scroll region is focusable so keyboard users can reach long lines.
    // A ```tsx title="app/providers.tsx" fence shows its title above the block.
    pre: ({ node, children: c }) => {
      const code = node?.children[0]
      const meta =
        code && "data" in code ? (code.data as { meta?: string } | undefined)?.meta : undefined
      const title = meta ? /title="([^"]+)"/.exec(meta)?.[1] : undefined
      return (
        <div className="flex min-w-0 flex-col gap-2">
          {title && <p className="annotate">{title}</p>}
          <pre
            tabIndex={0}
            aria-label={title ?? "Code"}
            className="focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal"
          >
            {c}
          </pre>
        </div>
      )
    },
  }
  return (
    <ProseMarkdown className="" components={components}>
      {children}
    </ProseMarkdown>
  )
}
