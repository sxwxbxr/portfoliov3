"use client"

import { useEffect, useId, useMemo, useState } from "react"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { witnessDemoCopy } from "@/lib/demo/witness-copy"
import { type ImageMarking, toDataUrl, useWitness } from "./runtime"

const t = witnessDemoCopy.images
const SAMPLE = "/demos/witness/lagoon.jpg"
const SAMPLE_AUDIO = "/demos/witness/voice.mp3"
const SAMPLE_C2PA = "/demos/witness/content-credentials.jpg"
const KINDS = ["generated", "edited"] as const
type Kind = (typeof KINDS)[number]

interface Picked {
  name: string
  bytes: Uint8Array
}

const MIME: Record<string, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  mp4: "video/mp4",
}
const IMAGE_FORMATS = new Set(["png", "jpeg", "webp"])

function size(bytes: number): string {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} kB`
}

/** Marks a picked image, audio or video file in memory and shows what Witness reads before and after. */
export function ImageDemo() {
  const mod = useWitness()
  const [picked, setPicked] = useState<Picked | null>(null)
  const [kind, setKind] = useState<Kind>("generated")
  const [generator, setGenerator] = useState("Image model (example)")
  const ids = { file: useId(), kind: useId(), generator: useId() }

  const result = useMemo(() => {
    if (!mod || !picked) return null
    const before = mod.readMarking(picked.bytes)
    const marking = mod.createMarking({ kind, generator: generator.trim() || undefined })
    const marked = mod.markFile(picked.bytes, marking)
    const after = marked.status === "marked" ? mod.readMarking(marked.bytes) : null
    return { before, marked, after }
  }, [mod, picked, kind, generator])

  const preview = useMemo(
    () =>
      picked && result?.before.format && IMAGE_FORMATS.has(result.before.format)
        ? toDataUrl(picked.bytes, MIME[result.before.format] ?? "image/png")
        : null,
    [picked, result?.before.format],
  )
  const download = useObjectUrl(
    result?.marked.status === "marked" ? result.marked.bytes : undefined,
    result?.marked.format,
  )

  if (mod === false) return <p className="text-sm text-fg-muted">{witnessDemoCopy.failed}</p>

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setPicked({ name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) })
  }
  const loadSample = async (url: string) => {
    const response = await fetch(url)
    const name = url.split("/").pop() ?? "sample"
    setPicked({ name, bytes: new Uint8Array(await response.arrayBuffer()) })
  }

  const downloadName = picked ? picked.name.replace(/(\.[a-z0-9]+)?$/i, "-marked$1") : "marked"

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor={ids.file} className="control cursor-pointer px-4 py-2 text-sm">
            {t.pick}
            <input
              id={ids.file}
              type="file"
              accept="image/png,image/jpeg,image/webp,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,video/mp4,video/quicktime,.m4a,.mov"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
              disabled={!mod}
            />
          </label>
          <button
            type="button"
            className="control px-4 py-2 text-sm"
            onClick={() => loadSample(SAMPLE)}
            disabled={!mod}
          >
            {t.sample}
          </button>
          <button
            type="button"
            className="control px-4 py-2 text-sm"
            onClick={() => loadSample(SAMPLE_AUDIO)}
            disabled={!mod}
          >
            {t.sampleAudio}
          </button>
          <button
            type="button"
            className="control px-4 py-2 text-sm"
            onClick={() => loadSample(SAMPLE_C2PA)}
            disabled={!mod}
          >
            {t.sampleC2pa}
          </button>
          {!mod && <span className="text-sm text-fg-muted">{witnessDemoCopy.loading}</span>}
        </div>
        <label htmlFor={ids.kind} className="flex flex-col gap-1.5">
          <span className="annotate">{t.kind}</span>
          <select id={ids.kind} className="control w-full px-3 py-2 text-sm" value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {t.kinds[k]}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={ids.generator} className="flex flex-col gap-1.5">
          <span className="annotate">{t.generator}</span>
          <input
            id={ids.generator}
            className="well w-full px-3 py-2 text-sm text-fg"
            value={generator}
            onChange={(e) => setGenerator(e.target.value)}
          />
        </label>
        {preview && (
          <div className="well overflow-hidden p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL of the picked file */}
            <img src={preview} alt={picked?.name ?? ""} className="block h-auto max-h-[320px] w-full rounded-md object-contain" />
          </div>
        )}
        <CodeBlock
          title={t.cli}
          code={`npx witness mark ${picked?.name ?? "image.png"} --out marked \\\n  --kind ${kind} --generator "${generator}"\nnpx witness inspect marked/${picked?.name ?? "image.png"}`}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-5" aria-live="polite">
        {result && (
          <>
            {result.marked.status === "unsupported" && <p className="text-sm text-fg">{t.unsupported}</p>}
            {result.marked.status === "skipped-c2pa" && <p className="text-sm text-fg">{t.skipped}</p>}
            <div className="well overflow-x-auto p-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-fg-muted">
                    <th scope="col" className="py-1.5 pr-4 font-normal" />
                    <th scope="col" className="py-1.5 pr-4 font-medium text-fg">
                      {t.before}
                    </th>
                    <th scope="col" className="py-1.5 font-medium text-fg">
                      {t.after}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows(result.before, result.after, picked?.bytes.length ?? 0, result.marked.bytes.length).map((r) => (
                    <tr key={r.label} className="border-t border-edge-soft align-top">
                      <th scope="row" className="py-1.5 pr-4 font-normal text-fg-muted">
                        {r.label}
                      </th>
                      <td className="py-1.5 pr-4 break-all text-fg">{r.before}</td>
                      <td className="py-1.5 break-all text-fg">{r.after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {download && (
              <a href={download} download={downloadName} className="control control-primary self-start px-4 py-2 text-sm">
                {t.download}
              </a>
            )}
            {result.after?.xmp && <CodeBlock title={t.xmp} code={result.after.xmp.trim()} label="XMP" />}
          </>
        )}
      </div>
    </div>
  )
}

function rows(before: ImageMarking, after: ImageMarking | null, sizeBefore: number, sizeAfter: number) {
  const yes = (v: boolean | undefined) => (v === undefined ? "–" : v ? t.yes : t.no)
  return [
    { label: t.rows.format, before: before.format ?? "–", after: after?.format ?? "–" },
    { label: t.rows.ai, before: yes(before.aiGenerated), after: yes(after?.aiGenerated) },
    { label: t.rows.source, before: before.sourceType ?? "–", after: after?.sourceType ?? "–" },
    { label: t.rows.generator, before: before.generator ?? "–", after: after?.generator ?? "–" },
    { label: t.rows.c2pa, before: yes(before.c2pa), after: yes(after?.c2pa) },
    {
      label: t.rows.c2paBy,
      before: before.c2paManifest?.active.claimGenerator ?? "–",
      after: after?.c2paManifest?.active.claimGenerator ?? "–",
    },
    { label: t.rows.size, before: size(sizeBefore), after: after ? size(sizeAfter) : "–" },
  ]
}

/** An object URL for the bytes, revoked when they change. */
function useObjectUrl(bytes: Uint8Array | undefined, format: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!bytes) {
      setUrl(null)
      return
    }
    const blob = new Blob([bytes as BlobPart], { type: (format && MIME[format]) || "application/octet-stream" })
    const next = URL.createObjectURL(blob)
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [bytes, format])
  return url
}
