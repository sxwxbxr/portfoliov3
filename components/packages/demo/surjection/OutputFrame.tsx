/**
 * Shows a finished HTML document from a Pro package in a sandboxed frame.
 * srcDoc keeps it on this page (the site forbids framing other URLs) and the
 * sandbox keeps its scripts, if any, away from the site.
 */
export function OutputFrame({
  html,
  title,
  height,
  scripts = false,
}: {
  html: string
  title: string
  height: number
  scripts?: boolean
}) {
  return (
    <div className="well overflow-hidden p-1.5">
      <iframe
        title={title}
        srcDoc={html}
        sandbox={scripts ? "allow-scripts allow-downloads" : ""}
        loading="lazy"
        className="block w-full rounded-md bg-white"
        style={{ height }}
      />
    </div>
  )
}
