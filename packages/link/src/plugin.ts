import type { ObjectOptions, TypeAliasDefinition } from "sanity";
import { definePlugin } from "sanity";

import { pluginName } from "@/config/defaults";
import { createLinkType } from "@/schemas/types/link";
import type { SanityLinkDestination, linkTypeName } from "@/types";

declare module "@sanity/types" {
  interface IntrinsicDefinitions {
    link: SanityLinkDefinition;
  }
}

/**
 * Options a link field takes. The list says what is on and replaces whatever the plugin was given,
 * so one line tells you the whole answer.
 *
 * @public
 */
export interface SanityLinkOptions extends ObjectOptions {
  /** Destinations an author may choose from, offered in the order they are named. All when omitted. */
  destinations?: SanityLinkDestination[];
}

/**
 * Shape of a field or array member holding a link, so its options are completed and checked the way
 * a built-in type's are.
 *
 * @public
 */
export interface SanityLinkDefinition extends Omit<TypeAliasDefinition<typeof linkTypeName, undefined>, "options"> {
  options?: SanityLinkOptions;
}

/**
 * Everything the plugin accepts, of which only the document types are required.
 *
 * @public
 */
export interface SanityLinkConfig {
  /** Document types an internal link may point at, offered in the order they are named. */
  documentTypes: string[];
  /** Destinations an author may choose from, offered in the order they are named. All when omitted. */
  destinations?: SanityLinkDestination[];
  /** Where a page's title is read from, for previews and for the label an internal link borrows. */
  title?: SanityLinkTitleField;
}

/**
 * Where the Studio reads a page's title from.
 *
 * @public
 */
export interface SanityLinkTitleField {
  /** Field a page holds its title in. Reads `title` when omitted. */
  field?: string;
}

/**
 * Creates the link field type for Sanity Studio, offering a page, a section of it, an address, an
 * email, a phone number, or a file behind one control, and resolving nothing about routing itself.
 *
 * @param config - Plugin configuration.
 * @returns Sanity plugin definition.
 * @public
 */
export const linkPlugin = definePlugin<SanityLinkConfig>((config) => ({
  name: pluginName,
  schema: {
    types: [createLinkType(config)],
  },
}));
