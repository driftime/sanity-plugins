import { createHash } from "node:crypto";

import { isDefined } from "@repo/lib/utils";
import type { XastChild, XastElement, XastRoot } from "svgo";
import { optimize } from "svgo";

import type { IconDrawing, IconElement, IconRoot } from "@/lib/nodes";
import { findDrawingProblem } from "@/lib/nodes";
import type { IconSetIcon } from "@/lib/sets";

/** An icon as read from a library, before conversion. */
export interface SourceIcon {
  /** Name of the icon in its library. */
  name: string;
  /** Words describing the icon, from its library. */
  keywords: string[];
  /** The icon's SVG markup. */
  svg: string;
}

/** An icon after conversion, with its own root, or why it couldn't be converted. */
export type ConvertedIcon =
  | { icon: IconSetIcon & { root: IconRoot }; problem?: undefined }
  | { icon?: undefined; problem: string };

/** Attributes of the outer SVG that size or label it rather than draw it, since the renderer sets its own. */
const rootOnlyAttributes = new Set(["class", "focusable", "height", "role", "version", "width"]);

/**
 * Converts an SVG attribute name to its React form, such as `stroke-width` to `strokeWidth` and `xlink:href` to
 * `xlinkHref`.
 *
 * @param name - The attribute name.
 * @returns The React name.
 */
export function toReactName(name: string) {
  return name.replaceAll(/[-:](?<character>[a-z])/gu, (_match, character: string) => character.toUpperCase());
}

/**
 * Converts attributes to React naming, leaving out namespaces, classes, and data and accessibility attributes, which
 * don't draw anything.
 *
 * @param attributes - The attributes.
 * @param omitted - Further attributes to leave out.
 * @returns The converted attributes.
 */
function readAttributes(attributes: Record<string, string>, omitted: ReadonlySet<string> = new Set(["class"])) {
  return Object.fromEntries(
    Object.entries(attributes).flatMap(([name, value]) =>
      /^(?:xmlns|data-|aria-)/u.test(name) || omitted.has(name) ? [] : [[toReactName(name), value]],
    ),
  );
}

/**
 * Closes a `url(` left open at the end of each attribute value, which is how browsers read it.
 *
 * @param element - The element whose attributes to close.
 */
function closeOpenUrls(element: XastElement) {
  for (const [name, value] of Object.entries(element.attributes)) {
    if (/url\([^)]*$/u.test(value)) element.attributes[name] = `${value})`;
  }
}

/**
 * Converts SVGO's parsed children into stored elements, keeping text and dropping comments.
 *
 * @param children - The parsed children.
 * @returns The elements and text.
 */
function readChildren(children: XastChild[]) {
  return children.flatMap((child): (IconElement | string)[] => {
    if (child.type === "text") return isDefined(child.value.trim()) ? [child.value] : [];
    if (child.type !== "element") return [];

    const nested = readChildren(child.children);
    const attributes = readAttributes(child.attributes);

    return [isDefined(nested) ? [child.name, attributes, nested] : [child.name, attributes]];
  });
}

/**
 * Reads SVGO's parsed document into a drawing, from its outer `svg` element.
 *
 * @param tree - The parsed document.
 * @returns The drawing, or undefined when the document has no `svg` element.
 */
function readSvgElement(tree: XastRoot) {
  const element = tree.children.find((child): child is XastElement => child.type === "element" && child.name === "svg");
  if (!isDefined(element)) return undefined;

  // A size like `24px` means 24 units, the way browsers read it.
  const width = element.attributes["width"]?.replace(/px$/u, "") ?? "24";
  const height = element.attributes["height"]?.replace(/px$/u, "") ?? width;
  const attributes = readAttributes(element.attributes, rootOnlyAttributes);

  return {
    root: { ...attributes, viewBox: attributes["viewBox"] ?? `0 0 ${width} ${height}` },
    node: readChildren(element.children).filter((child): child is IconElement => typeof child !== "string"),
  };
}

/**
 * Cleans and minifies an icon with SVGO, then reads the result into a drawing. Paths, numbers, and transforms are kept
 * exactly as drawn, since rounding or merging them changes how some icons look, and every identifier gets a prefix
 * unique to the icon, so two icons on one page can't clash.
 *
 * @param svg - The icon's SVG markup.
 * @returns The drawing, or undefined when the markup has no SVG.
 * @throws When the markup can't be parsed.
 */
function readDrawing(svg: string) {
  const result: { drawing?: IconDrawing } = {};

  // Browsers accept `xlink:` attributes without the namespace declaration, which React leaves out, but SVGO doesn't.
  const declared =
    svg.includes("xlink:") && !svg.includes("xmlns:xlink")
      ? svg.replace("<svg", '<svg xmlns:xlink="http://www.w3.org/1999/xlink"')
      : svg;

  optimize(declared, {
    multipass: true,
    plugins: [
      { name: "closeOpenUrls", fn: () => ({ element: { enter: closeOpenUrls } }) },
      {
        name: "preset-default",
        params: {
          overrides: {
            cleanupNumericValues: false,
            convertPathData: false,
            convertTransform: false,
            inlineStyles: { onlyMatchedOnce: false },
            mergePaths: false,
          },
        },
      },
      "removeScripts",
      "removeTitle",
      { name: "prefixIds", params: { prefix: `i${createHash("sha256").update(svg).digest("hex").slice(0, 8)}` } },
      {
        name: "read",
        fn: () => ({
          root: {
            enter(tree) {
              result.drawing = readSvgElement(tree);
            },
          },
        }),
      },
    ],
  });

  return result.drawing;
}

/**
 * Reads an icon's markup into a drawing, or says why it can't be read.
 *
 * @param svg - The icon's SVG markup.
 * @returns The drawing, or why there isn't one.
 */
function parseDrawing(svg: string) {
  try {
    return readDrawing(svg) ?? "has no SVG";
  } catch {
    return "isn't valid SVG";
  }
}

/**
 * Converts one icon into a stored drawing, the same way whichever library it came from.
 *
 * @param source - The icon as read from its library.
 * @returns The converted icon, or why it couldn't be converted.
 */
export function convertIcon(source: SourceIcon): ConvertedIcon {
  const drawing = parseDrawing(source.svg);
  if (typeof drawing === "string") return { problem: drawing };

  const problem = findDrawingProblem(drawing);
  if (isDefined(problem)) return { problem };

  const nameWords = new Set(source.name.split("-"));
  const keywords = [...new Set(source.keywords.map((keyword) => keyword.trim().toLowerCase()))].filter(
    (keyword) => isDefined(keyword) && !nameWords.has(keyword),
  );

  return { icon: { name: source.name, keywords, node: drawing.node, root: drawing.root } };
}
