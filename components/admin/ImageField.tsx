"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Loader2, Upload, X } from "lucide-react"

interface ImageFieldProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  hint?: string
}

/**
 * One image field, two ways to fill it.
 *
 * This replaces a bare "Image URL" text input, but does not remove the text
 * input — the column already holds repo-relative paths like `/chr0no.png` for
 * the images committed under `public/`, and an upload-only control would make
 * those unreachable and unfixable from the admin. So the text value stays the
 * single source of truth and the upload button simply writes into it.
 *
 * The preview is the real payoff: the column is free text, and until now the
 * only way to find out whether a path pointed at an actual file was to publish
 * and look. Five of nine seeded projects pointed at files that do not exist.
 */
export default function ImageField({
  label,
  name,
  value,
  onChange,
  hint,
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [broken, setBroken] = useState(false)

  const inputClasses =
    "w-full px-4 py-2.5 bg-transparent border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50"

  async function upload(file: File) {
    setBusy(true)
    setError(null)
    try {
      const body = new FormData()
      body.append("file", file)
      const res = await fetch("/api/admin/upload", { method: "POST", body })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "The upload failed.")
        return
      }
      setBroken(false)
      onChange(data.url)
    } catch {
      setError("The upload could not be sent.")
    } finally {
      setBusy(false)
      // Clear the picker so choosing the same file twice fires onChange again.
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {/* Preview, or a labelled placeholder. Never a broken frame. */}
        <div className="well-sm relative h-24 w-full shrink-0 overflow-hidden sm:w-40">
          {value && !broken ? (
            <Image
              src={value}
              alt=""
              fill
              sizes="160px"
              className="object-cover"
              onError={() => setBroken(true)}
              // A 160px thumbnail only one person ever looks at is not worth an
              // image-optimisation transform; it also means the preview works
              // even if remotePatterns has not been updated for a new host yet.
              unoptimized={value.startsWith("http")}
            />
          ) : (
            <span className="annotate absolute inset-0 flex items-center justify-center text-center">
              {value && broken ? "Not found" : "No image"}
            </span>
          )}
        </div>

        <div className="flex w-full flex-col gap-2">
          <input
            id={name}
            name={name}
            type="text"
            value={value}
            onChange={(e) => {
              setBroken(false)
              setError(null)
              onChange(e.target.value)
            }}
            placeholder="/chr0no.png, or upload a file"
            className={inputClasses}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="control inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  Upload image
                </>
              )}
            </button>

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("")
                  setBroken(false)
                  setError(null)
                }}
                className="control inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </button>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void upload(file)
            }}
          />

          {error && (
            <p role="alert" className="text-xs leading-relaxed text-destructive">
              {error}
            </p>
          )}
          {hint && !error && (
            <p className="text-xs leading-relaxed text-muted-foreground/80">{hint}</p>
          )}
        </div>
      </div>
    </div>
  )
}
