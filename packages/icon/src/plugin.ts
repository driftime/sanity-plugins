import type { SanityIconNames } from "@driftime/sanity-plugin-icon/names";
import type { BaseSchemaTypeOptions, TypeAliasDefinition } from "sanity";
import { definePlugin } from "sanity";

import { pluginName } from "@/config/defaults";
import type { iconLibraryStyles } from "@/lib/libraries";
import { createIconType } from "@/schemas/types/icon";
import type { iconTypeName } from "@/types";

declare module "@sanity/types" {
  interface IntrinsicDefinitions {
    /** Definition of a field of type `icon`. */
    icon: SanityIconDefinition;
  }
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
type ListedLibraryId = [keyof SanityIconNames] extends [never]
  ? string & NonNullable<unknown>
  : Extract<keyof SanityIconNames, string>;

/** Libraries a field can name: the supported ones, plus the project's own folders. */
type IconLibraryId = SanityIconLibrary | ListedLibraryId;

/**
 * A choice of library, style, and icons, where the style and icons are checked against the library.
 *
 * @public
 */
export type SanityIconSelection = {
  [Library in IconLibraryId]: {
    /** Identifier of the icon library, such as `phosphor`. */
    library: Library;
    /** Identifier of the library style, such as `bold`. Defaults to the library's first style. */
    style?: SanityIconStyle<Library>;
    /** Icons authors can choose from, in the order listed. Defaults to every icon. */
    icons?: SanityIconName<Library>[];
  };
}[IconLibraryId];

/**
 * Options for an icon field. A field that names a library replaces the plugin's library, style, and icons, and one
 * that doesn't uses the plugin's.
 *
 * @public
 */
export type SanityIconOptions = BaseSchemaTypeOptions &
  (SanityIconSelection | { library?: undefined; style?: undefined; icons?: undefined });

/**
 * Definition of a field or array member holding an icon, so its options are type-checked like a
 * built-in type's.
 *
 * @public
 */
export interface SanityIconDefinition extends Omit<TypeAliasDefinition<typeof iconTypeName, undefined>, "options"> {
  /** Options for the field. */
  options?: SanityIconOptions;
}

/**
 * Plugin configuration, naming the library every icon field uses unless it names its own.
 *
 * @public
 */
export type SanityIconConfig = SanityIconSelection;

const plugin = definePlugin<SanityIconConfig>((config) => ({
  name: pluginName,
  schema: {
    types: [createIconType(config)],
  },
}));

/**
 * Adds an icon field type to Sanity Studio, with a searchable picker for the installed icon libraries that
 * stores the chosen icon's drawing.
 *
 * @param config - The plugin configuration.
 * @returns The plugin.
 * @public
 */
export function iconPlugin(config: SanityIconConfig) {
  return plugin(config);
}
