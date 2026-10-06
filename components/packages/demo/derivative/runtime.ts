"use client"

import { useEffect, useState } from "react"

/*
 * The demo loads the published build of @sweberdev/derivative (parsers and the
 * <derivative-widget> element) from /public, so this site does not depend on
 * the package. Same code as on npm, bundled into one file.
 */

export const DERIVATIVE_URL = "/demos/derivative/derivative-0.9.0.min.js"

export type EntryType =
  | "feature"
  | "improvement"
  | "fix"
  | "breaking"
  | "security"
  | "deprecated"
  | "removed"
  | "other"

export interface Release {
  id: string
  version?: string
  date?: string
  package?: string
  title?: string
  summary?: string
  entries: { type: EntryType; text: string; details?: string; scope?: string; link?: string }[]
}

export interface Feed {
  version: 1
  title?: string
  link?: string
  releases: Release[]
}

export interface Commit {
  hash: string
  date: string
  subject: string
  body?: string
  tags?: string[]
}

export interface DerivativeModule {
  parseChangelog(markdown: string, options?: { includeUnreleased?: boolean }): Release[]
  parseCommits(commits: Commit[], options?: { includeUnreleased?: boolean }): Release[]
  createFeed(releases: Release[], options?: { title?: string; generatedAt?: string | null }): Feed
  defineDerivativeWidget(tagName?: string): void
}

export interface WidgetElement extends HTMLElement {
  feed: Feed | undefined
  show(): void
  hide(): void
}

let loading: Promise<DerivativeModule> | undefined

function load(): Promise<DerivativeModule> {
  loading ??= (import(/* webpackIgnore: true */ DERIVATIVE_URL) as Promise<DerivativeModule>).then(
    (mod) => {
      mod.defineDerivativeWidget()
      return mod
    },
  )
  return loading
}

/** The loaded module, `null` while loading, `false` when it failed. */
export function useDerivative(): DerivativeModule | null | false {
  const [mod, setMod] = useState<DerivativeModule | null | false>(null)
  useEffect(() => {
    let alive = true
    load().then(
      (m) => alive && setMod(m),
      () => alive && setMod(false),
    )
    return () => {
      alive = false
    }
  }, [])
  return mod
}
