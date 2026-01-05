import { NextResponse } from "next/server"
import archiver from "archiver"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const documentsPath = path.join(process.cwd(), "applicationDocuments")

    // Check if directory exists
    if (!fs.existsSync(documentsPath)) {
      return NextResponse.json(
        { error: "Documents directory not found" },
        { status: 404 }
      )
    }

    // Get all files from the directory
    const files = fs.readdirSync(documentsPath)

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No documents found" },
        { status: 404 }
      )
    }

    // Create a new archiver instance
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    })

    // Create a readable stream from the archive
    const chunks: Uint8Array[] = []

    archive.on("data", (chunk: Buffer) => {
      chunks.push(chunk)
    })

    const archivePromise = new Promise<Buffer>((resolve, reject) => {
      archive.on("end", () => {
        resolve(Buffer.concat(chunks))
      })
      archive.on("error", (err) => {
        reject(err)
      })
    })

    // Add all files from the applicationDocuments directory
    files.forEach((file) => {
      const filePath = path.join(documentsPath, file)
      if (fs.statSync(filePath).isFile()) {
        archive.file(filePath, { name: file })
      }
    })

    // Finalize the archive
    await archive.finalize()

    // Wait for the archive to complete
    const buffer = await archivePromise

    // Convert Buffer to ArrayBuffer for proper Response body type
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    )

    // Return the ZIP file
    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=Seya_Weber_Application_Documents.zip",
      },
    })
  } catch (error) {
    console.error("Error creating ZIP file:", error)
    return NextResponse.json(
      { error: "Failed to create ZIP file" },
      { status: 500 }
    )
  }
}
