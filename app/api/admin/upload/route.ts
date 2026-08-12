export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { requireAuth } from "@/lib/auth"

/**
 * Image upload for the admin forms.
 *
 * Files go to Vercel Blob rather than to `public/`. On Vercel the filesystem is
 * read-only at runtime and anything written would vanish on the next deploy, so
 * writing into the repo directory is not an option — it would appear to work
 * locally and silently fail in production, which is the worst of both.
 *
 * The route returns the public URL and the caller stores that in the same
 * `image` column it always used. Nothing about the read path changes: a value
 * can still be a repo-relative path like `/chr0no.png`, so the four images
 * already committed under `public/` keep working untouched.
 */

const MAX_BYTES = 8 * 1024 * 1024

// Allow-list rather than a block-list, and checked against the sniffed type
// rather than the filename. SVG is deliberately excluded: it can carry script,
// and these files are served from a URL the site itself renders.
const ALLOWED = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
  ["image/gif", "gif"],
])

/** Sniffs the real format from the leading bytes, ignoring the declared type. */
function sniff(bytes: Uint8Array): string | null {
  const b = bytes
  if (b.length < 12) return null
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png"
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg"
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "image/gif"
  const riff = String.fromCharCode(b[0], b[1], b[2], b[3])
  const fmt = String.fromCharCode(b[8], b[9], b[10], b[11])
  if (riff === "RIFF" && fmt === "WEBP") return "image/webp"
  // AVIF/HEIF: "ftyp" box at offset 4, brand at 8.
  if (String.fromCharCode(b[4], b[5], b[6], b[7]) === "ftyp") {
    const brand = String.fromCharCode(b[8], b[9], b[10], b[11])
    if (brand.startsWith("avif") || brand.startsWith("avis")) return "image/avif"
  }
  return null
}

function slugify(name: string): string {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image"
  )
}

export async function POST(request: Request) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "No blob store is connected. Create one in the Vercel dashboard under Storage; it sets BLOB_READ_WRITE_TOKEN automatically. Until then you can still paste a path or URL.",
      },
      { status: 503 }
    )
  }

  let file: File
  try {
    const form = await request.formData()
    const entry = form.get("file")
    if (!(entry instanceof File)) {
      return NextResponse.json({ error: "No file was sent." }, { status: 400 })
    }
    file = entry
  } catch {
    return NextResponse.json({ error: "Could not read the upload." }, { status: 400 })
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "That file is empty." }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 8 MB.` },
      { status: 413 }
    )
  }

  const buffer = new Uint8Array(await file.arrayBuffer())
  const detected = sniff(buffer)
  if (!detected || !ALLOWED.has(detected)) {
    return NextResponse.json(
      { error: "That is not a PNG, JPEG, WebP, AVIF or GIF image." },
      { status: 415 }
    )
  }

  try {
    // addRandomSuffix keeps a re-upload under the same name from overwriting the
    // previous file, which a live page may still be pointing at.
    const blob = await put(
      `content/${slugify(file.name)}.${ALLOWED.get(detected)}`,
      buffer,
      {
        access: "public",
        contentType: detected,
        addRandomSuffix: true,
      }
    )
    return NextResponse.json({
      url: blob.url,
      contentType: detected,
      size: file.size,
    })
  } catch (error) {
    console.error("Blob upload failed:", error)
    return NextResponse.json(
      { error: "The upload was rejected by the blob store." },
      { status: 502 }
    )
  }
}
