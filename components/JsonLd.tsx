interface JsonLdProps {
  data: Record<string, unknown>
}

/** Server component: serialises a schema.org object into a JSON-LD script tag. */
export function JsonLd({ data }: JsonLdProps) {
  // "<" is escaped so a string containing "</script>" cannot end the tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c")
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
