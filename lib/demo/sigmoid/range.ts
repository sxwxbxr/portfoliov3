// Vendored from Weber-Development/sigmoid (packages/core/src) until @sweberdev/sigmoid is on npm.
/** Named ranges of a CSS view timeline. */
export type RangeName = "cover" | "contain" | "entry" | "exit" | "entry-crossing" | "exit-crossing";

export interface RangeEdge {
  name: RangeName;
  /** 0 to 100. */
  offset: number;
}

export interface Range {
  start: RangeEdge;
  end: RangeEdge;
}

const NAMES = ["cover", "contain", "entry", "exit", "entry-crossing", "exit-crossing"];

/**
 * Parses a CSS `animation-range` value such as `"entry 0% cover 40%"`,
 * `"cover"` or `"entry 25%"`.
 */
export function parseRange(value: string): Range {
  const tokens = value.trim().split(/\s+/);
  const edges: RangeEdge[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const name = tokens[i] as RangeName;
    if (!NAMES.includes(name)) throw new Error(`sigmoid: unknown range "${value}"`);
    const next = tokens[i + 1];
    if (next?.endsWith("%")) {
      edges.push({ name, offset: Number.parseFloat(next) });
      i++;
    } else {
      edges.push({ name, offset: edges.length ? 100 : 0 });
    }
  }
  const [start, end] = edges;
  if (!start || edges.length > 2) throw new Error(`sigmoid: unknown range "${value}"`);
  return { start, end: end ?? { name: start.name, offset: 100 } };
}

/**
 * Where a named range starts and ends, in pixels scrolled since the subject's
 * top edge reached the bottom of the viewport. Follows the CSS
 * scroll-driven animations spec for a block-axis view timeline.
 */
export function rangeBounds(name: RangeName, subject: number, viewport: number): [number, number] {
  const small = Math.min(subject, viewport);
  const large = Math.max(subject, viewport);
  switch (name) {
    case "entry":
      return [0, small];
    case "exit":
      return [large, subject + viewport];
    case "contain":
      return [small, large];
    case "entry-crossing":
      return [0, subject];
    case "exit-crossing":
      return [viewport, subject + viewport];
    default:
      return [0, subject + viewport];
  }
}

function edgePosition(edge: RangeEdge, subject: number, viewport: number) {
  const [a, b] = rangeBounds(edge.name, subject, viewport);
  return a + ((b - a) * edge.offset) / 100;
}

/**
 * Progress (0 to 1) of a view timeline, computed the way the browser does.
 * `top` is the subject's top edge relative to the viewport top.
 */
export function viewProgress(range: Range, top: number, subject: number, viewport: number): number {
  const scrolled = viewport - top;
  const start = edgePosition(range.start, subject, viewport);
  const end = edgePosition(range.end, subject, viewport);
  if (end <= start) return scrolled >= end ? 1 : 0;
  return Math.min(Math.max((scrolled - start) / (end - start), 0), 1);
}
