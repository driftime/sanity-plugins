import { isDefined, isRecord } from "@repo/lib/utils";
import { stegaClean } from "@sanity/client/stega";

/** SVG elements a drawing may contain, limited to those that draw shapes. */
const iconElements = ["circle", "ellipse", "g", "line", "path", "polygon", "polyline", "rect"] as const;

/** One shape in a drawing, with its attributes. */
type IconElement = [element: (typeof iconElements)[number], attributes: Record<string, string>];

/** An icon's drawing, stored as a list of shapes rather than a component. */
export type IconNode = IconElement[];

/** Attributes for the SVG around an icon's shapes, matching Lucide's grid and stroke. Stored icons omit it. */
export const iconRootAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/**
 * Checks whether a parsed value is a drawing, letting only known shape elements through to the renderer.
 *
 * @param value - The value to check.
 * @returns True if the value is a drawing.
 */
function isIconNode(value: unknown): value is IconNode {
  if (!Array.isArray(value)) return false;

  return value.every(
    (element: unknown) =>
      Array.isArray(element) &&
      element.length === 2 &&
      iconElements.some((name) => name === element[0]) &&
      isRecord(element[1]),
  );
}

/**
 * Reads a drawing from an already parsed value, such as the library's own data.
 *
 * @param value - The value to read.
 * @returns The drawing, or undefined when the value isn't one.
 */
export function parseIconNode(value: unknown) {
  return isIconNode(value) ? value : undefined;
}

/**
 * Reads a drawing back from its stored form, removing stega characters first.
 *
 * @param value - The stored drawing.
 * @returns The drawing, or undefined when nothing readable was stored.
 */
export function resolveIconNode(value: string | undefined) {
  const cleaned = stegaClean(value);
  if (!isDefined(cleaned)) return undefined;

  try {
    const parsed: unknown = JSON.parse(cleaned);

    return parseIconNode(parsed);
  } catch {
    return undefined;
  }
}

/**
 * Converts a drawing to its stored form.
 *
 * @param node - The drawing.
 * @returns The drawing as a string.
 */
export function serializeIconNode(node: IconNode) {
  return JSON.stringify(node);
}
