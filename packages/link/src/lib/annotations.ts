import type { EditorSchema } from "@portabletext/editor";
import { isDefined } from "@repo/lib/utils";

import type { SanityUrlLink } from "@/types";
import { linkMarkTypeName } from "@/types";

/**
 * Builds the annotation a pasted address becomes, so an address arriving as markup lands on the link
 * type this plugin registers.
 *
 * @param schema - Schema of the editor the paste landed in.
 * @param url - Address the pasted link points at.
 * @returns The annotation to apply, or undefined when the editor offers no link annotation.
 */
export function createUrlLink(schema: EditorSchema, url: string) {
  const annotation = schema.annotations.find(({ name }) => name === linkMarkTypeName);
  if (!isDefined(annotation)) return undefined;

  return { _type: linkMarkTypeName, type: "url", url } satisfies SanityUrlLink;
}
