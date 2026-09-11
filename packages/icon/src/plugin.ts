import type iconNodes from "lucide-static/icon-nodes.json";
import type { ObjectOptions, TypeAliasDefinition } from "sanity";
import { definePlugin } from "sanity";

import { createIconType } from "@/schemas/types/icon";
import type { iconTypeName } from "@/types";

declare module "@sanity/types" {
  interface IntrinsicDefinitions {
    icon: SanityIconDefinition;
  }
}

/**
 * Names of every icon the library offers, read from the Lucide release a project resolved rather than
 * from a list this plugin ships, so an icon added since the last plugin release still completes.
 *
 * @public
 */
export type SanityIconName = keyof typeof iconNodes;

/**
 * Options an icon field takes, narrowing what its picker offers.
 *
 * @public
 */
export interface SanityIconOptions extends ObjectOptions {
  /** Icons an author may choose from, offered in the order they are named. Every icon when omitted. */
  icons?: SanityIconName[];
}

/**
 * Shape of a field or array member holding an icon, so its options are completed and checked the way
 * a built-in type's are.
 *
 * @public
 */
export interface SanityIconDefinition extends Omit<TypeAliasDefinition<typeof iconTypeName, undefined>, "options"> {
  options?: SanityIconOptions;
}

/**
 * Everything the plugin accepts, all of which may be left out.
 *
 * @public
 */
export interface SanityIconConfig {
  /** Icons an author may choose from, offered in the order they are named. Every icon when omitted. */
  icons?: SanityIconName[];
}

const plugin = definePlugin<SanityIconConfig>((config) => ({
  name: "@driftime/sanity-plugin-icon",
  schema: {
    types: [createIconType(config)],
  },
}));

/**
 * Creates the icon field type for Sanity Studio, offering the Lucide library through a searchable
 * picker and storing the chosen drawing ready to render.
 *
 * @param config - Plugin configuration.
 * @returns Sanity plugin definition.
 * @public
 */
export function iconPlugin(config: SanityIconConfig = {}) {
  return plugin(config);
}
