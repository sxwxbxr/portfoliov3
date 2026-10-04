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
    <div className="well flex items-center gap-3 py-2 pl-4 pr-2">
      <span aria-hidden="true" className="font-mono text-sm text-fg-subtle select-none">
        $
      </span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-fg">
        {command}
      </code>
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
