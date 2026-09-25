import type { EditorSchema } from "@portabletext/editor";
import { isDefined } from "@repo/lib/utils";

import type { SanityUrlLink } from "@/types";
import { linkMarkTypeName } from "@/types";

/**
 * Creates the link annotation for a pasted URL, using this plugin's link type.
 *
 * @param schema - The editor's schema.
 * @param url - The pasted URL.
 * @returns The annotation, or undefined when the editor has no link annotation.
 */
export function createUrlLink(schema: EditorSchema, url: string) {
  const annotation = schema.annotations.find(({ name }) => name === linkMarkTypeName);
  if (!isDefined(annotation)) return undefined;

  return { _type: linkMarkTypeName, type: "url", url } satisfies SanityUrlLink;
}
