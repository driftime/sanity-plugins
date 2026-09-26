import { isDefined, isRecord } from "@repo/lib/utils";

import type { IconNode, IconRoot } from "@/lib/nodes";
import { parseIconNode, parseIconRoot } from "@/lib/nodes";

/** One icon in a converted set. */
export interface IconSetIcon {
  /** Name of the icon in its library. */
  name: string;
  /** Words describing the icon, from its library. */
  keywords: string[];
  /** Shapes the icon is drawn from. */
  node: IconNode;
  /** Root for this icon, or undefined when it uses the set's. */
  root?: IconRoot;
}

/** Icons of one library style, converted by the build step into the stored drawing format. */
export interface IconSet {
  /** Identifier of the library, such as `lucide`. */
  library: string;
  /** Identifier of the style, such as `bold`. */
  style: string;
  /** Root most icons in the set share. */
  root: IconRoot;
  /** Every icon in the set. */
  icons: IconSetIcon[];
}

/**
 * A library the build step knows how to convert, and whether the project has it installed.
 *
 * @public
 */
export interface IconLibraryInfo {
  /** Readable name of the library. */
  label: string;
  /** Package the library is read from, or an example of one for a family of packages. */
  packageName: string;
  /** Shared start of the package names of a family of packages, one per style, or undefined for a single package. */
  packagePrefix?: string;
  /** Styles the library offers, the first being the default. */
  styles: string[];
  /** Whether the project's `package.json` lists the package, installed or not. */
  listed: boolean;
  /** Whether the project has the package installed. */
  installed: boolean;
  /** Another package of the library the project lists, such as its React version, or undefined when there's none. */
  sitePackage?: string;
}

/**
 * Reads one icon of a converted set, skipping it when its data isn't usable.
 *
 * @param value - The value to read.
 * @returns The icon, or undefined when the value isn't one.
 */
function parseIconSetIcon(value: unknown): IconSetIcon | undefined {
  if (!isRecord(value)) return undefined;

  const { name, keywords, node, root } = value;
  const parsedNode = parseIconNode(node);
  const parsedRoot = isDefined(root) ? parseIconRoot(root) : undefined;

  if (typeof name !== "string" || !Array.isArray(keywords) || !isDefined(parsedNode)) return undefined;
  if (isDefined(root) && !isDefined(parsedRoot)) return undefined;

  return {
    name,
    keywords: keywords.filter((keyword: unknown) => typeof keyword === "string"),
    node: parsedNode,
    ...(isDefined(parsedRoot) && { root: parsedRoot }),
  };
}

/**
 * Reads a converted set, keeping only the icons whose data is usable.
 *
 * @param value - The value to read.
 * @returns The set, or undefined when the value isn't one.
 */
export function parseIconSet(value: unknown): IconSet | undefined {
  if (!isRecord(value)) return undefined;

  const { library, style, root, icons } = value;
  const parsedRoot = parseIconRoot(root);

  if (typeof library !== "string" || typeof style !== "string" || !isDefined(parsedRoot) || !Array.isArray(icons)) {
    return undefined;
  }

  return {
    library,
    style,
    root: parsedRoot,
    icons: icons.flatMap((icon: unknown) => {
      const parsed = parseIconSetIcon(icon);

      return isDefined(parsed) ? [parsed] : [];
    }),
  };
}
