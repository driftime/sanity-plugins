import { isDefined, isRecord } from "@repo/lib/utils";
import { stegaClean } from "@sanity/client/stega";

/** One element in a drawing: its name, its attributes, and any children, which may include text. */
export type IconElement = [element: string, attributes: Record<string, string>, children?: (IconElement | string)[]];

/** An icon's drawing, stored as a tree of elements rather than a component. */
export type IconNode = IconElement[];

/** Attributes for the SVG around a drawing's elements. */
export type IconRoot = Record<string, string>;

/** An icon's elements together with the SVG attributes they're drawn inside. */
export interface IconDrawing {
  /** Attributes for the SVG around the elements. */
  root: IconRoot;
  /** Elements the icon is drawn from. */
  node: IconNode;
}

/**
 * SVG elements a drawing may contain: everything that draws, paints, clips, masks, or filters. Anything that runs
 * code, embeds other content, links away, loads a file, animates, or styles the page around it is left out.
 */
const iconElements: ReadonlySet<string> = new Set([
  "circle",
  "clipPath",
  "defs",
  "ellipse",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "filter",
  "g",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "stop",
  "symbol",
  "text",
  "textPath",
  "tspan",
  "use",
]);

/** Attributes that point at another element by URL, which must point inside the drawing. */
const linkAttributes = new Set(["href", "xlinkHref"]);

/** A reference to another element in an attribute value, such as `url(#fade)`. */
const urlPattern = /url\((?<reference>[^)]*)\)/gu;

/** Attributes every drawing's SVG carries, whichever library it came from. */
export const iconSvgAttributes = { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24 } as const;

/**
 * Checks whether a value is a set of attributes, each with a text value.
 *
 * @param value - The value to check.
 * @returns True if the value is a set of attributes.
 */
function isAttributes(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((attribute) => typeof attribute === "string");
}

/**
 * Checks whether a value is an element in a drawing, with text attributes and valid children.
 *
 * @param value - The value to check.
 * @returns True if the value is an element.
 */
function isIconElement(value: unknown): value is IconElement {
  if (!Array.isArray(value) || value.length < 2 || value.length > 3) return false;

  const parts: unknown[] = value;
  const [name, attributes, children] = parts;
  if (typeof name !== "string" || !isAttributes(attributes)) return false;

  return (
    !isDefined(children) ||
    (Array.isArray(children) && children.every((child) => typeof child === "string" || isIconElement(child)))
  );
}

/**
 * Finds why an element's attributes can't be drawn safely.
 *
 * @param attributes - The attributes.
 * @returns The problem, or undefined when the attributes are safe.
 */
function findAttributeProblem(attributes: Record<string, string>) {
  for (const [name, value] of Object.entries(attributes)) {
    if (/^on/iu.test(name)) return `has an event handler (\`${name}\`)`;
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/u.test(name)) return `has an unknown attribute (\`${name}\`)`;
    if (/javascript:/iu.test(value)) return "runs a script";

    if (linkAttributes.has(name) && !value.startsWith("#")) return "links outside the icon";

    if (value.includes("url(")) {
      const references = [...value.matchAll(urlPattern)];
      const outside = references.some(
        ({ groups }) => !(groups?.["reference"]?.trim().replace(/^["']/u, "").startsWith("#") ?? false),
      );

      if (outside || value.split("url(").length - 1 !== references.length) {
        return "refers to something outside the icon";
      }
    }
  }

  return undefined;
}

/**
 * Finds why part of a drawing can't be drawn safely.
 *
 * @param node - The elements to check.
 * @returns The problem, or undefined when every element is safe.
 */
function findNodeProblem(node: (IconElement | string)[]): string | undefined {
  for (const child of node) {
    if (typeof child === "string") continue;

    const [name, attributes, children] = child;
    if (!iconElements.has(name)) return `uses the \`<${name}>\` element`;

    const problem = findAttributeProblem(attributes) ?? (isDefined(children) ? findNodeProblem(children) : undefined);
    if (isDefined(problem)) return problem;
  }

  return undefined;
}

/**
 * Finds why a drawing can't be drawn safely: an element or attribute that could run code, load something, or reach
 * outside the icon. The same check guards the build step's output and every stored value before it's drawn.
 *
 * @param drawing - The drawing to check.
 * @returns The problem, or undefined when the drawing is safe.
 */
export function findDrawingProblem({ root, node }: IconDrawing) {
  if (!isDefined(node)) return "draws nothing";

  return findAttributeProblem(root) ?? findNodeProblem(node);
}

/**
 * Reads a drawing's elements from an already parsed value, such as a converted set.
 *
 * @param value - The value to read.
 * @returns The elements, or undefined when the value isn't a list of them.
 */
export function parseIconNode(value: unknown) {
  return Array.isArray(value) && value.every((element) => isIconElement(element)) ? value : undefined;
}

/**
 * Reads an SVG root from an already parsed value.
 *
 * @param value - The value to read.
 * @returns The root, or undefined when the value isn't one.
 */
export function parseIconRoot(value: unknown) {
  return isAttributes(value) ? value : undefined;
}

/**
 * Parses stored JSON.
 *
 * @param value - The stored text.
 * @returns The parsed value, or undefined when the text isn't JSON.
 */
function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

/**
 * Reads a drawing back from its stored form, removing stega characters first.
 *
 * @param value - The stored drawing.
 * @returns The drawing, or undefined when nothing readable and safe was stored.
 */
export function resolveIconDrawing(value: string | undefined): IconDrawing | undefined {
  const cleaned = stegaClean(value);
  if (!isDefined(cleaned)) return undefined;

  const stored = parseJson(cleaned);
  if (!isRecord(stored)) return undefined;

  const root = parseIconRoot(stored["root"]);
  const node = parseIconNode(stored["node"]);
  if (!isDefined(root) || !isDefined(node)) return undefined;

  const drawing = { root, node };

  return isDefined(findDrawingProblem(drawing)) ? undefined : drawing;
}

/**
 * Converts a drawing to its stored form.
 *
 * @param drawing - The drawing.
 * @returns The drawing as a string.
 */
export function serializeIconDrawing(drawing: IconDrawing) {
  return JSON.stringify({ root: drawing.root, node: drawing.node });
}
