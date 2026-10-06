import type { ReactNode } from "react"

/** Narrow column for the single-purpose account pages (sign in, register, reset): heading, then the form on a card. */
export function AuthPage({ title, lede, children }: { title: string; lede?: string; children: ReactNode }) {
  return (
    <section className="sheet pt-10 pb-20 md:pt-20 md:pb-28">
      <div className="mx-auto flex max-w-md flex-col gap-8">
        <header className="flex flex-col gap-3">
          <h1 className="headline text-balance text-[length:clamp(1.875rem,1.5rem+1.6vw,2.5rem)]">{title}</h1>
          {lede && <p className="leading-relaxed text-fg-muted">{lede}</p>}
        </header>
        <div className="cast p-6 md:p-8">{children}</div>
      </div>
    </section>
  )
}
