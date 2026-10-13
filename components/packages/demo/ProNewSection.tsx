import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Block } from "@/components/site/Block"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { getProNew, type ProNewFile } from "@/lib/demo/pro-new"
import { pkgPath } from "@/lib/packages/urls"

const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"

/** "New in Pro 2.1.0" block of a demo page; renders nothing when the package has no content file. */
export function ProNewSection({ slug, file = "pro-2-1" }: { slug: string; file?: ProNewFile }) {
  const data = getProNew(slug, file)
  if (!data) return null

  return (
    <Block id={file === "pro-2-1" ? "pro-new" : "free-new"} label={data.label} title={data.title} sub={data.sub} lede={<p>{data.lede}</p>}>
      <div className="flex flex-col gap-12">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-2">
          {data.items.map((item) => (
            <div key={item.title} className="flex min-w-0 flex-col gap-4">
              <h3 className="text-lg tracking-tight">
                {item.title}
                {item.beta && <span className="annotate ml-3 align-middle">Beta</span>}
              </h3>
              <p className="text-sm leading-relaxed text-fg-muted">{item.text}</p>
              {item.code && <CodeBlock title={item.codeTitle} code={item.code} />}
              {item.output && <CodeBlock title={item.outputTitle ?? "Output"} code={item.output} />}
            </div>
          ))}
        </div>
        {data.note && <p className="annotate">{data.note}</p>}
        {data.docsPath && (
          <Link href={pkgPath(data.docsPath)} className={btn + " self-start"}>
            Read the docs
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </Block>
  )
}
