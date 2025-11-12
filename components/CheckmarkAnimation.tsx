"use client"

import { useEffect, useRef, useState } from "react"

import { CheckCircle, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const ANIMATION_PATH = "/animations/checkmark.lottie"

type DotLottiePlayerElement = HTMLElement & {
  load?: (src: string) => void
  play?: () => void
  pause?: () => void
  src?: string
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

    const registerPlayer = async () => {
      if (typeof window === "undefined") {
        return
      }

      if (!window.customElements.get("dotlottie-player")) {
        try {
          await import("@dotlottie/player-component/dist/dotlottie-player.mjs")
        } catch (error) {
          if (!cancelled) {
            console.error("[CheckmarkAnimation] Failed to load dotlottie player", error)
            setHasError(true)
          }
          return
        }
      }

      if (!cancelled) {
        setIsReady(true)
      }
    }

    void registerPlayer()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!playerRef.current || hasError || !isReady) {
      return
    }

    const node = playerRef.current
    let cancelled = false

    const handleError = () => {
      if (!cancelled) {
        setHasError(true)
      }
    }
    const handleReady = () => {
      node.play?.()
    }

    node.addEventListener("error", handleError)
    node.addEventListener("ready", handleReady)
    node.addEventListener("load", handleReady)

    if (node.load) {
      node.load(ANIMATION_PATH).catch(handleError)
    } else {
      node.src = ANIMATION_PATH
    }

    return () => {
      cancelled = true
      node.removeEventListener("error", handleError)
      node.removeEventListener("ready", handleReady)
      node.removeEventListener("load", handleReady)
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
