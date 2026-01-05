import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import JSZip from 'jszip'

export async function GET() {
  try {
    // Path to the application documents directory
    const documentsDir = path.join(process.cwd(), 'applicationDocuments')

    // Read all files in the directory
    const files = await fs.readdir(documentsDir)

    // Create a new JSZip instance
    const zip = new JSZip()

    // Add each file to the zip
    for (const file of files) {
      const filePath = path.join(documentsDir, file)
      const fileData = await fs.readFile(filePath)
      zip.file(file, fileData)
    }

    // Generate the zip file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    // Create a response with the zip file
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="Application_Documents_Seya_Weber.zip"',
      },
    })
  } catch (error) {
    console.error('Error creating zip file:', error)
    return NextResponse.json(
      { error: 'Failed to create zip file' },
      { status: 500 }
    )
  }
}
