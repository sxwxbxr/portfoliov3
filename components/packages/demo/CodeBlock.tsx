/** Static code sample. The scroll region is focusable so keyboard users can reach long lines. */
export function CodeBlock({ title, code, label }: { title?: string; code: string; label?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {title && <p className="annotate">{title}</p>}
      <div className="well overflow-hidden p-1.5">
        <pre
          tabIndex={0}
          aria-label={label ?? title ?? "Code"}
          className="overflow-x-auto rounded-md p-4 font-mono text-[13px] leading-relaxed text-fg focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal"
        >
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}
