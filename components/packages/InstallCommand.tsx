"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { track } from "@vercel/analytics"
import { copy } from "@/lib/copy"

/**
 * Install line with a copy button. Copying is tracked as an analytics event
 * (cookieless), since "copied the install command" is the closest signal to
 * "someone is about to use this" that the site can see.
 */
export function InstallCommand({
  command,
  packageSlug,
}: {
  command: string
  packageSlug: string
}) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      track("install_copied", { package: packageSlug })
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard can be blocked (insecure origin, permissions). The command
      // stays selectable, so there is nothing else to do.
    }
  }

  return (
    // As wide as the command, never wider than its container. A command that
    // does not fit wraps onto further lines instead of scrolling sideways.
    <div className="well flex w-fit max-w-full items-center gap-3 py-2 pl-4 pr-2">
      {/* Baseline-aligned, so the prompt sits on the first line when the command wraps. */}
      <span className="flex min-w-0 items-baseline gap-3 font-mono text-sm leading-relaxed">
        <span aria-hidden="true" className="text-fg-subtle select-none">
          $
        </span>
        <code className="min-w-0 whitespace-pre-wrap text-fg [overflow-wrap:anywhere]">{command}</code>
      </span>
      <button
        type="button"
        onClick={onCopy}
        className="control control-ghost inline-flex h-9 shrink-0 items-center gap-1.5 px-3 text-xs text-fg-muted hover:text-fg"
        aria-label={copied ? copy.common.copied : `${copy.common.copy}: ${command}`}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        <span aria-live="polite">{copied ? copy.common.copied : copy.common.copy}</span>
      </button>
    </div>
  )
}
