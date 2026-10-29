"use client"

import { createElement, useEffect, useRef, useState } from "react"
import { pkgPath } from "@/lib/packages/urls"

/*
 * Keyword search over package pages, docs and blog. Reuses the Cosine browser
 * build of the live demo; the index is built by scripts/build-search-index.mjs.
 * No embeddings, nothing leaves the browser.
 */

const LIB_URL = "/demos/cosine/cosine-2.0.0.js"
const INDEX_URL = "/search/cosine-index.json"

type Engine = object
type Lib = {
  Cosine: new (o: object) => Engine
  parseManifest(stored: unknown): { chunks: Array<{ url: string }> } & Record<string, unknown>
  defineCosineSearch(): void
}

export function SiteSearch() {
  const field = useRef<HTMLElement & { cosine?: Engine }>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([
      import(/* webpackIgnore: true */ LIB_URL) as Promise<Lib>,
      fetch(INDEX_URL).then((r) => (r.ok ? (r.json() as Promise<unknown>) : Promise.reject(new Error(String(r.status))))),
    ])
      .then(([lib, stored]) => {
        if (!alive) return
        const m = lib.parseManifest(stored)
        // Links work on the packages host and on previews under /packages.
        const manifest = { ...m, chunks: m.chunks.map((c) => ({ ...c, url: pkgPath(c.url) })) }
        lib.defineCosineSearch()
        if (field.current) field.current.cosine = new lib.Cosine({ manifest, loadModel: "never" })
      })
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [])

  if (failed)
    return (
      <p className="text-sm text-fg" role="alert">
        The search is not available right now. Try again later.
      </p>
    )

  return (
    <div className="well p-4">
      {createElement("cosine-search", {
        ref: field,
        lang: "en",
        label: "Search packages, docs and blog",
        placeholder: "Search packages, docs and blog",
        limit: "10",
        facets: "",
        mode: "lexical",
        "load-model": "never",
        style: { "--cosine-accent": "var(--color-fg)" },
        suppressHydrationWarning: true,
      })}
    </div>
  )
}
