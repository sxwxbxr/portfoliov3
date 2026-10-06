import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { DoublePendulum } from "@/components/packages/demo/lagrangian/DoublePendulum"
import { InterruptRace } from "@/components/packages/demo/lagrangian/InterruptRace"
import { LagrangianStatus } from "@/components/packages/demo/lagrangian/LagrangianStatus"
import { Playground } from "@/components/packages/demo/lagrangian/Playground"
import { ThrowDeck } from "@/components/packages/demo/lagrangian/ThrowDeck"
import { InstallCommand } from "@/components/packages/InstallCommand"
import { lagrangianDemo as t } from "@/lib/demo/lagrangian-copy"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"

export const revalidate = 60

export function generateMetadata(): Metadata {
  const url = pkgUrl("/lagrangian/demo")
  return {
    title: { absolute: t.seoTitle },
    description: t.description,
    alternates: { canonical: url },
    openGraph: { title: t.seoTitle, description: t.description, url, type: "website" },
  }
}

const SPRING_CODE = `import { animate } from "@sweberdev/lagrangian"

dot.addEventListener("click", () => {
  open = !open
  // Interrupting keeps the current velocity.
  animate(dot, { x: open ? 320 : 0 }, { duration: 0.6, bounce: 0.25 })
})`

const THROW_CODE = `import { draggable, nearest } from "@sweberdev/lagrangian"

draggable(strip, {
  axis: "x",
  bounds: { left: -4 * step, right: 0 },
  snap: { x: [0, -step, -2 * step, -3 * step, -4 * step] },
})

draggable(puck, { bounds: box })`

const PENDULUM_CODE = `import { loop, system } from "@sweberdev/lagrangian"

// State [θ1, θ2, ω1, ω2]; the accelerations follow
// from the Euler-Lagrange equations of L = T − V.
const pendulum = system(([a1, a2, w1, w2]) => {
  const d = a1 - a2, den = 3 - Math.cos(2 * d)
  return [
    w1,
    w2,
    (-3 * g * Math.sin(a1) - g * Math.sin(a1 - 2 * a2)
      - 2 * Math.sin(d) * (w2 * w2 + w1 * w1 * Math.cos(d))) / den,
    (2 * Math.sin(d) * (2 * w1 * w1 + 2 * g * Math.cos(a1)
      + w2 * w2 * Math.cos(d))) / den,
  ]
}, [angle, angle, 0, 0])

loop.add((dt) => draw(pendulum.advance(dt)))`

const WORLD_CODE = `import { World } from "@sweberdev/lagrangian"

const world = new World({ bounds: box }).start()

for (const el of box.querySelectorAll(".ball")) {
  world.add({ x: 120, y: 0, radius: 24, restitution: 0.85, element: el })
}

world.bindPointer() // grab and throw
world.gravity = { x: 0, y: 1.62 } // the Moon`

export default function LagrangianDemoPage() {
  const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"

  return (
    <PageLayout>
      <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex flex-col items-start gap-8">
          <Link
            href={pkgPath("/lagrangian")}
            className="annotate inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-fg"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t.overview}
          </Link>

          <h1 className="display text-balance">
            {t.title}
            <span className="headline-sub">{t.titleSub}</span>
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-fg-muted">{t.intro}</p>

          <LagrangianStatus />

          <nav aria-label={t.jump} className="annotate flex flex-wrap gap-x-5 gap-y-2">
            <span>{t.jump}:</span>
            {t.jumpLinks.map((l) => (
              <a key={l.href} href={l.href} className="underline underline-offset-2 hover:text-fg">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <Block id="springs" label={t.springs.label} title={t.springs.title} sub={t.springs.sub} lede={<p>{t.springs.lede}</p>}>
        <div className="flex flex-col gap-10">
          <InterruptRace />
          <div className="max-w-xl">
            <CodeBlock title={t.springs.codeHeading} code={SPRING_CODE} />
          </div>
        </div>
      </Block>

      <Block id="throw" label={t.throwing.label} title={t.throwing.title} sub={t.throwing.sub} lede={<p>{t.throwing.lede}</p>}>
        <div className="flex flex-col gap-10">
          <ThrowDeck />
          <div className="max-w-xl">
            <CodeBlock title={t.throwing.codeHeading} code={THROW_CODE} />
          </div>
        </div>
      </Block>

      <Block id="world" label={t.world.label} title={t.world.title} sub={t.world.sub} lede={<p>{t.world.lede}</p>}>
        <div className="flex flex-col gap-10">
          <Playground />
          <div className="max-w-xl">
            <CodeBlock title={t.world.codeHeading} code={WORLD_CODE} />
          </div>
        </div>
      </Block>

      <Block id="pendulum" label={t.pendulum.label} title={t.pendulum.title} sub={t.pendulum.sub} lede={<p>{t.pendulum.lede}</p>}>
        <div className="flex flex-col gap-10">
          <DoublePendulum />
          <div className="max-w-2xl">
            <CodeBlock title={t.pendulum.codeHeading} code={PENDULUM_CODE} />
          </div>
        </div>
      </Block>

      <Block
        label={t.closing.label}
        title={t.closing.title}
        sub={t.closing.sub}
        lede={<p>{t.closing.lede}</p>}
        aside={
          <div className="flex flex-col items-start gap-5">
            <InstallCommand command="pnpm add @sweberdev/lagrangian" packageSlug="lagrangian" />
            <Link href={pkgPath("/lagrangian/docs")} className={btn + " control-primary"}>
              {t.docs}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        }
      />
    </PageLayout>
  )
}
