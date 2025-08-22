"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Progress } from "./ui/progress"
import { Upload, File, ImageIcon, FileText, Code } from "lucide-react"
import { useAuth } from "./AuthProvider"

interface FileUploadProps {
  onFileUploaded: (file: any) => void
}

export function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-blue-500" />
    if (type.includes("pdf") || type.includes("document")) return <FileText className="h-8 w-8 text-red-500" />
    if (type.includes("code") || type.includes("text")) return <Code className="h-8 w-8 text-green-500" />
    return <File className="h-8 w-8 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const simulateUpload = (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)

          // Create file object and add to shared files
          const newFile = {
            id: Date.now().toString(),
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type.startsWith("image/")
              ? "image"
              : file.type.includes("pdf")
                ? "pdf"
                : file.type.includes("document")
                  ? "document"
                  : "code",
            uploadedBy: user?.name || "Unknown",
            uploadedAt: new Date().toISOString(),
            downloads: 0,
            url: URL.createObjectURL(file),
          }

          onFileUploaded(newFile)
          setUploadProgress(0)
          return 0
        }
        return prev + Math.random() * 15
      })
    }, 200)
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      alert("File size must be less than 10MB")
      return
    }

    simulateUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isUploading ? (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-primary mx-auto animate-bounce" />
              <div>
                <p className="text-lg font-medium">Uploading file...</p>
                <Progress value={uploadProgress} className="mt-2 max-w-xs mx-auto" />
                <p className="text-sm text-muted-foreground mt-1">{Math.round(uploadProgress)}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <p className="text-lg font-medium">Drop files here or click to upload</p>
                <p className="text-sm text-muted-foreground">
                  Support for images, documents, and code files (max 10MB)
                </p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                Choose Files
              </Button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          accept="image/*,.pdf,.doc,.docx,.txt,.js,.ts,.tsx,.jsx,.css,.html,.json,.sql"
        />
      </CardContent>
    </Card>
  )
}
