// Vendored from Weber-Development/sigmoid (packages/core/src) until @sweberdev/sigmoid is on npm.
import type { Easing } from "./easing";
import { type PresetName, presets } from "./presets";
import { parseRange, type Range, viewProgress } from "./range";

export type Targets = Element | string | Iterable<Element> | null | undefined;

export interface Controller {
  /** The Web Animations of all targets. */
  readonly animations: Animation[];
  /** True when the browser drives the animation natively (CSS scroll timeline). */
  readonly native: boolean;
  /** Stops the animation and removes its effect. */
  cancel(): void;
}

export interface MotionOptions {
  /** Curve over the range. A Sigmoid {@link Easing} or any CSS easing. */
  easing?: Easing | string;
  /**
   * What to do when the user prefers reduced motion. `"skip"` (default) shows
   * the end state without movement, `"allow"` animates anyway.
   */
  reducedMotion?: "skip" | "allow";
  /** Force the JavaScript fallback, e.g. to compare both. */
  fallback?: boolean;
}

export interface RevealOptions extends MotionOptions {
  /** A preset name or your own keyframes. Default `"fade-up"`. */
  keyframes?: PresetName | Keyframe[];
  /** CSS `animation-range`. Default `"entry 0% cover 40%"`. */
  range?: string;
}

export interface ScrubOptions extends MotionOptions {
  /** Scroll container. Default: the page. */
  source?: Element;
  /** Default `"block"`. */
  axis?: "block" | "inline";
}

export interface ParallaxOptions extends MotionOptions {
  /** Pixels the element moves against the scroll in each direction. Default 60. */
  distance?: number;
}

declare const ScrollTimeline: new (o: {
  source?: Element | null;
  axis?: string;
}) => AnimationTimeline;
declare const ViewTimeline: new (o: { subject: Element; axis?: string }) => AnimationTimeline;

const hasWindow = () => typeof window !== "undefined" && typeof Element !== "undefined";

/** True when the browser runs scroll-driven animations natively. */
export function supportsScrollTimeline(): boolean {
  return hasWindow() && "ViewTimeline" in window && "ScrollTimeline" in window;
}

/** True when the user asked the system for reduced motion. */
export function prefersReducedMotion(): boolean {
  return hasWindow() && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function resolve(targets: Targets): Element[] {
  if (!targets || !hasWindow()) return [];
  if (typeof targets === "string") return Array.from(document.querySelectorAll(targets));
  if (targets instanceof Element) return [targets];
  return Array.from(targets);
}

/** linear() needs Chrome 113, Safari 17.2, Firefox 112. Older browsers get the JS curve. */
function easingFor(value: Easing | string | undefined, fallback: string) {
  const css = typeof value === "function" ? value.css : (value ?? fallback);
  const ok = typeof CSS === "undefined" || CSS.supports("animation-timing-function", css);
  return { css: ok ? css : "linear", js: !ok && typeof value === "function" ? value : undefined };
}

// --- JavaScript fallback: one passive scroll listener, one frame per change. ---

type Driver = () => void;
const drivers = new Set<Driver>();
let frame = 0;

function tick() {
  frame = 0;
  for (const drive of drivers) drive();
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(tick);
}

function addDriver(drive: Driver) {
  if (!drivers.size) {
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });
  }
  drivers.add(drive);
  drive();
}

function removeDriver(drive: Driver) {
  drivers.delete(drive);
  if (!drivers.size) {
    removeEventListener("scroll", schedule);
    removeEventListener("resize", schedule);
  }
}

/** Layout position without the element's own transform, so parallax cannot feed back. */
function measure(el: Element) {
  if (el instanceof HTMLElement) {
    let top = 0;
    let node: HTMLElement | null = el;
    while (node) {
      top += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    return { top: top - scrollY, height: el.offsetHeight };
  }
  const rect = el.getBoundingClientRect();
  return { top: rect.top, height: rect.height };
}

function controller(animations: Animation[], native: boolean, stop?: () => void): Controller {
  return {
    animations,
    native,
    cancel() {
      stop?.();
      for (const a of animations) a.cancel();
    },
  };
}

function run(
  targets: Targets,
  keyframes: Keyframe[],
  options: MotionOptions,
  defaultEasing: string,
  timeline: (el: Element) => AnimationTimeline,
  progress: (el: Element) => number,
  rangeCss?: string,
): Controller {
  const elements = resolve(targets);
  if (!elements.length) return controller([], false);

  const reduced = options.reducedMotion !== "allow" && prefersReducedMotion();
  const { css, js } = easingFor(options.easing, defaultEasing);
  const native = !options.fallback && supportsScrollTimeline();

  if (reduced) return controller([], native);

  if (native) {
    const animations = elements.map((el) => {
      return el.animate(keyframes, {
        fill: "both",
        easing: css,
        timeline: timeline(el),
        ...(rangeCss ? splitRange(rangeCss) : {}),
      } as KeyframeAnimationOptions);
    });
    return controller(animations, true);
  }

  const animations = elements.map((el) => {
    const a = el.animate(keyframes, { duration: 1000, fill: "both", easing: css });
    a.pause();
    return a;
  });
  const drive = () => {
    animations.forEach((a, i) => {
      const p = progress(elements[i] as Element);
      a.currentTime = (js ? Math.min(Math.max(js(p), 0), 1) : p) * 1000;
    });
  };
  addDriver(drive);
  return controller(animations, false, () => removeDriver(drive));
}

function splitRange(value: string) {
  const r = parseRange(value);
  return {
    rangeStart: `${r.start.name} ${r.start.offset}%`,
    rangeEnd: `${r.end.name} ${r.end.offset}%`,
  };
}

function viewDriver(range: Range) {
  return (el: Element) => {
    const { top, height } = measure(el);
    return viewProgress(range, top, height, innerHeight);
  };
}

/**
 * Animates elements in as they scroll into view. Uses a native CSS view
 * timeline where available and a tiny scroll-linked fallback elsewhere.
 *
 * @example reveal(".card", { keyframes: "fade-up", easing: ease.bouncy })
 */
export function reveal(targets: Targets, options: RevealOptions = {}): Controller {
  const rangeCss = options.range ?? "entry 0% cover 40%";
  const range = parseRange(rangeCss);
  const keyframes =
    typeof options.keyframes === "object"
      ? options.keyframes
      : presets[options.keyframes ?? "fade-up"];
  return run(
    targets,
    keyframes,
    options,
    "cubic-bezier(0.16, 1, 0.3, 1)",
    (el) => new ViewTimeline({ subject: el, axis: "block" }),
    viewDriver(range),
    rangeCss,
  );
}

/**
 * Moves elements slower than the page while they cross the viewport.
 * Pure transform, no layout work.
 */
export function parallax(targets: Targets, options: ParallaxOptions = {}): Controller {
  const d = options.distance ?? 60;
  const range = parseRange("cover");
  return run(
    targets,
    [{ transform: `translateY(${d}px)` }, { transform: `translateY(${-d}px)` }],
    { easing: "linear", ...options },
    "linear",
    (el) => new ViewTimeline({ subject: el, axis: "block" }),
    viewDriver(range),
    "cover",
  );
}

/**
 * Links keyframes to the scroll position of the page or a container: 0 at the
 * top, 1 at the bottom.
 */
export function scrub(
  targets: Targets,
  keyframes: Keyframe[],
  options: ScrubOptions = {},
): Controller {
  const axis = options.axis ?? "block";
  return run(
    targets,
    keyframes,
    options,
    "linear",
    () => new ScrollTimeline({ source: options.source ?? document.scrollingElement, axis }),
    () => {
      const el = options.source ?? document.scrollingElement ?? document.documentElement;
      const max =
        axis === "block" ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
      const pos = axis === "block" ? el.scrollTop : Math.abs(el.scrollLeft);
      return max > 0 ? pos / max : 0;
    },
  );
}

/**
 * A reading progress bar: scales the element from 0 to 100% width as the page
 * scrolls. Kept on with reduced motion, because it moves only when the user
 * scrolls.
 */
export function progress(targets: Targets, options: ScrubOptions = {}): Controller {
  for (const el of resolve(targets)) (el as HTMLElement).style.transformOrigin ||= "0 50%";
  return scrub(targets, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
    reducedMotion: "allow",
    ...options,
  });
}
