import { isDefined } from "@repo/lib/utils";

import { requestLibrary } from "@/lib/library";
import { serializeIconDrawing } from "@/lib/nodes";
import { iconTypeName } from "@/types";
import type { IconLibraryId, SanityIcon, SanityIconName, SanityIconStyle } from "@/types";

/**
 * An icon to look up by name, where the style and name are checked against the library.
 *
 * @public
 */
export type SanityIconLookup = {
  [Library in IconLibraryId]: {
    /** Identifier of the icon library, such as `phosphor`. */
    library: Library;
    /** Identifier of the library style, such as `bold`. Defaults to the library's first style. */
    style?: SanityIconStyle<Library>;
    /** Name of the icon in its library. */
    name: SanityIconName<Library>;
  };
}[IconLibraryId];

/**
 * Looks an icon up by name in an installed library, for an icon the site chooses rather than an author.
 *
 * @param lookup - The library, style, and name of the icon.
 * @returns The icon as the Studio stores it, or undefined when the build step hasn't run or the library, style, or
 *   name isn't installed.
 * @public
 */
export async function getIcon({ library, style, name }: SanityIconLookup): Promise<SanityIcon | undefined> {
  const { icons } = await requestLibrary(library, style);
  const icon = icons?.find((candidate) => candidate.name === name);
  if (!isDefined(icon)) return undefined;

  return {
    _type: iconTypeName,
    library,
    ...(isDefined(style) && { style }),
    name,
    node: serializeIconDrawing(icon.drawing),
  };
}
