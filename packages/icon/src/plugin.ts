import type iconNodes from "lucide-static/icon-nodes.json";
import type { ObjectOptions, TypeAliasDefinition } from "sanity";
import { definePlugin } from "sanity";

import { createIconType } from "@/schemas/types/icon";
import type { iconTypeName } from "@/types";

declare module "@sanity/types" {
  interface IntrinsicDefinitions {
    /** Definition of a field of type `icon`. */
    icon: SanityIconDefinition;
  }
}

/**
 * Names of every Lucide icon, read from the installed Lucide release, so icons added after this plugin's
 * release still autocomplete.
 *
 * @public
 */
export type SanityIconName = keyof typeof iconNodes;

/**
 * Options for an icon field. A field's own icons replace the plugin's.
 *
 * @public
 */
export interface SanityIconOptions extends ObjectOptions {
  /** Icons authors can choose from, in the order listed. Defaults to every icon. */
  icons?: SanityIconName[];
}

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
 * Plugin configuration. Every option is optional.
 *
 * @public
 */
export interface SanityIconConfig {
  /** Icons authors can choose from, in the order listed. Defaults to every icon. */
  icons?: SanityIconName[];
}

const plugin = definePlugin<SanityIconConfig>((config) => ({
  name: "@driftime/sanity-plugin-icon",
  schema: {
    types: [createIconType(config)],
  },
}));

/**
 * Adds an icon field type to Sanity Studio, with a searchable picker for the Lucide library that stores
 * the chosen icon's drawing.
 *
 * @param config - The plugin configuration.
 * @returns The plugin.
 * @public
 */
export function iconPlugin(config: SanityIconConfig = {}) {
  return plugin(config);
}
