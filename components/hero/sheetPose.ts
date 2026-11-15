/**
 * Where a sheet of the home stage is at a given scroll progress.
 *
 * A sheet flies in from below the stage, turning into its resting tilt.
 * It does not then lie still: for as long as the page keeps scrolling it
 * drifts up, shrinks a little and tilts further, so the stack fans out
 * and every sheet on the stage is always moving.
 */

/** How each sheet comes to rest, in degrees. Repeats after six. */
export const TILT = [-2.4, 1.7, -1.1, 2.3, -1.8, 1.2]

export interface SheetPose {
  /** Offset from the resting place, in svh. Positive is down. */
  y: number
  /** Degrees. */
  rotate: number
  scale: number
  /** 0 while flying in, then the count of sheet-lengths scrolled since landing. */
  age: number
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * @param progress  scroll progress of the journey, 0..1
 * @param index     which sheet; picks the resting tilt
 * @param from      progress at which the sheet leaves the bottom edge
 * @param to        progress at which it has landed
 * @param length    progress one sheet takes, the unit for drifting on
 */
export function sheetPose(progress: number, index: number, from: number, to: number, length: number): SheetPose {
  const rest = TILT[index % TILT.length]
  const side = rest < 0 ? -1 : 1

  if (progress <= to) {
    const t = Math.min(1, Math.max(0, (progress - from) / (to - from)))
    // Most of the way quickly, the last stretch slowly: it settles.
    const y = t < 0.55 ? lerp(115, 14, t / 0.55) : lerp(14, 0, (t - 0.55) / 0.45)
    return { y, rotate: rest + side * 9 * (1 - t), scale: 1, age: 0 }
  }

  // Capped, so a sheet far down the stack stops short of leaving the stage.
  const age = Math.min(3.5, (progress - to) / length)
  return { y: -3.2 * age, rotate: rest + side * 1.5 * age, scale: 1 - 0.03 * age, age }
}
