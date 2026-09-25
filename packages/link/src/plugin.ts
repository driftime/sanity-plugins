import type { ObjectOptions, TypeAliasDefinition } from "sanity";
import { definePlugin } from "sanity";

import { pluginName } from "@/config/defaults";
import { createLinkType } from "@/schemas/types/link";
import type { SanityLinkDestination, linkTypeName } from "@/types";

declare module "@sanity/types" {
  interface IntrinsicDefinitions {
    /** Definition of a field of type `link`. */
    link: SanityLinkDefinition;
  }
}

/**
 * Options for a link field. A field's own destinations replace the plugin's.
 *
 * @public
 */
export interface SanityLinkOptions extends ObjectOptions {
  /** Destinations authors can choose from, in the order listed. Defaults to every destination. */
  destinations?: SanityLinkDestination[];
}

/**
 * Definition of a field or array member holding a link, so its options are type-checked like a built-in
 * type's.
 *
 * @public
 */
export interface SanityLinkDefinition extends Omit<TypeAliasDefinition<typeof linkTypeName, undefined>, "options"> {
  /** Options for the field. */
  options?: SanityLinkOptions;
}

/**
 * Plugin configuration. Only `documentTypes` is required.
 *
 * @public
 */
export interface SanityLinkConfig {
  /** Document types a page link can point to, in the order listed. */
  documentTypes: string[];
  /** Destinations authors can choose from, in the order listed. Defaults to every destination. */
  destinations?: SanityLinkDestination[];
  /** Where a page's title is read from, for previews and the text of page links without a label. */
  title?: SanityLinkTitleField;
}

/**
 * Where the Studio reads a page's title from.
 *
 * @public
 */
export interface SanityLinkTitleField {
  /** Field holding a page's title. Defaults to `title`. */
  field?: string;
}

/**
 * Adds a link field type to Sanity Studio that can point to a page, a section, a URL, an email address, a
 * phone number, or a file. Routing is left to the site.
 *
 * @param config - The plugin configuration.
 * @returns The plugin.
 * @public
 */
export const linkPlugin = definePlugin<SanityLinkConfig>((config) => ({
  name: pluginName,
  schema: {
    types: [createLinkType(config)],
  },
}));
