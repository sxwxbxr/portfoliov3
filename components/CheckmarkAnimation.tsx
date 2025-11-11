"use client"

import { useEffect, useRef, useState } from "react"

import { CheckCircle, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const ANIMATION_PATH = "/animations/checkmark.lottie"

type DotLottiePlayerElement = HTMLElement & {
  play?: () => void
  pause?: () => void
}

interface CheckmarkAnimationProps {
  className?: string
}

export function CheckmarkAnimation({ className }: CheckmarkAnimationProps) {
  const playerRef = useRef<DotLottiePlayerElement | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch(ANIMATION_PATH, { method: "HEAD" })
      .then((response) => {
        if (!cancelled && !response.ok) {
          setHasError(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasError(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    import("@dotlottie/player-component")
      .then(() => setIsReady(true))
      .catch(() => setHasError(true))
  }, [])

  useEffect(() => {
    if (!playerRef.current || hasError) {
      return
    }

    const node = playerRef.current
    const handleError = () => setHasError(true)

    node.addEventListener("error", handleError)

    return () => {
      node.removeEventListener("error", handleError)
    }
  }, [hasError, isReady])

  return (
    <div
      className={cn(
        "flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-primary/40 bg-primary/5 p-3",
        className,
      )}
    >
      {hasError ? (
        <div className="flex flex-col items-center justify-center gap-1 text-primary">
          <CheckCircle className="h-8 w-8" />
          <span className="text-center text-xs font-medium text-primary/80">Add checkmark.lottie</span>
        </div>
      ) : isReady ? (
        <dotlottie-player
          ref={playerRef}
          autoplay
          keepLastFrame
          loop={false}
          mode="normal"
          src={ANIMATION_PATH}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      )}
    </div>
  )
}
