/**
 * The route of the home page's flight, as plain numbers.
 *
 * The page opens above a sea of clouds. Scrolling sinks through it, flies
 * low over a landscape past one landmark per station, reaches a shrine gate,
 * flies through it and climbs back above the clouds, where the picture is
 * the one the page opened with, so the scroll can start over.
 *
 * Lengths are in viewport heights of scroll, distances in world units.
 */

export const SKY = 1
export const DESCENT = 1.5
export const STATION = 1.6
export const SHRINE = 2
export const ASCENT = 1.5

/** World units flown per viewport height of scroll. */
export const PACE = 8

export interface Route {
  /** Whole length of the journey, in viewport heights. */
  total: number
  /** Where each station's landmark stands. The camera passes it as the station ends. */
  stations: number[]
  /** Where the shrine gate stands. */
  shrine: number
}

export function route(count: number): Route {
  const first = SKY + DESCENT
  return {
    total: first + count * STATION + SHRINE + ASCENT,
    stations: Array.from({ length: count }, (_, i) => PACE * (first + (i + 1) * STATION)),
    shrine: PACE * (first + count * STATION + SHRINE),
  }
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const smooth = (v: number) => {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}

export interface Flight {
  /** Distance flown. */
  z: number
  /**
   * Where the camera is against the cloud layer: 0 above it, 1 inside it,
   * 2 under it at cruising height.
   */
  depth: number
}

/** The camera at `progress` (0..1) along a route. */
export function flight(progress: number, r: Route): Flight {
  const t = clamp01(progress) * r.total
  const z = PACE * t

  // Down: the cloud tops pass, then the underside lifts off the ground.
  const sink = smooth((t - 0.3) / 1) + smooth((t - 1.3) / (SKY + DESCENT - 1.3))
  // Up again once the gate is behind us, ending a moment before the end so
  // the last picture rests like the first.
  const gate = r.total - ASCENT
  const climb = smooth((t - gate) / 0.6) + smooth((t - gate - 0.6) / (ASCENT - 0.9))

  return { z, depth: t < gate ? sink : 2 - climb }
}

/**
 * How a station's card stands for a landmark `distance` ahead: -1 waiting
 * below the frame, 0 in place, 1 flown past. Between those it travels. It is
 * in place from `far` to `near`: while the landmark is well in view.
 */
export function presence(distance: number, far = 12.4, near = 6.2): number {
  if (distance > far) return -smooth((distance - far) / 2.4)
  if (distance < near) return smooth((near - distance) / 2)
  return 0
}

/** Progress at which a landmark at `z` is `distance` ahead: where to scroll to see its card. */
export function progressAt(z: number, distance: number, r: Route): number {
  return clamp01((z - distance) / PACE / r.total)
}
