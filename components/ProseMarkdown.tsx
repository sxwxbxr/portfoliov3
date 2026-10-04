import ReactMarkdown from "react-markdown"

/**
 * Long-form markdown, styled explicitly against the LINE tokens.
 *
 * The project has no @tailwindcss/typography plugin, so every element is
 * styled here: white headings at weight 400, grey body, underlined white
 * links, code in the sunken well, a hairline-led blockquote.
 *
 * One copy, shared by /privacy, /imprint and the blog pages, so they cannot
 * drift. components/ai/Markdown.tsx stays separate on purpose: it renders
 * inside chat bubbles and needs a tighter scale.
 */
export const PROSE = [
  "flex flex-col gap-5 text-[1.0625rem] leading-relaxed text-fg-muted",
  "[&_h1]:text-2xl [&_h1]:tracking-tight [&_h1]:text-fg",
  "[&_h2]:mt-6 [&_h2]:text-lg [&_h2]:tracking-tight [&_h2]:text-fg",
  "[&_h3]:mt-2 [&_h3]:text-base [&_h3]:tracking-tight [&_h3]:text-fg",
  "[&_p]:leading-[1.75]",
  "[&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5",
  "[&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-2 [&_ol]:pl-5",
  "[&_li]:leading-relaxed [&_li]:marker:text-fg-subtle",
  "[&_strong]:font-normal [&_strong]:text-fg",
  "[&_em]:italic",
  "[&_a]:text-fg [&_a]:underline [&_a]:decoration-edge [&_a]:underline-offset-4 hover:[&_a]:decoration-fg",
  "[&_hr]:my-4 [&_hr]:border-edge-soft",
  "[&_blockquote]:border-l [&_blockquote]:border-edge-mid [&_blockquote]:pl-4",
  "[&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md",
  "[&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-edge-soft [&_pre]:bg-well [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm",
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
