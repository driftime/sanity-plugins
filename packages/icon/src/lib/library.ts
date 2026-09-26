import { iconRegistry } from "@driftime/sanity-plugin-icon/sets";
import { convertCase, isDefined } from "@repo/lib/utils";

import type { IconDrawing } from "@/lib/nodes";
import { getIconSetKey } from "@/lib/registry";
import { parseIconSet } from "@/lib/sets";

/** Icon in the library, with the terms a search matches against. */
export interface LibraryIcon {
  /** Name of the icon in its library. */
  name: string;
  /** Readable form of the name. */
  label: string;
  /** Keywords describing the icon, as a comma-separated list. */
  tags: string;
  /** The icon's shapes and the SVG attributes they're drawn inside. */
  drawing: IconDrawing;
  /** Name and keywords, normalised for search. */
  terms: string;
}

/** Why a library's icons can't be shown, and what to do about it, with code marked by backticks. */
export interface LibraryProblem {
  /** What's wrong, in a few words. */
  title: string;
  /** What to do about it. */
  description: string;
}

/** Outcome of loading a library: its icons, or why they can't be shown. */
export type LibraryResult =
  | { icons: LibraryIcon[]; problem?: undefined }
  | { icons?: undefined; problem: LibraryProblem };

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
 * Splits text into the parts a search matches and the parts it doesn't, matching the way search does: ignoring case,
 * and treating spaces and hyphens alike.
 *
 * @param text - The text to split.
 * @param query - The normalised search.
 * @returns The parts in order, each with where it starts in the text and whether it matches.
 */
export function splitMatches(text: string, query: string) {
  if (!isDefined(query)) return [{ text, start: 0, match: false }];

  const pattern = query
    .split(" ")
    .map((word) => word.replaceAll(/[$()*+.?[\\\]^{|}]/gu, String.raw`\$&`))
    .join(String.raw`[\s-]+`);

  const parts = text.split(new RegExp(`(${pattern})`, "giu"));

  return parts.map((part, index) => ({
    text: part,
    start: parts.slice(0, index).join("").length,
    match: index % 2 === 1,
  }));
}

/**
 * Narrows the library to the named icons, in the order given. Unknown names are skipped, so a list keeps working
 * across library releases.
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
 * Lists identifiers as inline code, separated by commas.
 *
 * @param identifiers - The identifiers.
 * @returns The list.
 */
function formatList(identifiers: string[]) {
  return identifiers.map((identifier) => `\`${identifier}\``).join(", ");
}

/**
 * Describes why a library the project hasn't installed can't be shown, and what to add.
 *
 * @param label - Readable name of the library.
 * @param packageName - Package the library is read from, or an example of one for a family of packages.
 * @param family - Whether the library is a family of packages, one per style.
 * @param listed - Whether the project's `package.json` lists the package.
 * @param sitePackage - Another package of the library the project lists, or undefined when there's none.
 * @returns The problem.
 */
function describeMissingLibrary(
  label: string,
  packageName: string,
  family: boolean,
  listed: boolean,
  sitePackage: string | undefined,
): LibraryProblem {
  if (listed) {
    return {
      title: `${label} isn't installed yet`,
      description: `\`${packageName}\` is in \`package.json\` but not in \`node_modules\`. Reinstall the project's dependencies.`,
    };
  }

  if (isDefined(sitePackage)) {
    return {
      title: `${label} needs \`${packageName}\``,
      description: `The Studio reads ${label} from \`${packageName}\`, not \`${sitePackage}\`. Add it as a dev dependency.`,
    };
  }

  return {
    title: `${label} isn't installed`,
    description: family
      ? `Install a ${label} style package, such as \`${packageName}\`.`
      : `Install \`${packageName}\` in the project.`,
  };
}

/**
 * Loads one library style from the sets the build step converted.
 *
 * @param library - Identifier of the library, or undefined when none is set.
 * @param style - Identifier of the style, or undefined for the library's default.
 * @returns The icons, or why they can't be shown.
 */
async function readLibrary(library: string | undefined, style: string | undefined): Promise<LibraryResult> {
  if (!isDefined(library)) {
    return {
      problem: {
        title: "No icon library set",
        description: "Set `library` in the icon plugin's configuration or in the field's options.",
      },
    };
  }

  if (!iconRegistry.ready) {
    return {
      problem: {
        title: "Icons aren't set up",
        description: "Add `withIcons()` to the Studio's build configuration, then restart the Studio.",
      },
    };
  }

  const info = iconRegistry.libraries[library];
  if (!isDefined(info)) {
    return {
      problem: {
        title: "Unknown icon library",
        description: `There's no icon library called \`${library}\`. Use one of: ${formatList(Object.keys(iconRegistry.libraries))}.`,
      },
    };
  }

  const { label, packageName, packagePrefix, styles, listed, installed, sitePackage } = info;
  if (!installed) {
    return { problem: describeMissingLibrary(label, packageName, isDefined(packagePrefix), listed, sitePackage) };
  }

  const resolvedStyle = style ?? styles[0] ?? "";
  const loader = iconRegistry.sets[getIconSetKey(library, resolvedStyle)];
  if (!isDefined(loader)) {
    return {
      problem: isDefined(packagePrefix)
        ? {
            title: `${label} style \`${resolvedStyle}\` isn't installed`,
            description: `Install \`${packagePrefix}${resolvedStyle}\` in the project.`,
          }
        : {
            title: `Unknown ${label} style`,
            description: `${label} has no \`${resolvedStyle}\` style. Use one of: ${formatList(styles)}.`,
          },
    };
  }

  const module = await loader();
  const set = parseIconSet(module.default);
  if (!isDefined(set)) {
    return { problem: { title: `Couldn't load ${label}`, description: "Restart the Studio and try again." } };
  }

  return {
    icons: set.icons.map(({ name, keywords, node, root }) => ({
      name,
      label: convertCase(name, "title"),
      tags: keywords.join(", "),
      drawing: { root: root ?? set.root, node },
      terms: normalizeTerms([name, ...keywords].join(" ")),
    })),
  };
}

/** Library requests shared by every field in the session, keyed by library and style, since the data never changes. */
const libraryRequests = new Map<string, Promise<LibraryResult>>();

/**
 * Loads a library style, reusing a request already in progress.
 *
 * @param library - Identifier of the library, or undefined when none is set.
 * @param style - Identifier of the style, or undefined for the library's default.
 * @returns The icons, or why they can't be shown.
 */
export async function requestLibrary(library: string | undefined, style: string | undefined) {
  const key = getIconSetKey(library ?? "", style ?? "");
  let request = libraryRequests.get(key);

  if (!isDefined(request)) {
    request = readLibrary(library, style);
    libraryRequests.set(key, request);
  }

  const result = await request;

  return result;
}
