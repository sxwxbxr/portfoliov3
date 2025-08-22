"use client"

import { useState, useRef, useEffect } from "react"
import { LoadingSpinner } from "./LoadingSpinner"
import Image from "next/image"

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export function LazyImage({ src, alt, className = "", width, height, priority = false }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setError(true)
    setIsLoaded(true)
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <LoadingSpinner size="sm" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <span className="text-sm">Failed to load image</span>
        </div>
      )}

      {isInView && (
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          {...(width && height ? { width, height } : { fill: true })}
          className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"} ${className}`}
        />
      )}
    </div>
  )
}
