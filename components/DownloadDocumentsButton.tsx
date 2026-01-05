"use client"

import { Download } from "lucide-react"
import { useState } from "react"

export default function DownloadDocumentsButton() {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      const response = await fetch("/api/download-documents")

      if (!response.ok) {
        throw new Error("Failed to download documents")
      }

      // Create a blob from the response
      const blob = await response.blob()

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a temporary anchor element and trigger download
      const link = document.createElement("a")
      link.href = url
      link.download = "Seya_Weber_Application_Documents.zip"
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading documents:", error)
      alert("Failed to download documents. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      aria-label="Download all application documents"
    >
      <Download className={`w-5 h-5 ${isDownloading ? "animate-bounce" : ""}`} />
      <span>{isDownloading ? "Preparing Download..." : "Download Documents"}</span>
    </button>
  )
}
