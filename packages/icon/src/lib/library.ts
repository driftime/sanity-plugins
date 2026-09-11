import { convertCase, isDefined } from "@repo/lib/utils";

import type { IconNode } from "@/lib/nodes";
import { parseIconNode } from "@/lib/nodes";

/** Single icon the library offers, carrying the terms a search matches it on. */
export interface LibraryIcon {
  /** Name the icon goes by in the library it came from. */
  name: string;
  /** Readable form of the name, shown beside the icon. */
  label: string;
  /** What the icon depicts, as a readable list. */
  tags: string;
  /** Shapes the icon is drawn from. */
  node: IconNode;
  /** Name and tags flattened into the form a search compares against. */
  terms: string;
}

/**
 * Flattens text into the form a search compares against, so a hyphenated icon name and a multi-word
 * tag are matched the same way.
 *
 * @param value - The text to flatten.
 * @returns The text in comparable form.
 */
export function normalizeTerms(value: string) {
  return value
    .toLowerCase()
    .replaceAll(/[\s-]+/gu, " ")
    .trim();
}

/**
 * Narrows the library to a chosen set of icons, in the order they were named. A name the library does
 * not recognise is skipped, so a set outlives the release it was written against.
 *
 * @param library - Every icon the library offers.
 * @param names - Names of the icons to offer, or nothing to offer them all.
 * @returns The icons on offer.
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
 * Reads the icon library, pairing each drawing with the terms it can be found by. Both files come
 * from the same release as the icons themselves, so the drawings and their terms never disagree.
 *
 * @returns Every icon the library offers.
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

/**
 * The library once asked for, held so every field in a Studio session shares the one request. It is a
 * megabyte of data that never changes within a release, so asking twice only ever costs.
 */
let libraryRequest: Promise<LibraryIcon[]> | undefined = undefined;

/**
 * Reads the icon library, waiting on whatever request is already under way.
 *
 * @returns Every icon the library offers.
 */
export async function requestLibrary() {
  libraryRequest ??= readLibrary();
  const library = await libraryRequest;

  return library;
}
