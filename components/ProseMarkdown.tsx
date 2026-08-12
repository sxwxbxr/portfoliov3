import ReactMarkdown from "react-markdown"

/**
 * Long-form markdown, styled explicitly against CAST tokens.
 *
 * The project has no @tailwindcss/typography plugin and globals.css never
 * declares `@plugin`, so every `prose*` class in the repo generated nothing —
 * long-form text rendered against Tailwind's reset with unstyled headings and
 * stripped list markers. Each element is styled here instead, which also makes
 * dark mode automatic: the tokens flip, the classes don't.
 *
 * One copy, shared by /privacy and /blog/[slug], so the two cannot drift.
 * components/ai/Markdown.tsx stays separate on purpose — it renders inside chat
 * bubbles of both polarities and needs a tighter, surface-agnostic scale.
 */
export const PROSE = [
  "flex flex-col gap-5 leading-relaxed text-fg-muted",
  "[&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-fg",
  "[&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-fg",
  "[&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-fg",
  "[&_p]:leading-[1.75]",
  "[&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5",
  "[&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-2 [&_ol]:pl-5",
  "[&_li]:leading-relaxed [&_li]:marker:text-fg-subtle",
  "[&_strong]:font-semibold [&_strong]:text-fg",
  "[&_em]:italic",
  "[&_a]:text-signal [&_a]:underline [&_a]:underline-offset-2",
  "[&_hr]:border-edge-soft",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-signal [&_blockquote]:pl-4",
  "[&_img]:rounded-lg [&_img]:max-w-full [&_img]:h-auto",
  "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-ground [&_pre]:p-4 [&_pre]:text-xs",
  "[&_code]:rounded [&_code]:bg-well [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-fg",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
].join(" ")

export function ProseMarkdown({
  children,
  className = "measure",
}: {
  children: string
  className?: string
}) {
  return (
    <div className={`${PROSE} ${className}`}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  )
}
