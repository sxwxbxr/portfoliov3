import Link from "next/link"

export type CardData = {
  href: string
  title: string
  excerpt: string
  publishedAt: string
  typeLabel: string
  dateLabel: string
  packageNames: string[]
}

/** Presentational post card, shared by the server PostCard and the client list so both render the same markup. */
export function PostCardView({ href, title, excerpt, publishedAt, typeLabel, dateLabel, packageNames }: CardData) {
  return (
    <article className="relative flex flex-col gap-3 border-b border-edge-soft py-6 md:py-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="tab text-xs text-fg-muted">{typeLabel}</span>
        <time dateTime={publishedAt} className="annotate">
          {dateLabel}
        </time>
      </div>
      <h2 className="text-lg tracking-tight text-balance md:text-xl">
        <Link href={href} className="text-fg transition-colors duration-150 hover:text-fg-muted after:absolute after:inset-0 after:content-['']">
          {title}
        </Link>
      </h2>
      <p className="measure text-sm leading-relaxed text-fg-muted">{excerpt}</p>
      {packageNames.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {packageNames.map((name) => (
            <span key={name} className="tab text-xs text-fg-muted">
              {name}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
