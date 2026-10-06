import type { ReactNode } from "react"

/** Narrow column for the single-purpose account pages (sign in, register, reset). */
export function AuthPage({ title, lede, children }: { title: string; lede?: string; children: ReactNode }) {
  return (
    <section className="sheet pt-10 pb-24 md:pt-16 md:pb-32">
      <div className="flex max-w-md flex-col gap-8">
        <header className="flex flex-col gap-4">
          <h1 className="display text-balance">{title}</h1>
          {lede && <p className="lede">{lede}</p>}
        </header>
        {children}
      </div>
    </section>
  )
}
