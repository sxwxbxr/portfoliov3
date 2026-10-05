// Vendored from Weber-Development/sigmoid (packages/core/src) until @sweberdev/sigmoid is on npm.
import { type Controller, parallax, progress, reveal, supportsScrollTimeline } from "./motion";
import { type PresetName, presets } from "./presets";

/**
 * Brings `data-sigmoid` markup to browsers without native scroll timelines.
 *
 * With `sigmoid.css` loaded, modern browsers animate `data-sigmoid` elements
 * without any JavaScript, so `init()` does nothing there. Elsewhere it reads
 * the same attributes and custom properties (`--sigmoid-range`, `--sigmoid-easing`,
 * `--sigmoid-index`, `--sigmoid-stagger`) and starts
 * the JavaScript fallback. Returns a function that stops everything.
 */
export function init(root: ParentNode = document, options: { force?: boolean } = {}): () => void {
  if (typeof document === "undefined" || (supportsScrollTimeline() && !options.force)) {
    return () => {};
  }
  const controllers: Controller[] = [];
  const fallback = !!options.force;
  for (const el of Array.from(root.querySelectorAll("[data-sigmoid]"))) {
    const name = el.getAttribute("data-sigmoid") ?? "";
    const style = getComputedStyle(el);
    const range = style.getPropertyValue("--sigmoid-range").trim() || undefined;
    const easing = style.getPropertyValue("--sigmoid-easing").trim() || undefined;
    if (name === "parallax") {
      const distance = Number.parseFloat(style.getPropertyValue("--sigmoid-parallax")) || undefined;
      controllers.push(parallax(el, { distance, fallback }));
    } else if (name === "progress") {
      controllers.push(progress(el, { fallback }));
    } else if (name in presets) {
      const index = Number.parseFloat(style.getPropertyValue("--sigmoid-index")) || 0;
      const stagger = Number.parseFloat(style.getPropertyValue("--sigmoid-stagger")) || 8;
      const shift = range ? 0 : index * stagger;
      controllers.push(
        reveal(el, { keyframes: name as PresetName, range, easing, shift, fallback }),
      );
    }
  }
  return () => {
    for (const c of controllers) c.cancel();
  };
}
