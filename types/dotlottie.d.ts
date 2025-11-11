import type { HTMLAttributes, RefAttributes } from "react"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dotlottie-player": HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & {
        src?: string
        autoplay?: boolean
        loop?: boolean | number
        mode?: "normal" | "bounce"
        background?: string
        controls?: boolean
        hover?: boolean
        direction?: 1 | -1
        speed?: number
        intermission?: number
        playOn?: string
        keepLastFrame?: boolean
      }
    }
  }
}

export {}
