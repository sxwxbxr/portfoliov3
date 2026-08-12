"use client"

import ReactMarkdown, { type Components } from "react-markdown"

// Self-contained markdown styling. The project has no @tailwindcss/typography
// plugin (so `prose` is inert) and Tailwind's reset strips default heading/list
// styles — so we style each element explicitly to render AI markdown
// consistently (headings, lists, bold, links, code).
//
// Every rule here has to survive on three different surfaces: a raised
// `.cast` panel, a sunken `.well-sm` chat bubble and a raised `.cast-sm` one.
// That is why code uses a hairline edge instead of a fill — a fill would read
// as a third polarity on one of them and as nothing at all on another.
const components: Components = {
  h1: ({ children }) => (
    <h3 className="font-display text-base font-semibold text-fg mt-4 mb-2 first:mt-0">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="font-display text-base font-semibold text-fg mt-4 mb-2 first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h3 className="font-display text-base font-semibold text-fg mt-4 mb-2 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-2 leading-relaxed first:mt-0 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-signal underline underline-offset-2"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code className="rounded border border-edge-soft px-1 py-0.5 font-mono text-[0.85em]">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg border border-edge-soft bg-ground p-3 text-xs">
      {children}
    </pre>
  ),
}

export function Markdown({ children }: { children: string }) {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>
}
