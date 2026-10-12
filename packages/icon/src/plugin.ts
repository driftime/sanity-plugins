import type { BaseSchemaTypeOptions, InitialValueProperty, TypeAliasDefinition } from "sanity";
import { definePlugin } from "sanity";

import { pluginName } from "@/config/defaults";
import { createIconType } from "@/schemas/types/icon";
import type { IconLibraryId, ListedLibraryId, SanityIconName, SanityIconStyle, iconTypeName } from "@/types";

declare module "@sanity/types" {
  interface IntrinsicDefinitions {
    /** Definition of a field of type `icon`. */
    icon: SanityIconDefinition;
  }
}

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
 * Icon a field starts with. The Studio saves its drawing from the field's library the first time the field is shown.
 *
 * @public
 */
export interface SanityIconInitialValue {
  /** Name of the icon, from any library the build step has listed. */
  name: SanityIconName<ListedLibraryId>;
}

/**
 * Definition of a field or array member holding an icon, so its options and initial value are type-checked like a
 * built-in type's.
 *
 * @public
 */
export interface SanityIconDefinition extends Omit<
  TypeAliasDefinition<typeof iconTypeName, undefined>,
  "options" | "initialValue"
> {
  /** Options for the field. */
  options?: SanityIconOptions;
  /** Icon the field starts with, or a function that returns one. */
  initialValue?: InitialValueProperty<unknown, SanityIconInitialValue>;
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
