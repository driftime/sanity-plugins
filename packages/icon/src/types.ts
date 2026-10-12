import type { SanityIconNames } from "@driftime/sanity-plugin-icon/names";

import type { iconLibraryStyles } from "@/lib/libraries";

/** Schema type name of the icon object. */
export const iconTypeName = "icon";

/**
 * Stored icon: which library it came from, its name, and the shapes it's drawn from.
 *
 * @public
 */
export interface SanityIcon {
  _type: typeof iconTypeName;
  /** Identifier of the library the icon came from. */
  library?: string;
  /** Identifier of the library style the icon came from. */
  style?: string;
  /** Name of the icon in its library. */
  name?: string;
  /** Shapes the icon is drawn from, saved when it's chosen. */
  node?: string;
}

/** Styles of each supported library, from the plugin's own list. */
type IconLibraryStyles = typeof iconLibraryStyles;

/**
 * Identifier of a library the plugin supports.
 *
 * @public
 */
export type SanityIconLibrary = keyof IconLibraryStyles;

/**
 * Styles a library offers. The project's own icon folders have one style, `default`.
 *
 * @public
 */
export type SanityIconStyle<Library extends string> = Library extends SanityIconLibrary
  ? IconLibraryStyles[Library][number]
  : "default";

/**
 * Names of a library's icons, once the build step has listed the installed version's, or any name before then.
 *
 * @public
 */
export type SanityIconName<Library extends string> = Library extends keyof SanityIconNames
  ? SanityIconNames[Library]
  : string;

/** Libraries the build step has listed, or any identifier before it has, so the project's own folders can be named. */
export type ListedLibraryId = [keyof SanityIconNames] extends [never]
  ? string & NonNullable<unknown>
  : Extract<keyof SanityIconNames, string>;

/** Libraries a field can name: the supported ones, plus the project's own folders. */
export type IconLibraryId = SanityIconLibrary | ListedLibraryId;
