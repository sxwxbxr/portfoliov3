import { Children, isValidElement, type ReactNode } from "react"
import { Fragment, jsx, jsxs } from "react/jsx-runtime"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { unified } from "unified"
import rehypeParse from "rehype-parse"
import rehypeSanitize from "rehype-sanitize"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import { PROSE } from "@/components/ProseMarkdown"
import { slugify } from "@/lib/blog"
import type { Post } from "@/lib/blog"

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

// Headings get the ids headingsOf() produces for the table of contents.
const components = {
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 id={slugify(textOf(children))} style={{ scrollMarginTop: "6rem" }}>{children}</h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 id={slugify(textOf(children))} style={{ scrollMarginTop: "6rem" }}>{children}</h3>
  ),
}

/**
 * HTML from a remote source is parsed and sanitised (GitHub's allow-list: no
 * scripts, styles, event handlers or iframes) before it becomes React
 * elements, so a compromised source cannot inject code into the page.
 */
function renderHtml(html: string) {
  const processor = unified().use(rehypeParse, { fragment: true }).use(rehypeSanitize)
  const tree = processor.runSync(processor.parse(html))
  return toJsxRuntime(tree, { Fragment, jsx, jsxs, components })
}

/** The article body in either format, styled like every other long-form text. */
export function PostBody({ post }: { post: Post }) {
  return (
    <article className={`${PROSE} measure`} lang={post.lang}>
      {post.bodyFormat === "html" ? (
        renderHtml(post.body)
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {post.body}
        </ReactMarkdown>
      )}
    </article>
  )
}
