/**
 * Logo mark of Physio Tools: two square brackets around a dot.
 * The brackets are the field-tag syntax of a PubMed string ([tiab], [Mesh]),
 * the dot is the joint, the one thing the string is about. Teal tile, white
 * strokes, so it holds up at favicon size. Also drawn in app/physio/opengraph-image.tsx.
 */
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="var(--signal)" />
      <path
        d="M12.5 9H9.75v14h2.75M19.5 9h2.75v14H19.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="2.75" fill="#fff" />
    </svg>
  )
}
