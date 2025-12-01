import type { ReactNode } from "react"

interface ClassicSectionProps {
  title: string
  id?: string
  children: ReactNode
}

export function ClassicSection({ title, id, children }: ClassicSectionProps) {
  return (
    <section id={id} className="py-16 scroll-mt-20">
      <h2 className="text-3xl font-bold mb-8">{title}</h2>
      {children}
    </section>
  )
}
