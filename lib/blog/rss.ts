const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")

/** RFC-822 date at noon UTC, so no timezone can shift the calendar day. */
export const rfc822 = (iso: string) => new Date(`${iso}T12:00:00Z`).toUTCString()

export interface FeedItem {
  title: string
  link: string
  /** Defaults to `link`. */
  guid?: string
  date: string
  description: string
  categories?: string[]
}

export function renderRss(opts: {
  title: string
  link: string
  description: string
  self: string
  items: FeedItem[]
}): Response {
  const items = opts.items
    .map(
      (i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${esc(i.link)}</link>
      <guid isPermaLink="true">${esc(i.guid ?? i.link)}</guid>
      <pubDate>${rfc822(i.date)}</pubDate>
      <description>${esc(i.description)}</description>
${(i.categories ?? []).map((c) => `      <category>${esc(c)}</category>\n`).join("")}    </item>`
    )
    .join("\n")

  const last = opts.items[0] ? `\n    <lastBuildDate>${rfc822(opts.items[0].date)}</lastBuildDate>` : ""
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(opts.title)}</title>
    <link>${esc(opts.link)}</link>
    <description>${esc(opts.description)}</description>
    <language>en</language>${last}
    <atom:link href="${esc(opts.self)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`
  // No Cache-Control here: Next derives it from the route's `revalidate`, and
  // a custom header keeps revalidatePath() from refreshing the feed.
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  })
}
