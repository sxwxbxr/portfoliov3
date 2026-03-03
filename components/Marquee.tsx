"use client"

interface MarqueeProps {
  items: string[]
  className?: string
  separator?: string
}

export function Marquee({ items, className = "", separator = " / " }: MarqueeProps) {
  const content = items.join(separator)
  const repeated = `${content}${separator}${content}${separator}`

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden="true">
      <div className="animate-marquee inline-block">
        <span className="inline-block">{repeated}</span>
      </div>
    </div>
  )
}
