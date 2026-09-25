import { convertCase, isDefined } from "@repo/lib/utils";

import type { IconNode } from "@/lib/nodes";
import { parseIconNode } from "@/lib/nodes";

/** Icon in the library, with the terms a search matches against. */
export interface LibraryIcon {
  /** Name of the icon in Lucide. */
  name: string;
  /** Readable form of the name. */
  label: string;
  /** Keywords describing the icon, as a comma-separated list. */
  tags: string;
  /** Shapes the icon is drawn from. */
  node: IconNode;
  /** Name and keywords, normalised for search. */
  terms: string;
}

/**
 * Normalises text for search, so hyphenated names and multi-word keywords match the same way.
 *
 * @param value - The text.
 * @returns The normalised text.
 */
export function normalizeTerms(value: string) {
  return value
    .toLowerCase()
    .replaceAll(/[\s-]+/gu, " ")
    .trim();
}

/**
 * Narrows the library to the named icons, in the order given. Unknown names are skipped, so a list
 * keeps working across Lucide releases.
 *
 * @param library - Every icon in the library.
 * @param names - The icons to offer, or undefined for all of them.
 * @returns The icons to offer.
 */
export function selectIcons(library: LibraryIcon[], names: string[] | undefined) {
  if (!isDefined(names)) return library;

  const byName = new Map(library.map((icon) => [icon.name, icon]));

  return [...new Set(names)].flatMap((name) => {
    const icon = byName.get(name);

    return isDefined(icon) ? [icon] : [];
  });
}

/**
 * Loads the icon drawings and their keywords. Both come from the same Lucide release, so they always match.
 *
 * @returns Every icon in the library.
 */
async function readLibrary() {
  const [drawings, tags] = await Promise.all([
    import("lucide-static/icon-nodes.json"),
    import("lucide-static/tags.json"),
  ]);

  const nodes: Record<string, unknown> = drawings.default;
  const terms: Record<string, string[]> = tags.default;

  return Object.keys(nodes).flatMap((name) => {
    const node = parseIconNode(nodes[name]);
    if (!isDefined(node)) return [];

    const iconTags = terms[name] ?? [];

    return [
      {
        name,
        label: convertCase(name, "sentence"),
        tags: iconTags.join(", "),
        node,
        terms: normalizeTerms([name, ...iconTags].join(" ")),
      },
    ];
  });
}

/** Library request shared by every field in the session, since the data is about a megabyte and never changes. */
let libraryRequest: Promise<LibraryIcon[]> | undefined = undefined;

/**
 * Loads the icon library, reusing a request already in progress.
 *
 * @returns Every icon in the library.
 */
export async function requestLibrary() {
  libraryRequest ??= readLibrary();
  const library = await libraryRequest;

  return library;
}
