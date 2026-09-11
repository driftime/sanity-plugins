import { isDefined, isRecord } from "@repo/lib/utils";
import { stegaClean } from "@sanity/client/stega";

/** Elements an icon's drawing may be built from, narrowed to those that describe a shape. */
const iconElements = ["circle", "ellipse", "g", "line", "path", "polygon", "polyline", "rect"] as const;

/** Single shape in an icon's drawing, paired with the attributes it is drawn with. */
type IconElement = [element: (typeof iconElements)[number], attributes: Record<string, string>];

/** An icon's drawing, held as the shapes it is built from rather than as a component. */
export type IconNode = IconElement[];

/**
 * Attributes given to the SVG an icon's shapes are drawn inside, mirroring the grid and stroke Lucide
 * draws on. A library working to different conventions would need its own frame, which is why a
 * stored icon carries only what sits inside this one.
 */
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
 * Checks whether a parsed value is an icon's drawing, since it arrives as whatever happened to be
 * stored. Shapes are matched against the known elements so nothing else reaches the renderer.
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
 * Reads an icon's drawing from an already-parsed value, for a library handing over its drawings as
 * data rather than as a document field.
 *
 * @param value - The value to read.
 * @returns The drawing, or undefined when the value is not one.
 */
export function parseIconNode(value: unknown) {
  return isIconNode(value) ? value : undefined;
}

/**
 * Reads an icon's drawing back from the form it is stored in, clearing the stega characters a Sanity
 * fetch leaves behind.
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
 * Writes an icon's drawing into the form it is stored in, so the shapes survive a round trip through
 * a document rather than a component reference that only resolves at build time.
 *
 * @param node - The drawing to store.
 * @returns The drawing ready to store.
 */
export function serializeIconNode(node: IconNode) {
  return JSON.stringify(node);
}
