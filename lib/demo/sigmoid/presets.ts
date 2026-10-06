// Vendored from Weber-Development/sigmoid (packages/core/src) until @sweberdev/sigmoid is on npm.
/**
 * Entrance keyframes. Each one animates from a hidden state to the element's
 * own style, so nothing changes when animations are off. The same names are
 * used for `data-sigmoid` in sigmoid.css.
 */
export const presets = {
  "fade-in": [{ opacity: 0 }, {}],
  "fade-up": [{ opacity: 0, transform: "translateY(var(--sigmoid-distance, 24px))" }, {}],
  "fade-down": [
    { opacity: 0, transform: "translateY(calc(-1 * var(--sigmoid-distance, 24px)))" },
    {},
  ],
  "slide-left": [{ opacity: 0, transform: "translateX(var(--sigmoid-distance, 24px))" }, {}],
  "slide-right": [
    { opacity: 0, transform: "translateX(calc(-1 * var(--sigmoid-distance, 24px)))" },
    {},
  ],
  "scale-in": [{ opacity: 0, transform: "scale(0.94)" }, {}],
  "blur-in": [{ opacity: 0, filter: "blur(8px)" }, {}],
  "clip-up": [{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
  "rotate-in": [{ opacity: 0, transform: "rotate(-4deg) scale(0.96)" }, {}],
  "flip-up": [{ opacity: 0, transform: "perspective(800px) rotateX(24deg)" }, {}],
} satisfies Record<string, Keyframe[]>;

export type PresetName = keyof typeof presets;
