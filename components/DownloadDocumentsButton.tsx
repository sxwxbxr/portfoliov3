"use client"

import { useState } from "react"
import { Download } from "lucide-react"

interface DownloadDocumentsButtonProps {
  variant?: "default" | "compact" | "icon"
  className?: string
}

export function DownloadDocumentsButton({ variant = "default", className = "" }: DownloadDocumentsButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      const response = await fetch('/api/download-documents')

      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Application_Documents_Seya_Weber.zip'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading documents:', error)
      alert('Failed to download documents. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`p-2 hover:bg-muted rounded-md transition-colors disabled:opacity-50 ${className}`}
        aria-label="Download application documents"
        title="Download application documents"
      >
        <Download className={`w-5 h-5 ${isDownloading ? 'animate-pulse' : ''}`} />
      </button>
    )
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label="Download application documents"
      >
        <Download className={`w-4 h-4 ${isDownloading ? 'animate-pulse' : ''}`} />
        {isDownloading ? 'Downloading...' : 'Download CV'}
      </button>
    )
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105 glow-effect disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      aria-label="Download application documents"
    >
      <Download className={`w-5 h-5 ${isDownloading ? 'animate-pulse' : ''}`} />
      {isDownloading ? 'Preparing Download...' : 'Download Application Documents'}
    </button>
  )
}
