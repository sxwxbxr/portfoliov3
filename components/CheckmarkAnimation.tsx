"use client"

import { useEffect, useRef, useState } from "react"

import { Check, Loader2 } from "lucide-react"
import { useReducedMotion } from "framer-motion"

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

/** The recess the mark is cast into. Same frame for every state. */
function Frame({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "well flex h-24 w-24 items-center justify-center overflow-visible rounded-full p-3",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CheckmarkAnimation({ className }: CheckmarkAnimationProps) {
  const playerRef = useRef<DotLottiePlayerElement | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  // The lottie used to play for everyone, including people who asked the OS
  // not to animate anything. Now it is opt-in by motion preference.
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return

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
  }, [prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion || !playerRef.current || hasError || !isReady) {
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
      try {
        node.load(ANIMATION_PATH)
      } catch (err) {
        handleError()
        console.error("[CheckmarkAnimation] load error", err)
      }
    } else {
      node.src = ANIMATION_PATH
    }

    return () => {
      cancelled = true
      node.removeEventListener("error", handleError)
      node.removeEventListener("ready", handleReady)
      node.removeEventListener("load", handleReady)
    }
  }, [hasError, isReady, prefersReducedMotion])

  // Reduced motion, or the player never arrived: the same struck mark, cast
  // into the recess. No spinner, no dependency, no dev-facing string.
  if (prefersReducedMotion || hasError) {
    return (
      <Frame className={className}>
        <Check className="h-10 w-10 text-signal" strokeWidth={2.5} />
      </Frame>
    )
  }

  return (
    <Frame className={className}>
      {isReady ? (
        <dotlottie-player
          ref={playerRef}
          autoplay
          keepLastFrame
          loop={false}
          mode="normal"
          src={ANIMATION_PATH}
          style={{
            width: "110%",
            height: "110%",
            transform: "scale(1.35)",
            transformOrigin: "center",
          }}
        />
      ) : (
        <Loader2 className="h-8 w-8 animate-spin text-fg-subtle motion-reduce:animate-none" />
      )}
    </Frame>
  )
}
