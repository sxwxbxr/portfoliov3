// Vendored from Weber-Development/sigmoid (packages/core/src) until @sweberdev/sigmoid is on npm.
/**
 * An easing curve that works in two places at once: call it as a function in
 * JavaScript, or drop it into CSS. `String(easing)` and `easing.css` return
 * the CSS value (`linear(…)` or `cubic-bezier(…)`).
 */
export interface Easing {
  (t: number): number;
  /** CSS `<easing-function>`: `linear(…)`, `cubic-bezier(…)` or a keyword. */
  readonly css: string;
  /** Natural duration in milliseconds, set for springs. */
  readonly duration?: number;
}

const round = (n: number, digits: number) => {
  const r = Number(n.toFixed(digits));
  return Object.is(r, -0) ? 0 : r;
};

/** Wraps a function and a CSS value into an {@link Easing}. */
export function easing(fn: (t: number) => number, css?: string, duration?: number): Easing {
  const e = ((t: number) => (t <= 0 ? fn(0) : t >= 1 ? fn(1) : fn(t))) as Easing & {
    css: string;
    duration?: number;
  };
  e.css = css ?? toLinear(fn);
  if (duration !== undefined) e.duration = duration;
  e.toString = () => e.css;
  return e;
}

/** Vertical distance of point p from the line a–b: the error the browser would show. */
function distance(p: number[], a: number[], b: number[]) {
  const [px = 0, py = 0] = p;
  const [ax = 0, ay = 0] = a;
  const [bx = 0, by = 0] = b;
  return Math.abs(py - (ay + ((by - ay) * (px - ax)) / (bx - ax || 1)));
}

/** Ramer-Douglas-Peucker: keep only the points that change the shape. */
function simplify(points: number[][], epsilon: number): number[][] {
  if (points.length < 3) return points;
  const first = points[0] as number[];
  const last = points[points.length - 1] as number[];
  let index = 0;
  let max = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = distance(points[i] as number[], first, last);
    if (d > max) {
      max = d;
      index = i;
    }
  }
  if (max <= epsilon) return [first, last];
  const left = simplify(points.slice(0, index + 1), epsilon);
  return left.slice(0, -1).concat(simplify(points.slice(index), epsilon));
}

export interface LinearOptions {
  /** Points sampled before simplifying. Default 240. */
  samples?: number;
  /** Largest allowed deviation from the real curve. Default 0.0015. */
  tolerance?: number;
}

/**
 * Turns any easing function into a compact CSS `linear()` value. The curve is
 * sampled and then simplified, so a spring needs about 20 to 40 points instead
 * of hundreds.
 */
export function toLinear(fn: (t: number) => number, options: LinearOptions = {}): string {
  const samples = options.samples ?? 240;
  const points: number[][] = [];
  for (let i = 0; i <= samples; i++) {
    const x = i / samples;
    points.push([x, fn(x)]);
  }
  const kept = simplify(points, options.tolerance ?? 0.0015);
  const stops = kept.map(([x = 0, y = 0], i) => {
    const value = String(round(y, 4));
    // The first and last stop default to 0% and 100%.
    return i === 0 || i === kept.length - 1 ? value : `${value} ${round(x * 100, 2)}%`;
  });
  return `linear(${stops.join(", ")})`;
}

export interface SpringOptions {
  /** Perceived duration in seconds (SwiftUI-style). Used with `bounce`. Default 0.5. */
  duration?: number;
  /** 0 = no overshoot, 0.3 = a light bounce, up to 1. Default 0. */
  bounce?: number;
  /** Physical parameters. When set, they replace `duration` and `bounce`. */
  stiffness?: number;
  damping?: number;
  mass?: number;
  /** Initial velocity towards the target, in units per second. Default 0. */
  velocity?: number;
}

/**
 * A physically correct spring from 0 to 1, as an {@link Easing} with the
 * natural `duration` (ms) at which it comes to rest. Use the duration for
 * time-based animations; in scroll-driven animations the scroll range sets
 * the length and the curve keeps its shape.
 */
export function spring(options: SpringOptions = {}): Easing {
  const mass = options.mass ?? 1;
  let stiffness = options.stiffness;
  let damping = options.damping;
  if (stiffness === undefined || damping === undefined) {
    const d = options.duration ?? 0.5;
    const bounce = Math.min(Math.max(options.bounce ?? 0, 0), 0.99);
    stiffness ??= ((2 * Math.PI) / d) ** 2 * mass;
    damping ??= ((4 * Math.PI * (1 - bounce)) / d) * mass;
  }
  const v0 = options.velocity ?? 0;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  // Remaining distance to the target over time (seconds), starting at 1.
  let rest: (t: number) => number;
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const b = (zeta * w0 - v0) / wd;
    rest = (t) => Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + b * Math.sin(wd * t));
  } else if (zeta === 1) {
    rest = (t) => Math.exp(-w0 * t) * (1 + (w0 - v0) * t);
  } else {
    const s = Math.sqrt(zeta * zeta - 1);
    const r1 = -w0 * (zeta - s);
    const r2 = -w0 * (zeta + s);
    const a = (-v0 - r2) / (r1 - r2);
    rest = (t) => a * Math.exp(r1 * t) + (1 - a) * Math.exp(r2 * t);
  }

  // The spring is at rest once it stays within 0.1% of the target.
  let settle = 0;
  for (let ms = 0; ms <= 10000; ms++) {
    if (Math.abs(rest(ms / 1000)) > 0.001) settle = ms + 1;
  }
  const seconds = Math.max(settle, 1) / 1000;
  const fn = (t: number) => (t >= 1 ? 1 : 1 - rest(t * seconds));
  return easing(fn, undefined, settle || 1);
}

/**
 * The logistic function, normalised to run exactly from 0 to 1: the curve this
 * library is named after. `steepness` around 6 is soft, 12 is sharp.
 */
export function logistic(steepness = 10): Easing {
  const s = (x: number) => 1 / (1 + Math.exp(-steepness * (x - 0.5)));
  const lo = s(0);
  const hi = s(1);
  return easing((t) => (s(t) - lo) / (hi - lo));
}

/** A cubic Bézier curve, identical to the CSS `cubic-bezier()` function. */
export function bezier(x1: number, y1: number, x2: number, y2: number): Easing {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const x = (u: number) => ((ax * u + bx) * u + cx) * u;
  const y = (u: number) => ((ay * u + by) * u + cy) * u;
  const solve = (t: number) => {
    let u = t;
    for (let i = 0; i < 8; i++) {
      const dx = (3 * ax * u + 2 * bx) * u + cx;
      const err = x(u) - t;
      if (Math.abs(err) < 1e-7) return u;
      if (Math.abs(dx) < 1e-6) break;
      u -= err / dx;
    }
    // Bisection when Newton's method does not converge.
    let lo = 0;
    let hi = 1;
    u = t;
    while (hi - lo > 1e-7) {
      if (x(u) < t) lo = u;
      else hi = u;
      u = (lo + hi) / 2;
    }
    return u;
  };
  return easing((t) => y(solve(t)), `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`);
}

const presets = () => ({
  linear: easing((t) => t, "linear"),
  /** Fast start, long soft landing. The default for reveals. */
  out: bezier(0.16, 1, 0.3, 1),
  /** Symmetric, for elements moving between two states. */
  inOut: bezier(0.65, 0, 0.35, 1),
  /** Material-style standard curve. */
  standard: bezier(0.2, 0, 0, 1),
  /** The S-curve: slow, decisive, slow. */
  sigmoid: logistic(10),
  /** Spring without overshoot (critically damped), 0.5 s. */
  smooth: spring({ duration: 0.5 }),
  /** Spring with a light overshoot, 0.6 s. */
  bouncy: spring({ duration: 0.6, bounce: 0.3 }),
  /** Spring with a playful wobble, 0.8 s. */
  wobbly: spring({ duration: 0.8, bounce: 0.55 }),
});

/**
 * A small, opinionated set of curves. Springs and the logistic curve are
 * exported as `linear()` so they run natively in CSS. Unused, it is removed by
 * tree-shaking.
 */
export const ease: ReturnType<typeof presets> = /* @__PURE__ */ presets();

export type EaseName = keyof typeof ease;

/**
 * CSS custom properties for a set of easings, e.g.
 * `--sigmoid-ease-bouncy: linear(…);`. Put the result in a `:root` rule or use
 * it in a Tailwind theme.
 */
export function cssVariables(
  easings: Record<string, Easing> = ease,
  prefix = "--sigmoid-ease-",
): string {
  return Object.entries(easings)
    .map(
      ([name, e]) => `${prefix}${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}: ${e.css};`,
    )
    .join("\n");
}
